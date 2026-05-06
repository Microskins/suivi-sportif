import { create } from "zustand";
import { api, type Food, type Meal, type MealInput } from "../api/client";
import { bypassMeals } from "./bypassMockData";

const isAuthBypassEnabled = import.meta.env.VITE_BYPASS_AUTH === "true";

type MealsState = {
  meals: Meal[];
  isLoading: boolean;
  error: string | null;
  fetchMeals: () => Promise<void>;
  createMeal: (data: MealInput, foods?: Food[]) => Promise<void>;
  updateMeal: (id: string, data: Partial<MealInput>, foods?: Food[]) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Impossible de charger les repas";
}

function buildBypassMeal(data: MealInput, foods: Food[] = [], id: string): Meal {
  const createdAt = new Date().toISOString();
  const items = data.items.map((item, index) => {
    const food = foods.find((candidate) => candidate.id === item.foodId);
    const caloriesKcal = ((food?.caloriesKcal ?? 0) * item.quantityGrams) / 100;
    const proteinGrams = ((food?.proteinGrams ?? 0) * item.quantityGrams) / 100;
    const carbsGrams = ((food?.carbsGrams ?? 0) * item.quantityGrams) / 100;
    const fatGrams = ((food?.fatGrams ?? 0) * item.quantityGrams) / 100;

    return {
      id: `${id}-item-${index}`,
      foodId: item.foodId,
      foodName: food?.name ?? "Aliment",
      quantityGrams: item.quantityGrams,
      caloriesKcalPer100g: food?.caloriesKcal ?? 0,
      proteinGramsPer100g: food?.proteinGrams ?? 0,
      carbsGramsPer100g: food?.carbsGrams ?? 0,
      fatGramsPer100g: food?.fatGrams ?? 0,
      totals: { caloriesKcal, proteinGrams, carbsGrams, fatGrams },
      createdAt,
    };
  });

  return {
    id,
    userId: "00000000-0000-4000-8000-000000000000",
    name: data.name,
    date: data.date,
    mealType: data.mealType ?? "other",
    notes: data.notes ?? null,
    createdAt,
    updatedAt: createdAt,
    items,
    totals: items.reduce(
      (totals, item) => ({
        caloriesKcal: totals.caloriesKcal + item.totals.caloriesKcal,
        proteinGrams: totals.proteinGrams + item.totals.proteinGrams,
        carbsGrams: totals.carbsGrams + item.totals.carbsGrams,
        fatGrams: totals.fatGrams + item.totals.fatGrams,
      }),
      { caloriesKcal: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0 },
    ),
  };
}

export const useMealsStore = create<MealsState>((set) => ({
  meals: isAuthBypassEnabled ? bypassMeals : [],
  isLoading: false,
  error: null,
  async fetchMeals() {
    if (isAuthBypassEnabled) {
      set({ meals: bypassMeals, isLoading: false, error: null });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const meals = await api.getMeals();
      set({ meals, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
    }
  },
  async createMeal(data, foods) {
    if (isAuthBypassEnabled) {
      const meal = buildBypassMeal(data, foods, `bypass-meal-${Date.now()}`);
      set((state) => ({ meals: [meal, ...state.meals], error: null }));
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const meal = await api.createMeal(data);
      set((state) => ({ meals: [meal, ...state.meals], isLoading: false }));
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },
  async updateMeal(id, data, foods) {
    if (isAuthBypassEnabled) {
      set((state) => {
        const current = state.meals.find((meal) => meal.id === id);
        if (!current) {
          return state;
        }

        const updatedInput: MealInput = {
          name: data.name ?? current.name,
          date: data.date ?? current.date,
          mealType: data.mealType ?? current.mealType,
          notes: data.notes ?? current.notes,
          items:
            data.items ??
            current.items
              .filter((item) => item.foodId)
              .map((item) => ({
                foodId: item.foodId as string,
                quantityGrams: item.quantityGrams,
              })),
        };
        const updated = buildBypassMeal(updatedInput, foods, id);
        return {
          meals: state.meals.map((meal) => (meal.id === id ? updated : meal)),
          error: null,
        };
      });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const updated = await api.updateMeal(id, data);
      set((state) => ({
        meals: state.meals.map((meal) => (meal.id === id ? updated : meal)),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },
  async deleteMeal(id) {
    if (isAuthBypassEnabled) {
      set((state) => ({
        meals: state.meals.filter((meal) => meal.id !== id),
        error: null,
      }));
      return;
    }

    set({ isLoading: true, error: null });
    try {
      await api.deleteMeal(id);
      set((state) => ({
        meals: state.meals.filter((meal) => meal.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },
}));
