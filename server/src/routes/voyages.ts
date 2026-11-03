// filepath: server/src/routes/voyages.ts
// Site Voyage: lecture publique des carnets publies, et administration
// (voyages, aeroports, traces GPX, photos) reservee a VOYAGE_ADMIN_EMAILS.
import type { FastifyInstance, FastifyReply } from "fastify";
import * as voyages from "../db/queries/voyages.js";
import {
  sendCreated,
  sendInternalError,
  sendNoContent,
  sendNotFound,
  sendOk,
  sendValidationError,
} from "../lib/api-response.js";
import {
  GPX_MAX_BYTES,
  PHOTO_MAX_BYTES,
  VoyageFileError,
  assertMealPhotosStored,
  contentTypeOf,
  deleteStoredFiles,
  openStoredFile,
  storeGpx,
  storePhoto,
} from "../lib/voyage-files.js";
import { readPhotoGps } from "../lib/photo-gps.js";
import { RoadRouteError, fetchRoadRoute } from "../lib/road-route.js";
import {
  GooglePhotosError,
  deletePickerSession,
  downloadPickedPhoto,
  googlePhotosClientId,
  listPickedPhotos,
} from "../lib/google-photos.js";
import { authenticateVoyageAdmin } from "../plugins/auth.js";
import { GeocodingError, geocodeAddress } from "../services/geocoding.js";
import { idParamSchema } from "../schemas/index.js";
import {
  airportInputSchema,
  fileNameParamSchema,
  geocodeQuerySchema,
  googlePhotosImportSchema,
  googlePhotosSessionSchema,
  albumInputSchema,
  albumUpdateSchema,
  photoUpdateSchema,
  photoUploadQuerySchema,
  roadRouteInputSchema,
  slugParamSchema,
  trackUploadQuerySchema,
  tripInputSchema,
  type TripInput,
} from "../schemas/voyages.js";

const TRIP_NOT_FOUND = "Voyage introuvable";
// Un voyage complet (jusqu'a 60 etapes et leurs traces reconstituees) peut
// depasser la limite JSON par defaut de Fastify (1 Mo).
const TRIP_BODY_LIMIT = 8 * 1024 * 1024;

// Nominatim tolere un faible debit: l'admin cherche une adresse a la fois.
const geocodeRateLimit = { max: 20, timeWindow: "1 minute" };

const writeRateLimit = {
  max: Number(process.env.VOYAGE_WRITE_RATE_LIMIT_MAX ?? 60),
  timeWindow: "1 minute",
};

const mealPhotoNames = (input: TripInput) =>
  input.stages.flatMap((stage) =>
    stage.meals.flatMap((meal) => (meal.photo ? [meal.photo] : [])),
  );

function handleError(
  fastify: FastifyInstance,
  reply: FastifyReply,
  error: unknown,
) {
  if (error instanceof Error && error.name === "ZodError") {
    return sendValidationError(
      reply,
      (error as unknown as { issues: unknown }).issues,
    );
  }
  if (error instanceof voyages.TripConflictError) {
    const status = error.code === "TRIP_SLUG_TAKEN" ? 409 : 400;
    return reply.code(status).send({ error: error.message, code: error.code });
  }
  if (error instanceof GeocodingError) {
    fastify.log.warn(error.message);
    return reply.code(502).send({
      error:
        "Recherche d'adresse indisponible pour le moment. Saisissez la longitude et la latitude.",
      code: "GEOCODING_UNAVAILABLE",
    });
  }
  if (error instanceof GooglePhotosError) {
    return reply
      .code(error.status)
      .send({ error: error.message, code: error.code });
  }
  if (error instanceof VoyageFileError) {
    return reply.code(400).send({ error: error.message, code: error.code });
  }
  fastify.log.error(error);
  return sendInternalError(reply);
}

