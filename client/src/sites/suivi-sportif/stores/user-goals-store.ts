import { create } from "zustand";
import { api, type UserGoal, type UserGoalInput } from "../api/client";
import { bypassUserGoals } from "../data/bypass-mock-data";

const isAuthBypassEnabled = import.meta.env.VITE_BYPASS_AUTH === "true";
const bypassUserId = "00000000-0000-4000-8000-000000000000";

export type UserGoalsState = {
  userGoals: UserGoal[];
  isLoading: boolean;
  error: string | null;
  fetchUserGoals: () => Promise<void>;
  createUserGoal: (data: UserGoalInput) => Promise<void>;
  updateUserGoal: (id: string, data: Partial<UserGoalInput>) => Promise<void>;
  deleteUserGoal: (id: string) => Promise<void>;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Impossible de charger les objectifs";
}

function sortGoals(goals: UserGoal[]) {
  return [...goals].sort((a, b) => {
    if (a.isActive !== b.isActive) {
      return a.isActive ? -1 : 1;
    }

    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });
}

export const useUserGoalsStore = create<UserGoalsState>((set) => ({
  userGoals: isAuthBypassEnabled ? bypassUserGoals : [],
  isLoading: false,
  error: null,
  async fetchUserGoals() {
    if (isAuthBypassEnabled) {
      set({ userGoals: sortGoals(bypassUserGoals), isLoading: false, error: null });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const userGoals = await api.getUserGoals();
      set({ userGoals, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
    }
  },
  async createUserGoal(data) {
    if (isAuthBypassEnabled) {
      const now = new Date().toISOString();
      const goal: UserGoal = {
        id: `bypass-user-goal-${Date.now()}`,
        userId: bypassUserId,
        domain: data.domain,
        exerciseId: data.exerciseId ?? null,
        metric: data.metric,
        direction: data.direction ?? "AT_MOST",
        name: data.name,
        targetValue: data.targetValue,
        startDate: data.startDate,
        endDate: data.endDate ?? null,
        isActive: data.isActive ?? true,
        notes: data.notes ?? null,
        createdAt: now,
        updatedAt: now,
      };
      set((state) => ({
        userGoals: sortGoals([goal, ...state.userGoals]),
        error: null,
      }));
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const goal = await api.createUserGoal(data);
      set((state) => ({
        userGoals: sortGoals([goal, ...state.userGoals]),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },
  async updateUserGoal(id, data) {
    if (isAuthBypassEnabled) {
      set((state) => ({
        userGoals: sortGoals(
          state.userGoals.map((goal) =>
            goal.id === id
              ? {
                  ...goal,
                  ...data,
                  direction: data.direction ?? goal.direction,
                  endDate: data.endDate === undefined ? goal.endDate : data.endDate,
                  notes: data.notes === undefined ? goal.notes : data.notes,
                  updatedAt: new Date().toISOString(),
                }
              : goal,
          ),
        ),
        error: null,
      }));
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const updated = await api.updateUserGoal(id, data);
      set((state) => ({
        userGoals: sortGoals(
          state.userGoals.map((goal) => (goal.id === id ? updated : goal)),
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },
  async deleteUserGoal(id) {
    if (isAuthBypassEnabled) {
      set((state) => ({
        userGoals: state.userGoals.filter((goal) => goal.id !== id),
        error: null,
      }));
      return;
    }

    set({ isLoading: true, error: null });
    try {
      await api.deleteUserGoal(id);
      set((state) => ({
        userGoals: state.userGoals.filter((goal) => goal.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },
}));
