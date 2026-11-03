// Selection de photos dans Google Photos (API Google Photos Picker).
//
// Le navigateur obtient un jeton OAuth via Google Identity Services, cree une
// session de selection et ouvre Google Photos. Une fois la selection faite,
// le jeton et l'id de session partent a l'API du site, qui telecharge
// elle-meme les photos choisies (voir server/src/lib/google-photos.ts).
import { adminApi } from "./admin-api";

const GIS_SRC = "https://accounts.google.com/gsi/client";
const SCOPE =
  "https://www.googleapis.com/auth/photospicker.mediaitems.readonly";
const PICKER_API = "https://photospicker.googleapis.com/v1";

type TokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
  expires_in?: number;
};

type TokenClient = { requestAccessToken: () => void };

type GoogleAccounts = {
  accounts: {
    oauth2: {
      initTokenClient: (config: {
        callback: (response: TokenResponse) => void;
        client_id: string;
        error_callback?: (error: { type?: string }) => void;
        scope: string;
      }) => TokenClient;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleAccounts;
  }
}

export type PickerSession = {
  id: string;
  mediaItemsSet?: boolean;
  pickerUri: string;
  pollingConfig?: { pollInterval?: string; timeoutIn?: string };
};

export class GooglePhotosCancelled extends Error {
  constructor() {
    super("Import Google Photos annulé.");
    this.name = "GooglePhotosCancelled";
  }
}

// --- Configuration (cle client OAuth servie par l'API) -----------------

let clientIdPromise: Promise<string | null> | null = null;

// null si l'import n'est pas configure, ou si l'API ne repond pas: le bouton
// reste alors simplement masque.
export function loadGoogleClientId() {
  // Seule une cle obtenue est gardee: un echec sera retente au prochain ecran.
  clientIdPromise ??= adminApi
    .googlePhotosConfig()
    .then((config) => config?.clientId ?? null)
    .catch(() => null)
    .then((clientId) => {
      if (!clientId) clientIdPromise = null;
      return clientId;
    });
  return clientIdPromise;
}

// --- Jeton OAuth ---------------------------------------------------------

let gisPromise: Promise<GoogleAccounts> | null = null;

function loadGis() {
  if (window.google?.accounts) return Promise.resolve(window.google);
  gisPromise ??= new Promise<GoogleAccounts>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.onload = () =>
      window.google?.accounts
        ? resolve(window.google)
        : reject(new Error("Google Identity Services indisponible."));
    script.onerror = () => {
      gisPromise = null;
      script.remove();
      reject(new Error("Impossible de charger la connexion Google."));
    };
    document.head.appendChild(script);
  });
  return gisPromise;
}

type TokenRequester = {
  hasToken: () => boolean;
  request: () => Promise<string>;
};

let cachedToken: { expiresAt: number; value: string } | null = null;

// A appeler des l'affichage: le script Google est charge en avance pour que
// la fenetre de connexion s'ouvre dans le clic (sinon le navigateur la
// bloquerait comme popup non sollicitee).
export async function prepareTokenRequester(
  clientId: string,
): Promise<TokenRequester> {
  const google = await loadGis();
  let pending: {
    reject: (error: Error) => void;
    resolve: (token: string) => void;
  } | null = null;
  const client = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPE,
    callback: (response) => {
      const current = pending;
      pending = null;
      if (!current) return;
      if (!response.access_token) {
        current.reject(
          new Error(
            response.error === "access_denied"
              ? "Accès à Google Photos refusé."
              : "Connexion Google impossible.",
          ),
        );
        return;
      }
      cachedToken = {
        value: response.access_token,
        // Marge d'une minute avant l'expiration annoncee.
        expiresAt: Date.now() + ((response.expires_in ?? 3600) - 60) * 1000,
      };
      current.resolve(response.access_token);
    },
    error_callback: (error) => {
      const current = pending;
      pending = null;
      current?.reject(
        error.type === "popup_closed"
          ? new GooglePhotosCancelled()
          : new Error(
              "La fenêtre de connexion Google n’a pas pu s’ouvrir (popup bloquée ?).",
            ),
      );
    },
  });
  const hasToken = () =>
    cachedToken !== null && cachedToken.expiresAt > Date.now();
  return {
    hasToken,
    request: () => {
      if (cachedToken && hasToken()) {
        return Promise.resolve(cachedToken.value);
      }
      return new Promise<string>((resolve, reject) => {
        pending?.reject(new GooglePhotosCancelled());
        pending = { resolve, reject };
        client.requestAccessToken();
      });
    },
  };
}

export function forgetGoogleToken() {
  cachedToken = null;
}

// --- Session de selection -------------------------------------------------

async function pickerRequest<T>(
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${PICKER_API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...init.headers },
  });
  if (response.status === 401) forgetGoogleToken();
  if (!response.ok) {
    throw new Error(
      response.status === 401 || response.status === 403
        ? "Accès à Google Photos refusé ou expiré : réessayez."
        : "Google Photos ne répond pas.",
    );
  }
  return (await response.json()) as T;
}

// maxItems limite la selection dans Google Photos (ex. 1 pour un repas).
export function createPickerSession(token: string, maxItems?: number) {
  return pickerRequest<PickerSession>("/sessions", token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      maxItems ? { pickingConfig: { maxItemCount: String(maxItems) } } : {},
    ),
  });
}

// "5s", "1.5s", "1800s" -> millisecondes.
export function parseDuration(value: string | undefined, fallback: number) {
  const match = /^(\d+(?:\.\d+)?)s$/.exec(value ?? "");
  return match ? Number(match[1]) * 1000 : fallback;
}

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timer);
        reject(new GooglePhotosCancelled());
      },
      { once: true },
    );
  });
}

// Attend que l'utilisateur ait valide sa selection dans Google Photos.
export async function waitForSelection(
  token: string,
  session: PickerSession,
  signal: AbortSignal,
) {
  const interval = Math.max(
    1000,
    parseDuration(session.pollingConfig?.pollInterval, 5000),
  );
  const deadline =
    Date.now() + parseDuration(session.pollingConfig?.timeoutIn, 30 * 60_000);
  while (Date.now() < deadline) {
    await wait(interval, signal);
    const current = await pickerRequest<PickerSession>(
      `/sessions/${encodeURIComponent(session.id)}`,
      token,
      { signal },
    );
    if (current.mediaItemsSet) return;
  }
  throw new Error("Délai de sélection Google Photos dépassé.");
}

// "/autoclose" ferme l'onglet Google Photos une fois la selection validee.
export function pickerUrl(session: PickerSession) {
  return `${session.pickerUri.replace(/\/$/, "")}/autoclose`;
}
