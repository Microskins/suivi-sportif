// Traces GPX et photos d'une etape deja enregistree. Les envois partent
// aussitot: ils ne dependent pas du bouton "Enregistrer le voyage".
import type { FormEvent, RefObject } from "react";
import { useRef, useState } from "react";
import type { AuthErrorHandler } from "./admin-api";
import { GooglePhotosImport } from "./admin-google-photos";
import {
  AdminPhotoCard,
  AlbumSelect,
  coverIdsOf,
  withSavedPhoto,
} from "./admin-photo-card";
import { adminApi, adminErrorMessage } from "./admin-api";
import {
  ErrorAlert,
  SelectField,
  TextField,
  buttonClass,
  inputClass,
  labelClass,
} from "./admin-ui";
import type {
  TrackKind,
  TripAlbum,
  TripPhoto,
  TripTrackFile,
} from "./trip-types";
import { apiFileUrl } from "./voyage-api";

const MB = 1024 * 1024;
const GPX_MAX = 10 * MB;
const PHOTO_MAX = 15 * MB;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type StageFiles = {
  albums: TripAlbum[];
  photos: TripPhoto[];
  tracks: TripTrackFile[];
};

type StageFilesProps = StageFiles & {
  onAuthError: AuthErrorHandler;
  onChange: (files: StageFiles) => void;
  stageId: string;
  stageLabel: string;
};

const sectionTitle =
  "site-label text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#0f1b2b]";

export function AdminStageFiles(props: StageFilesProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <TracksBlock {...props} />
      <PhotosBlock {...props} />
    </div>
  );
}

function useUpload(onAuthError: AuthErrorHandler) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function run(task: () => Promise<void>) {
    setPending(true);
    setError(null);
    try {
      await task();
    } catch (failure) {
      if (!onAuthError(failure)) setError(adminErrorMessage(failure));
    } finally {
      setPending(false);
    }
  }
  return { pending, error, setError, run };
}

function FileInput({
  accept,
  inputRef,
  label,
  disabled,
}: {
  accept: string;
  disabled: boolean;
  inputRef: RefObject<HTMLInputElement>;
  label: string;
}) {
  return (
    <label className={labelClass}>
      {label}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        required
        disabled={disabled}
        className={`${inputClass} file:mr-3 file:rounded-full file:border-0 file:bg-[#eef1f4] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-[#0f1b2b]`}
      />
    </label>
  );
}

