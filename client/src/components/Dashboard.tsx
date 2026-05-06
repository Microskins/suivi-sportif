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
} from "../api/client";
import { DashboardOverview } from "./DashboardOverview";
import { useExercisesStore } from "../stores/exercisesStore";
import { useFoodsStore } from "../stores/foodsStore";
import { useMealsStore } from "../stores/mealsStore";
import { useNutritionGoalsStore } from "../stores/nutritionGoalsStore";
import { useWorkoutsStore } from "../stores/workoutsStore";

type Resource = "dashboard" | "workouts" | "exercises" | "foods" | "meals" | "goals";
type ModalState =
  | { type: "exercise"; item?: Exercise }
  | { type: "workout"; item?: Workout }
  | { type: "food"; item?: Food }
  | { type: "meal"; item?: Meal }
  | { type: "goal"; item?: NutritionGoal }
  | null;

const muscleGroups = [
  ["chest", "Pectoraux"],
  ["back", "Dos"],
  ["shoulders", "Epaules"],
  ["arms", "Bras"],
  ["legs", "Jambes"],
  ["core", "Tronc"],
  ["cardio", "Cardio"],
] as const;

const equipmentOptions = [
  ["none", "Aucun"],
  ["barbell", "Barre"],
  ["dumbbell", "Halteres"],
  ["machine", "Machine"],
  ["cable", "Poulie"],
  ["kettlebell", "Kettlebell"],
  ["resistance_band", "Elastique"],
] as const;

const difficultyOptions = [
  ["beginner", "Debutant"],
  ["intermediate", "Intermediaire"],
  ["advanced", "Avance"],
] as const;

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
  const [muscleGroup, setMuscleGroup] = useState(item?.muscleGroup ?? "legs");
  const [equipment, setEquipment] = useState(item?.equipment ?? "none");
  const [difficulty, setDifficulty] = useState(item?.difficulty ?? "beginner");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await onSubmit({
        name,
        description: emptyToNull(description),
        muscleGroup,
        equipment,
        difficulty,
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
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Groupe">
          <select className={inputClass} value={muscleGroup} onChange={(event) => setMuscleGroup(event.target.value)}>
            {muscleGroups.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>
        <Field label="Equipement">
          <select className={inputClass} value={equipment} onChange={(event) => setEquipment(event.target.value)}>
            {equipmentOptions.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>
        <Field label="Difficulte">
          <select className={inputClass} value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
            {difficultyOptions.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>
      </div>
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
  exercises,
  onSubmit,
  onCancel,
}: {
  item?: Workout;
  exercises: Exercise[];
  onSubmit: (data: WorkoutInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [date, setDate] = useState(toInputDateTime(item?.date));
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
      <Field label="Notes">
        <textarea className={inputClass} value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
      </Field>
      <div className="space-y-3">
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
                {exercises.map((exercise) => (
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
  const exercisesStore = useExercisesStore();
  const workoutsStore = useWorkoutsStore();
  const foodsStore = useFoodsStore();
  const mealsStore = useMealsStore();
  const goalsStore = useNutritionGoalsStore();

  useEffect(() => {
    void exercisesStore.fetchExercises();
    void workoutsStore.fetchWorkouts();
    void foodsStore.fetchFoods();
    void mealsStore.fetchMeals();
    void goalsStore.fetchNutritionGoals();
  }, []);

  const isLoading =
    exercisesStore.isLoading ||
    workoutsStore.isLoading ||
    foodsStore.isLoading ||
    mealsStore.isLoading ||
    goalsStore.isLoading;

  const activeError =
    resource === "dashboard"
      ? null
      : resource === "workouts"
      ? workoutsStore.error
      : resource === "exercises"
        ? exercisesStore.error
        : resource === "foods"
          ? foodsStore.error
          : resource === "meals"
            ? mealsStore.error
            : goalsStore.error;

  const contentClass =
    resource === "dashboard"
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
            {resource !== "dashboard" && (
              <ResourceHeader resource={resource} onCreate={() => openCreate(resource, setModal)} isLoading={isLoading} />
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
              {resource === "workouts" && (
                <WorkoutsList
                  workouts={workoutsStore.workouts}
                  onEdit={(item) => setModal({ type: "workout", item })}
                  onDelete={(item) => confirmDelete(item.name, () => workoutsStore.deleteWorkout(item.id))}
                />
              )}
              {resource === "exercises" && (
                <ExercisesList
                  exercises={exercisesStore.exercises}
                  onEdit={(item) => setModal({ type: "exercise", item })}
                  onDelete={(item) => confirmDelete(item.name, () => exercisesStore.deleteExercise(item.id))}
                />
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
              exercises={exercisesStore.exercises}
              onCancel={() => setModal(null)}
              onSubmit={(data) => modal.item ? workoutsStore.updateWorkout(modal.item.id, data) : workoutsStore.createWorkout(data)}
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

function ResourceHeader({ resource, onCreate, isLoading }: { resource: Resource; onCreate: () => void; isLoading: boolean }) {
  const titles: Record<Resource, string> = {
    dashboard: "Synthese",
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
      <button type="button" className={buttonClass} onClick={onCreate}>Creer</button>
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
              <p className="font-semibold">{workout.name}</p>
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
  return (
    <ul className="grid gap-3 lg:grid-cols-2">
      {exercises.map((exercise) => (
        <li key={exercise.id} className="rounded border border-slate-200 p-4">
          <div className="flex h-full flex-col justify-between gap-3">
            <div>
              <p className="font-semibold">{exercise.name}</p>
              <p className="mt-1 text-sm text-slate-600">{labelFromOptions(muscleGroups, exercise.muscleGroup)} - {labelFromOptions(difficultyOptions, exercise.difficulty)}</p>
              {exercise.description && <p className="mt-2 text-sm text-slate-500">{exercise.description}</p>}
            </div>
            <ItemActions item={exercise} onEdit={onEdit} onDelete={onDelete} />
          </div>
        </li>
      ))}
    </ul>
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
