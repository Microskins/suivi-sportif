// Section « Albums photo » d'une etape: plusieurs albums, chacun avec un
// nom, une randonnee liee (facultative) et une photo de reference. Une
// randonnee liee affiche l'album dans sa fiche du carnet, et la photo de
// reference en bulle a son depart sur la carte. Les modifications partent
// tout de suite, sans attendre l'enregistrement du voyage.
import type { FormEvent, ReactNode } from "react";
import { useRef, useState } from "react";
import { AdminAlbumUpload } from "./admin-album-upload";
import type { AuthErrorHandler } from "./admin-api";
import { adminApi, adminErrorMessage } from "./admin-api";
import { hikesOf } from "./admin-photo-card";
import { AdminPhotoGrid } from "./admin-photo-grid";
import type { StageFiles } from "./admin-stage-files";
import {
  ErrorAlert,
  TextField,
  buttonClass,
  inputClass,
  labelClass,
} from "./admin-ui";
import type { TripAlbum, TripPhoto, TripTrackFile } from "./trip-types";
import { albumPhotos } from "./trip-types";
import { apiFileUrl } from "./voyage-api";

type Props = StageFiles & {
  onAuthError: AuthErrorHandler;
  onChange: (files: StageFiles) => void;
  stageId: string;
  stageLabel: string;
};

