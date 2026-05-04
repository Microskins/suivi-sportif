import { create } from "zustand";
import { api, type Exercise } from "../api/client";

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
  exercises: [],
  isLoading: false,
  error: null,
  async fetchExercises() {
    set({ isLoading: true, error: null });

    try {
      const exercises = await api.getExercises();
      set({ exercises, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
    }
  },
}));
