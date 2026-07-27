import { FormEvent, useState } from "react";
import type { BodyMeasurement, BodyMeasurementInput } from "../../api/client";
import {
  bodyMeasurementFields,
  bodySilhouetteOptions,
  type BodyMeasurementField,
  type BodySilhouette,
} from "./body-measurements";
import { Field, FormActions, inputClass } from "./shared";

type BodyMeasurementFormProps = {
  item?: BodyMeasurement;
  onSubmit: (data: BodyMeasurementInput) => Promise<void>;
  onCancel: () => void;
};

function toInputDateTime(value?: string) {
  const date = value ? new Date(value) : new Date();
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
}

function dateTimeToIso(value: string) {
  return new Date(value).toISOString();
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function numberOrNull(value: string) {
  return value === "" ? null : Number(value);
}

function decimalInputValue(value?: number | null) {
  return value === null || value === undefined ? "" : String(value);
}

export function BodyMeasurementForm({ item, onSubmit, onCancel }: BodyMeasurementFormProps) {
  const [date, setDate] = useState(toInputDateTime(item?.date));
  const [values, setValues] = useState<Record<BodyMeasurementField, string>>(
    Object.fromEntries(
      bodyMeasurementFields.map(([key]) => [key, decimalInputValue(item?.[key])]),
    ) as Record<BodyMeasurementField, string>,
  );
  const [silhouette, setSilhouette] = useState<BodySilhouette>(
    item?.silhouette ?? "MALE",
  );
  const [isActiveLifestyle, setIsActiveLifestyle] = useState<boolean>(
    item?.isActiveLifestyle ?? false,
  );
  const [notes, setNotes] = useState(item?.notes ?? "");
  const [isSaving, setIsSaving] = useState(false);

  function updateValue(key: BodyMeasurementField, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await onSubmit({
        date: dateTimeToIso(date),
        silhouette,
        isActiveLifestyle,
        weightKg: numberOrNull(values.weightKg),
        heightCm: numberOrNull(values.heightCm),
        chestCm: numberOrNull(values.chestCm),
        waistCm: numberOrNull(values.waistCm),
        hipsCm: numberOrNull(values.hipsCm),
        neckCm: numberOrNull(values.neckCm),
        shouldersCm: numberOrNull(values.shouldersCm),
        leftArmCm: numberOrNull(values.leftArmCm),
        rightArmCm: numberOrNull(values.rightArmCm),
        leftForearmCm: numberOrNull(values.leftForearmCm),
        rightForearmCm: numberOrNull(values.rightForearmCm),
        leftThighCm: numberOrNull(values.leftThighCm),
        rightThighCm: numberOrNull(values.rightThighCm),
        leftCalfCm: numberOrNull(values.leftCalfCm),
        rightCalfCm: numberOrNull(values.rightCalfCm),
        notes: emptyToNull(notes),
      });
      onCancel();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Date de mesure">
        <input
          className={inputClass}
          type="datetime-local"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
        />
      </Field>
      <Field label="Silhouette">
        <select
          className={inputClass}
          value={silhouette}
          onChange={(event) => setSilhouette(event.target.value as BodySilhouette)}
        >
          {bodySilhouetteOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Niveau d'activite">
          <label className="flex h-[42px] items-center gap-2 rounded border border-slate-300 bg-white px-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isActiveLifestyle}
              onChange={(event) => setIsActiveLifestyle(event.target.checked)}
            />
            Actif
          </label>
        </Field>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {bodyMeasurementFields.map(([key, label, unit]) => (
          <Field key={key} label={`${label} (${unit})`}>
            <input
              className={inputClass}
              type="number"
              min="0"
              step="0.1"
              value={values[key]}
              onChange={(event) => updateValue(key, event.target.value)}
            />
          </Field>
        ))}
      </div>
      <Field label="Notes">
        <textarea
          className={inputClass}
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </Field>
      <FormActions isSaving={isSaving} onCancel={onCancel} />
    </form>
  );
}
