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
      className="bg-[#f7ecd5]/70 p-6 lg:p-10"
    >
      <div className="flex flex-wrap items-start justify-between gap-5 border-b border-[#e0c99e] pb-6">
        <div>
          <p className="site-label text-xs font-medium uppercase tracking-[0.15em] text-[var(--site-muted)]">
            Carte de la trace
          </p>
          <h3
            id={`${route.id}-map-title`}
            className="site-display mt-3 text-4xl font-semibold leading-none text-[#332f26]"
          >
            {route.label}
          </h3>
        </div>
        <a
          href={route.externalUrl}
          target="_blank"
          rel="noreferrer"
          className="site-label rounded-full bg-[#332f26] px-5 py-3 text-xs font-medium uppercase tracking-[0.1em] text-[#f1e2c4] transition hover:bg-[#5c7350]"
        >
          Ouvrir dans Google Maps ↗
        </a>
      </div>

      <div className="mt-6 overflow-hidden border border-[#332f26] bg-[#f1e2c4]">
        <div className="aspect-[16/10] min-h-72">
          <iframe
            src={route.mapUrl}
            title={`Carte Google My Maps - ${route.label}`}
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            className="h-full w-full border-0"
          />
        </div>
        <div className="border-t border-[#332f26] p-5">
          <p className="site-label text-xs font-medium uppercase tracking-[0.14em] text-[var(--site-muted)]">
            Légende du tracé
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {route.mapLegend.map((item) => (
              <div
                key={item.label}
                className="site-label flex items-center gap-3 text-sm font-medium text-[#332f26]"
              >
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-10 rounded-full ${item.lineClass}`}
                />
                {item.label}
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-[#6b6254]">
            Les marqueurs de sommets, photos, sources, refuges, parkings et
            passages exposés sont visibles directement sur la carte.
          </p>
        </div>
      </div>
    </section>
  );
}
