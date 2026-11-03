// filepath: server/src/lib/gpx-endpoints.ts
// Depart et arrivee d'une trace GPX, pour tracer la route jusqu'au depart
// d'une randonnee puis repartir de son arrivee. Lecture par expression
// reguliere: seuls les attributs lat/lon des points comptent, et le fichier
// a deja ete reconnu comme GPX a l'envoi.
import type { LngLat } from "../schemas/voyages.js";

const POINT = /<(?:trkpt|rtept)\b[^>]*>/gi;

function attribute(tag: string, name: "lat" | "lon") {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`));
  return match ? Number(match[1]) : Number.NaN;
}

function position(tag: string): LngLat | null {
  const lat = attribute(tag, "lat");
  const lng = attribute(tag, "lon");
  return Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
    ? [lng, lat]
    : null;
}

export function gpxEndpoints(
  gpx: string,
): { start: LngLat; end: LngLat } | null {
  let start: LngLat | null = null;
  let end: LngLat | null = null;
  for (const [tag] of gpx.matchAll(POINT)) {
    const point = position(tag);
    if (!point) continue;
    start ??= point;
    end = point;
  }
  return start && end ? { start, end } : null;
}
