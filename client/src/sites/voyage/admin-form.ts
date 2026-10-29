// Modele du formulaire d'un voyage: tout est saisi en texte, puis converti
// en corps d'API au moment d'enregistrer.
import type { StagePayload, TripPayload } from "./admin-api";
import type {
  LngLat,
  TravelMode,
  TripDetail,
  TripPhoto,
  TripTrackFile,
} from "./trip-types";

export type StageDraft = {
  code: string;
  dateLabel: string;
  dayLabel: string;
  detail: string;
  highlights: string;
  // Absent tant que l'etape n'a pas ete enregistree.
  id?: string;
  // Cle locale stable pour React, y compris avant enregistrement.
  key: string;
  lat: string;
  lng: string;
  photos: TripPhoto[];
  // Trace reconstitue renvoye par l'API: conserve tel quel a l'enregistrement.
  route: LngLat[];
  title: string;
  tracks: TripTrackFile[];
};

export type FlightDraft = {
  fromCode: string;
  key: string;
  mode: TravelMode;
  toCode: string;
};

export type TripDraft = {
  country: string;
  description: string;
  endDate: string;
  flights: FlightDraft[];
  published: boolean;
  slug: string;
  stages: StageDraft[];
  startDate: string;
  stubLabel: string;
  title: string;
};

let nextKey = 0;
export const localKey = () => `local-${(nextKey += 1)}`;

export const emptyFlight = (): FlightDraft => ({
  fromCode: "",
  key: localKey(),
  mode: "avion",
  toCode: "",
});

export const emptyStage = (): StageDraft => ({
  code: "",
  dateLabel: "",
  dayLabel: "",
  detail: "",
  highlights: "",
  key: localKey(),
  lat: "",
  lng: "",
  photos: [],
  route: [],
  title: "",
  tracks: [],
});

export const emptyTrip = (): TripDraft => ({
  country: "",
  description: "",
  endDate: "",
  flights: [emptyFlight()],
  published: false,
  slug: "",
  stages: [],
  startDate: "",
  stubLabel: "",
  title: "",
});

export function tripToDraft(trip: TripDetail): TripDraft {
  return {
    country: trip.country,
    description: trip.description,
    endDate: trip.endDate ?? "",
    flights: trip.flights.map((flight) => ({
      fromCode: flight.from.code,
      key: localKey(),
      mode: flight.mode,
      toCode: flight.to.code,
    })),
    published: trip.published,
    slug: trip.slug,
    stages: trip.stages.map((stage) => ({
      code: stage.code,
      dateLabel: stage.dateLabel,
      dayLabel: stage.dayLabel,
      detail: stage.detail,
      highlights: stage.highlights.join(", "),
      id: stage.id,
      key: stage.id,
      lat: String(stage.coordinates[1]),
      lng: String(stage.coordinates[0]),
      photos: stage.photos,
      route: stage.route,
      title: stage.title,
      tracks: stage.tracks,
    })),
    startDate: trip.startDate ?? "",
    stubLabel: trip.stubLabel,
    title: trip.title,
  };
}

// Accepte la virgule decimale, frequente en saisie francaise.
const parseNumber = (value: string) => {
  const trimmed = value.trim().replace(",", ".");
  return trimmed === "" ? Number.NaN : Number(trimmed);
};

export const splitHighlights = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

function stageToPayload(stage: StageDraft): StagePayload {
  return {
    ...(stage.id ? { id: stage.id } : {}),
    code: stage.code.trim(),
    dayLabel: stage.dayLabel.trim(),
    dateLabel: stage.dateLabel.trim(),
    title: stage.title.trim(),
    detail: stage.detail.trim(),
    highlights: splitHighlights(stage.highlights),
    coordinates: [parseNumber(stage.lng), parseNumber(stage.lat)],
    route: stage.route,
  };
}

// Controles faits avant l'envoi: ceux que l'API ne saurait pas rattacher a
// un champ (un nombre illisible part en `null` dans le JSON).
export function localErrors(draft: TripDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  draft.stages.forEach((stage, index) => {
    const lng = parseNumber(stage.lng);
    const lat = parseNumber(stage.lat);
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
      errors[`stages.${index}.lng`] =
        "Longitude attendue entre -180 et 180 (ex. -3.19).";
    }
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      errors[`stages.${index}.lat`] =
        "Latitude attendue entre -90 et 90 (ex. 55.95).";
    }
  });
  return errors;
}

export function draftToPayload(draft: TripDraft): TripPayload {
  return {
    slug: draft.slug.trim(),
    title: draft.title.trim(),
    country: draft.country.trim(),
    description: draft.description.trim(),
    stubLabel: draft.stubLabel.trim(),
    startDate: draft.startDate || null,
    endDate: draft.endDate || null,
    published: draft.published,
    flights: draft.flights.map(({ fromCode, mode, toCode }) => ({
      fromCode,
      toCode,
      mode,
    })),
    stages: draft.stages.map(stageToPayload),
  };
}

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
