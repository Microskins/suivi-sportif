import { create } from "zustand";
import { api, type Exercise } from "../api/client";
import { bypassExercises } from "./bypassMockData";

const isAuthBypassEnabled = import.meta.env.VITE_BYPASS_AUTH === "true";

type ExercisesState = {
  exercises: Exercise[];
  isLoading: boolean;
  error: string | null;
  fetchExercises: () => Promise<void>;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Impossible de charger les exercices";
}

export const useExercisesStore = create<ExercisesState>((set) => ({
  exercises: isAuthBypassEnabled ? bypassExercises : [],
  isLoading: false,
  error: null,
  async fetchExercises() {
    if (isAuthBypassEnabled) {
      set({ exercises: bypassExercises, isLoading: false, error: null });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const exercises = await api.getExercises();
      set({ exercises, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
    }
  },
}));
