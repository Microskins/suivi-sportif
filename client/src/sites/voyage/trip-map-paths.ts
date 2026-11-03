// Geometrie du trace de voyage, sans dependance a MapLibre: decoupage entre
// traces GPS et reconstituees, chemin du rejeu et orientation de la camera.
import { distanceKm, routeLengthKm } from "./trip-geometry";
import type { LngLat, TripMeal } from "./trip-types";
import type { GpxTrack } from "./gpx-track";
import { elevationSegments } from "./gpx-track";
import { splitAtHikes } from "./hike-legs";

const DRIVE_COLOR = "#1c4ed8";

export type MapStage = {
  code: string;
  coordinates: LngLat;
  // Repas de l'etape: des points sur la carte, sans effet sur le trace.
  meals?: TripMeal[];
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
    if (stage.route.length < 2) {
      return stage.route;
    }
    // Route qui passe par les randonnees de l'etape: tirets coupes a
    // chacune (son GPX la dessine), et rejeu qui la parcourt.
    const hikes = tracks
      .filter(
        (track) => track.kind === "randonnee" && track.stageIndex === index,
      )
      .map((track) => track.points.map((point) => point.position));
    const { replay, segments } = splitAtHikes(stage.route, hikes);
    segments.forEach((segment) => reconstructed.push(lineFeature(segment)));
    return replay;
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
