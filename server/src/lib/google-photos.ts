// filepath: server/src/lib/google-photos.ts
// Import de photos depuis Google Photos (API Google Photos Picker).
//
// Le navigateur de l'admin obtient un jeton OAuth (portee
// photospicker.mediaitems.readonly), cree la session de selection et laisse
// l'utilisateur choisir ses photos dans Google Photos. Il transmet ensuite le
// jeton et l'id de session: c'est le serveur qui liste les elements choisis
// aupres de Google puis telecharge chaque image. Aucune URL fournie par le
// client n'est jamais telechargee, ce qui ferme la porte aux SSRF.
import { PHOTO_MAX_BYTES } from "./voyage-files.js";

const PICKER_API = "https://photospicker.googleapis.com/v1";
// Taille servie par Google (JPEG redimensionne, metadonnees retirees):
// suffisante pour un carnet, bien sous la limite de 15 Mo, et convertit les
// HEIC des telephones en un format que le site sait afficher.
const DOWNLOAD_SIZE = "=w2560-h2560";
const REQUEST_TIMEOUT_MS = 30_000;
export const GOOGLE_PHOTOS_MAX_ITEMS = 30;

export class GooglePhotosError extends Error {
  constructor(
    message: string,
    readonly code:
      | "GOOGLE_PHOTOS_UNAUTHORIZED"
      | "GOOGLE_PHOTOS_NOT_READY"
      | "GOOGLE_PHOTOS_EMPTY"
      | "GOOGLE_PHOTOS_TOO_MANY"
      | "GOOGLE_PHOTOS_UNAVAILABLE",
    readonly status: number,
  ) {
    super(message);
    this.name = "GooglePhotosError";
  }
}

export type PickedPhoto = { baseUrl: string; filename: string };

type PickerMediaItem = {
  type?: string;
  mediaFile?: { baseUrl?: string; filename?: string; mimeType?: string };
};

export function googlePhotosClientId() {
  return process.env.GOOGLE_PHOTOS_CLIENT_ID?.trim() || null;
}

// Les images d'une session Picker sont toujours servies par
// *.googleusercontent.com, en HTTPS. Garde-fou si Google repondait autre chose.
export function isGoogleContentUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "googleusercontent.com" ||
        url.hostname.endsWith(".googleusercontent.com"))
    );
  } catch {
    return false;
  }
}

async function googleFetch(
  url: string,
  accessToken: string,
  init?: { headers?: Record<string, string>; method?: string },
) {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: { Authorization: `Bearer ${accessToken}`, ...init?.headers },
      redirect: "follow",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new GooglePhotosError(
      "Google Photos ne repond pas",
      "GOOGLE_PHOTOS_UNAVAILABLE",
      502,
    );
  }
  if (response.status === 401 || response.status === 403) {
    throw new GooglePhotosError(
      "Acces Google Photos refuse ou expire: reconnectez-vous",
      "GOOGLE_PHOTOS_UNAUTHORIZED",
      401,
    );
  }
  return response;
}

// Elements choisis dans la session (photos seulement, videos ignorees).
export async function listPickedPhotos(
  accessToken: string,
  sessionId: string,
): Promise<PickedPhoto[]> {
  const session = await googleFetch(
    `${PICKER_API}/sessions/${encodeURIComponent(sessionId)}`,
    accessToken,
  );
  if (session.status === 404) {
    throw new GooglePhotosError(
      "Session Google Photos introuvable ou expiree",
      "GOOGLE_PHOTOS_NOT_READY",
      400,
    );
  }
  if (!session.ok) {
    throw new GooglePhotosError(
      "Google Photos ne repond pas",
      "GOOGLE_PHOTOS_UNAVAILABLE",
      502,
    );
  }
  const { mediaItemsSet } = (await session.json()) as {
    mediaItemsSet?: boolean;
  };
  if (!mediaItemsSet) {
    throw new GooglePhotosError(
      "La selection Google Photos n'est pas terminee",
      "GOOGLE_PHOTOS_NOT_READY",
      400,
    );
  }

  const photos: PickedPhoto[] = [];
  let pageToken: string | undefined;
  do {
    const query = new URLSearchParams({ sessionId, pageSize: "100" });
    if (pageToken) query.set("pageToken", pageToken);
    const response = await googleFetch(
      `${PICKER_API}/mediaItems?${query}`,
      accessToken,
    );
    if (!response.ok) {
      throw new GooglePhotosError(
        "Google Photos ne repond pas",
        "GOOGLE_PHOTOS_UNAVAILABLE",
        502,
      );
    }
    const body = (await response.json()) as {
      mediaItems?: PickerMediaItem[];
      nextPageToken?: string;
    };
    for (const item of body.mediaItems ?? []) {
      const baseUrl = item.mediaFile?.baseUrl;
      if (item.type === "VIDEO" || !baseUrl || !isGoogleContentUrl(baseUrl)) {
        continue;
      }
      photos.push({ baseUrl, filename: item.mediaFile?.filename ?? "" });
    }
    if (photos.length > GOOGLE_PHOTOS_MAX_ITEMS) {
      throw new GooglePhotosError(
        `${GOOGLE_PHOTOS_MAX_ITEMS} photos maximum par import`,
        "GOOGLE_PHOTOS_TOO_MANY",
        400,
      );
    }
    pageToken = body.nextPageToken || undefined;
  } while (pageToken);

  if (photos.length === 0) {
    throw new GooglePhotosError(
      "Aucune photo choisie dans Google Photos",
      "GOOGLE_PHOTOS_EMPTY",
      400,
    );
  }
  return photos;
}

// Telecharge une photo choisie; null si elle est indisponible ou trop lourde
// (elle est alors simplement ignoree par l'import).
export async function downloadPickedPhoto(
  accessToken: string,
  photo: PickedPhoto,
): Promise<Buffer | null> {
  const response = await googleFetch(
    `${photo.baseUrl}${DOWNLOAD_SIZE}`,
    accessToken,
    { headers: { Accept: "image/jpeg,image/png,image/webp" } },
  );
  if (!response.ok) return null;
  const announced = Number(response.headers.get("content-length"));
  if (announced > PHOTO_MAX_BYTES) return null;
  const buffer = Buffer.from(await response.arrayBuffer());
  return buffer.length > PHOTO_MAX_BYTES ? null : buffer;
}

// Liberation de la session cote Google, sans bloquer l'import en cas d'echec.
export async function deletePickerSession(
  accessToken: string,
  sessionId: string,
) {
  try {
    await googleFetch(
      `${PICKER_API}/sessions/${encodeURIComponent(sessionId)}`,
      accessToken,
      { method: "DELETE" },
    );
  } catch {
    // La session expire d'elle-meme cote Google.
  }
}
