// Calculs de distance sur les traces d'un carnet.
import type { LngLat, TripStage } from "./trip-types";

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function distanceKm([lng1, lat1]: LngLat, [lng2, lat2]: LngLat) {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

export function routeLengthKm(route: LngLat[]) {
  return route.reduce(
    (total, point, index) =>
      index === 0 ? total : total + distanceKm(route[index - 1], point),
    0,
  );
}

// Trace complet du voyage: le point de depart, puis le trace de chaque etape.
export function fullRoute(stages: TripStage[]): LngLat[] {
  return stages.flatMap((stage, index) =>
    index === 0 || stage.route.length < 2
      ? [stage.coordinates]
      : stage.route.slice(1),
  );
}
