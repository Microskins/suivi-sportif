import type { Exercise, Workout, WorkoutTemplate } from "../../api/client";
import { WorkoutForm } from "./workout-form";
import { WorkoutTemplatePicker } from "./workout-template-picker";
import { WorkoutsList } from "./workouts-list";
import { activeViewButtonClass, inactiveViewButtonClass } from "./shared";

export function DashboardWorkoutsSection({
  workoutsView,
  workouts,
  workoutTemplates,
  exercises,
  workoutDraft,
  workoutPrefillDraft,
  workoutPresetDate,
  getExerciseImageUrl,
  onShowList,
  onShowCreate,
  onShowFromTemplate,
  onEditWorkout,
  onDuplicateWorkout,
  onDeleteWorkout,
  onCancelWorkoutForm,
  onSubmitWorkout,
  onInstantiateWorkoutTemplate,
  onCreateWorkoutTemplate,
  onUpdateWorkoutTemplate,
}: {
  workoutsView: "list" | "create" | "from-template";
  workouts: Workout[];
  workoutTemplates: WorkoutTemplate[];
  exercises: Exercise[];
  workoutDraft: Workout | undefined;
  workoutPrefillDraft: Workout | undefined;
  workoutPresetDate: string | undefined;
  getExerciseImageUrl: (exercise: Exercise | undefined) => string | null;
  onShowList: () => void;
  onShowCreate: () => void;
  onShowFromTemplate: () => void;
  onEditWorkout: (workout: Workout) => void;
  onDuplicateWorkout: (workout: Workout) => void;
  onDeleteWorkout: (workout: Workout) => void;
  onCancelWorkoutForm: () => void;
  onSubmitWorkout: Parameters<typeof WorkoutForm>[0]["onSubmit"];
  onInstantiateWorkoutTemplate: Parameters<typeof WorkoutTemplatePicker>[0]["onInstantiate"];
  onCreateWorkoutTemplate: Parameters<typeof WorkoutTemplatePicker>[0]["onCreateTemplate"];
  onUpdateWorkoutTemplate: Parameters<typeof WorkoutTemplatePicker>[0]["onUpdateTemplate"];
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded border border-slate-200 bg-slate-50 p-2">
        <button type="button" className={workoutsView === "list" ? activeViewButtonClass : inactiveViewButtonClass} onClick={onShowList}>Liste</button>
        <button type="button" className={workoutsView === "create" ? activeViewButtonClass : inactiveViewButtonClass} onClick={onShowCreate}>Créer une séance</button>
        <button type="button" className={workoutsView === "from-template" ? activeViewButtonClass : inactiveViewButtonClass} onClick={onShowFromTemplate}>Depuis un modèle</button>
      </div>
      {workoutsView === "list" && (
        <WorkoutsList
          workouts={workouts}
          onEdit={onEditWorkout}
          onDuplicate={onDuplicateWorkout}
          onDelete={onDeleteWorkout}
        />
      )}
      {workoutsView === "create" && (
        <div className="rounded border border-slate-200 bg-white p-4">
          <WorkoutForm
            item={workoutDraft}
            prefillWorkout={workoutPrefillDraft}
            initialDate={workoutPresetDate}
            exercises={exercises}
            getExerciseImageUrl={getExerciseImageUrl}
            onCancel={onCancelWorkoutForm}
            onSubmit={onSubmitWorkout}
          />
        </div>
      )}
      {workoutsView === "from-template" && (
        <div className="rounded border border-slate-200 bg-white p-4">
          <WorkoutTemplatePicker
            templates={workoutTemplates}
            exercises={exercises}
            onCancel={onShowList}
            onInstantiate={onInstantiateWorkoutTemplate}
            onCreateTemplate={onCreateWorkoutTemplate}
            onUpdateTemplate={onUpdateWorkoutTemplate}
          />
        </div>
      )}
    </div>
  );
}
