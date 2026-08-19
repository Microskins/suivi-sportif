import prisma from "../index.js";
import type {
  CreateUserGoalInput,
  UpdateUserGoalInput,
  UserGoalResponse,
} from "../../schemas/index.js";

type UserGoal = {
  createdAt: Date;
  direction: "AT_MOST" | "AT_LEAST" | "EXACT";
  domain: "SPORT" | "BODY";
  endDate: Date | null;
  exerciseId: string | null;
  id: string;
  isActive: boolean;
  metric:
    | "SPORT_WORKOUTS_PER_WEEK"
    | "SPORT_MINUTES_PER_WEEK"
    | "SPORT_EXERCISE_ONE_REP_MAX_KG"
    | "SPORT_EXERCISE_TEN_REP_MAX_KG"
    | "SPORT_EXERCISE_MAX_REPS"
    | "BODY_WEIGHT_KG"
    | "BODY_BMI"
    | "BODY_FAT_PERCENT";
  name: string;
  notes: string | null;
  startDate: Date;
  targetValue: unknown;
  updatedAt: Date;
  userId: string;
};

function formatUserGoal(goal: UserGoal): UserGoalResponse {
  return {
    id: goal.id,
    userId: goal.userId,
    domain: goal.domain,
    exerciseId: goal.exerciseId,
    metric: goal.metric,
    direction: goal.direction,
    name: goal.name,
    targetValue: Number(goal.targetValue),
    startDate: goal.startDate.toISOString(),
    endDate: goal.endDate?.toISOString() ?? null,
    isActive: goal.isActive,
    notes: goal.notes,
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
  };
}

function userGoalData(data: CreateUserGoalInput | UpdateUserGoalInput) {
  return {
    ...(data.domain !== undefined && { domain: data.domain }),
    ...(data.exerciseId !== undefined && { exerciseId: data.exerciseId }),
    ...(data.metric !== undefined && { metric: data.metric }),
    ...(data.direction !== undefined && { direction: data.direction }),
    ...(data.name !== undefined && { name: data.name }),
    ...(data.targetValue !== undefined && { targetValue: data.targetValue }),
    ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
    ...(data.endDate !== undefined && {
      endDate: data.endDate ? new Date(data.endDate) : null,
    }),
    ...(data.isActive !== undefined && { isActive: data.isActive }),
    ...(data.notes !== undefined && { notes: data.notes }),
  };
}

export async function getUserGoals(
  userId: string,
  pagination: { skip: number; take: number },
): Promise<{ items: UserGoalResponse[]; total: number }> {
  const where = { userId };
  const [goals, total] = await Promise.all([
    prisma.userGoal.findMany({
      where,
      orderBy: [{ isActive: "desc" }, { startDate: "desc" }],
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.userGoal.count({ where }),
  ]);

  return { items: goals.map(formatUserGoal), total };
}

export async function getUserGoalById(
  id: string,
  userId: string,
): Promise<UserGoalResponse | null> {
  const goal = await prisma.userGoal.findFirst({
    where: { id, userId },
  });

  return goal ? formatUserGoal(goal) : null;
}

export async function createUserGoal(
  userId: string,
  data: CreateUserGoalInput,
): Promise<UserGoalResponse> {
  const goal = await prisma.userGoal.create({
    data: {
      userId,
      domain: data.domain,
      exerciseId: data.exerciseId ?? null,
      metric: data.metric,
      direction: data.direction,
      name: data.name,
      targetValue: data.targetValue,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      isActive: data.isActive,
      notes: data.notes ?? null,
    },
  });

  return formatUserGoal(goal);
}

export async function updateUserGoal(
  id: string,
  userId: string,
  data: UpdateUserGoalInput,
): Promise<UserGoalResponse | null> {
  const existing = await prisma.userGoal.findFirst({
    where: { id, userId },
  });
  if (!existing) return null;

  const goal = await prisma.userGoal.update({
    where: { id },
    data: userGoalData(data),
  });

  return formatUserGoal(goal);
}

export async function deleteUserGoal(id: string, userId: string): Promise<boolean> {
  const existing = await prisma.userGoal.findFirst({
    where: { id, userId },
  });
  if (!existing) return false;

  await prisma.userGoal.delete({ where: { id } });
  return true;
}
