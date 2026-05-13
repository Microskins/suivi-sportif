import { FormEvent, type ReactNode, useEffect, useState } from "react";
import type {
  Exercise,
  ExerciseInput,
  Food,
  FoodInput,
  Meal,
  MealInput,
  MealType,
  NutritionGoal,
  NutritionGoalInput,
  Workout,
  WorkoutInput,
  WorkoutStatus,
  WorkoutTemplate,
} from "../api/client";
import { DashboardOverview } from "./DashboardOverview";
import { WorkoutsCalendar } from "./WorkoutsCalendar";
import { useExercisesStore } from "../stores/exercisesStore";
import { useFoodsStore } from "../stores/foodsStore";
import { useMealsStore } from "../stores/mealsStore";
import { useNutritionGoalsStore } from "../stores/nutritionGoalsStore";
import { useWorkoutTemplatesStore } from "../stores/workoutTemplatesStore";
import { useWorkoutsStore } from "../stores/workoutsStore";

type Resource =
  | "dashboard"
  | "calendar"
  | "workouts"
  | "exercises"
  | "foods"
  | "meals"
  | "goals";
type ModalState =
  | { type: "exercise"; item?: Exercise }
  | { type: "workout"; item?: Workout; presetDate?: string }
  | { type: "workout-template" }
  | { type: "food"; item?: Food }
  | { type: "meal"; item?: Meal }
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

function ErrorBox({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </p>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-600">
      {label}
    </div>
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

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <span className="mt-1 block">{children}</span>
    </label>
  );
}

const inputClass =
  "block w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-emerald-700";
const buttonClass =
  "rounded bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60";
const secondaryButtonClass =
  "rounded border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50";
const dangerButtonClass =
  "rounded border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50";

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
  sets: Array<{ reps: string; weight: string; rest: string }>;
};

function WorkoutForm({
  item,
  initialDate,
  exercises,
  onSubmit,
  onCancel,
}: {
  item?: Workout;
  initialDate?: string;
  exercises: Exercise[];
  onSubmit: (data: WorkoutInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [date, setDate] = useState(
    toInputDateTime(item?.date ?? initialDate),
  );
  const [status, setStatus] = useState<WorkoutStatus>(
    item?.status ?? inferWorkoutStatusFromDate(item?.date ?? initialDate ?? new Date().toISOString()),
  );
  const [duration, setDuration] = useState(String(item?.duration ?? 45));
  const [notes, setNotes] = useState(item?.notes ?? "");
  const [rows, setRows] = useState<WorkoutExerciseFormRow[]>(
    item?.exercises?.length
      ? item.exercises.map((entry) => ({
          exerciseId: entry.exerciseId,
          sets: entry.sets.map((set) => ({
            reps: String(set.reps),
            weight: String(set.weight),
            rest: String(set.rest),
          })),
        }))
      : exercises[0]
        ? [{ exerciseId: exercises[0].id, sets: [{ reps: "10", weight: "0", rest: "60" }] }]
        : [],
  );
  const [isSaving, setIsSaving] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [exerciseTypeFilter, setExerciseTypeFilter] = useState<"ALL" | "STRENGTH" | "CARDIO" | "MOBILITY">("ALL");
  const [exerciseDifficultyFilter, setExerciseDifficultyFilter] = useState<"ALL" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED">("ALL");
  const [exerciseBodyPartFilter, setExerciseBodyPartFilter] = useState("ALL");

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
            reps: Number(set.reps),
            weight: Number(set.weight),
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
        <div className="rounded border border-slate-200 p-3">
          <p className="mb-2 text-sm font-semibold text-slate-800">Filtres exercices</p>
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
          <p className="text-sm font-semibold text-slate-800">Exercices et series</p>
          <button
            type="button"
            className={secondaryButtonClass}
            disabled={!exercises.length}
            onClick={() =>
              setRows((current) => [
                ...current,
                { exerciseId: exercises[0]?.id ?? "", sets: [{ reps: "10", weight: "0", rest: "60" }] },
              ])
            }
          >
            Ajouter
          </button>
        </div>
        {!exercises.length && <EmptyState label="Cree un exercice avant de composer une seance." />}
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="rounded border border-slate-200 p-3">
            <div className="flex items-center gap-3">
              <select
                className={inputClass}
                value={row.exerciseId}
                onChange={(event) => updateRow(rowIndex, { ...row, exerciseId: event.target.value })}
              >
                {(filteredExercises.length ? filteredExercises : exercises).map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>{exercise.name}</option>
                ))}
              </select>
              <button type="button" className={dangerButtonClass} onClick={() => setRows((current) => current.filter((_, index) => index !== rowIndex))}>
                Retirer
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {row.sets.map((set, setIndex) => (
                <div key={setIndex} className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto]">
                  <input className={inputClass} type="number" min="0" placeholder="Reps" value={set.reps} onChange={(event) => updateSet(row, rowIndex, setIndex, "reps", event.target.value, updateRow)} />
                  <input className={inputClass} type="number" min="0" step="0.5" placeholder="Poids" value={set.weight} onChange={(event) => updateSet(row, rowIndex, setIndex, "weight", event.target.value, updateRow)} />
                  <input className={inputClass} type="number" min="0" placeholder="Repos sec" value={set.rest} onChange={(event) => updateSet(row, rowIndex, setIndex, "rest", event.target.value, updateRow)} />
                  <button type="button" className={secondaryButtonClass} onClick={() => updateRow(rowIndex, { ...row, sets: row.sets.filter((_, index) => index !== setIndex) })}>
                    Suppr.
                  </button>
                </div>
              ))}
              <button type="button" className={secondaryButtonClass} onClick={() => updateRow(rowIndex, { ...row, sets: [...row.sets, { reps: "10", weight: "0", rest: "60" }] })}>
                Ajouter une serie
              </button>
            </div>
          </div>
        ))}
      </div>
      <FormActions isSaving={isSaving} onCancel={onCancel} />
    </form>
  );
}

