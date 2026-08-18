import { PRODUCT_CATEGORIES, type ProductCategory } from "./price-data";
import { COMPARISON_AREA } from "./store-locations";

export type PriceSearchFilters = {
  category: ProductCategory;
  query: string;
};

function isProductCategory(value: string | null): value is ProductCategory {
  return PRODUCT_CATEGORIES.some((category) => category === value);
}

function normalizeTicketValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .trim();
}

function ticketHash(value: string) {
  let hash = 2166136261;

  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return Math.abs(hash >>> 0) % 10000;
}

export function readPriceSearchParams(search: string): PriceSearchFilters {
  const params = new URLSearchParams(search);
  const category = params.get("categorie");

  return {
    category: isProductCategory(category) ? category : "Tous",
    query: params.get("q")?.trim() ?? "",
  };
}

export function buildPriceSearchUrl(
  location: Pick<Location, "hash" | "pathname">,
  filters: PriceSearchFilters,
) {
  const params = new URLSearchParams();
  const query = filters.query.trim();

  params.set("zone", COMPARISON_AREA.postalCode);

  if (query) {
    params.set("q", query);
  }

  if (filters.category !== "Tous") {
    params.set("categorie", filters.category);
  }

  return `${location.pathname}?${params.toString()}${location.hash}`;
}

export function createTicketNumber(filters: PriceSearchFilters) {
  const fingerprint = [
    COMPARISON_AREA.postalCode,
    normalizeTicketValue(filters.query),
    normalizeTicketValue(filters.category),
  ].join("|");
  const suffix = String(ticketHash(fingerprint)).padStart(4, "0");

  return `${COMPARISON_AREA.postalCode}-${suffix}`;
}
