// Photo d'une etape dans l'admin: apercu, album qui la range et photo de
// reference de cet album (couverture, et bulle de la randonnee liee).
import type { TripAlbum, TripPhoto, TripTrackFile } from "./trip-types";
import { buttonClass, inputClass, labelClass } from "./admin-ui";
import { apiFileUrl } from "./voyage-api";

export const hikesOf = (tracks: TripTrackFile[]) =>
  tracks.filter((track) => track.kind === "randonnee");

// Nom d'album suivi de sa randonnee liee: le lien se voit partout.
export function albumLabel(album: TripAlbum, tracks: TripTrackFile[]) {
  const hike = tracks.find((track) => track.id === album.trackId);
  return hike ? `${album.name} — randonnée ${hike.name}` : album.name;
}

// Choix d'album: aucun, ou un album de l'etape.
export function AlbumSelect({
  albums,
  disabled,
  label,
  onChange,
  tracks,
  value,
}: {
  albums: TripAlbum[];
  disabled: boolean;
  label: string;
  onChange: (albumId: string | null) => void;
  tracks: TripTrackFile[];
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
        <option value="">Aucun album</option>
        {albums.map((album) => (
          <option key={album.id} value={album.id}>
            {albumLabel(album, tracks)}
          </option>
        ))}
      </select>
    </label>
  );
}

export function AdminPhotoCard({
  albums,
  disabled,
  isCover,
  onAlbumChange,
  onCover,
  onRemove,
  photo,
  tracks,
}: {
  albums: TripAlbum[];
  disabled: boolean;
  // Reference effective de son album (explicite, ou premiere photo).
  isCover: boolean;
  onAlbumChange: (albumId: string | null) => void;
  onCover: () => void;
  onRemove: () => void;
  photo: TripPhoto;
  tracks: TripTrackFile[];
}) {
  const album = albums.find((item) => item.id === photo.albumId);
  return (
    <li className="overflow-hidden rounded-[8px] border border-[#dfe4ea] bg-white">
      <div className="relative">
        <img
          src={apiFileUrl(photo.url)}
          alt={photo.alt}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover"
        />
        {album && isCover && (
          <span className="site-label absolute left-1.5 top-1.5 rounded-full bg-[#0f1b2b] px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.08em] text-white">
            ★ Référence
          </span>
        )}
      </div>
      <div className="grid gap-2 p-2">
        {photo.caption && (
          <p className="text-xs leading-5 text-[var(--site-muted)]">
            {photo.caption}
          </p>
        )}
        {albums.length > 0 && (
          <AlbumSelect
            label="Album"
            albums={albums}
            tracks={tracks}
            value={album ? album.id : null}
            disabled={disabled}
            onChange={onAlbumChange}
          />
        )}
        {album && !isCover && (
          <button
            type="button"
            className={buttonClass.small}
            disabled={disabled}
            aria-label={`Faire de ${photo.alt} la photo de référence de l’album ${album.name}`}
            onClick={onCover}
          >
            ★ Photo de référence
          </button>
        )}
        <button
          type="button"
          className={buttonClass.smallDanger}
          disabled={disabled}
          aria-label={`Supprimer la photo ${photo.alt}`}
          onClick={onRemove}
        >
          Supprimer
        </button>
      </div>
    </li>
  );
}

// Remplace une photo enregistree; une seule reference par album, les autres
// photos de l'album la perdent.
export function withSavedPhoto(photos: TripPhoto[], saved: TripPhoto) {
  return photos.map((item) =>
    item.id === saved.id
      ? saved
      : saved.albumCover && item.albumId === saved.albumId
        ? { ...item, albumCover: false }
        : item,
  );
}

// Reference effective de chaque album (explicite, sinon premiere photo).
export function coverIdsOf(albums: TripAlbum[], photos: TripPhoto[]) {
  return new Set(
    albums.flatMap((album) => {
      const inAlbum = photos.filter((photo) => photo.albumId === album.id);
      const cover = inAlbum.find((photo) => photo.albumCover) ?? inAlbum[0];
      return cover ? [cover.id] : [];
    }),
  );
}