function updateSet(
  row: WorkoutExerciseFormRow,
  rowIndex: number,
  setIndex: number,
  key: "reps" | "weight" | "rest",
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
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Musculation");
  const [level, setLevel] = useState("Intermediaire");
  const [duration, setDuration] = useState("45");
  const [description, setDescription] = useState("");
  const [rows, setRows] = useState<
    Array<{ exerciseId: string; sets: string; reps: string; rest: string; weight: string }>
  >(exercises[0] ? [{ exerciseId: exercises[0].id, sets: "3", reps: "10", rest: "60", weight: "0" }] : []);
  const [isSaving, setIsSaving] = useState(false);

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
      <div className="flex gap-2">
        <button type="button" className={secondaryButtonClass} onClick={() => setMode("instantiate")}>Creer une seance</button>
        <button type="button" className={secondaryButtonClass} onClick={() => setMode("create")}>Creer un modele</button>
        <button type="button" className={secondaryButtonClass} onClick={() => setMode("edit")} disabled={!templates.length}>Modifier un modele</button>
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
          <div className="grid gap-3 lg:grid-cols-2">
            {templates.map((template) => (
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
            <div key={index} className="grid gap-2 md:grid-cols-6">
              <select className={inputClass} value={row.exerciseId} onChange={(event) => setRows((current) => current.map((entry, rowIndex) => rowIndex === index ? { ...entry, exerciseId: event.target.value } : entry))}>
                {exercises.map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>{exercise.name}</option>
                ))}
              </select>
              <input className={inputClass} type="number" min="1" value={row.sets} onChange={(event) => setRows((current) => current.map((entry, rowIndex) => rowIndex === index ? { ...entry, sets: event.target.value } : entry))} />
              <input className={inputClass} type="number" min="0" value={row.reps} onChange={(event) => setRows((current) => current.map((entry, rowIndex) => rowIndex === index ? { ...entry, reps: event.target.value } : entry))} />
              <input className={inputClass} type="number" min="0" value={row.rest} onChange={(event) => setRows((current) => current.map((entry, rowIndex) => rowIndex === index ? { ...entry, rest: event.target.value } : entry))} />
              <input className={inputClass} type="number" min="0" value={row.weight} onChange={(event) => setRows((current) => current.map((entry, rowIndex) => rowIndex === index ? { ...entry, weight: event.target.value } : entry))} />
              <button type="button" className={dangerButtonClass} onClick={() => setRows((current) => current.filter((_, rowIndex) => rowIndex !== index))}>Retirer</button>
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

function FoodForm({
  item,
  onSubmit,
  onCancel,
}: {
  item?: Food;
  onSubmit: (data: FoodInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [brand, setBrand] = useState(item?.brand ?? "");
  const [barcode, setBarcode] = useState(item?.barcode ?? "");
  const [caloriesKcal, setCaloriesKcal] = useState(String(item?.caloriesKcal ?? 0));
  const [proteinGrams, setProteinGrams] = useState(String(item?.proteinGrams ?? 0));
  const [carbsGrams, setCarbsGrams] = useState(String(item?.carbsGrams ?? 0));
  const [fatGrams, setFatGrams] = useState(String(item?.fatGrams ?? 0));
  const [fiberGrams, setFiberGrams] = useState(item?.fiberGrams === null || item?.fiberGrams === undefined ? "" : String(item.fiberGrams));
  const [servingUnit, setServingUnit] = useState(item?.servingUnit ?? "g");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await onSubmit({
        name,
        brand: emptyToNull(brand),
        barcode: emptyToNull(barcode),
        caloriesKcal: Number(caloriesKcal),
        proteinGrams: Number(proteinGrams),
        carbsGrams: Number(carbsGrams),
        fatGrams: Number(fatGrams),
        fiberGrams: numberOrNull(fiberGrams),
        servingUnit,
      });
      onCancel();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nom"><input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} required /></Field>
        <Field label="Marque"><input className={inputClass} value={brand} onChange={(event) => setBrand(event.target.value)} /></Field>
        <Field label="Code-barres"><input className={inputClass} value={barcode} onChange={(event) => setBarcode(event.target.value)} /></Field>
        <Field label="Unite"><input className={inputClass} value={servingUnit} onChange={(event) => setServingUnit(event.target.value)} required /></Field>
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        <MacroInput label="Calories" value={caloriesKcal} onChange={setCaloriesKcal} />
        <MacroInput label="Proteines" value={proteinGrams} onChange={setProteinGrams} />
        <MacroInput label="Glucides" value={carbsGrams} onChange={setCarbsGrams} />
        <MacroInput label="Lipides" value={fatGrams} onChange={setFatGrams} />
        <MacroInput label="Fibres" value={fiberGrams} onChange={setFiberGrams} required={false} />
      </div>
      <FormActions isSaving={isSaving} onCancel={onCancel} />
    </form>
  );
}

function MacroInput({
  label,
  value,
  onChange,
  required = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <Field label={label}>
      <input className={inputClass} type="number" min="0" step="0.01" value={value} onChange={(event) => onChange(event.target.value)} required={required} />
    </Field>
  );
}

type MealItemFormRow = {
  foodId: string;
  quantityGrams: string;
};

function MealForm({
  item,
  foods,
  onSubmit,
  onCancel,
}: {
  item?: Meal;
  foods: Food[];
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
  const [isSaving, setIsSaving] = useState(false);

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
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">Aliments</p>
          <button type="button" className={secondaryButtonClass} disabled={!foods.length} onClick={() => setItems((current) => [...current, { foodId: foods[0]?.id ?? "", quantityGrams: "100" }])}>
            Ajouter
          </button>
        </div>
        {!foods.length && <EmptyState label="Cree un aliment avant de composer un repas." />}
        {items.map((entry, index) => (
          <div key={index} className="grid gap-2 md:grid-cols-[1fr_160px_auto]">
            <select className={inputClass} value={entry.foodId} onChange={(event) => setItems((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, foodId: event.target.value } : row))}>
              {foods.map((food) => <option key={food.id} value={food.id}>{food.name}</option>)}
            </select>
            <input className={inputClass} type="number" min="0.01" step="0.01" value={entry.quantityGrams} onChange={(event) => setItems((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, quantityGrams: event.target.value } : row))} />
            <button type="button" className={dangerButtonClass} onClick={() => setItems((current) => current.filter((_, rowIndex) => rowIndex !== index))}>Retirer</button>
          </div>
        ))}
      </div>
      <FormActions isSaving={isSaving} onCancel={onCancel} />
    </form>
  );
}

function NutritionGoalForm({
  item,
  onSubmit,
  onCancel,
}: {
  item?: NutritionGoal;
  onSubmit: (data: NutritionGoalInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [startDate, setStartDate] = useState(toInputDate(item?.startDate) || toInputDate(new Date().toISOString()));
  const [endDate, setEndDate] = useState(toInputDate(item?.endDate));
  const [dailyCaloriesKcal, setDailyCaloriesKcal] = useState(String(item?.dailyCaloriesKcal ?? 2400));
  const [dailyProteinGrams, setDailyProteinGrams] = useState(item?.dailyProteinGrams === null || item?.dailyProteinGrams === undefined ? "" : String(item.dailyProteinGrams));
  const [dailyCarbsGrams, setDailyCarbsGrams] = useState(item?.dailyCarbsGrams === null || item?.dailyCarbsGrams === undefined ? "" : String(item.dailyCarbsGrams));
  const [dailyFatGrams, setDailyFatGrams] = useState(item?.dailyFatGrams === null || item?.dailyFatGrams === undefined ? "" : String(item.dailyFatGrams));
  const [isActive, setIsActive] = useState(item?.isActive ?? true);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await onSubmit({
        name,
        startDate: dateToIso(startDate),
        endDate: endDate ? dateToIso(endDate) : null,
        dailyCaloriesKcal: Number(dailyCaloriesKcal),
        dailyProteinGrams: numberOrNull(dailyProteinGrams),
        dailyCarbsGrams: numberOrNull(dailyCarbsGrams),
        dailyFatGrams: numberOrNull(dailyFatGrams),
        isActive,
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
        <Field label="Debut"><input className={inputClass} type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required /></Field>
        <Field label="Fin"><input className={inputClass} type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></Field>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <MacroInput label="Calories/jour" value={dailyCaloriesKcal} onChange={setDailyCaloriesKcal} />
        <MacroInput label="Proteines/jour" value={dailyProteinGrams} onChange={setDailyProteinGrams} required={false} />
        <MacroInput label="Glucides/jour" value={dailyCarbsGrams} onChange={setDailyCarbsGrams} required={false} />
        <MacroInput label="Lipides/jour" value={dailyFatGrams} onChange={setDailyFatGrams} required={false} />
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
        Objectif actif
      </label>
      <FormActions isSaving={isSaving} onCancel={onCancel} />
    </form>
  );
}

function FormActions({ isSaving, onCancel }: { isSaving: boolean; onCancel: () => void }) {
  return (
    <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
      <button type="button" className={secondaryButtonClass} onClick={onCancel}>Annuler</button>
      <button type="submit" disabled={isSaving} className={buttonClass}>{isSaving ? "Enregistrement..." : "Enregistrer"}</button>
    </div>
  );
}

export function Dashboard({
  userName,
  userEmail,
  onLogout,
  isAuthBypassEnabled,
}: {
  userName: string;
  userEmail: string;
  onLogout: () => void;
  isAuthBypassEnabled: boolean;
}) {
  const [resource, setResource] = useState<Resource>("dashboard");
  const [modal, setModal] = useState<ModalState>(null);
  const [workoutsView, setWorkoutsView] = useState<"list" | "create" | "from-template">("list");
  const [exerciseDraft, setExerciseDraft] = useState<Exercise | undefined>(undefined);
  const [workoutDraft, setWorkoutDraft] = useState<Workout | undefined>(undefined);
  const exercisesStore = useExercisesStore();
  const workoutsStore = useWorkoutsStore();
  const workoutTemplatesStore = useWorkoutTemplatesStore();
  const foodsStore = useFoodsStore();
  const mealsStore = useMealsStore();
  const goalsStore = useNutritionGoalsStore();

  useEffect(() => {
    void exercisesStore.fetchExercises();
    void workoutsStore.fetchWorkouts();
    void workoutTemplatesStore.fetchWorkoutTemplates();
    void foodsStore.fetchFoods();
    void mealsStore.fetchMeals();
    void goalsStore.fetchNutritionGoals();
  }, []);

  const isLoading =
    exercisesStore.isLoading ||
    workoutsStore.isLoading ||
    workoutTemplatesStore.isLoading ||
    foodsStore.isLoading ||
    mealsStore.isLoading ||
    goalsStore.isLoading;

  const activeError =
    resource === "dashboard" || resource === "calendar"
      ? null
      : resource === "workouts"
      ? workoutsStore.error ?? workoutTemplatesStore.error
      : resource === "exercises"
        ? exercisesStore.error
        : resource === "foods"
          ? foodsStore.error
          : resource === "meals"
            ? mealsStore.error
            : goalsStore.error;

  const contentClass =
    resource === "dashboard" || resource === "calendar"
      ? "min-w-0"
      : "rounded border border-neutral-200 bg-white p-5 shadow-sm";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f8f5_0%,#edf4ef_48%,#f6f7f4_100%)] text-neutral-950">
      <section className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="rounded border border-neutral-200 bg-white/90 p-5 shadow-sm backdrop-blur">
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
          <nav className="h-fit rounded border border-neutral-200 bg-white/90 p-2 shadow-sm backdrop-blur">
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Accueil
            </p>
            <button
              type="button"
              onClick={() => setResource("dashboard")}
              className={`mb-1 block w-full rounded px-3 py-2 text-left text-sm font-medium ${
                resource === "dashboard" ? "bg-emerald-700 text-white shadow-sm" : "text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              Synthese
            </button>
            <button
              type="button"
              onClick={() => setResource("calendar")}
              className={`mb-1 block w-full rounded px-3 py-2 text-left text-sm font-medium ${
                resource === "calendar"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              Calendrier
            </button>
            <p className="mt-3 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Sport
            </p>
            {[
              ["workouts", "Seances"],
              ["exercises", "Exercices"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setResource(key as Resource)}
                className={`mb-1 block w-full rounded px-3 py-2 text-left text-sm font-medium ${
                  resource === key ? "bg-neutral-950 text-white shadow-sm" : "text-neutral-700 hover:bg-neutral-100"
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
                className={`mb-1 block w-full rounded px-3 py-2 text-left text-sm font-medium ${
                  resource === key ? "bg-amber-600 text-white shadow-sm" : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className={contentClass}>
            {resource !== "dashboard" && resource !== "calendar" && (
              <ResourceHeader
                resource={resource}
                onCreate={() => {
                  if (resource === "workouts") {
                    setWorkoutsView("create");
                    setWorkoutDraft(undefined);
                    return;
                  }
                  if (resource === "exercises") {
                    setExerciseDraft({} as Exercise);
                    return;
                  }
                  openCreate(resource, setModal);
                }}
                onCreateFromTemplate={
                  resource === "workouts"
                    ? () => setWorkoutsView("from-template")
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
                  isLoading={isLoading}
                  onQuickAction={(action) => {
                    if (action === "workout") setModal({ type: "workout" });
                    if (action === "meal") setModal({ type: "meal" });
                    if (action === "goal") setModal({ type: "goal" });
                  }}
                />
              )}
              {resource === "calendar" && (
                <WorkoutsCalendar
                  workouts={workoutsStore.workouts}
                  isLoading={isLoading}
                  onPlan={(dateIso) => setModal({ type: "workout", presetDate: dateIso })}
                  onAssociate={async (workoutId, dateIso) => {
                    await workoutsStore.updateWorkout(workoutId, { date: dateIso });
                  }}
                  onEdit={(workout) => setModal({ type: "workout", item: workout })}
                />
              )}
              {resource === "workouts" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className={secondaryButtonClass} onClick={() => { setWorkoutsView("list"); setWorkoutDraft(undefined); }}>Liste</button>
                    <button type="button" className={secondaryButtonClass} onClick={() => { setWorkoutsView("create"); setWorkoutDraft(undefined); }}>Creer une seance</button>
                    <button type="button" className={secondaryButtonClass} onClick={() => setWorkoutsView("from-template")}>Depuis un modele</button>
                  </div>
                  {workoutsView === "list" && (
                    <WorkoutsList
                      workouts={workoutsStore.workouts}
                      onEdit={(item) => { setWorkoutDraft(item); setWorkoutsView("create"); }}
                      onDelete={(item) => confirmDelete(item.name, () => workoutsStore.deleteWorkout(item.id))}
                    />
                  )}
                  {workoutsView === "create" && (
                    <div className="rounded border border-slate-200 bg-white p-4">
                      <WorkoutForm
                        item={workoutDraft}
                        exercises={exercisesStore.exercises}
                        onCancel={() => {
                          setWorkoutDraft(undefined);
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
              {resource === "exercises" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className={secondaryButtonClass} onClick={() => setExerciseDraft(undefined)}>Liste</button>
                    <button type="button" className={secondaryButtonClass} onClick={() => setExerciseDraft({} as Exercise)}>Creer un exercice</button>
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
                <MealsList
                  meals={mealsStore.meals}
                  onEdit={(item) => setModal({ type: "meal", item })}
                  onDelete={(item) => confirmDelete(item.name, () => mealsStore.deleteMeal(item.id))}
                />
              )}
              {resource === "goals" && (
                <NutritionGoalsList
                  goals={goalsStore.nutritionGoals}
                  onEdit={(item) => setModal({ type: "goal", item })}
                  onDelete={(item) => confirmDelete(item.name, () => goalsStore.deleteNutritionGoal(item.id))}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {modal && (
        <Modal title={modalTitle(modal)} onClose={() => setModal(null)}>
          {modal.type === "exercise" && (
            <ExerciseForm
              item={modal.item}
              onCancel={() => setModal(null)}
              onSubmit={(data) => modal.item ? exercisesStore.updateExercise(modal.item.id, data) : exercisesStore.createExercise(data)}
            />
          )}
          {modal.type === "workout" && (
            <WorkoutForm
              item={modal.item}
              initialDate={modal.presetDate}
              exercises={exercisesStore.exercises}
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
          {modal.type === "meal" && (
            <MealForm
              item={modal.item}
              foods={foodsStore.foods}
              onCancel={() => setModal(null)}
              onSubmit={(data) => modal.item ? mealsStore.updateMeal(modal.item.id, data, foodsStore.foods) : mealsStore.createMeal(data, foodsStore.foods)}
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
    exercises: "Exercices",
    foods: "Aliments",
    meals: "Repas",
    goals: "Objectifs nutrition",
  };

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-xl font-semibold">{titles[resource]}</h2>
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
        <button type="button" className={buttonClass} onClick={onCreate}>Creer</button>
      </div>
    </div>
  );
}

function openCreate(resource: Resource, setModal: (modal: ModalState) => void) {
  if (resource === "workouts") setModal({ type: "workout" });
  if (resource === "exercises") setModal({ type: "exercise" });
  if (resource === "foods") setModal({ type: "food" });
  if (resource === "meals") setModal({ type: "meal" });
  if (resource === "goals") setModal({ type: "goal" });
}

function modalTitle(modal: Exclude<ModalState, null>) {
  if (modal.type === "workout-template") {
    return "Creer depuis un modele";
  }

  const prefix = modal.item ? "Modifier" : "Creer";
  const names = {
    exercise: "un exercice",
    workout: "une seance",
    food: "un aliment",
    meal: "un repas",
    goal: "un objectif",
  };
  return `${prefix} ${names[modal.type]}`;
}

function confirmDelete(label: string, action: () => Promise<void>) {
  if (window.confirm(`Supprimer "${label}" ?`)) {
    void action();
  }
}

function ItemActions<T>({ item, onEdit, onDelete }: { item: T; onEdit: (item: T) => void; onDelete: (item: T) => void }) {
  return (
    <div className="flex gap-2">
      <button type="button" className={secondaryButtonClass} onClick={() => onEdit(item)}>Modifier</button>
      <button type="button" className={dangerButtonClass} onClick={() => onDelete(item)}>Supprimer</button>
    </div>
  );
}

function WorkoutsList({ workouts, onEdit, onDelete }: { workouts: Workout[]; onEdit: (item: Workout) => void; onDelete: (item: Workout) => void }) {
  if (!workouts.length) return <EmptyState label="Aucune seance pour le moment." />;
  return (
    <ul className="space-y-3">
      {workouts.map((workout) => (
        <li key={workout.id} className="rounded border border-slate-200 p-4">
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
            </div>
            <ItemActions item={workout} onEdit={onEdit} onDelete={onDelete} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ExercisesList({ exercises, onEdit, onDelete }: { exercises: Exercise[]; onEdit: (item: Exercise) => void; onDelete: (item: Exercise) => void }) {
  if (!exercises.length) return <EmptyState label="Aucun exercice disponible." />;

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "STRENGTH" | "CARDIO" | "MOBILITY">("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState<"ALL" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED">("ALL");

  const normalizedSearch = search.trim().toLocaleLowerCase("fr-FR");
  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      exercise.name.toLocaleLowerCase("fr-FR").includes(normalizedSearch) ||
      (exercise.description?.toLocaleLowerCase("fr-FR").includes(normalizedSearch) ?? false);
    const matchesType = typeFilter === "ALL" || exercise.exerciseType === typeFilter;
    const matchesDifficulty =
      difficultyFilter === "ALL" || exercise.difficulty === difficultyFilter;

    return matchesSearch && matchesType && matchesDifficulty;
  });

  return (
    <div className="space-y-4">
      <div className="rounded border border-slate-200 bg-white p-3">
        <div className="grid gap-3 md:grid-cols-4">
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
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={() => {
              setSearch("");
              setTypeFilter("ALL");
              setDifficultyFilter("ALL");
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
            <li key={exercise.id} className="rounded border border-slate-200 p-4">
              <div className="flex h-full flex-col justify-between gap-3">
                <div>
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

function FoodsList({ foods, onEdit, onDelete }: { foods: Food[]; onEdit: (item: Food) => void; onDelete: (item: Food) => void }) {
  if (!foods.length) return <EmptyState label="Aucun aliment disponible." />;
  return (
    <ul className="grid gap-3 lg:grid-cols-2">
      {foods.map((food) => (
        <li key={food.id} className="rounded border border-slate-200 p-4">
          <div className="flex h-full flex-col justify-between gap-3">
            <div>
              <p className="font-semibold">{food.name}</p>
              <p className="mt-1 text-sm text-slate-600">{food.caloriesKcal} kcal - P {food.proteinGrams} / G {food.carbsGrams} / L {food.fatGrams}</p>
              <p className="mt-1 text-xs text-slate-500">{food.isGlobal ? "Global" : "Personnel"} - pour 100 {food.servingUnit}</p>
            </div>
            <ItemActions item={food} onEdit={onEdit} onDelete={onDelete} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function MealsList({ meals, onEdit, onDelete }: { meals: Meal[]; onEdit: (item: Meal) => void; onDelete: (item: Meal) => void }) {
  if (!meals.length) return <EmptyState label="Aucun repas pour le moment." />;
  return (
    <ul className="space-y-3">
      {meals.map((meal) => (
        <li key={meal.id} className="rounded border border-slate-200 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="font-semibold">{meal.name}</p>
              <p className="mt-1 text-sm text-slate-600">{formatDate(meal.date)} - {labelFromOptions(mealTypes, meal.mealType)}</p>
              <p className="mt-1 text-sm text-slate-500">{meal.totals.caloriesKcal} kcal - {meal.items.length} aliment(s)</p>
            </div>
            <ItemActions item={meal} onEdit={onEdit} onDelete={onDelete} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function NutritionGoalsList({ goals, onEdit, onDelete }: { goals: NutritionGoal[]; onEdit: (item: NutritionGoal) => void; onDelete: (item: NutritionGoal) => void }) {
  if (!goals.length) return <EmptyState label="Aucun objectif nutrition." />;
  return (
    <ul className="grid gap-3 lg:grid-cols-2">
      {goals.map((goal) => (
        <li key={goal.id} className="rounded border border-slate-200 p-4">
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
