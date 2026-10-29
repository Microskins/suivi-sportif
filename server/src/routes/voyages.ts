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
  contentTypeOf,
  deleteStoredFiles,
  openStoredFile,
  storeGpx,
  storePhoto,
} from "../lib/voyage-files.js";
import { authenticateVoyageAdmin } from "../plugins/auth.js";
import { idParamSchema } from "../schemas/index.js";
import {
  airportInputSchema,
  fileNameParamSchema,
  photoUploadQuerySchema,
  slugParamSchema,
  trackUploadQuerySchema,
  tripInputSchema,
} from "../schemas/voyages.js";

const TRIP_NOT_FOUND = "Voyage introuvable";

const writeRateLimit = {
  max: Number(process.env.VOYAGE_WRITE_RATE_LIMIT_MAX ?? 60),
  timeWindow: "1 minute",
};

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
      config: { rateLimit: writeRateLimit },
      schema: { ...admin, summary: "Create a trip" },
    },
    async (request, reply) => {
      try {
        const input = tripInputSchema.parse(request.body);
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
      config: { rateLimit: writeRateLimit },
      schema: { ...admin, summary: "Update a trip" },
    },
    async (request, reply) => {
      try {
        const { id } = idParamSchema.parse(request.params);
        const input = tripInputSchema.parse(request.body);
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
          return reply
            .code(413)
            .send({
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
