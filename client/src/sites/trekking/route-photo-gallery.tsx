import { useId } from "react";
import type { TrekRoute } from "./route-maps";
import { useRoutePhotos } from "./use-route-photos";

export function RoutePhotoGallery({ route }: { route: TrekRoute }) {
  const inputId = useId();
  const { error, importPhotos, isLoading, photos, removePhoto } =
    useRoutePhotos(route.id);

  return (
    <section
      className="border-t border-[#e0c99e] bg-[#f7ecd5]/70 p-6 lg:p-10"
      aria-labelledby={`${route.id}-photos-title`}
    >
      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-[#e0c99e] pb-6">
        <div>
          <p className="site-label text-xs font-medium uppercase tracking-[0.15em] text-[var(--site-muted)]">
            Carnet photo
          </p>
          <h3
            id={`${route.id}-photos-title`}
            className="site-display mt-3 text-4xl font-semibold leading-none text-[#332f26]"
          >
            Photos de {route.label}
          </h3>
        </div>
        <label
          htmlFor={inputId}
          className="site-label cursor-pointer rounded-full bg-[#332f26] px-5 py-3 text-xs font-medium uppercase tracking-[0.1em] text-[#f1e2c4] transition hover:bg-[#5c7350]"
        >
          Ajouter des photos
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          onChange={(event) => {
            void importPhotos(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="mt-5 border-l-4 border-[#b1573c] bg-white/40 px-4 py-3 text-sm leading-6 text-[#7d3929]"
        >
          {error}
        </p>
      )}
      {isLoading ? (
        <p className="mt-6 text-sm text-[#6b6254]">Chargement des photos…</p>
      ) : photos.length === 0 ? (
        <p className="mt-6 max-w-xl border border-[#e0c99e] bg-white/35 p-5 text-sm leading-6 text-[#6b6254]">
          Ajoute tes propres photos de terrain. Elles restent dans le navigateur
          de cet appareil et ne sont pas publiées.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {photos.map((photo) => (
            <figure
              key={photo.id}
              className="overflow-hidden border border-[#332f26] bg-[#f1e2c4]"
            >
              <img
                src={photo.url}
                alt={photo.fileName}
                className="aspect-[4/3] w-full object-cover"
              />
              <figcaption className="flex items-center justify-between gap-3 border-t border-[#332f26] p-4">
                <span className="min-w-0 truncate text-sm text-[#332f26]">
                  {photo.fileName}
                </span>
                <button
                  type="button"
                  onClick={() => void removePhoto(photo.id)}
                  className="site-label shrink-0 text-xs font-medium uppercase tracking-[0.12em] text-[#b1573c] transition hover:text-[#332f26]"
                >
                  Retirer
                </button>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
