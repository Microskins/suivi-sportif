import { FormEvent, useState } from "react";
import type { NutritionGoal, NutritionGoalInput } from "../../api/client";
import { Field, FormActions, inputClass, MacroInput } from "./shared";

type NutritionGoalFormProps = {
  item?: NutritionGoal;
  onSubmit: (data: NutritionGoalInput) => Promise<void>;
  onCancel: () => void;
};

function toInputDate(value?: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

function dateToIso(value: string) {
  return new Date(`${value}T00:00:00`).toISOString();
}

function numberOrNull(value: string) {
  return value === "" ? null : Number(value);
}

export function NutritionGoalForm({ item, onSubmit, onCancel }: NutritionGoalFormProps) {
  const [name, setName] = useState(item?.name ?? "");
  const [startDate, setStartDate] = useState(
    toInputDate(item?.startDate) || toInputDate(new Date().toISOString()),
  );
  const [endDate, setEndDate] = useState(toInputDate(item?.endDate));
  const [dailyCaloriesKcal, setDailyCaloriesKcal] = useState(
    String(item?.dailyCaloriesKcal ?? 2400),
  );
  const [dailyProteinGrams, setDailyProteinGrams] = useState(
    item?.dailyProteinGrams === null || item?.dailyProteinGrams === undefined
      ? ""
      : String(item.dailyProteinGrams),
  );
  const [dailyCarbsGrams, setDailyCarbsGrams] = useState(
    item?.dailyCarbsGrams === null || item?.dailyCarbsGrams === undefined
      ? ""
      : String(item.dailyCarbsGrams),
  );
  const [dailyFatGrams, setDailyFatGrams] = useState(
    item?.dailyFatGrams === null || item?.dailyFatGrams === undefined
      ? ""
      : String(item.dailyFatGrams),
  );
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
        <Field label="Nom">
          <input
            className={inputClass}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </Field>
        <Field label="Debut">
          <input
            className={inputClass}
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            required
          />
        </Field>
        <Field label="Fin">
          <input
            className={inputClass}
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MacroInput label="Calories/jour" value={dailyCaloriesKcal} onChange={setDailyCaloriesKcal} />
        <MacroInput
          label="Protéines/jour"
          value={dailyProteinGrams}
          onChange={setDailyProteinGrams}
          required={false}
        />
        <MacroInput
          label="Glucides/jour"
          value={dailyCarbsGrams}
          onChange={setDailyCarbsGrams}
          required={false}
        />
        <MacroInput
          label="Lipides/jour"
          value={dailyFatGrams}
          onChange={setDailyFatGrams}
          required={false}
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(event) => setIsActive(event.target.checked)}
        />
        Objectif actif
      </label>

      <FormActions isSaving={isSaving} onCancel={onCancel} />
    </form>
  );
}
