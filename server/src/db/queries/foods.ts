import prisma from "../index.js";
import type {
  CreateFoodInput,
  FoodResponse,
  UpdateFoodInput,
} from "../../schemas/index.js";

type Food = {
  barcode: string | null;
  brand: string | null;
  caloriesKcal: unknown;
  carbsGrams: unknown;
  createdAt: Date;
  fatGrams: unknown;
  fiberGrams: unknown | null;
  id: string;
  name: string;
  proteinGrams: unknown;
  servingUnit: string;
  updatedAt: Date;
  userId: string | null;
};

function formatFood(food: Food): FoodResponse {
  return {
    id: food.id,
    userId: food.userId,
    name: food.name,
    brand: food.brand,
    barcode: food.barcode,
    caloriesKcal: Number(food.caloriesKcal),
    proteinGrams: Number(food.proteinGrams),
    carbsGrams: Number(food.carbsGrams),
    fatGrams: Number(food.fatGrams),
    fiberGrams: food.fiberGrams === null ? null : Number(food.fiberGrams),
    servingUnit: food.servingUnit,
    isGlobal: food.userId === null,
    createdAt: food.createdAt.toISOString(),
    updatedAt: food.updatedAt.toISOString(),
  };
}

export async function getFoods(userId: string): Promise<FoodResponse[]> {
  const foods = await prisma.food.findMany({
    where: {
      OR: [{ userId }, { userId: null }],
    },
    orderBy: [{ userId: "asc" }, { name: "asc" }],
  });

  return foods.map(formatFood);
}

export async function getFoodById(
  id: string,
  userId: string,
): Promise<FoodResponse | null> {
  const food = await prisma.food.findFirst({
    where: {
      id,
      OR: [{ userId }, { userId: null }],
    },
  });

  return food ? formatFood(food) : null;
}

export async function createFood(
  userId: string,
  data: CreateFoodInput,
): Promise<FoodResponse> {
  const food = await prisma.food.create({
    data: {
      userId,
      name: data.name,
      brand: data.brand ?? null,
      barcode: data.barcode ?? null,
      caloriesKcal: data.caloriesKcal,
      proteinGrams: data.proteinGrams,
      carbsGrams: data.carbsGrams,
      fatGrams: data.fatGrams,
      fiberGrams: data.fiberGrams ?? null,
      servingUnit: data.servingUnit,
    },
  });

  return formatFood(food);
}

export async function updateFood(
  id: string,
  userId: string,
  data: UpdateFoodInput,
): Promise<FoodResponse | null> {
  const existing = await prisma.food.findFirst({ where: { id, userId } });
  if (!existing) return null;

  const food = await prisma.food.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.brand !== undefined && { brand: data.brand }),
      ...(data.barcode !== undefined && { barcode: data.barcode }),
      ...(data.caloriesKcal !== undefined && {
        caloriesKcal: data.caloriesKcal,
      }),
      ...(data.proteinGrams !== undefined && {
        proteinGrams: data.proteinGrams,
      }),
      ...(data.carbsGrams !== undefined && { carbsGrams: data.carbsGrams }),
      ...(data.fatGrams !== undefined && { fatGrams: data.fatGrams }),
      ...(data.fiberGrams !== undefined && { fiberGrams: data.fiberGrams }),
      ...(data.servingUnit !== undefined && { servingUnit: data.servingUnit }),
    },
  });

  return formatFood(food);
}

export async function deleteFood(
  id: string,
  userId: string,
): Promise<boolean> {
  const existing = await prisma.food.findFirst({ where: { id, userId } });
  if (!existing) return false;

  await prisma.food.delete({ where: { id } });
  return true;
}
