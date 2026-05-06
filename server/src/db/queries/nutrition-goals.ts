import prisma from "../index.js";
import type {
  CreateNutritionGoalInput,
  NutritionGoalResponse,
  UpdateNutritionGoalInput,
} from "../../schemas/index.js";

type NutritionGoal = {
  createdAt: Date;
  dailyCaloriesKcal: number;
  dailyCarbsGrams: unknown | null;
  dailyFatGrams: unknown | null;
  dailyProteinGrams: unknown | null;
  endDate: Date | null;
  id: string;
  isActive: boolean;
  name: string;
  startDate: Date;
  updatedAt: Date;
  userId: string;
};

function formatNutritionGoal(goal: NutritionGoal): NutritionGoalResponse {
  return {
    id: goal.id,
    userId: goal.userId,
    name: goal.name,
    startDate: goal.startDate.toISOString(),
    endDate: goal.endDate?.toISOString() ?? null,
    dailyCaloriesKcal: goal.dailyCaloriesKcal,
    dailyProteinGrams:
      goal.dailyProteinGrams === null ? null : Number(goal.dailyProteinGrams),
    dailyCarbsGrams:
      goal.dailyCarbsGrams === null ? null : Number(goal.dailyCarbsGrams),
    dailyFatGrams:
      goal.dailyFatGrams === null ? null : Number(goal.dailyFatGrams),
    isActive: goal.isActive,
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
  };
}

export async function getNutritionGoals(
  userId: string,
): Promise<NutritionGoalResponse[]> {
  const goals = await prisma.nutritionGoal.findMany({
    where: { userId },
    orderBy: [{ isActive: "desc" }, { startDate: "desc" }],
  });

  return goals.map(formatNutritionGoal);
}

export async function getActiveNutritionGoal(
  userId: string,
): Promise<NutritionGoalResponse | null> {
  const goal = await prisma.nutritionGoal.findFirst({
    where: { userId, isActive: true },
    orderBy: { startDate: "desc" },
  });

  return goal ? formatNutritionGoal(goal) : null;
}

export async function getNutritionGoalById(
  id: string,
  userId: string,
): Promise<NutritionGoalResponse | null> {
  const goal = await prisma.nutritionGoal.findFirst({
    where: { id, userId },
  });

  return goal ? formatNutritionGoal(goal) : null;
}

export async function createNutritionGoal(
  userId: string,
  data: CreateNutritionGoalInput,
): Promise<NutritionGoalResponse> {
  const goal = await prisma.$transaction(async (tx: any) => {
    if (data.isActive) {
      await tx.nutritionGoal.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false },
      });
    }

    return tx.nutritionGoal.create({
      data: {
        userId,
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        dailyCaloriesKcal: data.dailyCaloriesKcal,
        dailyProteinGrams: data.dailyProteinGrams ?? null,
        dailyCarbsGrams: data.dailyCarbsGrams ?? null,
        dailyFatGrams: data.dailyFatGrams ?? null,
        isActive: data.isActive,
      },
    });
  });

  return formatNutritionGoal(goal);
}

export async function updateNutritionGoal(
  id: string,
  userId: string,
  data: UpdateNutritionGoalInput,
): Promise<NutritionGoalResponse | null> {
  const existing = await prisma.nutritionGoal.findFirst({
    where: { id, userId },
  });
  if (!existing) return null;

  const goal = await prisma.$transaction(async (tx: any) => {
    if (data.isActive === true) {
      await tx.nutritionGoal.updateMany({
        where: { userId, isActive: true, id: { not: id } },
        data: { isActive: false },
      });
    }

    return tx.nutritionGoal.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.startDate !== undefined && {
          startDate: new Date(data.startDate),
        }),
        ...(data.endDate !== undefined && {
          endDate: data.endDate ? new Date(data.endDate) : null,
        }),
        ...(data.dailyCaloriesKcal !== undefined && {
          dailyCaloriesKcal: data.dailyCaloriesKcal,
        }),
        ...(data.dailyProteinGrams !== undefined && {
          dailyProteinGrams: data.dailyProteinGrams,
        }),
        ...(data.dailyCarbsGrams !== undefined && {
          dailyCarbsGrams: data.dailyCarbsGrams,
        }),
        ...(data.dailyFatGrams !== undefined && {
          dailyFatGrams: data.dailyFatGrams,
        }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  });

  return formatNutritionGoal(goal);
}

export async function deleteNutritionGoal(
  id: string,
  userId: string,
): Promise<boolean> {
  const existing = await prisma.nutritionGoal.findFirst({
    where: { id, userId },
  });
  if (!existing) return false;

  await prisma.nutritionGoal.delete({ where: { id } });
  return true;
}
