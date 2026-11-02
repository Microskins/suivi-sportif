// Repas d'une etape (restaurants, pubs, cafes...), tous facultatifs: chacun
// devient un point sur la carte du carnet. Comme pour le logement, l'adresse
// ne sert qu'a placer le point; seuls le nom, la position et le lien sont
// enregistres.
import { AdminAddressSearch } from "./admin-address-search";
import { AdminMealPhoto } from "./admin-meal-photo";
import type { AuthErrorHandler } from "./admin-api";
import type { MealDraft } from "./admin-form";
import { emptyMeal, hasPosition } from "./admin-form";
import { TextField, buttonClass, labelClass } from "./admin-ui";

const MAX_MEALS = 20;

export function AdminStageMeals({
  disabled,
  errors,
  meals,
  onAuthError,
  onChange,
  prefix,
  stageLabel,
}: {
  disabled: boolean;
  errors: Record<string, string>;
  meals: MealDraft[];
  onAuthError: AuthErrorHandler;
  onChange: (meals: MealDraft[]) => void;
  // Chemin des erreurs de l'etape, ex. "stages.0.".
  prefix: string;
  stageLabel: string;
}) {
  const update = (key: string, patch: Partial<MealDraft>) =>
    onChange(
      meals.map((meal) => (meal.key === key ? { ...meal, ...patch } : meal)),
    );

  return (
    <fieldset className="sm:col-span-6">
      <legend className={labelClass}>Repas (facultatif)</legend>
      <p className="mt-1 text-xs leading-5 text-[var(--site-muted)]">
        Restaurants, pubs ou cafés où vous avez mangé, avec une photo si vous en
        avez : chacun apparaît comme un point sur la carte de l’étape.
      </p>
      {meals.length > 0 && (
        <ol className="mt-3 grid gap-3">
          {meals.map((meal, index) => {
            const mealPrefix = `${prefix}meals.${index}.`;
            const name = meal.name.trim() || `Repas ${index + 1}`;
            return (
              <li
                key={meal.key}
                className="grid gap-3 rounded-[8px] border border-[#dfe4ea] p-3 sm:grid-cols-2"
              >
                <TextField
                  label={`Lieu du repas ${index + 1}`}
                  hint="Ex. The Witchery, Edimbourg."
                  required
                  maxLength={120}
                  value={meal.name}
                  disabled={disabled}
                  error={errors[`${mealPrefix}name`]}
                  onChange={(event) =>
                    update(meal.key, { name: event.target.value })
                  }
                />
                <TextField
                  label="Lien (facultatif)"
                  hint="Site du lieu ou fiche Google Maps."
                  inputMode="url"
                  maxLength={500}
                  value={meal.url}
                  disabled={disabled}
                  error={errors[`${mealPrefix}url`]}
                  onChange={(event) =>
                    update(meal.key, { url: event.target.value })
                  }
                />
                <AdminMealPhoto
                  disabled={disabled}
                  meal={meal}
                  mealLabel={name}
                  onAuthError={onAuthError}
                  onChange={(patch) => update(meal.key, patch)}
                />
                <AdminAddressSearch
                  className="sm:col-span-2"
                  disabled={disabled}
                  label="Adresse du lieu"
                  hint="Sans GPS sur la photo, l’adresse ou le nom du lieu place le point sur la carte ; elle n’est pas enregistrée."
                  error={
                    errors[`${mealPrefix}position`] ??
                    errors[`${mealPrefix}coordinates`]
                  }
                  positioned={hasPosition(meal)}
                  onPick={([lng, lat]) =>
                    update(meal.key, { lng: String(lng), lat: String(lat) })
                  }
                />
                <div className="sm:col-span-2">
                  <button
                    type="button"
                    className={buttonClass.smallDanger}
                    disabled={disabled}
                    aria-label={`Retirer ${name} de ${stageLabel}`}
                    onClick={() =>
                      onChange(meals.filter((item) => item.key !== meal.key))
                    }
                  >
                    Retirer ce repas
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
      <button
        type="button"
        className={`${buttonClass.small} mt-3`}
        disabled={disabled || meals.length >= MAX_MEALS}
        aria-label={`Ajouter un repas à ${stageLabel}`}
        onClick={() => onChange([...meals, emptyMeal()])}
      >
        + Ajouter un repas
      </button>
    </fieldset>
  );
}
