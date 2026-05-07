import { create } from "zustand";
import { api, type Exercise, type ExerciseInput } from "../api/client";
import { bypassExercises } from "./bypassMockData";

const isAuthBypassEnabled = import.meta.env.VITE_BYPASS_AUTH === "true";

type ExercisesState = {
  exercises: Exercise[];
  isLoading: boolean;
  error: string | null;
  fetchExercises: () => Promise<void>;
  createExercise: (data: ExerciseInput) => Promise<void>;
  updateExercise: (id: string, data: Partial<ExerciseInput>) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
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
  async createExercise(data) {
    if (isAuthBypassEnabled) {
      const exercise: Exercise = {
        id: `bypass-exercise-${Date.now()}`,
        name: data.name,
        description: data.description ?? null,
        muscleGroup: data.muscleGroup,
        equipment: data.equipment ?? "none",
        difficulty: data.difficulty ?? "beginner",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set((state) => ({ exercises: [exercise, ...state.exercises], error: null }));
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const exercise = await api.createExercise(data);
      set((state) => ({
        exercises: [exercise, ...state.exercises],
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },
  async updateExercise(id, data) {
    if (isAuthBypassEnabled) {
      set((state) => ({
        exercises: state.exercises.map((exercise) =>
          exercise.id === id
            ? { ...exercise, ...data, updatedAt: new Date().toISOString() }
            : exercise,
        ),
        error: null,
      }));
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const updated = await api.updateExercise(id, data);
      set((state) => ({
        exercises: state.exercises.map((exercise) =>
          exercise.id === id ? updated : exercise,
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },
  async deleteExercise(id) {
    if (isAuthBypassEnabled) {
      set((state) => ({
        exercises: state.exercises.filter((exercise) => exercise.id !== id),
        error: null,
      }));
      return;
    }

    set({ isLoading: true, error: null });
    try {
      await api.deleteExercise(id);
      set((state) => ({
        exercises: state.exercises.filter((exercise) => exercise.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },
}));
