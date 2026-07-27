import { create } from "zustand";
import { persist } from "zustand/middleware";

type TrekkingState = {
  packedItemIds: string[];
  togglePackedItem: (itemId: string) => void;
  resetPackedItems: () => void;
};

export const useTrekkingStore = create<TrekkingState>()(
  persist(
    (set) => ({
      packedItemIds: [],
      togglePackedItem(itemId) {
        set((state) => ({
          packedItemIds: state.packedItemIds.includes(itemId)
            ? state.packedItemIds.filter((id) => id !== itemId)
            : [...state.packedItemIds, itemId],
        }));
      },
      resetPackedItems() {
        set({ packedItemIds: [] });
      },
    }),
    { name: "vosges-wild-pack" },
  ),
);
