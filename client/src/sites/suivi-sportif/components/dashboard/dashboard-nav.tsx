import type { DashboardResource } from "./resource-header";

type DashboardNavProps = {
  resource: DashboardResource;
  onSelect: (resource: DashboardResource) => void;
};

const sportLinks: Array<[DashboardResource, string]> = [
  ["workouts", "Séances"],
  ["sportGoals", "Objectifs"],
  ["exercises", "Exercices"],
];

const nutritionLinks: Array<[DashboardResource, string]> = [
  ["foods", "Aliments"],
  ["meals", "Repas"],
  ["goals", "Objectifs"],
];

function navButtonClass(isActive: boolean) {
  return `mb-1 block w-full rounded-[12px] px-3 py-2.5 text-left text-sm font-semibold transition ${
    isActive
      ? "bg-[linear-gradient(135deg,#fff0e6,#ffe8d6)] text-[#e85f3c]"
      : "text-[#806f61] hover:bg-[#fff8f2] hover:text-[#2b241e]"
  }`;
}

export function DashboardNav({ resource, onSelect }: DashboardNavProps) {
  return (
    <nav className="mt-6 h-fit">
      <p className="px-3 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#b3a69a]">
        Accueil
      </p>
      <button
        type="button"
        onClick={() => onSelect("dashboard")}
        className={navButtonClass(resource === "dashboard")}
      >
        Synthèse
      </button>
      <button
        type="button"
        onClick={() => onSelect("calendar")}
        className={navButtonClass(resource === "calendar")}
      >
        Calendrier
      </button>
      <p className="mt-3 px-3 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#b3a69a]">
        Sport
      </p>
      {sportLinks.map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onSelect(key)}
          className={navButtonClass(resource === key)}
        >
          {label}
        </button>
      ))}
      <p className="mt-3 px-3 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#b3a69a]">
        Nutrition
      </p>
      {nutritionLinks.map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onSelect(key)}
          className={navButtonClass(resource === key)}
        >
          {label}
        </button>
      ))}
      <p className="mt-3 px-3 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#b3a69a]">
        Corps
      </p>
      <button
        type="button"
        onClick={() => onSelect("measurements")}
        className={navButtonClass(resource === "measurements")}
      >
        Mensurations
      </button>
      <button
        type="button"
        onClick={() => onSelect("bodyGoals")}
        className={navButtonClass(resource === "bodyGoals")}
      >
        Objectifs
      </button>
      <p className="mt-3 px-3 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#b3a69a]">
        Compte
      </p>
      <button
        type="button"
        onClick={() => onSelect("profile")}
        className={navButtonClass(resource === "profile")}
      >
        Profil
      </button>
    </nav>
  );
}
