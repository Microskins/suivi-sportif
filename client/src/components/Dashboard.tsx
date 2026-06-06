import { FormEvent, useEffect, useMemo, useState } from "react";
import type {
  BodyMeasurement,
  Exercise,
  Meal,
  UserGoal,
  Workout,
  WorkoutInput,
  WorkoutStatus,
  WorkoutTemplate,
  User,
} from "../api/client";
import { DashboardOverview } from "./DashboardOverview";
import { BodyMeasurementForm } from "./dashboard/BodyMeasurementForm";
import { BodyMeasurementDiagram } from "./dashboard/BodyMeasurementDiagram";
import { BodyMeasurementTrends } from "./dashboard/BodyMeasurementTrends";
import { bodyMeasurementFields } from "./dashboard/bodyMeasurements";
import {
  calorieGuidance,
  classifyBmi,
  classifyBodyFat,
  computeAgeFromDateOfBirth,
  computeBmi,
  computeDailyEnergyExpenditure,
  computeMifflinBmr,
  computeUsNavyBodyFat,
  formatComputedValue,
  measurementValue,
} from "./dashboard/bodyMetrics";
import { ExerciseForm } from "./dashboard/ExerciseForm";
import { ExercisesList } from "./dashboard/ExercisesList";
import { FoodForm } from "./dashboard/FoodForm";
import { FoodsList } from "./dashboard/FoodsList";
import { duplicateMealInput, MealForm } from "./dashboard/MealForm";
import { MealsList } from "./dashboard/MealsList";
import { Modal } from "./dashboard/Modal";
import { modalTitle, type ModalState, openCreate } from "./dashboard/modalState";
import { NutritionDayPanel } from "./dashboard/NutritionDayPanel";
import { NutritionGoalForm } from "./dashboard/NutritionGoalForm";
import { NutritionGoalsList } from "./dashboard/NutritionGoalsList";
import { ProfileForm } from "./dashboard/ProfileForm";
import { ResourceHeader, type DashboardResource } from "./dashboard/ResourceHeader";
import { SportProgressionPanel } from "./dashboard/SportProgressionPanel";
import { UserGoalsPanel } from "./dashboard/UserGoalsPanel";
import { WorkoutsList } from "./dashboard/WorkoutsList";
import {
  activeViewButtonClass,
  buttonClass,
  dangerButtonClass,
  dragHandleButtonClass,
  EmptyState,
  ErrorBox,
  ExerciseImagePreview,
  Field,
  FormActions,
  iconButtonClass,
  inactiveViewButtonClass,
  inputClass,
  ItemActions,
  itemCardClass,
  secondaryButtonClass,
} from "./dashboard/shared";
import { WorkoutsCalendar } from "./WorkoutsCalendar";
import { useBodyMeasurementsStore } from "../stores/bodyMeasurementsStore";
import { useExercisesStore } from "../stores/exercisesStore";
import { useFoodsStore } from "../stores/foodsStore";
import { useMealsStore } from "../stores/mealsStore";
import { useNutritionGoalsStore } from "../stores/nutritionGoalsStore";
import { useUserGoalsStore } from "../stores/userGoalsStore";
import { useWorkoutTemplatesStore } from "../stores/workoutTemplatesStore";
import { useWorkoutsStore } from "../stores/workoutsStore";

type Resource = DashboardResource;

const difficultyOptions = [
  ["BEGINNER", "Debutant"],
  ["INTERMEDIATE", "Intermediaire"],
  ["ADVANCED", "Avance"],
] as const;

const exerciseTypeOptions = [
  ["STRENGTH", "Musculation"],
  ["CARDIO", "Cardio"],
  ["MOBILITY", "Mobilite"],
] as const;

const workoutStatusOptions: Array<[WorkoutStatus, string]> = [
  ["PLANNED", "Prevue"],
  ["COMPLETED", "Realisee"],
  ["CANCELED", "Annulee"],
];

type ExerciseCatalogEntry = {
  nom: string;
  image: string;
};

function repairMojibake(value: string) {
  try {
    return decodeURIComponent(escape(value));
  } catch {
    return value;
  }
}

