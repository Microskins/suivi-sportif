// Client de l'API d'administration du site Voyage (`/api/voyages/admin`).
// Le jeton vit en sessionStorage: il reste propre a l'onglet et disparait a
// sa fermeture.
import type {
  Airport,
  LngLat,
  TrackKind,
  TripDetail,
  TripPhoto,
  TripSummary,
  TripTrackFile,
} from "./trip-types";
import { API_URL, VoyageApiError } from "./voyage-api";

const TOKEN_KEY = "voyage-admin-token";
const ADMIN_PATH = `${API_URL}/api/voyages/admin`;

// Renvoie true quand l'erreur tient a la session (401, 403 admin): l'ecran
// courant n'a alors rien a afficher, l'ecran d'admin prend le relais.
export type AuthErrorHandler = (error: unknown) => boolean;

export type ApiIssue = {
  code?: string;
  maximum?: number;
  message: string;
  minimum?: number;
  path: (string | number)[];
  type?: string;
};

export class AdminApiError extends VoyageApiError {
  constructor(
    message: string,
    status: number,
    code?: string,
    readonly details?: unknown,
  ) {
    super(message, status, code);
    this.name = "AdminApiError";
  }
}

export function readToken(): string | null {
  try {
    return window.sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function storeToken(token: string | null) {
  try {
    if (token) window.sessionStorage.setItem(TOKEN_KEY, token);
    else window.sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // Stockage indisponible (navigation privee stricte): la session ne
    // survivra pas a un rechargement, sans autre consequence.
  }
}

type ApiBody<T> = {
  code?: string;
  data?: T;
  details?: unknown;
  error?: string;
} | null;

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;
  const body = (await response.json().catch(() => null)) as ApiBody<T>;
  if (!response.ok || !body) {
    throw new AdminApiError(
      body?.error ?? `Erreur ${response.status}`,
      response.status,
      body?.code,
      body?.details,
    );
  }
  return body.data as T;
}

// POST /api/users/login: hors du prefixe /api/voyages, d'ou un appel dedie.
export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await parseResponse<{ token: string; user: { email: string } }>(
    response,
  );
  storeToken(data.token);
  return data;
}

type RequestOptions = {
  body?: BodyInit;
  contentType?: string;
  method?: string;
};

async function adminRequest<T>(
  path: string,
  { body, contentType, method = "GET" }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  const token = readToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (contentType) headers["Content-Type"] = contentType;
  const response = await fetch(`${ADMIN_PATH}${path}`, {
    method,
    headers,
    body,
  });
  return parseResponse<T>(response);
}

const json = (method: string, payload: unknown): RequestOptions => ({
  method,
  contentType: "application/json",
  body: JSON.stringify(payload),
});

export type StagePayload = {
  code: string;
  coordinates: LngLat;
  dateLabel: string;
  dayLabel: string;
  detail: string;
  highlights: string[];
  id?: string;
  route: LngLat[];
  title: string;
};

export type TripPayload = {
  country: string;
  description: string;
  endDate: string | null;
  flights: { fromCode: string; toCode: string }[];
  published: boolean;
  slug: string;
  stages: StagePayload[];
  startDate: string | null;
  stubLabel: string;
  title: string;
};

export type AirportPayload = {
  city: string;
  code: string;
  latitude: number;
  longitude: number;
  name: string;
};

