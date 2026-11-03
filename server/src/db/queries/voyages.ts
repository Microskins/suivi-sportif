// filepath: server/src/db/queries/voyages.ts
// Requetes du site Voyage - NEVER write SQL directly in routes

import type { Prisma } from "@prisma/client";
import prisma from "../index.js";
import { consistentRoutes } from "../../lib/stage-routes.js";
import type {
  AirportInput,
  LngLat,
  TripInput,
  TripMealInput,
} from "../../schemas/voyages.js";

export type TripStatus = "realise" | "a-venir";

export class TripConflictError extends Error {
  constructor(
    message: string,
    readonly code:
      | "TRIP_SLUG_TAKEN"
      | "AIRPORT_NOT_FOUND"
      | "STAGE_NOT_FOUND"
      | "TRACK_NOT_IN_STAGE"
      | "ALBUM_NOT_IN_STAGE",
  ) {
    super(message);
    this.name = "TripConflictError";
  }
}

const FILE_ROUTE = "/api/voyages/files";

// Un voyage est "a venir" tant que sa date de fin n'est pas passee; sans
// dates, c'est un souvenir: "realise".
export function tripStatus(endDate: Date | null, now = new Date()): TripStatus {
  if (!endDate) {
    return "realise";
  }
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  return endDate >= today ? "a-venir" : "realise";
}

const isoDate = (date: Date | null) =>
  date ? date.toISOString().slice(0, 10) : null;

const summaryInclude = {
  flights: { orderBy: { position: "asc" }, include: { from: true, to: true } },
} satisfies Prisma.TripInclude;

const detailInclude = {
  ...summaryInclude,
  stages: {
    orderBy: { position: "asc" },
    include: {
      tracks: { orderBy: { createdAt: "asc" } },
      photos: { orderBy: [{ position: "asc" }, { createdAt: "asc" }] },
      albums: { orderBy: [{ position: "asc" }, { createdAt: "asc" }] },
    },
  },
} satisfies Prisma.TripInclude;

type TripSummaryRow = Prisma.TripGetPayload<{ include: typeof summaryInclude }>;
type TripDetailRow = Prisma.TripGetPayload<{ include: typeof detailInclude }>;
type AirportRow = TripSummaryRow["flights"][number]["from"];

function formatAirport(airport: AirportRow) {
  return {
    code: airport.code,
    city: airport.city,
    name: airport.name,
    coordinates: [airport.longitude, airport.latitude] as LngLat,
  };
}

function formatSummary(trip: TripSummaryRow) {
  return {
    id: trip.id,
    slug: trip.slug,
    title: trip.title,
    country: trip.country,
    description: trip.description,
    stubLabel: trip.stubLabel,
    startDate: isoDate(trip.startDate),
    endDate: isoDate(trip.endDate),
    published: trip.published,
    status: tripStatus(trip.endDate),
    flights: trip.flights.map((flight) => ({
      mode: flight.mode === "VOITURE" ? "voiture" : "avion",
      from: formatAirport(flight.from),
      to: formatAirport(flight.to),
    })),
  };
}

// Les anciens repas (avant les photos) n'ont pas de champ `photo`.
function formatMeal(meal: TripMealInput) {
  const photo = meal.photo ?? null;
  return {
    name: meal.name,
    coordinates: meal.coordinates,
    url: meal.url ?? null,
    photo,
    photoUrl: photo ? `${FILE_ROUTE}/${photo}` : null,
  };
}

// Photos des repas d'une etape (colonne JSON `meals`).
function mealPhotos(meals: Prisma.JsonValue): string[] {
  return Array.isArray(meals)
    ? (meals as TripMealInput[]).flatMap((meal) =>
        meal?.photo ? [meal.photo] : [],
      )
    : [];
}

