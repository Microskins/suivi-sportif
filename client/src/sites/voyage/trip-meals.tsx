// Repas d'une etape (restaurants, pubs...): une vignette quand il y a une
// photo, le lien du lieu quand on l'a. Sur la carte, chaque repas est aussi
// un point.
import type { TripMeal } from "./trip-types";
import { apiFileUrl } from "./voyage-api";

const chip =
  "site-label inline-flex items-center gap-2 rounded-full border border-[#f2d3a7] bg-[#fff6ea] py-1 pr-2.5 text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[#0f1b2b]";

function MealLabel({ meal }: { meal: TripMeal }) {
  return (
    <>
      {meal.photoUrl ? (
        <img
          src={apiFileUrl(meal.photoUrl)}
          alt={`Repas à ${meal.name}`}
          loading="lazy"
          className="h-9 w-9 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span aria-hidden="true" className="pl-1">
          🍴
        </span>
      )}
      <span>
        {meal.name}
        {meal.url ? " ↗" : ""}
      </span>
    </>
  );
}

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
        Où on a mangé
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
                className={`${chip} ${meal.photoUrl ? "pl-1" : "pl-1.5"} hover:border-[#0f1b2b]`}
              >
                <MealLabel meal={meal} />
              </a>
            ) : (
              <span className={`${chip} ${meal.photoUrl ? "pl-1" : "pl-1.5"}`}>
                <MealLabel meal={meal} />
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
