import type { DragEvent } from "react";
import type { Exercise } from "../../api/client";
import {
  difficultyOptions,
  exerciseTypeOptions,
  labelFromOptions,
  moveItem,
  recommendedRestLabel,
  recommendedRestSecondsForExercise,
  tutorialSearchUrl,
  updateSet,
  type WorkoutExerciseFormRow,
} from "./workout-form-utils";
import {
  dangerButtonClass,
  dragHandleButtonClass,
  EmptyState,
  ExerciseImagePreview,
  iconButtonClass,
  inputClass,
  secondaryButtonClass,
} from "./shared";

const exerciseDragDataType = "application/x-suivi-sportif-exercise-id";

function defaultWorkoutExerciseRow(exercise: Exercise | undefined): WorkoutExerciseFormRow {
  const rest = String(recommendedRestSecondsForExercise(exercise));
  return {
    exerciseId: exercise?.id ?? "",
    sets: [{
      reps: "10",
      weight: "0",
      rest,
      durationMinutes: "",
      avgKmh: "",
      inclinePercent: "",
      rpe: "",
      rir: "",
    }],
  };
}

function insertExerciseRow(
  rows: WorkoutExerciseFormRow[],
  exercise: Exercise,
  insertIndex: number,
) {
  const next = [...rows];
  const boundedIndex = Math.max(0, Math.min(insertIndex, next.length));
  next.splice(boundedIndex, 0, defaultWorkoutExerciseRow(exercise));
  return next;
}

function warmupRow(exercise: Exercise | undefined): WorkoutExerciseFormRow {
  return {
    exerciseId: exercise?.id ?? "",
    sets: [{
      reps: exercise?.exerciseType === "CARDIO" ? "" : "12",
      weight: "0",
      rest: "30",
      durationMinutes: exercise?.exerciseType === "CARDIO" ? "5" : "",
      avgKmh: "",
      inclinePercent: "",
      rpe: "3",
      rir: "",
    }],
  };
}

function tabataRow(exercise: Exercise): WorkoutExerciseFormRow {
  return {
    exerciseId: exercise.id,
    sets: Array.from({ length: 8 }, () => ({
      reps: "",
      weight: "0",
      rest: "10",
      durationMinutes: "0.33",
      avgKmh: "",
      inclinePercent: "",
      rpe: "8",
      rir: "",
    })),
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
  function addExerciseFromLibrary(exercise: Exercise, insertIndex = rows.length) {
    setRows((current) => insertExerciseRow(current, exercise, insertIndex));
  }

  function exerciseFromDrag(event: DragEvent) {
    const exerciseId = event.dataTransfer.getData(exerciseDragDataType);
    return exercises.find((exercise) => exercise.id === exerciseId);
  }

  const warmupExercise =
    filteredExercises.find((exercise) => exercise.exerciseType === "MOBILITY") ??
    exercises.find((exercise) => exercise.exerciseType === "MOBILITY") ??
    filteredExercises.find((exercise) => exercise.exerciseType === "CARDIO") ??
    exercises.find((exercise) => exercise.exerciseType === "CARDIO") ??
    filteredExercises[0] ??
    exercises[0];
  const tabataExercise =
    filteredExercises.find((exercise) => exercise.exerciseType === "CARDIO") ??
    exercises.find((exercise) => exercise.exerciseType === "CARDIO");

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
              defaultWorkoutExerciseRow(exercises[0]),
            ])
          }
        >
          Ajouter
        </button>
      </div>
      <div className="flex flex-wrap gap-2 rounded border border-slate-200 bg-white p-2">
        <button
          type="button"
          className={secondaryButtonClass}
          disabled={!warmupExercise}
          onClick={() =>
            setRows((current) => [...current, warmupRow(warmupExercise)])
          }
        >
          Ajouter echauffement
        </button>
        <button
          type="button"
          className={secondaryButtonClass}
          disabled={!tabataExercise}
          onClick={() =>
            tabataExercise &&
            setRows((current) => [...current, tabataRow(tabataExercise)])
          }
          title={
            tabataExercise
              ? "Ajoute 8 intervalles de 20 secondes avec 10 secondes de repos"
              : "Ajoute d'abord un exercice cardio"
          }
        >
          Ajouter Tabata
        </button>
      </div>
      {!!filteredExercises.length && (
        <section className="rounded border border-slate-200 bg-slate-50 p-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
            <div
              className="flex min-h-24 flex-1 items-center justify-center rounded border border-dashed border-emerald-300 bg-white px-3 py-4 text-center text-sm font-medium text-emerald-800"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const exercise = exerciseFromDrag(event);
                if (exercise) {
                  addExerciseFromLibrary(exercise);
                }
              }}
            >
              Dépose un exercice ici pour l&apos;ajouter à la séance.
            </div>
            <div className="min-w-0 flex-[2]">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">
                  Bibliotheque filtree
                </p>
                <p className="text-xs text-slate-500">
                  {filteredExercises.length} exercice(s)
                </p>
              </div>
              <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto pr-1">
                {filteredExercises.map((exercise) => {
                  const recommendedRest = recommendedRestSecondsForExercise(exercise);

                  return (
                    <button
                      key={exercise.id}
                      type="button"
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = "copy";
                        event.dataTransfer.setData(exerciseDragDataType, exercise.id);
                      }}
                      onClick={() => addExerciseFromLibrary(exercise)}
                      className="rounded border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      title="Cliquer ou glisser pour ajouter"
                    >
                      <span className="block font-semibold text-slate-900">
                        {exercise.name}
                      </span>
                      <span className="mt-1 block text-slate-500">
                        {labelFromOptions(exerciseTypeOptions, exercise.exerciseType)}
                        {" / "}
                        {labelFromOptions(difficultyOptions, exercise.difficulty)}
                        {" / "}
                        {recommendedRest}s
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}
      {!exercises.length && <EmptyState label="Crée un exercice avant de composer une séance." />}
      {rows.map((row, rowIndex) => {
        const selectedExercise = exercises.find((exercise) => exercise.id === row.exerciseId);
        const recommendedRest = recommendedRestSecondsForExercise(selectedExercise);
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
              const droppedExercise = exerciseFromDrag(event);
              if (droppedExercise) {
                setRows((current) =>
                  insertExerciseRow(current, droppedExercise, rowIndex + 1),
                );
                setDraggedRowIndex(null);
                setDragOverRowIndex(null);
                return;
              }

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
                <a
                  className={iconButtonClass}
                  href={tutorialSearchUrl(selectedExercise)}
                  target="_blank"
                  rel="noreferrer"
                  title="Ouvrir un tuto"
                  aria-label="Ouvrir un tuto"
                >
                  ?
                </a>
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
              <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-xs text-emerald-900">
                <span className="font-medium">
                  Repos conseille: {recommendedRestLabel(recommendedRest)}
                </span>
                <button
                  type="button"
                  className={secondaryButtonClass}
                  onClick={() =>
                    updateRow(rowIndex, {
                      ...row,
                      sets: row.sets.map((set) => ({
                        ...set,
                        rest: String(recommendedRest),
                      })),
                    })
                  }
                >
                  Appliquer aux series
                </button>
              </div>
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
                      <input className={inputClass} type="number" min="0" step="0.1" placeholder="Durée (min)" value={set.durationMinutes} onChange={(event) => updateSet(row, rowIndex, setIndex, "durationMinutes", event.target.value, updateRow)} required />
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
                        rest: String(recommendedRest),
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
