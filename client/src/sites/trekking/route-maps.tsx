import { useState } from "react";

export type TrekRoute = {
  lineClass: string;
  externalUrl: string;
  id: string;
  label: string;
  mapUrl: string;
  summary: string;
};

function MapPlaceholder({
  label,
  onLoad,
}: {
  label: string;
  onLoad: () => void;
}) {
  return (
    <div className="grid h-full min-h-72 place-items-center bg-[#0a1f17] p-8 text-center">
      <div className="max-w-sm">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#95d5a8]">
          Carte interactive
        </p>
        <p className="mt-4 font-serif text-3xl text-[#f4efdf]">{label}</p>
        <p className="mt-3 text-sm leading-6 text-[#9eb3a6]">
          Charge la carte pour consulter le trace, ses couches et sa legende
          originale.
        </p>
        <button
          type="button"
          onClick={onLoad}
          className="mt-6 border border-[#cfe895] bg-[#cfe895] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#102016] transition hover:bg-transparent hover:text-[#cfe895] focus:outline-none focus:ring-2 focus:ring-[#f4efdf] focus:ring-offset-2 focus:ring-offset-[#0a1f17]"
        >
          Charger la carte
        </button>
      </div>
    </div>
  );
}

export function RouteMaps({ route }: { route: TrekRoute }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <section
      aria-labelledby={`${route.id}-map-title`}
      className="bg-[#071610] p-6 lg:p-10"
    >
      <div className="flex flex-wrap items-start justify-between gap-5 border-b border-[#315947] pb-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#95d5a8]">
            Carte de la trace
          </p>
          <h3
            id={`${route.id}-map-title`}
            className="mt-3 font-serif text-4xl leading-none text-[#f4efdf]"
          >
            {route.label}
          </h3>
        </div>
        <a
          href={route.externalUrl}
          target="_blank"
          rel="noreferrer"
          className="border border-[#5d796a] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#cfe895] transition hover:border-[#cfe895]"
        >
          Ouvrir la carte
        </a>
      </div>

      <div className="mt-6 overflow-hidden border border-[#315947] bg-[#102d21]">
        <div className="aspect-[16/10] min-h-72">
          {isLoaded ? (
            <iframe
              src={route.mapUrl}
              title={`Carte Google My Maps - ${route.label}`}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full border-0"
            />
          ) : (
            <MapPlaceholder
              label={route.label}
              onLoad={() => setIsLoaded(true)}
            />
          )}
        </div>
        <div className="grid gap-4 border-t border-[#315947] p-5 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="flex items-center gap-3 text-sm font-semibold text-[#dfe9e2]">
            <span
              aria-hidden="true"
              className={`h-1.5 w-12 rounded-full ${route.lineClass}`}
            />
            {route.label}
          </div>
          <p className="text-sm leading-6 text-[#9eb3a6]">
            Legende: cette couleur identifie le trace affiche. Les points et les
            autres couleurs restent ceux de la carte Google My Maps.
          </p>
        </div>
      </div>
    </section>
  );
}
