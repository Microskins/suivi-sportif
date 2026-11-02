// Geocodage d'adresse pour l'admin Voyage (Google si une cle est configuree,
// sinon Nominatim): l'adresse d'un logement (donnee
// par le loueur) devient la position de l'etape. Service Nominatim
// d'OpenStreetMap, gratuit, appele depuis le serveur: la CSP du site reste
// inchangee et la politique d'usage (User-Agent identifie, faible debit)
// est respectee. L'adresse n'est jamais stockee.
import type { LngLat } from "../schemas/voyages.js";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "suivi-sportif/1.0 (carnets de voyage, admin)";
const TIMEOUT_MS = 8000;
const MAX_RESULTS = 5;

export type GeocodeResult = {
  // Lieu le plus proche trouve quand l'adresse exacte est inconnue.
  approximate?: boolean;
  coordinates: LngLat;
  label: string;
};

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

// Code postal britannique (ex. IV2 6XR): Nominatim le trouve seul bien
// mieux que noye dans une adresse de cottage.
const UK_POSTCODE = /\b([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})\b/i;
const MAX_ATTEMPTS = 4;

// Recherches tentees dans l'ordre, de la plus precise a la plus large.
// Nominatim ignore mal les noms de logement ("Foresters Lodge, ...") : on
// retire les premiers elements de l'adresse un a un, puis on tente le code
// postal seul.
export function geocodeAttempts(query: string): URLSearchParams[] {
  const parts = query
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const attempts: URLSearchParams[] = [];
  for (let start = 0; start <= parts.length - 2; start += 1) {
    attempts.push(new URLSearchParams({ q: parts.slice(start).join(", ") }));
  }
  if (attempts.length === 0) {
    attempts.push(new URLSearchParams({ q: query.trim() }));
  }
  const postcode = query.match(UK_POSTCODE);
  const limited = attempts.slice(0, postcode ? MAX_ATTEMPTS - 1 : MAX_ATTEMPTS);
  if (postcode) {
    limited.push(
      new URLSearchParams({
        postalcode: `${postcode[1]} ${postcode[2]}`.toUpperCase(),
        countrycodes: "gb",
      }),
    );
  }
  return limited;
}

async function search(params: URLSearchParams): Promise<GeocodeResult[]> {
  const url = new URL(NOMINATIM_URL);
  params.forEach((value, key) => url.searchParams.set(key, value));
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

// Politique d'usage de Nominatim: une requete par seconde au plus.
const pause = () => {
  const ms = Number(process.env.GEOCODE_PAUSE_MS ?? 1100);
  return ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : null;
};

// ============== Google (facultatif) ==============
// Avec GOOGLE_GEOCODING_API_KEY, l'API Geocoding de Google est interrogee
// d'abord: elle connait bien mieux les adresses de logements (cottages,
// lieux-dits). Sans cle, ou si Google echoue, Nominatim prend le relais.

const GOOGLE_URL = "https://maps.googleapis.com/maps/api/geocode/json";

type GooglePlace = {
  formatted_address?: unknown;
  geometry?: {
    location?: { lat?: unknown; lng?: unknown };
    location_type?: unknown;
  };
  partial_match?: unknown;
};

async function searchGoogle(
  query: string,
  key: string,
): Promise<GeocodeResult[]> {
  const url = new URL(GOOGLE_URL);
  url.searchParams.set("address", query);
  url.searchParams.set("language", "fr");
  url.searchParams.set("key", key);
  // Pas d'URL dans les erreurs: elle contient la cle.
  let response: Response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch {
    throw new GeocodingError("Google Geocoding injoignable");
  }
  const body = (await response.json().catch(() => null)) as {
    results?: GooglePlace[];
    status?: string;
  } | null;
  if (body?.status === "ZERO_RESULTS") return [];
  if (!response.ok || body?.status !== "OK" || !Array.isArray(body.results)) {
    throw new GeocodingError(
      `Google Geocoding ${body?.status ?? `HTTP ${response.status}`}`,
    );
  }
  return body.results.slice(0, MAX_RESULTS).flatMap((place) => {
    const result = toResult({
      display_name: place.formatted_address,
      lat: place.geometry?.location?.lat,
      lon: place.geometry?.location?.lng,
    });
    if (!result) return [];
    const approximate =
      place.partial_match === true ||
      place.geometry?.location_type === "APPROXIMATE";
    return [approximate ? { ...result, approximate } : result];
  });
}

export async function geocodeAddress(query: string): Promise<GeocodeResult[]> {
  const googleKey = process.env.GOOGLE_GEOCODING_API_KEY?.trim();
  if (googleKey) {
    try {
      const results = await searchGoogle(query, googleKey);
      if (results.length > 0) return results;
    } catch (error) {
      // Cle refusee, quota atteint...: Nominatim prend le relais.
      console.warn((error as Error).message);
    }
  }
  const attempts = geocodeAttempts(query);
  for (const [index, params] of attempts.entries()) {
    if (index > 0) await pause();
    const results = await search(params);
    if (results.length > 0) {
      // Au-dela de la premiere tentative, le lieu trouve est le plus proche
      // connu (village, code postal), pas l'adresse exacte.
      return index === 0
        ? results
        : results.map((result) => ({ ...result, approximate: true }));
    }
  }
  return [];
}
