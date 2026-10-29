import type { TripPhoto } from "./trip-types";
import { apiFileUrl } from "./voyage-api";

type TripPhotoFrameProps =
  | { code?: never; photo: TripPhoto }
  | { code: string; photo?: never };

// Une photo du carnet, ou l'emplacement reserve tant qu'aucune image n'est
// deposee pour l'etape: le cadre garde la meme proportion dans les deux cas.
export function TripPhotoFrame({ code, photo }: TripPhotoFrameProps) {
  if (photo) {
    return (
      <figure className="overflow-hidden rounded-lg border border-[#dfe4ea] bg-[#eef2f6]">
        <img
          src={apiFileUrl(photo.url)}
          alt={photo.alt}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover"
        />
        <figcaption className="site-label px-2.5 py-2 text-[0.58rem] font-medium uppercase tracking-[0.08em] text-[var(--site-muted)]">
          {photo.caption}
        </figcaption>
      </figure>
    );
  }

  return (
    <div className="col-span-2 grid aspect-[16/9] place-items-center rounded-lg border border-dashed border-[#bcc7d5] bg-[#eef2f6] text-center">
      <p className="site-label text-[0.6rem] font-medium uppercase leading-5 tracking-[0.12em] text-[var(--site-muted)]">
        <span className="block text-base font-semibold text-[#0f1b2b]">
          {code}
        </span>
        Photos à venir
      </p>
    </div>
  );
}
