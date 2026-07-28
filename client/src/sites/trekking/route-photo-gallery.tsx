import { useId } from "react";
import type { TrekRoute } from "./route-maps";
import { useRoutePhotos } from "./use-route-photos";

export function RoutePhotoGallery({ route }: { route: TrekRoute }) {
  const inputId = useId();
  const { error, importPhotos, isLoading, photos, removePhoto } =
    useRoutePhotos(route.id);

  return (
    <section
      className="border-t border-[#315947] bg-[#0c241a] p-6 lg:p-10"
      aria-labelledby={`${route.id}-photos-title`}
    >
      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-[#315947] pb-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#95d5a8]">
            Carnet photo
          </p>
          <h3
            id={`${route.id}-photos-title`}
            className="mt-3 font-serif text-4xl leading-none text-[#f4efdf]"
          >
            Photos de {route.label}
          </h3>
        </div>
        <label
          htmlFor={inputId}
          className="cursor-pointer border border-[#cfe895] bg-[#cfe895] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#102016] transition hover:bg-transparent hover:text-[#cfe895]"
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
          className="mt-5 border-l-2 border-[#ff8c7e] pl-4 text-sm leading-6 text-[#ffd3ce]"
        >
          {error}
        </p>
      )}
      {isLoading ? (
        <p className="mt-6 text-sm text-[#9eb3a6]">Chargement des photos...</p>
      ) : photos.length === 0 ? (
        <p className="mt-6 max-w-xl text-sm leading-6 text-[#9eb3a6]">
          Ajoute tes propres photos de terrain. Elles restent dans le navigateur
          de cet appareil et ne sont pas publiees.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {photos.map((photo) => (
            <figure
              key={photo.id}
              className="overflow-hidden border border-[#315947] bg-[#102d21]"
            >
              <img
                src={photo.url}
                alt={photo.fileName}
                className="aspect-[4/3] w-full object-cover"
              />
              <figcaption className="flex items-center justify-between gap-3 p-4">
                <span className="min-w-0 truncate text-sm text-[#dfe9e2]">
                  {photo.fileName}
                </span>
                <button
                  type="button"
                  onClick={() => void removePhoto(photo.id)}
                  className="shrink-0 text-xs font-bold uppercase tracking-[0.12em] text-[#f4c56a] transition hover:text-[#f4efdf]"
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
