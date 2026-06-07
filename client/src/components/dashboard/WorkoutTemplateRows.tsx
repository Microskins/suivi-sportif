import type { Exercise } from "../../api/client";
import {
  moveItem,
  recommendedRestLabel,
  recommendedRestSecondsForExercise,
} from "./workoutFormUtils";
import {
  dangerButtonClass,
  dragHandleButtonClass,
  iconButtonClass,
  inputClass,
  secondaryButtonClass,
} from "./shared";

export type WorkoutTemplateRow = {
  exerciseId: string;
  sets: string;
  reps: string;
  rest: string;
  weight: string;
};

function defaultTemplateRow(exercise: Exercise | undefined): WorkoutTemplateRow {
  return {
    exerciseId: exercise?.id ?? "",
    sets: "3",
    reps: "10",
    rest: String(recommendedRestSecondsForExercise(exercise)),
    weight: "0",
  };
}

export function WorkoutTemplateRows({
  exercises,
  rows,
  draggedTemplateRowIndex,
  dragOverTemplateRowIndex,
  setRows,
  setDraggedTemplateRowIndex,
  setDragOverTemplateRowIndex,
}: {
  exercises: Exercise[];
  rows: WorkoutTemplateRow[];
  draggedTemplateRowIndex: number | null;
  dragOverTemplateRowIndex: number | null;
  setRows: (update: (current: WorkoutTemplateRow[]) => WorkoutTemplateRow[]) => void;
  setDraggedTemplateRowIndex: (value: number | null) => void;
  setDragOverTemplateRowIndex: (value: number | null) => void;
}) {
  return (
    <>
      {rows.map((row, index) => {
        const selectedExercise = exercises.find((exercise) => exercise.id === row.exerciseId);
        const recommendedRest = recommendedRestSecondsForExercise(selectedExercise);

        return (
          <div
            key={index}
            className={`rounded border p-2 transition ${
              dragOverTemplateRowIndex === index
                ? "border-emerald-500 bg-emerald-50/60"
                : "border-transparent"
            }`}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOverTemplateRowIndex(index);
            }}
            onDragEnter={() => setDragOverTemplateRowIndex(index)}
            onDragLeave={() => {
              if (dragOverTemplateRowIndex === index) {
                setDragOverTemplateRowIndex(null);
              }
            }}
            onDrop={(event) => {
              event.preventDefault();
              const draggedIndexFromTransfer = Number(
                event.dataTransfer.getData("text/plain"),
              );
              const sourceIndex =
                Number.isFinite(draggedIndexFromTransfer) &&
                draggedIndexFromTransfer >= 0
                  ? draggedIndexFromTransfer
                  : draggedTemplateRowIndex;
              if (sourceIndex === null) {
                return;
              }
              setRows((current) => moveItem(current, sourceIndex, index));
              setDraggedTemplateRowIndex(null);
              setDragOverTemplateRowIndex(null);
            }}
            onDragEnd={() => {
              setDraggedTemplateRowIndex(null);
              setDragOverTemplateRowIndex(null);
            }}
          >
            <div className="flex w-full items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              className={dragHandleButtonClass}
              draggable
              onDragStart={(event) => {
                setDraggedTemplateRowIndex(index);
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", String(index));
              }}
              title="Glisser pour deplacer l'exercice"
              aria-label="Glisser pour deplacer l'exercice"
            >
              ::
            </button>
            <select className={`${inputClass} min-w-[220px]`} value={row.exerciseId} onChange={(event) => setRows((current) => current.map((entry, rowIndex) => rowIndex === index ? { ...entry, exerciseId: event.target.value } : entry))}>
              {exercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>{exercise.name}</option>
              ))}
            </select>
            <input className={`${inputClass} w-24 min-w-24`} type="number" min="1" value={row.sets} onChange={(event) => setRows((current) => current.map((entry, rowIndex) => rowIndex === index ? { ...entry, sets: event.target.value } : entry))} />
            <input className={`${inputClass} w-24 min-w-24`} type="number" min="0" value={row.reps} onChange={(event) => setRows((current) => current.map((entry, rowIndex) => rowIndex === index ? { ...entry, reps: event.target.value } : entry))} />
            <input className={`${inputClass} w-24 min-w-24`} type="number" min="0" value={row.rest} onChange={(event) => setRows((current) => current.map((entry, rowIndex) => rowIndex === index ? { ...entry, rest: event.target.value } : entry))} />
            <input className={`${inputClass} w-24 min-w-24`} type="number" min="0" value={row.weight} onChange={(event) => setRows((current) => current.map((entry, rowIndex) => rowIndex === index ? { ...entry, weight: event.target.value } : entry))} />
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={secondaryButtonClass}
                onClick={() =>
                  setRows((current) =>
                    current.map((entry, rowIndex) =>
                      rowIndex === index
                        ? { ...entry, rest: String(recommendedRest) }
                        : entry,
                    ),
                  )
                }
                title={`Repos conseille: ${recommendedRestLabel(recommendedRest)}`}
              >
                {recommendedRest}s
              </button>
              <button
                type="button"
                className={iconButtonClass}
                disabled={index === 0}
                onClick={() =>
                  setRows((current) => moveItem(current, index, index - 1))
                }
                title="Monter"
                aria-label="Monter"
              >
                ^
              </button>
              <button
                type="button"
                className={iconButtonClass}
                disabled={index === rows.length - 1}
                onClick={() =>
                  setRows((current) => moveItem(current, index, index + 1))
                }
                title="Descendre"
                aria-label="Descendre"
              >
                v
              </button>
              <button type="button" className={dangerButtonClass} onClick={() => setRows((current) => current.filter((_, rowIndex) => rowIndex !== index))}>Retirer</button>
            </div>
          </div>
        </div>
        );
      })}
      <button
        type="button"
        className={secondaryButtonClass}
        onClick={() => setRows((current) => [...current, defaultTemplateRow(exercises[0])])}
        disabled={!exercises.length}
      >
        Ajouter un exercice
      </button>
    </>
  );
}