export async function voyagesRoutes(fastify: FastifyInstance) {
  // GET /api/voyages - catalogue public du globe (voyages publies)
  fastify.get(
    "/",
    { schema: { tags: ["voyages"], summary: "List published trips" } },
    async (_request, reply) => {
      try {
        return sendOk(reply, await voyages.listPublishedTrips());
      } catch (error) {
        return handleError(fastify, reply, error);
      }
    },
  );

  // GET /api/voyages/files/:fileName - trace GPX ou photo d'un voyage publie
  fastify.get(
    "/files/:fileName",
    { schema: { tags: ["voyages"], summary: "Get a trip file" } },
    async (request, reply) => {
      try {
        const { fileName } = fileNameParamSchema.parse(request.params);
        const file = (await voyages.isPublishedFile(fileName))
          ? await openStoredFile(fileName)
          : null;
        if (!file) {
          return sendNotFound(
            reply,
            "Fichier introuvable",
            "TRIP_FILE_NOT_FOUND",
          );
        }
        // Noms uniques et jamais reutilises: le navigateur peut tout garder.
        return reply
          .header("Content-Type", contentTypeOf(fileName))
          .header("Content-Length", file.size)
          .header("Cache-Control", "public, max-age=31536000, immutable")
          .header("X-Content-Type-Options", "nosniff")
          .send(file.stream);
      } catch (error) {
        return handleError(fastify, reply, error);
      }
    },
  );

  fastify.register(voyagesAdminRoutes, { prefix: "/admin" });

  // GET /api/voyages/:slug - carnet public complet
  fastify.get(
    "/:slug",
    { schema: { tags: ["voyages"], summary: "Get a published trip" } },
    async (request, reply) => {
      try {
        const { slug } = slugParamSchema.parse(request.params);
        const trip = await voyages.getPublishedTrip(slug);
        return trip
          ? sendOk(reply, trip)
          : sendNotFound(reply, TRIP_NOT_FOUND, "TRIP_NOT_FOUND");
      } catch (error) {
        return handleError(fastify, reply, error);
      }
    },
  );
}

