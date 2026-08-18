import { ArrowIcon, LocationIcon } from "./price-icons";
import { COMPARISON_AREA, SELECTED_STORES } from "./store-locations";

export function StoreLocationPanel() {
  return (
    <section
      aria-labelledby="selected-stores-title"
      className="price-divider px-5 py-7 sm:px-8"
    >
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="section-label">Points de vente</p>
          <h2
            className="mt-2 text-sm font-bold uppercase tracking-[0.08em]"
            id="selected-stores-title"
          >
            {COMPARISON_AREA.label}
          </h2>
        </div>
        <div className="flex items-center gap-2 text-right">
          <LocationIcon className="h-5 w-5 text-[#c1362b]" />
          <div>
            <p className="text-[0.58rem] uppercase text-[#6b6b6b]">Zone</p>
            <p className="text-sm font-bold">{COMPARISON_AREA.postalCode}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-dotted border-[#d8d4c8]">
        {SELECTED_STORES.map((store) => (
          <article className="line items-start gap-4 py-4" key={store.storeId}>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xs font-semibold uppercase leading-5">
                  {store.displayName}
                </h3>
                <span className="border border-[#b8b3a0] px-1.5 py-0.5 text-[0.55rem] font-semibold text-[#6b6b6b]">
                  {store.countryCode}
                </span>
              </div>
              <address
                aria-label={`${store.address}, ${store.postalCode} ${store.city}`}
                className="mt-1 text-[0.68rem] not-italic leading-5 text-[#6b6b6b]"
              >
                {store.address} · {store.postalCode} {store.city}
              </address>
              {store.note ? (
                <p className="mt-1 text-[0.62rem] leading-4 text-[#c1362b]">
                  {store.note}
                </p>
              ) : null}
            </div>
            <a
              aria-label={`Ouvrir la fiche officielle de ${store.displayName}`}
              className="print-hidden inline-flex shrink-0 items-center gap-1 border-b border-dotted border-[#6b6b6b] pb-0.5 text-[0.6rem] font-semibold uppercase text-[#1c1c1c] hover:border-[#c1362b] hover:text-[#c1362b]"
              href={store.officialPageUrl}
              rel="noreferrer"
              target="_blank"
            >
              Fiche <ArrowIcon className="h-3 w-3" />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
