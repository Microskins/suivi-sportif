import prisma from "../index.js";
import type {
  CreateMealInput,
  MealResponse,
  UpdateMealInput,
} from "../../schemas/index.js";

type Food = {
  brand: string | null;
  caloriesKcal: unknown;
  carbsGrams: unknown;
  fatGrams: unknown;
  id: string;
  name: string;
  proteinGrams: unknown;
};

type Meal = {
  createdAt: Date;
  date: Date;
  id: string;
  mealType: string;
  name: string;
  notes: string | null;
  updatedAt: Date;
  userId: string;
};

type MealItem = {
  caloriesKcalPer100g: unknown;
  carbsGramsPer100g: unknown;
  createdAt: Date;
  fatGramsPer100g: unknown;
  foodId: string | null;
  foodName: string;
  id: string;
  proteinGramsPer100g: unknown;
  quantityGrams: unknown;
};

type MealWithItems = Meal & {
  items: MealItem[];
};

const mealInclude = {
  items: {
    orderBy: { createdAt: "asc" as const },
  },
};

function roundMacro(value: number): number {
  return Math.round(value * 100) / 100;
}

function itemTotals(item: MealItem) {
  const factor = Number(item.quantityGrams) / 100;

  return {
    caloriesKcal: roundMacro(Number(item.caloriesKcalPer100g) * factor),
    proteinGrams: roundMacro(Number(item.proteinGramsPer100g) * factor),
    carbsGrams: roundMacro(Number(item.carbsGramsPer100g) * factor),
    fatGrams: roundMacro(Number(item.fatGramsPer100g) * factor),
  };
}

function formatMeal(meal: MealWithItems): MealResponse {
  const items = meal.items.map((item) => ({
    id: item.id,
    foodId: item.foodId,
    foodName: item.foodName,
    quantityGrams: Number(item.quantityGrams),
    caloriesKcalPer100g: Number(item.caloriesKcalPer100g),
    proteinGramsPer100g: Number(item.proteinGramsPer100g),
    carbsGramsPer100g: Number(item.carbsGramsPer100g),
    fatGramsPer100g: Number(item.fatGramsPer100g),
    totals: itemTotals(item),
    createdAt: item.createdAt.toISOString(),
  }));

  const totals = items.reduce(
    (acc, item) => ({
      caloriesKcal: acc.caloriesKcal + item.totals.caloriesKcal,
      proteinGrams: acc.proteinGrams + item.totals.proteinGrams,
      carbsGrams: acc.carbsGrams + item.totals.carbsGrams,
      fatGrams: acc.fatGrams + item.totals.fatGrams,
    }),
    {
      caloriesKcal: 0,
      proteinGrams: 0,
      carbsGrams: 0,
      fatGrams: 0,
    },
  );

  return {
    id: meal.id,
    userId: meal.userId,
    name: meal.name,
    date: meal.date.toISOString(),
    mealType: meal.mealType as MealResponse["mealType"],
    notes: meal.notes,
    createdAt: meal.createdAt.toISOString(),
    updatedAt: meal.updatedAt.toISOString(),
    items,
    totals: {
      caloriesKcal: roundMacro(totals.caloriesKcal),
      proteinGrams: roundMacro(totals.proteinGrams),
      carbsGrams: roundMacro(totals.carbsGrams),
      fatGrams: roundMacro(totals.fatGrams),
    },
  };
}

function createItemSnapshots(
  items: CreateMealInput["items"],
  foods: Food[],
) {
  return items.map((item) => {
    const food = foods.find((candidate) => candidate.id === item.foodId);
    if (!food) {
      throw new Error(`Food not found: ${item.foodId}`);
    }

    return {
      foodId: food.id,
      foodName: food.brand ? `${food.name} (${food.brand})` : food.name,
      quantityGrams: item.quantityGrams,
      caloriesKcalPer100g: food.caloriesKcal,
      proteinGramsPer100g: food.proteinGrams,
      carbsGramsPer100g: food.carbsGrams,
      fatGramsPer100g: food.fatGrams,
    };
  });
}

async function getAccessibleFoods(userId: string, foodIds: string[]) {
  const uniqueFoodIds = [...new Set(foodIds)];
  const foods = await prisma.food.findMany({
    where: {
      id: { in: uniqueFoodIds },
      OR: [{ userId }, { userId: null }],
    },
  });

  if (foods.length !== uniqueFoodIds.length) {
    return null;
  }

  return foods;
}

export async function getMeals(userId: string): Promise<MealResponse[]> {
  const meals = await prisma.meal.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    include: mealInclude,
  });

  return meals.map(formatMeal);
}

export async function getMealsByDateRange(
  userId: string,
  start: string,
  end: string,
): Promise<MealResponse[]> {
  const meals = await prisma.meal.findMany({
    where: {
      userId,
      date: {
        gte: new Date(start),
        lte: new Date(end),
      },
    },
    orderBy: { date: "desc" },
    include: mealInclude,
  });

  return meals.map(formatMeal);
}

export async function getMealById(
  id: string,
  userId: string,
): Promise<MealResponse | null> {
  const meal = await prisma.meal.findFirst({
    where: { id, userId },
    include: mealInclude,
  });

  return meal ? formatMeal(meal) : null;
}

export async function createMeal(
  userId: string,
  data: CreateMealInput,
): Promise<MealResponse | null> {
  const foods = await getAccessibleFoods(
    userId,
    data.items.map((item) => item.foodId),
  );
  if (!foods) return null;

  const meal = await prisma.meal.create({
    data: {
      userId,
      name: data.name,
      date: new Date(data.date),
      mealType: data.mealType,
      notes: data.notes ?? null,
      items: {
        create: createItemSnapshots(data.items, foods),
      },
    },
    include: mealInclude,
  });

  return formatMeal(meal);
}

export async function updateMeal(
  id: string,
  userId: string,
  data: UpdateMealInput,
): Promise<MealResponse | null> {
  const existing = await prisma.meal.findFirst({ where: { id, userId } });
  if (!existing) return null;

  let itemSnapshots:
    | ReturnType<typeof createItemSnapshots>
    | undefined;

  if (data.items) {
    const foods = await getAccessibleFoods(
      userId,
      data.items.map((item) => item.foodId),
    );
    if (!foods) return null;
    itemSnapshots = createItemSnapshots(data.items, foods);
  }

  const meal = await prisma.$transaction(async (tx: any) => {
    if (itemSnapshots) {
      await tx.mealItem.deleteMany({ where: { mealId: id } });
    }

    return tx.meal.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.date !== undefined && { date: new Date(data.date) }),
        ...(data.mealType !== undefined && { mealType: data.mealType }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(itemSnapshots && { items: { create: itemSnapshots } }),
      },
      include: mealInclude,
    });
  });

  return formatMeal(meal);
}

export async function deleteMeal(
  id: string,
  userId: string,
): Promise<boolean> {
  const existing = await prisma.meal.findFirst({ where: { id, userId } });
  if (!existing) return false;

  await prisma.meal.delete({ where: { id } });
  return true;
}