function normalizeExerciseKey(value: string) {
  return repairMojibake(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function buildExerciseImageUrl(path?: string | null) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const sanitized = path.replace(/^\/+/, "");
  if (sanitized.startsWith("exercices-assets/")) {
    return `/${sanitized}`;
  }
  if (sanitized.startsWith("images/")) {
    return `/exercices-assets/${sanitized}`;
  }
  return `/exercices-assets/images/${sanitized}`;
}

function toInputDateTime(value?: string) {
  const date = value ? new Date(value) : new Date();
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
}

function toInputDate(value?: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

function dateTimeToIso(value: string) {
  return new Date(value).toISOString();
}

function safeDateTimeToIso(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function inferWorkoutStatusFromDate(value: string): WorkoutStatus {
  return new Date(value).getTime() > Date.now() ? "PLANNED" : "COMPLETED";
}

function dateToIso(value: string) {
  return new Date(`${value}T00:00:00`).toISOString();
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function numberOrNull(value: string) {
  return value === "" ? null : Number(value);
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (toIndex < 0 || toIndex >= items.length || fromIndex === toIndex) {
    return items;
  }
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function labelFromOptions<T extends string>(
  options: readonly (readonly [T, string])[],
  value: string,
) {
  return options.find(([key]) => key === value)?.[1] ?? value;
}

type WorkoutExerciseFormRow = {
  exerciseId: string;
  sets: Array<{
    reps: string;
    weight: string;
    rest: string;
    durationMinutes: string;
    avgKmh: string;
    inclinePercent: string;
    rpe: string;
    rir: string;
  }>;
};

function WorkoutForm({
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
              rest: "60",
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
                ? "Modification de seance"
                : isDuplicatingWorkout
                  ? "Duplication de seance"
                  : "Nouvelle seance"}
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
        <Field label="Duree (min)">
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
        <div className="rounded border border-slate-200 bg-slate-50/70 p-3">
          <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">Filtres exercices</p>
              <p className="mt-1 text-xs text-slate-500">
                {filteredExercises.length} / {exercises.length} exercice(s) visible(s)
              </p>
            </div>
            <button
              type="button"
              className={secondaryButtonClass}
              onClick={() => {
                setExerciseSearch("");
                setExerciseTypeFilter("ALL");
                setExerciseDifficultyFilter("ALL");
                setExerciseBodyPartFilter("ALL");
              }}
            >
              Reinitialiser
            </button>
          </div>
          <div className="grid gap-2 md:grid-cols-4">
            <input
              className={inputClass}
              value={exerciseSearch}
              onChange={(event) => setExerciseSearch(event.target.value)}
              placeholder="Rechercher..."
            />
            <select
              className={inputClass}
              value={exerciseTypeFilter}
              onChange={(event) =>
                setExerciseTypeFilter(
                  event.target.value as "ALL" | "STRENGTH" | "CARDIO" | "MOBILITY",
                )
              }
            >
              <option value="ALL">Tous les types</option>
              {exerciseTypeOptions.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select
              className={inputClass}
              value={exerciseDifficultyFilter}
              onChange={(event) =>
                setExerciseDifficultyFilter(
                  event.target.value as
                    | "ALL"
                    | "BEGINNER"
                    | "INTERMEDIATE"
                    | "ADVANCED",
                )
              }
            >
              <option value="ALL">Toutes difficultes</option>
              {difficultyOptions.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select
              className={inputClass}
              value={exerciseBodyPartFilter}
              onChange={(event) => setExerciseBodyPartFilter(event.target.value)}
            >
              <option value="ALL">Toutes parties</option>
              {bodyPartOptions.map((part) => (
                <option key={part} value={part}>{part}</option>
              ))}
            </select>
          </div>
        </div>
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
                {
                  exerciseId: exercises[0]?.id ?? "",
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
                },
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
      </div>
      <FormActions isSaving={isSaving} onCancel={onCancel} />
    </form>
  );
}

function updateSet(
  row: WorkoutExerciseFormRow,
  rowIndex: number,
  setIndex: number,
  key:
    | "reps"
    | "weight"
    | "rest"
    | "durationMinutes"
    | "avgKmh"
    | "inclinePercent"
    | "rpe"
    | "rir",
  value: string,
  updateRow: (index: number, nextRow: WorkoutExerciseFormRow) => void,
) {
  updateRow(rowIndex, {
    ...row,
    sets: row.sets.map((set, index) => (index === setIndex ? { ...set, [key]: value } : set)),
  });
}

function WorkoutTemplatePicker({
  templates,
  exercises,
  onInstantiate,
  onCreateTemplate,
  onUpdateTemplate,
  onCancel,
}: {
  templates: WorkoutTemplate[];
  exercises: Exercise[];
  onInstantiate: (id: string, date: string) => Promise<void>;
  onCreateTemplate: (data: {
    name: string;
    category: string;
    level: string;
    duration: number;
    description?: string | null;
    exercises: Array<{
      exerciseId: string;
      order: number;
      sets: number;
      reps: number;
      rest: number;
      weight: number;
      durationSeconds?: number | null;
    }>;
  }) => Promise<void>;
  onUpdateTemplate: (
    id: string,
    data: {
      name: string;
      category: string;
      level: string;
      duration: number;
      description?: string | null;
      exercises: Array<{
        exerciseId: string;
        order: number;
        sets: number;
        reps: number;
        rest: number;
        weight: number;
        durationSeconds?: number | null;
      }>;
    },
  ) => Promise<void>;
  onCancel: () => void;
}) {
  const [mode, setMode] = useState<"instantiate" | "create" | "edit">("instantiate");
  const [date, setDate] = useState(toInputDateTime());
  const [selectedId, setSelectedId] = useState(templates[0]?.id ?? "");
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState("ALL");
  const [templateLevelFilter, setTemplateLevelFilter] = useState("ALL");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Musculation");
  const [level, setLevel] = useState("Intermediaire");
  const [duration, setDuration] = useState("45");
  const [description, setDescription] = useState("");
  const [rows, setRows] = useState<
    Array<{ exerciseId: string; sets: string; reps: string; rest: string; weight: string }>
  >(exercises[0] ? [{ exerciseId: exercises[0].id, sets: "3", reps: "10", rest: "60", weight: "0" }] : []);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedTemplateRowIndex, setDraggedTemplateRowIndex] = useState<number | null>(null);
  const [dragOverTemplateRowIndex, setDragOverTemplateRowIndex] = useState<number | null>(null);
  const templateCategories = Array.from(new Set(templates.map((template) => template.category))).sort((a, b) =>
    a.localeCompare(b, "fr"),
  );
  const templateLevels = Array.from(new Set(templates.map((template) => template.level))).sort((a, b) =>
    a.localeCompare(b, "fr"),
  );
  const normalizedTemplateSearch = templateSearch.trim().toLocaleLowerCase("fr-FR");
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      normalizedTemplateSearch.length === 0 ||
      template.name.toLocaleLowerCase("fr-FR").includes(normalizedTemplateSearch) ||
      (template.description?.toLocaleLowerCase("fr-FR").includes(normalizedTemplateSearch) ?? false);
    const matchesCategory =
      templateCategoryFilter === "ALL" || template.category === templateCategoryFilter;
    const matchesLevel = templateLevelFilter === "ALL" || template.level === templateLevelFilter;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  function resetTemplateFormToCreateDefaults() {
    setName("");
    setCategory("Musculation");
    setLevel("Intermediaire");
    setDuration("45");
    setDescription("");
    setRows(
      exercises[0]
        ? [{ exerciseId: exercises[0].id, sets: "3", reps: "10", rest: "60", weight: "0" }]
        : [],
    );
  }

  useEffect(() => {
    if (!templates.length) {
      setSelectedId("");
      return;
    }

    const selectedStillExists = templates.some((item) => item.id === selectedId);
    if (!selectedStillExists) {
      setSelectedId(templates[0].id);
    }
  }, [selectedId, templates]);

  useEffect(() => {
    if (mode !== "instantiate" || !filteredTemplates.length) {
      return;
    }
    if (!filteredTemplates.some((template) => template.id === selectedId)) {
      setSelectedId(filteredTemplates[0].id);
    }
  }, [filteredTemplates, mode, selectedId]);

  useEffect(() => {
    const selectedTemplate = templates.find((item) => item.id === selectedId);
    if (!selectedTemplate || mode !== "edit") {
      return;
    }

    setName(selectedTemplate.name);
    setCategory(selectedTemplate.category);
    setLevel(selectedTemplate.level);
    setDuration(String(selectedTemplate.duration));
    setDescription(selectedTemplate.description ?? "");
    setRows(
      selectedTemplate.exercises.map((entry) => ({
        exerciseId: entry.exerciseId,
        sets: String(entry.sets),
        reps: String(entry.reps),
        rest: String(entry.rest),
        weight: String(entry.weight),
      })),
    );
  }, [mode, selectedId, templates]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSaving(true);
    try {
      if (mode === "instantiate") {
        if (!selectedId) {
          return;
        }
        await onInstantiate(selectedId, dateTimeToIso(date));
      } else if (mode === "create") {
        await onCreateTemplate({
          name,
          category,
          level,
          duration: Number(duration),
          description: emptyToNull(description),
          exercises: rows.map((row, index) => ({
            exerciseId: row.exerciseId,
            order: index,
            sets: Number(row.sets),
            reps: Number(row.reps),
            rest: Number(row.rest),
            weight: Number(row.weight),
          })),
        });
      } else if (selectedId) {
        await onUpdateTemplate(selectedId, {
          name,
          category,
          level,
          duration: Number(duration),
          description: emptyToNull(description),
          exercises: rows.map((row, index) => ({
            exerciseId: row.exerciseId,
            order: index,
            sets: Number(row.sets),
            reps: Number(row.reps),
            rest: Number(row.rest),
            weight: Number(row.weight),
          })),
        });
      }
      onCancel();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded border border-slate-200 bg-slate-50 p-2">
        <button type="button" className={mode === "instantiate" ? activeViewButtonClass : inactiveViewButtonClass} onClick={() => setMode("instantiate")}>Creer une seance</button>
        <button
          type="button"
          className={mode === "create" ? activeViewButtonClass : inactiveViewButtonClass}
          onClick={() => {
            setMode("create");
            resetTemplateFormToCreateDefaults();
          }}
        >
          Creer un modele
        </button>
        <button
          type="button"
          className={mode === "edit" ? activeViewButtonClass : inactiveViewButtonClass}
          onClick={() => {
            if (templates.length) {
              setSelectedId((current) =>
                templates.some((item) => item.id === current) ? current : templates[0].id,
              );
            }
            setMode("edit");
          }}
          disabled={!templates.length}
        >
          Modifier un modele
        </button>
      </div>
      {mode === "instantiate" ? (
        <>
          <Field label="Date de la seance">
            <input
              className={inputClass}
              type="datetime-local"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </Field>
          {!templates.length && <EmptyState label="Aucun modele de seance disponible." />}
          {templates.length > 0 && (
            <div className="rounded border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-sm font-semibold text-slate-800">Filtres modeles</p>
              <div className="grid gap-2 md:grid-cols-3">
                <input
                  className={inputClass}
                  value={templateSearch}
                  onChange={(event) => setTemplateSearch(event.target.value)}
                  placeholder="Rechercher..."
                />
                <select
                  className={inputClass}
                  value={templateCategoryFilter}
                  onChange={(event) => setTemplateCategoryFilter(event.target.value)}
                >
                  <option value="ALL">Toutes categories</option>
                  {templateCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select
                  className={inputClass}
                  value={templateLevelFilter}
                  onChange={(event) => setTemplateLevelFilter(event.target.value)}
                >
                  <option value="ALL">Tous niveaux</option>
                  {templateLevels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          {templates.length > 0 && !filteredTemplates.length && (
            <EmptyState label="Aucun modele ne correspond aux filtres." />
          )}
          <div className="grid gap-3 lg:grid-cols-2">
            {filteredTemplates.map((template) => (
              <label
                key={template.id}
                className={`block rounded border p-4 text-sm ${
                  selectedId === template.id
                    ? "border-emerald-600 bg-emerald-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <span className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="workout-template"
                    value={template.id}
                    checked={selectedId === template.id}
                    onChange={() => setSelectedId(template.id)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block font-semibold text-slate-950">
                      {template.name}
                    </span>
                    <span className="mt-1 block text-slate-600">
                      {template.category} - {template.level} - {template.duration} min
                    </span>
                    <span className="mt-1 block text-slate-500">
                      {template.exercises.length} exercice(s)
                    </span>
                    {template.description && (
                      <span className="mt-2 block text-slate-500">
                        {template.description}
                      </span>
                    )}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-3 rounded border border-slate-200 p-3">
          {mode === "edit" && (
            <Field label="Modele a modifier">
              <select className={inputClass} value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Nom">
              <input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} required />
            </Field>
            <Field label="Categorie">
              <input className={inputClass} value={category} onChange={(event) => setCategory(event.target.value)} required />
            </Field>
            <Field label="Niveau">
              <input className={inputClass} value={level} onChange={(event) => setLevel(event.target.value)} required />
            </Field>
            <Field label="Duree (min)">
              <input className={inputClass} type="number" min="0" value={duration} onChange={(event) => setDuration(event.target.value)} required />
            </Field>
          </div>
          <Field label="Description">
            <textarea className={inputClass} rows={2} value={description} onChange={(event) => setDescription(event.target.value)} />
          </Field>
          {rows.map((row, index) => (
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
          ))}
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={() => setRows((current) => [...current, { exerciseId: exercises[0]?.id ?? "", sets: "3", reps: "10", rest: "60", weight: "0" }])}
            disabled={!exercises.length}
          >
            Ajouter un exercice
          </button>
        </div>
      )}
      <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
        <button type="button" className={secondaryButtonClass} onClick={onCancel}>
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSaving || (mode === "instantiate" ? !selectedId : rows.length === 0 || (mode === "edit" && !selectedId))}
          className={buttonClass}
        >
          {isSaving
            ? "Enregistrement..."
            : mode === "instantiate"
              ? "Creer la seance"
              : mode === "create"
                ? "Creer le modele"
                : "Mettre a jour le modele"}
        </button>
      </div>
    </form>
  );
}

function BodyInterpretation({
  measurement,
  ageYears,
}: {
  measurement: BodyMeasurement;
  ageYears: number | null;
}) {
  const bmi = computeBmi(measurement);
  const bodyFat = computeUsNavyBodyFat(measurement);
  const tdee = computeDailyEnergyExpenditure(measurement, ageYears);
  const bmiInfo = classifyBmi(bmi);
  const bodyFatInfo = classifyBodyFat(bodyFat, measurement.silhouette);
  const calories = calorieGuidance(tdee);

  return (
    <section className="rounded border border-neutral-200 bg-white p-4 shadow-sm">
      <div>
        <h3 className="font-semibold text-neutral-950">Lecture des indicateurs</h3>
        <p className="mt-1 text-sm text-neutral-500">Repere simple pour transformer les mesures en decisions.</p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">IMC</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{formatComputedValue(bmi)}</p>
          <p className="mt-1 text-sm font-medium text-slate-700">{bmiInfo.label}</p>
          <p className="mt-1 text-xs text-slate-500">{bmiInfo.detail}</p>
        </div>
        <div className="rounded border border-rose-100 bg-rose-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Masse grasse</p>
          <p className="mt-2 text-2xl font-bold text-rose-950">
            {bodyFat === null ? "-" : `${formatComputedValue(bodyFat)} %`}
          </p>
          <p className="mt-1 text-sm font-medium text-rose-800">{bodyFatInfo.label}</p>
          <p className="mt-1 text-xs text-rose-700/80">{bodyFatInfo.detail}</p>
        </div>
        <div className="rounded border border-emerald-100 bg-emerald-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Calories</p>
          <p className="mt-2 text-sm text-emerald-950">Maintien: <span className="font-bold">{calories.maintenance}</span></p>
          <p className="mt-1 text-sm text-emerald-950">Deficit leger: <span className="font-bold">{calories.deficit}</span></p>
          <p className="mt-1 text-sm text-emerald-950">Surplus leger: <span className="font-bold">{calories.surplus}</span></p>
          <p className="mt-2 text-xs text-emerald-700/80">{calories.detail}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-neutral-500">
        Ces indicateurs sont des estimations de suivi personnel, pas un diagnostic medical.
      </p>
    </section>
  );
}

function BodyMeasurementsList({
  measurements,
  userDateOfBirth,
  onEdit,
  onDelete,
}: {
  measurements: BodyMeasurement[];
  userDateOfBirth: string | null;
  onEdit: (item: BodyMeasurement) => void;
  onDelete: (item: BodyMeasurement) => void;
}) {
  if (!measurements.length) {
    return <EmptyState label="Aucune mensuration enregistree pour le moment." />;
  }

  const latest = measurements[0];
  const computedAge = computeAgeFromDateOfBirth(userDateOfBirth);
  const latestBmi = computeBmi(latest);
  const latestBodyFat = computeUsNavyBodyFat(latest);
  const latestBmr = computeMifflinBmr(latest, computedAge);
  const latestTdee = computeDailyEnergyExpenditure(latest, computedAge);

  return (
    <div className="space-y-4">
      <section className="rounded border border-emerald-200 bg-emerald-50/70 p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
          Derniere mesure
        </p>
        <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(260px,430px)_1fr]">
          <BodyMeasurementDiagram measurement={latest} />
          <div>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <p className="text-sm text-emerald-900/70">Poids</p>
                <p className="text-2xl font-bold text-emerald-950">
                  {measurementValue(latest, "weightKg", "kg")}
                </p>
              </div>
              <div>
                <p className="text-sm text-emerald-900/70">Taille</p>
                <p className="text-2xl font-bold text-emerald-950">
                  {measurementValue(latest, "heightCm", "cm")}
                </p>
              </div>
              <div>
                <p className="text-sm text-emerald-900/70">Taille abdominale</p>
                <p className="text-2xl font-bold text-emerald-950">
                  {measurementValue(latest, "waistCm", "cm")}
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded bg-white/75 px-3 py-2">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-900/70">IMC</p>
                <p className="text-xl font-bold text-emerald-950">
                  {formatComputedValue(latestBmi)}
                </p>
              </div>
              <div className="rounded bg-white/75 px-3 py-2">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-900/70">Masse grasse (US Navy)</p>
                <p className="text-xl font-bold text-emerald-950">
                  {latestBodyFat === null ? "-" : `${formatComputedValue(latestBodyFat)} %`}
                </p>
              </div>
              <div className="rounded bg-white/75 px-3 py-2">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-900/70">Metabolisme de base</p>
                <p className="text-xl font-bold text-emerald-950">
                  {latestBmr === null ? "-" : `${Math.round(latestBmr)} kcal`}
                </p>
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <p className="rounded bg-white/70 px-3 py-2 text-sm text-emerald-950/85">
                <span className="font-medium">Age: </span>
                {computedAge === null ? "-" : `${computedAge} ans`}
              </p>
              <p className="rounded bg-white/70 px-3 py-2 text-sm text-emerald-950/85">
                <span className="font-medium">Activite: </span>
                {latest.isActiveLifestyle ? "Actif" : "Peu actif"}
              </p>
              <p className="rounded bg-white/70 px-3 py-2 text-sm text-emerald-950/85">
                <span className="font-medium">Depense journaliere estimee: </span>
                {latestTdee === null ? "-" : `${Math.round(latestTdee)} kcal`}
              </p>
            </div>
            <div className="mt-3 grid gap-2 text-sm text-emerald-950/80 sm:grid-cols-2">
              {bodyMeasurementFields.slice(2, 9).map(([key, label, unit]) => (
                <p key={key} className="rounded bg-white/70 px-3 py-2">
                  <span className="font-medium">{label}: </span>
                  {measurementValue(latest, key, unit)}
                </p>
              ))}
            </div>
            <p className="mt-2 text-xs text-emerald-900/70">
              Le metabolisme de base est calcule avec Mifflin-St Jeor depuis la date de naissance, la taille et le poids.
            </p>
            <p className="mt-3 text-sm text-emerald-900/70">
              {formatDate(latest.date)}
            </p>
          </div>
        </div>
      </section>

      <BodyMeasurementTrends measurements={measurements} />
      <BodyInterpretation measurement={latest} ageYears={computedAge} />

      <ul className="space-y-3">
        {measurements.map((measurement) => (
          <li key={measurement.id} className={itemCardClass}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-slate-950">
                  {formatDate(measurement.date)}
                </p>
                <div className="mt-2 grid gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
                  {bodyMeasurementFields.slice(0, 9).map(([key, label, unit]) => (
                    <p key={key}>
                      <span className="font-medium text-slate-800">{label}: </span>
                      {measurementValue(measurement, key, unit)}
                    </p>
                  ))}
                </div>
                {measurement.notes && (
                  <p className="mt-2 text-sm text-slate-500">{measurement.notes}</p>
                )}
              </div>
              <ItemActions item={measurement} onEdit={onEdit} onDelete={onDelete} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Dashboard({
  userName,
  userEmail,
  userDateOfBirth,
  onUpdateProfile,
  onLogout,
  isProfileSaving,
  profileError,
  isAuthBypassEnabled,
}: {
  userName: string;
  userEmail: string;
  userDateOfBirth: string | null;
  onUpdateProfile: (data: Partial<Pick<User, "email" | "dateOfBirth">> & {
    password?: string;
    currentPassword?: string;
  }) => Promise<void>;
  onLogout: () => void;
  isProfileSaving: boolean;
  profileError: string | null;
  isAuthBypassEnabled: boolean;
}) {
  const [resource, setResource] = useState<Resource>("dashboard");
  const [modal, setModal] = useState<ModalState>(null);
  const [workoutsView, setWorkoutsView] = useState<"list" | "create" | "from-template">("list");
  const [exerciseDraft, setExerciseDraft] = useState<Exercise | undefined>(undefined);
  const [bodyMeasurementDraft, setBodyMeasurementDraft] = useState<BodyMeasurement | undefined>(undefined);
  const [userGoalDraft, setUserGoalDraft] = useState<UserGoal | undefined>(undefined);
  const [workoutDraft, setWorkoutDraft] = useState<Workout | undefined>(undefined);
  const [workoutPrefillDraft, setWorkoutPrefillDraft] = useState<Workout | undefined>(undefined);
  const [workoutPresetDate, setWorkoutPresetDate] = useState<string | undefined>(undefined);
  const [mealsView, setMealsView] = useState<"list" | "create">("list");
  const [mealDraft, setMealDraft] = useState<Meal | undefined>(undefined);
  const bodyMeasurementsStore = useBodyMeasurementsStore();
  const exercisesStore = useExercisesStore();
  const workoutsStore = useWorkoutsStore();
  const workoutTemplatesStore = useWorkoutTemplatesStore();
  const foodsStore = useFoodsStore();
  const mealsStore = useMealsStore();
  const goalsStore = useNutritionGoalsStore();
  const userGoalsStore = useUserGoalsStore();
  const [exerciseCatalog, setExerciseCatalog] = useState<ExerciseCatalogEntry[]>([]);

  const exerciseImageMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const entry of exerciseCatalog) {
      const rawKey = normalizeExerciseKey(entry.nom);
      map.set(rawKey, entry.image);
      const repairedKey = normalizeExerciseKey(repairMojibake(entry.nom));
      map.set(repairedKey, entry.image);
    }
    return map;
  }, [exerciseCatalog]);

  const getExerciseImageUrl = (exercise: Exercise | undefined) => {
    if (!exercise) return null;
    const imagePath = exerciseImageMap.get(normalizeExerciseKey(exercise.name));
    return buildExerciseImageUrl(imagePath ?? null);
  };

  useEffect(() => {
    void exercisesStore.fetchExercises();
    void workoutsStore.fetchWorkouts();
    void workoutTemplatesStore.fetchWorkoutTemplates();
    void foodsStore.fetchFoods();
    void mealsStore.fetchMeals();
    void goalsStore.fetchNutritionGoals();
    void userGoalsStore.fetchUserGoals();
    void bodyMeasurementsStore.fetchBodyMeasurements();
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function loadExerciseCatalog() {
      const candidateUrls = [
        "/exercices-assets/exercices.json",
        "/exercices.json",
        "/exercices/exercices.json",
      ];
      try {
        for (const url of candidateUrls) {
          const response = await fetch(url);
          if (!response.ok) {
            continue;
          }
          const data = (await response.json()) as ExerciseCatalogEntry[];
          if (!isCancelled && Array.isArray(data)) {
            setExerciseCatalog(
              data.filter(
                (entry) =>
                  typeof entry?.nom === "string" && typeof entry?.image === "string",
              ),
            );
          }
          return;
        }
        if (!isCancelled) {
          setExerciseCatalog([]);
        }
      } catch {
        if (!isCancelled) {
          setExerciseCatalog([]);
        }
      }
    }

    void loadExerciseCatalog();
    return () => {
      isCancelled = true;
    };
  }, []);

  const isLoading =
    exercisesStore.isLoading ||
    workoutsStore.isLoading ||
    workoutTemplatesStore.isLoading ||
    foodsStore.isLoading ||
    mealsStore.isLoading ||
    goalsStore.isLoading ||
    userGoalsStore.isLoading ||
    bodyMeasurementsStore.isLoading;

  const activeError =
    resource === "dashboard" || resource === "calendar"
      ? null
      : resource === "workouts"
      ? workoutsStore.error ?? workoutTemplatesStore.error
      : resource === "sportGoals"
        ? userGoalsStore.error
      : resource === "exercises"
        ? exercisesStore.error
        : resource === "foods"
          ? foodsStore.error
        : resource === "meals"
          ? mealsStore.error
          : resource === "goals"
            ? goalsStore.error
            : resource === "measurements"
              ? bodyMeasurementsStore.error
              : resource === "bodyGoals"
                ? userGoalsStore.error
              : null;

  const contentClass =
    resource === "dashboard" || resource === "calendar"
      ? "min-w-0"
      : "rounded border border-neutral-200 bg-white p-5 shadow-sm";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f8f5_0%,#edf4ef_48%,#f6f7f4_100%)] text-neutral-950">
      <section className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="rounded border border-neutral-200 bg-white/95 p-5 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Suivi Sportif</p>
              <h1 className="mt-1 text-3xl font-bold text-neutral-950">{userName}</h1>
              <p className="mt-1 text-sm text-neutral-600">{userEmail}</p>
              {isAuthBypassEnabled && (
                <p className="mt-2 inline-flex rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-700">
                  Mode bypass actif
                </p>
              )}
            </div>
            <button type="button" onClick={onLogout} className={secondaryButtonClass}>Se deconnecter</button>
          </div>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-[230px_1fr]">
          <nav className="h-fit rounded border border-neutral-200 bg-white/95 p-2 shadow-sm backdrop-blur md:sticky md:top-6">
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Accueil
            </p>
            <button
              type="button"
              onClick={() => setResource("dashboard")}
              className={`mb-1 block w-full rounded border px-3 py-2 text-left text-sm font-medium transition ${
                resource === "dashboard" ? "border-emerald-700 bg-emerald-700 text-white shadow-sm" : "border-transparent text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              Synthese
            </button>
            <button
              type="button"
              onClick={() => setResource("calendar")}
              className={`mb-1 block w-full rounded border px-3 py-2 text-left text-sm font-medium transition ${
                resource === "calendar"
                  ? "border-emerald-700 bg-emerald-700 text-white shadow-sm"
                  : "border-transparent text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              Calendrier
            </button>
            <p className="mt-3 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Sport
            </p>
            {[
              ["workouts", "Seances"],
              ["sportGoals", "Objectifs"],
              ["exercises", "Exercices"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setUserGoalDraft(undefined);
                  setResource(key as Resource);
                }}
                className={`mb-1 block w-full rounded border px-3 py-2 text-left text-sm font-medium transition ${
                  resource === key ? "border-neutral-950 bg-neutral-950 text-white shadow-sm" : "border-transparent text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {label}
              </button>
            ))}
            <p className="mt-3 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Nutrition
            </p>
            {[
              ["foods", "Aliments"],
              ["meals", "Repas"],
              ["goals", "Objectifs"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setResource(key as Resource)}
                className={`mb-1 block w-full rounded border px-3 py-2 text-left text-sm font-medium transition ${
                  resource === key ? "border-amber-600 bg-amber-600 text-white shadow-sm" : "border-transparent text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {label}
              </button>
            ))}
            <p className="mt-3 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Corps
            </p>
            <button
              type="button"
              onClick={() => setResource("measurements")}
              className={`mb-1 block w-full rounded border px-3 py-2 text-left text-sm font-medium transition ${
                resource === "measurements" ? "border-rose-600 bg-rose-600 text-white shadow-sm" : "border-transparent text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              Mensurations
            </button>
            <button
              type="button"
              onClick={() => {
                setUserGoalDraft(undefined);
                setResource("bodyGoals");
              }}
              className={`mb-1 block w-full rounded border px-3 py-2 text-left text-sm font-medium transition ${
                resource === "bodyGoals" ? "border-rose-600 bg-rose-600 text-white shadow-sm" : "border-transparent text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              Objectifs
            </button>
            <p className="mt-3 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Compte
            </p>
            <button
              type="button"
              onClick={() => setResource("profile")}
              className={`mb-1 block w-full rounded border px-3 py-2 text-left text-sm font-medium transition ${
                resource === "profile" ? "border-sky-700 bg-sky-700 text-white shadow-sm" : "border-transparent text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              Profil
            </button>
          </nav>

          <div className={contentClass}>
            {resource !== "dashboard" && resource !== "calendar" && resource !== "profile" && (
              <ResourceHeader
                resource={resource}
                onCreate={() => {
                  if (resource === "workouts") {
                    setWorkoutsView("create");
                    setWorkoutDraft(undefined);
                    setWorkoutPrefillDraft(undefined);
                    setWorkoutPresetDate(undefined);
                    return;
                  }
                  if (resource === "exercises") {
                    setExerciseDraft({} as Exercise);
                    return;
                  }
                  if (resource === "measurements") {
                    setBodyMeasurementDraft({} as BodyMeasurement);
                    return;
                  }
                  if (resource === "meals") {
                    setMealDraft(undefined);
                    setMealsView("create");
                    return;
                  }
                  if (resource === "sportGoals" || resource === "bodyGoals") {
                    setUserGoalDraft({} as UserGoal);
                    return;
                  }
                  openCreate(resource, setModal);
                }}
                onCreateFromTemplate={
                  resource === "workouts"
                    ? () => {
                        setWorkoutDraft(undefined);
                        setWorkoutPrefillDraft(undefined);
                        setWorkoutPresetDate(undefined);
                        setWorkoutsView("from-template");
                      }
                    : undefined
                }
                isLoading={isLoading}
              />
            )}
            <div className={resource === "dashboard" ? "space-y-4" : "mt-4 space-y-4"}>
              <ErrorBox message={activeError} />
              {resource === "dashboard" && (
                <DashboardOverview
                  workouts={workoutsStore.workouts}
                  meals={mealsStore.meals}
                  nutritionGoals={goalsStore.nutritionGoals}
                  userGoals={userGoalsStore.userGoals}
                  isLoading={isLoading}
                  onQuickAction={(action) => {
                    if (action === "workout") {
                      setResource("workouts");
                      setWorkoutDraft(undefined);
                      setWorkoutPrefillDraft(undefined);
                      setWorkoutPresetDate(undefined);
                      setWorkoutsView("create");
                    }
                    if (action === "meal") {
                      setResource("meals");
                      setMealDraft(undefined);
                      setMealsView("create");
                    }
                    if (action === "goal") {
                      setResource("sportGoals");
                      setUserGoalDraft({} as UserGoal);
                    }
                  }}
                />
              )}
              {resource === "calendar" && (
                <WorkoutsCalendar
                  workouts={workoutsStore.workouts}
                  userGoals={userGoalsStore.userGoals}
                  isLoading={isLoading}
                  onPlan={(dateIso) => {
                    setResource("workouts");
                    setWorkoutDraft(undefined);
                    setWorkoutPrefillDraft(undefined);
                    setWorkoutPresetDate(dateIso);
                    setWorkoutsView("create");
                  }}
                  onAssociate={async (workoutId, dateIso) => {
                    await workoutsStore.updateWorkout(workoutId, { date: dateIso });
                  }}
                  onEdit={(workout) => setModal({ type: "workout", item: workout })}
                  onDuplicate={(workout) =>
                    setModal({
                      type: "workout",
                      prefillWorkout: workout,
                    })
                  }
                />
              )}
              {resource === "workouts" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 rounded border border-slate-200 bg-slate-50 p-2">
                    <button type="button" className={workoutsView === "list" ? activeViewButtonClass : inactiveViewButtonClass} onClick={() => { setWorkoutsView("list"); setWorkoutDraft(undefined); setWorkoutPrefillDraft(undefined); setWorkoutPresetDate(undefined); }}>Liste</button>
                    <button type="button" className={workoutsView === "create" ? activeViewButtonClass : inactiveViewButtonClass} onClick={() => { setWorkoutsView("create"); setWorkoutDraft(undefined); setWorkoutPrefillDraft(undefined); setWorkoutPresetDate(undefined); }}>Creer une seance</button>
                    <button type="button" className={workoutsView === "from-template" ? activeViewButtonClass : inactiveViewButtonClass} onClick={() => { setWorkoutDraft(undefined); setWorkoutPrefillDraft(undefined); setWorkoutPresetDate(undefined); setWorkoutsView("from-template"); }}>Depuis un modele</button>
                  </div>
                  {workoutsView === "list" && (
                    <WorkoutsList
                      workouts={workoutsStore.workouts}
                      onEdit={(item) => {
                        setWorkoutDraft(item);
                        setWorkoutPrefillDraft(undefined);
                        setWorkoutPresetDate(undefined);
                        setWorkoutsView("create");
                      }}
                      onDuplicate={(item) => {
                        setWorkoutDraft(undefined);
                        setWorkoutPrefillDraft(item);
                        setWorkoutPresetDate(undefined);
                        setWorkoutsView("create");
                      }}
                      onDelete={(item) => confirmDelete(item.name, () => workoutsStore.deleteWorkout(item.id))}
                    />
                  )}
                  {workoutsView === "create" && (
                    <div className="rounded border border-slate-200 bg-white p-4">
                      <WorkoutForm
                        item={workoutDraft}
                        prefillWorkout={workoutPrefillDraft}
                        initialDate={workoutPresetDate}
                        exercises={exercisesStore.exercises}
                        getExerciseImageUrl={getExerciseImageUrl}
                        onCancel={() => {
                          setWorkoutDraft(undefined);
                          setWorkoutPrefillDraft(undefined);
                          setWorkoutPresetDate(undefined);
                          setWorkoutsView("list");
                        }}
                        onSubmit={(data) =>
                          workoutDraft
                            ? workoutsStore.updateWorkout(workoutDraft.id, data)
                            : workoutsStore.createWorkout(data)
                        }
                      />
                    </div>
                  )}
                  {workoutsView === "from-template" && (
                    <div className="rounded border border-slate-200 bg-white p-4">
                      <WorkoutTemplatePicker
                        templates={workoutTemplatesStore.workoutTemplates}
                        exercises={exercisesStore.exercises}
                        onCancel={() => setWorkoutsView("list")}
                        onInstantiate={(id, date) =>
                          workoutTemplatesStore.instantiateWorkoutTemplate(id, date)
                        }
                        onCreateTemplate={(data) =>
                          workoutTemplatesStore.createWorkoutTemplate(data)
                        }
                        onUpdateTemplate={(id, data) =>
                          workoutTemplatesStore.updateWorkoutTemplate(id, data)
                        }
                      />
                    </div>
                  )}
                </div>
              )}
              {resource === "sportGoals" && (
                <div className="space-y-4">
                  <SportProgressionPanel
                    exercises={exercisesStore.exercises}
                    workouts={workoutsStore.workouts}
                    goals={userGoalsStore.userGoals}
                  />
                  <UserGoalsPanel
                    domain="SPORT"
                    goals={userGoalsStore.userGoals}
                    exercises={exercisesStore.exercises}
                    workouts={workoutsStore.workouts}
                    measurements={bodyMeasurementsStore.bodyMeasurements}
                    draft={userGoalDraft}
                    onCreate={() => setUserGoalDraft({} as UserGoal)}
                    onEdit={(goal) => setUserGoalDraft(goal)}
                    onCancel={() => setUserGoalDraft(undefined)}
                    onSubmit={(data) =>
                      userGoalDraft?.id
                        ? userGoalsStore.updateUserGoal(userGoalDraft.id, data)
                        : userGoalsStore.createUserGoal(data)
                    }
                    onDelete={(goal) => confirmDelete(goal.name, () => userGoalsStore.deleteUserGoal(goal.id))}
                  />
                </div>
              )}
              {resource === "exercises" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 rounded border border-slate-200 bg-slate-50 p-2">
                    <button type="button" className={exerciseDraft === undefined ? activeViewButtonClass : inactiveViewButtonClass} onClick={() => setExerciseDraft(undefined)}>Liste</button>
                    <button type="button" className={exerciseDraft !== undefined && !exerciseDraft.id ? activeViewButtonClass : inactiveViewButtonClass} onClick={() => setExerciseDraft({} as Exercise)}>Creer un exercice</button>
                  </div>
                  {exerciseDraft !== undefined ? (
                    <div className="rounded border border-slate-200 bg-white p-4">
                      <ExerciseForm
                        item={exerciseDraft.id ? exerciseDraft : undefined}
                        onCancel={() => setExerciseDraft(undefined)}
                        onSubmit={(data) =>
                          exerciseDraft.id
                            ? exercisesStore.updateExercise(exerciseDraft.id, data)
                            : exercisesStore.createExercise(data)
                        }
                      />
                    </div>
                  ) : (
                    <ExercisesList
                      exercises={exercisesStore.exercises}
                      getExerciseImageUrl={getExerciseImageUrl}
                      onEdit={(item) => setExerciseDraft(item)}
                      onDelete={(item) => confirmDelete(item.name, () => exercisesStore.deleteExercise(item.id))}
                    />
                  )}
                </div>
              )}
              {resource === "foods" && (
                <FoodsList
                  foods={foodsStore.foods}
                  onEdit={(item) => setModal({ type: "food", item })}
                  onDelete={(item) => confirmDelete(item.name, () => foodsStore.deleteFood(item.id))}
                />
              )}
              {resource === "meals" && (
                <div className="space-y-4">
                  <NutritionDayPanel
                    meals={mealsStore.meals}
                    goals={goalsStore.nutritionGoals}
                  />
                  <div className="flex flex-wrap gap-2 rounded border border-amber-200 bg-amber-50/60 p-2">
                    <button
                      type="button"
                      className={mealsView === "list" ? activeViewButtonClass : inactiveViewButtonClass}
                      onClick={() => {
                        setMealsView("list");
                        setMealDraft(undefined);
                      }}
                    >
                      Liste
                    </button>
                    <button
                      type="button"
                      className={mealsView === "create" ? activeViewButtonClass : inactiveViewButtonClass}
                      onClick={() => {
                        setMealsView("create");
                        setMealDraft(undefined);
                      }}
                    >
                      Creer un repas
                    </button>
                  </div>
                  {mealsView === "create" ? (
                    <div className="rounded border border-amber-200 bg-white p-4">
                      <MealForm
                        item={mealDraft}
                        foods={foodsStore.foods}
                        meals={mealsStore.meals}
                        nutritionGoals={goalsStore.nutritionGoals}
                        onCancel={() => {
                          setMealDraft(undefined);
                          setMealsView("list");
                        }}
                        onSubmit={(data) =>
                          mealDraft
                            ? mealsStore.updateMeal(mealDraft.id, data, foodsStore.foods)
                            : mealsStore.createMeal(data, foodsStore.foods)
                        }
                      />
                    </div>
                  ) : (
                    <MealsList
                      meals={mealsStore.meals}
                      onEdit={(item) => {
                        setMealDraft(item);
                        setMealsView("create");
                      }}
                      onDuplicate={(item) => {
                        const copy = duplicateMealInput(item);
                        if (copy) {
                          void mealsStore.createMeal(copy, foodsStore.foods);
                        }
                      }}
                      onDelete={(item) => confirmDelete(item.name, () => mealsStore.deleteMeal(item.id))}
                    />
                  )}
                </div>
              )}
              {resource === "goals" && (
                <NutritionGoalsList
                  goals={goalsStore.nutritionGoals}
                  onEdit={(item) => setModal({ type: "goal", item })}
                  onDelete={(item) => confirmDelete(item.name, () => goalsStore.deleteNutritionGoal(item.id))}
                />
              )}
              {resource === "measurements" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 rounded border border-slate-200 bg-slate-50 p-2">
                    <button type="button" className={bodyMeasurementDraft === undefined ? activeViewButtonClass : inactiveViewButtonClass} onClick={() => setBodyMeasurementDraft(undefined)}>Historique</button>
                    <button type="button" className={bodyMeasurementDraft !== undefined && !bodyMeasurementDraft.id ? activeViewButtonClass : inactiveViewButtonClass} onClick={() => setBodyMeasurementDraft({} as BodyMeasurement)}>Ajouter une mesure</button>
                  </div>
                  {bodyMeasurementDraft !== undefined ? (
                    <div className="rounded border border-slate-200 bg-white p-4">
                      <BodyMeasurementForm
                        item={bodyMeasurementDraft.id ? bodyMeasurementDraft : undefined}
                        onCancel={() => setBodyMeasurementDraft(undefined)}
                        onSubmit={(data) =>
                          bodyMeasurementDraft.id
                            ? bodyMeasurementsStore.updateBodyMeasurement(bodyMeasurementDraft.id, data)
                            : bodyMeasurementsStore.createBodyMeasurement(data)
                        }
                      />
                    </div>
                  ) : (
                    <BodyMeasurementsList
                      measurements={bodyMeasurementsStore.bodyMeasurements}
                      userDateOfBirth={userDateOfBirth}
                      onEdit={(item) => setBodyMeasurementDraft(item)}
                      onDelete={(item) => confirmDelete(formatDate(item.date), () => bodyMeasurementsStore.deleteBodyMeasurement(item.id))}
                    />
                  )}
                </div>
              )}
              {resource === "bodyGoals" && (
                <UserGoalsPanel
                  domain="BODY"
                  goals={userGoalsStore.userGoals}
                  exercises={exercisesStore.exercises}
                  workouts={workoutsStore.workouts}
                  measurements={bodyMeasurementsStore.bodyMeasurements}
                  draft={userGoalDraft}
                  onCreate={() => setUserGoalDraft({} as UserGoal)}
                  onEdit={(goal) => setUserGoalDraft(goal)}
                  onCancel={() => setUserGoalDraft(undefined)}
                  onSubmit={(data) =>
                    userGoalDraft?.id
                      ? userGoalsStore.updateUserGoal(userGoalDraft.id, data)
                      : userGoalsStore.createUserGoal(data)
                  }
                  onDelete={(goal) => confirmDelete(goal.name, () => userGoalsStore.deleteUserGoal(goal.id))}
                />
              )}
              {resource === "profile" && (
                <ProfileForm
                  userName={userName}
                  userEmail={userEmail}
                  userDateOfBirth={userDateOfBirth}
                  isSaving={isProfileSaving}
                  error={profileError}
                  onSubmit={onUpdateProfile}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {modal && (
        <Modal title={modalTitle(modal)} onClose={() => setModal(null)}>
          {modal.type === "workout" && (
            <WorkoutForm
              item={modal.item}
              prefillWorkout={modal.prefillWorkout}
              initialDate={modal.presetDate}
              exercises={exercisesStore.exercises}
              getExerciseImageUrl={getExerciseImageUrl}
              onCancel={() => setModal(null)}
              onSubmit={(data) => modal.item ? workoutsStore.updateWorkout(modal.item.id, data) : workoutsStore.createWorkout(data)}
            />
          )}
          {modal.type === "workout-template" && (
            <WorkoutTemplatePicker
              templates={workoutTemplatesStore.workoutTemplates}
              exercises={exercisesStore.exercises}
              onCancel={() => setModal(null)}
              onInstantiate={(id, date) =>
                workoutTemplatesStore.instantiateWorkoutTemplate(id, date)
              }
              onCreateTemplate={(data) =>
                workoutTemplatesStore.createWorkoutTemplate(data)
              }
              onUpdateTemplate={(id, data) =>
                workoutTemplatesStore.updateWorkoutTemplate(id, data)
              }
            />
          )}
          {modal.type === "food" && (
            <FoodForm
              item={modal.item}
              onCancel={() => setModal(null)}
              onSubmit={(data) => modal.item ? foodsStore.updateFood(modal.item.id, data) : foodsStore.createFood(data)}
            />
          )}
          {modal.type === "goal" && (
            <NutritionGoalForm
              item={modal.item}
              onCancel={() => setModal(null)}
              onSubmit={(data) => modal.item ? goalsStore.updateNutritionGoal(modal.item.id, data) : goalsStore.createNutritionGoal(data)}
            />
          )}
        </Modal>
      )}
    </main>
  );
}

function confirmDelete(label: string, action: () => Promise<void>) {
  if (window.confirm(`Supprimer "${label}" ?`)) {
    void action();
  }
}
