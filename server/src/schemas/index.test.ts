import { describe, expect, it } from "vitest";
import {
  createExerciseSchema,
  updateBodyMeasurementSchema,
  updateExerciseSchema,
  updateFoodSchema,
  updateMealSchema,
  updateNutritionGoalSchema,
  updateUserGoalSchema,
} from "./index.js";

describe("update schemas", () => {
  // Un PATCH qui omet un champ ne doit jamais le reinitialiser a sa valeur
  // par defaut (zod v4 applique les .default() a l'interieur de .partial()).
  it.each([
    ["exercise", updateExerciseSchema],
    ["food", updateFoodSchema],
    ["meal", updateMealSchema],
    ["nutrition goal", updateNutritionGoalSchema],
    ["user goal", updateUserGoalSchema],
    ["body measurement", updateBodyMeasurementSchema],
  ])("%s update does not inject defaults", (_name, schema) => {
    expect(schema.parse({})).toEqual({});
  });

  it("keeps defaults on create", () => {
    const parsed = createExerciseSchema.parse({ name: "Squat" });
    expect(parsed.difficulty).toBe("BEGINNER");
    expect(parsed.exerciseType).toBe("STRENGTH");
  });
});
