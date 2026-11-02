// Photo d'un repas. Envoyee des qu'elle est choisie: le serveur la garde et
// rend la position GPS de la prise de vue (si le telephone l'a notee), qui
// place directement le repas sur la carte.
import { useId, useState } from "react";
import type { AuthErrorHandler } from "./admin-api";
import { adminApi, adminErrorMessage } from "./admin-api";
import type { MealDraft } from "./admin-form";
import { buttonClass, inputClass, labelClass } from "./admin-ui";
import { apiFileUrl } from "./voyage-api";

const PHOTO_MAX = 15 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "done"; gps: boolean }
  | { kind: "error"; message: string };

const previewUrl = (url: string) =>
  url.startsWith("blob:") ? url : apiFileUrl(url);

export function AdminMealPhoto({
  disabled,
  meal,
  mealLabel,
  onAuthError,
  onChange,
}: {
  disabled: boolean;
  meal: MealDraft;
  mealLabel: string;
  onAuthError: AuthErrorHandler;
  onChange: (patch: Partial<MealDraft>) => void;
}) {
  const id = useId();
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function send(file: File) {
    if (!PHOTO_TYPES.includes(file.type)) {
      setStatus({
        kind: "error",
        message: "Format accepté : JPEG, PNG ou WebP.",
      });
      return;
    }
    if (file.size > PHOTO_MAX) {
      setStatus({
        kind: "error",
        message: "Photo trop volumineuse (15 Mo maximum).",
      });
      return;
    }
    setStatus({ kind: "loading" });
    try {
      const result = await adminApi.uploadMealPhoto(file);
      // Apercu local: la photo d'un voyage non publie n'est pas servie.
      const preview =
        typeof URL.createObjectURL === "function"
          ? URL.createObjectURL(file)
          : result.photoUrl;
      onChange({
        photo: result.photo,
        photoUrl: preview,
        ...(result.coordinates
          ? {
              lng: String(result.coordinates[0]),
              lat: String(result.coordinates[1]),
            }
          : {}),
      });
      setStatus({ kind: "done", gps: Boolean(result.coordinates) });
    } catch (failure) {
      if (onAuthError(failure)) {
        setStatus({ kind: "idle" });
        return;
      }
      setStatus({ kind: "error", message: adminErrorMessage(failure) });
    }
  }

  return (
    <div className="sm:col-span-2">
      <label htmlFor={`${id}-photo`} className={labelClass}>
        Photo du repas (facultatif)
      </label>
      <div className="mt-1.5 flex flex-wrap items-start gap-3">
        {meal.photoUrl && (
          <img
            src={previewUrl(meal.photoUrl)}
            alt={`Photo — ${mealLabel}`}
            className="h-20 w-28 rounded-[8px] border border-[#dfe4ea] object-cover"
          />
        )}
        <div className="grid min-w-0 flex-1 gap-2">
          <input
            id={`${id}-photo`}
            type="file"
            accept={PHOTO_TYPES.join(",")}
            disabled={disabled || status.kind === "loading"}
            aria-describedby={`${id}-etat`}
            className={`${inputClass} !mt-0 file:mr-3 file:rounded-full file:border-0 file:bg-[#eef1f4] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-[#0f1b2b]`}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void send(file);
            }}
          />
          {meal.photo && (
            <button
              type="button"
              className={`${buttonClass.smallDanger} justify-self-start`}
              disabled={disabled}
              aria-label={`Retirer la photo de ${mealLabel}`}
              onClick={() => {
                onChange({ photo: null, photoUrl: null });
                setStatus({ kind: "idle" });
              }}
            >
              Retirer la photo
            </button>
          )}
        </div>
      </div>
      <p id={`${id}-etat`} role="status" className="mt-1 text-xs leading-5">
        {status.kind === "loading" ? (
          <span className="text-[var(--site-muted)]">Envoi de la photo…</span>
        ) : status.kind === "error" ? (
          <span className="text-[#b42318]">{status.message}</span>
        ) : status.kind === "done" ? (
          status.gps ? (
            <span className="text-[#0f1b2b]">
              ✓ Point GPS repris de la photo.
            </span>
          ) : (
            <span className="text-[#0f1b2b]">
              Photo ajoutée, sans position GPS : cherchez l’adresse du lieu
              ci-dessous.
            </span>
          )
        ) : (
          <span className="text-[var(--site-muted)]">
            Une photo prise avec la localisation du téléphone place le repas sur
            la carte toute seule.
          </span>
        )}
      </p>
    </div>
  );
}
