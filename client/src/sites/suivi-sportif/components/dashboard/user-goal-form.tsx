import { FormEvent, useState } from "react";
import type {
  Exercise,
  UserGoal,
  UserGoalDirection,
  UserGoalDomain,
  UserGoalInput,
  UserGoalMetric,
} from "../../api/client";
import { Field, FormActions, inputClass } from "./shared";
import {
  userGoalDirectionOptions,
  userGoalDomainOptions,
  userGoalMetricOptions,
} from "./user-goals";

type UserGoalFormProps = {
  item?: UserGoal;
  initialDomain: UserGoalDomain;
  exercises: Exercise[];
  onSubmit: (data: UserGoalInput) => Promise<void>;
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

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function UserGoalForm({
  item,
  initialDomain,
  exercises,
  onSubmit,
  onCancel,
}: UserGoalFormProps) {
  const [domain, setDomain] = useState<UserGoalDomain>(item?.domain ?? initialDomain);
  const metricOptions = userGoalMetricOptions.filter((option) => option.domain === domain);
  const fallbackMetric = metricOptions[0] ?? userGoalMetricOptions[0];
  const initialMetric =
    metricOptions.find((option) => option.value === item?.metric) ?? fallbackMetric;
  const [metric, setMetric] = useState<UserGoalMetric>(initialMetric.value);
  const metricConfig =
    userGoalMetricOptions.find((option) => option.value === metric) ?? fallbackMetric;
  const [direction, setDirection] = useState<UserGoalDirection>(
    item?.direction ?? initialMetric.defaultDirection,
  );
  const [exerciseId, setExerciseId] = useState(item?.exerciseId ?? exercises[0]?.id ?? "");
  const [name, setName] = useState(item?.name ?? initialMetric.label);
  const [targetValue, setTargetValue] = useState(
    item?.targetValue === undefined ? "" : String(item.targetValue),
  );
  const [startDate, setStartDate] = useState(
    toInputDate(item?.startDate) || toInputDate(new Date().toISOString()),
  );
  const [endDate, setEndDate] = useState(toInputDate(item?.endDate));
  const [isActive, setIsActive] = useState(item?.isActive ?? true);
  const [notes, setNotes] = useState(item?.notes ?? "");
  const [isSaving, setIsSaving] = useState(false);

  function handleDomainChange(nextDomain: UserGoalDomain) {
    const nextMetric = userGoalMetricOptions.find((option) => option.domain === nextDomain);
    setDomain(nextDomain);
    if (nextMetric) {
      setMetric(nextMetric.value);
      setDirection(nextMetric.defaultDirection);
      setExerciseId("");
      setName((current) => (current.trim() ? current : nextMetric.label));
    }
  }

  function handleMetricChange(nextMetric: UserGoalMetric) {
    const nextConfig = userGoalMetricOptions.find((option) => option.value === nextMetric);
    setMetric(nextMetric);
    if (nextConfig) {
      setDirection(nextConfig.defaultDirection);
      setName((current) =>
        current.trim() === "" || current === metricConfig.label
          ? nextConfig.label
          : current,
      );
    }
  }

  const isExerciseMetric = metric.startsWith("SPORT_EXERCISE_");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await onSubmit({
        domain,
        exerciseId: isExerciseMetric ? exerciseId : null,
        metric,
        direction,
        name,
        targetValue: Number(targetValue),
        startDate: dateToIso(startDate),
        endDate: endDate ? dateToIso(endDate) : null,
        isActive,
        notes: emptyToNull(notes),
      });
      onCancel();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Domaine">
          <select
            className={inputClass}
            value={domain}
            onChange={(event) => handleDomainChange(event.target.value as UserGoalDomain)}
          >
            {userGoalDomainOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Type d'objectif">
          <select
            className={inputClass}
            value={metric}
            onChange={(event) => handleMetricChange(event.target.value as UserGoalMetric)}
          >
            {metricOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      {isExerciseMetric && (
        <Field label="Exercice">
          <select
            className={inputClass}
            value={exerciseId}
            onChange={(event) => setExerciseId(event.target.value)}
            required
          >
            <option value="" disabled>
              Choisir un exercice
            </option>
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
        </Field>
      )}
      <Field label="Nom">
        <input
          className={inputClass}
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </Field>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Direction">
          <select
            className={inputClass}
            value={direction}
            onChange={(event) => setDirection(event.target.value as UserGoalDirection)}
          >
            {userGoalDirectionOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={`Cible${metricConfig.unit ? ` (${metricConfig.unit})` : ""}`}>
          <input
            className={inputClass}
            type="number"
            min="0"
            step="0.1"
            value={targetValue}
            onChange={(event) => setTargetValue(event.target.value)}
            required
          />
        </Field>
        <Field label="Actif">
          <label className="flex h-[42px] items-center gap-2 rounded border border-slate-300 bg-white px-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
            />
            Suivre cet objectif
          </label>
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
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
