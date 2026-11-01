import { useEffect, useRef, useState } from "react";
import type { VoyageGlobeHandle } from "./voyage-globe-engine";
import type { TripSummary } from "./trip-types";
import { tripHref } from "./trip-types";
import { prefersReducedMotion, supportsWebGL } from "./webgl-support";

type GlobeStatus = "loading" | "ready" | "unavailable";

type VoyageGlobeProps = {
  trips: TripSummary[];
};

export function VoyageGlobe({ trips }: VoyageGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<VoyageGlobeHandle | null>(null);
  const [status, setStatus] = useState<GlobeStatus>("loading");

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !supportsWebGL()) {
      setStatus("unavailable");
      return;
    }
    let cancelled = false;

    import("./voyage-globe-engine")
      .then(({ createVoyageGlobe }) => {
        if (cancelled) return;
        globeRef.current = createVoyageGlobe({
          container,
          onError: () => setStatus("unavailable"),
          reducedMotion: prefersReducedMotion(),
          trips,
        });
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("unavailable");
      });

    return () => {
      cancelled = true;
      globeRef.current?.destroy();
      globeRef.current = null;
    };
  }, [trips]);

  return (
    <div className="absolute inset-0">
      {/* MapLibre impose `position: relative` a son conteneur. */}
      <div
        ref={containerRef}
        className={`h-full w-full ${status === "unavailable" ? "invisible" : ""}`}
        role="region"
        aria-label="Globe des voyages : chaque arc est un trajet, en avion ou en voiture ; cliquez-le pour ouvrir le carnet"
      />
      {status === "loading" && (
        <p
          role="status"
          className="site-label absolute inset-0 grid place-items-center p-8 text-center text-[0.68rem] font-medium uppercase leading-6 tracking-[0.1em] text-[var(--site-muted)]"
        >
          Mise en orbite du globe…
        </p>
      )}
      {/* Le globe est la seule entree vers les carnets: sans lui (pas de
          WebGL, style bloque), une liste de liens prend le relais. */}
      {status === "unavailable" && (
        <div className="absolute inset-0 grid place-items-center p-8 lg:pl-[46%]">
          <div className="text-center lg:text-left">
            <p
              role="status"
              className="site-label text-[0.68rem] font-medium uppercase leading-6 tracking-[0.1em] text-[var(--site-muted)]"
            >
              Globe 3D indisponible sur cet appareil — les carnets restent
              accessibles.
            </p>
            <ul className="mt-4 grid gap-2">
              {trips.map((trip) => (
                <li key={trip.id}>
                  <a
                    href={tripHref(trip.slug)}
                    className="site-display text-lg font-semibold text-[#1c4ed8] underline-offset-4 hover:underline"
                  >
                    {trip.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
