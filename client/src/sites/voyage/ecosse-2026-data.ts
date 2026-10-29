// Donnees du carnet Ecosse (19-27 octobre 2026).
//
// Tout le carnet - carte, statistiques, feuille de route et galerie - est
// derive de ce fichier: corriger une etape, son trace ou ses photos ici suffit
// a mettre toute la page a jour. Les coordonnees sont en [longitude, latitude].
//
// Photos: deposer les fichiers dans `client/public/sites/voyage/ecosse-2026/`
// puis les referencer dans `photos` avec un chemin `/sites/voyage/ecosse-2026/...`.
//
// Traces GPS: deposer les GPX (export Strava: activite > ... > "Exporter le
// GPX") dans `client/public/sites/voyage/ecosse-2026/traces/` puis les
// referencer dans `gpx`. Un GPX "trajet" remplace le trace reconstitue de
// l'etape; un GPX "activite" (randonnee, course...) s'y ajoute.

export type LngLat = [number, number];

export type TrackKind = "trajet" | "activite";

export type TripTrackFile = {
  kind: TrackKind;
  src: string;
};

export type TripPhoto = {
  alt: string;
  caption: string;
  src: string;
};

export type TripStage = {
  code: string;
  date: string;
  day: string;
  detail: string;
  gpx: TripTrackFile[];
  highlights: string[];
  id: string;
  photos: TripPhoto[];
  place: string;
  position: LngLat;
  // Trace routier parcouru pour ARRIVER a cette etape depuis la precedente.
  // Vide pour le point de depart.
  route: LngLat[];
  title: string;
};

export const ECOSSE_PATH = "/voyage/ecosse-2026";

