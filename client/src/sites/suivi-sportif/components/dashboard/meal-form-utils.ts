import type {
  Food,
  Meal,
  MealInput,
  MealType,
  NutritionGoal,
} from "../../api/client";
import { emptyMacroTotals, type MacroTotals } from "./nutrition";

export type MealItemFormRow = {
  foodId: string;
  quantityGrams: string;
};

export type MealTemplate = {
  id: string;
  name: string;
  mealType: MealType;
  notes: string | null;
  items: MealItemFormRow[];
};

export type MealFormProps = {
  item?: Meal;
  foods: Food[];
  meals: Meal[];
  nutritionGoals: NutritionGoal[];
  onSubmit: (data: MealInput) => Promise<void>;
  onCancel: () => void;
};

export const foodDragDataType = "application/x-suivi-sportif-food-id";

const MEAL_TEMPLATES_STORAGE_KEY = "suivi-sportif-meal-templates-v1";

export const mealTypes: Array<[MealType, string]> = [
  ["breakfast", "Petit-dejeuner"],
  ["lunch", "Dejeuner"],
  ["dinner", "Diner"],
  ["snack", "Collation"],
  ["other", "Autre"],
];

export function toInputDateTime(value?: string) {
  const date = value ? new Date(value) : new Date();
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
}

export function dateTimeToIso(value: string) {
  return new Date(value).toISOString();
}

export function safeDateTimeToIso(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

export function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function computeMealFormTotals(
  items: MealItemFormRow[],
  foods: Food[],
): MacroTotals {
  return items.reduce((totals, item) => {
    const food = foods.find((candidate) => candidate.id === item.foodId);
    const quantity = Number(item.quantityGrams);
    if (!food || Number.isNaN(quantity) || quantity <= 0) {
      return totals;
    }

    return {
      caloriesKcal: totals.caloriesKcal + (food.caloriesKcal * quantity) / 100,
      proteinGrams: totals.proteinGrams + (food.proteinGrams * quantity) / 100,
      carbsGrams: totals.carbsGrams + (food.carbsGrams * quantity) / 100,
      fatGrams: totals.fatGrams + (food.fatGrams * quantity) / 100,
    };
  }, emptyMacroTotals());
}

export function recentFoodPortions(foodId: string, meals: Meal[]) {
  const portions = [...meals]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .flatMap((meal) =>
      meal.items
        .filter((item) => item.foodId === foodId)
        .map((item) => item.quantityGrams),
    );

  return Array.from(new Set(portions)).slice(0, 3);
}

export function defaultMealItemRow(food: Food | null): MealItemFormRow {
  return { foodId: food?.id ?? "", quantityGrams: "100" };
}

export function insertMealItemRow(
  items: MealItemFormRow[],
  food: Food,
  insertIndex: number,
) {
  const next = [...items];
  const boundedIndex = Math.max(0, Math.min(insertIndex, next.length));
  next.splice(boundedIndex, 0, defaultMealItemRow(food));
  return next;
}

export function readMealTemplates() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(MEAL_TEMPLATES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (template): template is MealTemplate =>
        typeof template.id === "string" &&
        typeof template.name === "string" &&
        Array.isArray(template.items),
    );
  } catch {
    return [];
  }
}

export function writeMealTemplates(templates: MealTemplate[]) {
  window.localStorage.setItem(
    MEAL_TEMPLATES_STORAGE_KEY,
    JSON.stringify(templates),
  );
}

export function duplicateMealInput(meal: Meal): MealInput | null {
  const items = meal.items
    .filter((mealItem) => mealItem.foodId)
    .map((mealItem) => ({
      foodId: mealItem.foodId as string,
      quantityGrams: mealItem.quantityGrams,
    }));

  if (!items.length) return null;

  return {
    name: `Copie - ${meal.name}`,
    date: new Date().toISOString(),
    mealType: meal.mealType,
    notes: meal.notes,
    items,
  };
}
