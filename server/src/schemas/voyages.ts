// filepath: server/src/schemas/voyages.ts
// Validation des voyages (site Voyage). Fichier separe de index.ts: le site
// Voyage est un domaine autonome, sans lien avec le suivi sportif.
import { z } from "zod";

const lngLatSchema = z.tuple([
  z.number().min(-180).max(180),
  z.number().min(-90).max(90),
]);

export const airportCodeSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z]{3}$/, "Code IATA a 3 lettres attendu")
  .transform((code) => code.toUpperCase());

export const airportInputSchema = z.object({
  code: airportCodeSchema,
  city: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(120),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date au format AAAA-MM-JJ attendue")
  .refine((value) => !Number.isNaN(Date.parse(value)), "Date invalide");

export const tripStageInputSchema = z.object({
  // Present pour une etape existante: elle garde ses traces et ses photos.
  id: z.string().uuid().optional(),
  code: z
    .string()
    .trim()
    .min(2)
    .max(4)
    .transform((code) => code.toUpperCase()),
  dayLabel: z.string().trim().min(1).max(20),
  dateLabel: z.string().trim().min(1).max(40),
  title: z.string().trim().min(1).max(120),
  detail: z.string().trim().max(2000).default(""),
  highlights: z.array(z.string().trim().min(1).max(60)).max(12).default([]),
  coordinates: lngLatSchema,
  route: z.array(lngLatSchema).max(5000).default([]),
});

export const tripInputSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug en minuscules, chiffres et tirets (ex. ecosse-2026)",
      )
      .max(60),
    title: z.string().trim().min(1).max(120),
    country: z.string().trim().min(1).max(80),
    description: z.string().trim().max(1000).default(""),
    stubLabel: z.string().trim().min(1).max(30),
    startDate: isoDateSchema.nullable().default(null),
    endDate: isoDateSchema.nullable().default(null),
    published: z.boolean().default(false),
    flights: z
      .array(
        z.object({ fromCode: airportCodeSchema, toCode: airportCodeSchema }),
      )
      .min(1, "Au moins un vol")
      .max(10),
    stages: z.array(tripStageInputSchema).max(60).default([]),
  })
  .refine(
    (trip) =>
      !trip.startDate || !trip.endDate || trip.startDate <= trip.endDate,
    {
      message: "La date de fin doit suivre la date de debut",
      path: ["endDate"],
    },
  );

export const trackUploadQuerySchema = z.object({
  kind: z.enum(["trajet", "randonnee"]),
  name: z.string().trim().min(1).max(120),
});

export const photoUploadQuerySchema = z.object({
  alt: z.string().trim().min(1, "Texte alternatif obligatoire").max(200),
  caption: z.string().trim().max(200).default(""),
});

export const slugParamSchema = z.object({
  slug: z.string().trim().min(1).max(60),
});

export const fileNameParamSchema = z.object({
  // Nom genere par le serveur: uuid + extension connue, jamais un chemin.
  fileName: z
    .string()
    .regex(/^[0-9a-f-]{36}\.(gpx|jpg|png|webp)$/, "Nom de fichier invalide"),
});

export type AirportInput = z.infer<typeof airportInputSchema>;
export type TripInput = z.infer<typeof tripInputSchema>;
export type TripStageInput = z.infer<typeof tripStageInputSchema>;
export type LngLat = z.infer<typeof lngLatSchema>;
