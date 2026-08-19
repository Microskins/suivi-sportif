import type { Meal, MealType } from "../../api/client";
import { formatDateMedium } from "./dashboard-helpers";
import { dangerButtonClass, EmptyState, itemCardClass, secondaryButtonClass } from "./shared";

type MealsListProps = {
  meals: Meal[];
  onEdit: (item: Meal) => void;
  onDuplicate: (item: Meal) => void;
  onDelete: (item: Meal) => void;
};

const mealTypes: Array<[MealType, string]> = [
  ["breakfast", "Petit-dejeuner"],
  ["lunch", "Dejeuner"],
  ["dinner", "Diner"],
  ["snack", "Collation"],
  ["other", "Autre"],
];

function labelFromOptions<T extends string>(
  options: Array<[T, string]>,
  value: T,
) {
  return options.find(([key]) => key === value)?.[1] ?? value;
}

export function MealsList({ meals, onEdit, onDuplicate, onDelete }: MealsListProps) {
  if (!meals.length) {
    return <EmptyState label="Aucun repas pour le moment. Saisis un repas pour comparer tes apports a tes objectifs." />;
  }

  return (
    <ul className="space-y-3">
      {meals.map((meal) => (
        <li key={meal.id} className={itemCardClass}>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="font-semibold">{meal.name}</p>
              <p className="mt-1 text-sm text-slate-600">
                {formatDateMedium(meal.date)} - {labelFromOptions(mealTypes, meal.mealType)}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {meal.totals.caloriesKcal} kcal - {meal.items.length} aliment(s)
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={secondaryButtonClass} onClick={() => onEdit(meal)}>
                Modifier
              </button>
              <button type="button" className={secondaryButtonClass} onClick={() => onDuplicate(meal)}>
                Dupliquer
              </button>
              <button type="button" className={dangerButtonClass} onClick={() => onDelete(meal)}>
                Supprimer
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
