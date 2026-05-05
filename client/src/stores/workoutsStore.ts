import { create } from "zustand";
import { api, type Workout } from "../api/client";
import { bypassWorkouts } from "./bypassMockData";

const isAuthBypassEnabled = import.meta.env.VITE_BYPASS_AUTH === "true";

type WorkoutsState = {
  workouts: Workout[];
  isLoading: boolean;
  error: string | null;
  fetchWorkouts: () => Promise<void>;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Impossible de charger les seances";
}

export const useWorkoutsStore = create<WorkoutsState>((set) => ({
  workouts: isAuthBypassEnabled ? bypassWorkouts : [],
  isLoading: false,
  error: null,
  async fetchWorkouts() {
    if (isAuthBypassEnabled) {
      set({ workouts: bypassWorkouts, isLoading: false, error: null });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const workouts = await api.getWorkouts();
      set({ workouts, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
    }
  },
}));
