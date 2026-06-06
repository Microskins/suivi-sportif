import type { Workout } from "../../api/client";
import { dangerButtonClass, EmptyState, itemCardClass, secondaryButtonClass } from "./shared";

type WorkoutsListProps = {
  workouts: Workout[];
  onEdit: (item: Workout) => void;
  onDuplicate: (item: Workout) => void;
  onDelete: (item: Workout) => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function WorkoutsList({ workouts, onEdit, onDuplicate, onDelete }: WorkoutsListProps) {
  if (!workouts.length) {
    return <EmptyState label="Aucune seance pour le moment. Commence par creer ou planifier ta premiere seance." />;
  }

  return (
    <ul className="space-y-3">
      {workouts.map((workout) => (
        <li key={workout.id} className={itemCardClass}>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{workout.name}</p>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${
                    workout.status === "COMPLETED"
                      ? "bg-emerald-100 text-emerald-800"
                      : workout.status === "CANCELED"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {workout.status === "COMPLETED"
                    ? "Realisee"
                    : workout.status === "CANCELED"
                      ? "Annulee"
                      : "Prevue"}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {formatDate(workout.date)} - {workout.duration} min
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {workout.exercises?.length ?? 0} exercice(s)
              </p>
              {workout.exercises?.length ? (
                <div className="mt-3 space-y-2">
                  {workout.exercises.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                    >
                      <p className="font-medium text-slate-900">
                        {entry.exercise?.name ?? "Exercice"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {entry.sets.map((set) => {
                          const effort = [
                            set.rpe !== null && set.rpe !== undefined ? `RPE ${set.rpe}` : null,
                            set.rir !== null && set.rir !== undefined ? `RIR ${set.rir}` : null,
                          ].filter(Boolean).join(" / ");
                          const base = set.durationMinutes
                            ? `${set.durationMinutes} min a ${set.avgKmh ?? "-"} km/h`
                            : `${set.reps} reps x ${set.weight} kg`;
                          return effort ? `${base} (${effort})` : base;
                        }).join(" | ")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={secondaryButtonClass} onClick={() => onEdit(workout)}>
                Modifier
              </button>
              <button type="button" className={secondaryButtonClass} onClick={() => onDuplicate(workout)}>
                Dupliquer
              </button>
              <button type="button" className={dangerButtonClass} onClick={() => onDelete(workout)}>
                Supprimer
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
