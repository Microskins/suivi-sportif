export type TrekRoute = {
  accentClass: string;
  externalUrl: string;
  id: string;
  label: string;
  mapLegend: Array<{ label: string; lineClass: string }>;
  mapUrl: string;
  summary: string;
};

export function RouteMaps({ route }: { route: TrekRoute }) {
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
          <iframe
            src={route.mapUrl}
            title={`Carte Google My Maps - ${route.label}`}
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            className="h-full w-full border-0"
          />
        </div>
        <div className="border-t border-[#315947] p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#95d5a8]">
            Legende du trace
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {route.mapLegend.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 text-sm font-semibold text-[#dfe9e2]"
              >
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-10 rounded-full ${item.lineClass}`}
                />
                {item.label}
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-[#9eb3a6]">
            Les marqueurs de sommets, photos, sources, refuges, parkings et
            passages exposes sont visibles directement sur la carte.
          </p>
        </div>
      </div>
    </section>
  );
}
