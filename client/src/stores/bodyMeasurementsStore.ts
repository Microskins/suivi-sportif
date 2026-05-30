import { create } from "zustand";
import {
  api,
  type BodyMeasurement,
  type BodyMeasurementInput,
} from "../api/client";
import { bypassBodyMeasurements } from "./bypassMockData";

const isAuthBypassEnabled = import.meta.env.VITE_BYPASS_AUTH === "true";
const bypassUserId = "00000000-0000-4000-8000-000000000000";

type BodyMeasurementsState = {
  bodyMeasurements: BodyMeasurement[];
  isLoading: boolean;
  error: string | null;
  fetchBodyMeasurements: () => Promise<void>;
  createBodyMeasurement: (data: BodyMeasurementInput) => Promise<void>;
  updateBodyMeasurement: (
    id: string,
    data: Partial<BodyMeasurementInput>,
  ) => Promise<void>;
  deleteBodyMeasurement: (id: string) => Promise<void>;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Impossible de charger les mensurations";
}

function sortByDateDesc(measurements: BodyMeasurement[]) {
  return [...measurements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

function createBypassMeasurement(
  data: BodyMeasurementInput,
): BodyMeasurement {
  const now = new Date().toISOString();
  return {
    id: `bypass-body-measurement-${Date.now()}`,
    userId: bypassUserId,
    date: data.date,
    silhouette: data.silhouette ?? "MALE",
    isActiveLifestyle: data.isActiveLifestyle ?? null,
    weightKg: data.weightKg ?? null,
    heightCm: data.heightCm ?? null,
    chestCm: data.chestCm ?? null,
    waistCm: data.waistCm ?? null,
    hipsCm: data.hipsCm ?? null,
    neckCm: data.neckCm ?? null,
    shouldersCm: data.shouldersCm ?? null,
    leftArmCm: data.leftArmCm ?? null,
    rightArmCm: data.rightArmCm ?? null,
    leftForearmCm: data.leftForearmCm ?? null,
    rightForearmCm: data.rightForearmCm ?? null,
    leftThighCm: data.leftThighCm ?? null,
    rightThighCm: data.rightThighCm ?? null,
    leftCalfCm: data.leftCalfCm ?? null,
    rightCalfCm: data.rightCalfCm ?? null,
    notes: data.notes ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

export const useBodyMeasurementsStore = create<BodyMeasurementsState>((set) => ({
  bodyMeasurements: isAuthBypassEnabled ? bypassBodyMeasurements : [],
  isLoading: false,
  error: null,
  async fetchBodyMeasurements() {
    if (isAuthBypassEnabled) {
      set({
        bodyMeasurements: sortByDateDesc(bypassBodyMeasurements),
        isLoading: false,
        error: null,
      });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const bodyMeasurements = await api.getBodyMeasurements();
      set({ bodyMeasurements, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
    }
  },
  async createBodyMeasurement(data) {
    if (isAuthBypassEnabled) {
      const measurement = createBypassMeasurement(data);
      set((state) => ({
        bodyMeasurements: sortByDateDesc([
          measurement,
          ...state.bodyMeasurements,
        ]),
        error: null,
      }));
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const measurement = await api.createBodyMeasurement(data);
      set((state) => ({
        bodyMeasurements: sortByDateDesc([
          measurement,
          ...state.bodyMeasurements,
        ]),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },
  async updateBodyMeasurement(id, data) {
    if (isAuthBypassEnabled) {
      set((state) => ({
        bodyMeasurements: sortByDateDesc(
          state.bodyMeasurements.map((measurement) =>
            measurement.id === id
              ? { ...measurement, ...data, updatedAt: new Date().toISOString() }
              : measurement,
          ),
        ),
        error: null,
      }));
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const updated = await api.updateBodyMeasurement(id, data);
      set((state) => ({
        bodyMeasurements: sortByDateDesc(
          state.bodyMeasurements.map((measurement) =>
            measurement.id === id ? updated : measurement,
          ),
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },
  async deleteBodyMeasurement(id) {
    if (isAuthBypassEnabled) {
      set((state) => ({
        bodyMeasurements: state.bodyMeasurements.filter(
          (measurement) => measurement.id !== id,
        ),
        error: null,
      }));
      return;
    }

    set({ isLoading: true, error: null });
    try {
      await api.deleteBodyMeasurement(id);
      set((state) => ({
        bodyMeasurements: state.bodyMeasurements.filter(
          (measurement) => measurement.id !== id,
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      throw error;
    }
  },
}));
