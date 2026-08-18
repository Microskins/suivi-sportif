import { PRODUCT_CATEGORIES, type ProductCategory } from "./price-data";
import { SearchIcon } from "./price-icons";

type PriceSearchPanelProps = {
  category: ProductCategory;
  onCategoryChange: (category: ProductCategory) => void;
  onQueryChange: (query: string) => void;
  query: string;
};

const QUICK_SEARCHES = ["Lait", "Bananes", "Poulet", "Pâtes"];

export function PriceSearchPanel({
  category,
  onCategoryChange,
  onQueryChange,
  query,
}: PriceSearchPanelProps) {
  return (
    <section
      aria-labelledby="search-title"
      className="price-divider print-hidden px-5 py-7 sm:px-8"
    >
      <p className="section-label" id="search-title">
        Recherche produit
      </p>
      <label
        className="mt-3 block text-xs text-[#6b6b6b]"
        htmlFor="product-search"
      >
        Quel aliment cherchez-vous ?
      </label>
      <form
        className="mt-2 grid sm:grid-cols-[1fr_auto]"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="flex min-h-12 items-center border-2 border-[#1c1c1c] bg-[#f7f5ef] px-3 focus-within:ring-2 focus-within:ring-[#c1362b]">
          <SearchIcon className="h-5 w-5 shrink-0 text-[#1c1c1c]" />
          <input
            autoComplete="off"
            className="min-w-0 flex-1 border-0 bg-transparent px-3 py-3 text-sm text-[#1c1c1c] outline-none placeholder:text-[#858585]"
            id="product-search"
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="LAIT, BANANES, POULET..."
            type="search"
            value={query}
          />
          {query ? (
            <button
              className="text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-[#c1362b] underline underline-offset-4"
              onClick={() => onQueryChange("")}
              type="button"
            >
              Effacer
            </button>
          ) : null}
        </div>
        <button
          className="min-h-12 border-2 border-[#1c1c1c] bg-[#1c1c1c] px-5 text-xs font-bold uppercase tracking-[0.12em] text-[#f7f5ef] transition hover:bg-[#c1362b] sm:border-l-0"
          type="submit"
        >
          Chercher
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[0.66rem] uppercase tracking-[0.08em] text-[#6b6b6b]">
        <span>Raccourcis:</span>
        {QUICK_SEARCHES.map((quickSearch) => (
          <button
            className="border-b border-dotted border-[#6b6b6b] text-[#1c1c1c] hover:border-[#c1362b] hover:text-[#c1362b]"
            key={quickSearch}
            onClick={() => onQueryChange(quickSearch)}
            type="button"
          >
            {quickSearch}
          </button>
        ))}
      </div>

      <div
        aria-label="Filtrer par catégorie"
        className="mt-5 flex gap-1 overflow-x-auto border-t border-dotted border-[#d8d4c8] pt-4"
      >
        {PRODUCT_CATEGORIES.map((productCategory) => (
          <button
            aria-pressed={category === productCategory}
            className={`shrink-0 border px-2.5 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.06em] transition ${
              category === productCategory
                ? "border-[#1c1c1c] bg-[#1c1c1c] text-[#f7f5ef]"
                : "border-transparent text-[#6b6b6b] hover:border-[#1c1c1c] hover:text-[#1c1c1c]"
            }`}
            key={productCategory}
            onClick={() => onCategoryChange(productCategory)}
            type="button"
          >
            {productCategory}
          </button>
        ))}
      </div>
    </section>
  );
}
