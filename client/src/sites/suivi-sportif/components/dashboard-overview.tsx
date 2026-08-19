import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BodyMeasurement, Meal, NutritionGoal, UserGoal, Workout } from "../api/client";
import { DashboardStatCard } from "./dashboard-overview-stat-card";

type PeriodKey = "3d" | "7d" | "30d" | "365d";
type QuickAction = "workout" | "meal" | "goal" | "measurement";

type DashboardOverviewProps = {
  bodyMeasurements: BodyMeasurement[];
  workouts: Workout[];
  meals: Meal[];
  nutritionGoals: NutritionGoal[];
  userGoals: UserGoal[];
  isLoading: boolean;
  onQuickAction: (action: QuickAction) => void;
};

type DaySummary = {
  key: string;
  label: string;
  workouts: number;
  duration: number;
  sets: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

const periods: Array<{ key: PeriodKey; label: string; days: number }> = [
  { key: "3d", label: "3j", days: 3 },
  { key: "7d", label: "7j", days: 7 },
  { key: "30d", label: "1 mois", days: 30 },
  { key: "365d", label: "1 an", days: 365 },
];

function dayKey(date: Date) {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return local.toISOString().slice(0, 10);
}

function shortDateLabel(key: string, days: number) {
  const date = new Date(`${key}T00:00:00`);
  if (days > 45) {
    return date.toLocaleDateString("fr-FR", { month: "short", day: "2-digit" });
  }

  return date.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit" });
}

function buildDays(days: number): DaySummary[] {
  const today = new Date();
  const result: DaySummary[] = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    const key = dayKey(date);
    result.push({
      key,
      label: shortDateLabel(key, days),
      workouts: 0,
      duration: 0,
      sets: 0,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    });
  }

  return result;
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(value);
}

function formatMeasurementDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function weightMeasurements(measurements: BodyMeasurement[]) {
  return [...measurements]
    .filter((measurement) => measurement.weightKg != null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function computeSummaries(workouts: Workout[], meals: Meal[], days: number) {
  const summaries = buildDays(days);
  const byKey = new Map(summaries.map((summary) => [summary.key, summary]));

  workouts.forEach((workout) => {
    const summary = byKey.get(dayKey(new Date(workout.date)));
    if (!summary) {
      return;
    }

    summary.workouts += 1;
    summary.duration += workout.duration;
    summary.sets +=
      workout.exercises?.reduce(
        (total, exercise) => total + exercise.sets.length,
        0,
      ) ?? 0;
  });

  meals.forEach((meal) => {
    const summary = byKey.get(dayKey(new Date(meal.date)));
    if (!summary) {
      return;
    }

    summary.calories += meal.totals.caloriesKcal;
    summary.protein += meal.totals.proteinGrams;
    summary.carbs += meal.totals.carbsGrams;
    summary.fat += meal.totals.fatGrams;
  });

  return summaries.map((summary) => ({
    ...summary,
    calories: round(summary.calories),
    protein: round(summary.protein),
    carbs: round(summary.carbs),
    fat: round(summary.fat),
  }));
}

function activeGoal(goals: NutritionGoal[]) {
  return goals.find((goal) => goal.isActive) ?? null;
}

function activeWeeklyWorkoutGoal(goals: UserGoal[]) {
  return goals.find(
    (goal) =>
      goal.isActive &&
      goal.domain === "SPORT" &&
      goal.metric === "SPORT_WORKOUTS_PER_WEEK",
  ) ?? null;
}

function currentWeekCompletedWorkouts(workouts: Workout[]) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = start.getDay();
  start.setDate(start.getDate() + (day === 0 ? -6 : 1 - day));
  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  return workouts.filter((workout) => {
    const date = new Date(workout.date);
    return workout.status === "COMPLETED" && date >= start && date < end;
  }).length;
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-72 items-center justify-center rounded-[16px] bg-[#fdf6ef] px-5 text-center text-sm text-[var(--site-muted)]">
      {label}
    </div>
  );
}

export function DashboardOverview({
  bodyMeasurements,
  workouts,
  meals,
  nutritionGoals,
  userGoals,
  isLoading,
  onQuickAction,
}: DashboardOverviewProps) {
  const [period, setPeriod] = useState<PeriodKey>("7d");
  const selectedPeriod = periods.find((item) => item.key === period) ?? periods[1];
  const summaries = useMemo(
    () => computeSummaries(workouts, meals, selectedPeriod.days),
    [meals, selectedPeriod.days, workouts],
  );
  const goal = activeGoal(nutritionGoals);
  const weeklyWorkoutGoal = activeWeeklyWorkoutGoal(userGoals);
  const weeklyCompleted = currentWeekCompletedWorkouts(workouts);
  const weeklyTarget = weeklyWorkoutGoal?.targetValue ?? 0;
  const weeklyProgress = weeklyTarget > 0
    ? Math.min(100, Math.round((weeklyCompleted / weeklyTarget) * 100))
    : 0;
  const bodyWeightMeasurements = useMemo(() => weightMeasurements(bodyMeasurements), [bodyMeasurements]);
  const latestBodyWeight = bodyWeightMeasurements[0] ?? null;
  const previousBodyWeight = bodyWeightMeasurements[1] ?? null;
  const bodyWeightDelta =
    latestBodyWeight && previousBodyWeight
      ? round(latestBodyWeight.weightKg - previousBodyWeight.weightKg)
      : null;
  const bodyWeightValue = latestBodyWeight === null ? "-" : `${formatNumber(latestBodyWeight.weightKg)} kg`;
  const bodyWeightDetail = latestBodyWeight === null
    ? "Aucune pesée enregistrée"
    : previousBodyWeight === null
      ? `Première pesée le ${formatMeasurementDate(latestBodyWeight.date)}`
      : `${formatMeasurementDate(latestBodyWeight.date)} | ${
          bodyWeightDelta === 0
            ? "stable vs précédente"
            : `${bodyWeightDelta > 0 ? "+" : "-"}${formatNumber(Math.abs(bodyWeightDelta))} kg vs précédente`
        }`;
  const totals = summaries.reduce(
    (acc, summary) => ({
      workouts: acc.workouts + summary.workouts,
      duration: acc.duration + summary.duration,
      sets: acc.sets + summary.sets,
      calories: acc.calories + summary.calories,
      protein: acc.protein + summary.protein,
    }),
    { workouts: 0, duration: 0, sets: 0, calories: 0, protein: 0 },
  );
  const daysWithMeals = summaries.filter((summary) => summary.calories > 0).length;
  const averageCalories = daysWithMeals ? totals.calories / daysWithMeals : 0;
  const averageProtein = daysWithMeals ? totals.protein / daysWithMeals : 0;
  const hasSportData = summaries.some((summary) => summary.workouts > 0);
  const hasNutritionData = summaries.some((summary) => summary.calories > 0);
  const calorieProgress =
    goal && goal.dailyCaloriesKcal > 0
      ? Math.min(100, Math.round((averageCalories / goal.dailyCaloriesKcal) * 100))
      : 0;
  const proteinProgress =
    goal?.dailyProteinGrams && goal.dailyProteinGrams > 0
      ? Math.min(100, Math.round((averageProtein / goal.dailyProteinGrams) * 100))
      : 0;

  return (
    <div className="space-y-5">
      <div className="panel p-5 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff7a54]">
              Synthèse
            </p>
            <h2 className="site-display mt-1 text-3xl font-bold text-[#2b241e]">
              Vue d&apos;ensemble
            </h2>
            <p className="mt-1 text-sm text-[var(--site-muted)]">
              Suivi sport et nutrition sur la période choisie.
            </p>
            {isLoading && (
              <p className="mt-1 text-sm text-[var(--site-muted)]">Chargement…</p>
            )}
          </div>
          <div className="flex flex-wrap gap-1 rounded-full bg-[#fdf6ef] p-1">
            {periods.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setPeriod(item.key)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  period === item.key
                    ? "bg-[linear-gradient(135deg,#ff7a54,#ffb648)] text-white shadow-sm"
                    : "text-[var(--site-muted)] hover:bg-white hover:text-[#2b241e]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <DashboardStatCard
          label="Séances"
          value={formatNumber(totals.workouts)}
          detail={`${formatNumber(totals.duration)} min · ${formatNumber(totals.sets)} séries`}
          progress={weeklyWorkoutGoal ? weeklyProgress : undefined}
          ringId="workouts-ring"
        />
        <DashboardStatCard
          label="Calories moy."
          value={`${formatNumber(averageCalories)} kcal`}
          detail={goal ? `${calorieProgress}% de ${goal.dailyCaloriesKcal} kcal` : "Aucun objectif actif"}
          progress={goal ? calorieProgress : undefined}
          ringId="calories-ring"
        />
        <DashboardStatCard
          label="Protéines moy."
          value={`${formatNumber(averageProtein)} g`}
          detail={goal?.dailyProteinGrams ? `Objectif ${goal.dailyProteinGrams} g/j` : "Objectif non renseigné"}
          progress={goal?.dailyProteinGrams ? proteinProgress : undefined}
          ringId="protein-ring"
        />
        <DashboardStatCard
          label="Objectif actif"
          value={goal?.name ?? "Aucun"}
          detail={goal ? `${goal.dailyCaloriesKcal} kcal par jour` : "Crée un objectif nutrition"}
        />
        <DashboardStatCard
          label="Poids corporel"
          value={bodyWeightValue}
          detail={bodyWeightDetail}
        />
      </div>

      <section className="panel p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="site-display font-bold text-[#2b241e]">Régularité hebdomadaire</h3>
            <p className="mt-1 text-sm text-[var(--site-muted)]">
              {weeklyWorkoutGoal
                ? `${weeklyCompleted} séance(s) réalisée(s) sur ${weeklyTarget} cette semaine.`
                : "Crée un objectif de séances par semaine pour suivre ta régularité."}
            </p>
          </div>
          <p className="site-display text-3xl font-bold text-[var(--site-accent-text)]">
            {weeklyWorkoutGoal ? `${weeklyProgress}%` : "-"}
          </p>
        </div>
        <progress
          className="sport-progress mt-3"
          value={weeklyProgress}
          max={100}
        />
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="site-display font-bold text-[#2b241e]">Charge sportive</h3>
              <p className="text-sm text-[var(--site-muted)]">Durée et nombre de séances par jour.</p>
            </div>
            <button
              type="button"
              onClick={() => onQuickAction("workout")}
              className="sport-primary-button"
            >
              Ajouter
            </button>
          </div>
          {hasSportData ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summaries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0e3d6" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="duration" name="Minutes" fill="#ff7a54" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="workouts" name="Séances" fill="#ffb648" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart label="Aucune séance sur cette période." />
          )}
        </section>

        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="site-display font-bold text-[#2b241e]">Nutrition</h3>
              <p className="text-sm text-[var(--site-muted)]">Calories et macros journalières.</p>
            </div>
            <button
              type="button"
              onClick={() => onQuickAction("meal")}
              className="sport-primary-button"
            >
              Ajouter
            </button>
          </div>
          {hasNutritionData ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summaries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0e3d6" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="calories" name="Kcal" stroke="#2b241e" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="protein" name="Protéines" stroke="#5fb894" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="carbs" name="Glucides" stroke="#ffb648" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="fat" name="Lipides" stroke="#ff7a54" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart label="Aucun repas sur cette période." />
          )}
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <section className="panel p-5">
          <h3 className="site-display font-bold text-[#2b241e]">Objectif nutrition</h3>
          {goal ? (
            <div className="mt-3 space-y-2 text-sm text-[#665b51]">
              <p>
                {goal.name} vise {goal.dailyCaloriesKcal} kcal par jour.
              </p>
              <progress
                className="sport-progress"
                value={calorieProgress}
                max={100}
              />
              <p className="text-[var(--site-muted)]">
                Moyenne actuelle: {formatNumber(averageCalories)} kcal sur les jours saisis.
              </p>
            </div>
          ) : (
            <p className="mt-3 rounded-[14px] bg-[#fdf6ef] p-4 text-sm text-[var(--site-muted)]">
              Aucun objectif actif pour comparer les calories et macros.
            </p>
          )}
        </section>

        <section className="quick rounded-[20px] bg-[linear-gradient(135deg,#2b241e,#3a2f26)] p-5 text-white shadow-[0_8px_24px_rgba(43,36,30,0.14)]">
          <h3 className="site-display font-bold">Actions rapides</h3>
          <p className="mt-1 text-xs text-white/60">
            Les saisies les plus fréquentes, à portée de main.
          </p>
          <div className="mt-3 grid gap-2">
            <button
              type="button"
              onClick={() => onQuickAction("workout")}
              className="rounded-full bg-[linear-gradient(135deg,#ff7a54,#ffb648)] px-3 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              Planifier une séance
            </button>
            <button
              type="button"
              onClick={() => onQuickAction("meal")}
              className="rounded-full border border-white/20 px-3 py-2.5 text-sm font-medium text-white hover:bg-white/10"
            >
              Saisir un repas
            </button>
            <button
              type="button"
              onClick={() => onQuickAction("goal")}
              className="rounded-full border border-white/20 px-3 py-2.5 text-sm font-medium text-white hover:bg-white/10"
            >
              Ajouter un objectif sport
            </button>
            <button
              type="button"
              onClick={() => onQuickAction("measurement")}
              className="rounded-full border border-white/20 px-3 py-2.5 text-sm font-medium text-white hover:bg-white/10"
            >
              Prendre une pesée
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
