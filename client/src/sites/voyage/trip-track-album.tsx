// Album photo d'une randonnee: un diaporama qui defile tout seul (toutes les
// 4 s), avec pause, precedent/suivant et pastilles. Il s'arrete au survol, au
// clavier et quand l'utilisateur prefere limiter les animations.
import { useEffect, useState } from "react";
import type { TripPhoto } from "./trip-types";
import { apiFileUrl } from "./voyage-api";
import { prefersReducedMotion } from "./webgl-support";

const INTERVAL_MS = 4000;

const navButton =
  "site-label grid h-8 w-8 place-items-center rounded-full bg-white/90 text-sm font-semibold text-[#0f1b2b] shadow transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0f1b2b]";

export function TripTrackAlbum({
  photos,
  trackName,
}: {
  photos: TripPhoto[];
  trackName: string;
}) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());
  // Survol ou focus clavier: le diaporama attend.
  const [held, setHeld] = useState(false);
  const count = photos.length;
  const current = photos[Math.min(index, count - 1)];
  const moving = playing && !held && count > 1;

  useEffect(() => {
    if (!moving) return;
    const timer = window.setInterval(
      () => setIndex((value) => (value + 1) % count),
      INTERVAL_MS,
    );
    return () => window.clearInterval(timer);
  }, [moving, count]);

  if (!current) return null;
  const go = (step: number) =>
    setIndex((value) => (value + step + count) % count);

  return (
    <section
      aria-roledescription="carrousel"
      aria-label={`Album photo — ${trackName}`}
      className="mt-3 overflow-hidden rounded-lg bg-[#0f1b2b]"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHeld(false);
      }}
    >
      <div className="relative">
        <img
          key={current.id}
          src={apiFileUrl(current.url)}
          alt={current.alt}
          loading="lazy"
          className="voyage-album-photo aspect-[4/3] w-full object-cover"
        />
        {count > 1 && (
          <>
            <div className="absolute inset-y-0 left-2 flex items-center">
              <button
                type="button"
                className={navButton}
                aria-label="Photo précédente"
                onClick={() => go(-1)}
              >
                ←
              </button>
            </div>
            <div className="absolute inset-y-0 right-2 flex items-center">
              <button
                type="button"
                className={navButton}
                aria-label="Photo suivante"
                onClick={() => go(1)}
              >
                →
              </button>
            </div>
          </>
        )}
      </div>
      <div className="flex items-center gap-3 px-3 py-2 text-white">
        <p
          className="min-w-0 flex-1 text-xs leading-5 text-white/85"
          // Annonce la photo seulement quand l'utilisateur la change.
          aria-live={moving ? "off" : "polite"}
        >
          <span className="site-label mr-2 font-semibold text-white">
            {index + 1} / {count}
          </span>
          {current.caption || current.alt}
        </p>
        {count > 1 && (
          <button
            type="button"
            className="site-label shrink-0 rounded-full border border-white/40 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-white/10"
            aria-pressed={!playing}
            onClick={() => setPlaying((value) => !value)}
          >
            {playing ? "Pause" : "Lecture"}
          </button>
        )}
      </div>
      {count > 1 && count <= 12 && (
        <div className="flex justify-center pb-1">
          {photos.map((photo, dot) => (
            // Cible de 24 px autour d'une pastille de 8 px.
            <button
              key={photo.id}
              type="button"
              aria-label={`Photo ${dot + 1} sur ${count}`}
              aria-current={dot === index ? "true" : undefined}
              className="group grid h-6 w-6 place-items-center"
              onClick={() => setIndex(dot)}
            >
              <span
                className={`h-2 w-2 rounded-full transition ${
                  dot === index
                    ? "bg-white"
                    : "bg-white/35 group-hover:bg-white/60"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
