import { useMemo, useState } from "react";
import type { UserGoal, Workout, WorkoutStatus } from "../api/client";

type CalendarMode = "month" | "week";

type WorkoutsCalendarProps = {
  workouts: Workout[];
  userGoals: UserGoal[];
  isLoading: boolean;
  onPlan: (dateIso: string) => void;
  onAssociate: (workoutId: string, dateIso: string) => Promise<void>;
  onEdit: (workout: Workout) => void;
  onDuplicate: (workout: Workout) => void;
};

type CalendarDay = {
  key: string;
  date: Date;
  isCurrentMonth: boolean;
};

const statusTone: Record<WorkoutStatus, string> = {
  PLANNED: "bg-[#eaf2fc] text-[#4f7ead]",
  COMPLETED: "bg-[#e7f5ef] text-[#43866c]",
  CANCELED: "bg-[#fff0eb] text-[#c95b40]",
};

const statusLabel: Record<WorkoutStatus, string> = {
  PLANNED: "Prévue",
  COMPLETED: "Réalisée",
  CANCELED: "Annulée",
};

function dayKey(date: Date): string {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return local.toISOString().slice(0, 10);
}

function atStartOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date): Date {
  const result = atStartOfDay(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  return result;
}

function endOfWeek(date: Date): Date {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
}

function startOfNextWeek(date: Date): Date {
  const start = startOfWeek(date);
  const next = new Date(start);
  next.setDate(start.getDate() + 7);
  return next;
}

function buildMonthDays(anchorDate: Date): CalendarDay[] {
  const firstDay = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const lastDay = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0);
  const start = startOfWeek(firstDay);
  const end = endOfWeek(lastDay);
  const days: CalendarDay[] = [];

  for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const day = new Date(cursor);
    days.push({
      key: dayKey(day),
      date: day,
      isCurrentMonth: day.getMonth() === anchorDate.getMonth(),
    });
  }
  return days;
}

function buildWeekDays(anchorDate: Date): CalendarDay[] {
  const start = startOfWeek(anchorDate);
  const days: CalendarDay[] = [];

  for (let index = 0; index < 7; index += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    days.push({
      key: dayKey(day),
      date: day,
      isCurrentMonth: true,
    });
  }
  return days;
}

function planningIsoForDay(day: Date): string {
  const planned = new Date(day);
  planned.setHours(18, 0, 0, 0);
  return planned.toISOString();
}

function movedWorkoutIso(day: Date, sourceIso: string): string {
  const source = new Date(sourceIso);
  const target = new Date(day);
  target.setHours(source.getHours(), source.getMinutes(), 0, 0);
  return target.toISOString();
}

function compareByDateAsc(a: Workout, b: Workout): number {
  return new Date(a.date).getTime() - new Date(b.date).getTime();
}

function labelDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function isTodayKey(key: string): boolean {
  return key === dayKey(new Date());
}

function activeWeeklyWorkoutGoal(goals: UserGoal[]) {
  return goals.find(
    (goal) =>
      goal.isActive &&
      goal.domain === "SPORT" &&
      goal.metric === "SPORT_WORKOUTS_PER_WEEK",
  ) ?? null;
}

