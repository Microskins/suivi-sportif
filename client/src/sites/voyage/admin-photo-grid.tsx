// Grille de photos d'une etape dans l'admin (celles d'un album, ou celles
// hors album): photo de reference, changement d'album, suppression. Chaque
// action part tout de suite, sans attendre l'enregistrement du voyage.
import { useState } from "react";
import type { AuthErrorHandler } from "./admin-api";
import { adminApi, adminErrorMessage } from "./admin-api";
import { AdminPhotoCard, coverIdsOf, withSavedPhoto } from "./admin-photo-card";
import type { StageFiles } from "./admin-stage-files";
import { ErrorAlert } from "./admin-ui";
import type { TripPhoto } from "./trip-types";

export function AdminPhotoGrid({
  disabled,
  files,
  onAuthError,
  onChange,
  shown,
}: {
  disabled: boolean;
  // Fichiers les plus recents de l'etape (une action peut durer).
  files: () => StageFiles;
  onAuthError: AuthErrorHandler;
  onChange: (files: StageFiles) => void;
  // Photos affichees dans cette grille.
  shown: TripPhoto[];
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { albums, photos, tracks } = files();
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

  const update = (
    photo: TripPhoto,
    changes: { albumCover?: boolean; albumId?: string | null },
  ) =>
    run(async () => {
      const saved = await adminApi.updatePhoto(photo.id, changes);
      const current = files();
      onChange({ ...current, photos: withSavedPhoto(current.photos, saved) });
    });

  const remove = (photo: TripPhoto) => {
    if (!window.confirm(`Supprimer la photo « ${photo.alt} » ?`)) return;
    return run(async () => {
      await adminApi.deletePhoto(photo.id);
      const current = files();
      onChange({
        ...current,
        photos: current.photos.filter((item) => item.id !== photo.id),
      });
    });
  };

  if (shown.length === 0) return null;
  return (
    <div className="grid gap-2">
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {shown.map((photo) => (
          <AdminPhotoCard
            key={photo.id}
            photo={photo}
            albums={albums}
            tracks={tracks}
            isCover={coverIds.has(photo.id)}
            disabled={disabled || pending}
            onAlbumChange={(albumId) => update(photo, { albumId })}
            onCover={() => update(photo, { albumCover: true })}
            onRemove={() => remove(photo)}
          />
        ))}
      </ul>
      <ErrorAlert>{error}</ErrorAlert>
    </div>
  );
}
