import { create } from "zustand";
import { api, type Workout } from "../api/client";

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
  workouts: [],
  isLoading: false,
  error: null,
  async fetchWorkouts() {
    set({ isLoading: true, error: null });

    try {
      const workouts = await api.getWorkouts();
      set({ workouts, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
    }
  },
}));
