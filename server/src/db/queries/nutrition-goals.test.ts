import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createNutritionGoal,
  deleteNutritionGoal,
  getNutritionGoalById,
  updateNutritionGoal,
} from "./nutrition-goals.js";

const tx = {
  nutritionGoal: {
    updateMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
};

const mocks = vi.hoisted(() => ({
  prisma: {
    nutritionGoal: {
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("../index.js", () => ({
  default: mocks.prisma,
}));

const USER_ID = "11111111-1111-4111-8111-111111111111";
const GOAL_ID = "66666666-6666-4666-8666-666666666666";
const CREATED_AT = new Date("2026-05-04T10:00:00.000Z");
const UPDATED_AT = new Date("2026-05-04T10:30:00.000Z");
const START_DATE = new Date("2026-05-04T00:00:00.000Z");

const goalRecord = {
  id: GOAL_ID,
  userId: USER_ID,
  name: "Maintien",
  startDate: START_DATE,
  endDate: null,
  dailyCaloriesKcal: 2400,
  dailyProteinGrams: 160,
  dailyCarbsGrams: 260,
  dailyFatGrams: 70,
  isActive: true,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

describe("nutrition goal queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tx.nutritionGoal.updateMany.mockReset();
    tx.nutritionGoal.create.mockReset();
    tx.nutritionGoal.update.mockReset();
    mocks.prisma.$transaction.mockImplementation((callback) => callback(tx));
  });

  it("gets one nutrition goal with both id and user ownership filters", async () => {
    mocks.prisma.nutritionGoal.findFirst.mockResolvedValue(goalRecord);

    const result = await getNutritionGoalById(GOAL_ID, USER_ID);

    expect(mocks.prisma.nutritionGoal.findFirst).toHaveBeenCalledWith({
      where: { id: GOAL_ID, userId: USER_ID },
    });
    expect(result?.id).toBe(GOAL_ID);
  });

  it("creates an active goal and deactivates only active goals for the same user", async () => {
    tx.nutritionGoal.create.mockResolvedValue(goalRecord);

    const result = await createNutritionGoal(USER_ID, {
      name: goalRecord.name,
      startDate: START_DATE.toISOString(),
      dailyCaloriesKcal: goalRecord.dailyCaloriesKcal,
      dailyProteinGrams: goalRecord.dailyProteinGrams,
      dailyCarbsGrams: goalRecord.dailyCarbsGrams,
      dailyFatGrams: goalRecord.dailyFatGrams,
      isActive: true,
    });

    expect(tx.nutritionGoal.updateMany).toHaveBeenCalledWith({
      where: { userId: USER_ID, isActive: true },
      data: { isActive: false },
    });
    expect(tx.nutritionGoal.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: USER_ID, isActive: true }),
      }),
    );
    expect(result.id).toBe(GOAL_ID);
  });

  it("does not deactivate goals when creating an inactive goal", async () => {
    tx.nutritionGoal.create.mockResolvedValue({
      ...goalRecord,
      isActive: false,
    });

    await createNutritionGoal(USER_ID, {
      name: goalRecord.name,
      startDate: START_DATE.toISOString(),
      dailyCaloriesKcal: goalRecord.dailyCaloriesKcal,
      isActive: false,
    });

    expect(tx.nutritionGoal.updateMany).not.toHaveBeenCalled();
  });

  it("does not update a nutrition goal owned by another user", async () => {
    mocks.prisma.nutritionGoal.findFirst.mockResolvedValue(null);

    const result = await updateNutritionGoal(GOAL_ID, USER_ID, {
      name: "Forbidden",
    });

    expect(result).toBeNull();
    expect(mocks.prisma.$transaction).not.toHaveBeenCalled();
  });

  it("activates one goal and deactivates only other active goals for the same user", async () => {
    mocks.prisma.nutritionGoal.findFirst.mockResolvedValue({
      ...goalRecord,
      isActive: false,
    });
    tx.nutritionGoal.update.mockResolvedValue(goalRecord);

    const result = await updateNutritionGoal(GOAL_ID, USER_ID, {
      isActive: true,
    });

    expect(tx.nutritionGoal.updateMany).toHaveBeenCalledWith({
      where: { userId: USER_ID, isActive: true, id: { not: GOAL_ID } },
      data: { isActive: false },
    });
    expect(tx.nutritionGoal.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: GOAL_ID },
        data: { isActive: true },
      }),
    );
    expect(result?.isActive).toBe(true);
  });

  it("does not delete a nutrition goal owned by another user", async () => {
    mocks.prisma.nutritionGoal.findFirst.mockResolvedValue(null);

    const result = await deleteNutritionGoal(GOAL_ID, USER_ID);

    expect(result).toBe(false);
    expect(mocks.prisma.nutritionGoal.delete).not.toHaveBeenCalled();
  });

  it("deletes only a nutrition goal owned by the user", async () => {
    mocks.prisma.nutritionGoal.findFirst.mockResolvedValue(goalRecord);

    const result = await deleteNutritionGoal(GOAL_ID, USER_ID);

    expect(result).toBe(true);
    expect(mocks.prisma.nutritionGoal.delete).toHaveBeenCalledWith({
      where: { id: GOAL_ID },
    });
  });
});