function formatDetail(trip: TripDetailRow) {
  return {
    ...formatSummary(trip),
    // Lecture: un trace perime (etape deplacee ou retiree) n'est jamais
    // affiche, meme s'il est encore en base.
    stages: consistentRoutes(
      trip.stages.map((stage) => ({
        id: stage.id,
        code: stage.code,
        dayLabel: stage.dayLabel,
        dateLabel: stage.dateLabel,
        title: stage.title,
        detail: stage.detail,
        highlights: stage.highlights,
        coordinates: [stage.longitude, stage.latitude] as LngLat,
        route: stage.route as LngLat[],
        lodgingUrl: stage.lodgingUrl,
        meals: (stage.meals as TripMealInput[]).map(formatMeal),
        tracks: stage.tracks.map((track) => ({
          id: track.id,
          kind: track.kind === "TRAJET" ? "trajet" : "randonnee",
          name: track.name,
          url: `${FILE_ROUTE}/${track.fileName}`,
        })),
        photos: stage.photos.map(formatPhoto),
        albums: stage.albums.map(formatAlbum),
      })),
    ),
  };
}

export type TripSummary = ReturnType<typeof formatSummary>;
export type TripDetail = ReturnType<typeof formatDetail>;

// Ordre du globe et des billets: les voyages a venir d'abord, puis du plus
// recent au plus ancien; les voyages sans dates en dernier.
function sortTrips<T extends TripSummary>(trips: T[]) {
  return [...trips].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "a-venir" ? -1 : 1;
    }
    return (b.startDate ?? "").localeCompare(a.startDate ?? "");
  });
}

// ============== Lecture publique ==============

export async function listPublishedTrips() {
  const trips = await prisma.trip.findMany({
    where: { published: true },
    include: summaryInclude,
  });
  return sortTrips(trips.map(formatSummary));
}

export async function getPublishedTrip(slug: string) {
  const trip = await prisma.trip.findFirst({
    where: { slug, published: true },
    include: detailInclude,
  });
  return trip ? formatDetail(trip) : null;
}

export async function isPublishedFile(fileName: string) {
  const published = { stage: { trip: { published: true } } };
  const [track, photo, meal] = await Promise.all([
    prisma.tripTrack.findFirst({
      where: { fileName, ...published },
      select: { id: true },
    }),
    prisma.tripPhoto.findFirst({
      where: { fileName, ...published },
      select: { id: true },
    }),
    prisma.tripStage.findFirst({
      where: {
        trip: { published: true },
        meals: { array_contains: [{ photo: fileName }] },
      },
      select: { id: true },
    }),
  ]);
  return Boolean(track ?? photo ?? meal);
}

// ============== Administration ==============

export async function listAllTrips() {
  const trips = await prisma.trip.findMany({ include: summaryInclude });
  return sortTrips(trips.map(formatSummary));
}

export async function getTripById(id: string) {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: detailInclude,
  });
  return trip ? formatDetail(trip) : null;
}

export async function listAirports() {
  const airports = await prisma.airport.findMany({ orderBy: { code: "asc" } });
  return airports.map(formatAirport);
}

export async function upsertAirport(input: AirportInput) {
  const airport = await prisma.airport.upsert({
    where: { code: input.code },
    create: input,
    update: input,
  });
  return formatAirport(airport);
}

async function assertAirportsExist(
  tx: Prisma.TransactionClient,
  input: TripInput,
) {
  const codes = [
    ...new Set(input.flights.flatMap((f) => [f.fromCode, f.toCode])),
  ];
  const found = await tx.airport.findMany({
    where: { code: { in: codes } },
    select: { code: true },
  });
  const missing = codes.filter(
    (code) => !found.some((airport) => airport.code === code),
  );
  if (missing.length > 0) {
    throw new TripConflictError(
      `Aeroport inconnu: ${missing.join(", ")}`,
      "AIRPORT_NOT_FOUND",
    );
  }
}

async function assertSlugAvailable(
  tx: Prisma.TransactionClient,
  slug: string,
  tripId?: string,
) {
  const existing = await tx.trip.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (existing && existing.id !== tripId) {
    throw new TripConflictError("Ce slug est deja utilise", "TRIP_SLUG_TAKEN");
  }
}