export function WorkoutsCalendar({
  workouts,
  userGoals,
  isLoading,
  onPlan,
  onAssociate,
  onEdit,
  onDuplicate,
}: WorkoutsCalendarProps) {
  const [mode, setMode] = useState<CalendarMode>("month");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [selectedDayKey, setSelectedDayKey] = useState(() => dayKey(new Date()));
  const [associateId, setAssociateId] = useState("");

  const workoutsByDay = useMemo(() => {
    const map = new Map<string, Workout[]>();
    for (const workout of workouts) {
      const key = dayKey(new Date(workout.date));
      const current = map.get(key) ?? [];
      current.push(workout);
      map.set(key, current);
    }
    for (const entries of map.values()) {
      entries.sort(compareByDateAsc);
    }
    return map;
  }, [workouts]);

  const days = useMemo(
    () => (mode === "month" ? buildMonthDays(anchorDate) : buildWeekDays(anchorDate)),
    [anchorDate, mode],
  );

  const selectedDay = days.find((day) => day.key === selectedDayKey) ?? days[0];
  const selectedWorkouts = selectedDay ? workoutsByDay.get(selectedDay.key) ?? [] : [];
  const movableWorkouts = workouts.filter((workout) => dayKey(new Date(workout.date)) !== selectedDay?.key);
  const weeklyGoal = activeWeeklyWorkoutGoal(userGoals);
  const weekStart = startOfWeek(anchorDate);
  const weekEndExclusive = startOfNextWeek(anchorDate);
  const weeklyCompleted = workouts.filter((workout) => {
    const workoutDate = new Date(workout.date);
    return workout.status === "COMPLETED" && workoutDate >= weekStart && workoutDate < weekEndExclusive;
  }).length;
  const weeklyTarget = weeklyGoal?.targetValue ?? 0;
  const weeklyProgress = weeklyTarget > 0
    ? Math.min(100, Math.round((weeklyCompleted / weeklyTarget) * 100))
    : 0;

  function shiftPeriod(direction: -1 | 1) {
    setAnchorDate((current) => {
      const next = new Date(current);
      if (mode === "month") {
        next.setMonth(current.getMonth() + direction);
      } else {
        next.setDate(current.getDate() + direction * 7);
      }
      return next;
    });
  }

  async function handleAssociate() {
    if (!associateId || !selectedDay) return;
    const source = workouts.find((workout) => workout.id === associateId);
    if (!source) return;
    await onAssociate(associateId, movedWorkoutIso(selectedDay.date, source.date));
    setAssociateId("");
  }

  return (
    <div className="min-w-0 space-y-4">
      <div className="panel p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#ff7a54]">
              Organisation
            </p>
            <h2 className="site-display mt-1 text-2xl font-bold text-[#2b241e]">
              Calendrier des séances
            </h2>
            <p className="mt-1 text-sm text-[var(--site-muted)]">
              Planifie et relis tes séances semaine par semaine.
            </p>
          </div>
          <div className="flex flex-wrap gap-1 rounded-full bg-[#fdf6ef] p-1">
            <button
              type="button"
              onClick={() => setMode("week")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === "week"
                  ? "bg-[linear-gradient(135deg,#ff7a54,#ffb648)] text-white shadow-sm"
                  : "text-[var(--site-muted)] hover:bg-white hover:text-[#2b241e]"
              }`}
            >
              Semaine
            </button>
            <button
              type="button"
              onClick={() => setMode("month")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === "month"
                  ? "bg-[linear-gradient(135deg,#ff7a54,#ffb648)] text-white shadow-sm"
                  : "text-[var(--site-muted)] hover:bg-white hover:text-[#2b241e]"
              }`}
            >
              Mois
            </button>
          </div>
        </div>
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="panel min-w-0 overflow-hidden p-4">
          <div className="mb-4 rounded-[16px] bg-[#fdf6ef] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="site-display text-sm font-bold text-[#2b241e]">Régularité de la semaine</p>
                <p className="mt-1 text-xs text-[var(--site-muted)]">
                  {weeklyGoal
                    ? `${weeklyCompleted} / ${weeklyTarget} séance(s) réalisée(s)`
                    : "Aucun objectif hebdo actif"}
                </p>
              </div>
              <p className="site-display text-xl font-bold text-[var(--site-accent-text)]">
                {weeklyGoal ? `${weeklyProgress}%` : "-"}
              </p>
            </div>
            <progress className="sport-progress mt-3" value={weeklyProgress} max={100} />
          </div>
          <div className="mb-4 flex flex-wrap gap-2 text-xs">
            {(["PLANNED", "COMPLETED", "CANCELED"] as Workout["status"][]).map((status) => (
              <span key={status} className={`rounded-full px-3 py-1 font-medium ${statusTone[status]}`}>
                {statusLabel[status]}
              </span>
            ))}
          </div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              className="sport-secondary-button"
              onClick={() => shiftPeriod(-1)}
            >
              Précédent
            </button>
            <p className="site-display min-w-0 flex-1 text-center text-sm font-bold text-[#2b241e]">
              {mode === "month"
                ? anchorDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
                : `${labelDate(startOfWeek(anchorDate))} - ${labelDate(endOfWeek(anchorDate))}`}
            </p>
            <button
              type="button"
              className="sport-secondary-button"
              onClick={() => shiftPeriod(1)}
            >
              Suivant
            </button>
          </div>

          <div className="overflow-x-auto pb-1">
            <div className="grid min-w-[640px] grid-cols-7 gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--site-muted)]">
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((label) => (
                <p key={label} className="px-2 py-1">
                  {label}
                </p>
              ))}
            </div>

            <div className="mt-2 grid min-w-[640px] grid-cols-7 gap-2">
              {days.map((day) => {
                const dayWorkouts = workoutsByDay.get(day.key) ?? [];
                const isSelected = day.key === selectedDayKey;
                const isToday = isTodayKey(day.key);
                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => setSelectedDayKey(day.key)}
                    className={`min-h-28 rounded-[14px] border p-2 text-left transition ${
                      isSelected
                        ? "border-[#ff7a54] bg-[linear-gradient(135deg,#fff0e6,#ffe8d6)] shadow-sm"
                        : isToday
                          ? "border-[#ffd4bf] bg-[linear-gradient(135deg,#fff4ec,#ffeadc)]"
                        : day.isCurrentMonth
                          ? "border-[#f0e3d6] bg-white hover:bg-[#fff8f2]"
                          : "border-[#f0e3d6] bg-[#fdf6ef] text-[#b3a69a]"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{day.date.getDate()}</span>
                      {isToday && (
                        <span className="rounded-full bg-[linear-gradient(135deg,#ff7a54,#ffb648)] px-2 py-0.5 text-[10px] font-semibold text-white">
                          Auj.
                        </span>
                      )}
                    </span>
                    <p className="mt-1 text-xs text-[var(--site-muted)]">
                      {dayWorkouts.length} séance(s)
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {dayWorkouts.slice(0, 2).map((workout) => (
                        <span
                          key={workout.id}
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusTone[workout.status]}`}
                        >
                          {statusLabel[workout.status]}
                        </span>
                      ))}
                      {dayWorkouts.length > 2 && (
                        <span className="rounded-full bg-[#f4e9de] px-2 py-0.5 text-[10px] font-medium text-[var(--site-muted)]">
                          +{dayWorkouts.length - 2}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="panel min-w-0 p-4">
          <h3 className="site-display text-lg font-bold text-[#2b241e]">
            {selectedDay ? labelDate(selectedDay.date) : "Jour"}
          </h3>
          {isLoading && <p className="mt-2 text-sm text-[var(--site-muted)]">Chargement…</p>}
          <button
            type="button"
            onClick={() => selectedDay && onPlan(planningIsoForDay(selectedDay.date))}
            className="sport-primary-button mt-3 w-full"
            disabled={!selectedDay}
          >
            Planifier une séance
          </button>

          <div className="mt-4 space-y-2">
            {selectedWorkouts.length ? (
              selectedWorkouts.map((workout) => (
                <article key={workout.id} className="rounded-[14px] bg-[#fdf6ef] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[#2b241e]">{workout.name}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusTone[workout.status]}`}
                    >
                      {statusLabel[workout.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--site-muted)]">
                    {new Date(workout.date).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    - {workout.duration} min
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(workout)}
                      className="sport-secondary-button min-h-8 px-3 py-1 text-xs"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => onDuplicate(workout)}
                      className="sport-secondary-button min-h-8 px-3 py-1 text-xs"
                    >
                      Dupliquer
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-[14px] bg-[#fdf6ef] px-3 py-5 text-sm text-[var(--site-muted)]">
                Aucune séance ce jour. Utilise « Planifier une séance » pour réserver ce créneau.
              </p>
            )}
          </div>

          <div className="mt-4 border-t border-[#f0e3d6] pt-4">
            <p className="text-sm font-semibold text-[#2b241e]">Associer une séance existante</p>
            <select
              className="sport-input mt-2"
              value={associateId}
              onChange={(event) => setAssociateId(event.target.value)}
            >
              <option value="">Sélectionner une séance</option>
              {movableWorkouts.map((workout) => (
                <option key={workout.id} value={workout.id}>
                  {workout.name} ({new Date(workout.date).toLocaleDateString("fr-FR")})
                </option>
              ))}
            </select>
            <button
              type="button"
              className="sport-secondary-button mt-2 w-full"
              onClick={() => void handleAssociate()}
              disabled={!associateId || !selectedDay}
            >
              Associer à ce jour
            </button>
          </div>

          <p className="mt-4 text-xs text-[var(--site-muted)]">
            Poids journalier : réservé pour la v2.
          </p>
        </aside>
      </div>
    </div>
  );
}
