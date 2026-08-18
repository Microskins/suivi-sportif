import { create } from "zustand";
import type { ProductCategory } from "./price-data";

type PriceComparisonState = {
  category: ProductCategory;
  query: string;
  resetFilters: () => void;
  setCategory: (category: ProductCategory) => void;
  setFilters: (
    filters: Pick<PriceComparisonState, "category" | "query">,
  ) => void;
  setQuery: (query: string) => void;
};

export const usePriceComparisonStore = create<PriceComparisonState>((set) => ({
  category: "Tous",
  query: "",
  resetFilters: () => set({ category: "Tous", query: "" }),
  setCategory: (category) => set({ category }),
  setFilters: (filters) => set(filters),
  setQuery: (query) => set({ query }),
}));
