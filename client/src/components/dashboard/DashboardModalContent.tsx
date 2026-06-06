import type { Exercise, Food, NutritionGoal, Workout } from "../../api/client";
import type { ModalState } from "./modalState";
import { FoodForm } from "./FoodForm";
import { NutritionGoalForm } from "./NutritionGoalForm";
import { WorkoutForm } from "./WorkoutForm";
import { WorkoutTemplatePicker } from "./WorkoutTemplatePicker";

export function DashboardModalContent({
  modal,
  exercises,
  workoutTemplates,
  getExerciseImageUrl,
  onClose,
  onCreateWorkout,
  onUpdateWorkout,
  onInstantiateWorkoutTemplate,
  onCreateWorkoutTemplate,
  onUpdateWorkoutTemplate,
  onCreateFood,
  onUpdateFood,
  onCreateNutritionGoal,
  onUpdateNutritionGoal,
}: {
  modal: ModalState;
  exercises: Exercise[];
  workoutTemplates: Parameters<typeof WorkoutTemplatePicker>[0]["templates"];
  getExerciseImageUrl: (exercise: Exercise | undefined) => string | null;
  onClose: () => void;
  onCreateWorkout: Parameters<typeof WorkoutForm>[0]["onSubmit"];
  onUpdateWorkout: (item: Workout, data: Parameters<typeof WorkoutForm>[0]["onSubmit"] extends (data: infer Data) => Promise<void> ? Data : never) => Promise<void>;
  onInstantiateWorkoutTemplate: Parameters<typeof WorkoutTemplatePicker>[0]["onInstantiate"];
  onCreateWorkoutTemplate: Parameters<typeof WorkoutTemplatePicker>[0]["onCreateTemplate"];
  onUpdateWorkoutTemplate: Parameters<typeof WorkoutTemplatePicker>[0]["onUpdateTemplate"];
  onCreateFood: Parameters<typeof FoodForm>[0]["onSubmit"];
  onUpdateFood: (item: Food, data: Parameters<typeof FoodForm>[0]["onSubmit"] extends (data: infer Data) => Promise<void> ? Data : never) => Promise<void>;
  onCreateNutritionGoal: Parameters<typeof NutritionGoalForm>[0]["onSubmit"];
  onUpdateNutritionGoal: (item: NutritionGoal, data: Parameters<typeof NutritionGoalForm>[0]["onSubmit"] extends (data: infer Data) => Promise<void> ? Data : never) => Promise<void>;
}) {
  if (modal.type === "workout") {
    return (
      <WorkoutForm
        item={modal.item}
        prefillWorkout={modal.prefillWorkout}
        initialDate={modal.presetDate}
        exercises={exercises}
        getExerciseImageUrl={getExerciseImageUrl}
        onCancel={onClose}
        onSubmit={(data) => modal.item ? onUpdateWorkout(modal.item, data) : onCreateWorkout(data)}
      />
    );
  }

  if (modal.type === "workout-template") {
    return (
      <WorkoutTemplatePicker
        templates={workoutTemplates}
        exercises={exercises}
        onCancel={onClose}
        onInstantiate={onInstantiateWorkoutTemplate}
        onCreateTemplate={onCreateWorkoutTemplate}
        onUpdateTemplate={onUpdateWorkoutTemplate}
      />
    );
  }

  if (modal.type === "food") {
    return (
      <FoodForm
        item={modal.item}
        onCancel={onClose}
        onSubmit={(data) => modal.item ? onUpdateFood(modal.item, data) : onCreateFood(data)}
      />
    );
  }

  if (modal.type === "goal") {
    return (
      <NutritionGoalForm
        item={modal.item}
        onCancel={onClose}
        onSubmit={(data) => modal.item ? onUpdateNutritionGoal(modal.item, data) : onCreateNutritionGoal(data)}
      />
    );
  }
}
