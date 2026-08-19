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
  dashboard: "Synthèse",
  calendar: "Calendrier",
  workouts: "Séances",
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
  exercises: "Créer un exercice",
  foods: "Créer un aliment",
  goals: "Créer un objectif",
  meals: "Créer un repas",
  measurements: "Ajouter une mesure",
  sportGoals: "Ajouter un objectif",
  workouts: "Créer une séance",
};

export function ResourceHeader({
  resource,
  onCreate,
  onCreateFromTemplate,
  isLoading,
}: ResourceHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#f0e3d6] pb-5 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#ff7a54]">
          Espace personnel
        </p>
        <h2 className="site-display mt-1 text-2xl font-bold text-[#2b241e]">
          {titles[resource]}
        </h2>
        {isLoading && <p className="mt-1 text-sm text-[var(--site-muted)]">Chargement…</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {onCreateFromTemplate && (
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={onCreateFromTemplate}
          >
            Depuis un modèle
          </button>
        )}
        <button type="button" className={buttonClass} onClick={onCreate}>
          {createLabels[resource] ?? "Créer"}
        </button>
      </div>
    </div>
  );
}
