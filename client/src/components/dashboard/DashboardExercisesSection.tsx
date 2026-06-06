import type { Exercise } from "../../api/client";
import { ExerciseForm } from "./ExerciseForm";
import { ExercisesList } from "./ExercisesList";
import { activeViewButtonClass, inactiveViewButtonClass } from "./shared";

export function DashboardExercisesSection({
  exerciseDraft,
  exercises,
  getExerciseImageUrl,
  onShowList,
  onShowCreate,
  onEditExercise,
  onDeleteExercise,
  onCancelExerciseForm,
  onSubmitExercise,
}: {
  exerciseDraft: Exercise | undefined;
  exercises: Exercise[];
  getExerciseImageUrl: (exercise: Exercise | undefined) => string | null;
  onShowList: () => void;
  onShowCreate: () => void;
  onEditExercise: (exercise: Exercise) => void;
  onDeleteExercise: (exercise: Exercise) => void;
  onCancelExerciseForm: () => void;
  onSubmitExercise: Parameters<typeof ExerciseForm>[0]["onSubmit"];
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded border border-slate-200 bg-slate-50 p-2">
        <button
          type="button"
          className={exerciseDraft === undefined ? activeViewButtonClass : inactiveViewButtonClass}
          onClick={onShowList}
        >
          Liste
        </button>
        <button
          type="button"
          className={exerciseDraft !== undefined && !exerciseDraft.id ? activeViewButtonClass : inactiveViewButtonClass}
          onClick={onShowCreate}
        >
          Creer un exercice
        </button>
      </div>
      {exerciseDraft !== undefined ? (
        <div className="rounded border border-slate-200 bg-white p-4">
          <ExerciseForm
            item={exerciseDraft.id ? exerciseDraft : undefined}
            onCancel={onCancelExerciseForm}
            onSubmit={onSubmitExercise}
          />
        </div>
      ) : (
        <ExercisesList
          exercises={exercises}
          getExerciseImageUrl={getExerciseImageUrl}
          onEdit={onEditExercise}
          onDelete={onDeleteExercise}
        />
      )}
    </div>
  );
}