function HikeSelect({
  disabled,
  hikes,
  label,
  onChange,
  value,
}: {
  disabled: boolean;
  hikes: TripTrackFile[];
  label: string;
  onChange: (trackId: string | null) => void;
  value: string | null;
}) {
  return (
    <label className={labelClass}>
      {label}
      <select
        className={inputClass}
        value={value ?? ""}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value || null)}
      >
        <option value="">Aucune randonnée</option>
        {hikes.map((hike) => (
          <option key={hike.id} value={hike.id}>
            {hike.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export function AdminStageAlbums({
  albums,
  onAuthError,
  onChange,
  photos,
  stageId,
  stageLabel,
  tracks,
}: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [trackId, setTrackId] = useState<string | null>(null);
  const hikes = hikesOf(tracks);
  // Un envoi peut durer: on ajoute aux fichiers les plus recents.
  const latest = useRef<StageFiles>({ albums, photos, tracks });
  latest.current = { albums, photos, tracks };
  const albumIds = new Set(albums.map((album) => album.id));
  const loosePhotos = photos.filter(
    (photo) => !photo.albumId || !albumIds.has(photo.albumId),
  );

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

  async function create(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return setError("Donnez un nom à l’album.");
    await run(async () => {
      const album = await adminApi.createAlbum(stageId, {
        name: name.trim(),
        trackId,
      });
      onChange({ albums: [...albums, album], photos, tracks });
      setName("");
      setTrackId(null);
    });
  }

  const replace = (saved: TripAlbum) =>
    onChange({
      albums: albums.map((album) => (album.id === saved.id ? saved : album)),
      photos,
      tracks,
    });

  async function remove(album: TripAlbum) {
    if (
      !window.confirm(
        `Supprimer l’album « ${album.name} » ? Ses photos restent dans l’étape.`,
      )
    )
      return;
    await run(async () => {
      await adminApi.deleteAlbum(album.id);
      onChange({
        albums: albums.filter((item) => item.id !== album.id),
        photos: photos.map((photo) =>
          photo.albumId === album.id
            ? { ...photo, albumId: null, albumCover: false }
            : photo,
        ),
        tracks,
      });
    });
  }

  return (
    <div className="grid gap-4">
      {albums.length === 0 ? (
        <p className="text-sm text-[var(--site-muted)]">
          Aucun album pour l’instant : créez-en un ci-dessous, puis ajoutez-y
          vos photos.
        </p>
      ) : (
        <ul className="grid gap-3">
          {albums.map((album) => (
            <AlbumCard
              key={album.id}
              album={album}
              disabled={pending}
              hikes={hikes}
              photos={albumPhotos(photos, album.id)}
              onRename={(newName) =>
                run(async () =>
                  replace(
                    await adminApi.updateAlbum(album.id, { name: newName }),
                  ),
                )
              }
              onLink={(newTrackId) =>
                run(async () =>
                  replace(
                    await adminApi.updateAlbum(album.id, {
                      trackId: newTrackId,
                    }),
                  ),
                )
              }
              grid={
                <AdminPhotoGrid
                  shown={albumPhotos(photos, album.id)}
                  files={() => latest.current}
                  disabled={pending}
                  onAuthError={onAuthError}
                  onChange={onChange}
                />
              }
              onRemove={() => remove(album)}
              upload={
                <AdminAlbumUpload
                  album={album}
                  stageId={stageId}
                  disabled={pending}
                  onAuthError={onAuthError}
                  onAdded={(added: TripPhoto[]) =>
                    onChange({
                      ...latest.current,
                      photos: [...latest.current.photos, ...added],
                    })
                  }
                />
              }
            />
          ))}
        </ul>
      )}

      {loosePhotos.length > 0 && (
        <section
          aria-label={`Photos hors album — ${stageLabel}`}
          className="grid gap-2 rounded-[8px] border border-[#dfe4ea] bg-white p-3"
        >
          <p className={labelClass}>Photos hors album ({loosePhotos.length})</p>
          <p className="text-xs leading-5 text-[var(--site-muted)]">
            Photos envoyées avant les albums : rangez-les dans un album avec
            leur menu « Album », ou supprimez-les.
          </p>
          <AdminPhotoGrid
            shown={loosePhotos}
            files={() => latest.current}
            disabled={pending}
            onAuthError={onAuthError}
            onChange={onChange}
          />
        </section>
      )}

      <form
        onSubmit={create}
        aria-label={`Nouvel album — ${stageLabel}`}
        className="grid gap-3 rounded-[8px] border border-dashed border-[#b9c6d3] bg-white/70 p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <TextField
          label="Nom du nouvel album"
          value={name}
          maxLength={80}
          disabled={pending}
          onChange={(event) => setName(event.target.value)}
        />
        <HikeSelect
          label="Randonnée liée (facultatif)"
          hikes={hikes}
          value={trackId}
          disabled={pending || hikes.length === 0}
          onChange={setTrackId}
        />
        <button
          type="submit"
          className={buttonClass.secondary}
          disabled={pending}
        >
          + Créer l’album
        </button>
        {hikes.length === 0 && (
          <p className="text-xs leading-5 text-[var(--site-muted)] sm:col-span-3">
            Pour lier un album à une randonnée, envoyez d’abord son GPX (type «
            Randonnée ») dans la section « Traces GPX ».
          </p>
        )}
      </form>
      <ErrorAlert>{error}</ErrorAlert>
    </div>
  );
}

function AlbumCard({
  album,
  grid,
  upload,
  disabled,
  hikes,
  onLink,
  onRemove,
  onRename,
  photos,
}: {
  album: TripAlbum;
  disabled: boolean;
  hikes: TripTrackFile[];
  // Photos de l'album et leurs actions (reference, album, suppression).
  grid: ReactNode;
  onLink: (trackId: string | null) => void;
  onRemove: () => void;
  onRename: (name: string) => void;
  photos: ReturnType<typeof albumPhotos>;
  // Bloc « Ajouter des photos a l'album ».
  upload: ReactNode;
}) {
  const [draftName, setDraftName] = useState(album.name);
  const hike = hikes.find((item) => item.id === album.trackId);
  const cover = photos[0];
  const renamed = draftName.trim() && draftName.trim() !== album.name;

  return (
    <li className="grid gap-3 rounded-[8px] border border-[#dfe4ea] bg-white p-3 sm:grid-cols-[9rem_1fr]">
      <figure className="grid content-start gap-1">
        {cover ? (
          <img
            src={apiFileUrl(cover.url)}
            alt={cover.alt}
            className="aspect-[4/3] w-full rounded-[6px] object-cover"
          />
        ) : (
          <div className="grid aspect-[4/3] place-items-center rounded-[6px] bg-[#eef2f6] text-xs text-[var(--site-muted)]">
            Aucune photo
          </div>
        )}
        <figcaption className="site-label text-[0.58rem] font-semibold uppercase tracking-[0.08em] text-[#0f1b2b]">
          ★ Photo de référence
        </figcaption>
      </figure>

      <div className="grid min-w-0 content-start gap-3">
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-0 flex-1">
            <TextField
              label="Nom de l’album"
              value={draftName}
              maxLength={80}
              disabled={disabled}
              onChange={(event) => setDraftName(event.target.value)}
            />
          </div>
          {renamed && (
            <button
              type="button"
              className={buttonClass.small}
              disabled={disabled}
              onClick={() => onRename(draftName.trim())}
            >
              Renommer
            </button>
          )}
        </div>

        <HikeSelect
          label="Randonnée liée"
          hikes={hikes}
          value={hike ? hike.id : null}
          disabled={disabled || hikes.length === 0}
          onChange={onLink}
        />
        {/* Le lien entre la photo de reference et la randonnee, en clair. */}
        <p className="rounded-[6px] bg-[#eef6f5] px-3 py-2 text-xs leading-5 text-[#0f3b38]">
          {hike
            ? cover
              ? `Sur la carte : bulle avec la photo de référence au départ de la randonnée « ${hike.name} ». Dans le carnet : diaporama dans sa fiche.`
              : `Lié à la randonnée « ${hike.name} » : ajoutez des photos pour afficher la bulle sur la carte.`
            : "Sans randonnée liée : l’album s’affiche en diaporama dans le panneau de l’étape, sans bulle sur la carte."}
        </p>

        {photos.length > 0 ? (
          <div>
            <p className={labelClass}>Photos ({photos.length})</p>
            <div className="mt-1.5">{grid}</div>
          </div>
        ) : (
          <p className="text-xs text-[var(--site-muted)]">
            Album vide : ajoutez des photos ci-dessous.
          </p>
        )}

        {upload}
        <button
          type="button"
          className={`${buttonClass.smallDanger} justify-self-start`}
          disabled={disabled}
          onClick={onRemove}
        >
          Supprimer l’album
        </button>
      </div>
    </li>
  );
}
