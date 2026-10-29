import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { VoyageGlobeHandle } from "./voyage-globe-engine";
import type { TripSummary } from "./trip-types";
import { prefersReducedMotion, supportsWebGL } from "./webgl-support";

type GlobeStatus = "loading" | "ready" | "unavailable";

export type VoyageGlobeControls = {
  highlight: (tripId: string | null) => void;
};

type VoyageGlobeProps = {
  onHoverTrip: (tripId: string | null) => void;
  trips: TripSummary[];
};

export const VoyageGlobe = forwardRef<VoyageGlobeControls, VoyageGlobeProps>(
  function VoyageGlobe({ onHoverTrip, trips }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const globeRef = useRef<VoyageGlobeHandle | null>(null);
    const hoverRef = useRef(onHoverTrip);
    hoverRef.current = onHoverTrip;
    const [status, setStatus] = useState<GlobeStatus>("loading");

    useImperativeHandle(ref, () => ({
      highlight: (tripId) => globeRef.current?.highlight(tripId),
    }));

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
            onHoverTrip: (tripId) => hoverRef.current(tripId),
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
          aria-label="Globe des voyages : chaque arc est un vol, cliquez-le pour ouvrir le carnet"
        />
        {status !== "ready" && (
          <p
            role="status"
            className="site-label absolute inset-0 grid place-items-center p-8 text-center text-[0.68rem] font-medium uppercase leading-6 tracking-[0.1em] text-[var(--site-muted)]"
          >
            {status === "loading"
              ? "Mise en orbite du globe…"
              : "Globe 3D indisponible sur cet appareil — les billets restent ci-dessous."}
          </p>
        )}
      </div>
    );
  },
);
