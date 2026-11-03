// Ajout de photos directement dans un album: fichiers (plusieurs a la fois)
// ou import Google Photos. Le texte alternatif part du nom de l'album
// (modifiable) et est numerote quand plusieurs photos partent ensemble.
import { useRef, useState } from "react";
import type { AuthErrorHandler } from "./admin-api";
import { adminApi, adminErrorMessage } from "./admin-api";
import { GooglePhotosImport } from "./admin-google-photos";
import { ErrorAlert, TextField, buttonClass, labelClass } from "./admin-ui";
import type { TripAlbum, TripPhoto } from "./trip-types";

const PHOTO_MAX = 15 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function AdminAlbumUpload({
  album,
  disabled,
  onAdded,
  onAuthError,
  stageId,
}: {
  album: TripAlbum;
  disabled: boolean;
  onAdded: (photos: TripPhoto[]) => void;
  onAuthError: AuthErrorHandler;
  stageId: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [alt, setAlt] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  // Vide: le nom de l'album sert de texte alternatif.
  const baseAlt = (alt.trim() || album.name).slice(0, 180);

  async function send(files: File[]) {
    setError(null);
    setNotice(null);
    const rejected = files.filter(
      (file) => !PHOTO_TYPES.includes(file.type) || file.size > PHOTO_MAX,
    );
    const valid = files.filter((file) => !rejected.includes(file));
    if (valid.length === 0) {
      setError("Formats acceptés : JPEG, PNG ou WebP, 15 Mo maximum.");
      return;
    }
    setPending(true);
    const added: TripPhoto[] = [];
    try {
      // Une a une: l'ordre de la pellicule suit celui de la selection.
      for (const [index, file] of valid.entries()) {
        const photoAlt =
          valid.length > 1
            ? `${baseAlt} (${index + 1}/${valid.length})`
            : baseAlt;
        added.push(
          await adminApi.uploadPhoto(stageId, photoAlt, "", file, album.id),
        );
      }
    } catch (failure) {
      if (!onAuthError(failure)) setError(adminErrorMessage(failure));
    } finally {
      setPending(false);
      if (added.length) {
        onAdded(added);
        setAlt("");
        setNotice(
          `${added.length} photo${added.length > 1 ? "s" : ""} ajoutée${
            added.length > 1 ? "s" : ""
          } à l’album.` +
            (rejected.length
              ? ` ${rejected.length} ignorée${rejected.length > 1 ? "s" : ""} (format ou taille).`
              : ""),
        );
      }
    }
  }

  return (
    <div className="grid gap-3 rounded-[8px] border border-dashed border-[#b9c6d3] bg-[#fbfdfd] p-3">
      <p className={labelClass}>Ajouter des photos à l’album</p>
      <TextField
        label="Texte alternatif"
        hint={`Facultatif : « ${album.name} » par défaut, numéroté si plusieurs photos.`}
        value={alt}
        maxLength={180}
        disabled={disabled || pending}
        onChange={(event) => setAlt(event.target.value)}
      />
      <div className="flex flex-wrap items-center gap-2">
        {/* Un vrai bouton (focus clavier visible) ouvre le choix de fichiers. */}
        <button
          type="button"
          className={buttonClass.secondary}
          disabled={disabled || pending}
          onClick={() => fileRef.current?.click()}
        >
          {pending ? "Envoi…" : "Choisir des photos"}
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          hidden
          accept={PHOTO_TYPES.join(",")}
          aria-label={`Photos à ajouter à l’album ${album.name}`}
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            event.target.value = "";
            if (files.length) void send(files);
          }}
        />
        <span className="text-xs text-[var(--site-muted)]">
          JPEG, PNG ou WebP, 15 Mo max par photo.
        </span>
      </div>
      <GooglePhotosImport
        disabled={disabled || pending}
        onAuthError={onAuthError}
        importSelection={async (selection) => {
          const result = await adminApi.importGooglePhotos(stageId, {
            ...selection,
            alt: baseAlt,
            caption: "",
            albumId: album.id,
          });
          onAdded(result.photos);
          setAlt("");
          const count = result.photos.length;
          const plural = count > 1 ? "s" : "";
          return `${count} photo${plural} importée${plural} dans l’album${
            result.skipped
              ? ` (${result.skipped} ignorée${result.skipped > 1 ? "s" : ""})`
              : ""
          }.`;
        }}
      />
      {notice && (
        <p role="status" className="text-sm text-[#0f1b2b]">
          {notice}
        </p>
      )}
      <ErrorAlert>{error}</ErrorAlert>
    </div>
  );
}
