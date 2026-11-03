// Traces GPX d'une etape deja enregistree. Les envois partent aussitot: ils
// ne dependent pas du bouton "Enregistrer le voyage". Les photos s'ajoutent
// dans les albums (section « Albums photo », admin-stage-albums.tsx).
import type { FormEvent, RefObject } from "react";
import { useRef, useState } from "react";
import type { AuthErrorHandler } from "./admin-api";
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
    <div className="max-w-2xl">
      <TracksBlock {...props} />
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
