import type { FoodResponse } from "../schemas/index.js";

const OPEN_FOOD_FACTS_URL = "https://world.openfoodfacts.org/api/v3/product";
const OPEN_FOOD_FACTS_USER_AGENT =
  "suivi-sportif/1.0 (https://github.com/suivi-sportif)";
const OPEN_FOOD_FACTS_FIELDS = [
  "code",
  "product_name",
  "brands",
  "nutriments",
].join(",");

type OpenFoodFactsProduct = {
  code?: string;
  product_name?: string;
  brands?: string;
  nutriments?: Record<string, unknown>;
};

type OpenFoodFactsResponse = {
  product?: OpenFoodFactsProduct;
  status?: string;
};

export type BarcodeFoodLookup = Pick<
  FoodResponse,
  | "name"
  | "brand"
  | "barcode"
  | "caloriesKcal"
  | "proteinGrams"
  | "carbsGrams"
  | "fatGrams"
  | "fiberGrams"
  | "servingUnit"
>;

function numberFromNutriments(
  nutriments: Record<string, unknown>,
  keys: string[],
) {
  for (const key of keys) {
    const value = nutriments[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

export async function lookupFoodByBarcode(
  barcode: string,
): Promise<BarcodeFoodLookup | null> {
  const url = new URL(`${OPEN_FOOD_FACTS_URL}/${encodeURIComponent(barcode)}`);
  url.searchParams.set("product_type", "food");
  url.searchParams.set("lc", "fr");
  url.searchParams.set("fields", OPEN_FOOD_FACTS_FIELDS);

  const response = await fetch(url, {
    headers: {
      "User-Agent": OPEN_FOOD_FACTS_USER_AGENT,
      Accept: "application/json",
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Open Food Facts HTTP ${response.status}`);
  }

  const payload = (await response.json()) as OpenFoodFactsResponse;
  const product = payload.product;
  const nutriments = product?.nutriments;
  const name = product?.product_name?.trim();

  if (!product || !nutriments || !name) {
    return null;
  }

  return {
    name,
    brand: product.brands?.split(",")[0]?.trim() || null,
    barcode: product.code?.trim() || barcode,
    caloriesKcal:
      numberFromNutriments(nutriments, ["energy-kcal_100g", "energy-kcal"]) ??
      0,
    proteinGrams: numberFromNutriments(nutriments, ["proteins_100g"]) ?? 0,
    carbsGrams: numberFromNutriments(nutriments, ["carbohydrates_100g"]) ?? 0,
    fatGrams: numberFromNutriments(nutriments, ["fat_100g"]) ?? 0,
    fiberGrams: numberFromNutriments(nutriments, ["fiber_100g"]),
    servingUnit: "g",
  };
}
