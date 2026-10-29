// Catalogue des voyages affiches sur le globe d'accueil.
//
// Chaque voyage declare ses vols: l'aeroport de depart change d'un voyage a
// l'autre, et un retour depuis une autre ville se declare comme un second vol.
// Coordonnees en [longitude, latitude].
import type { LngLat } from "./ecosse-2026-data";

export type Airport = {
  city: string;
  code: string;
  position: LngLat;
};

export type Flight = { from: Airport; to: Airport };

export type TripStatus = "realise" | "a-venir";

export type TripSummary = {
  country: string;
  dates: string;
  description: string;
  flights: Flight[];
  href: string;
  id: string;
  status: TripStatus;
  stubLabel: string;
  title: string;
};

export const airports = {
  CDG: { city: "Paris", code: "CDG", position: [2.5479, 49.0097] },
  EDI: { city: "Édimbourg", code: "EDI", position: [-3.3725, 55.95] },
  KEF: { city: "Keflavík", code: "KEF", position: [-22.6056, 63.985] },
} satisfies Record<string, Airport>;

export const trips: TripSummary[] = [
  {
    country: "Écosse",
    dates: "19—27 octobre 2026",
    description:
      "Neuf jours d’automne d’Édimbourg à l’île de Skye, à revivre sur une carte 3D interactive.",
    // Aeroport de depart a confirmer.
    flights: [{ from: airports.CDG, to: airports.EDI }],
    href: "/voyage/ecosse-2026",
    id: "ecosse-2026",
    status: "realise",
    stubLabel: "SCO / 2026",
    title: "Écosse — Boucle des Highlands",
  },
  {
    country: "Islande",
    dates: "12—19 septembre 2026",
    description:
      "Huit jours entre Reykjavík, le Cercle d’Or, la côte sud et les lagunes glaciaires.",
    flights: [{ from: airports.CDG, to: airports.KEF }],
    href: "/voyage/islande-2026",
    id: "islande-2026",
    status: "a-venir",
    stubLabel: "ISL / 2026",
    title: "Islande — Route du Sud",
  },
];
