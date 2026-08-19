import { useEffect, useMemo, useState } from "react";
import { PriceBrand } from "./price-brand";
import { usePriceComparisonStore } from "./price-comparison-store";
import { COMPARED_PRODUCTS, filterComparedProducts } from "./price-data";
import { ArrowIcon } from "./price-icons";
import { PriceSearchPanel } from "./price-search-panel";
import {
  buildPriceSearchUrl,
  createTicketNumber,
  readPriceSearchParams,
} from "./price-search-params";
import { PriceTicketActions } from "./price-ticket-actions";
import { PriceTicketQr, usePriceTicketQr } from "./price-ticket-qr";
import { ProductComparisonCard } from "./product-comparison-card";
import { StoreLocationPanel } from "./store-location-panel";
import { COMPARISON_AREA } from "./store-locations";

const RECEIPT_STEPS = [
  ["01", "Cherchez", "Saisissez un aliment ou utilisez un raccourci."],
  ["02", "Comparez", "Lisez le prix puis sa valeur au kilo ou au litre."],
  ["03", "Choisissez", "La ligne verte signale uniquement le prix minimum."],
];

export function PriceComparisonSite() {
  const category = usePriceComparisonStore((state) => state.category);
  const query = usePriceComparisonStore((state) => state.query);
  const resetFilters = usePriceComparisonStore((state) => state.resetFilters);
  const setCategory = usePriceComparisonStore((state) => state.setCategory);
  const setFilters = usePriceComparisonStore((state) => state.setFilters);
  const setQuery = usePriceComparisonStore((state) => state.setQuery);
  const [areUrlFiltersReady, setAreUrlFiltersReady] = useState(false);

  const products = useMemo(
    () => filterComparedProducts(COMPARED_PRODUCTS, query, category),
    [category, query],
  );
  const ticketNumber = useMemo(
    () => createTicketNumber({ category, query }),
    [category, query],
  );
  const ticketPath = buildPriceSearchUrl(window.location, { category, query });
  const ticketUrl = new URL(ticketPath, window.location.origin).href;
  const qrCode = usePriceTicketQr(ticketUrl);

  useEffect(() => {
    function syncFiltersFromUrl() {
      setFilters(readPriceSearchParams(window.location.search));
    }

    syncFiltersFromUrl();
    setAreUrlFiltersReady(true);
    window.addEventListener("popstate", syncFiltersFromUrl);

    return () => window.removeEventListener("popstate", syncFiltersFromUrl);
  }, [setFilters]);

  useEffect(() => {
    if (!areUrlFiltersReady) {
      return;
    }

    window.history.replaceState(window.history.state, "", ticketPath);
  }, [areUrlFiltersReady, ticketPath]);

  return (
    <main id="contenu-principal" tabIndex={-1} className="price-counter min-h-screen bg-[#e9e6dc] px-3 py-6 text-[#1c1c1c] sm:px-6 sm:py-10">
      <article className="receipt price-reveal">
        <header className="px-5 py-7 text-center sm:px-8 sm:py-9">
          <div className="flex items-start justify-between gap-4 text-left text-[0.58rem] uppercase tracking-[0.08em] text-[var(--site-muted)]">
            <div>
              <PriceBrand />
              <p className="mt-2">Ticket N° {ticketNumber}</p>
            </div>
            <div className="text-right">
              <p>{COMPARISON_AREA.postalCode}</p>
              <p>{COMPARISON_AREA.city}</p>
              <p className="mt-1 text-[#c1362b]">Prototype</p>
            </div>
          </div>

          <div className="print-hidden mx-auto mt-8 max-w-md">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#c1362b]">
              Comparateur alimentaire local
            </p>
            <h1 className="mt-4 text-2xl font-bold uppercase leading-8 tracking-[-0.04em] sm:text-3xl sm:leading-9">
              Le même panier.{" "}
              <span className="block">Pas le même prix.</span>
            </h1>
            <p className="mt-4 text-xs leading-6 text-[var(--site-muted)]">
              Carrefour · Intermarché · ALDI · Colruyt
            </p>
          </div>

          <nav
            aria-label="Navigation principale"
            className="print-hidden mt-7 flex justify-center gap-5 text-[0.6rem] font-semibold uppercase tracking-[0.08em]"
          >
            <a
              className="border-b border-dotted border-[#6b6b6b] hover:text-[#c1362b]"
              href="#comparer"
            >
              Comparer
            </a>
            <a
              className="border-b border-dotted border-[#6b6b6b] hover:text-[#c1362b]"
              href="#methode"
            >
              Mode d'emploi
            </a>
            <a
              className="border-b border-dotted border-[#6b6b6b] hover:text-[#c1362b]"
              href="/"
            >
              Portfolio ↗
            </a>
          </nav>
        </header>

        <PriceSearchPanel
          category={category}
          onCategoryChange={setCategory}
          onQueryChange={setQuery}
          query={query}
        />

        <PriceTicketActions
          isPrintReady={
            qrCode.sourceUrl === ticketUrl && qrCode.status !== "loading"
          }
          ticketNumber={ticketNumber}
          ticketUrl={ticketUrl}
        />

        <section className="price-divider print-only px-5 py-5 sm:px-8">
          <p className="section-label">Recherche imprimée</p>
          <div className="mt-3 flex justify-between gap-4 border-t border-dotted border-[#d8d4c8] pt-3 text-[0.66rem]">
            <span>{query || "Tous les produits"}</span>
            <span>{category}</span>
          </div>
          <p className="mt-2 text-[0.58rem] text-[var(--site-muted)]">
            Ticket {ticketNumber} · zone {COMPARISON_AREA.postalCode} · édité le{" "}
            {new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(
              new Date(),
            )}
          </p>
        </section>

        <StoreLocationPanel />

        <section aria-labelledby="comparison-title" id="comparer">
          <header className="price-divider px-5 py-7 text-center sm:px-8">
            <p className="section-label">Détail du ticket</p>
            <h2
              className="mt-2 text-base font-bold uppercase leading-6"
              id="comparison-title"
            >
              {query
                ? `Résultats pour « ${query} »`
                : "Les essentiels du panier"}
            </h2>
            <p
              aria-live="polite"
              className="mt-2 text-[0.64rem] text-[var(--site-muted)]"
            >
              {products.length} produit{products.length > 1 ? "s" : ""} · prix
              de démonstration
            </p>
          </header>

          {products.length ? (
            products.map((product, index) => (
              <ProductComparisonCard
                key={product.id}
                position={index + 1}
                product={product}
              />
            ))
          ) : (
            <div className="price-divider px-5 py-12 text-center sm:px-8">
              <p className="text-[0.62rem] uppercase tracking-[0.12em] text-[#c1362b]">
                Ligne article introuvable
              </p>
              <h3 className="mt-3 text-base font-bold uppercase">
                Rien dans ce rayon
              </h3>
              <p className="mx-auto mt-3 max-w-sm text-xs leading-6 text-[var(--site-muted)]">
                Essayez un nom plus simple ou revenez au ticket complet.
              </p>
              <button
                className="mt-5 inline-flex items-center gap-2 border-2 border-[#1c1c1c] bg-[#1c1c1c] px-4 py-2.5 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-[#f7f5ef] hover:bg-[#c1362b]"
                onClick={resetFilters}
                type="button"
              >
                Reprendre le ticket <ArrowIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </section>

        <section
          aria-labelledby="method-title"
          className="price-divider print-hidden px-5 py-7 sm:px-8"
          id="methode"
        >
          <p className="section-label">Lecture</p>
          <h2
            className="mt-2 text-center text-sm font-bold uppercase"
            id="method-title"
          >
            Comment lire ce ticket
          </h2>
          <ol className="mt-5 border-t border-dotted border-[#d8d4c8]">
            {RECEIPT_STEPS.map(([number, title, description]) => (
              <li className="line items-start gap-4 py-4" key={number}>
                <span className="text-xs font-bold text-[#c1362b]">
                  {number}
                </span>
                <div className="flex-1">
                  <h3 className="text-xs font-semibold uppercase">{title}</h3>
                  <p className="mt-1 text-[0.66rem] leading-5 text-[var(--site-muted)]">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <footer className="price-divider px-5 py-8 text-center sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.12em]">
            Merci de votre visite
          </p>
          <p className="mx-auto mt-3 max-w-md text-[0.62rem] leading-5 text-[var(--site-muted)]">
            Prix indicatifs et fictifs pour cette version. Les tarifs et la
            disponibilité peuvent varier en magasin. Vérifiez toujours le prix
            affiché par l'enseigne avant votre achat.
          </p>
          <p className="print-only mx-auto mt-3 max-w-md text-[0.56rem] leading-4 text-[var(--site-muted)]">
            Sources : fiches officielles des points de vente Carrefour,
            Intermarché, ALDI et Colruyt. Prix de démonstration sans source
            tarifaire commerciale.
          </p>
          <PriceTicketQr
            qrCodeUrl={qrCode.sourceUrl === ticketUrl ? qrCode.url : undefined}
            ticketNumber={ticketNumber}
          />
          <div
            className="price-barcode print-hidden mx-auto mt-7 h-12 w-56"
            aria-hidden="true"
          />
          <p className="print-hidden mt-2 text-[0.52rem] tracking-[0.22em] text-[var(--site-muted)]">
            {ticketNumber.replace("-", " ")}
          </p>
        </footer>
      </article>
    </main>
  );
}
