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
  // Album de randonnee: id de la trace de la meme etape, ou null.
  trackId?: string | null;
  // Photo de reference de l'album (bulle de la randonnee sur la carte).
  trackCover?: boolean;
  url: string;
};

// Album d'une randonnee: ses photos, la reference en premier (a defaut, la
// premiere photo rattachee).
export function trackAlbum(photos: TripPhoto[], trackId: string) {
  const album = photos.filter((photo) => photo.trackId === trackId);
  const cover = album.find((photo) => photo.trackCover) ?? album[0];
  return cover ? [cover, ...album.filter((photo) => photo !== cover)] : [];
}

// Un repas de l'etape (restaurant, pub...): un point de la carte.
export type TripMeal = {
  coordinates: LngLat;
  name: string;
  // Nom du fichier photo (rendu par l'envoi), et son adresse publique.
  photo: string | null;
  photoUrl: string | null;
  url: string | null;
};

export type TripStage = {
  code: string;
  coordinates: LngLat;
  dateLabel: string;
  dayLabel: string;
  detail: string;
  highlights: string[];
  id: string;
  // Logement de la nuit (souvent un lien Airbnb), ou null.
  lodgingUrl: string | null;
  // Repas de l'etape, facultatifs (tableau vide si aucun).
  meals: TripMeal[];
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

// Aller du voyage, pour le billet: depart du premier trajet, et arrivee au
// bout des trajets qui s'enchainent (chacun part la ou le precedent est
// arrive). Maison -> Charleroi -> Edimbourg donne Maison -> Edimbourg; un
// retour ajoute en trajet suivant (Inverness -> Charleroi) ne compte pas.
export function outboundJourney(flights: Flight[]): {
  from: Airport;
  to: Airport;
} {
  let to = flights[0].to;
  for (const flight of flights.slice(1)) {
    if (flight.from.code !== to.code) break;
    to = flight.to;
  }
  return { from: flights[0].from, to };
}
