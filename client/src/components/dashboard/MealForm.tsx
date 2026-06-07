import type { DragEvent } from "react";
import { FormEvent, useMemo, useState } from "react";
import type { Food, Meal, MealInput, MealType, NutritionGoal } from "../../api/client";
import {
  activeNutritionGoalForDate,
  dayMealTotals,
  emptyMacroTotals,
  macroDeltaLabel,
  roundMacro,
  type MacroTotals,
} from "./nutrition";
import {
  dangerButtonClass,
  EmptyState,
  Field,
  FormActions,
  inputClass,
  secondaryButtonClass,
} from "./shared";

type MealItemFormRow = {
  foodId: string;
  quantityGrams: string;
};

type MealTemplate = {
  id: string;
  name: string;
  mealType: MealType;
  notes: string | null;
  items: MealItemFormRow[];
};

type MealFormProps = {
  item?: Meal;
  foods: Food[];
  meals: Meal[];
  nutritionGoals: NutritionGoal[];
  onSubmit: (data: MealInput) => Promise<void>;
  onCancel: () => void;
};

const foodDragDataType = "application/x-suivi-sportif-food-id";
const mealTemplatesStorageKey = "suivi-sportif-meal-templates-v1";

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

function dateTimeToIso(value: string) {
  return new Date(value).toISOString();
}

function safeDateTimeToIso(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
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

function defaultMealItemRow(food: Food | null): MealItemFormRow {
  return { foodId: food?.id ?? "", quantityGrams: "100" };
}

function insertMealItemRow(
  items: MealItemFormRow[],
  food: Food,
  insertIndex: number,
) {
  const next = [...items];
  const boundedIndex = Math.max(0, Math.min(insertIndex, next.length));
  next.splice(boundedIndex, 0, defaultMealItemRow(food));
  return next;
}

function readMealTemplates() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(mealTemplatesStorageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((template): template is MealTemplate =>
      typeof template.id === "string" &&
      typeof template.name === "string" &&
      Array.isArray(template.items),
    );
  } catch {
    return [];
  }
}

function writeMealTemplates(templates: MealTemplate[]) {
  window.localStorage.setItem(mealTemplatesStorageKey, JSON.stringify(templates));
}

export function duplicateMealInput(meal: Meal): MealInput | null {
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

export function MealForm({
  item,
  foods,
  meals,
  nutritionGoals,
  onSubmit,
  onCancel,
}: MealFormProps) {
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
  const [mealTemplates, setMealTemplates] = useState<MealTemplate[]>(readMealTemplates);
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

  function addFoodFromLibrary(food: Food, insertIndex = items.length) {
    setItems((current) => insertMealItemRow(current, food, insertIndex));
  }

  function foodFromDrag(event: DragEvent) {
    const foodId = event.dataTransfer.getData(foodDragDataType);
    return foods.find((food) => food.id === foodId);
  }

  function saveMealTemplate() {
    if (!items.length) return;

    const template: MealTemplate = {
      id: `meal-template-${Date.now()}`,
      name: name.trim() || "Modele de repas",
      mealType,
      notes: emptyToNull(notes),
      items,
    };
    const nextTemplates = [template, ...mealTemplates].slice(0, 8);
    writeMealTemplates(nextTemplates);
    setMealTemplates(nextTemplates);
  }

  function applyMealTemplate(template: MealTemplate) {
    setName(template.name);
    setMealType(template.mealType);
    setNotes(template.notes ?? "");
    setItems(template.items);
  }

  function deleteMealTemplate(templateId: string) {
    const nextTemplates = mealTemplates.filter((template) => template.id !== templateId);
    writeMealTemplates(nextTemplates);
    setMealTemplates(nextTemplates);
  }

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
      <section className="rounded border border-amber-200 bg-white p-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-950">Modeles de repas</p>
            <p className="mt-1 text-xs text-amber-800/80">
              Sauvegarde une combinaison d'aliments pour la reutiliser plus tard.
            </p>
          </div>
          <button
            type="button"
            className={secondaryButtonClass}
            disabled={!items.length}
            onClick={saveMealTemplate}
          >
            Sauvegarder ce repas
          </button>
        </div>
        {!!mealTemplates.length && (
          <div className="mt-3 flex flex-wrap gap-2">
            {mealTemplates.map((template) => (
              <div
                key={template.id}
                className="flex items-center gap-2 rounded border border-amber-100 bg-amber-50 px-2 py-1"
              >
                <button
                  type="button"
                  className="text-xs font-semibold text-amber-900 hover:underline"
                  onClick={() => applyMealTemplate(template)}
                >
                  {template.name}
                </button>
                <button
                  type="button"
                  className="text-xs font-bold text-amber-700 hover:text-amber-950"
                  onClick={() => deleteMealTemplate(template.id)}
                  aria-label={`Supprimer le modele ${template.name}`}
                  title="Supprimer ce modele"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
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
      {!!filteredFoods.length && (
        <section className="rounded border border-slate-200 bg-slate-50 p-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
            <div
              className="flex min-h-24 flex-1 items-center justify-center rounded border border-dashed border-amber-300 bg-white px-3 py-4 text-center text-sm font-medium text-amber-800"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const food = foodFromDrag(event);
                if (food) {
                  addFoodFromLibrary(food);
                }
              }}
            >
              Depose un aliment ici pour l'ajouter au repas.
            </div>
            <div className="min-w-0 flex-[2]">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">
                  Bibliotheque filtree
                </p>
                <p className="text-xs text-slate-500">
                  {filteredFoods.length} aliment(s)
                </p>
              </div>
              <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto pr-1">
                {filteredFoods.map((food) => (
                  <button
                    key={food.id}
                    type="button"
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "copy";
                      event.dataTransfer.setData(foodDragDataType, food.id);
                    }}
                    onClick={() => addFoodFromLibrary(food)}
                    className="rounded border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 shadow-sm transition hover:border-amber-300 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    title="Cliquer ou glisser pour ajouter"
                  >
                    <span className="block font-semibold text-slate-900">
                      {food.name}
                    </span>
                    <span className="mt-1 block text-slate-500">
                      {food.brand ? `${food.brand} / ` : ""}
                      {food.caloriesKcal} kcal / 100 g
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
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
                defaultMealItemRow(nextFoodToAdd),
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
          <div
            key={index}
            className="rounded border border-slate-200 bg-white p-3"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const food = foodFromDrag(event);
              if (food) {
                setItems((current) => insertMealItemRow(current, food, index + 1));
              }
            }}
          >
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
