import type { DashboardResource } from "./ResourceHeader";

type DashboardNavProps = {
  resource: DashboardResource;
  onSelect: (resource: DashboardResource) => void;
};

const sportLinks: Array<[DashboardResource, string]> = [
  ["workouts", "Seances"],
  ["sportGoals", "Objectifs"],
  ["exercises", "Exercices"],
];

const nutritionLinks: Array<[DashboardResource, string]> = [
  ["foods", "Aliments"],
  ["meals", "Repas"],
  ["goals", "Objectifs"],
];

function navButtonClass(
  isActive: boolean,
  activeClassName: string,
) {
  return `mb-1 block w-full rounded border px-3 py-2 text-left text-sm font-medium transition ${
    isActive ? activeClassName : "border-transparent text-neutral-700 hover:bg-neutral-100"
  }`;
}

export function DashboardNav({ resource, onSelect }: DashboardNavProps) {
  return (
    <nav className="h-fit rounded border border-neutral-200 bg-white/95 p-2 shadow-sm backdrop-blur md:sticky md:top-6">
      <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Accueil
      </p>
      <button
        type="button"
        onClick={() => onSelect("dashboard")}
        className={navButtonClass(resource === "dashboard", "border-emerald-700 bg-emerald-700 text-white shadow-sm")}
      >
        Synthese
      </button>
      <button
        type="button"
        onClick={() => onSelect("calendar")}
        className={navButtonClass(resource === "calendar", "border-emerald-700 bg-emerald-700 text-white shadow-sm")}
      >
        Calendrier
      </button>
      <p className="mt-3 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Sport
      </p>
      {sportLinks.map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onSelect(key)}
          className={navButtonClass(resource === key, "border-neutral-950 bg-neutral-950 text-white shadow-sm")}
        >
          {label}
        </button>
      ))}
      <p className="mt-3 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Nutrition
      </p>
      {nutritionLinks.map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onSelect(key)}
          className={navButtonClass(resource === key, "border-amber-600 bg-amber-600 text-white shadow-sm")}
        >
          {label}
        </button>
      ))}
      <p className="mt-3 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Corps
      </p>
      <button
        type="button"
        onClick={() => onSelect("measurements")}
        className={navButtonClass(resource === "measurements", "border-rose-600 bg-rose-600 text-white shadow-sm")}
      >
        Mensurations
      </button>
      <button
        type="button"
        onClick={() => onSelect("bodyGoals")}
        className={navButtonClass(resource === "bodyGoals", "border-rose-600 bg-rose-600 text-white shadow-sm")}
      >
        Objectifs
      </button>
      <p className="mt-3 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Compte
      </p>
      <button
        type="button"
        onClick={() => onSelect("profile")}
        className={navButtonClass(resource === "profile", "border-sky-700 bg-sky-700 text-white shadow-sm")}
      >
        Profil
      </button>
    </nav>
  );
}
