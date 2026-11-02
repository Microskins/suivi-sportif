// Repas d'une etape (restaurants, pubs...): liste courte, avec le lien du
// lieu quand on l'a. Sur la carte, chaque repas est aussi un point.
import type { TripMeal } from "./trip-types";

export function TripMeals({
  className = "",
  meals,
  stageTitle,
}: {
  className?: string;
  meals: TripMeal[];
  stageTitle: string;
}) {
  if (meals.length === 0) {
    return null;
  }
  return (
    <div className={className}>
      <p className="site-label text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[var(--site-muted)]">
        <span aria-hidden="true">🍴 </span>Où on a mangé
      </p>
      <ul
        className="mt-2 flex flex-wrap gap-1.5"
        aria-label={`Repas de l’étape ${stageTitle}`}
      >
        {meals.map((meal, index) => (
          // Cle par position: deux repas peuvent porter le meme nom.
          <li key={`${index}-${meal.name}`}>
            {meal.url ? (
              <a
                href={meal.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label={`${meal.name} (nouvel onglet)`}
                className="site-label inline-flex rounded-full border border-[#f2d3a7] bg-[#fff6ea] px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[#0f1b2b] hover:border-[#0f1b2b]"
              >
                {meal.name} ↗
              </a>
            ) : (
              <span className="site-label inline-flex rounded-full border border-[#f2d3a7] bg-[#fff6ea] px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[#0f1b2b]">
                {meal.name}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
