import { create } from "zustand";
import { api, type Food, type FoodInput } from "../api/client";
import { bypassFoods } from "./bypassMockData";

const isAuthBypassEnabled = import.meta.env.VITE_BYPASS_AUTH === "true";

type FoodsState = {
  foods: Food[];
  isLoading: boolean;
  error: string | null;
  fetchFoods: () => Promise<void>;
  createFood: (data: FoodInput) => Promise<void>;
  updateFood: (id: string, data: Partial<FoodInput>) => Promise<void>;
  deleteFood: (id: string) => Promise<void>;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Impossible de charger les aliments";
}

export const useFoodsStore = create<FoodsState>((set) => ({
  foods: isAuthBypassEnabled ? bypassFoods : [],
  isLoading: false,
  error: null,
  async fetchFoods() {
    if (isAuthBypassEnabled) {
      set({ foods: bypassFoods, isLoading: false, error: null });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const foods = await api.getFoods();
      set({ foods, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
    }
  },
  async createFood(data) {
    if (isAuthBypassEnabled) {
      const food: Food = {
        id: `bypass-food-${Date.now()}`,
        userId: "00000000-0000-4000-8000-000000000000",
        name: data.name,
        brand: data.brand ?? null,
        barcode: data.barcode ?? null,
        caloriesKcal: data.caloriesKcal,
        proteinGrams: data.proteinGrams,
        carbsGrams: data.carbsGrams,
        fatGrams: data.fatGrams,
        fiberGrams: data.fiberGrams ?? null,
        servingUnit: data.servingUnit ?? "g",
        isGlobal: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set((state) => ({ foods: [food, ...state.foods], error: null }));
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const food = await api.createFood(data);
      set((state) => ({ foods: [food, ...state.foods], isLoading: false }));
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },
  async updateFood(id, data) {
    if (isAuthBypassEnabled) {
      set((state) => ({
        foods: state.foods.map((food) =>
          food.id === id
            ? { ...food, ...data, updatedAt: new Date().toISOString() }
            : food,
        ),
        error: null,
      }));
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const updated = await api.updateFood(id, data);
      set((state) => ({
        foods: state.foods.map((food) => (food.id === id ? updated : food)),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },
  async deleteFood(id) {
    if (isAuthBypassEnabled) {
      set((state) => ({
        foods: state.foods.filter((food) => food.id !== id),
        error: null,
      }));
      return;
    }

    set({ isLoading: true, error: null });
    try {
      await api.deleteFood(id);
      set((state) => ({
        foods: state.foods.filter((food) => food.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },
}));
