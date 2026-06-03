import { FormEvent, useState } from "react";
import type { Food, FoodInput } from "../../api/client";
import { Field, FormActions, inputClass, MacroInput } from "./shared";

type FoodFormProps = {
  item?: Food;
  onSubmit: (data: FoodInput) => Promise<void>;
  onCancel: () => void;
};

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function numberOrNull(value: string) {
  return value === "" ? null : Number(value);
}

export function FoodForm({ item, onSubmit, onCancel }: FoodFormProps) {
  const [name, setName] = useState(item?.name ?? "");
  const [brand, setBrand] = useState(item?.brand ?? "");
  const [barcode, setBarcode] = useState(item?.barcode ?? "");
  const [caloriesKcal, setCaloriesKcal] = useState(String(item?.caloriesKcal ?? 0));
  const [proteinGrams, setProteinGrams] = useState(String(item?.proteinGrams ?? 0));
  const [carbsGrams, setCarbsGrams] = useState(String(item?.carbsGrams ?? 0));
  const [fatGrams, setFatGrams] = useState(String(item?.fatGrams ?? 0));
  const [fiberGrams, setFiberGrams] = useState(
    item?.fiberGrams === null || item?.fiberGrams === undefined ? "" : String(item.fiberGrams),
  );
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
        <Field label="Nom">
          <input
            className={inputClass}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </Field>
        <Field label="Marque">
          <input
            className={inputClass}
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
          />
        </Field>
        <Field label="Code-barres">
          <input
            className={inputClass}
            value={barcode}
            onChange={(event) => setBarcode(event.target.value)}
          />
        </Field>
        <Field label="Unite">
          <select
            className={inputClass}
            value={servingUnit}
            onChange={(event) => setServingUnit(event.target.value as "g" | "unit")}
            required
          >
            <option value="g">g</option>
            <option value="unit">unit</option>
          </select>
        </Field>
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
