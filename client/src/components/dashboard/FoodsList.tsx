import { useState } from "react";
import type { Food } from "../../api/client";
import { EmptyState, inputClass, ItemActions, itemCardClass } from "./shared";

type FoodsListProps = {
  foods: Food[];
  onEdit: (item: Food) => void;
  onDelete: (item: Food) => void;
};

function servingUnitLabel(servingUnit: string) {
  return servingUnit === "unit" ? "1 unit" : "100 g";
}

export function FoodsList({ foods, onEdit, onDelete }: FoodsListProps) {
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLocaleLowerCase("fr-FR");
  const filteredFoods = foods.filter((food) => {
    if (!normalizedSearch) return true;
    return (
      food.name.toLocaleLowerCase("fr-FR").includes(normalizedSearch) ||
      (food.brand?.toLocaleLowerCase("fr-FR").includes(normalizedSearch) ?? false) ||
      (food.barcode?.toLocaleLowerCase("fr-FR").includes(normalizedSearch) ?? false)
    );
  });

  if (!foods.length) {
    return <EmptyState label="Aucun aliment disponible. Cree un aliment pour composer tes repas." />;
  }

  return (
    <div className="space-y-4">
      <div className="rounded border border-slate-200 bg-white p-3">
        <input
          className={inputClass}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher nom, marque ou code-barres..."
        />
        <p className="mt-2 text-xs text-slate-500">
          {filteredFoods.length} / {foods.length} aliment(s)
        </p>
      </div>
      {!filteredFoods.length ? (
        <EmptyState label="Aucun aliment ne correspond a la recherche." />
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {filteredFoods.map((food) => (
            <li key={food.id} className={itemCardClass}>
              <div className="flex h-full flex-col justify-between gap-3">
                <div>
                  <p className="font-semibold">{food.name}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {food.caloriesKcal} kcal - P {food.proteinGrams} / G {food.carbsGrams} / L {food.fatGrams}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {food.isGlobal ? "Global" : "Personnel"} - pour {servingUnitLabel(food.servingUnit)}
                  </p>
                  {food.barcode && (
                    <p className="mt-1 text-xs font-medium text-slate-500">Code-barres: {food.barcode}</p>
                  )}
                </div>
                <ItemActions item={food} onEdit={onEdit} onDelete={onDelete} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