export const ecosseStages: TripStage[] = [
  {
    code: "EDI",
    date: "19—20 oct.",
    day: "J01—02",
    detail:
      "Arrivée à Édimbourg, Royal Mile, château puis lever de soleil sur Arthur’s Seat.",
    gpx: [],
    highlights: ["Royal Mile", "Château d’Édimbourg", "Arthur’s Seat"],
    id: "edimbourg",
    photos: [],
    place: "Édimbourg",
    position: [-3.1883, 55.9533],
    route: [],
    title: "Édimbourg, la vieille ville",
  },
  {
    code: "GLC",
    date: "21 oct.",
    day: "J03",
    detail:
      "Château de Stirling, rives du Loch Lomond puis traversée de Rannoch Moor jusqu’à Glencoe.",
    gpx: [],
    highlights: ["Stirling", "Loch Lomond", "Buachaille Etive Mòr"],
    id: "glencoe",
    photos: [],
    place: "Glencoe",
    position: [-5.1023, 56.6826],
    route: [
      [-3.1883, 55.9533],
      [-3.42, 55.97],
      [-3.78, 56.03],
      [-3.9469, 56.1238],
      [-4.25, 56.08],
      [-4.55, 56.04],
      [-4.638, 56.1013],
      [-4.7, 56.22],
      [-4.71, 56.33],
      [-4.69, 56.4],
      [-4.73, 56.5],
      [-4.82, 56.58],
      [-4.9, 56.645],
      [-5.0, 56.67],
      [-5.1023, 56.6826],
    ],
    title: "Stirling, Loch Lomond et Glencoe",
  },
  {
    code: "SKY",
    date: "22 oct.",
    day: "J04",
    detail:
      "Fort William, viaduc de Glenfinnan, Road to the Isles puis ferry de Mallaig vers Skye.",
    gpx: [],
    highlights: ["Glenfinnan", "Mallaig — Armadale", "Portree"],
    id: "portree",
    photos: [],
    place: "Portree",
    position: [-6.1964, 57.4125],
    route: [
      [-5.1023, 56.6826],
      [-5.12, 56.74],
      [-5.1052, 56.8198],
      [-5.25, 56.85],
      [-5.4316, 56.8763],
      [-5.6, 56.89],
      [-5.75, 56.92],
      [-5.83, 57.0],
      [-5.8297, 57.0057],
      [-5.9, 57.06],
      [-5.94, 57.11],
      [-5.89, 57.17],
      [-5.97, 57.21],
      [-6.0, 57.27],
      [-6.12, 57.32],
      [-6.1964, 57.4125],
    ],
    title: "Road to the Isles jusqu’à Skye",
  },
  {
    code: "QRG",
    date: "23 oct.",
    day: "J05",
    detail:
      "Boucle du Trotternish : Old Man of Storr à l’aube, Kilt Rock et les falaises du Quiraing.",
    gpx: [],
    highlights: ["Old Man of Storr", "Kilt Rock", "Quiraing"],
    id: "quiraing",
    photos: [],
    place: "Quiraing",
    position: [-6.265, 57.644],
    route: [
      [-6.1964, 57.4125],
      [-6.17, 57.47],
      [-6.183, 57.5072],
      [-6.16, 57.58],
      [-6.16, 57.61],
      [-6.21, 57.64],
      [-6.265, 57.644],
    ],
    title: "Trotternish, de Storr au Quiraing",
  },
  {
    code: "NST",
    date: "24 oct.",
    day: "J06",
    detail:
      "Ouest de l’île : phare de Neist Point, Fairy Pools au pied des Cuillin et distillerie Talisker.",
    gpx: [],
    highlights: ["Neist Point", "Fairy Pools", "Talisker"],
    id: "neist-point",
    photos: [],
    place: "Neist Point",
    position: [-6.788, 57.4233],
    route: [
      [-6.265, 57.644],
      [-6.33, 57.6],
      [-6.38, 57.52],
      [-6.42, 57.47],
      [-6.58, 57.45],
      [-6.7, 57.44],
      [-6.788, 57.4233],
    ],
    title: "Neist Point et Fairy Pools",
  },
  {
    code: "INV",
    date: "25 oct.",
    day: "J07",
    detail:
      "Retour sur le continent par Eilean Donan, puis la rive du Loch Ness et le château d’Urquhart.",
    gpx: [],
    highlights: ["Eilean Donan", "Urquhart Castle", "Inverness"],
    id: "inverness",
    photos: [],
    place: "Inverness",
    position: [-4.2247, 57.4778],
    route: [
      [-6.788, 57.4233],
      [-6.58, 57.45],
      [-6.42, 57.42],
      [-6.3, 57.36],
      [-6.12, 57.32],
      [-5.97, 57.27],
      [-5.727, 57.2736],
      [-5.6, 57.28],
      [-5.5161, 57.274],
      [-5.3, 57.2],
      [-5.0, 57.14],
      [-4.82, 57.16],
      [-4.68, 57.15],
      [-4.55, 57.25],
      [-4.4419, 57.3242],
      [-4.33, 57.4],
      [-4.2247, 57.4778],
    ],
    title: "Eilean Donan et Loch Ness",
  },
  {
    code: "EDI",
    date: "26—27 oct.",
    day: "J08—09",
    detail:
      "Descente par les Cairngorms et Pitlochry, dernière soirée à Édimbourg avant le vol retour.",
    gpx: [],
    highlights: ["Cairngorms", "Pitlochry", "Forth Bridges"],
    id: "retour-edimbourg",
    photos: [],
    place: "Édimbourg",
    position: [-3.1883, 55.9533],
    route: [
      [-4.2247, 57.4778],
      [-4.05, 57.35],
      [-3.825, 57.195],
      [-4.05, 56.98],
      [-3.95, 56.84],
      [-3.7295, 56.7046],
      [-3.55, 56.55],
      [-3.43, 56.4],
      [-3.42, 56.2],
      [-3.39, 56.0],
      [-3.1883, 55.9533],
    ],
    title: "Cairngorms et retour à Édimbourg",
  },
];

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

// Le trace polyligne simplifie sous-estime la route reelle (virages, cols):
// la distance affichee est arrondie a la dizaine et presentee comme approchee.
export function stageDistanceLabel(stage: TripStage) {
  if (stage.route.length < 2) {
    return "Base";
  }
  return `≈ ${Math.round(routeLengthKm(stage.route) / 10) * 10} km`;
}

export const ecosseFullRoute: LngLat[] = ecosseStages.flatMap((stage, index) =>
  index === 0 ? [stage.position] : stage.route.slice(1),
);

export const ecosseTotalKm =
  Math.round(routeLengthKm(ecosseFullRoute) / 10) * 10;
