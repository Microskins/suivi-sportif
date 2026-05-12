import { create } from "zustand";
import {
  api,
  type Workout,
  type WorkoutInput,
  type WorkoutStatus,
} from "../api/client";
import { bypassWorkouts } from "./bypassMockData";

const isAuthBypassEnabled = import.meta.env.VITE_BYPASS_AUTH === "true";

type WorkoutsState = {
  workouts: Workout[];
  isLoading: boolean;
  error: string | null;
  fetchWorkouts: () => Promise<void>;
  createWorkout: (data: WorkoutInput) => Promise<void>;
  updateWorkout: (id: string, data: Partial<WorkoutInput>) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Impossible de charger les seances";
}

function buildBypassWorkoutExercises(data: WorkoutInput, now: string) {
  return data.exercises?.map((exercise, exerciseIndex) => ({
    id: `bypass-workout-exercise-${Date.now()}-${exerciseIndex}`,
    exerciseId: exercise.exerciseId,
    order: exerciseIndex,
    sets: exercise.sets.map((set, setIndex) => ({
      id: `bypass-set-${Date.now()}-${exerciseIndex}-${setIndex}`,
      setNumber: setIndex + 1,
      reps: set.reps,
      weight: set.weight,
      rest: set.rest,
      createdAt: now,
    })),
  }));
}

function inferStatusFromDate(dateIso: string): WorkoutStatus {
  return new Date(dateIso).getTime() > Date.now() ? "PLANNED" : "COMPLETED";
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
  async createWorkout(data) {
    if (isAuthBypassEnabled) {
      const workout: Workout = {
        id: `bypass-workout-${Date.now()}`,
        userId: "00000000-0000-4000-8000-000000000000",
        name: data.name,
        date: data.date,
        status: data.status ?? inferStatusFromDate(data.date),
        duration: data.duration,
        notes: data.notes ?? null,
        exercises: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set((state) => ({ workouts: [workout, ...state.workouts], error: null }));
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const workout = await api.createWorkout(data);
      set((state) => ({
        workouts: [workout, ...state.workouts],
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },
  async updateWorkout(id, data) {
    if (isAuthBypassEnabled) {
      set((state) => ({
        workouts: state.workouts.map((workout) =>
          workout.id === id
            ? {
                ...workout,
                name: data.name ?? workout.name,
                date: data.date ?? workout.date,
                status:
                  data.status ??
                  (data.date ? inferStatusFromDate(data.date) : workout.status),
                duration: data.duration ?? workout.duration,
                notes: data.notes === undefined ? workout.notes : data.notes,
                exercises: data.exercises
                  ? buildBypassWorkoutExercises(data as WorkoutInput, new Date().toISOString())
                  : workout.exercises,
                updatedAt: new Date().toISOString(),
              }
            : workout,
        ),
        error: null,
      }));
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const updated = await api.updateWorkout(id, data);
      set((state) => ({
        workouts: state.workouts.map((workout) =>
          workout.id === id ? updated : workout,
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },
  async deleteWorkout(id) {
    if (isAuthBypassEnabled) {
      set((state) => ({
        workouts: state.workouts.filter((workout) => workout.id !== id),
        error: null,
      }));
      return;
    }

    set({ isLoading: true, error: null });
    try {
      await api.deleteWorkout(id);
      set((state) => ({
        workouts: state.workouts.filter((workout) => workout.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },
}));
