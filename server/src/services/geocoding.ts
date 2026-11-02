// Geocodage d'adresse pour l'admin Voyage: l'adresse d'un logement (donnee
// par le loueur) devient la position de l'etape. Service Nominatim
// d'OpenStreetMap, gratuit, appele depuis le serveur: la CSP du site reste
// inchangee et la politique d'usage (User-Agent identifie, faible debit)
// est respectee. L'adresse n'est jamais stockee.
import type { LngLat } from "../schemas/voyages.js";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "suivi-sportif/1.0 (carnets de voyage, admin)";
const TIMEOUT_MS = 8000;
const MAX_RESULTS = 5;

export type GeocodeResult = { coordinates: LngLat; label: string };

type NominatimPlace = { display_name?: unknown; lat?: unknown; lon?: unknown };

export class GeocodingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeocodingError";
  }
}

function toResult(place: NominatimPlace): GeocodeResult | null {
  const lng = Number(place.lon);
  const lat = Number(place.lat);
  if (
    typeof place.display_name !== "string" ||
    !Number.isFinite(lng) ||
    !Number.isFinite(lat) ||
    Math.abs(lng) > 180 ||
    Math.abs(lat) > 90
  ) {
    return null;
  }
  // 5 decimales: environ 1 m, bien assez pour une etape.
  const round = (value: number) => Math.round(value * 1e5) / 1e5;
  return { coordinates: [round(lng), round(lat)], label: place.display_name };
}

export async function geocodeAddress(query: string): Promise<GeocodeResult[]> {
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", String(MAX_RESULTS));
  url.searchParams.set("accept-language", "fr");

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new GeocodingError("Service de géocodage injoignable");
  }
  if (!response.ok) {
    throw new GeocodingError(`Service de géocodage HTTP ${response.status}`);
  }
  const places = (await response.json().catch(() => null)) as unknown;
  if (!Array.isArray(places)) {
    throw new GeocodingError("Réponse de géocodage illisible");
  }
  return places
    .map((place) => toResult(place as NominatimPlace))
    .filter((result): result is GeocodeResult => result !== null);
}
