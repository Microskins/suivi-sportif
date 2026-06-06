import type { Food, Meal, NutritionGoal } from "../../api/client";
import { MealForm } from "./MealForm";
import { MealsList } from "./MealsList";
import { NutritionDayPanel } from "./NutritionDayPanel";
import { activeViewButtonClass, inactiveViewButtonClass } from "./shared";

export function DashboardMealsSection({
  mealsView,
  mealDraft,
  meals,
  foods,
  nutritionGoals,
  onShowList,
  onShowCreate,
  onEditMeal,
  onDuplicateMeal,
  onDeleteMeal,
  onCancelMealForm,
  onSubmitMeal,
}: {
  mealsView: "list" | "create";
  mealDraft: Meal | undefined;
  meals: Meal[];
  foods: Food[];
  nutritionGoals: NutritionGoal[];
  onShowList: () => void;
  onShowCreate: () => void;
  onEditMeal: (meal: Meal) => void;
  onDuplicateMeal: (meal: Meal) => void;
  onDeleteMeal: (meal: Meal) => void;
  onCancelMealForm: () => void;
  onSubmitMeal: Parameters<typeof MealForm>[0]["onSubmit"];
}) {
  return (
    <div className="space-y-4">
      <NutritionDayPanel meals={meals} goals={nutritionGoals} />
      <div className="flex flex-wrap gap-2 rounded border border-amber-200 bg-amber-50/60 p-2">
        <button
          type="button"
          className={mealsView === "list" ? activeViewButtonClass : inactiveViewButtonClass}
          onClick={onShowList}
        >
          Liste
        </button>
        <button
          type="button"
          className={mealsView === "create" ? activeViewButtonClass : inactiveViewButtonClass}
          onClick={onShowCreate}
        >
          Creer un repas
        </button>
      </div>
      {mealsView === "create" ? (
        <div className="rounded border border-amber-200 bg-white p-4">
          <MealForm
            item={mealDraft}
            foods={foods}
            meals={meals}
            nutritionGoals={nutritionGoals}
            onCancel={onCancelMealForm}
            onSubmit={onSubmitMeal}
          />
        </div>
      ) : (
        <MealsList
          meals={meals}
          onEdit={onEditMeal}
          onDuplicate={onDuplicateMeal}
          onDelete={onDeleteMeal}
        />
      )}
    </div>
  );
}
