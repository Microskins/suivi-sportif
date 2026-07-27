import type { Exercise, UserGoal, Workout } from "../../api/client";

type SportProgressionPanelProps = {
  exercises: Exercise[];
  workouts: Workout[];
  goals: UserGoal[];
};

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

function formatComputedValue(value: number | null, decimals = 1) {
  if (value === null || Number.isNaN(value) || !Number.isFinite(value)) return "-";
  return value.toFixed(decimals);
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

function exerciseProgressionSummary(workouts: Workout[], exerciseId: string) {
  const entries = completedWorkoutEntriesForExercise(workouts, exerciseId);
  const allSets = entries.flatMap(({ workout, entry }) =>
    entry.sets.map((set) => ({ ...set, date: workout.date })),
  );
  const bestOneRepMax = Math.max(
    0,
    ...allSets.map((set) => estimateOneRepMax(set.weight, set.reps) ?? 0),
  );
  const bestTenRepMax = Math.max(
    0,
    ...allSets.filter((set) => set.reps >= 10).map((set) => set.weight),
  );
  const maxReps = Math.max(0, ...allSets.map((set) => set.reps));
  const latestEntry = entries[entries.length - 1];
  const latestSets = latestEntry?.entry.sets ?? [];
  const latestRpeValues = latestSets
    .map((set) => set.rpe)
    .filter((value): value is number => value !== null && value !== undefined);
  const latestRirValues = latestSets
    .map((set) => set.rir)
    .filter((value): value is number => value !== null && value !== undefined);
  const latestAvgRpe = latestRpeValues.length
    ? latestRpeValues.reduce((total, value) => total + value, 0) / latestRpeValues.length
    : null;
  const latestAvgRir = latestRirValues.length
    ? latestRirValues.reduce((total, value) => total + value, 0) / latestRirValues.length
    : null;
  const latestMinReps = latestSets.length
    ? Math.min(...latestSets.map((set) => set.reps))
    : null;
  const latestTopWeight = latestSets.length
    ? Math.max(...latestSets.map((set) => set.weight))
    : null;

  let recommendation = "Ajoute deux seances sur cet exercice pour obtenir un conseil fiable.";
  let tone = "border-slate-200 bg-slate-50 text-slate-700";

  if (latestSets.length >= 2 && latestMinReps !== null && latestTopWeight !== null) {
    const effortComfortable =
      latestAvgRir === null ? latestAvgRpe === null || latestAvgRpe <= 8 : latestAvgRir >= 2;
    const effortTooHigh =
      (latestAvgRir !== null && latestAvgRir <= 0) || (latestAvgRpe !== null && latestAvgRpe >= 9.5);

    if (latestMinReps >= 10 && effortComfortable) {
      recommendation = `Augmenter legerement la charge: ${roundOne(latestTopWeight + 2.5)} kg a tester.`;
      tone = "border-emerald-200 bg-emerald-50 text-emerald-800";
    } else if (latestMinReps < 6 || effortTooHigh) {
      recommendation = "Reduire la charge ou garder plus de marge avant de monter.";
      tone = "border-amber-200 bg-amber-50 text-amber-800";
    } else {
      recommendation = "Rester sur la meme charge et viser plus de reps propres.";
      tone = "border-sky-200 bg-sky-50 text-sky-800";
    }
  }

  return {
    sessions: entries.length,
    bestOneRepMax: bestOneRepMax > 0 ? bestOneRepMax : null,
    bestTenRepMax: bestTenRepMax > 0 ? bestTenRepMax : null,
    maxReps: maxReps > 0 ? maxReps : null,
    latestAvgRpe,
    latestAvgRir,
    recommendation,
    tone,
  };
}

export function SportProgressionPanel({
  exercises,
  workouts,
  goals,
}: SportProgressionPanelProps) {
  const exerciseIdsFromGoals = goals
    .filter((goal) => goal.isActive && goal.metric.startsWith("SPORT_EXERCISE_") && goal.exerciseId)
    .map((goal) => goal.exerciseId as string);
  const exerciseIdsFromWorkouts = workouts.flatMap((workout) =>
    (workout.exercises ?? []).map((entry) => entry.exerciseId),
  );
  const exerciseIds = Array.from(new Set([...exerciseIdsFromGoals, ...exerciseIdsFromWorkouts])).slice(0, 6);
  const rows = exerciseIds
    .map((exerciseId) => {
      const exercise = exercises.find((item) => item.id === exerciseId);
      const summary = exerciseProgressionSummary(workouts, exerciseId);
      const linkedGoals = goals.filter((goal) => goal.isActive && goal.exerciseId === exerciseId);
      return exercise ? { exercise, summary, linkedGoals } : null;
    })
    .filter((row): row is {
      exercise: Exercise;
      summary: ReturnType<typeof exerciseProgressionSummary>;
      linkedGoals: UserGoal[];
    } => row !== null);

  return (
    <section className="rounded border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="font-semibold text-neutral-950">Progression par exercice</h3>
          <p className="mt-1 text-sm text-neutral-500">
            Meilleures perfs, effort recent et conseil de double progression.
          </p>
        </div>
        <span className="w-fit rounded border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600">
          Plage cible 8-10 reps
        </span>
      </div>

      {!rows.length ? (
        <div className="mt-4 flex h-40 items-center justify-center rounded border border-dashed border-neutral-300 bg-neutral-50 px-4 text-center text-sm text-neutral-500">
          Termine une seance avec exercices pour afficher les signaux de progression.
        </div>
      ) : (
        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {rows.map(({ exercise, summary, linkedGoals }) => (
            <article key={exercise.id} className="rounded border border-slate-200 bg-slate-50/60 p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-950">{exercise.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {summary.sessions} seance(s) realisee(s)
                  </p>
                </div>
                {linkedGoals.length > 0 && (
                  <span className="w-fit rounded bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                    {linkedGoals.length} objectif(s)
                  </span>
                )}
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <p className="rounded bg-white px-3 py-2 text-sm text-slate-700">
                  <span className="block text-xs font-medium uppercase tracking-wide text-slate-500">1RM</span>
                  <span className="text-lg font-bold text-slate-950">{formatComputedValue(summary.bestOneRepMax)} kg</span>
                </p>
                <p className="rounded bg-white px-3 py-2 text-sm text-slate-700">
                  <span className="block text-xs font-medium uppercase tracking-wide text-slate-500">10RM</span>
                  <span className="text-lg font-bold text-slate-950">{formatComputedValue(summary.bestTenRepMax)} kg</span>
                </p>
                <p className="rounded bg-white px-3 py-2 text-sm text-slate-700">
                  <span className="block text-xs font-medium uppercase tracking-wide text-slate-500">Max reps</span>
                  <span className="text-lg font-bold text-slate-950">{summary.maxReps ?? "-"}</span>
                </p>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <p className="rounded bg-white px-3 py-2 text-sm text-slate-700">
                  RPE moyen recent: <span className="font-semibold">{formatComputedValue(summary.latestAvgRpe)}</span>
                </p>
                <p className="rounded bg-white px-3 py-2 text-sm text-slate-700">
                  RIR moyen recent: <span className="font-semibold">{formatComputedValue(summary.latestAvgRir)}</span>
                </p>
              </div>
              <p className={`mt-3 rounded border px-3 py-2 text-sm font-medium ${summary.tone}`}>
                {summary.recommendation}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
