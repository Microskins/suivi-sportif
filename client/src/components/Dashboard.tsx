import { FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  BodyMeasurement,
  Exercise,
  ExerciseInput,
  Food,
  Meal,
  MealInput,
  MealType,
  NutritionGoal,
  UserGoal,
  UserGoalDomain,
  UserGoalInput,
  UserGoalMetric,
  Workout,
  WorkoutInput,
  WorkoutStatus,
  WorkoutTemplate,
  User,
} from "../api/client";
import { DashboardOverview } from "./DashboardOverview";
import { BodyMeasurementForm } from "./dashboard/BodyMeasurementForm";
import {
  bodyMeasurementFields,
  type BodyMeasurementField,
  type BodySilhouette,
} from "./dashboard/bodyMeasurements";
import { FoodForm } from "./dashboard/FoodForm";
import { FoodsList } from "./dashboard/FoodsList";
import { NutritionGoalForm } from "./dashboard/NutritionGoalForm";
import { ProfileForm } from "./dashboard/ProfileForm";
import { UserGoalForm } from "./dashboard/UserGoalForm";
import { userGoalMetricOptions } from "./dashboard/userGoals";
import {
  activeViewButtonClass,
  buttonClass,
  dangerButtonClass,
  dragHandleButtonClass,
  EmptyState,
  ErrorBox,
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

type Resource =
  | "dashboard"
  | "calendar"
  | "workouts"
  | "sportGoals"
  | "exercises"
  | "foods"
  | "meals"
  | "goals"
  | "measurements"
  | "bodyGoals"
  | "profile";
type ModalState =
  | { type: "workout"; item?: Workout; prefillWorkout?: Workout; presetDate?: string }
  | { type: "workout-template" }
  | { type: "food"; item?: Food }
  | { type: "goal"; item?: NutritionGoal }
  | null;

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

const mealTypes: Array<[MealType, string]> = [
  ["breakfast", "Petit-dejeuner"],
  ["lunch", "Dejeuner"],
  ["dinner", "Diner"],
  ["snack", "Collation"],
  ["other", "Autre"],
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

function safeDateToIso(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
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

function localDateKey(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
    .toISOString()
    .slice(0, 10);
}

function labelFromOptions<T extends string>(
  options: readonly (readonly [T, string])[],
  value: string,
) {
  return options.find(([key]) => key === value)?.[1] ?? value;
}

function ExerciseImagePreview({
  imageUrl,
  label,
  className = "",
}: {
  imageUrl?: string | null;
  label: string;
  className?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  if (!imageUrl || imageFailed) {
    return (
      <div
        className={`flex items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-500 ${className}`}
      >
        {imageUrl ? "Image indisponible" : "Aucune image"}
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={`Illustration de ${label}`}
      className={`rounded border border-slate-200 object-cover object-[center_56%] ${className}`}
      loading="lazy"
      onError={() => setImageFailed(true)}
    />
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-20 flex items-start justify-center overflow-y-auto bg-slate-950/40 px-4 py-8">
      <div className="w-full max-w-3xl rounded border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Fermer
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function ExerciseForm({
  item,
  onSubmit,
  onCancel,
}: {
  item?: Exercise;
  onSubmit: (data: ExerciseInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [difficulty, setDifficulty] = useState<
    "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  >(
    item?.difficulty === "BEGINNER" ||
      item?.difficulty === "INTERMEDIATE" ||
      item?.difficulty === "ADVANCED"
      ? item.difficulty
      : "BEGINNER",
  );
  const [exerciseType, setExerciseType] = useState<
    "STRENGTH" | "CARDIO" | "MOBILITY"
  >(
    item?.exerciseType === "STRENGTH" ||
      item?.exerciseType === "CARDIO" ||
      item?.exerciseType === "MOBILITY"
      ? item.exerciseType
      : "STRENGTH",
  );
  const [bodyParts, setBodyParts] = useState((item?.bodyParts ?? []).join(", "));
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await onSubmit({
        name,
        description: emptyToNull(description),
        difficulty,
        exerciseType,
        bodyParts: bodyParts
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean),
      });
      onCancel();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Nom">
        <input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} required />
      </Field>
      <Field label="Description">
        <textarea className={inputClass} value={description} onChange={(event) => setDescription(event.target.value)} rows={3} />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Difficulte">
          <select
            className={inputClass}
            value={difficulty}
            onChange={(event) =>
              setDifficulty(
                event.target.value as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
              )
            }
          >
            {difficultyOptions.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>
        <Field label="Type">
          <select
            className={inputClass}
            value={exerciseType}
            onChange={(event) =>
              setExerciseType(
                event.target.value as "STRENGTH" | "CARDIO" | "MOBILITY",
              )
            }
          >
            {exerciseTypeOptions.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Parties du corps (separees par des virgules)">
        <input
          className={inputClass}
          value={bodyParts}
          onChange={(event) => setBodyParts(event.target.value)}
          placeholder="Pectoraux, Triceps, Epaules"
        />
      </Field>
      <FormActions isSaving={isSaving} onCancel={onCancel} />
    </form>
  );
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

type MealItemFormRow = {
  foodId: string;
  quantityGrams: string;
};

type MacroTotals = {
  caloriesKcal: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
};

function emptyMacroTotals(): MacroTotals {
  return { caloriesKcal: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0 };
}

function roundMacro(value: number) {
  return Math.round(value * 10) / 10;
}

function computeMealFormTotals(items: MealItemFormRow[], foods: Food[]): MacroTotals {
  return items.reduce((totals, item) => {
    const food = foods.find((candidate) => candidate.id === item.foodId);
    const quantity = Number(item.quantityGrams);
    if (!food || Number.isNaN(quantity) || quantity <= 0) {
      return totals;
    }

    return {
      caloriesKcal: totals.caloriesKcal + (food.caloriesKcal * quantity) / 100,
      proteinGrams: totals.proteinGrams + (food.proteinGrams * quantity) / 100,
      carbsGrams: totals.carbsGrams + (food.carbsGrams * quantity) / 100,
      fatGrams: totals.fatGrams + (food.fatGrams * quantity) / 100,
    };
  }, emptyMacroTotals());
}

function recentFoodPortions(foodId: string, meals: Meal[]) {
  const portions = [...meals]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .flatMap((meal) =>
      meal.items
        .filter((item) => item.foodId === foodId)
        .map((item) => item.quantityGrams),
    );

  return Array.from(new Set(portions)).slice(0, 3);
}

function activeNutritionGoalForDate(goals: NutritionGoal[], dateIso: string) {
  const day = new Date(dateIso).getTime();
  return goals.find((goal) => {
    if (!goal.isActive) return false;
    const start = new Date(goal.startDate).getTime();
    const end = goal.endDate ? new Date(goal.endDate).getTime() : Number.POSITIVE_INFINITY;
    return day >= start && day <= end;
  }) ?? goals.find((goal) => goal.isActive) ?? null;
}

function dayMealTotals(meals: Meal[], dateIso: string) {
  const key = localDateKey(dateIso);
  return meals
    .filter((meal) => localDateKey(meal.date) === key)
    .reduce((totals, meal) => ({
      caloriesKcal: totals.caloriesKcal + meal.totals.caloriesKcal,
      proteinGrams: totals.proteinGrams + meal.totals.proteinGrams,
      carbsGrams: totals.carbsGrams + meal.totals.carbsGrams,
      fatGrams: totals.fatGrams + meal.totals.fatGrams,
    }), emptyMacroTotals());
}

function duplicateMealInput(meal: Meal): MealInput | null {
  const items = meal.items
    .filter((mealItem) => mealItem.foodId)
    .map((mealItem) => ({
      foodId: mealItem.foodId as string,
      quantityGrams: mealItem.quantityGrams,
    }));

  if (!items.length) return null;

  return {
    name: `Copie - ${meal.name}`,
    date: new Date().toISOString(),
    mealType: meal.mealType,
    notes: meal.notes,
    items,
  };
}

function macroDeltaLabel(current: number, target: number | null) {
  if (target === null || target <= 0) return "Objectif non renseigne";
  const delta = roundMacro(current - target);
  if (delta === 0) return "pile sur cible";
  return delta > 0 ? `+${delta}` : `${delta}`;
}

function MealForm({
  item,
  foods,
  meals,
  nutritionGoals,
  onSubmit,
  onCancel,
}: {
  item?: Meal;
  foods: Food[];
  meals: Meal[];
  nutritionGoals: NutritionGoal[];
  onSubmit: (data: MealInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [date, setDate] = useState(toInputDateTime(item?.date));
  const [mealType, setMealType] = useState<MealType>(item?.mealType ?? "other");
  const [notes, setNotes] = useState(item?.notes ?? "");
  const [items, setItems] = useState<MealItemFormRow[]>(
    item?.items?.length
      ? item.items
          .filter((entry) => entry.foodId)
          .map((entry) => ({ foodId: entry.foodId as string, quantityGrams: String(entry.quantityGrams) }))
      : foods[0]
        ? [{ foodId: foods[0].id, quantityGrams: "100" }]
        : [],
  );
  const [foodSearch, setFoodSearch] = useState("");
  const [foodBrandFilter, setFoodBrandFilter] = useState("ALL");
  const [isSaving, setIsSaving] = useState(false);
  const foodBrandOptions = useMemo(
    () =>
      Array.from(
        new Set(
          foods
            .map((food) => food.brand?.trim())
            .filter((brand): brand is string => Boolean(brand)),
        ),
      ).sort((a, b) => a.localeCompare(b, "fr")),
    [foods],
  );
  const normalizedFoodSearch = foodSearch.trim().toLocaleLowerCase("fr-FR");
  const filteredFoods = foods.filter((food) => {
    const matchesSearch =
      normalizedFoodSearch.length === 0 ||
      food.name.toLocaleLowerCase("fr-FR").includes(normalizedFoodSearch) ||
      (food.brand?.toLocaleLowerCase("fr-FR").includes(normalizedFoodSearch) ?? false) ||
      (food.barcode?.toLocaleLowerCase("fr-FR").includes(normalizedFoodSearch) ?? false);
    const matchesBrand =
      foodBrandFilter === "ALL" || (food.brand ?? "") === foodBrandFilter;
    return matchesSearch && matchesBrand;
  });
  const nextFoodToAdd = filteredFoods[0] ?? foods[0] ?? null;
  const previewDateIso = safeDateTimeToIso(date);
  const previewTotals = computeMealFormTotals(items, foods);
  const activeGoal = activeNutritionGoalForDate(nutritionGoals, previewDateIso);
  const existingDayTotals = item ? emptyMacroTotals() : dayMealTotals(meals, previewDateIso);
  const projectedDayTotals = {
    caloriesKcal: existingDayTotals.caloriesKcal + previewTotals.caloriesKcal,
    proteinGrams: existingDayTotals.proteinGrams + previewTotals.proteinGrams,
    carbsGrams: existingDayTotals.carbsGrams + previewTotals.carbsGrams,
    fatGrams: existingDayTotals.fatGrams + previewTotals.fatGrams,
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await onSubmit({
        name,
        date: dateTimeToIso(date),
        mealType,
        notes: emptyToNull(notes),
        items: items.map((entry) => ({
          foodId: entry.foodId,
          quantityGrams: Number(entry.quantityGrams),
        })),
      });
      onCancel();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Nom"><input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} required /></Field>
        <Field label="Date"><input className={inputClass} type="datetime-local" value={date} onChange={(event) => setDate(event.target.value)} required /></Field>
        <Field label="Type">
          <select className={inputClass} value={mealType} onChange={(event) => setMealType(event.target.value as MealType)}>
            {mealTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Notes"><textarea className={inputClass} value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} /></Field>
      <section className="rounded border border-amber-200 bg-amber-50/70 p-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-950">Filtres aliments</p>
            <p className="mt-1 text-xs text-amber-800/80">
              {filteredFoods.length} / {foods.length} aliment(s) visible(s).
            </p>
          </div>
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={() => {
              setFoodSearch("");
              setFoodBrandFilter("ALL");
            }}
          >
            Reinitialiser
          </button>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <input
            className={inputClass}
            value={foodSearch}
            onChange={(event) => setFoodSearch(event.target.value)}
            placeholder="Nom, marque ou code-barres..."
          />
          <select
            className={inputClass}
            value={foodBrandFilter}
            onChange={(event) => setFoodBrandFilter(event.target.value)}
          >
            <option value="ALL">Toutes les marques</option>
            {foodBrandOptions.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>
      </section>
      <section className="rounded border border-amber-200 bg-amber-50/80 p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-950">Recap avant validation</p>
            <p className="mt-1 text-xs text-amber-800/80">
              {activeGoal
                ? `Projection du jour comparee a ${activeGoal.name}.`
                : "Aucun objectif actif pour comparer la journee."}
            </p>
          </div>
          <p className="text-2xl font-bold text-amber-950">
            {roundMacro(previewTotals.caloriesKcal)} kcal
          </p>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          {[
            ["Calories", projectedDayTotals.caloriesKcal, activeGoal?.dailyCaloriesKcal ?? null, "kcal"],
            ["Proteines", projectedDayTotals.proteinGrams, activeGoal?.dailyProteinGrams ?? null, "g"],
            ["Glucides", projectedDayTotals.carbsGrams, activeGoal?.dailyCarbsGrams ?? null, "g"],
            ["Lipides", projectedDayTotals.fatGrams, activeGoal?.dailyFatGrams ?? null, "g"],
          ].map(([label, value, target, unit]) => (
            <p key={label as string} className="rounded bg-white px-3 py-2 text-sm text-amber-950">
              <span className="block text-xs font-medium uppercase tracking-wide text-amber-700">{label}</span>
              <span className="font-bold">{roundMacro(value as number)} {unit}</span>
              <span className="mt-1 block text-xs text-amber-700">
                {typeof target === "number" && target > 0
                  ? `${macroDeltaLabel(value as number, target)} ${unit} vs objectif`
                  : "Objectif non renseigne"}
              </span>
            </p>
          ))}
        </div>
      </section>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">Aliments</p>
          <button
            type="button"
            className={secondaryButtonClass}
            disabled={!nextFoodToAdd}
            onClick={() =>
              setItems((current) => [
                ...current,
                { foodId: nextFoodToAdd?.id ?? "", quantityGrams: "100" },
              ])
            }
          >
            Ajouter
          </button>
        </div>
        {!foods.length && <EmptyState label="Cree un aliment avant de composer un repas." />}
        {!!foods.length && !filteredFoods.length && (
          <EmptyState label="Aucun aliment ne correspond aux filtres. Reinitialise pour voir toute la liste." />
        )}
        {items.map((entry, index) => (
          <div key={index} className="rounded border border-slate-200 bg-white p-3">
            <div className="grid gap-2 md:grid-cols-[1fr_160px_auto]">
              <select
                className={inputClass}
                value={entry.foodId}
                onChange={(event) =>
                  setItems((current) =>
                    current.map((row, rowIndex) =>
                      rowIndex === index ? { ...row, foodId: event.target.value } : row,
                    ),
                  )
                }
              >
                {(() => {
                  const selectedFood = foods.find((food) => food.id === entry.foodId);
                  const options = selectedFood && !filteredFoods.some((food) => food.id === selectedFood.id)
                    ? [selectedFood, ...filteredFoods]
                    : filteredFoods;
                  return options.map((food) => (
                    <option key={food.id} value={food.id}>
                      {food.name}{food.brand ? ` - ${food.brand}` : ""}
                    </option>
                  ));
                })()}
              </select>
              <input className={inputClass} type="number" min="0.01" step="0.01" value={entry.quantityGrams} onChange={(event) => setItems((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, quantityGrams: event.target.value } : row))} />
              <button type="button" className={dangerButtonClass} onClick={() => setItems((current) => current.filter((_, rowIndex) => rowIndex !== index))}>Retirer</button>
            </div>
            {recentFoodPortions(entry.foodId, meals).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {recentFoodPortions(entry.foodId, meals).map((portion) => (
                  <button
                    key={portion}
                    type="button"
                    className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100"
                    onClick={() =>
                      setItems((current) =>
                        current.map((row, rowIndex) =>
                          rowIndex === index ? { ...row, quantityGrams: String(portion) } : row,
                        ),
                      )
                    }
                  >
                    {portion} g
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <FormActions isSaving={isSaving} onCancel={onCancel} />
    </form>
  );
}

function measurementValue(
  measurement: BodyMeasurement,
  key: BodyMeasurementField,
  unit: string,
) {
  const value = measurement[key];
  return value === null ? "-" : `${value} ${unit}`;
}

function formatComputedValue(value: number | null, decimals = 1) {
  if (value === null || Number.isNaN(value) || !Number.isFinite(value)) return "-";
  return value.toFixed(decimals);
}

function computeBmi(measurement: BodyMeasurement): number | null {
  if (!measurement.weightKg || !measurement.heightCm || measurement.heightCm <= 0) {
    return null;
  }
  const heightM = measurement.heightCm / 100;
  return measurement.weightKg / (heightM * heightM);
}

function toInches(valueCm: number) {
  return valueCm / 2.54;
}

function computeUsNavyBodyFat(measurement: BodyMeasurement): number | null {
  if (!measurement.heightCm || !measurement.neckCm || !measurement.waistCm) {
    return null;
  }

  const heightIn = toInches(measurement.heightCm);
  const neckIn = toInches(measurement.neckCm);
  const waistIn = toInches(measurement.waistCm);

  if (
    measurement.silhouette === "FEMALE" &&
    measurement.hipsCm !== null &&
    measurement.hipsCm !== undefined
  ) {
    const hipsIn = toInches(measurement.hipsCm);
    const logArg = waistIn + hipsIn - neckIn;
    if (logArg <= 0 || heightIn <= 0) return null;
    const result =
      163.205 * Math.log10(logArg) - 97.684 * Math.log10(heightIn) - 78.387;
    return result > 0 ? result : null;
  }

  const logArg = waistIn - neckIn;
  if (logArg <= 0 || heightIn <= 0) return null;
  const result =
    86.01 * Math.log10(logArg) - 70.041 * Math.log10(heightIn) + 36.76;
  return result > 0 ? result : null;
}

function computeAgeFromDateOfBirth(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null;
  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return null;

  const now = new Date();
  let age = now.getUTCFullYear() - birthDate.getUTCFullYear();
  const monthDelta = now.getUTCMonth() - birthDate.getUTCMonth();
  const dayDelta = now.getUTCDate() - birthDate.getUTCDate();
  if (monthDelta < 0 || (monthDelta === 0 && dayDelta < 0)) {
    age -= 1;
  }
  return age > 0 ? age : null;
}

function computeMifflinBmr(
  measurement: BodyMeasurement,
  ageYears: number | null,
): number | null {
  if (
    !measurement.weightKg ||
    !measurement.heightCm ||
    !ageYears ||
    measurement.weightKg <= 0 ||
    measurement.heightCm <= 0 ||
    ageYears <= 0
  ) {
    return null;
  }

  const base =
    10 * measurement.weightKg +
    6.25 * measurement.heightCm -
    5 * ageYears;
  return measurement.silhouette === "FEMALE" ? base - 161 : base + 5;
}

function computeDailyEnergyExpenditure(
  measurement: BodyMeasurement,
  ageYears: number | null,
): number | null {
  const bmr = computeMifflinBmr(measurement, ageYears);
  if (bmr === null) return null;
  const multiplier = measurement.isActiveLifestyle ? 1.55 : 1.2;
  return bmr * multiplier;
}

type BodyTrendPeriod = "30d" | "90d" | "365d";

const bodyTrendPeriods: Array<{ key: BodyTrendPeriod; label: string; days: number }> = [
  { key: "30d", label: "30j", days: 30 },
  { key: "90d", label: "90j", days: 90 },
  { key: "365d", label: "1 an", days: 365 },
];

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

function classifyBmi(value: number | null) {
  if (value === null) return { label: "Non calcule", detail: "Poids et taille requis." };
  if (value < 18.5) return { label: "Bas", detail: "En dessous de la zone usuelle." };
  if (value < 25) return { label: "Zone standard", detail: "Dans la zone de reference adulte." };
  if (value < 30) return { label: "Eleve", detail: "Au-dessus de la zone standard." };
  return { label: "Tres eleve", detail: "A surveiller avec d'autres indicateurs." };
}

function classifyBodyFat(value: number | null, silhouette: BodySilhouette) {
  if (value === null) return { label: "Non calculee", detail: "Taille, cou, taille abdominale et parfois hanches requis." };
  const standardMax = silhouette === "FEMALE" ? 31 : 24;
  const athleticMax = silhouette === "FEMALE" ? 24 : 17;
  if (value <= athleticMax) return { label: "Athletique", detail: "Estimation basse a moderee." };
  if (value <= standardMax) return { label: "Moderee", detail: "Estimation dans une zone courante." };
  return { label: "Elevee", detail: "A lire avec les mensurations et l'evolution." };
}

function calorieGuidance(tdee: number | null) {
  if (tdee === null) {
    return {
      maintenance: "-",
      deficit: "-",
      surplus: "-",
      detail: "Age, poids et taille requis pour estimer une base.",
    };
  }

  return {
    maintenance: `${Math.round(tdee)} kcal`,
    deficit: `${Math.round(tdee - 300)} kcal`,
    surplus: `${Math.round(tdee + 250)} kcal`,
    detail: "Estimations indicatives, a ajuster avec l'evolution reelle.",
  };
}

function buildBodyTrendRows(measurements: BodyMeasurement[], days: number) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return [...measurements]
    .filter((measurement) => new Date(measurement.date).getTime() >= since.getTime())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((measurement) => ({
      label: new Date(measurement.date).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
      }),
      poids: measurement.weightKg === null ? null : roundOne(measurement.weightKg),
      imc: roundOne(computeBmi(measurement) ?? NaN),
      masseGrasse: roundOne(computeUsNavyBodyFat(measurement) ?? NaN),
      taille: measurement.waistCm === null ? null : roundOne(measurement.waistCm),
    }))
    .map((row) => ({
      ...row,
      imc: Number.isNaN(row.imc) ? null : row.imc,
      masseGrasse: Number.isNaN(row.masseGrasse) ? null : row.masseGrasse,
    }));
}

function deltaLabel(first: number | null, latest: number | null, unit: string) {
  if (first === null || latest === null) return "-";
  const delta = roundOne(latest - first);
  if (delta === 0) return `stable ${unit}`.trim();
  return `${delta > 0 ? "+" : ""}${delta} ${unit}`.trim();
}

function BodyMeasurementTrends({ measurements }: { measurements: BodyMeasurement[] }) {
  const [period, setPeriod] = useState<BodyTrendPeriod>("90d");
  const selectedPeriod = bodyTrendPeriods.find((item) => item.key === period) ?? bodyTrendPeriods[1];
  const rows = buildBodyTrendRows(measurements, selectedPeriod.days);
  const first = rows[0];
  const latest = rows[rows.length - 1];
  const hasTrendData = rows.length >= 2;

  return (
    <section className="rounded border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="font-semibold text-neutral-950">Tendances corporelles</h3>
          <p className="mt-1 text-sm text-neutral-500">Poids, IMC, masse grasse et taille abdominale.</p>
        </div>
        <div className="flex flex-wrap gap-2 rounded border border-neutral-200 bg-neutral-50 p-1">
          {bodyTrendPeriods.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setPeriod(item.key)}
              className={`rounded border px-3 py-2 text-sm font-medium transition ${
                period === item.key
                  ? "border-emerald-700 bg-emerald-700 text-white"
                  : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {hasTrendData ? (
        <>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rows}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="poids" name="Poids kg" stroke="#047857" strokeWidth={2} dot={false} connectNulls />
                <Line type="monotone" dataKey="imc" name="IMC" stroke="#111827" strokeWidth={2} dot={false} connectNulls />
                <Line type="monotone" dataKey="masseGrasse" name="Masse grasse %" stroke="#e11d48" strokeWidth={2} dot={false} connectNulls />
                <Line type="monotone" dataKey="taille" name="Taille cm" stroke="#f59e0b" strokeWidth={2} dot={false} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-4">
            <p className="rounded bg-neutral-50 px-3 py-2 text-sm text-neutral-700">Poids: {deltaLabel(first?.poids ?? null, latest?.poids ?? null, "kg")}</p>
            <p className="rounded bg-neutral-50 px-3 py-2 text-sm text-neutral-700">IMC: {deltaLabel(first?.imc ?? null, latest?.imc ?? null, "")}</p>
            <p className="rounded bg-neutral-50 px-3 py-2 text-sm text-neutral-700">Masse grasse: {deltaLabel(first?.masseGrasse ?? null, latest?.masseGrasse ?? null, "%")}</p>
            <p className="rounded bg-neutral-50 px-3 py-2 text-sm text-neutral-700">Taille: {deltaLabel(first?.taille ?? null, latest?.taille ?? null, "cm")}</p>
          </div>
        </>
      ) : (
        <div className="mt-4 flex h-56 items-center justify-center rounded border border-dashed border-neutral-300 bg-neutral-50 px-4 text-center text-sm text-neutral-500">
          Deux mesures sur la periode sont necessaires pour afficher une tendance.
        </div>
      )}
    </section>
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

function metricConfig(metric: UserGoalMetric) {
  return (
    userGoalMetricOptions.find((option) => option.value === metric) ??
    userGoalMetricOptions[0]
  );
}

function currentGoalValue(
  goal: UserGoal,
  workouts: Workout[],
  measurements: BodyMeasurement[],
): number | null {
  if (
    goal.metric === "SPORT_WORKOUTS_PER_WEEK" ||
    goal.metric === "SPORT_MINUTES_PER_WEEK" ||
    goal.metric.startsWith("SPORT_EXERCISE_")
  ) {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const recentCompleted = workouts.filter(
      (workout) =>
        workout.status === "COMPLETED" && new Date(workout.date).getTime() >= since.getTime(),
    );

    if (goal.metric === "SPORT_WORKOUTS_PER_WEEK") {
      return recentCompleted.length;
    }

    if (goal.metric === "SPORT_EXERCISE_ONE_REP_MAX_KG") {
      if (!goal.exerciseId) return null;
      const estimates = recentCompleted.flatMap((workout) =>
        (workout.exercises ?? [])
          .filter((entry) => entry.exerciseId === goal.exerciseId)
          .flatMap((entry) =>
            entry.sets.map((set) => set.weight * (1 + Math.max(set.reps, 1) / 30)),
          ),
      );
      return estimates.length ? Math.max(...estimates) : null;
    }

    if (goal.metric === "SPORT_EXERCISE_TEN_REP_MAX_KG") {
      if (!goal.exerciseId) return null;
      const weights = recentCompleted.flatMap((workout) =>
        (workout.exercises ?? [])
          .filter((entry) => entry.exerciseId === goal.exerciseId)
          .flatMap((entry) =>
            entry.sets.filter((set) => set.reps >= 10).map((set) => set.weight),
          ),
      );
      return weights.length ? Math.max(...weights) : null;
    }

    if (goal.metric === "SPORT_EXERCISE_MAX_REPS") {
      if (!goal.exerciseId) return null;
      const reps = recentCompleted.flatMap((workout) =>
        (workout.exercises ?? [])
          .filter((entry) => entry.exerciseId === goal.exerciseId)
          .flatMap((entry) => entry.sets.map((set) => set.reps)),
      );
      return reps.length ? Math.max(...reps) : null;
    }

    return recentCompleted.reduce((total, workout) => total + workout.duration, 0);
  }

  const latest = measurements[0];
  if (!latest) return null;

  if (goal.metric === "BODY_WEIGHT_KG") {
    return latest.weightKg;
  }
  if (goal.metric === "BODY_BMI") {
    return computeBmi(latest);
  }
  if (goal.metric === "BODY_FAT_PERCENT") {
    return computeUsNavyBodyFat(latest);
  }

  return null;
}

function estimateOneRepMax(weight: number, reps: number) {
  if (weight <= 0 || reps <= 0) return null;
  return weight * (1 + Math.max(reps, 1) / 30);
}

function completedWorkoutEntriesForExercise(workouts: Workout[], exerciseId: string) {
  return [...workouts]
    .filter((workout) => workout.status === "COMPLETED")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .flatMap((workout) =>
      (workout.exercises ?? [])
        .filter((entry) => entry.exerciseId === exerciseId)
        .map((entry) => ({ workout, entry })),
    );
}

function exerciseHistoricalValues(goal: UserGoal, workouts: Workout[]) {
  if (!goal.exerciseId || !goal.metric.startsWith("SPORT_EXERCISE_")) return [];

  return completedWorkoutEntriesForExercise(workouts, goal.exerciseId)
    .map(({ workout, entry }) => {
      const values = entry.sets
        .map((set) => {
          if (goal.metric === "SPORT_EXERCISE_ONE_REP_MAX_KG") {
            return estimateOneRepMax(set.weight, set.reps);
          }
          if (goal.metric === "SPORT_EXERCISE_TEN_REP_MAX_KG") {
            return set.reps >= 10 ? set.weight : null;
          }
          if (goal.metric === "SPORT_EXERCISE_MAX_REPS") {
            return set.reps;
          }
          return null;
        })
        .filter((value): value is number => value !== null);

      return values.length
        ? { date: workout.date, value: Math.max(...values) }
        : null;
    })
    .filter((entry): entry is { date: string; value: number } => entry !== null);
}

function exerciseProgressionSummary(workouts: Workout[], exerciseId: string) {
  const entries = completedWorkoutEntriesForExercise(workouts, exerciseId);
  const allSets = entries.flatMap(({ workout, entry }) =>
    entry.sets.map((set) => ({ ...set, date: workout.date })),
  );
  const bestOneRepMax = Math.max(
    0,
    ...allSets.map((set) => estimateOneRepMax(set.weight, set.reps) ?? 0),
  );
  const bestTenRepMax = Math.max(
    0,
    ...allSets.filter((set) => set.reps >= 10).map((set) => set.weight),
  );
  const maxReps = Math.max(0, ...allSets.map((set) => set.reps));
  const latestEntry = entries[entries.length - 1];
  const latestSets = latestEntry?.entry.sets ?? [];
  const latestRpeValues = latestSets
    .map((set) => set.rpe)
    .filter((value): value is number => value !== null && value !== undefined);
  const latestRirValues = latestSets
    .map((set) => set.rir)
    .filter((value): value is number => value !== null && value !== undefined);
  const latestAvgRpe = latestRpeValues.length
    ? latestRpeValues.reduce((total, value) => total + value, 0) / latestRpeValues.length
    : null;
  const latestAvgRir = latestRirValues.length
    ? latestRirValues.reduce((total, value) => total + value, 0) / latestRirValues.length
    : null;
  const latestMinReps = latestSets.length
    ? Math.min(...latestSets.map((set) => set.reps))
    : null;
  const latestTopWeight = latestSets.length
    ? Math.max(...latestSets.map((set) => set.weight))
    : null;

  let recommendation = "Ajoute deux seances sur cet exercice pour obtenir un conseil fiable.";
  let tone = "border-slate-200 bg-slate-50 text-slate-700";

  if (latestSets.length >= 2 && latestMinReps !== null && latestTopWeight !== null) {
    const effortComfortable =
      latestAvgRir === null ? latestAvgRpe === null || latestAvgRpe <= 8 : latestAvgRir >= 2;
    const effortTooHigh =
      (latestAvgRir !== null && latestAvgRir <= 0) || (latestAvgRpe !== null && latestAvgRpe >= 9.5);

    if (latestMinReps >= 10 && effortComfortable) {
      recommendation = `Augmenter legerement la charge: ${roundOne(latestTopWeight + 2.5)} kg a tester.`;
      tone = "border-emerald-200 bg-emerald-50 text-emerald-800";
    } else if (latestMinReps < 6 || effortTooHigh) {
      recommendation = "Reduire la charge ou garder plus de marge avant de monter.";
      tone = "border-amber-200 bg-amber-50 text-amber-800";
    } else {
      recommendation = "Rester sur la meme charge et viser plus de reps propres.";
      tone = "border-sky-200 bg-sky-50 text-sky-800";
    }
  }

  return {
    sessions: entries.length,
    bestOneRepMax: bestOneRepMax > 0 ? bestOneRepMax : null,
    bestTenRepMax: bestTenRepMax > 0 ? bestTenRepMax : null,
    maxReps: maxReps > 0 ? maxReps : null,
    latestAvgRpe,
    latestAvgRir,
    recommendation,
    tone,
  };
}

function goalProgressPercent(goal: UserGoal, currentValue: number | null) {
  if (currentValue === null || goal.targetValue <= 0) {
    return 0;
  }

  if (goal.direction === "AT_LEAST") {
    return Math.min(100, Math.round((currentValue / goal.targetValue) * 100));
  }

  if (goal.direction === "AT_MOST") {
    return Math.min(100, Math.round((goal.targetValue / Math.max(currentValue, 0.1)) * 100));
  }

  const distance = Math.abs(currentValue - goal.targetValue);
  return Math.max(0, Math.min(100, Math.round(100 - (distance / goal.targetValue) * 100)));
}

function goalStatus(goal: UserGoal, currentValue: number | null) {
  if (currentValue === null) return "En attente";
  if (goal.direction === "AT_LEAST") return currentValue >= goal.targetValue ? "Atteint" : "En cours";
  if (goal.direction === "AT_MOST") return currentValue <= goal.targetValue ? "Atteint" : "En cours";
  return Math.abs(currentValue - goal.targetValue) < 0.05 ? "Atteint" : "En cours";
}

function formatGoalValue(value: number | null, metric: UserGoalMetric) {
  if (value === null || Number.isNaN(value) || !Number.isFinite(value)) return "-";
  const config = metricConfig(metric);
  const formatted = value.toFixed(
    metric === "SPORT_WORKOUTS_PER_WEEK" || metric === "SPORT_EXERCISE_MAX_REPS"
      ? 0
      : 1,
  );
  return config.unit ? `${formatted} ${config.unit}` : formatted;
}

function goalDaysUntilEnd(goal: UserGoal) {
  if (!goal.endDate) return null;
  const diff = new Date(goal.endDate).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

function bodyGoalHistoricalValues(goal: UserGoal, measurements: BodyMeasurement[]) {
  if (!goal.metric.startsWith("BODY_")) return [];

  return [...measurements]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((measurement) => {
      if (goal.metric === "BODY_WEIGHT_KG") return { date: measurement.date, value: measurement.weightKg };
      if (goal.metric === "BODY_BMI") return { date: measurement.date, value: computeBmi(measurement) };
      if (goal.metric === "BODY_FAT_PERCENT") return { date: measurement.date, value: computeUsNavyBodyFat(measurement) };
      return { date: measurement.date, value: null };
    })
    .filter((entry): entry is { date: string; value: number } => entry.value !== null);
}

function goalProjectionLabel(
  goal: UserGoal,
  workouts: Workout[],
  measurements: BodyMeasurement[],
) {
  const values = goal.metric.startsWith("BODY_")
    ? bodyGoalHistoricalValues(goal, measurements)
    : exerciseHistoricalValues(goal, workouts);
  if (values.length < 2) return "Projection disponible apres deux donnees compatibles.";

  const first = values[0];
  const latest = values[values.length - 1];
  const days = Math.max(
    1,
    (new Date(latest.date).getTime() - new Date(first.date).getTime()) / 86400000,
  );
  const dailyDelta = (latest.value - first.value) / days;
  if (Math.abs(dailyDelta) < 0.01) return "Tendance stable sur les dernieres mesures.";

  const remaining = goal.targetValue - latest.value;
  const movingTowardTarget =
    (goal.direction === "AT_MOST" && dailyDelta < 0) ||
    (goal.direction === "AT_LEAST" && dailyDelta > 0) ||
    (goal.direction === "EXACT" &&
      Math.abs(goal.targetValue - latest.value) < Math.abs(goal.targetValue - first.value));

  if (!movingTowardTarget) return "La tendance actuelle s'eloigne de la cible.";
  const estimatedDays = Math.ceil(Math.abs(remaining / dailyDelta));
  if (!Number.isFinite(estimatedDays) || estimatedDays < 0) {
    return "Projection insuffisante avec la tendance actuelle.";
  }

  return `Projection: cible atteignable dans environ ${estimatedDays} jour(s).`;
}

function SportProgressionPanel({
  exercises,
  workouts,
  goals,
}: {
  exercises: Exercise[];
  workouts: Workout[];
  goals: UserGoal[];
}) {
  const exerciseIdsFromGoals = goals
    .filter((goal) => goal.isActive && goal.metric.startsWith("SPORT_EXERCISE_") && goal.exerciseId)
    .map((goal) => goal.exerciseId as string);
  const exerciseIdsFromWorkouts = workouts.flatMap((workout) =>
    (workout.exercises ?? []).map((entry) => entry.exerciseId),
  );
  const exerciseIds = Array.from(new Set([...exerciseIdsFromGoals, ...exerciseIdsFromWorkouts])).slice(0, 6);
  const rows = exerciseIds
    .map((exerciseId) => {
      const exercise = exercises.find((item) => item.id === exerciseId);
      const summary = exerciseProgressionSummary(workouts, exerciseId);
      const linkedGoals = goals.filter((goal) => goal.isActive && goal.exerciseId === exerciseId);
      return exercise ? { exercise, summary, linkedGoals } : null;
    })
    .filter((row): row is {
      exercise: Exercise;
      summary: ReturnType<typeof exerciseProgressionSummary>;
      linkedGoals: UserGoal[];
    } => row !== null);

  return (
    <section className="rounded border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="font-semibold text-neutral-950">Progression par exercice</h3>
          <p className="mt-1 text-sm text-neutral-500">
            Meilleures perfs, effort recent et conseil de double progression.
          </p>
        </div>
        <span className="w-fit rounded border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600">
          Plage cible 8-10 reps
        </span>
      </div>

      {!rows.length ? (
        <div className="mt-4 flex h-40 items-center justify-center rounded border border-dashed border-neutral-300 bg-neutral-50 px-4 text-center text-sm text-neutral-500">
          Termine une seance avec exercices pour afficher les signaux de progression.
        </div>
      ) : (
        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {rows.map(({ exercise, summary, linkedGoals }) => (
            <article key={exercise.id} className="rounded border border-slate-200 bg-slate-50/60 p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-950">{exercise.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {summary.sessions} seance(s) realisee(s)
                  </p>
                </div>
                {linkedGoals.length > 0 && (
                  <span className="w-fit rounded bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                    {linkedGoals.length} objectif(s)
                  </span>
                )}
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <p className="rounded bg-white px-3 py-2 text-sm text-slate-700">
                  <span className="block text-xs font-medium uppercase tracking-wide text-slate-500">1RM</span>
                  <span className="text-lg font-bold text-slate-950">{formatComputedValue(summary.bestOneRepMax)} kg</span>
                </p>
                <p className="rounded bg-white px-3 py-2 text-sm text-slate-700">
                  <span className="block text-xs font-medium uppercase tracking-wide text-slate-500">10RM</span>
                  <span className="text-lg font-bold text-slate-950">{formatComputedValue(summary.bestTenRepMax)} kg</span>
                </p>
                <p className="rounded bg-white px-3 py-2 text-sm text-slate-700">
                  <span className="block text-xs font-medium uppercase tracking-wide text-slate-500">Max reps</span>
                  <span className="text-lg font-bold text-slate-950">{summary.maxReps ?? "-"}</span>
                </p>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <p className="rounded bg-white px-3 py-2 text-sm text-slate-700">
                  RPE moyen recent: <span className="font-semibold">{formatComputedValue(summary.latestAvgRpe)}</span>
                </p>
                <p className="rounded bg-white px-3 py-2 text-sm text-slate-700">
                  RIR moyen recent: <span className="font-semibold">{formatComputedValue(summary.latestAvgRir)}</span>
                </p>
              </div>
              <p className={`mt-3 rounded border px-3 py-2 text-sm font-medium ${summary.tone}`}>
                {summary.recommendation}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function UserGoalsPanel({
  domain,
  goals,
  exercises,
  workouts,
  measurements,
  draft,
  onCreate,
  onEdit,
  onCancel,
  onSubmit,
  onDelete,
}: {
  domain: UserGoalDomain;
  goals: UserGoal[];
  exercises: Exercise[];
  workouts: Workout[];
  measurements: BodyMeasurement[];
  draft?: UserGoal;
  onCreate: () => void;
  onEdit: (goal: UserGoal) => void;
  onCancel: () => void;
  onSubmit: (data: UserGoalInput) => Promise<void>;
  onDelete: (goal: UserGoal) => void;
}) {
  const domainGoals = goals.filter((goal) => goal.domain === domain);

  if (draft !== undefined) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 rounded border border-slate-200 bg-slate-50 p-2">
          <button type="button" className={inactiveViewButtonClass} onClick={onCancel}>Liste</button>
          <button type="button" className={activeViewButtonClass}>Objectif</button>
        </div>
        <div className="rounded border border-slate-200 bg-white p-4">
          <UserGoalForm
            item={draft.id ? draft : undefined}
            initialDomain={domain}
            exercises={exercises}
            onCancel={onCancel}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded border border-slate-200 bg-slate-50 p-2">
        <button type="button" className={activeViewButtonClass}>Liste</button>
        <button type="button" className={inactiveViewButtonClass} onClick={onCreate}>Ajouter un objectif</button>
      </div>
      {!domainGoals.length ? (
        <EmptyState label={domain === "SPORT" ? "Aucun objectif sport pour le moment." : "Aucun objectif corps pour le moment."} />
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {domainGoals.map((goal) => {
            const currentValue = currentGoalValue(goal, workouts, measurements);
            const progress = goalProgressPercent(goal, currentValue);
            const config = metricConfig(goal.metric);
            const exercise = exercises.find((item) => item.id === goal.exerciseId);
            const daysUntilEnd = goalDaysUntilEnd(goal);
            const isDeadlineSoon = daysUntilEnd !== null && daysUntilEnd >= 0 && daysUntilEnd <= 14;
            const projection =
              goal.metric.startsWith("BODY_") || goal.metric.startsWith("SPORT_EXERCISE_")
                ? goalProjectionLabel(goal, workouts, measurements)
                : "Projection disponible avec les objectifs par exercice ou corporels.";
            return (
              <li key={goal.id} className={itemCardClass}>
                <div className="flex h-full flex-col justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-950">{goal.name}</p>
                      {goal.isActive && <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">Actif</span>}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{config.label}</p>
                    {exercise && (
                      <p className="mt-1 text-xs text-slate-500">Exercice: {exercise.name}</p>
                    )}
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <p className="rounded bg-slate-50 px-3 py-2 text-sm">
                        <span className="block text-xs font-medium uppercase tracking-wide text-slate-500">Actuel</span>
                        <span className="text-lg font-bold text-slate-950">{formatGoalValue(currentValue, goal.metric)}</span>
                      </p>
                      <p className="rounded bg-slate-50 px-3 py-2 text-sm">
                        <span className="block text-xs font-medium uppercase tracking-wide text-slate-500">Cible</span>
                        <span className="text-lg font-bold text-slate-950">{formatGoalValue(goal.targetValue, goal.metric)}</span>
                      </p>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs font-medium text-slate-500">
                        <span>{goalStatus(goal, currentValue)}</span>
                        <span>{progress}%</span>
                      </div>
                      <progress className="mt-1 h-2 w-full overflow-hidden rounded accent-emerald-600" value={progress} max={100} />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Depuis {toInputDate(goal.startDate)}{goal.endDate ? ` jusqu'au ${toInputDate(goal.endDate)}` : ""}
                    </p>
                    <div className={`mt-3 rounded border px-3 py-2 text-sm ${
                      isDeadlineSoon
                        ? "border-amber-200 bg-amber-50 text-amber-800"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}>
                      <p className="font-medium">
                        {isDeadlineSoon ? `Echeance dans ${daysUntilEnd} jour(s)` : goalStatus(goal, currentValue)}
                      </p>
                      <p className="mt-1">{projection}</p>
                    </div>
                    {goal.notes && <p className="mt-2 text-sm text-slate-500">{goal.notes}</p>}
                  </div>
                  <ItemActions item={goal} onEdit={onEdit} onDelete={onDelete} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function BodyMeasurementDiagram({ measurement }: { measurement: BodyMeasurement }) {
  const silhouetteSrc =
    measurement.silhouette === "FEMALE"
      ? "/body-measurements/body-silhouette-female.png"
      : "/body-measurements/body-silhouette.png";
  const callouts: Array<{
    key: BodyMeasurementField;
    label: string;
    unit: string;
    lineClassName: string;
    labelClassName: string;
  }> = [
    {
      key: "neckCm",
      label: "Cou",
      unit: "cm",
      lineClassName: "left-[24%] top-[19%] w-[26%]",
      labelClassName: "left-[3%] top-[14%] text-left",
    },
    {
      key: "shouldersCm",
      label: "Epaules",
      unit: "cm",
      lineClassName: "left-[61%] top-[22%] w-[17%]",
      labelClassName: "right-[3%] top-[18%] text-left",
    },
    {
      key: "chestCm",
      label: "Poitrine",
      unit: "cm",
      lineClassName: "left-[20%] top-[31%] w-[26%]",
      labelClassName: "left-[3%] top-[27%] text-left",
    },
    {
      key: "rightArmCm",
      label: "Biceps",
      unit: "cm",
      lineClassName: "left-[64%] top-[34%] w-[15%]",
      labelClassName: "right-[3%] top-[31%] text-left",
    },
    {
      key: "rightForearmCm",
      label: "Avant-bras",
      unit: "cm",
      lineClassName: "left-[21%] top-[44%] w-[13%]",
      labelClassName: "left-[3%] top-[40%] text-left",
    },
    {
      key: "waistCm",
      label: "Taille",
      unit: "cm",
      lineClassName: "left-[53%] top-[44%] w-[25%]",
      labelClassName: "right-[3%] top-[40%] text-left",
    },
    {
      key: "hipsCm",
      label: "Hanches",
      unit: "cm",
      lineClassName: "left-[53%] top-[57%] w-[25%]",
      labelClassName: "right-[3%] top-[53%] text-left",
    },
    {
      key: "rightThighCm",
      label: "Cuisses",
      unit: "cm",
      lineClassName: "left-[23%] top-[60%] w-[21%]",
      labelClassName: "left-[3%] top-[56%] text-left",
    },
    {
      key: "rightCalfCm",
      label: "Mollets",
      unit: "cm",
      lineClassName: "left-[25%] top-[78%] w-[20%]",
      labelClassName: "left-[3%] top-[74%] text-left",
    },
  ];

  return (
    <div
      role="img"
      aria-label="Schema des mensurations corporelles"
      className="relative mx-auto aspect-[447/627] w-full max-w-[430px] overflow-hidden rounded border border-emerald-200 bg-emerald-50 shadow-sm"
    >
      <img
        src={silhouetteSrc}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-emerald-900/5" />
      <div className="absolute inset-0 text-[10px] sm:text-xs">
        {callouts.map((callout) => (
          <div key={callout.key}>
            <span
              className={`absolute h-px rounded-full bg-emerald-800/80 shadow-[0_0_0_1px_rgba(255,255,255,0.45)] ${callout.lineClassName}`}
            />
            <span
              className={`absolute min-w-16 rounded bg-white/75 px-1.5 py-1 font-semibold leading-tight text-emerald-950 shadow-sm ring-1 ring-emerald-900/10 backdrop-blur ${callout.labelClassName}`}
            >
              {callout.label}
              <span className="block font-medium text-emerald-900/70">
                {measurementValue(measurement, callout.key, callout.unit)}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
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

function ResourceHeader({
  resource,
  onCreate,
  onCreateFromTemplate,
  isLoading,
}: {
  resource: Resource;
  onCreate: () => void;
  onCreateFromTemplate?: () => void;
  isLoading: boolean;
}) {
  const titles: Record<Resource, string> = {
    dashboard: "Synthese",
    calendar: "Calendrier",
    workouts: "Seances",
    sportGoals: "Objectifs sport",
    exercises: "Exercices",
    foods: "Aliments",
    meals: "Repas",
    goals: "Objectifs nutrition",
    measurements: "Mensurations",
    bodyGoals: "Objectifs corps",
    profile: "Profil",
  };
  const createLabels: Partial<Record<Resource, string>> = {
    bodyGoals: "Ajouter un objectif",
    exercises: "Creer un exercice",
    foods: "Creer un aliment",
    goals: "Creer un objectif",
    meals: "Creer un repas",
    measurements: "Ajouter une mesure",
    sportGoals: "Ajouter un objectif",
    workouts: "Creer une seance",
  };

  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">{titles[resource]}</h2>
        {isLoading && <p className="mt-1 text-sm text-slate-500">Chargement...</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {onCreateFromTemplate && (
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={onCreateFromTemplate}
          >
            Depuis un modele
          </button>
        )}
        <button type="button" className={buttonClass} onClick={onCreate}>
          {createLabels[resource] ?? "Creer"}
        </button>
      </div>
    </div>
  );
}

function openCreate(resource: Resource, setModal: (modal: ModalState) => void) {
  if (resource === "workouts") setModal({ type: "workout" });
  if (resource === "foods") setModal({ type: "food" });
  if (resource === "goals") setModal({ type: "goal" });
}

function modalTitle(modal: Exclude<ModalState, null>) {
  if (modal.type === "workout-template") {
    return "Creer depuis un modele";
  }

  const prefix = modal.item ? "Modifier" : "Creer";
  const names = {
    workout: "une seance",
    food: "un aliment",
    goal: "un objectif",
  };
  return `${prefix} ${names[modal.type]}`;
}

function confirmDelete(label: string, action: () => Promise<void>) {
  if (window.confirm(`Supprimer "${label}" ?`)) {
    void action();
  }
}

function WorkoutsList({
  workouts,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  workouts: Workout[];
  onEdit: (item: Workout) => void;
  onDuplicate: (item: Workout) => void;
  onDelete: (item: Workout) => void;
}) {
  if (!workouts.length) {
    return <EmptyState label="Aucune seance pour le moment. Commence par creer ou planifier ta premiere seance." />;
  }
  return (
    <ul className="space-y-3">
      {workouts.map((workout) => (
        <li key={workout.id} className={itemCardClass}>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{workout.name}</p>
                <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                  workout.status === "COMPLETED"
                    ? "bg-emerald-100 text-emerald-800"
                    : workout.status === "CANCELED"
                    ? "bg-rose-100 text-rose-800"
                    : "bg-blue-100 text-blue-800"
                }`}>
                  {workout.status === "COMPLETED"
                    ? "Realisee"
                    : workout.status === "CANCELED"
                    ? "Annulee"
                    : "Prevue"}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{formatDate(workout.date)} - {workout.duration} min</p>
              <p className="mt-1 text-sm text-slate-500">{workout.exercises?.length ?? 0} exercice(s)</p>
              {workout.exercises?.length ? (
                <div className="mt-3 space-y-2">
                  {workout.exercises.map((entry) => (
                    <div key={entry.id} className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      <p className="font-medium text-slate-900">{entry.exercise?.name ?? "Exercice"}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {entry.sets.map((set) => {
                          const effort = [
                            set.rpe !== null && set.rpe !== undefined ? `RPE ${set.rpe}` : null,
                            set.rir !== null && set.rir !== undefined ? `RIR ${set.rir}` : null,
                          ].filter(Boolean).join(" / ");
                          const base = set.durationMinutes
                            ? `${set.durationMinutes} min a ${set.avgKmh ?? "-"} km/h`
                            : `${set.reps} reps x ${set.weight} kg`;
                          return effort ? `${base} (${effort})` : base;
                        }).join(" | ")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={secondaryButtonClass} onClick={() => onEdit(workout)}>Modifier</button>
              <button type="button" className={secondaryButtonClass} onClick={() => onDuplicate(workout)}>Dupliquer</button>
              <button type="button" className={dangerButtonClass} onClick={() => onDelete(workout)}>Supprimer</button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ExercisesList({
  exercises,
  getExerciseImageUrl,
  onEdit,
  onDelete,
}: {
  exercises: Exercise[];
  getExerciseImageUrl: (exercise: Exercise | undefined) => string | null;
  onEdit: (item: Exercise) => void;
  onDelete: (item: Exercise) => void;
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "STRENGTH" | "CARDIO" | "MOBILITY">("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState<"ALL" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED">("ALL");
  const [bodyPartFilter, setBodyPartFilter] = useState("ALL");
  const bodyPartOptions = Array.from(
    new Set(exercises.flatMap((exercise) => exercise.bodyParts ?? [])),
  ).sort((a, b) => a.localeCompare(b, "fr"));

  if (!exercises.length) {
    return <EmptyState label="Aucun exercice disponible. Cree un exercice pour composer tes seances." />;
  }

  const normalizedSearch = search.trim().toLocaleLowerCase("fr-FR");
  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      exercise.name.toLocaleLowerCase("fr-FR").includes(normalizedSearch) ||
      (exercise.description?.toLocaleLowerCase("fr-FR").includes(normalizedSearch) ?? false);
    const matchesType = typeFilter === "ALL" || exercise.exerciseType === typeFilter;
    const matchesDifficulty =
      difficultyFilter === "ALL" || exercise.difficulty === difficultyFilter;
    const matchesBodyPart =
      bodyPartFilter === "ALL" || (exercise.bodyParts ?? []).includes(bodyPartFilter);

    return matchesSearch && matchesType && matchesDifficulty && matchesBodyPart;
  });

  return (
    <div className="space-y-4">
      <div className="rounded border border-slate-200 bg-white p-3">
        <div className="grid gap-3 md:grid-cols-5">
          <input
            className={inputClass}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un exercice..."
          />
          <select
            className={inputClass}
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(
                event.target.value as "ALL" | "STRENGTH" | "CARDIO" | "MOBILITY",
              )
            }
          >
            <option value="ALL">Tous les types</option>
            {exerciseTypeOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            className={inputClass}
            value={difficultyFilter}
            onChange={(event) =>
              setDifficultyFilter(
                event.target.value as "ALL" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
              )
            }
          >
            <option value="ALL">Toutes difficultes</option>
            {difficultyOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            className={inputClass}
            value={bodyPartFilter}
            onChange={(event) => setBodyPartFilter(event.target.value)}
          >
            <option value="ALL">Toutes zones</option>
            {bodyPartOptions.map((bodyPart) => (
              <option key={bodyPart} value={bodyPart}>
                {bodyPart}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={() => {
              setSearch("");
              setTypeFilter("ALL");
              setDifficultyFilter("ALL");
              setBodyPartFilter("ALL");
            }}
          >
            Reinitialiser
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {filteredExercises.length} / {exercises.length} exercice(s)
        </p>
      </div>

      {!filteredExercises.length ? (
        <EmptyState label="Aucun exercice ne correspond a tes filtres." />
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {filteredExercises.map((exercise) => (
            <li key={exercise.id} className={itemCardClass}>
              <div className="flex h-full flex-col justify-between gap-3">
                <div>
                  <ExerciseImagePreview
                    imageUrl={getExerciseImageUrl(exercise)}
                    label={exercise.name}
                    className="mb-3 h-32 w-full"
                  />
                  <p className="font-semibold">{exercise.name}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {labelFromOptions(exerciseTypeOptions, exercise.exerciseType)} - {labelFromOptions(difficultyOptions, exercise.difficulty)}
                  </p>
                  {(exercise.bodyParts?.length ?? 0) > 0 && (
                    <p className="mt-1 text-xs text-slate-500">
                      Zone cible: {exercise.bodyParts?.join(", ")}
                    </p>
                  )}
                  {exercise.description && <p className="mt-2 text-sm text-slate-500">{exercise.description}</p>}
                </div>
                <ItemActions item={exercise} onEdit={onEdit} onDelete={onDelete} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NutritionDayPanel({
  meals,
  goals,
}: {
  meals: Meal[];
  goals: NutritionGoal[];
}) {
  const [selectedDate, setSelectedDate] = useState(toInputDate(new Date().toISOString()));
  const selectedDateIso = safeDateToIso(selectedDate);
  const goal = activeNutritionGoalForDate(goals, selectedDateIso);
  const totals = dayMealTotals(meals, selectedDateIso);
  const dayMeals = meals.filter((meal) => localDateKey(meal.date) === selectedDate);

  return (
    <section className="rounded border border-amber-200 bg-amber-50/70 p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="font-semibold text-amber-950">Objectif du jour</h3>
          <p className="mt-1 text-sm text-amber-800/80">
            {goal
              ? `Comparaison avec ${goal.name}.`
              : "Aucun objectif actif sur cette date."}
          </p>
        </div>
        <input
          className={`${inputClass} max-w-44 bg-white`}
          type="date"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
        />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        {[
          ["Calories", totals.caloriesKcal, goal?.dailyCaloriesKcal ?? null, "kcal"],
          ["Proteines", totals.proteinGrams, goal?.dailyProteinGrams ?? null, "g"],
          ["Glucides", totals.carbsGrams, goal?.dailyCarbsGrams ?? null, "g"],
          ["Lipides", totals.fatGrams, goal?.dailyFatGrams ?? null, "g"],
        ].map(([label, value, target, unit]) => {
          const numericValue = value as number;
          const numericTarget = typeof target === "number" ? target : null;
          const progress = numericTarget && numericTarget > 0
            ? Math.min(100, Math.round((numericValue / numericTarget) * 100))
            : 0;
          return (
            <div key={label as string} className="rounded border border-amber-100 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">{label}</p>
              <p className="mt-2 text-xl font-bold text-amber-950">
                {roundMacro(numericValue)} {unit}
              </p>
              <p className="mt-1 text-xs text-amber-700">
                {numericTarget ? `${macroDeltaLabel(numericValue, numericTarget)} ${unit}` : "Objectif non renseigne"}
              </p>
              <progress className="mt-2 h-2 w-full overflow-hidden rounded accent-amber-500" value={progress} max={100} />
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-sm text-amber-800">
        {dayMeals.length
          ? `${dayMeals.length} repas saisi(s) sur la journee.`
          : "Aucun repas saisi sur cette journee."}
      </p>
    </section>
  );
}

function MealsList({
  meals,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  meals: Meal[];
  onEdit: (item: Meal) => void;
  onDuplicate: (item: Meal) => void;
  onDelete: (item: Meal) => void;
}) {
  if (!meals.length) {
    return <EmptyState label="Aucun repas pour le moment. Saisis un repas pour comparer tes apports a tes objectifs." />;
  }
  return (
    <ul className="space-y-3">
      {meals.map((meal) => (
        <li key={meal.id} className={itemCardClass}>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="font-semibold">{meal.name}</p>
              <p className="mt-1 text-sm text-slate-600">{formatDate(meal.date)} - {labelFromOptions(mealTypes, meal.mealType)}</p>
              <p className="mt-1 text-sm text-slate-500">{meal.totals.caloriesKcal} kcal - {meal.items.length} aliment(s)</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={secondaryButtonClass} onClick={() => onEdit(meal)}>Modifier</button>
              <button type="button" className={secondaryButtonClass} onClick={() => onDuplicate(meal)}>Dupliquer</button>
              <button type="button" className={dangerButtonClass} onClick={() => onDelete(meal)}>Supprimer</button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function NutritionGoalsList({ goals, onEdit, onDelete }: { goals: NutritionGoal[]; onEdit: (item: NutritionGoal) => void; onDelete: (item: NutritionGoal) => void }) {
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
                {goal.isActive && <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">Actif</span>}
              </div>
              <p className="mt-1 text-sm text-slate-600">{goal.dailyCaloriesKcal} kcal/jour</p>
              <p className="mt-1 text-xs text-slate-500">Depuis {toInputDate(goal.startDate)}{goal.endDate ? ` jusqu'au ${toInputDate(goal.endDate)}` : ""}</p>
            </div>
            <ItemActions item={goal} onEdit={onEdit} onDelete={onDelete} />
          </div>
        </li>
      ))}
    </ul>
  );
}
