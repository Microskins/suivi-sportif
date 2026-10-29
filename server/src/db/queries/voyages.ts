// filepath: server/src/db/queries/voyages.ts
// Requetes du site Voyage - NEVER write SQL directly in routes

import type { Prisma } from "@prisma/client";
import prisma from "../index.js";
import type { AirportInput, LngLat, TripInput } from "../../schemas/voyages.js";

export type TripStatus = "realise" | "a-venir";

export class TripConflictError extends Error {
  constructor(
    message: string,
    readonly code: "TRIP_SLUG_TAKEN" | "AIRPORT_NOT_FOUND" | "STAGE_NOT_FOUND",
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

function formatDetail(trip: TripDetailRow) {
  return {
    ...formatSummary(trip),
    stages: trip.stages.map((stage) => ({
      id: stage.id,
      code: stage.code,
      dayLabel: stage.dayLabel,
      dateLabel: stage.dateLabel,
      title: stage.title,
      detail: stage.detail,
      highlights: stage.highlights,
      coordinates: [stage.longitude, stage.latitude] as LngLat,
      route: stage.route as LngLat[],
      tracks: stage.tracks.map((track) => ({
        id: track.id,
        kind: track.kind === "TRAJET" ? "trajet" : "randonnee",
        name: track.name,
        url: `${FILE_ROUTE}/${track.fileName}`,
      })),
      photos: stage.photos.map((photo) => ({
        id: photo.id,
        url: `${FILE_ROUTE}/${photo.fileName}`,
        alt: photo.alt,
        caption: photo.caption,
      })),
    })),
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
  const [track, photo] = await Promise.all([
    prisma.tripTrack.findFirst({
      where: { fileName, ...published },
      select: { id: true },
    }),
    prisma.tripPhoto.findFirst({
      where: { fileName, ...published },
      select: { id: true },
    }),
  ]);
  return Boolean(track ?? photo);
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
          create: input.stages.map((stage, position) =>
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
    for (const [position, stage] of input.stages.entries()) {
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

    return {
      removedFiles: removed.flatMap((stage) =>
        [...stage.tracks, ...stage.photos].map((file) => file.fileName),
      ),
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
  return trip.stages.flatMap((stage) =>
    [...stage.tracks, ...stage.photos].map((file) => file.fileName),
  );
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

export async function addPhoto(
  stageId: string,
  data: {
    alt: string;
    byteSize: number;
    caption: string;
    fileName: string;
    mimeType: string;
  },
) {
  const position = await prisma.tripPhoto.count({ where: { stageId } });
  const photo = await prisma.tripPhoto.create({
    data: { stageId, position, ...data },
  });
  return {
    id: photo.id,
    url: `${FILE_ROUTE}/${photo.fileName}`,
    alt: photo.alt,
    caption: photo.caption,
  };
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
