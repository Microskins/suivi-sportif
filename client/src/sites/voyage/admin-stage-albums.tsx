// Section « Albums photo » d'une etape: plusieurs albums, chacun avec un
// nom, une randonnee liee (facultative) et une photo de reference. Une
// randonnee liee affiche l'album dans sa fiche du carnet, et la photo de
// reference en bulle a son depart sur la carte. Les modifications partent
// tout de suite, sans attendre l'enregistrement du voyage.
import type { FormEvent } from "react";
import { useState } from "react";
import type { AuthErrorHandler } from "./admin-api";
import { adminApi, adminErrorMessage } from "./admin-api";
import { coverIdsOf, hikesOf, withSavedPhoto } from "./admin-photo-card";
import type { StageFiles } from "./admin-stage-files";
import {
  ErrorAlert,
  TextField,
  buttonClass,
  inputClass,
  labelClass,
} from "./admin-ui";
import type { TripAlbum, TripTrackFile } from "./trip-types";
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
  const coverIds = coverIdsOf(albums, photos);

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
          Aucun album pour l’instant. Créez-en un ci-dessous, puis rangez-y des
          photos depuis la section « Traces GPX et photos ».
        </p>
      ) : (
        <ul className="grid gap-3">
          {albums.map((album) => (
            <AlbumCard
              key={album.id}
              album={album}
              coverIds={coverIds}
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
              onCover={(photoId) =>
                run(async () => {
                  const saved = await adminApi.updatePhoto(photoId, {
                    albumCover: true,
                  });
                  onChange({
                    albums,
                    photos: withSavedPhoto(photos, saved),
                    tracks,
                  });
                })
              }
              onRemove={() => remove(album)}
            />
          ))}
        </ul>
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
            Randonnée ») dans la section « Traces GPX et photos ».
          </p>
        )}
      </form>
      <ErrorAlert>{error}</ErrorAlert>
    </div>
  );
}

function AlbumCard({
  album,
  coverIds,
  disabled,
  hikes,
  onCover,
  onLink,
  onRemove,
  onRename,
  photos,
}: {
  album: TripAlbum;
  coverIds: Set<string>;
  disabled: boolean;
  hikes: TripTrackFile[];
  onCover: (photoId: string) => void;
  onLink: (trackId: string | null) => void;
  onRemove: () => void;
  onRename: (name: string) => void;
  photos: ReturnType<typeof albumPhotos>;
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
            <p className={labelClass}>
              Photos ({photos.length}) — cliquez pour choisir la référence
            </p>
            <ul className="mt-1.5 flex flex-wrap gap-2">
              {photos.map((photo) => {
                const isCover = coverIds.has(photo.id);
                return (
                  <li key={photo.id}>
                    <button
                      type="button"
                      disabled={disabled || isCover}
                      aria-pressed={isCover}
                      aria-label={
                        isCover
                          ? `${photo.alt} : photo de référence`
                          : `Faire de ${photo.alt} la photo de référence`
                      }
                      className={`block overflow-hidden rounded-[6px] border-2 ${
                        isCover
                          ? "border-[#0f766e]"
                          : "border-transparent hover:border-[#9aa4b1]"
                      }`}
                      onClick={() => onCover(photo.id)}
                    >
                      <img
                        src={apiFileUrl(photo.url)}
                        alt=""
                        className="h-14 w-20 object-cover"
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <p className="text-xs text-[var(--site-muted)]">
            Album vide : rangez-y des photos avec le menu « Album » de chaque
            photo, ou choisissez-le avant un envoi.
          </p>
        )}

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