async function voyagesAdminRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticateVoyageAdmin);

  // Envois en corps brut: le fichier tel quel, ses metadonnees en query.
  // Le format reel est verifie au contenu dans voyage-files.ts.
  fastify.addContentTypeParser(
    [
      "application/gpx+xml",
      "application/xml",
      "text/xml",
      "application/octet-stream",
      "image/jpeg",
      "image/png",
      "image/webp",
    ],
    { parseAs: "buffer", bodyLimit: PHOTO_MAX_BYTES },
    (_request, body, done) => done(null, body),
  );

  const admin = { security: [{ bearerAuth: [] }], tags: ["voyages-admin"] };

  fastify.get(
    "/trips",
    { schema: { ...admin, summary: "List all trips" } },
    async (_request, reply) => {
      try {
        return sendOk(reply, await voyages.listAllTrips());
      } catch (error) {
        return handleError(fastify, reply, error);
      }
    },
  );

  fastify.get(
    "/trips/:id",
    { schema: { ...admin, summary: "Get a trip" } },
    async (request, reply) => {
      try {
        const { id } = idParamSchema.parse(request.params);
        const trip = await voyages.getTripById(id);
        return trip
          ? sendOk(reply, trip)
          : sendNotFound(reply, TRIP_NOT_FOUND, "TRIP_NOT_FOUND");
      } catch (error) {
        return handleError(fastify, reply, error);
      }
    },
  );

  fastify.post(
    "/trips",
    {
      bodyLimit: TRIP_BODY_LIMIT,
      config: { rateLimit: writeRateLimit },
      schema: { ...admin, summary: "Create a trip" },
    },
    async (request, reply) => {
      try {
        const input = tripInputSchema.parse(request.body);
        await assertMealPhotosStored(mealPhotoNames(input));
        return sendCreated(
          reply,
          await voyages.createTrip(request.user.id, input),
        );
      } catch (error) {
        return handleError(fastify, reply, error);
      }
    },
  );

  fastify.put(
    "/trips/:id",
    {
      bodyLimit: TRIP_BODY_LIMIT,
      config: { rateLimit: writeRateLimit },
      schema: { ...admin, summary: "Update a trip" },
    },
    async (request, reply) => {
      try {
        const { id } = idParamSchema.parse(request.params);
        const input = tripInputSchema.parse(request.body);
        await assertMealPhotosStored(mealPhotoNames(input));
        const result = await voyages.updateTrip(id, input);
        if (!result) {
          return sendNotFound(reply, TRIP_NOT_FOUND, "TRIP_NOT_FOUND");
        }
        await deleteStoredFiles(result.removedFiles);
        return sendOk(reply, result.trip);
      } catch (error) {
        return handleError(fastify, reply, error);
      }
    },
  );

  fastify.delete(
    "/trips/:id",
    {
      config: { rateLimit: writeRateLimit },
      schema: { ...admin, summary: "Delete a trip" },
    },
    async (request, reply) => {
      try {
        const { id } = idParamSchema.parse(request.params);
        const removedFiles = await voyages.deleteTrip(id);
        if (!removedFiles) {
          return sendNotFound(reply, TRIP_NOT_FOUND, "TRIP_NOT_FOUND");
        }
        await deleteStoredFiles(removedFiles);
        return sendNoContent(reply);
      } catch (error) {
        return handleError(fastify, reply, error);
      }
    },
  );

  fastify.get(
    "/airports",
    { schema: { ...admin, summary: "List airports" } },
    async (_request, reply) => {
      try {
        return sendOk(reply, await voyages.listAirports());
      } catch (error) {
        return handleError(fastify, reply, error);
      }
    },
  );

  fastify.put(
    "/airports",
    {
      config: { rateLimit: writeRateLimit },
      schema: { ...admin, summary: "Create or update an airport" },
    },
    async (request, reply) => {
      try {
        return sendOk(
          reply,
          await voyages.upsertAirport(airportInputSchema.parse(request.body)),
        );
      } catch (error) {
        return handleError(fastify, reply, error);
      }
    },
  );

  // Calcul ponctuel depuis l'admin; le trace renvoye est enregistre avec
  // l'etape par l'enregistrement du voyage.
  fastify.post(
    "/road-route",
    {
      config: { rateLimit: writeRateLimit },
      schema: {
        ...admin,
        summary: "Compute the road route between two stages",
      },
    },
    async (request, reply) => {
      try {
        const { from, to } = roadRouteInputSchema.parse(request.body);
        return sendOk(reply, await fetchRoadRoute(from, to));
      } catch (error) {
        if (error instanceof RoadRouteError) {
          const status = error.code === "ROUTE_NOT_FOUND" ? 422 : 502;
          return reply
            .code(status)
            .send({ error: error.message, code: error.code });
        }
        return handleError(fastify, reply, error);
      }
    },
  );

  // GET /api/voyages/admin/geocode?q=adresse - adresse vers coordonnees
  fastify.get(
    "/geocode",
    {
      config: { rateLimit: geocodeRateLimit },
      schema: { ...admin, summary: "Geocode an address" },
    },
    async (request, reply) => {
      try {
        const { q } = geocodeQuerySchema.parse(request.query);
        return sendOk(reply, await geocodeAddress(q));
      } catch (error) {
        return handleError(fastify, reply, error);
      }
    },
  );

  fastify.post(
    "/stages/:id/tracks",
    {
      config: { rateLimit: writeRateLimit },
      schema: { ...admin, summary: "Upload a GPX track" },
    },
    async (request, reply) => {
      try {
        const { id } = idParamSchema.parse(request.params);
        const query = trackUploadQuerySchema.parse(request.query);
        const body = request.body;
        if (!Buffer.isBuffer(body)) {
          return reply.code(415).send({
            error:
              "Envoyez le fichier GPX brut (Content-Type application/gpx+xml)",
            code: "UPLOAD_TYPE_NOT_ALLOWED",
          });
        }
        if (body.length > GPX_MAX_BYTES) {
          return reply.code(413).send({
            error: "GPX trop volumineux (10 Mo max)",
            code: "UPLOAD_TOO_LARGE",
          });
        }
        if (!(await voyages.stageExists(id))) {
          return sendNotFound(reply, "Etape introuvable", "STAGE_NOT_FOUND");
        }
        const stored = await storeGpx(body);
        return sendCreated(
          reply,
          await voyages.addTrack(id, { ...stored, ...query }),
        );
      } catch (error) {
        return handleError(fastify, reply, error);
      }
    },
  );

  fastify.post(
    "/stages/:id/photos",
    {
      config: { rateLimit: writeRateLimit },
      schema: { ...admin, summary: "Upload a photo" },
    },
    async (request, reply) => {
      try {
        const { id } = idParamSchema.parse(request.params);
        const query = photoUploadQuerySchema.parse(request.query);
        const body = request.body;
        if (!Buffer.isBuffer(body)) {
          return reply.code(415).send({
            error: "Envoyez l'image brute (JPEG, PNG ou WebP)",
            code: "UPLOAD_TYPE_NOT_ALLOWED",
          });
        }
        if (!(await voyages.stageExists(id))) {
          return sendNotFound(reply, "Etape introuvable", "STAGE_NOT_FOUND");
        }
        // Verifie l'album avant d'ecrire le fichier sur le disque.
        if (query.albumId) await voyages.assertAlbumInStage(query.albumId, id);
        const stored = await storePhoto(body);
        return sendCreated(
          reply,
          await voyages.addPhoto(id, { ...stored, ...query }),
        );
      } catch (error) {
        return handleError(fastify, reply, error);
      }
    },
  );

  // PATCH /api/voyages/admin/photos/:id - album et photo de reference de
  // l'album, ou textes de la photo.
  fastify.patch(
    "/photos/:id",
    {
      config: { rateLimit: writeRateLimit },
      schema: { ...admin, summary: "Update a photo (album, cover)" },
    },
    async (request, reply) => {
      try {
        const { id } = idParamSchema.parse(request.params);
        const changes = photoUpdateSchema.parse(request.body);
        const photo = await voyages.updatePhoto(id, changes);
        return photo
          ? sendOk(reply, photo)
          : sendNotFound(reply, "Photo introuvable", "TRIP_FILE_NOT_FOUND");
      } catch (error) {
        return handleError(fastify, reply, error);
      }
    },
  );

  // Albums photo d'une etape. Un album lie a une randonnee s'affiche dans sa
  // fiche, et sa photo de reference en bulle au depart sur la carte.
  fastify.post(
    "/stages/:id/albums",
    {
      config: { rateLimit: writeRateLimit },
      schema: { ...admin, summary: "Create a photo album" },
    },
    async (request, reply) => {
      try {
        const { id } = idParamSchema.parse(request.params);
        const input = albumInputSchema.parse(request.body);
        if (!(await voyages.stageExists(id))) {
          return sendNotFound(reply, "Etape introuvable", "STAGE_NOT_FOUND");
        }
        return sendCreated(reply, await voyages.createAlbum(id, input));
      } catch (error) {
        return handleError(fastify, reply, error);
      }
    },
  );

  fastify.patch(
    "/albums/:id",
    {
      config: { rateLimit: writeRateLimit },
      schema: { ...admin, summary: "Rename or link a photo album" },
    },
    async (request, reply) => {
      try {
        const { id } = idParamSchema.parse(request.params);
        const album = await voyages.updateAlbum(
          id,
          albumUpdateSchema.parse(request.body),
        );
        return album
          ? sendOk(reply, album)
          : sendNotFound(reply, "Album introuvable", "ALBUM_NOT_FOUND");
      } catch (error) {
        return handleError(fastify, reply, error);
      }
    },
  );

  fastify.delete(
    "/albums/:id",
    {
      config: { rateLimit: writeRateLimit },
      schema: { ...admin, summary: "Delete a photo album (keeps its photos)" },
    },
    async (request, reply) => {
      try {
        const { id } = idParamSchema.parse(request.params);
        return (await voyages.deleteAlbum(id))
          ? sendNoContent(reply)
          : sendNotFound(reply, "Album introuvable", "ALBUM_NOT_FOUND");
      } catch (error) {
        return handleError(fastify, reply, error);
      }
    },
  );

  // POST /api/voyages/admin/meal-photos - photo d'un repas, avant
  // l'enregistrement du voyage. Rend son nom (a citer dans `meals[].photo`)
  // et, si le telephone l'a notee, la position GPS de la prise de vue.
  fastify.post(
    "/meal-photos",
    {
      config: { rateLimit: writeRateLimit },
      schema: { ...admin, summary: "Upload a meal photo" },
    },
    async (request, reply) => {
      try {
        const body = request.body;
        if (!Buffer.isBuffer(body)) {
          return reply.code(415).send({
            error: "Envoyez l'image brute (JPEG, PNG ou WebP)",
            code: "UPLOAD_TYPE_NOT_ALLOWED",
          });
        }
        const stored = await storePhoto(body);
        return sendCreated(reply, {
          photo: stored.fileName,
          photoUrl: `/api/voyages/files/${stored.fileName}`,
          coordinates: readPhotoGps(body),
        });
      } catch (error) {
        return handleError(fastify, reply, error);
      }
    },
  );

  // POST /api/voyages/admin/meal-photos/google - photo d'un repas choisie
  // dans Google Photos (la premiere de la selection). Meme reponse que
  // l'envoi d'un fichier; Google retire la position GPS des images servies.
  fastify.post(
    "/meal-photos/google",
    {
      config: { rateLimit: writeRateLimit },
      schema: { ...admin, summary: "Import a meal photo from Google Photos" },
    },
    async (request, reply) => {
      try {
        const input = googlePhotosSessionSchema.parse(request.body);
        const [picked] = await listPickedPhotos(
          input.accessToken,
          input.sessionId,
        );
        const buffer = await downloadPickedPhoto(input.accessToken, picked);
        await deletePickerSession(input.accessToken, input.sessionId);
        if (!buffer) {
          throw new GooglePhotosError(
            "Photo Google indisponible ou trop volumineuse (15 Mo maximum)",
            "GOOGLE_PHOTOS_EMPTY",
            400,
          );
        }
        const stored = await storePhoto(buffer);
        return sendCreated(reply, {
          photo: stored.fileName,
          photoUrl: `/api/voyages/files/${stored.fileName}`,
          coordinates: readPhotoGps(buffer),
        });
      } catch (error) {
        return handleError(fastify, reply, error);
      }
    },
  );

  // Import Google Photos: la cle client OAuth (publique) est lue au
  // demarrage de l'ecran; null masque le bouton d'import.
  fastify.get(
    "/google-photos/config",
    { schema: { ...admin, summary: "Google Photos import settings" } },
    async (_request, reply) =>
      sendOk(reply, { clientId: googlePhotosClientId() }),
  );

  fastify.post(
    "/stages/:id/photos/google",
    {
      config: { rateLimit: writeRateLimit },
      schema: { ...admin, summary: "Import photos from Google Photos" },
    },
    async (request, reply) => {
      try {
        const { id } = idParamSchema.parse(request.params);
        const input = googlePhotosImportSchema.parse(request.body);
        if (!(await voyages.stageExists(id))) {
          return sendNotFound(reply, "Etape introuvable", "STAGE_NOT_FOUND");
        }
        if (input.albumId) await voyages.assertAlbumInStage(input.albumId, id);
        const picked = await listPickedPhotos(
          input.accessToken,
          input.sessionId,
        );
        const photos = [];
        let skipped = 0;
        // Une a une: la position en pellicule suit l'ordre de selection.
        for (const [index, item] of picked.entries()) {
          const buffer = await downloadPickedPhoto(input.accessToken, item);
          const stored = buffer
            ? await storePhoto(buffer).catch((error: unknown) => {
                if (error instanceof VoyageFileError) return null;
                throw error;
              })
            : null;
          if (!stored) {
            skipped += 1;
            continue;
          }
          const alt =
            picked.length > 1
              ? `${input.alt} (${index + 1}/${picked.length})`
              : input.alt;
          photos.push(
            await voyages.addPhoto(id, {
              ...stored,
              alt: alt.slice(0, 200),
              caption: input.caption,
              albumId: input.albumId,
            }),
          );
        }
        await deletePickerSession(input.accessToken, input.sessionId);
        return sendCreated(reply, { photos, skipped });
      } catch (error) {
        return handleError(fastify, reply, error);
      }
    },
  );

  for (const [resource, remove] of [
    ["tracks", voyages.deleteTrack],
    ["photos", voyages.deletePhoto],
  ] as const) {
    fastify.delete(
      `/${resource}/:id`,
      {
        config: { rateLimit: writeRateLimit },
        schema: { ...admin, summary: `Delete a ${resource.slice(0, -1)}` },
      },
      async (request, reply) => {
        try {
          const { id } = idParamSchema.parse(request.params);
          const fileName = await remove(id);
          if (!fileName) {
            return sendNotFound(
              reply,
              "Fichier introuvable",
              "TRIP_FILE_NOT_FOUND",
            );
          }
          await deleteStoredFiles([fileName]);
          return sendNoContent(reply);
        } catch (error) {
          return handleError(fastify, reply, error);
        }
      },
    );
  }
}
