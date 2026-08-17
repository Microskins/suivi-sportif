import { create } from "zustand";
import type { ProductCategory } from "./price-data";

type PriceComparisonState = {
  category: ProductCategory;
  query: string;
  resetFilters: () => void;
  setCategory: (category: ProductCategory) => void;
  setQuery: (query: string) => void;
};

export const usePriceComparisonStore = create<PriceComparisonState>((set) => ({
  category: "Tous",
  query: "",
  resetFilters: () => set({ category: "Tous", query: "" }),
  setCategory: (category) => set({ category }),
  setQuery: (query) => set({ query }),
}));
