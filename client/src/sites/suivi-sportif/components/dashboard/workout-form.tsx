import { FormEvent, useState } from "react";
import type {
  Exercise,
  Workout,
  WorkoutInput,
  WorkoutStatus,
} from "../../api/client";
import { WorkoutExerciseFilters } from "./workout-exercise-filters";
import { WorkoutExerciseRows } from "./workout-exercise-rows";
import {
  dateTimeToIso,
  emptyToNull,
  inferWorkoutStatusFromDate,
  numberOrNull,
  recommendedRestSecondsForExercise,
  toInputDateTime,
  type WorkoutExerciseFormRow,
  workoutStatusOptions,
} from "./workout-form-utils";
import {
  Field,
  FormActions,
  inputClass,
  secondaryButtonClass,
} from "./shared";

export function WorkoutForm({
  item,
  prefillWorkout,
  initialDate,
  exercises,
  getExerciseImageUrl,
  onSubmit,
  onCancel,
}: {
  item?: Workout;
  prefillWorkout?: Workout;
  initialDate?: string;
  exercises: Exercise[];
  getExerciseImageUrl: (exercise: Exercise | undefined) => string | null;
  onSubmit: (data: WorkoutInput) => Promise<void>;
  onCancel: () => void;
}) {
  const sourceWorkout = item ?? prefillWorkout;
  const [name, setName] = useState(sourceWorkout?.name ?? "");
  const [date, setDate] = useState(
    toInputDateTime(sourceWorkout?.date ?? initialDate),
  );
  const [status, setStatus] = useState<WorkoutStatus>(
    sourceWorkout?.status ??
      inferWorkoutStatusFromDate(sourceWorkout?.date ?? initialDate ?? new Date().toISOString()),
  );
  const [duration, setDuration] = useState(String(sourceWorkout?.duration ?? 45));
  const [notes, setNotes] = useState(sourceWorkout?.notes ?? "");
  const [rows, setRows] = useState<WorkoutExerciseFormRow[]>(
    sourceWorkout?.exercises?.length
      ? sourceWorkout.exercises.map((entry) => ({
          exerciseId: entry.exerciseId,
          sets: entry.sets.map((set) => ({
            reps: String(set.reps),
            weight: String(set.weight),
            rest: String(set.rest),
            durationMinutes:
              set.durationMinutes === null || set.durationMinutes === undefined
                ? ""
                : String(set.durationMinutes),
            avgKmh:
              set.avgKmh === null || set.avgKmh === undefined
                ? ""
                : String(set.avgKmh),
            inclinePercent:
              set.inclinePercent === null || set.inclinePercent === undefined
                ? ""
                : String(set.inclinePercent),
            rpe:
              set.rpe === null || set.rpe === undefined
                ? ""
                : String(set.rpe),
            rir:
              set.rir === null || set.rir === undefined
                ? ""
                : String(set.rir),
          })),
        }))
      : exercises[0]
        ? [{
            exerciseId: exercises[0].id,
            sets: [{
              reps: "10",
              weight: "0",
              rest: String(recommendedRestSecondsForExercise(exercises[0])),
              durationMinutes: "",
              avgKmh: "",
              inclinePercent: "",
              rpe: "",
              rir: "",
            }],
          }]
        : [],
  );
  const [isSaving, setIsSaving] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [exerciseTypeFilter, setExerciseTypeFilter] = useState<"ALL" | "STRENGTH" | "CARDIO" | "MOBILITY">("ALL");
  const [exerciseDifficultyFilter, setExerciseDifficultyFilter] = useState<"ALL" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED">("ALL");
  const [exerciseBodyPartFilter, setExerciseBodyPartFilter] = useState("ALL");
  const [draggedRowIndex, setDraggedRowIndex] = useState<number | null>(null);
  const [dragOverRowIndex, setDragOverRowIndex] = useState<number | null>(null);
  const bodyPartOptions = Array.from(
    new Set(
      exercises.flatMap((exercise) => exercise.bodyParts ?? []),
    ),
  ).sort((a, b) => a.localeCompare(b, "fr"));

  const normalizedExerciseSearch = exerciseSearch.trim().toLocaleLowerCase("fr-FR");
  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch =
      normalizedExerciseSearch.length === 0 ||
      exercise.name.toLocaleLowerCase("fr-FR").includes(normalizedExerciseSearch) ||
      (exercise.description?.toLocaleLowerCase("fr-FR").includes(normalizedExerciseSearch) ?? false);
    const matchesType =
      exerciseTypeFilter === "ALL" || exercise.exerciseType === exerciseTypeFilter;
    const matchesDifficulty =
      exerciseDifficultyFilter === "ALL" ||
      exercise.difficulty === exerciseDifficultyFilter;
    const matchesBodyPart =
      exerciseBodyPartFilter === "ALL" ||
      (exercise.bodyParts ?? []).includes(exerciseBodyPartFilter);

    return matchesSearch && matchesType && matchesDifficulty && matchesBodyPart;
  });
  const totalSets = rows.reduce((total, row) => total + row.sets.length, 0);
  const isEditingWorkout = Boolean(item?.id);
  const isDuplicatingWorkout = Boolean(prefillWorkout?.id && !item?.id);

  function updateRow(index: number, nextRow: WorkoutExerciseFormRow) {
    setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? nextRow : row)));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await onSubmit({
        name,
        date: dateTimeToIso(date),
        status,
        duration: Number(duration),
        notes: emptyToNull(notes),
        exercises: rows.map((row) => ({
          exerciseId: row.exerciseId,
          sets: row.sets.map((set) => ({
            reps: set.reps === "" ? undefined : Number(set.reps),
            weight: set.weight === "" ? undefined : Number(set.weight),
            durationMinutes: numberOrNull(set.durationMinutes),
            avgKmh: numberOrNull(set.avgKmh),
            inclinePercent: numberOrNull(set.inclinePercent),
            rpe: numberOrNull(set.rpe),
            rir: numberOrNull(set.rir),
            rest: Number(set.rest),
          })),
        })),
      });
      onCancel();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <section className="rounded border border-emerald-200 bg-emerald-50/70 p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-950">
              {isEditingWorkout
                ? "Modification de séance"
                : isDuplicatingWorkout
                  ? "Duplication de séance"
                  : "Nouvelle séance"}
            </p>
            <p className="mt-1 text-xs text-emerald-800/80">
              {rows.length} exercice(s), {totalSets} serie(s). Les filtres servent a trouver vite le prochain exercice a ajouter.
            </p>
          </div>
          <button type="button" className={secondaryButtonClass} onClick={onCancel}>
            Retour liste
          </button>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Nom">
          <input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} required />
        </Field>
        <Field label="Date">
          <input className={inputClass} type="datetime-local" value={date} onChange={(event) => setDate(event.target.value)} required />
        </Field>
        <Field label="Durée (min)">
          <input className={inputClass} type="number" min="0" value={duration} onChange={(event) => setDuration(event.target.value)} required />
        </Field>
      </div>
      <Field label="Statut">
        <select
          className={inputClass}
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as WorkoutStatus)
          }
        >
          {workoutStatusOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Notes">
        <textarea className={inputClass} value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
      </Field>
      <div className="space-y-3">
        <WorkoutExerciseFilters
          exercises={exercises}
          filteredExercisesCount={filteredExercises.length}
          exerciseSearch={exerciseSearch}
          exerciseTypeFilter={exerciseTypeFilter}
          exerciseDifficultyFilter={exerciseDifficultyFilter}
          exerciseBodyPartFilter={exerciseBodyPartFilter}
          bodyPartOptions={bodyPartOptions}
          onExerciseSearchChange={setExerciseSearch}
          onExerciseTypeFilterChange={setExerciseTypeFilter}
          onExerciseDifficultyFilterChange={setExerciseDifficultyFilter}
          onExerciseBodyPartFilterChange={setExerciseBodyPartFilter}
        />
        <WorkoutExerciseRows
          exercises={exercises}
          filteredExercises={filteredExercises}
          rows={rows}
          draggedRowIndex={draggedRowIndex}
          dragOverRowIndex={dragOverRowIndex}
          getExerciseImageUrl={getExerciseImageUrl}
          setRows={setRows}
          setDraggedRowIndex={setDraggedRowIndex}
          setDragOverRowIndex={setDragOverRowIndex}
          updateRow={updateRow}
        />
      </div>
      <FormActions isSaving={isSaving} onCancel={onCancel} />
    </form>
  );
}
