import type { Meal, NutritionGoal } from "../../api/client";

export type MacroTotals = {
  caloriesKcal: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
};

export function emptyMacroTotals(): MacroTotals {
  return { caloriesKcal: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0 };
}

export function roundMacro(value: number) {
  return Math.round(value * 10) / 10;
}

export function safeDateToIso(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

export function localDateKey(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
    .toISOString()
    .slice(0, 10);
}

export function activeNutritionGoalForDate(goals: NutritionGoal[], dateIso: string) {
  const day = new Date(dateIso).getTime();
  return goals.find((goal) => {
    if (!goal.isActive) return false;
    const start = new Date(goal.startDate).getTime();
    const end = goal.endDate ? new Date(goal.endDate).getTime() : Number.POSITIVE_INFINITY;
    return day >= start && day <= end;
  }) ?? goals.find((goal) => goal.isActive) ?? null;
}

export function dayMealTotals(meals: Meal[], dateIso: string) {
  const key = localDateKey(dateIso);
  return meals
    .filter((meal) => localDateKey(meal.date) === key)
    .reduce((totals, meal) => ({
      caloriesKcal: totals.caloriesKcal + meal.totals.caloriesKcal,
      proteinGrams: totals.proteinGrams + meal.totals.proteinGrams,
      carbsGrams: totals.carbsGrams + meal.totals.carbsGrams,
      fatGrams: totals.fatGrams + meal.totals.fatGrams,
    }), emptyMacroTotals());
}

export function macroDeltaLabel(current: number, target: number | null) {
  if (target === null || target <= 0) return "Objectif non renseigne";
  const delta = roundMacro(current - target);
  if (delta === 0) return "pile sur cible";
  return delta > 0 ? `+${delta}` : `${delta}`;
}
