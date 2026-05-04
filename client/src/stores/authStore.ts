import { create } from "zustand";
import { api, type User } from "../api/client";

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoading: boolean;
  error: string | null;
  initializeAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Une erreur est survenue";
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  isLoading: false,
  error: null,
  async initializeAuth() {
    const token = api.getToken();
    if (!token) {
      set({ isInitializing: false, isAuthenticated: false, user: null });
      return;
    }

    set({ isInitializing: true, error: null });

    try {
      const user = await api.getMe();
      set({ user, isAuthenticated: true, isInitializing: false });
    } catch (error) {
      api.logout();
      set({
        user: null,
        isAuthenticated: false,
        isInitializing: false,
        error: getErrorMessage(error),
      });
    }
  },
  async login(email, password) {
    set({ isLoading: true, error: null });

    try {
      const result = await api.login(email, password);
      set({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error),
        isAuthenticated: false,
        user: null,
      });
      throw error;
    }
  },
  async register(name, email, password) {
    set({ isLoading: true, error: null });

    try {
      const result = await api.register(email, password, name);
      set({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error),
        isAuthenticated: false,
        user: null,
      });
      throw error;
    }
  },
  logout() {
    api.logout();
    set({
      user: null,
      isAuthenticated: false,
      error: null,
      isLoading: false,
      isInitializing: false,
    });
  },
  clearError() {
    set({ error: null });
  },
}));
