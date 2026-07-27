import { FormEvent, useState } from "react";
import { api, type Food, type FoodInput } from "../../api/client";
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
  const [barcodeLookupError, setBarcodeLookupError] = useState<string | null>(null);
  const [isLookingUpBarcode, setIsLookingUpBarcode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleBarcodeLookup() {
    const trimmedBarcode = barcode.trim();
    if (!trimmedBarcode) {
      setBarcodeLookupError("Renseigne un code-barres avant l'import.");
      return;
    }

    setIsLookingUpBarcode(true);
    setBarcodeLookupError(null);
    try {
      const lookup = await api.lookupFoodByBarcode(trimmedBarcode);
      setName(lookup.name);
      setBrand(lookup.brand ?? "");
      setBarcode(lookup.barcode ?? trimmedBarcode);
      setCaloriesKcal(String(lookup.caloriesKcal));
      setProteinGrams(String(lookup.proteinGrams));
      setCarbsGrams(String(lookup.carbsGrams));
      setFatGrams(String(lookup.fatGrams));
      setFiberGrams(lookup.fiberGrams === null ? "" : String(lookup.fiberGrams));
      setServingUnit(lookup.servingUnit);
    } catch (error) {
      setBarcodeLookupError(
        error instanceof Error
          ? error.message
          : "Import code-barres impossible pour le moment.",
      );
    } finally {
      setIsLookingUpBarcode(false);
    }
  }

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
          <div className="flex gap-2">
            <input
              className={inputClass}
              value={barcode}
              onChange={(event) => setBarcode(event.target.value)}
            />
            <button
              type="button"
              className="rounded bg-slate-800 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLookingUpBarcode}
              onClick={handleBarcodeLookup}
            >
              {isLookingUpBarcode ? "Import..." : "Importer"}
            </button>
          </div>
          {barcodeLookupError && (
            <p className="mt-1 text-xs text-red-700">{barcodeLookupError}</p>
          )}
          <p className="mt-1 text-xs text-slate-500">
            Import Open Food Facts, a verifier avant sauvegarde.
          </p>
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
