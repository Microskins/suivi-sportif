// Photo d'une etape dans l'admin: apercu, album de randonnee et photo de
// reference de cet album (la bulle de la randonnee sur la carte du carnet).
import type { TripPhoto, TripTrackFile } from "./trip-types";
import { buttonClass, inputClass, labelClass } from "./admin-ui";
import { apiFileUrl } from "./voyage-api";

export const hikesOf = (tracks: TripTrackFile[]) =>
  tracks.filter((track) => track.kind === "randonnee");

// Choix d'album: aucun, ou une randonnee de l'etape.
export function AlbumSelect({
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
        <option value="">Aucun album</option>
        {hikes.map((hike) => (
          <option key={hike.id} value={hike.id}>
            Randonnée — {hike.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export function AdminPhotoCard({
  disabled,
  hikes,
  isCover,
  onAlbumChange,
  onCover,
  onRemove,
  photo,
}: {
  disabled: boolean;
  hikes: TripTrackFile[];
  // Reference effective de son album (explicite, ou premiere photo).
  isCover: boolean;
  onAlbumChange: (trackId: string | null) => void;
  onCover: () => void;
  onRemove: () => void;
  photo: TripPhoto;
}) {
  const album = hikes.find((hike) => hike.id === photo.trackId);
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
        {hikes.length > 0 && (
          <AlbumSelect
            label="Album"
            hikes={hikes}
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
            aria-label={`Faire de ${photo.alt} la photo de référence de ${album.name}`}
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
