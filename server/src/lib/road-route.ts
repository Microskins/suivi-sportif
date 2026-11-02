// Itineraire routier entre deux etapes d'un carnet de voyage, calcule par un
// serveur OSRM (par defaut le serveur de demonstration public). Appele depuis
// l'ecran d'admin seulement: le trace est enregistre avec l'etape, la page
// publique ne depend donc jamais de ce service.
import type { LngLat } from "../schemas/voyages.js";

const DEFAULT_ROUTER_URL = "https://router.project-osrm.org";
const TIMEOUT_MS = 15_000;
// ~20 m: invisible a l'ecran, mais divise par 5 a 10 le nombre de points
// d'un trajet de plusieurs centaines de kilometres.
const SIMPLIFY_TOLERANCE_DEG = 0.0002;
// Meme plafond que le schema d'une etape (`route`).
const MAX_POINTS = 5000;
const CHUNK_SIZE = 1000;

export class RoadRouteError extends Error {
  constructor(
    public readonly code: "ROUTE_NOT_FOUND" | "ROUTER_UNAVAILABLE",
    message: string,
  ) {
    super(message);
    this.name = "RoadRouteError";
  }
}

export type RoadRoute = { distanceKm: number; route: LngLat[] };

export async function fetchRoadRoute(
  from: LngLat,
  to: LngLat,
): Promise<RoadRoute> {
  const base = (process.env.ROUTER_URL || DEFAULT_ROUTER_URL).replace(
    /\/+$/,
    "",
  );
  const url = `${base}/route/v1/driving/${from.join(",")};${to.join(",")}?overview=full&geometries=geojson`;

  let body: OsrmResponse;
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    body = (await response.json()) as OsrmResponse;
  } catch {
    throw new RoadRouteError(
      "ROUTER_UNAVAILABLE",
      "Le service d'itinéraire ne répond pas. Réessayez dans un instant.",
    );
  }

  const best = body.routes?.[0];
  if (body.code !== "Ok" || !best?.geometry?.coordinates?.length) {
    // NoRoute / NoSegment: pas de route entre les deux points (ile sans
    // ferry, point en pleine mer...). Les autres codes viennent du service.
    if (body.code === "NoRoute" || body.code === "NoSegment") {
      throw new RoadRouteError(
        "ROUTE_NOT_FOUND",
        "Aucune route trouvée entre ces deux étapes.",
      );
    }
    throw new RoadRouteError(
      "ROUTER_UNAVAILABLE",
      "Le service d'itinéraire a refusé la demande. Réessayez dans un instant.",
    );
  }

  return {
    distanceKm: Math.round(best.distance / 100) / 10,
    route: simplify(best.geometry.coordinates).map(roundPoint),
  };
}

type OsrmResponse = {
  code?: string;
  routes?: { distance: number; geometry?: { coordinates?: LngLat[] } }[];
};

const roundPoint = ([lng, lat]: LngLat): LngLat => [
  Math.round(lng * 1e5) / 1e5,
  Math.round(lat * 1e5) / 1e5,
];

// Douglas-Peucker par blocs, puis un point sur k si le trace depasse encore
// le plafond (trajet de plusieurs milliers de kilometres).
export function simplify(points: LngLat[]): LngLat[] {
  // Par blocs: sur un trace tres sinueux, l'algorithme decoupe mal et devient
  // quadratique (plusieurs secondes pour 40 000 points). Les extremites de
  // chaque bloc sont gardees, la difference ne se voit pas.
  const result: LngLat[] = [];
  for (let start = 0; start < points.length - 1; start += CHUNK_SIZE) {
    const chunk = points.slice(start, start + CHUNK_SIZE + 1);
    const kept = douglasPeucker(chunk, SIMPLIFY_TOLERANCE_DEG);
    // Le premier point d'un bloc est le dernier du precedent.
    result.push(...(start === 0 ? kept : kept.slice(1)));
  }
  if (points.length === 1) result.push(points[0]);
  if (result.length <= MAX_POINTS) return result;
  const last = result.length - 1;
  const step = Math.ceil(result.length / (MAX_POINTS - 1));
  return [
    ...result.filter((_, index) => index % step === 0 && index !== last),
    result[last],
  ];
}

function douglasPeucker(points: LngLat[], tolerance: number): LngLat[] {
  if (points.length < 3) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  // Pile explicite: une recursion par segment deborderait sur les longs trajets.
  const stack: [number, number][] = [[0, points.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop()!;
    let farthest = -1;
    let maxDistance = tolerance;
    for (let index = first + 1; index < last; index += 1) {
      const distance = distanceToSegment(
        points[index],
        points[first],
        points[last],
      );
      if (distance > maxDistance) {
        maxDistance = distance;
        farthest = index;
      }
    }
    if (farthest !== -1) {
      keep[farthest] = 1;
      stack.push([first, farthest], [farthest, last]);
    }
  }
  return points.filter((_, index) => keep[index]);
}

function distanceToSegment([x, y]: LngLat, [x1, y1]: LngLat, [x2, y2]: LngLat) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;
  const t =
    lengthSquared === 0
      ? 0
      : Math.max(
          0,
          Math.min(1, ((x - x1) * dx + (y - y1) * dy) / lengthSquared),
        );
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
}