function flightRow(flight: TripInput["flights"][number], position: number) {
  return {
    position,
    fromCode: flight.fromCode,
    toCode: flight.toCode,
    mode: flight.mode === "voiture" ? ("VOITURE" as const) : ("AVION" as const),
  };
}

function tripFields(input: TripInput) {
  return {
    slug: input.slug,
    title: input.title,
    country: input.country,
    description: input.description,
    stubLabel: input.stubLabel,
    startDate: input.startDate ? new Date(input.startDate) : null,
    endDate: input.endDate ? new Date(input.endDate) : null,
    published: input.published,
  };
}

function stageFields(stage: TripInput["stages"][number], position: number) {
  return {
    position,
    code: stage.code,
    dayLabel: stage.dayLabel,
    dateLabel: stage.dateLabel,
    title: stage.title,
    detail: stage.detail,
    highlights: stage.highlights,
    longitude: stage.coordinates[0],
    latitude: stage.coordinates[1],
    route: stage.route,
    lodgingUrl: stage.lodgingUrl,
    meals: stage.meals,
  };
}

export async function createTrip(userId: string, input: TripInput) {
  const id = await prisma.$transaction(async (tx) => {
    await assertSlugAvailable(tx, input.slug);
    await assertAirportsExist(tx, input);
    const trip = await tx.trip.create({
      data: {
        ...tripFields(input),
        userId,
        flights: {
          create: input.flights.map((flight, position) =>
            flightRow(flight, position),
          ),
        },
        stages: {
          create: consistentRoutes(input.stages).map((stage, position) =>
            stageFields(stage, position),
          ),
        },
      },
      select: { id: true },
    });
    return trip.id;
  });
  return getTripById(id);
}

// Les vols sont remplaces en bloc. Les etapes, elles, sont mises a jour une a
// une: une etape existante garde son id, donc ses traces et ses photos. Rend
// les fichiers des etapes supprimees, a effacer du disque apres la
// transaction.
export async function updateTrip(id: string, input: TripInput) {
  const result = await prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({
      where: { id },
      include: {
        stages: {
          select: {
            id: true,
            meals: true,
            tracks: { select: { fileName: true } },
            photos: { select: { fileName: true } },
          },
        },
      },
    });
    if (!trip) {
      return null;
    }
    await assertSlugAvailable(tx, input.slug, id);
    await assertAirportsExist(tx, input);

    const keptIds = new Set(
      input.stages.flatMap((stage) => (stage.id ? [stage.id] : [])),
    );
    const unknown = [...keptIds].filter(
      (stageId) => !trip.stages.some((s) => s.id === stageId),
    );
    if (unknown.length > 0) {
      throw new TripConflictError(
        "Etape inconnue pour ce voyage",
        "STAGE_NOT_FOUND",
      );
    }
    const removed = trip.stages.filter((stage) => !keptIds.has(stage.id));

    await tx.tripFlight.deleteMany({ where: { tripId: id } });
    await tx.tripStage.deleteMany({
      where: { id: { in: removed.map((stage) => stage.id) } },
    });
    // Positions decalees d'abord: reordonner deux etapes violerait sinon la
    // contrainte d'unicite (trip_id, position) le temps de la mise a jour.
    await tx.tripStage.updateMany({
      where: { tripId: id },
      data: { position: { increment: 10000 } },
    });

    await tx.trip.update({
      where: { id },
      data: {
        ...tripFields(input),
        flights: {
          create: input.flights.map((flight, position) =>
            flightRow(flight, position),
          ),
        },
      },
    });
    // Ecriture: les traces perimes sont retires de la base.
    for (const [position, stage] of consistentRoutes(input.stages).entries()) {
      if (stage.id) {
        await tx.tripStage.update({
          where: { id: stage.id },
          data: stageFields(stage, position),
        });
      } else {
        await tx.tripStage.create({
          data: { ...stageFields(stage, position), tripId: id },
        });
      }
    }

    // Photos de repas qui ne sont plus citees nulle part dans le voyage.
    const keptMealPhotos = new Set(
      input.stages.flatMap((stage) =>
        stage.meals.flatMap((meal) => (meal.photo ? [meal.photo] : [])),
      ),
    );
    const droppedMealPhotos = trip.stages
      .flatMap((stage) => mealPhotos(stage.meals))
      .filter((fileName) => !keptMealPhotos.has(fileName));

    return {
      removedFiles: [
        ...removed.flatMap((stage) =>
          [...stage.tracks, ...stage.photos].map((file) => file.fileName),
        ),
        ...droppedMealPhotos,
      ],
    };
  });

  if (!result) {
    return null;
  }
  return { removedFiles: result.removedFiles, trip: await getTripById(id) };
}

