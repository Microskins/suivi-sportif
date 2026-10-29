// Lecture des traces GPS (GPX exporte depuis Strava, Garmin, Komoot...) et
// calcul des statistiques affichees dans le carnet. Aucune dependance: le
// GPX est un XML simple que DOMParser lit directement dans le navigateur.
import type { LngLat, TrackKind, TripStage } from "./ecosse-2026-data";
import { distanceKm, routeLengthKm } from "./ecosse-2026-data";

export type TrackPoint = {
  ele: number | null;
  position: LngLat;
  time: number | null;
};

export type GpxTrack = {
  kind: TrackKind;
  name: string;
  points: TrackPoint[];
  stageIndex: number;
};

export type TrackStats = {
  ascentM: number | null;
  distanceKm: number;
  durationMs: number | null;
  maxEleM: number | null;
};

export type ProfilePoint = { distanceKm: number; eleM: number };

function readNumber(value: string | null | undefined) {
  if (value == null || value.trim() === "") {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function parseGpx(xml: string, fallbackName: string) {
  const document = new DOMParser().parseFromString(xml, "application/xml");
  if (document.querySelector("parsererror")) {
    throw new Error(`GPX illisible: ${fallbackName}`);
  }
  // Traces enregistrees (trkpt) en priorite, sinon itineraire planifie (rtept).
  let nodes = Array.from(document.getElementsByTagName("trkpt"));
  if (nodes.length === 0) {
    nodes = Array.from(document.getElementsByTagName("rtept"));
  }
  const points: TrackPoint[] = nodes.flatMap((node) => {
    const lat = readNumber(node.getAttribute("lat"));
    const lon = readNumber(node.getAttribute("lon"));
    if (lat === null || lon === null) {
      return [];
    }
    const time = node.getElementsByTagName("time")[0]?.textContent;
    const parsedTime = time ? Date.parse(time) : NaN;
    return [
      {
        ele: readNumber(node.getElementsByTagName("ele")[0]?.textContent),
        position: [lon, lat] as LngLat,
        time: Number.isFinite(parsedTime) ? parsedTime : null,
      },
    ];
  });
  const name =
    document
      .querySelector("trk > name, rte > name, metadata > name")
      ?.textContent?.trim() || fallbackName;
  return { name, points };
}

// Seuil anti-bruit: les altitudes GPS oscillent de quelques metres a l'arret;
// sans lissage le D+ serait largement surestime.
const ASCENT_THRESHOLD_M = 3;

export function trackStats(points: TrackPoint[]): TrackStats {
  let distance = 0;
  let ascent = 0;
  let reference: number | null = null;
  let maxEle: number | null = null;

  points.forEach((point, index) => {
    if (index > 0) {
      distance += distanceKm(points[index - 1].position, point.position);
    }
    if (point.ele === null) {
      return;
    }
    maxEle = maxEle === null ? point.ele : Math.max(maxEle, point.ele);
    if (reference === null) {
      reference = point.ele;
    } else if (Math.abs(point.ele - reference) >= ASCENT_THRESHOLD_M) {
      if (point.ele > reference) {
        ascent += point.ele - reference;
      }
      reference = point.ele;
    }
  });

  const times = points.flatMap((point) =>
    point.time === null ? [] : [point.time],
  );
  const hasEle = maxEle !== null;
  return {
    ascentM: hasEle ? Math.round(ascent) : null,
    distanceKm: distance,
    durationMs: times.length > 1 ? times[times.length - 1] - times[0] : null,
    maxEleM: hasEle ? Math.round(maxEle as number) : null,
  };
}

// Profil altimetrique reduit a ~200 points: assez fin pour le graphique,
// assez leger pour ne pas ralentir le rendu sur une trace de 10 000 points.
export function elevationProfile(points: TrackPoint[], samples = 200) {
  const profile: ProfilePoint[] = [];
  let distance = 0;
  const every = Math.max(1, Math.floor(points.length / samples));
  points.forEach((point, index) => {
    if (index > 0) {
      distance += distanceKm(points[index - 1].position, point.position);
    }
    if (
      point.ele !== null &&
      (index % every === 0 || index === points.length - 1)
    ) {
      profile.push({
        distanceKm: Math.round(distance * 10) / 10,
        eleM: Math.round(point.ele),
      });
    }
  });
  return profile;
}

// Rampe d'altitude a paliers vifs: un melange direct bleu -> ambre passerait
// par un gris-violet terne a mi-hauteur.
// Le bleu accent est reserve aux trajets: la rampe des randonnees commence au
// sarcelle pour que les deux types de trace ne se confondent pas.
const ELEVATION_RAMP = [
  [14, 159, 154], // sarcelle: fond de vallee
  [224, 138, 30], // ambre
  [217, 72, 15], // orange brule: cretes
];

function mix(ratio: number) {
  const scaled = Math.min(1, Math.max(0, ratio)) * (ELEVATION_RAMP.length - 1);
  const index = Math.min(ELEVATION_RAMP.length - 2, Math.floor(scaled));
  const local = scaled - index;
  const [from, to] = [ELEVATION_RAMP[index], ELEVATION_RAMP[index + 1]];
  const channel = (c: number) =>
    Math.round(from[c] + (to[c] - from[c]) * local);
  return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`;
}

// Decoupe une trace en petits troncons colores selon l'altitude, a la maniere
// des cartes de chaleur Strava: sarcelle en fond de vallee, orange sur les cretes.
export function elevationSegments(
  tracks: GpxTrack[],
  chunkSize = 8,
): GeoJSON.FeatureCollection<GeoJSON.LineString> {
  const elevations = tracks.flatMap((track) =>
    track.points.flatMap((point) => (point.ele === null ? [] : [point.ele])),
  );
  const min = elevations.length ? Math.min(...elevations) : 0;
  const max = elevations.length ? Math.max(...elevations) : 0;
  const range = max - min || 1;

  const features = tracks.flatMap((track) => {
    const chunks: GeoJSON.Feature<GeoJSON.LineString>[] = [];
    for (let start = 0; start < track.points.length - 1; start += chunkSize) {
      const slice = track.points.slice(start, start + chunkSize + 1);
      const sliceEle = slice.flatMap((point) =>
        point.ele === null ? [] : [point.ele],
      );
      const meanEle = sliceEle.length
        ? sliceEle.reduce((sum, ele) => sum + ele, 0) / sliceEle.length
        : min;
      chunks.push({
        type: "Feature",
        properties: {
          color: elevations.length
            ? mix((meanEle - min) / range)
            : "rgb(14, 159, 154)",
        },
        geometry: {
          type: "LineString",
          coordinates: slice.map((point) => point.position),
        },
      });
    }
    return chunks;
  });
  return { type: "FeatureCollection", features };
}

export function formatDuration(durationMs: number) {
  const totalMinutes = Math.round(durationMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours
    ? `${hours} h ${String(minutes).padStart(2, "0")}`
    : `${minutes} min`;
}

export type StageDistance = { exact: boolean; km: number } | null;

// Distance de route d'une etape: celle des trajets GPS quand il y en a
// (exacte), sinon celle du trace reconstitue, qui sous-estime la route reelle
// (virages, cols) et reste donc presentee comme approchee. Les randonnees ne
// comptent pas: elles s'ajoutent a l'etape sans en etre le deplacement.
export function stageDistance(
  stage: TripStage,
  stageIndex: number,
  tracks: GpxTrack[],
): StageDistance {
  const drives = tracks.filter(
    (track) => track.stageIndex === stageIndex && track.kind === "trajet",
  );
  if (drives.length > 0) {
    return {
      exact: true,
      km: drives.reduce(
        (sum, track) => sum + trackStats(track.points).distanceKm,
        0,
      ),
    };
  }
  if (stage.route.length < 2) {
    return null;
  }
  return { exact: false, km: routeLengthKm(stage.route) };
}

export function formatDistance(distance: StageDistance) {
  if (distance === null) {
    return "Base";
  }
  return distance.exact
    ? `${Math.round(distance.km).toLocaleString("fr-FR")} km`
    : `≈ ${(Math.round(distance.km / 10) * 10).toLocaleString("fr-FR")} km`;
}

export function tripDistance(stages: TripStage[], tracks: GpxTrack[]) {
  const distances = stages.map((stage, index) =>
    stageDistance(stage, index, tracks),
  );
  return formatDistance({
    exact: distances.every((distance) => distance === null || distance.exact),
    km: distances.reduce((sum, distance) => sum + (distance?.km ?? 0), 0),
  });
}
