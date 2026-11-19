// Album photo (d'une randonnee ou d'une etape): un diaporama qui defile tout seul (toutes les
// 4 s), avec pause, precedent/suivant et pastilles. Il s'arrete au survol, au
// clavier et quand l'utilisateur prefere limiter les animations. Un bouton
// ouvre l'album en plein ecran (fleches du clavier, Echap pour fermer).
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { TripPhoto } from "./trip-types";
import { apiFileUrl } from "./voyage-api";
import { prefersReducedMotion } from "./webgl-support";

const INTERVAL_MS = 4000;

const navButton =
  "site-label grid h-8 w-8 place-items-center rounded-full bg-white/90 text-sm font-semibold text-[#0f1b2b] shadow transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0f1b2b]";

export function TripTrackAlbum({
  photos,
  title,
}: {
  photos: TripPhoto[];
  title: string;
}) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());
  // Survol ou focus clavier: le diaporama attend.
  const [held, setHeld] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const openButton = useRef<HTMLButtonElement>(null);
  const count = photos.length;
  const current = photos[Math.min(index, count - 1)];
  // En plein ecran, le survol de la photo ne met pas le diaporama en pause.
  const moving = playing && (fullscreen || !held) && count > 1;

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
  const closeFullscreen = () => {
    setFullscreen(false);
    openButton.current?.focus();
  };

  return (
    <section
      aria-roledescription="carrousel"
      aria-label={`Album photo — ${title}`}
      className="mt-3 overflow-hidden rounded-lg bg-[#0f1b2b]"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHeld(false);
      }}
    >
      <p className="site-label px-3 pt-2 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-white/80">
        Album · {title}
      </p>
      <div className="relative mt-2">
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
            className={pillButton}
            aria-pressed={!playing}
            onClick={() => setPlaying((value) => !value)}
          >
            {playing ? "Pause" : "Lecture"}
          </button>
        )}
        <button
          ref={openButton}
          type="button"
          className={pillButton}
          aria-haspopup="dialog"
          aria-label={`Afficher l’album ${title} en plein écran`}
          onClick={() => setFullscreen(true)}
        >
          ⛶ Plein écran
        </button>
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
      {fullscreen &&
        createPortal(
          <AlbumFullscreen
            photos={photos}
            index={Math.min(index, count - 1)}
            title={title}
            playing={playing}
            onGo={go}
            onTogglePlay={() => setPlaying((value) => !value)}
            onClose={closeFullscreen}
          />,
          document.body,
        )}
    </section>
  );
}

const pillButton =
  "site-label shrink-0 rounded-full border border-white/40 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-white/10";

const bigNavButton =
  "site-label grid h-12 w-12 place-items-center rounded-full bg-white/15 text-xl font-semibold text-white transition hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white";

// Vue plein ecran: la photo entiere (sans recadrage) sur fond noir. Demande
// aussi le plein ecran du navigateur quand il est disponible; sinon la vue
// couvre simplement la fenetre.
function AlbumFullscreen({
  photos,
  index,
  title,
  playing,
  onGo,
  onTogglePlay,
  onClose,
}: {
  photos: TripPhoto[];
  index: number;
  title: string;
  playing: boolean;
  onGo: (step: number) => void;
  onTogglePlay: () => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const current = photos[index];
  const count = photos.length;
  // Toujours la derniere version des rappels pour les ecouteurs globaux.
  const handlers = useRef({ onGo, onClose });
  handlers.current = { onGo, onClose };

  useEffect(() => {
    const node = dialog.current;
    closeButton.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let native = false;
    if (node?.requestFullscreen && !document.fullscreenElement) {
      node
        .requestFullscreen()
        .then(() => {
          native = true;
        })
        .catch(() => {});
    }
    // Echap en plein ecran natif est capte par le navigateur: on ferme la vue
    // quand il quitte le plein ecran.
    const onFullscreenChange = () => {
      if (native && !document.fullscreenElement) handlers.current.onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") handlers.current.onClose();
      else if (event.key === "ArrowLeft") handlers.current.onGo(-1);
      else if (event.key === "ArrowRight") handlers.current.onGo(1);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      if (document.fullscreenElement === node) {
        document.exitFullscreen?.().catch(() => {});
      }
    };
  }, []);

  if (!current) return null;

  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={`Album photo en plein écran — ${title}`}
      className="fixed inset-0 z-[1000] flex flex-col bg-black text-white"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <p className="site-label min-w-0 flex-1 truncate text-xs font-semibold uppercase tracking-[0.12em] text-white/80">
          Album · {title}
          <span className="ml-3 text-white">
            {index + 1} / {count}
          </span>
        </p>
        {count > 1 && (
          <button
            type="button"
            className={pillButton}
            aria-pressed={!playing}
            onClick={onTogglePlay}
          >
            {playing ? "Pause" : "Lecture"}
          </button>
        )}
        <button
          ref={closeButton}
          type="button"
          className="site-label grid h-10 w-10 place-items-center rounded-full bg-white/15 text-lg font-semibold text-white transition hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          aria-label="Fermer le plein écran"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
      <div className="relative min-h-0 flex-1">
        <img
          key={current.id}
          src={apiFileUrl(current.url)}
          alt={current.alt}
          className="voyage-album-photo h-full w-full object-contain"
        />
        {count > 1 && (
          <>
            <div className="absolute inset-y-0 left-3 flex items-center">
              <button
                type="button"
                className={bigNavButton}
                aria-label="Photo précédente"
                onClick={() => onGo(-1)}
              >
                ←
              </button>
            </div>
            <div className="absolute inset-y-0 right-3 flex items-center">
              <button
                type="button"
                className={bigNavButton}
                aria-label="Photo suivante"
                onClick={() => onGo(1)}
              >
                →
              </button>
            </div>
          </>
        )}
      </div>
      <p
        className="px-4 py-3 text-center text-sm leading-6 text-white/85"
        aria-live={playing ? "off" : "polite"}
      >
        {current.caption || current.alt}
      </p>
    </div>
  );
}
