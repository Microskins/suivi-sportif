import { sortedOffers, STORE_NAMES, type ComparedProduct } from "./price-data";
import { SELECTED_STORE_LOCATIONS } from "./store-locations";

type ProductComparisonCardProps = {
  position: number;
  product: ComparedProduct;
};

const PRICE_FORMATTER = new Intl.NumberFormat("fr-FR", {
  currency: "EUR",
  style: "currency",
});

function formatPrice(price: number) {
  return PRICE_FORMATTER.format(price);
}

export function ProductComparisonCard({
  position,
  product,
}: ProductComparisonCardProps) {
  const offers = sortedOffers(product);
  const cheapestOffer = offers[0];
  const highestOffer = offers.at(-1) ?? cheapestOffer;
  const saving = highestOffer.price - cheapestOffer.price;

  return (
    <article className="price-divider px-5 py-7 sm:px-8">
      <header className="text-center">
        <p className="section-label">
          Article {String(position).padStart(2, "0")} · {product.category}
        </p>
        <h3 className="mt-2 text-lg font-bold uppercase leading-6">
          {product.name}
        </h3>
        <p className="mt-1 text-[0.68rem] text-[var(--site-muted)]">
          {product.brand} · {product.format}
        </p>
        <p className="mt-3 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-[#c1362b]">
          Écart maximum constaté: {formatPrice(saving)}
        </p>
      </header>

      <div className="mt-5 border-t border-dotted border-[#d8d4c8]">
        {offers.map((offer, index) => {
          const isCheapest = index === 0;
          const storeLocation = SELECTED_STORE_LOCATIONS[offer.storeId];

          return (
            <div
              className={isCheapest ? "best-row" : "line"}
              key={offer.storeId}
            >
              <div className="min-w-0 pr-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold uppercase">
                    {STORE_NAMES[offer.storeId]}
                  </p>
                  {isCheapest ? (
                    <span className="best-tag">★ Meilleur prix</span>
                  ) : null}
                  {offer.previousPrice ? (
                    <span className="text-[0.58rem] font-semibold uppercase text-[#c1362b]">
                      Promo
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-[0.66rem] text-[var(--site-muted)]">
                  {formatPrice(offer.unitPrice)} {offer.unitSuffix}
                </p>
                <p className="mt-0.5 text-[0.58rem] text-[var(--site-muted)]">
                  {storeLocation.city} · relevé du {offer.collectedAt}
                </p>
              </div>

              <div className="shrink-0 text-right">
                {offer.previousPrice ? (
                  <p className="text-[0.62rem] text-[var(--site-muted)] line-through">
                    {formatPrice(offer.previousPrice)}
                  </p>
                ) : null}
                <p
                  className={`text-base font-bold tabular-nums ${
                    isCheapest
                      ? "text-[var(--site-signal)]"
                      : "text-[var(--site-ink)]"
                  }`}
                >
                  {formatPrice(offer.price)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
