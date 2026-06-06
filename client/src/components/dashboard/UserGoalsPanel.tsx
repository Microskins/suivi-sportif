import type {
  BodyMeasurement,
  Exercise,
  UserGoal,
  UserGoalDomain,
  UserGoalInput,
  UserGoalMetric,
  Workout,
} from "../../api/client";
import { UserGoalForm } from "./UserGoalForm";
import { userGoalMetricOptions } from "./userGoals";
import {
  activeViewButtonClass,
  EmptyState,
  inactiveViewButtonClass,
  ItemActions,
  itemCardClass,
} from "./shared";

type UserGoalsPanelProps = {
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
};

function toInputDate(value?: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

function metricConfig(metric: UserGoalMetric) {
  return (
    userGoalMetricOptions.find((option) => option.value === metric) ??
    userGoalMetricOptions[0]
  );
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

export function UserGoalsPanel({
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
}: UserGoalsPanelProps) {
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
