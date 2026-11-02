// Coherence des traces d'etapes. Le trace d'une etape relie l'etape
// precedente a celle-ci; il devient faux quand une etape est deplacee,
// supprimee ou reordonnee (ex. un trace qui passe encore par une etape
// retiree). Un trace dont les extremites ne tombent plus sur les deux etapes
// est ecarte: la carte trace alors une ligne droite, jusqu'a ce que
// « Tracer par la route » le recalcule.
import type { LngLat } from "../schemas/voyages.js";

// L'itineraire routier part de la route la plus proche: quelques centaines
// de metres d'ecart sont normaux, pas plusieurs kilometres.
export const ROUTE_ENDPOINT_TOLERANCE_KM = 3;

function distanceKm([lng1, lat1]: LngLat, [lng2, lat2]: LngLat) {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
}

export function consistentRoutes<
  T extends { coordinates: LngLat; route: LngLat[] },
>(stages: T[]): T[] {
  return stages.map((stage, index) => {
    if (stage.route.length === 0) return stage;
    const previous = stages[index - 1];
    const first = stage.route[0];
    const last = stage.route[stage.route.length - 1];
    const ok =
      previous !== undefined &&
      stage.route.length >= 2 &&
      distanceKm(first, previous.coordinates) <= ROUTE_ENDPOINT_TOLERANCE_KM &&
      distanceKm(last, stage.coordinates) <= ROUTE_ENDPOINT_TOLERANCE_KM;
    return ok ? stage : { ...stage, route: [] };
  });
}
