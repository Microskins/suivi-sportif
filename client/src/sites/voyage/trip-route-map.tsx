import { useEffect, useMemo, useRef, useState } from "react";
import type { LngLat, TripStage } from "./ecosse-2026-data";
import { routeLengthKm, stageDistanceLabel } from "./ecosse-2026-data";
import type { MapModelId, TripMapHandle } from "./trip-map-engine";
import { TripPhotoFrame } from "./trip-photo-frame";

const modelOptions: { id: MapModelId; label: string; hint: string }[] = [
  { id: "plan", label: "Plan 2D", hint: "Lecture à plat, routes et villes" },
  {
    id: "relief",
    label: "Relief 3D",
    hint: "Terrain et ombrage des Highlands",
  },
  {
    id: "satellite",
    label: "Satellite 3D",
    hint: "Imagerie drapée sur le relief",
  },
];

type MapStatus = "loading" | "ready" | "unavailable";

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function prefersReducedMotion() {
  return (
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
  );
}

type TripRouteMapProps = {
  fullRoute: LngLat[];
  stages: TripStage[];
};

export function TripRouteMap({ fullRoute, stages }: TripRouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<TripMapHandle | null>(null);
  const [status, setStatus] = useState<MapStatus>("loading");
  const [model, setModel] = useState<MapModelId>("relief");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);

  // Part du trajet total parcourue a l'arrivee de chaque etape: sert a
  // synchroniser le panneau d'etape pendant le rejeu anime.
  const stageRouteEnds = useMemo(() => {
    const total = routeLengthKm(fullRoute);
    let travelled = 0;
    return stages.map((stage) => {
      travelled += routeLengthKm(stage.route);
      return total ? travelled / total : 0;
    });
  }, [fullRoute, stages]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !supportsWebGL()) {
      setStatus("unavailable");
      return;
    }
    let cancelled = false;

    import("./trip-map-engine")
      .then(({ createTripMap }) => {
        if (cancelled) {
          return;
        }
        mapRef.current = createTripMap({
          container,
          fullRoute,
          model,
          onError: () => setStatus("unavailable"),
          onSelectStage: (index) => {
            setActiveIndex(index);
            mapRef.current?.focusStage(index);
            setIsReplaying(false);
          },
          onStageReached: setActiveIndex,
          stageRouteEnds,
          stages,
        });
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("unavailable");
        }
      });

    return () => {
      cancelled = true;
      mapRef.current?.destroy();
      mapRef.current = null;
    };
    // La carte est creee une seule fois; le modele change ensuite via setModel.
  }, []);

  function chooseModel(next: MapModelId) {
    setModel(next);
    setIsReplaying(false);
    mapRef.current?.setModel(next);
  }

  function selectStage(index: number) {
    setActiveIndex(index);
    setIsReplaying(false);
    mapRef.current?.focusStage(index);
  }

  function toggleReplay() {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    if (isReplaying) {
      map.stopReplay();
      setIsReplaying(false);
      return;
    }
    setIsReplaying(true);
    map.replay(prefersReducedMotion(), () => setIsReplaying(false));
  }

  const stage = stages[activeIndex];
  const mapReady = status === "ready";

  return (
    <div className="overflow-hidden rounded-xl border border-[#dfe4ea] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dfe4ea] p-3 sm:p-4">
        <fieldset className="flex flex-wrap gap-1.5" disabled={!mapReady}>
          <legend className="sr-only">Modèle de carte</legend>
          {modelOptions.map((option) => (
            <label
              key={option.id}
              title={option.hint}
              className="site-label cursor-pointer rounded-full border border-[#dfe4ea] px-3.5 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.11em] text-[var(--site-muted)] transition has-[:checked]:border-[#0f1b2b] has-[:checked]:bg-[#0f1b2b] has-[:checked]:text-white has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#1c4ed8]"
            >
              <input
                type="radio"
                name="modele-carte"
                value={option.id}
                checked={model === option.id}
                onChange={() => chooseModel(option.id)}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </fieldset>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => mapRef.current?.overview()}
            disabled={!mapReady}
            className="site-label rounded-full px-3.5 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.11em] text-[#1c4ed8] transition hover:bg-[#eaf0ff] disabled:opacity-40"
          >
            Vue d’ensemble
          </button>
          <button
            type="button"
            onClick={toggleReplay}
            disabled={!mapReady}
            aria-pressed={isReplaying}
            className="site-label rounded-full bg-[#1c4ed8] px-3.5 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.11em] text-white transition hover:bg-[#1740b0] disabled:opacity-40"
          >
            {isReplaying ? "Arrêter ■" : "Rejouer le voyage ▶"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="relative min-h-[26rem] bg-[#eef2f6] sm:min-h-[34rem]">
          {/* MapLibre impose `position: relative` a son conteneur: le
              positionnement absolu reste donc porte par un parent dedie. */}
          <div className="absolute inset-0">
            <div
              ref={containerRef}
              className="h-full w-full"
              role="region"
              aria-label="Carte interactive du trajet en Écosse"
            />
          </div>
          {status !== "ready" && (
            <p
              role="status"
              className="site-label absolute inset-0 grid place-items-center p-8 text-center text-[0.68rem] font-medium uppercase leading-6 tracking-[0.1em] text-[var(--site-muted)]"
            >
              {status === "loading"
                ? "Chargement de la carte…"
                : "Carte 3D indisponible sur cet appareil — la feuille de route reste consultable."}
            </p>
          )}
        </div>

        <aside
          aria-live="polite"
          className="flex flex-col border-t border-[#dfe4ea] lg:border-l lg:border-t-0"
        >
          <div className="flex items-center justify-between gap-3 border-b border-[#dfe4ea] px-5 py-3">
            <p className="site-label text-[0.62rem] font-semibold uppercase tracking-[0.13em] text-[#1c4ed8]">
              {stage.day} · {stage.date}
            </p>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => selectStage(activeIndex - 1)}
                disabled={activeIndex === 0}
                aria-label="Étape précédente"
                className="site-label grid h-8 w-8 place-items-center rounded-full border border-[#dfe4ea] text-sm disabled:opacity-35"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => selectStage(activeIndex + 1)}
                disabled={activeIndex === stages.length - 1}
                aria-label="Étape suivante"
                className="site-label grid h-8 w-8 place-items-center rounded-full border border-[#dfe4ea] text-sm disabled:opacity-35"
              >
                →
              </button>
            </div>
          </div>
          <div className="flex flex-1 flex-col p-5">
            <p className="site-label text-xs font-semibold text-[#0f1b2b]">
              {String(activeIndex + 1).padStart(2, "0")} / {stage.code} ·{" "}
              {stageDistanceLabel(stage)}
            </p>
            <h3 className="site-display mt-2 text-2xl font-semibold tracking-[-0.02em]">
              {stage.title}
            </h3>
            <p className="mt-2 leading-6 text-[var(--site-muted)]">
              {stage.detail}
            </p>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {stage.highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="site-label rounded-full bg-[#eaf0ff] px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[#1c4ed8]"
                >
                  {highlight}
                </li>
              ))}
            </ul>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {stage.photos.length > 0 ? (
                stage.photos
                  .slice(0, 4)
                  .map((photo) => (
                    <TripPhotoFrame key={photo.src} photo={photo} />
                  ))
              ) : (
                <TripPhotoFrame code={stage.code} />
              )}
            </div>
          </div>
        </aside>
      </div>

      <p className="site-label border-t border-[#dfe4ea] px-5 py-4 text-[0.62rem] font-medium uppercase tracking-[0.1em] text-[var(--site-muted)]">
        Tracé reconstitué à partir des étapes — pas une trace GPX enregistrée.
      </p>
    </div>
  );
}
