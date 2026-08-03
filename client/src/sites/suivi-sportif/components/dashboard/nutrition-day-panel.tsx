import { useState } from "react";
import type { Meal, NutritionGoal } from "../../api/client";
import { inputClass } from "./shared";
import {
  activeNutritionGoalForDate,
  dayMealTotals,
  localDateKey,
  macroDeltaLabel,
  roundMacro,
  safeDateToIso,
} from "./nutrition";

type NutritionDayPanelProps = {
  meals: Meal[];
  goals: NutritionGoal[];
};

function toInputDate(value?: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

export function NutritionDayPanel({ meals, goals }: NutritionDayPanelProps) {
  const [selectedDate, setSelectedDate] = useState(toInputDate(new Date().toISOString()));
  const selectedDateIso = safeDateToIso(selectedDate);
  const goal = activeNutritionGoalForDate(goals, selectedDateIso);
  const totals = dayMealTotals(meals, selectedDateIso);
  const dayMeals = meals.filter((meal) => localDateKey(meal.date) === selectedDate);

  return (
    <section className="rounded border border-amber-200 bg-amber-50/70 p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="font-semibold text-amber-950">Objectif du jour</h3>
          <p className="mt-1 text-sm text-amber-800/80">
            {goal
              ? `Comparaison avec ${goal.name}.`
              : "Aucun objectif actif sur cette date."}
          </p>
        </div>
        <input
          className={`${inputClass} max-w-44 bg-white`}
          type="date"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
        />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        {[
          ["Calories", totals.caloriesKcal, goal?.dailyCaloriesKcal ?? null, "kcal"],
          ["Protéines", totals.proteinGrams, goal?.dailyProteinGrams ?? null, "g"],
          ["Glucides", totals.carbsGrams, goal?.dailyCarbsGrams ?? null, "g"],
          ["Lipides", totals.fatGrams, goal?.dailyFatGrams ?? null, "g"],
        ].map(([label, value, target, unit]) => {
          const numericValue = value as number;
          const numericTarget = typeof target === "number" ? target : null;
          const progress = numericTarget && numericTarget > 0
            ? Math.min(100, Math.round((numericValue / numericTarget) * 100))
            : 0;
          return (
            <div key={label as string} className="rounded border border-amber-100 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">{label}</p>
              <p className="mt-2 text-xl font-bold text-amber-950">
                {roundMacro(numericValue)} {unit}
              </p>
              <p className="mt-1 text-xs text-amber-700">
                {numericTarget ? `${macroDeltaLabel(numericValue, numericTarget)} ${unit}` : "Objectif non renseigne"}
              </p>
              <progress className="mt-2 h-2 w-full overflow-hidden rounded accent-amber-500" value={progress} max={100} />
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-sm text-amber-800">
        {dayMeals.length
          ? `${dayMeals.length} repas saisi(s) sur la journee.`
          : "Aucun repas saisi sur cette journee."}
      </p>
    </section>
  );
}
