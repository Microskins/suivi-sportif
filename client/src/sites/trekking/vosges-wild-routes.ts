import type { TrekRoute } from "./route-maps";

export type TrekRouteContent = TrekRoute & {
  stats: Array<[string, string]>;
  stages: Array<{
    day: string;
    detail: string;
    difficulty: string;
    distance: string;
    duration: string;
    elevation: string;
    points: string[];
    title: string;
  }>;
};

const MAP_LEGEND = [
  { label: "Jour 1", lineClass: "bg-[#0f9d58]" },
  { label: "Jour 2", lineClass: "bg-[#9334e6]" },
  { label: "Jour 3", lineClass: "bg-[#1a73e8]" },
];

export const TREK_ROUTES: TrekRouteContent[] = [
  {
    id: "trace-01",
    label: "GR5 - Lac Blanc au Grand Ballon",
    accentClass: "bg-[#0f9d58]",
    mapUrl:
      "https://www.google.com/maps/d/embed?mid=1RgMdZ-flBR0RCBd3crgFZPnPmIPzSjk&ehbc=2E312F",
    externalUrl:
      "https://www.google.com/maps/d/u/0/viewer?mid=1RgMdZ-flBR0RCBd3crgFZPnPmIPzSjk",
    summary:
      "Une traversee de trois jours sur le GR5, du Lac Blanc au Grand Ballon, par les cretes, le Hohneck et les sommets du massif.",
    stats: [
      ["40,8 km", "distance totale"],
      ["1 311 m", "denivele positif"],
      ["14 a 16 h", "marche estimee"],
      ["Modere a soutenu", "difficulte"],
    ],
    mapLegend: MAP_LEGEND,
    stages: [
      {
        day: "01",
        title: "Lac Blanc - Hohneck - Trois Fours",
        distance: "13,6 km",
        elevation: "+436 m / -354 m",
        duration: "4 h 30 a 5 h",
        difficulty: "Modere",
        detail:
          "Mise en jambe sur les cretes, avec le Hohneck comme point majeur avant la nuit vers Trois Fours.",
        points: [
          "Parking du Lac Blanc",
          "Belvedere du Lac Blanc",
          "Gazon du Faing",
          "Tanet",
          "Panorama des Hautes-Vosges",
          "Sommet du Hohneck",
          "Refuge des Trois Fours",
        ],
      },
      {
        day: "02",
        title: "Trois Fours - Schiessrothried - Rainkopf - Kastelberg",
        distance: "13,6 km",
        elevation: "+386 m / -430 m",
        duration: "4 h 30 a 5 h",
        difficulty: "Modere",
        detail:
          "Etape entre refuges, lacs et sources. Confirmer le secteur de nuit selon la reglementation.",
        points: [
          "Refuge des Trois Fours",
          "Fontaine des Trois Fours",
          "Wormspel",
          "Lac de Schiessrothried",
          "Source de Ferschmuss",
          "Rainkopf",
          "Kastelberg",
          "Secteur refuge ou bivouac autorise",
        ],
      },
      {
        day: "03",
        title: "Rainkopf - Rothenbachkopf - Grand Ballon",
        distance: "13,6 km",
        elevation: "+489 m / -272 m",
        duration: "5 h a 5 h 30",
        difficulty: "Soutenu",
        detail:
          "Derniere journee de cretes jusqu'au Grand Ballon, avec un passage expose au vent.",
        points: [
          "Rainkopf",
          "Rothenbachkopf",
          "Panorama des cretes",
          "Passage expose au vent",
          "Grand Ballon",
          "Parking du Grand Ballon",
        ],
      },
    ],
  },
  {
    id: "trace-02",
    label: "Boucle Hohneck et des Lacs",
    accentClass: "bg-[#9334e6]",
    mapUrl:
      "https://www.google.com/maps/d/embed?mid=1vvAnoS9xjo8CzyP8p5Et5jnmojIRMe0&ehbc=2E312F",
    externalUrl:
      "https://www.google.com/maps/d/u/0/viewer?mid=1vvAnoS9xjo8CzyP8p5Et5jnmojIRMe0",
    summary:
      "Une boucle de trois jours autour du Hohneck, des lacs glaciaires et des cretes, avec retour au point de depart.",
    stats: [
      ["36 km", "distance totale"],
      ["1 019 m", "denivele positif"],
      ["12 a 14 h", "marche estimee"],
      ["Modere a soutenu", "difficulte"],
    ],
    mapLegend: MAP_LEGEND,
    stages: [
      {
        day: "01",
        title: "Col de la Schlucht - Hohneck - Schiessrothried",
        distance: "12 km",
        elevation: "+385 m / -351 m",
        duration: "4 h a 4 h 30",
        difficulty: "Modere",
        detail:
          "Du col vers le Hohneck puis le lac de Schiessrothried, avec un premier secteur de nuit a confirmer.",
        points: [
          "Parking du Col de la Schlucht",
          "Hohneck",
          "Wormspel",
          "Lac de Schiessrothried",
          "Refuge ou secteur de nuit",
        ],
      },
      {
        day: "02",
        title: "Schiessrothried - Rainkopf - Kastelberg - Blanchemer",
        distance: "12 km",
        elevation: "+283 m / -283 m",
        duration: "4 h a 4 h 30",
        difficulty: "Modere",
        detail:
          "Une etape de liaison entre source, sommets et lac de Blanchemer.",
        points: [
          "Depart du refuge",
          "Source de Ferschmuss",
          "Rainkopf",
          "Kastelberg",
          "Lac de Blanchemer",
          "Abri ou secteur de nuit",
        ],
      },
      {
        day: "03",
        title: "Blanchemer - Tanet - Gazon du Faing - Retour",
        distance: "12 km",
        elevation: "+351 m / -385 m",
        duration: "4 h a 5 h",
        difficulty: "Soutenu",
        detail:
          "Retour par le Tanet et le Gazon du Faing jusqu'au parking de depart.",
        points: [
          "Depart",
          "Tanet",
          "Gazon du Faing",
          "Belvedere du Lac Blanc",
          "Parking de depart",
        ],
      },
    ],
  },
];