export async function deleteTrip(id: string) {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      stages: {
        select: {
          meals: true,
          tracks: { select: { fileName: true } },
          photos: { select: { fileName: true } },
        },
      },
    },
  });
  if (!trip) {
    return null;
  }
  await prisma.trip.delete({ where: { id } });
  return trip.stages.flatMap((stage) => [
    ...[...stage.tracks, ...stage.photos].map((file) => file.fileName),
    ...mealPhotos(stage.meals),
  ]);
}

export async function stageExists(stageId: string) {
  const stage = await prisma.tripStage.findUnique({
    where: { id: stageId },
    select: { id: true },
  });
  return Boolean(stage);
}

export async function addTrack(
  stageId: string,
  data: {
    byteSize: number;
    fileName: string;
    kind: "trajet" | "randonnee";
    name: string;
  },
) {
  const track = await prisma.tripTrack.create({
    data: {
      stageId,
      byteSize: data.byteSize,
      fileName: data.fileName,
      kind: data.kind === "trajet" ? "TRAJET" : "RANDONNEE",
      name: data.name,
    },
  });
  return {
    id: track.id,
    kind: data.kind,
    name: track.name,
    url: `${FILE_ROUTE}/${track.fileName}`,
  };
}

type StoredPhoto = {
  albumId: string | null;
  alt: string;
  caption: string;
  fileName: string;
  id: string;
  isAlbumCover: boolean;
};

// `albumId`: album de l'etape qui range la photo; `albumCover`: photo de
// reference de cet album (sa couverture, et la bulle de la randonnee liee).
function formatPhoto(photo: StoredPhoto) {
  return {
    id: photo.id,
    url: `${FILE_ROUTE}/${photo.fileName}`,
    alt: photo.alt,
    caption: photo.caption,
    albumId: photo.albumId,
    albumCover: photo.albumId !== null && photo.isAlbumCover,
  };
}

function formatAlbum(album: {
  id: string;
  name: string;
  trackId: string | null;
}) {
  return { id: album.id, name: album.name, trackId: album.trackId };
}

// Une randonnee liee a un album est une trace de la meme etape.
export async function assertTrackInStage(trackId: string, stageId: string) {
  const track = await prisma.tripTrack.findFirst({
    where: { id: trackId, stageId, kind: "RANDONNEE" },
    select: { id: true },
  });
  if (!track) {
    throw new TripConflictError(
      "La randonnee n'appartient pas a l'etape",
      "TRACK_NOT_IN_STAGE",
    );
  }
}

// Une photo ne rejoint qu'un album de sa propre etape.
export async function assertAlbumInStage(albumId: string, stageId: string) {
  const album = await prisma.tripAlbum.findFirst({
    where: { id: albumId, stageId },
    select: { id: true },
  });
  if (!album) {
    throw new TripConflictError(
      "L'album n'appartient pas a l'etape de la photo",
      "ALBUM_NOT_IN_STAGE",
    );
  }
}

