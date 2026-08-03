import type { Food, NutritionGoal, Workout } from "../../api/client";
import type { DashboardResource } from "./resource-header";

export type ModalState =
  | { type: "workout"; item?: Workout; prefillWorkout?: Workout; presetDate?: string }
  | { type: "workout-template" }
  | { type: "food"; item?: Food }
  | { type: "goal"; item?: NutritionGoal }
  | null;

export function openCreate(
  resource: DashboardResource,
  setModal: (modal: ModalState) => void,
) {
  if (resource === "workouts") setModal({ type: "workout" });
  if (resource === "foods") setModal({ type: "food" });
  if (resource === "goals") setModal({ type: "goal" });
}

export function modalTitle(modal: Exclude<ModalState, null>) {
  if (modal.type === "workout-template") {
    return "Créer depuis un modèle";
  }

  const prefix = modal.item ? "Modifier" : "Créer";
  const names = {
    workout: "une séance",
    food: "un aliment",
    goal: "un objectif",
  };
  return `${prefix} ${names[modal.type]}`;
}
