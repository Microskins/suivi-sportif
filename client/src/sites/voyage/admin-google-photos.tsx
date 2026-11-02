// Bouton "Importer depuis Google Photos" d'une etape. Masque tant que l'API
// n'a pas de cle client OAuth (GOOGLE_PHOTOS_CLIENT_ID).
import { useEffect, useRef, useState } from "react";
import type { AuthErrorHandler } from "./admin-api";
import { adminApi, adminErrorMessage } from "./admin-api";
import { ErrorAlert, buttonClass } from "./admin-ui";
import {
  GooglePhotosCancelled,
  createPickerSession,
  loadGoogleClientId,
  pickerUrl,
  prepareTokenRequester,
  waitForSelection,
} from "./google-photos";
import type { TripPhoto } from "./trip-types";

type Step =
  | { kind: "idle" }
  | { kind: "connecting" }
  | { kind: "picking"; url: string }
  | { kind: "importing" };

type Props = {
  // Rend le texte alternatif et la legende saisis, ou null s'ils ne sont pas
  // valides (le formulaire affiche alors lui-meme l'erreur).
  readMetadata: () => { alt: string; caption: string } | null;
  disabled: boolean;
  onAuthError: AuthErrorHandler;
  onImported: (photos: TripPhoto[]) => void;
  stageId: string;
};

const isCancel = (error: unknown) =>
  error instanceof GooglePhotosCancelled ||
  (error instanceof DOMException && error.name === "AbortError");

export function GooglePhotosImport({
  disabled,
  onAuthError,
  onImported,
  readMetadata,
  stageId,
}: Props) {
  const [requester, setRequester] = useState<Awaited<
    ReturnType<typeof prepareTokenRequester>
  > | null>(null);
  const [step, setStep] = useState<Step>({ kind: "idle" });
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let active = true;
    loadGoogleClientId()
      .then((clientId) => (clientId ? prepareTokenRequester(clientId) : null))
      .then((ready) => {
        if (active) setRequester(ready);
      })
      .catch(() => {
        // Script Google bloque ou indisponible: pas d'import propose.
      });
    return () => {
      active = false;
      abortRef.current?.abort();
    };
  }, []);

  if (!requester) return null;

  async function start() {
    if (!requester) return;
    setError(null);
    setNotice(null);
    const metadata = readMetadata();
    if (!metadata) return;
    // Un seul onglet peut s'ouvrir par clic. Deja connecte: on ouvre tout de
    // suite l'onglet Google Photos (plus tard, il serait bloque). Sinon le
    // clic sert a la fenetre de connexion Google, et le lien "Ouvrir Google
    // Photos" prend le relais si l'onglet est bloque.
    let tab = requester.hasToken()
      ? window.open("about:blank", "_blank")
      : null;
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      setStep({ kind: "connecting" });
      const token = await requester.request();
      const session = await createPickerSession(token);
      const url = pickerUrl(session);
      if (tab && !tab.closed) {
        tab.opener = null;
        tab.location.href = url;
      } else {
        tab = window.open(url, "_blank");
      }
      setStep({ kind: "picking", url });
      await waitForSelection(token, session, controller.signal);
      setStep({ kind: "importing" });
      const result = await adminApi.importGooglePhotos(stageId, {
        accessToken: token,
        sessionId: session.id,
        ...metadata,
      });
      onImported(result.photos);
      const count = result.photos.length;
      setNotice(
        `${count} photo${count > 1 ? "s" : ""} importée${count > 1 ? "s" : ""}` +
          (result.skipped > 0
            ? ` (${result.skipped} ignorée${result.skipped > 1 ? "s" : ""} : format ou taille non pris en charge).`
            : "."),
      );
    } catch (failure) {
      // Onglet ouvert d'avance mais jamais dirige vers Google Photos.
      if (tab && !tab.closed && step.kind !== "picking") tab.close();
      if (isCancel(failure)) return;
      if (onAuthError(failure)) return;
      setError(adminErrorMessage(failure));
    } finally {
      abortRef.current = null;
      setStep({ kind: "idle" });
    }
  }

  const busy = step.kind !== "idle";
  const label = {
    idle: "Importer depuis Google Photos",
    connecting: "Connexion à Google…",
    picking: "Sélection en cours dans Google Photos…",
    importing: "Import des photos…",
  }[step.kind];

  return (
    <div className="grid gap-2 border-t border-dashed border-[#dfe4ea] pt-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={buttonClass.secondary}
          disabled={disabled || busy}
          onClick={start}
        >
          {label}
        </button>
        {step.kind === "picking" && (
          <>
            <a
              href={step.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline underline-offset-2"
            >
              Ouvrir Google Photos
            </a>
            <button
              type="button"
              className={buttonClass.small}
              onClick={() => abortRef.current?.abort()}
            >
              Annuler
            </button>
          </>
        )}
      </div>
      <p className="text-xs leading-5 text-[var(--site-muted)]">
        Le texte alternatif et la légende ci-dessus s’appliquent à chaque photo
        choisie (numérotée si plusieurs), 30 photos maximum.
      </p>
      {notice && (
        <p role="status" className="text-sm text-[#0f1b2b]">
          {notice}
        </p>
      )}
      <ErrorAlert>{error}</ErrorAlert>
    </div>
  );
}
