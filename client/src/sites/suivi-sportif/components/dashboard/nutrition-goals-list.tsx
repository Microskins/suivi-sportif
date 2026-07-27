import type { NutritionGoal } from "../../api/client";
import { EmptyState, ItemActions, itemCardClass } from "./shared";

type NutritionGoalsListProps = {
  goals: NutritionGoal[];
  onEdit: (item: NutritionGoal) => void;
  onDelete: (item: NutritionGoal) => void;
};

function toInputDate(value?: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

export function NutritionGoalsList({ goals, onEdit, onDelete }: NutritionGoalsListProps) {
  if (!goals.length) {
    return <EmptyState label="Aucun objectif nutrition. Ajoute une cible pour lire les ecarts calories et macros." />;
  }

  return (
    <ul className="grid gap-3 lg:grid-cols-2">
      {goals.map((goal) => (
        <li key={goal.id} className={itemCardClass}>
          <div className="flex h-full flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{goal.name}</p>
                {goal.isActive && (
                  <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                    Actif
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-600">{goal.dailyCaloriesKcal} kcal/jour</p>
              <p className="mt-1 text-xs text-slate-500">
                Depuis {toInputDate(goal.startDate)}
                {goal.endDate ? ` jusqu'au ${toInputDate(goal.endDate)}` : ""}
              </p>
            </div>
            <ItemActions item={goal} onEdit={onEdit} onDelete={onDelete} />
          </div>
        </li>
      ))}
    </ul>
  );
}
