import { create } from "zustand";
import {
  api,
  type NutritionGoal,
  type NutritionGoalInput,
} from "../api/client";
import { bypassNutritionGoals } from "./bypassMockData";

const isAuthBypassEnabled = import.meta.env.VITE_BYPASS_AUTH === "true";

type NutritionGoalsState = {
  nutritionGoals: NutritionGoal[];
  isLoading: boolean;
  error: string | null;
  fetchNutritionGoals: () => Promise<void>;
  createNutritionGoal: (data: NutritionGoalInput) => Promise<void>;
  updateNutritionGoal: (
    id: string,
    data: Partial<NutritionGoalInput>,
  ) => Promise<void>;
  deleteNutritionGoal: (id: string) => Promise<void>;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Impossible de charger les objectifs nutrition";
}

function applyActiveState(
  goals: NutritionGoal[],
  updatedGoal: NutritionGoal,
): NutritionGoal[] {
  if (!updatedGoal.isActive) {
    return goals.map((goal) => (goal.id === updatedGoal.id ? updatedGoal : goal));
  }

  return goals.map((goal) =>
    goal.id === updatedGoal.id ? updatedGoal : { ...goal, isActive: false },
  );
}

export const useNutritionGoalsStore = create<NutritionGoalsState>((set) => ({
  nutritionGoals: isAuthBypassEnabled ? bypassNutritionGoals : [],
  isLoading: false,
  error: null,
  async fetchNutritionGoals() {
    if (isAuthBypassEnabled) {
      set({
        nutritionGoals: bypassNutritionGoals,
        isLoading: false,
        error: null,
      });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const nutritionGoals = await api.getNutritionGoals();
      set({ nutritionGoals, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
    }
  },
  async createNutritionGoal(data) {
    if (isAuthBypassEnabled) {
      const now = new Date().toISOString();
      const goal: NutritionGoal = {
        id: `bypass-nutrition-goal-${Date.now()}`,
        userId: "00000000-0000-4000-8000-000000000000",
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate ?? null,
        dailyCaloriesKcal: data.dailyCaloriesKcal,
        dailyProteinGrams: data.dailyProteinGrams ?? null,
        dailyCarbsGrams: data.dailyCarbsGrams ?? null,
        dailyFatGrams: data.dailyFatGrams ?? null,
        isActive: data.isActive ?? true,
        createdAt: now,
        updatedAt: now,
      };
      set((state) => ({
        nutritionGoals: goal.isActive
          ? [goal, ...state.nutritionGoals.map((item) => ({ ...item, isActive: false }))]
          : [goal, ...state.nutritionGoals],
        error: null,
      }));
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const goal = await api.createNutritionGoal(data);
      set((state) => ({
        nutritionGoals: goal.isActive
          ? [goal, ...state.nutritionGoals.map((item) => ({ ...item, isActive: false }))]
          : [goal, ...state.nutritionGoals],
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },
  async updateNutritionGoal(id, data) {
    if (isAuthBypassEnabled) {
      set((state) => {
        const current = state.nutritionGoals.find((goal) => goal.id === id);
        if (!current) {
          return state;
        }

        const updated: NutritionGoal = {
          ...current,
          ...data,
          endDate: data.endDate === undefined ? current.endDate : data.endDate,
          updatedAt: new Date().toISOString(),
        };
        return {
          nutritionGoals: applyActiveState(state.nutritionGoals, updated),
          error: null,
        };
      });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const updated = await api.updateNutritionGoal(id, data);
      set((state) => ({
        nutritionGoals: applyActiveState(state.nutritionGoals, updated),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },
  async deleteNutritionGoal(id) {
    if (isAuthBypassEnabled) {
      set((state) => ({
        nutritionGoals: state.nutritionGoals.filter((goal) => goal.id !== id),
        error: null,
      }));
      return;
    }

    set({ isLoading: true, error: null });
    try {
      await api.deleteNutritionGoal(id);
      set((state) => ({
        nutritionGoals: state.nutritionGoals.filter((goal) => goal.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },
}));
