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

const AIRBNB_HOST = /(^|\.)airbnb\.[a-z.]{2,8}$/i;

// Lien du logement de l'etape. Un lien Airbnb est ramene a l'annonce seule
// (https://www.airbnb.fr/rooms/123): les dates, le nombre de voyageurs et
// les parametres de suivi du lien partage n'ont rien a faire en public.
export function normalizeLodgingUrl(value: string): string | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return null;
  }
  if (AIRBNB_HOST.test(url.hostname)) {
    const room = url.pathname.match(/\/rooms\/(?:plus\/)?(\d+)/);
    if (room) {
      return `https://${url.hostname.toLowerCase()}/rooms/${room[1]}`;
    }
  }
  url.protocol = "https:";
  url.hash = "";
  return url.toString();
}

// Lien facultatif (logement, restaurant): vide => null, sinon une adresse
// http(s) normalisee.
const optionalLinkSchema = (example: string) =>
  z
    .string()
    .trim()
    .max(500)
    .transform((value, ctx) => {
      if (value === "") {
        return null;
      }
      const url = normalizeLodgingUrl(value);
      if (!url) {
        ctx.addIssue({
          code: "custom",
          message: `Lien attendu (ex. ${example})`,
        });
        return z.NEVER;
      }
      return url;
    })
    .nullable()
    .default(null);

const lodgingUrlSchema = optionalLinkSchema(
  "https://www.airbnb.fr/rooms/12345678",
);

// Un repas de l'etape: un point sur la carte, avec le lien du lieu si on l'a.
export const tripMealInputSchema = z.object({
  name: z.string().trim().min(1, "Nom du lieu obligatoire").max(120),
  coordinates: lngLatSchema,
  url: optionalLinkSchema("https://www.google.com/maps/place/..."),
});

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
  lodgingUrl: lodgingUrlSchema,
  meals: z.array(tripMealInputSchema).max(20).default([]),
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
        z.object({
          fromCode: airportCodeSchema,
          toCode: airportCodeSchema,
          // Avion par defaut: les clients d'avant le mode n'envoient rien.
          mode: z.enum(["avion", "voiture"]).default("avion"),
        }),
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

// Itineraire routier demande par l'admin entre deux etapes consecutives.
export const roadRouteInputSchema = z.object({
  from: lngLatSchema,
  to: lngLatSchema,
});

export const geocodeQuerySchema = z.object({
  q: z.string().trim().min(3, "Adresse trop courte").max(300),
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
export type TripMealInput = z.infer<typeof tripMealInputSchema>;
export type LngLat = z.infer<typeof lngLatSchema>;