function TracksBlock({
  albums,
  onAuthError,
  onChange,
  photos,
  stageId,
  stageLabel,
  tracks,
}: StageFilesProps) {
  const upload = useUpload(onAuthError);
  const fileRef = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<TrackKind>("randonnee");
  const [name, setName] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return upload.setError("Choisissez un fichier GPX.");
    if (file.size > GPX_MAX)
      return upload.setError("GPX trop volumineux (10 Mo maximum).");
    const trackName = name.trim() || file.name.replace(/\.gpx$/i, "");
    await upload.run(async () => {
      const track = await adminApi.uploadTrack(stageId, kind, trackName, file);
      onChange({ albums, photos, tracks: [...tracks, track] });
      setName("");
      if (fileRef.current) fileRef.current.value = "";
    });
  }

  async function remove(track: TripTrackFile) {
    if (!window.confirm(`Supprimer la trace « ${track.name} » ?`)) return;
    await upload.run(async () => {
      await adminApi.deleteTrack(track.id);
      // Le serveur garde les albums lies a la trace, sans lien.
      onChange({
        albums: albums.map((album) =>
          album.trackId === track.id ? { ...album, trackId: null } : album,
        ),
        photos,
        tracks: tracks.filter((item) => item.id !== track.id),
      });
    });
  }

  return (
    <section aria-label={`Traces GPX — ${stageLabel}`}>
      <h4 className={sectionTitle}>Traces GPX ({tracks.length})</h4>
      {tracks.length > 0 && (
        <ul className="mt-3 grid gap-2">
          {tracks.map((track) => (
            <li
              key={track.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-[8px] border border-[#dfe4ea] px-3 py-2 text-sm"
            >
              <span>
                <span className="site-label mr-2 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-[#1c4ed8]">
                  {track.kind === "trajet" ? "Trajet" : "Randonnée"}
                </span>
                <a
                  href={apiFileUrl(track.url)}
                  className="underline-offset-2 hover:underline"
                >
                  {track.name}
                </a>
              </span>
              <button
                type="button"
                className={buttonClass.smallDanger}
                disabled={upload.pending}
                aria-label={`Supprimer la trace ${track.name}`}
                onClick={() => remove(track)}
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      )}
      <form
        className="mt-3 grid gap-3"
        onSubmit={submit}
        aria-label={`Envoyer un GPX — ${stageLabel}`}
      >
        <SelectField
          label="Type de trace"
          value={kind}
          disabled={upload.pending}
          onChange={(event) => setKind(event.target.value as TrackKind)}
        >
          <option value="randonnee">Randonnée</option>
          <option value="trajet">Trajet</option>
        </SelectField>
        <TextField
          label="Nom de la trace"
          hint="Facultatif : le nom du fichier sert par défaut."
          value={name}
          maxLength={120}
          disabled={upload.pending}
          onChange={(event) => setName(event.target.value)}
        />
        <FileInput
          label="Fichier GPX (10 Mo max)"
          accept=".gpx,application/gpx+xml"
          inputRef={fileRef}
          disabled={upload.pending}
        />
        <ErrorAlert>{upload.error}</ErrorAlert>
        <button
          type="submit"
          className={`${buttonClass.secondary} justify-self-start`}
          disabled={upload.pending}
        >
          {upload.pending ? "Envoi…" : "Envoyer le GPX"}
        </button>
      </form>
    </section>
  );
}

function PhotosBlock({
  albums,
  onAuthError,
  onChange,
  photos,
  stageId,
  stageLabel,
  tracks,
}: StageFilesProps) {
  const upload = useUpload(onAuthError);
  const fileRef = useRef<HTMLInputElement>(null);
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [altError, setAltError] = useState<string | undefined>();
  const latestFiles = useRef<StageFiles>({ albums, photos, tracks });
  latestFiles.current = { albums, photos, tracks };
  const [albumChoice, setAlbumChoice] = useState<string | null>(null);
  // Album choisi pour les prochains envois (oublie s'il disparait).
  const uploadAlbumId = albums.some((album) => album.id === albumChoice)
    ? albumChoice
    : null;
  const coverIds = coverIdsOf(albums, photos);

  function checkAlt() {
    setAltError(
      alt.trim() ? undefined : "Décrivez la photo pour les lecteurs d’écran.",
    );
    if (!alt.trim()) upload.setError("Le texte alternatif est obligatoire.");
    else upload.setError(null);
    return Boolean(alt.trim());
  }

  async function update(
    photo: TripPhoto,
    changes: { albumCover?: boolean; albumId?: string | null },
  ) {
    await upload.run(async () => {
      const saved = await adminApi.updatePhoto(photo.id, changes);
      onChange({ albums, tracks, photos: withSavedPhoto(photos, saved) });
    });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!checkAlt()) return;
    if (!file) return upload.setError("Choisissez une photo.");
    if (!PHOTO_TYPES.includes(file.type))
      return upload.setError("Format accepté : JPEG, PNG ou WebP.");
    if (file.size > PHOTO_MAX)
      return upload.setError("Photo trop volumineuse (15 Mo maximum).");
    await upload.run(async () => {
      const photo = await adminApi.uploadPhoto(
        stageId,
        alt.trim(),
        caption.trim(),
        file,
        uploadAlbumId,
      );
      onChange({ albums, tracks, photos: [...photos, photo] });
      setAlt("");
      setCaption("");
      if (fileRef.current) fileRef.current.value = "";
    });
  }

  async function remove(photo: TripPhoto) {
    if (!window.confirm(`Supprimer la photo « ${photo.alt} » ?`)) return;
    await upload.run(async () => {
      await adminApi.deletePhoto(photo.id);
      onChange({
        albums,
        tracks,
        photos: photos.filter((item) => item.id !== photo.id),
      });
    });
  }

  return (
    <section aria-label={`Photos — ${stageLabel}`}>
      <h4 className={sectionTitle}>Photos ({photos.length})</h4>
      {photos.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {photos.map((photo) => (
            <AdminPhotoCard
              key={photo.id}
              photo={photo}
              albums={albums}
              tracks={tracks}
              isCover={coverIds.has(photo.id)}
              disabled={upload.pending}
              onAlbumChange={(albumId) => update(photo, { albumId })}
              onCover={() => update(photo, { albumCover: true })}
              onRemove={() => remove(photo)}
            />
          ))}
        </ul>
      )}
      <form
        className="mt-3 grid gap-3"
        onSubmit={submit}
        aria-label={`Envoyer une photo — ${stageLabel}`}
      >
        <FileInput
          label="Photo (JPEG, PNG ou WebP, 15 Mo max)"
          accept={PHOTO_TYPES.join(",")}
          inputRef={fileRef}
          disabled={upload.pending}
        />
        <TextField
          label="Texte alternatif"
          hint="Obligatoire : ce que montre la photo."
          required
          value={alt}
          maxLength={200}
          error={altError}
          disabled={upload.pending}
          onChange={(event) => setAlt(event.target.value)}
        />
        <TextField
          label="Légende"
          value={caption}
          maxLength={200}
          disabled={upload.pending}
          onChange={(event) => setCaption(event.target.value)}
        />
        {albums.length > 0 && (
          <AlbumSelect
            label="Ranger dans l’album"
            albums={albums}
            tracks={tracks}
            value={uploadAlbumId}
            disabled={upload.pending}
            onChange={setAlbumChoice}
          />
        )}
        <ErrorAlert>{upload.error}</ErrorAlert>
        <button
          type="submit"
          className={`${buttonClass.secondary} justify-self-start`}
          disabled={upload.pending}
        >
          {upload.pending ? "Envoi…" : "Envoyer la photo"}
        </button>
        <GooglePhotosImport
          disabled={upload.pending}
          onAuthError={onAuthError}
          hint="Le texte alternatif et la légende ci-dessus s’appliquent à chaque photo choisie (numérotée si plusieurs), 30 photos maximum."
          prepare={checkAlt}
          importSelection={async (selection) => {
            const result = await adminApi.importGooglePhotos(stageId, {
              ...selection,
              alt: alt.trim(),
              caption: caption.trim(),
              ...(uploadAlbumId ? { albumId: uploadAlbumId } : {}),
            });
            // L'import a pu durer: on repart des fichiers les plus recents.
            const current = latestFiles.current;
            onChange({
              ...current,
              photos: [...current.photos, ...result.photos],
            });
            setAlt("");
            setCaption("");
            const count = result.photos.length;
            const plural = count > 1 ? "s" : "";
            const skipped =
              result.skipped > 0
                ? ` (${result.skipped} ignorée${result.skipped > 1 ? "s" : ""} : format ou taille non pris en charge).`
                : ".";
            return `${count} photo${plural} importée${plural}${skipped}`;
          }}
        />
      </form>
    </section>
  );
}
