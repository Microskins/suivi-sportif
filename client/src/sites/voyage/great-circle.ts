// Trajectoire d'un vol: l'arc de grand cercle entre deux aeroports, le plus
// court chemin sur le globe, comme la route reelle d'un avion de ligne.
import type { LngLat } from "./trip-types";

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const toDegrees = (radians: number) => (radians * 180) / Math.PI;

export function greatCircle(from: LngLat, to: LngLat, segments = 96) {
  const [lon1, lat1] = from.map(toRadians);
  const [lon2, lat2] = to.map(toRadians);
  // Distance angulaire (formule de haversine).
  const angle =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((lat2 - lat1) / 2) ** 2 +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2,
      ),
    );
  if (angle === 0) {
    return [from, to];
  }

  const points: LngLat[] = [];
  for (let step = 0; step <= segments; step += 1) {
    const fraction = step / segments;
    const a = Math.sin((1 - fraction) * angle) / Math.sin(angle);
    const b = Math.sin(fraction * angle) / Math.sin(angle);
    const x =
      a * Math.cos(lat1) * Math.cos(lon1) + b * Math.cos(lat2) * Math.cos(lon2);
    const y =
      a * Math.cos(lat1) * Math.sin(lon1) + b * Math.cos(lat2) * Math.sin(lon2);
    const z = a * Math.sin(lat1) + b * Math.sin(lat2);
    points.push([
      toDegrees(Math.atan2(y, x)),
      toDegrees(Math.atan2(z, Math.sqrt(x * x + y * y))),
    ]);
  }
  return points;
}

// Cap initial d'un point vers le suivant, en degres depuis le nord: oriente
// l'avion le long de sa trajectoire.
export function headingBetween([lon1, lat1]: LngLat, [lon2, lat2]: LngLat) {
  const [p1, p2] = [toRadians(lat1), toRadians(lat2)];
  const dLon = toRadians(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(p2);
  const x =
    Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dLon);
  return (toDegrees(Math.atan2(y, x)) + 360) % 360;
}
