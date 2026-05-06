import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  deleteFood,
  getFoodById,
  getFoods,
  updateFood,
} from "./foods.js";

const mocks = vi.hoisted(() => ({
  prisma: {
    food: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("../index.js", () => ({
  default: mocks.prisma,
}));

const USER_ID = "11111111-1111-4111-8111-111111111111";
const FOOD_ID = "44444444-4444-4444-8444-444444444444";
const CREATED_AT = new Date("2026-05-04T10:00:00.000Z");
const UPDATED_AT = new Date("2026-05-04T10:30:00.000Z");

const foodRecord = {
  id: FOOD_ID,
  userId: USER_ID,
  name: "Riz basmati",
  brand: null,
  barcode: null,
  caloriesKcal: 350,
  proteinGrams: 7,
  carbsGrams: 78,
  fatGrams: 1,
  fiberGrams: null,
  servingUnit: "g",
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

describe("food queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists personal and global foods available to a user", async () => {
    mocks.prisma.food.findMany.mockResolvedValue([
      foodRecord,
      { ...foodRecord, id: "55555555-5555-4555-8555-555555555555", userId: null },
    ]);

    const result = await getFoods(USER_ID);

    expect(mocks.prisma.food.findMany).toHaveBeenCalledWith({
      where: { OR: [{ userId: USER_ID }, { userId: null }] },
      orderBy: [{ userId: "asc" }, { name: "asc" }],
    });
    expect(result).toEqual([
      expect.objectContaining({ id: FOOD_ID, userId: USER_ID, isGlobal: false }),
      expect.objectContaining({ userId: null, isGlobal: true }),
    ]);
  });

  it("gets a global food by id through the user access filter", async () => {
    mocks.prisma.food.findFirst.mockResolvedValue({
      ...foodRecord,
      userId: null,
    });

    const result = await getFoodById(FOOD_ID, USER_ID);

    expect(mocks.prisma.food.findFirst).toHaveBeenCalledWith({
      where: {
        id: FOOD_ID,
        OR: [{ userId: USER_ID }, { userId: null }],
      },
    });
    expect(result).toEqual(expect.objectContaining({ isGlobal: true }));
  });

  it("updates only a food owned by the user", async () => {
    mocks.prisma.food.findFirst.mockResolvedValue(foodRecord);
    mocks.prisma.food.update.mockResolvedValue({
      ...foodRecord,
      name: "Riz complet",
    });

    const result = await updateFood(FOOD_ID, USER_ID, {
      name: "Riz complet",
    });

    expect(mocks.prisma.food.findFirst).toHaveBeenCalledWith({
      where: { id: FOOD_ID, userId: USER_ID },
    });
    expect(mocks.prisma.food.update).toHaveBeenCalledWith({
      where: { id: FOOD_ID },
      data: { name: "Riz complet" },
    });
    expect(result?.name).toBe("Riz complet");
  });

  it("does not update a food owned by another user", async () => {
    mocks.prisma.food.findFirst.mockResolvedValue(null);

    const result = await updateFood(FOOD_ID, USER_ID, {
      name: "Forbidden",
    });

    expect(result).toBeNull();
    expect(mocks.prisma.food.update).not.toHaveBeenCalled();
  });

  it("does not update a global food through a user mutation", async () => {
    mocks.prisma.food.findFirst.mockResolvedValue(null);

    const result = await updateFood(FOOD_ID, USER_ID, {
      name: "Global edit",
    });

    expect(result).toBeNull();
    expect(mocks.prisma.food.findFirst).toHaveBeenCalledWith({
      where: { id: FOOD_ID, userId: USER_ID },
    });
    expect(mocks.prisma.food.update).not.toHaveBeenCalled();
  });

  it("deletes only a food owned by the user", async () => {
    mocks.prisma.food.findFirst.mockResolvedValue(foodRecord);

    const result = await deleteFood(FOOD_ID, USER_ID);

    expect(result).toBe(true);
    expect(mocks.prisma.food.delete).toHaveBeenCalledWith({
      where: { id: FOOD_ID },
    });
  });

  it("does not delete a food owned by another user", async () => {
    mocks.prisma.food.findFirst.mockResolvedValue(null);

    const result = await deleteFood(FOOD_ID, USER_ID);

    expect(result).toBe(false);
    expect(mocks.prisma.food.findFirst).toHaveBeenCalledWith({
      where: { id: FOOD_ID, userId: USER_ID },
    });
    expect(mocks.prisma.food.delete).not.toHaveBeenCalled();
  });

  it("does not delete a global food through a user mutation", async () => {
    mocks.prisma.food.findFirst.mockResolvedValue(null);

    const result = await deleteFood(FOOD_ID, USER_ID);

    expect(result).toBe(false);
    expect(mocks.prisma.food.delete).not.toHaveBeenCalled();
  });
});