export async function addPhoto(
  stageId: string,
  data: {
    albumId?: string | null;
    alt: string;
    byteSize: number;
    caption: string;
    fileName: string;
    mimeType: string;
  },
) {
  if (data.albumId) await assertAlbumInStage(data.albumId, stageId);
  const position = await prisma.tripPhoto.count({ where: { stageId } });
  const photo = await prisma.tripPhoto.create({
    data: { stageId, position, ...data, albumId: data.albumId ?? null },
  });
  return formatPhoto(photo);
}

// Range une photo dans un album de son etape (ou l'en sort avec null) et en
// fait, ou non, la photo de reference. Une seule reference par album.
// Rend null si la photo est inconnue.
export async function updatePhoto(
  id: string,
  changes: {
    albumCover?: boolean;
    albumId?: string | null;
    alt?: string;
    caption?: string;
  },
) {
  const current = await prisma.tripPhoto.findUnique({ where: { id } });
  if (!current) return null;
  const albumId =
    changes.albumId === undefined ? current.albumId : changes.albumId;
  if (albumId && albumId !== current.albumId) {
    await assertAlbumInStage(albumId, current.stageId);
  }
  // Changer d'album retire le statut de reference, sauf demande explicite.
  const isAlbumCover =
    albumId === null
      ? false
      : (changes.albumCover ??
        (albumId === current.albumId ? current.isAlbumCover : false));
  const photo = await prisma.$transaction(async (tx) => {
    if (isAlbumCover && albumId) {
      await tx.tripPhoto.updateMany({
        where: { albumId, isAlbumCover: true, NOT: { id } },
        data: { isAlbumCover: false },
      });
    }
    return tx.tripPhoto.update({
      where: { id },
      data: {
        albumId,
        isAlbumCover,
        ...(changes.alt === undefined ? {} : { alt: changes.alt }),
        ...(changes.caption === undefined ? {} : { caption: changes.caption }),
      },
    });
  });
  return formatPhoto(photo);
}

// Albums d'une etape: nom et randonnee liee (facultative).
export async function createAlbum(
  stageId: string,
  data: { name: string; trackId?: string | null },
) {
  if (data.trackId) await assertTrackInStage(data.trackId, stageId);
  const position = await prisma.tripAlbum.count({ where: { stageId } });
  return formatAlbum(
    await prisma.tripAlbum.create({
      data: {
        stageId,
        position,
        name: data.name,
        trackId: data.trackId ?? null,
      },
    }),
  );
}

// Rend null si l'album est inconnu.
export async function updateAlbum(
  id: string,
  changes: { name?: string; trackId?: string | null },
) {
  const current = await prisma.tripAlbum.findUnique({ where: { id } });
  if (!current) return null;
  if (changes.trackId)
    await assertTrackInStage(changes.trackId, current.stageId);
  return formatAlbum(
    await prisma.tripAlbum.update({ where: { id }, data: changes }),
  );
}

// Supprime l'album; ses photos restent dans l'etape, hors album. Rend false
// si l'album est inconnu.
export async function deleteAlbum(id: string) {
  const [, deleted] = await prisma.$transaction([
    prisma.tripPhoto.updateMany({
      where: { albumId: id },
      data: { isAlbumCover: false },
    }),
    prisma.tripAlbum.deleteMany({ where: { id } }),
  ]);
  return deleted.count > 0;
}

// Fichier GPX d'une trace (depart et arrivee lus sur le disque), ou null.
export async function trackFileName(id: string) {
  const track = await prisma.tripTrack.findUnique({
    where: { id },
    select: { fileName: true },
  });
  return track?.fileName ?? null;
}

// Rendent le nom du fichier supprime (a effacer du disque), ou null.
export async function deleteTrack(id: string) {
  const track = await prisma.tripTrack.findUnique({
    where: { id },
    select: { fileName: true },
  });
  if (!track) return null;
  await prisma.tripTrack.delete({ where: { id } });
  return track.fileName;
}

export async function deletePhoto(id: string) {
  const photo = await prisma.tripPhoto.findUnique({
    where: { id },
    select: { fileName: true },
  });
  if (!photo) return null;
  await prisma.tripPhoto.delete({ where: { id } });
  return photo.fileName;
}
