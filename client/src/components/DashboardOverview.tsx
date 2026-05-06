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
import type { Meal, NutritionGoal, Workout } from "../api/client";

type PeriodKey = "3d" | "7d" | "30d" | "365d";
type QuickAction = "workout" | "meal" | "goal";

type DashboardOverviewProps = {
  workouts: Workout[];
  meals: Meal[];
  nutritionGoals: NutritionGoal[];
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

function StatCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "sport" | "nutrition" | "goal" | "neutral";
}) {
  const accents = {
    sport: "border-l-emerald-500 bg-emerald-50/70",
    nutrition: "border-l-amber-500 bg-amber-50/70",
    goal: "border-l-rose-500 bg-rose-50/70",
    neutral: "border-l-neutral-900 bg-white",
  };

  return (
    <div className={`rounded border border-neutral-200 border-l-4 p-4 shadow-sm ${accents[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-neutral-950">{value}</p>
      <p className="mt-1 text-sm text-neutral-600">{detail}</p>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-72 items-center justify-center rounded border border-dashed border-neutral-300 bg-neutral-50 text-center text-sm text-neutral-500">
      {label}
    </div>
  );
}

export function DashboardOverview({
  workouts,
  meals,
  nutritionGoals,
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

  return (
    <div className="space-y-5">
      <div className="rounded border border-neutral-200 bg-white/90 p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Synthese
            </p>
            <h2 className="mt-1 text-3xl font-bold text-neutral-950">Vue d'ensemble</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Suivi sport et nutrition sur la periode choisie.
            </p>
            {isLoading && (
              <p className="mt-1 text-sm text-neutral-500">Chargement...</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {periods.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setPeriod(item.key)}
                className={`rounded border px-3 py-2 text-sm font-medium ${
                  period === item.key
                    ? "border-emerald-700 bg-emerald-700 text-white shadow-sm"
                    : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Seances"
          value={formatNumber(totals.workouts)}
          detail={`${formatNumber(totals.duration)} min, ${formatNumber(totals.sets)} series`}
          tone="sport"
        />
        <StatCard
          label="Calories moy."
          value={`${formatNumber(averageCalories)} kcal`}
          detail={goal ? `${calorieProgress}% de ${goal.dailyCaloriesKcal} kcal` : "Aucun objectif actif"}
          tone="nutrition"
        />
        <StatCard
          label="Proteines moy."
          value={`${formatNumber(averageProtein)} g`}
          detail={goal?.dailyProteinGrams ? `Objectif ${goal.dailyProteinGrams} g/j` : "Objectif non renseigne"}
          tone="goal"
        />
        <StatCard
          label="Objectif actif"
          value={goal?.name ?? "Aucun"}
          detail={goal ? `${goal.dailyCaloriesKcal} kcal par jour` : "Cree un objectif nutrition"}
          tone="neutral"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-neutral-950">Charge sportive</h3>
              <p className="text-sm text-neutral-500">Duree et nombre de seances par jour.</p>
            </div>
            <button
              type="button"
              onClick={() => onQuickAction("workout")}
              className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100"
            >
              Ajouter
            </button>
          </div>
          {hasSportData ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summaries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="duration" name="Minutes" fill="#047857" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="workouts" name="Seances" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart label="Aucune seance sur cette periode." />
          )}
        </section>

        <section className="rounded border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-neutral-950">Nutrition</h3>
              <p className="text-sm text-neutral-500">Calories et macros journalieres.</p>
            </div>
            <button
              type="button"
              onClick={() => onQuickAction("meal")}
              className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100"
            >
              Ajouter
            </button>
          </div>
          {hasNutritionData ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summaries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="calories" name="Kcal" stroke="#111827" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="protein" name="Proteines" stroke="#047857" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="carbs" name="Glucides" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="fat" name="Lipides" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart label="Aucun repas sur cette periode." />
          )}
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <section className="rounded border border-neutral-200 bg-white p-4 shadow-sm">
          <h3 className="font-semibold text-neutral-950">Objectif nutrition</h3>
          {goal ? (
            <div className="mt-3 space-y-2 text-sm text-neutral-700">
              <p>
                {goal.name} vise {goal.dailyCaloriesKcal} kcal par jour.
              </p>
              <progress
                className="h-2 w-full overflow-hidden rounded accent-emerald-500"
                value={calorieProgress}
                max={100}
              />
              <p className="text-neutral-500">
                Moyenne actuelle: {formatNumber(averageCalories)} kcal sur les jours saisis.
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-neutral-600">
              Aucun objectif actif pour comparer les calories et macros.
            </p>
          )}
        </section>

        <section className="rounded border border-neutral-200 bg-neutral-950 p-4 text-white shadow-sm">
          <h3 className="font-semibold">Actions rapides</h3>
          <div className="mt-3 grid gap-2">
            <button
              type="button"
              onClick={() => onQuickAction("workout")}
              className="rounded bg-emerald-500 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-400"
            >
              Creer une seance
            </button>
            <button
              type="button"
              onClick={() => onQuickAction("meal")}
              className="rounded border border-white/20 px-3 py-2 text-sm font-medium text-white hover:bg-white/10"
            >
              Creer un repas
            </button>
            <button
              type="button"
              onClick={() => onQuickAction("goal")}
              className="rounded border border-white/20 px-3 py-2 text-sm font-medium text-white hover:bg-white/10"
            >
              Creer un objectif
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
