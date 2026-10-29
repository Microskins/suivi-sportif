// Contrat de l'API Voyage (`/api/voyages`), tel que le serveur le renvoie.
// Coordonnees en [longitude, latitude].

export type LngLat = [number, number];

export type TrackKind = "trajet" | "randonnee";

export type TripStatus = "realise" | "a-venir";

export type Airport = {
  city: string;
  code: string;
  coordinates: LngLat;
  name: string;
};

export type TravelMode = "avion" | "voiture";

// Un trajet du voyage (un arc du globe): un vol, ou un trajet en voiture.
export type Flight = { from: Airport; mode: TravelMode; to: Airport };

export type TripTrackFile = {
  id: string;
  kind: TrackKind;
  name: string;
  url: string;
};

export type TripPhoto = {
  alt: string;
  caption: string;
  id: string;
  url: string;
};

export type TripStage = {
  code: string;
  coordinates: LngLat;
  dateLabel: string;
  dayLabel: string;
  detail: string;
  highlights: string[];
  id: string;
  photos: TripPhoto[];
  // Trace reconstitue pour ARRIVER a cette etape depuis la precedente.
  route: LngLat[];
  title: string;
  tracks: TripTrackFile[];
};

export type TripSummary = {
  country: string;
  description: string;
  endDate: string | null;
  flights: Flight[];
  id: string;
  published: boolean;
  slug: string;
  startDate: string | null;
  status: TripStatus;
  stubLabel: string;
  title: string;
};

export type TripDetail = TripSummary & { stages: TripStage[] };

export const tripHref = (slug: string) => `/voyage/${slug}`;