export const adminApi = {
  listTrips: () => adminRequest<TripSummary[]>("/trips"),
  getTrip: (id: string) =>
    adminRequest<TripDetail>(`/trips/${encodeURIComponent(id)}`),
  createTrip: (payload: TripPayload) =>
    adminRequest<TripDetail>("/trips", json("POST", payload)),
  updateTrip: (id: string, payload: TripPayload) =>
    adminRequest<TripDetail>(
      `/trips/${encodeURIComponent(id)}`,
      json("PUT", payload),
    ),
  deleteTrip: (id: string) =>
    adminRequest<void>(`/trips/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
  listAirports: () => adminRequest<Airport[]>("/airports"),
  saveAirport: (payload: AirportPayload) =>
    adminRequest<Airport>("/airports", json("PUT", payload)),
  uploadTrack: (stageId: string, kind: TrackKind, name: string, file: File) =>
    adminRequest<TripTrackFile>(
      `/stages/${encodeURIComponent(stageId)}/tracks?${new URLSearchParams({
        kind,
        name,
      })}`,
      { method: "POST", contentType: "application/gpx+xml", body: file },
    ),
  uploadPhoto: (stageId: string, alt: string, caption: string, file: File) =>
    adminRequest<TripPhoto>(
      `/stages/${encodeURIComponent(stageId)}/photos?${new URLSearchParams({
        alt,
        caption,
      })}`,
      { method: "POST", contentType: file.type, body: file },
    ),
  deleteTrack: (id: string) =>
    adminRequest<void>(`/tracks/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
  deletePhoto: (id: string) =>
    adminRequest<void>(`/photos/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
};

// Messages en francais pour les codes connus; le serveur repond parfois en
// anglais ou sans accents.
export function adminErrorMessage(error: unknown): string {
  if (!(error instanceof VoyageApiError)) {
    return "L’API ne répond pas. Vérifiez votre connexion puis réessayez.";
  }
  switch (error.code) {
    case "INVALID_CREDENTIALS":
      return "E-mail ou mot de passe incorrect.";
    case "VOYAGE_ADMIN_REQUIRED":
      return "Ce compte n’a pas accès à l’administration du site Voyage.";
    case "TRIP_SLUG_TAKEN":
      return "Ce slug est déjà utilisé par un autre voyage.";
    case "AIRPORT_NOT_FOUND":
      return error.message.replace(/^Aeroport inconnu/, "Aéroport inconnu");
    case "VALIDATION_ERROR":
      return "Certains champs sont invalides : corrigez-les puis réessayez.";
    case "UPLOAD_TOO_LARGE":
      return "Fichier trop volumineux.";
    case "UPLOAD_TYPE_NOT_ALLOWED":
      return "Type de fichier non accepté.";
    case "TRIP_NOT_FOUND":
      return "Ce voyage n’existe plus.";
    case "STAGE_NOT_FOUND":
      return "Cette étape n’existe plus : rechargez le voyage.";
  }
  if (error.status === 401) return "Session expirée : reconnectez-vous.";
  if (error.status === 413) return "Fichier trop volumineux.";
  if (error.status === 429) {
    return "Trop de requêtes : patientez un instant puis réessayez.";
  }
  return error.message;
}

// Issues zod renvoyees avec VALIDATION_ERROR, indexees par chemin
// ("stages.2.code", "flights.0.fromCode"...).
export function fieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof AdminApiError) || !Array.isArray(error.details)) {
    return {};
  }
  const errors: Record<string, string> = {};
  for (const issue of error.details as ApiIssue[]) {
    if (!Array.isArray(issue?.path)) continue;
    // Une coordonnee [lng, lat] se rattache au champ longitude ou latitude.
    const [root, index, field, axis] = issue.path;
    const path =
      field === "coordinates"
        ? `${root}.${index}.${axis === 1 ? "lat" : "lng"}`
        : issue.path.join(".");
    errors[path] ??= issueMessage(issue);
  }
  return errors;
}

// Zod repond en anglais pour ses controles generiques: on les traduit, et on
// garde les messages personnalises du serveur (deja en francais).
function issueMessage(issue: ApiIssue): string {
  const list = issue.type === "array";
  if (issue.type === "number" && issue.code === "too_small") {
    return `Valeur minimale : ${issue.minimum}.`;
  }
  if (issue.type === "number" && issue.code === "too_big") {
    return `Valeur maximale : ${issue.maximum}.`;
  }
  if (issue.code === "too_small") {
    if (issue.minimum === 1) {
      return list ? "Au moins un élément est requis." : "Champ obligatoire.";
    }
    return list
      ? `Au moins ${issue.minimum} éléments.`
      : `Au moins ${issue.minimum} caractères.`;
  }
  if (issue.code === "too_big") {
    return list
      ? `Au plus ${issue.maximum} éléments.`
      : `Au plus ${issue.maximum} caractères.`;
  }
  if (issue.code === "invalid_type") return "Valeur invalide.";
  return issue.message;
}
