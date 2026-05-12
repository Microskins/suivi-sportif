import { useMemo, useState } from "react";
import type { Workout, WorkoutStatus } from "../api/client";

type CalendarMode = "month" | "week";

type WorkoutsCalendarProps = {
  workouts: Workout[];
  isLoading: boolean;
  onPlan: (dateIso: string) => void;
  onAssociate: (workoutId: string, dateIso: string) => Promise<void>;
  onEdit: (workout: Workout) => void;
};

type CalendarDay = {
  key: string;
  date: Date;
  isCurrentMonth: boolean;
};

const statusTone: Record<WorkoutStatus, string> = {
  PLANNED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELED: "bg-rose-100 text-rose-800",
};

const statusLabel: Record<WorkoutStatus, string> = {
  PLANNED: "Prevue",
  COMPLETED: "Realisee",
  CANCELED: "Annulee",
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

export function WorkoutsCalendar({
  workouts,
  isLoading,
  onPlan,
  onAssociate,
  onEdit,
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
    <div className="space-y-4">
      <div className="rounded border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-neutral-950">Calendrier des seances</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Planifie et relis tes seances semaine par semaine.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMode("week")}
              className={`rounded border px-3 py-2 text-sm font-medium ${
                mode === "week"
                  ? "border-emerald-700 bg-emerald-700 text-white"
                  : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              Semaine
            </button>
            <button
              type="button"
              onClick={() => setMode("month")}
              className={`rounded border px-3 py-2 text-sm font-medium ${
                mode === "month"
                  ? "border-emerald-700 bg-emerald-700 text-white"
                  : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              Mois
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <section className="rounded border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-2">
            <button
              type="button"
              className="rounded border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-100"
              onClick={() => shiftPeriod(-1)}
            >
              Precedent
            </button>
            <p className="text-sm font-semibold text-neutral-800">
              {mode === "month"
                ? anchorDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
                : `${labelDate(startOfWeek(anchorDate))} - ${labelDate(endOfWeek(anchorDate))}`}
            </p>
            <button
              type="button"
              className="rounded border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-100"
              onClick={() => shiftPeriod(1)}
            >
              Suivant
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((label) => (
              <p key={label} className="px-2 py-1">
                {label}
              </p>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {days.map((day) => {
              const dayWorkouts = workoutsByDay.get(day.key) ?? [];
              const isSelected = day.key === selectedDayKey;
              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => setSelectedDayKey(day.key)}
                  className={`min-h-24 rounded border p-2 text-left ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50"
                      : day.isCurrentMonth
                      ? "border-neutral-200 bg-white hover:bg-neutral-50"
                      : "border-neutral-200 bg-neutral-50 text-neutral-400"
                  }`}
                >
                  <p className="text-sm font-semibold">{day.date.getDate()}</p>
                  <p className="mt-1 text-xs text-neutral-600">
                    {dayWorkouts.length} seance(s)
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {dayWorkouts.slice(0, 2).map((workout) => (
                      <span
                        key={workout.id}
                        className={`rounded px-2 py-0.5 text-[10px] font-medium ${statusTone[workout.status]}`}
                      >
                        {statusLabel[workout.status]}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="rounded border border-neutral-200 bg-white p-4 shadow-sm">
          <h3 className="text-base font-semibold text-neutral-950">
            {selectedDay ? labelDate(selectedDay.date) : "Jour"}
          </h3>
          {isLoading && <p className="mt-2 text-sm text-neutral-500">Chargement...</p>}
          <button
            type="button"
            onClick={() => selectedDay && onPlan(planningIsoForDay(selectedDay.date))}
            className="mt-3 w-full rounded bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
            disabled={!selectedDay}
          >
            Planifier une seance
          </button>

          <div className="mt-4 space-y-2">
            {selectedWorkouts.length ? (
              selectedWorkouts.map((workout) => (
                <article key={workout.id} className="rounded border border-neutral-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-neutral-900">{workout.name}</p>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${statusTone[workout.status]}`}
                    >
                      {statusLabel[workout.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-600">
                    {new Date(workout.date).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    - {workout.duration} min
                  </p>
                  <button
                    type="button"
                    onClick={() => onEdit(workout)}
                    className="mt-2 rounded border border-neutral-300 px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                  >
                    Modifier
                  </button>
                </article>
              ))
            ) : (
              <p className="rounded border border-dashed border-neutral-300 bg-neutral-50 px-3 py-5 text-sm text-neutral-600">
                Aucune seance sur ce jour.
              </p>
            )}
          </div>

          <div className="mt-4 border-t border-neutral-200 pt-4">
            <p className="text-sm font-semibold text-neutral-900">Associer une seance existante</p>
            <select
              className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
              value={associateId}
              onChange={(event) => setAssociateId(event.target.value)}
            >
              <option value="">Selectionner une seance</option>
              {movableWorkouts.map((workout) => (
                <option key={workout.id} value={workout.id}>
                  {workout.name} ({new Date(workout.date).toLocaleDateString("fr-FR")})
                </option>
              ))}
            </select>
            <button
              type="button"
              className="mt-2 w-full rounded border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => void handleAssociate()}
              disabled={!associateId || !selectedDay}
            >
              Associer a ce jour
            </button>
          </div>

          <p className="mt-4 text-xs text-neutral-500">
            Poids journalier: reserve pour le v2.
          </p>
        </aside>
      </div>
    </div>
  );
}
