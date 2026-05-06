import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMeal,
  deleteMeal,
  getMealById,
  updateMeal,
} from "./meals.js";

const tx = {
  mealItem: {
    deleteMany: vi.fn(),
  },
  meal: {
    update: vi.fn(),
  },
};

const mocks = vi.hoisted(() => ({
  prisma: {
    food: {
      findMany: vi.fn(),
    },
    meal: {
      findFirst: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("../index.js", () => ({
  default: mocks.prisma,
}));

const USER_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_USER_ID = "99999999-9999-4999-8999-999999999999";
const FOOD_ID = "44444444-4444-4444-8444-444444444444";
const MEAL_ID = "55555555-5555-4555-8555-555555555555";
const ITEM_ID = "77777777-7777-4777-8777-777777777777";
const CREATED_AT = new Date("2026-05-04T12:00:00.000Z");
const UPDATED_AT = new Date("2026-05-04T12:30:00.000Z");

const foodRecord = {
  id: FOOD_ID,
  name: "Riz basmati",
  brand: null,
  caloriesKcal: 350,
  proteinGrams: 7,
  carbsGrams: 78,
  fatGrams: 1,
};

const mealRecord = {
  id: MEAL_ID,
  userId: USER_ID,
  name: "Dejeuner",
  date: CREATED_AT,
  mealType: "lunch",
  notes: null,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
  items: [
    {
      id: ITEM_ID,
      foodId: FOOD_ID,
      foodName: foodRecord.name,
      quantityGrams: 150,
      caloriesKcalPer100g: 350,
      proteinGramsPer100g: 7,
      carbsGramsPer100g: 78,
      fatGramsPer100g: 1,
      createdAt: CREATED_AT,
    },
  ],
};

describe("meal queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tx.mealItem.deleteMany.mockReset();
    tx.meal.update.mockReset();
    mocks.prisma.$transaction.mockImplementation((callback) => callback(tx));
  });

  it("gets one meal with both id and user ownership filters", async () => {
    mocks.prisma.meal.findFirst.mockResolvedValue(mealRecord);

    const result = await getMealById(MEAL_ID, USER_ID);

    expect(mocks.prisma.meal.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: MEAL_ID, userId: USER_ID },
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        id: MEAL_ID,
        totals: {
          caloriesKcal: 525,
          proteinGrams: 10.5,
          carbsGrams: 117,
          fatGrams: 1.5,
        },
      }),
    );
  });

  it("creates a meal only with foods accessible to the user", async () => {
    mocks.prisma.food.findMany.mockResolvedValue([foodRecord]);
    mocks.prisma.meal.create.mockResolvedValue(mealRecord);

    const payload = {
      name: "Dejeuner",
      date: CREATED_AT.toISOString(),
      mealType: "lunch" as const,
      items: [{ foodId: FOOD_ID, quantityGrams: 150 }],
    };

    const result = await createMeal(USER_ID, payload);

    expect(mocks.prisma.food.findMany).toHaveBeenCalledWith({
      where: {
        id: { in: [FOOD_ID] },
        OR: [{ userId: USER_ID }, { userId: null }],
      },
    });
    expect(mocks.prisma.meal.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: USER_ID,
          items: {
            create: [
              {
                foodId: FOOD_ID,
                foodName: foodRecord.name,
                quantityGrams: 150,
                caloriesKcalPer100g: 350,
                proteinGramsPer100g: 7,
                carbsGramsPer100g: 78,
                fatGramsPer100g: 1,
              },
            ],
          },
        }),
      }),
    );
    expect(result?.id).toBe(MEAL_ID);
  });

  it("does not create a meal with inaccessible foods", async () => {
    mocks.prisma.food.findMany.mockResolvedValue([]);

    const result = await createMeal(USER_ID, {
      name: "Blocked",
      date: CREATED_AT.toISOString(),
      mealType: "lunch",
      items: [{ foodId: FOOD_ID, quantityGrams: 150 }],
    });

    expect(result).toBeNull();
    expect(mocks.prisma.meal.create).not.toHaveBeenCalled();
  });

  it("does not update a meal owned by another user", async () => {
    mocks.prisma.meal.findFirst.mockResolvedValue(null);

    const result = await updateMeal(MEAL_ID, USER_ID, {
      name: "Forbidden",
    });

    expect(result).toBeNull();
    expect(mocks.prisma.$transaction).not.toHaveBeenCalled();
  });

  it("does not update a meal with inaccessible foods", async () => {
    mocks.prisma.meal.findFirst.mockResolvedValue({
      ...mealRecord,
      userId: OTHER_USER_ID,
    });
    mocks.prisma.food.findMany.mockResolvedValue([]);

    const result = await updateMeal(MEAL_ID, USER_ID, {
      items: [{ foodId: FOOD_ID, quantityGrams: 200 }],
    });

    expect(result).toBeNull();
    expect(mocks.prisma.$transaction).not.toHaveBeenCalled();
  });

  it("replaces meal items when updating with accessible foods", async () => {
    mocks.prisma.meal.findFirst.mockResolvedValue(mealRecord);
    mocks.prisma.food.findMany.mockResolvedValue([foodRecord]);
    tx.meal.update.mockResolvedValue({
      ...mealRecord,
      name: "Diner",
    });

    const result = await updateMeal(MEAL_ID, USER_ID, {
      name: "Diner",
      items: [{ foodId: FOOD_ID, quantityGrams: 200 }],
    });

    expect(tx.mealItem.deleteMany).toHaveBeenCalledWith({
      where: { mealId: MEAL_ID },
    });
    expect(tx.meal.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: MEAL_ID },
        data: expect.objectContaining({
          name: "Diner",
          items: expect.any(Object),
        }),
      }),
    );
    expect(result?.name).toBe("Diner");
  });

  it("does not delete a meal owned by another user", async () => {
    mocks.prisma.meal.findFirst.mockResolvedValue(null);

    const result = await deleteMeal(MEAL_ID, USER_ID);

    expect(result).toBe(false);
    expect(mocks.prisma.meal.delete).not.toHaveBeenCalled();
  });

  it("deletes only a meal owned by the user", async () => {
    mocks.prisma.meal.findFirst.mockResolvedValue(mealRecord);

    const result = await deleteMeal(MEAL_ID, USER_ID);

    expect(result).toBe(true);
    expect(mocks.prisma.meal.delete).toHaveBeenCalledWith({
      where: { id: MEAL_ID },
    });
  });
});
