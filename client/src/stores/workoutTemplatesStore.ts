import { create } from "zustand";
import { api, type Workout, type WorkoutTemplate } from "../api/client";
import { bypassWorkoutTemplates } from "./bypassMockData";
import { useWorkoutsStore } from "./workoutsStore";

const isAuthBypassEnabled = import.meta.env.VITE_BYPASS_AUTH === "true";
const bypassUserId = "00000000-0000-4000-8000-000000000000";

type WorkoutTemplatesState = {
  workoutTemplates: WorkoutTemplate[];
  isLoading: boolean;
  error: string | null;
  fetchWorkoutTemplates: () => Promise<void>;
  instantiateWorkoutTemplate: (id: string, date: string) => Promise<void>;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Impossible de charger les modeles de seances";
}

function buildWorkoutFromTemplate(
  template: WorkoutTemplate,
  date: string,
): Workout {
  const now = new Date().toISOString();

  return {
    id: `bypass-workout-from-template-${Date.now()}`,
    userId: bypassUserId,
    name: template.name,
    date,
    duration: template.duration,
    notes: template.description,
    createdAt: now,
    updatedAt: now,
    exercises: template.exercises.map((templateExercise) => ({
      id: `bypass-workout-template-exercise-${Date.now()}-${templateExercise.order}`,
      exerciseId: templateExercise.exerciseId,
      order: templateExercise.order,
      exercise: templateExercise.exercise,
      sets: Array.from({ length: templateExercise.sets }, (_, setIndex) => ({
        id: `bypass-template-set-${Date.now()}-${templateExercise.order}-${setIndex}`,
        setNumber: setIndex + 1,
        reps: templateExercise.reps,
        weight: templateExercise.weight,
        rest: templateExercise.rest,
        createdAt: now,
      })),
    })),
  };
}

export const useWorkoutTemplatesStore = create<WorkoutTemplatesState>((set) => ({
  workoutTemplates: isAuthBypassEnabled ? bypassWorkoutTemplates : [],
  isLoading: false,
  error: null,
  async fetchWorkoutTemplates() {
    if (isAuthBypassEnabled) {
      set({
        workoutTemplates: bypassWorkoutTemplates,
        isLoading: false,
        error: null,
      });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const workoutTemplates = await api.getWorkoutTemplates();
      set({ workoutTemplates, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
    }
  },
  async instantiateWorkoutTemplate(id, date) {
    if (isAuthBypassEnabled) {
      const template = bypassWorkoutTemplates.find((item) => item.id === id);
      if (!template) {
        set({ error: "Modele de seance introuvable" });
        throw new Error("Modele de seance introuvable");
      }

      const workout = buildWorkoutFromTemplate(template, date);
      useWorkoutsStore.setState((state) => ({
        workouts: [workout, ...state.workouts],
        error: null,
      }));
      set({ error: null });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const workout = await api.instantiateWorkoutTemplate(id, date);
      useWorkoutsStore.setState((state) => ({
        workouts: [workout, ...state.workouts],
        error: null,
      }));
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },
}));
