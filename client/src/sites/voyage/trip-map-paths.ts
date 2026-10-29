// Geometrie du trace de voyage, sans dependance a MapLibre: decoupage entre
// traces GPS et reconstituees, chemin du rejeu et orientation de la camera.
import { distanceKm, routeLengthKm } from "./trip-geometry";
import type { LngLat } from "./trip-types";
import type { GpxTrack } from "./gpx-track";
import { elevationSegments } from "./gpx-track";

const DRIVE_COLOR = "#1c4ed8";

export type MapStage = {
  code: string;
  coordinates: LngLat;
  route: LngLat[];
  title: string;
};

// Reechantillonne un chemin a pas constant (~1 km): le rejeu avance a vitesse
// reguliere, que l'etape vienne d'un GPX tres dense (un point tous les
// quelques metres) ou d'un trace reconstitue a quelques sommets.
export function resample(route: LngLat[], stepKm = 1) {
  if (route.length < 2) {
    return route;
  }
  const points: LngLat[] = [route[0]];
  // Distance deja parcourue depuis le dernier point emis.
  let sinceLast = 0;
  for (let index = 1; index < route.length; index += 1) {
    const from = route[index - 1];
    const to = route[index];
    const length = distanceKm(from, to);
    let along = stepKm - sinceLast;
    while (along <= length && length > 0) {
      const ratio = along / length;
      points.push([
        from[0] + (to[0] - from[0]) * ratio,
        from[1] + (to[1] - from[1]) * ratio,
      ]);
      along += stepKm;
    }
    sinceLast = length - (along - stepKm);
  }
  points.push(route[route.length - 1]);
  return points;
}

export function lineFeature(
  coordinates: LngLat[],
): GeoJSON.Feature<GeoJSON.LineString> {
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "LineString", coordinates },
  };
}

export function collection(
  features: GeoJSON.Feature<GeoJSON.LineString>[],
): GeoJSON.FeatureCollection<GeoJSON.LineString> {
  return { type: "FeatureCollection", features };
}

// Repartit chaque etape entre trajet GPS (trait plein bleu), randonnee GPS
// (trait plein colore par altitude) et trace reconstitue (tirets), et
// construit le chemin parcouru par le rejeu.
export function buildPaths(stages: MapStage[], tracks: GpxTrack[]) {
  const reconstructed: GeoJSON.Feature<GeoJSON.LineString>[] = [];
  const drives = tracks.filter((track) => track.kind === "trajet");
  const stagePaths = stages.map((stage, index) => {
    const stageDrives = drives.filter((track) => track.stageIndex === index);
    if (stageDrives.length > 0) {
      return stageDrives.flatMap((track) =>
        track.points.map((point) => point.position),
      );
    }
    if (stage.route.length > 1) {
      reconstructed.push(lineFeature(stage.route));
    }
    return stage.route;
  });

  const replay = resample(stagePaths.flat());
  const total = routeLengthKm(replay) || 1;
  let travelled = 0;
  const stageEnds = stagePaths.map((path) => {
    travelled += routeLengthKm(path);
    return travelled / total;
  });

  return {
    gps: collection([
      ...drives.map((track) => ({
        ...lineFeature(track.points.map((point) => point.position)),
        properties: { color: DRIVE_COLOR },
      })),
      ...elevationSegments(tracks.filter((track) => track.kind === "randonnee"))
        .features,
    ]),
    reconstructed: collection(reconstructed),
    replay,
    stageEnds,
  };
}

export function bearingBetween([lng1, lat1]: LngLat, [lng2, lat2]: LngLat) {
  const y =
    Math.sin(((lng2 - lng1) * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lng2 - lng1) * Math.PI) / 180);
  return (Math.atan2(y, x) * 180) / Math.PI;
}
