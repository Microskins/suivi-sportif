// Route d'une etape qui passe par ses randonnees: on roule de l'etape
// precedente au depart de la 1re randonnee, de l'arrivee de chacune au
// depart de la suivante, puis de l'arrivee de la derniere jusqu'a l'etape.
// Le trace enregistre met ces troncons bout a bout; la carte le recoupe aux
// randonnees (dessinees par leur GPX) et le rejeu les parcourt.
import { distanceKm } from "./trip-geometry";
import type { LngLat } from "./trip-types";

export type HikeEnds = { end: LngLat; start: LngLat };

// Le trace enregistre est plafonne par l'API.
export const MAX_ROUTE_POINTS = 5000;

// Troncons routiers a calculer: [depart, arrivee] de chacun.
export function roadLegs(
  from: LngLat,
  hikes: HikeEnds[],
  to: LngLat,
): [LngLat, LngLat][] {
  const stops = [from, ...hikes.flatMap((hike) => [hike.start, hike.end]), to];
  const legs: [LngLat, LngLat][] = [];
  for (let index = 0; index < stops.length; index += 2) {
    legs.push([stops[index], stops[index + 1]]);
  }
  return legs;
}

// Troncons mis bout a bout, eclaircis au besoin (extremites gardees).
export function joinLegs(legs: LngLat[][], max = MAX_ROUTE_POINTS): LngLat[] {
  const total = legs.reduce((sum, leg) => sum + leg.length, 0);
  if (total <= max) return legs.flat();
  const keep = (max - 2 * legs.length) / total;
  return legs.flatMap((leg) => {
    if (leg.length <= 2) return leg;
    const inner = Math.max(0, Math.floor((leg.length - 2) * keep));
    const step = (leg.length - 1) / (inner + 1);
    return Array.from(
      { length: inner + 2 },
      (_, index) => leg[Math.min(leg.length - 1, Math.round(index * step))],
    );
  });
}

// Une jonction se reconnait a ses deux points: fin du troncon d'approche,
// pres du depart de la randonnee, et debut du troncon suivant, pres de son
// arrivee. La route part de la route la plus proche: quelques km d'ecart.
const JUNCTION_KM = 3;

// Decoupe le trace d'une etape aux randonnees, dans l'ordre. Rend les
// troncons routiers (dessines en tirets) et le chemin du rejeu, ou chaque
// randonnee est inseree a sa place.
export function splitAtHikes(
  route: LngLat[],
  hikes: LngLat[][],
): { replay: LngLat[]; segments: LngLat[][] } {
  const segments: LngLat[][] = [];
  const replay: LngLat[] = [];
  let from = 0;
  for (const hike of hikes) {
    if (hike.length === 0) continue;
    const start = hike[0];
    const end = hike[hike.length - 1];
    let best = -1;
    let bestScore = Number.POSITIVE_INFINITY;
    for (let index = from; index < route.length - 1; index += 1) {
      const toStart = distanceKm(route[index], start);
      const fromEnd = distanceKm(route[index + 1], end);
      if (toStart > JUNCTION_KM || fromEnd > JUNCTION_KM) continue;
      if (toStart + fromEnd < bestScore) {
        bestScore = toStart + fromEnd;
        best = index;
      }
    }
    if (best < 0) continue;
    segments.push(route.slice(from, best + 1));
    replay.push(...route.slice(from, best + 1), ...hike);
    from = best + 1;
  }
  segments.push(route.slice(from));
  replay.push(...route.slice(from));
  return {
    replay,
    segments: segments.filter((segment) => segment.length > 1),
  };
}
