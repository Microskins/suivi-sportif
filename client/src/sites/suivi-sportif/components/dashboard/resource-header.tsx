import { buttonClass, secondaryButtonClass } from "./shared";

export type DashboardResource =
  | "dashboard"
  | "calendar"
  | "workouts"
  | "sportGoals"
  | "exercises"
  | "foods"
  | "meals"
  | "goals"
  | "measurements"
  | "bodyGoals"
  | "profile";

type ResourceHeaderProps = {
  resource: DashboardResource;
  onCreate: () => void;
  onCreateFromTemplate?: () => void;
  isLoading: boolean;
};

const titles: Record<DashboardResource, string> = {
  dashboard: "Synthese",
  calendar: "Calendrier",
  workouts: "Seances",
  sportGoals: "Objectifs sport",
  exercises: "Exercices",
  foods: "Aliments",
  meals: "Repas",
  goals: "Objectifs nutrition",
  measurements: "Mensurations",
  bodyGoals: "Objectifs corps",
  profile: "Profil",
};

const createLabels: Partial<Record<DashboardResource, string>> = {
  bodyGoals: "Ajouter un objectif",
  exercises: "Creer un exercice",
  foods: "Creer un aliment",
  goals: "Creer un objectif",
  meals: "Creer un repas",
  measurements: "Ajouter une mesure",
  sportGoals: "Ajouter un objectif",
  workouts: "Creer une seance",
};

export function ResourceHeader({
  resource,
  onCreate,
  onCreateFromTemplate,
  isLoading,
}: ResourceHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">{titles[resource]}</h2>
        {isLoading && <p className="mt-1 text-sm text-slate-500">Chargement...</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {onCreateFromTemplate && (
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={onCreateFromTemplate}
          >
            Depuis un modele
          </button>
        )}
        <button type="button" className={buttonClass} onClick={onCreate}>
          {createLabels[resource] ?? "Creer"}
        </button>
      </div>
    </div>
  );
}
