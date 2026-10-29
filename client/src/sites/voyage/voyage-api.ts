// Acces a l'API Voyage. Client propre au site Voyage: les sites ne partagent
// pas de code (voir check:site-boundaries).
import type { TripDetail, TripSummary } from "./trip-types";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export class VoyageApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "VoyageApiError";
  }
}

// Les URL de fichiers renvoyees par l'API sont relatives a l'API.
export const apiFileUrl = (url: string) =>
  url.startsWith("http") ? url : `${API_URL}${url}`;

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}/api/voyages${path}`, init);
  if (response.status === 204) {
    return undefined as T;
  }
  const body = (await response.json().catch(() => null)) as {
    code?: string;
    data?: T;
    error?: string;
  } | null;
  if (!response.ok || !body) {
    throw new VoyageApiError(
      body?.error ?? `Erreur ${response.status}`,
      response.status,
      body?.code,
    );
  }
  return body.data as T;
}

export const fetchTrips = () => apiRequest<TripSummary[]>("");

export const fetchTrip = (slug: string) =>
  apiRequest<TripDetail>(`/${encodeURIComponent(slug)}`);
