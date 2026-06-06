import type { Exercise } from "../../api/client";
import {
  moveItem,
  updateSet,
  type WorkoutExerciseFormRow,
} from "./workoutFormUtils";
import {
  dangerButtonClass,
  dragHandleButtonClass,
  EmptyState,
  ExerciseImagePreview,
  iconButtonClass,
  inputClass,
  secondaryButtonClass,
} from "./shared";

function defaultWorkoutExerciseRow(exerciseId: string): WorkoutExerciseFormRow {
  return {
    exerciseId,
    sets: [{
      reps: "10",
      weight: "0",
      rest: "60",
      durationMinutes: "",
      avgKmh: "",
      inclinePercent: "",
      rpe: "",
      rir: "",
    }],
  };
}

export function WorkoutExerciseRows({
  exercises,
  filteredExercises,
  rows,
  draggedRowIndex,
  dragOverRowIndex,
  getExerciseImageUrl,
  setRows,
  setDraggedRowIndex,
  setDragOverRowIndex,
  updateRow,
}: {
  exercises: Exercise[];
  filteredExercises: Exercise[];
  rows: WorkoutExerciseFormRow[];
  draggedRowIndex: number | null;
  dragOverRowIndex: number | null;
  getExerciseImageUrl: (exercise: Exercise | undefined) => string | null;
  setRows: (update: (current: WorkoutExerciseFormRow[]) => WorkoutExerciseFormRow[]) => void;
  setDraggedRowIndex: (value: number | null) => void;
  setDragOverRowIndex: (value: number | null) => void;
  updateRow: (index: number, nextRow: WorkoutExerciseFormRow) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">Exercices et series</p>
          <p className="mt-1 text-xs text-slate-500">
            Ajoute, reordonne et ajuste les series sans quitter le formulaire.
          </p>
        </div>
        <button
          type="button"
          className={secondaryButtonClass}
          disabled={!exercises.length}
          onClick={() =>
            setRows((current) => [
              ...current,
              defaultWorkoutExerciseRow(exercises[0]?.id ?? ""),
            ])
          }
        >
          Ajouter
        </button>
      </div>
      {!exercises.length && <EmptyState label="Cree un exercice avant de composer une seance." />}
      {rows.map((row, rowIndex) => {
        const selectedExercise = exercises.find((exercise) => exercise.id === row.exerciseId);
        const selectExercises =
          filteredExercises.length === 0 ||
          filteredExercises.some((exercise) => exercise.id === row.exerciseId)
            ? filteredExercises.length
              ? filteredExercises
              : exercises
            : selectedExercise
              ? [selectedExercise, ...filteredExercises]
              : filteredExercises;

        return (
          <div
            key={rowIndex}
            className={`relative rounded border p-3 transition ${
              dragOverRowIndex === rowIndex
                ? "border-emerald-500 bg-emerald-50/60"
                : "border-slate-200"
            }`}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOverRowIndex(rowIndex);
            }}
            onDragEnter={() => setDragOverRowIndex(rowIndex)}
            onDragLeave={() => {
              if (dragOverRowIndex === rowIndex) {
                setDragOverRowIndex(null);
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
                  : draggedRowIndex;
              if (sourceIndex === null) {
                return;
              }
              setRows((current) => moveItem(current, sourceIndex, rowIndex));
              setDraggedRowIndex(null);
              setDragOverRowIndex(null);
            }}
            onDragEnd={() => {
              setDraggedRowIndex(null);
              setDragOverRowIndex(null);
            }}
          >
            {dragOverRowIndex === rowIndex && (
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Deposer ici
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3 md:flex-nowrap">
              <button
                type="button"
                className={dragHandleButtonClass}
                draggable
                onDragStart={(event) => {
                  setDraggedRowIndex(rowIndex);
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", String(rowIndex));
                }}
                title="Glisser pour deplacer l'exercice"
                aria-label="Glisser pour deplacer l'exercice"
              >
                ::
              </button>
              <ExerciseImagePreview
                imageUrl={getExerciseImageUrl(selectedExercise)}
                label={selectedExercise?.name ?? "Exercice"}
                className="h-20 w-28 shrink-0"
              />
              <div className="min-w-[220px] flex-1">
                <select
                  className={inputClass}
                  value={row.exerciseId}
                  onChange={(event) => updateRow(rowIndex, { ...row, exerciseId: event.target.value })}
                >
                  {selectExercises.map((exercise) => (
                    <option key={exercise.id} value={exercise.id}>{exercise.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className={iconButtonClass}
                  disabled={rowIndex === 0}
                  onClick={() =>
                    setRows((current) => moveItem(current, rowIndex, rowIndex - 1))
                  }
                  title="Monter"
                  aria-label="Monter"
                >
                  ^
                </button>
                <button
                  type="button"
                  className={iconButtonClass}
                  disabled={rowIndex === rows.length - 1}
                  onClick={() =>
                    setRows((current) => moveItem(current, rowIndex, rowIndex + 1))
                  }
                  title="Descendre"
                  aria-label="Descendre"
                >
                  v
                </button>
              </div>
              <button type="button" className={dangerButtonClass} onClick={() => setRows((current) => current.filter((_, index) => index !== rowIndex))}>
                Retirer
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {row.sets.map((set, setIndex) => (
                <div
                  key={setIndex}
                  className={`grid gap-2 ${
                    exercises.find((exercise) => exercise.id === row.exerciseId)?.exerciseType === "CARDIO"
                      ? "md:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_auto]"
                      : "md:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto]"
                  }`}
                >
                  {exercises.find((exercise) => exercise.id === row.exerciseId)?.exerciseType === "CARDIO" ? (
                    <>
                      <input className={inputClass} type="number" min="0" step="0.1" placeholder="Duree (min)" value={set.durationMinutes} onChange={(event) => updateSet(row, rowIndex, setIndex, "durationMinutes", event.target.value, updateRow)} required />
                      <input className={inputClass} type="number" min="0" step="0.1" placeholder="KM/H moyen" value={set.avgKmh} onChange={(event) => updateSet(row, rowIndex, setIndex, "avgKmh", event.target.value, updateRow)} required />
                      <input className={inputClass} type="number" min="0" step="0.1" placeholder="Inclinaison %" value={set.inclinePercent} onChange={(event) => updateSet(row, rowIndex, setIndex, "inclinePercent", event.target.value, updateRow)} />
                      <input className={inputClass} type="number" min="1" max="10" step="0.5" placeholder="RPE" value={set.rpe} onChange={(event) => updateSet(row, rowIndex, setIndex, "rpe", event.target.value, updateRow)} />
                      <input className={inputClass} type="number" min="0" max="10" placeholder="RIR" value={set.rir} onChange={(event) => updateSet(row, rowIndex, setIndex, "rir", event.target.value, updateRow)} />
                      <input className={inputClass} type="number" min="0" placeholder="Repos sec" value={set.rest} onChange={(event) => updateSet(row, rowIndex, setIndex, "rest", event.target.value, updateRow)} required />
                    </>
                  ) : (
                    <>
                      <input className={inputClass} type="number" min="0" placeholder="Reps" value={set.reps} onChange={(event) => updateSet(row, rowIndex, setIndex, "reps", event.target.value, updateRow)} required />
                      <input className={inputClass} type="number" min="0" step="0.5" placeholder="Poids" value={set.weight} onChange={(event) => updateSet(row, rowIndex, setIndex, "weight", event.target.value, updateRow)} required />
                      <input className={inputClass} type="number" min="1" max="10" step="0.5" placeholder="RPE" value={set.rpe} onChange={(event) => updateSet(row, rowIndex, setIndex, "rpe", event.target.value, updateRow)} />
                      <input className={inputClass} type="number" min="0" max="10" placeholder="RIR" value={set.rir} onChange={(event) => updateSet(row, rowIndex, setIndex, "rir", event.target.value, updateRow)} />
                      <input className={inputClass} type="number" min="0" placeholder="Repos sec" value={set.rest} onChange={(event) => updateSet(row, rowIndex, setIndex, "rest", event.target.value, updateRow)} required />
                    </>
                  )}
                  <button type="button" className={secondaryButtonClass} onClick={() => updateRow(rowIndex, { ...row, sets: row.sets.filter((_, index) => index !== setIndex) })}>
                    Suppr.
                  </button>
                </div>
              ))}
              <button
                type="button"
                className={secondaryButtonClass}
                onClick={() =>
                  updateRow(rowIndex, {
                    ...row,
                    sets: [
                      ...row.sets,
                      {
                        reps: "10",
                        weight: "0",
                        rest: "60",
                        durationMinutes: "",
                        avgKmh: "",
                        inclinePercent: "",
                        rpe: "",
                        rir: "",
                      },
                    ],
                  })
                }
              >
                Ajouter une serie
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}
