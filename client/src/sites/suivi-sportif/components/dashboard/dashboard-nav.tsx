import type { DashboardResource } from "./resource-header";

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
  return `mb-1 block w-full border px-3 py-2 text-left text-sm font-bold transition ${
    isActive
      ? activeClassName
      : "border-transparent text-[#b9c8bd] hover:border-[#294238] hover:bg-[#10251e]"
  }`;
}

export function DashboardNav({ resource, onSelect }: DashboardNavProps) {
  return (
    <nav className="h-fit border border-[#294238] bg-[#071411] p-2 shadow-sm md:sticky md:top-6">
      <p className="px-3 py-2 text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#71877b]">
        Accueil
      </p>
      <button
        type="button"
        onClick={() => onSelect("dashboard")}
        className={navButtonClass(resource === "dashboard", "border-[#d8ff63] bg-[#d8ff63] text-[#071411]")}
      >
        Synthese
      </button>
      <button
        type="button"
        onClick={() => onSelect("calendar")}
        className={navButtonClass(resource === "calendar", "border-[#d8ff63] bg-[#d8ff63] text-[#071411]")}
      >
        Calendrier
      </button>
      <p className="mt-3 px-3 py-2 text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#71877b]">
        Sport
      </p>
      {sportLinks.map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onSelect(key)}
          className={navButtonClass(resource === key, "border-[#64e8d8] bg-[#64e8d8] text-[#071411]")}
        >
          {label}
        </button>
      ))}
      <p className="mt-3 px-3 py-2 text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#71877b]">
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
      <p className="mt-3 px-3 py-2 text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#71877b]">
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
      <p className="mt-3 px-3 py-2 text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#71877b]">
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
