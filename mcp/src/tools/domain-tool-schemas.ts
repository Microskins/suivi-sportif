import * as z from "zod/v4";

export const jwtTokenSchema = z
  .string()
  .min(1)
  .describe("JWT utilisateur obtenu via /api/users/login.");

export function optionalShape(shape: Record<string, z.ZodTypeAny>) {
  return Object.fromEntries(
    Object.entries(shape).map(([key, schema]) => [key, schema.optional()]),
  );
}

export const profileInputSchema = {
  currentPassword: z.string().min(1).optional(),
  dateOfBirth: z.string().datetime().nullable().optional(),
  email: z.string().email().optional(),
  name: z.string().min(1).max(100).optional(),
  password: z.string().min(8).optional(),
};

export const foodInputSchema = {
  barcode: z.string().nullable().optional(),
  brand: z.string().nullable().optional(),
  caloriesKcal: z.number().min(0),
  carbsGrams: z.number().min(0),
  fatGrams: z.number().min(0),
  fiberGrams: z.number().min(0).nullable().optional(),
  name: z.string().min(1),
  proteinGrams: z.number().min(0),
  servingUnit: z.string().min(1).default("g"),
};

const mealItemSchema = z.object({
  foodId: z.string().uuid(),
  quantityGrams: z.number().min(0.01),
});

export const mealInputSchema = {
  date: z.string().datetime(),
  items: z.array(mealItemSchema).min(1),
  mealType: z
    .enum(["breakfast", "lunch", "dinner", "snack", "other"])
    .default("other"),
  name: z.string().min(1),
  notes: z.string().nullable().optional(),
};

export const nutritionGoalInputSchema = {
  dailyCaloriesKcal: z.number().int().min(0),
  dailyCarbsGrams: z.number().min(0).nullable().optional(),
  dailyFatGrams: z.number().min(0).nullable().optional(),
  dailyProteinGrams: z.number().min(0).nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
  isActive: z.boolean().default(true),
  name: z.string().min(1),
  startDate: z.string().datetime(),
};

const workoutSetSchema = z.object({
  avgKmh: z.number().min(0).nullable().optional(),
  durationMinutes: z.number().min(0).nullable().optional(),
  inclinePercent: z.number().min(0).nullable().optional(),
  reps: z.number().int().min(0).optional(),
  rest: z.number().int().min(0),
  rir: z.number().int().min(0).max(10).nullable().optional(),
  rpe: z.number().min(1).max(10).nullable().optional(),
  weight: z.number().min(0).optional(),
});

const workoutExerciseSchema = z.object({
  exerciseId: z.string().uuid(),
  sets: z.array(workoutSetSchema).min(1),
});

export const workoutInputSchema = {
  date: z.string().datetime(),
  duration: z.number().int().min(0),
  exercises: z.array(workoutExerciseSchema).optional(),
  name: z.string().min(1).max(200),
  notes: z.string().max(2000).nullable().optional(),
  status: z.enum(["PLANNED", "COMPLETED", "CANCELED"]).optional(),
};

export const userGoalInputSchema = {
  direction: z.enum(["AT_MOST", "AT_LEAST", "EXACT"]).default("AT_MOST"),
  domain: z.enum(["SPORT", "BODY"]),
  endDate: z.string().datetime().nullable().optional(),
  exerciseId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().default(true),
  metric: z.enum([
    "SPORT_WORKOUTS_PER_WEEK",
    "SPORT_MINUTES_PER_WEEK",
    "SPORT_EXERCISE_ONE_REP_MAX_KG",
    "SPORT_EXERCISE_TEN_REP_MAX_KG",
    "SPORT_EXERCISE_MAX_REPS",
    "BODY_WEIGHT_KG",
    "BODY_BMI",
    "BODY_FAT_PERCENT",
  ]),
  name: z.string().min(1).max(200),
  notes: z.string().max(2000).nullable().optional(),
  startDate: z.string().datetime(),
  targetValue: z.number().min(0).max(100000),
};

const measurementValueSchema = z.number().min(0).max(1000).nullable();

export const bodyMeasurementInputSchema = {
  chestCm: measurementValueSchema.optional(),
  date: z.string().datetime(),
  heightCm: measurementValueSchema.optional(),
  hipsCm: measurementValueSchema.optional(),
  isActiveLifestyle: z.boolean().nullable().optional(),
  leftArmCm: measurementValueSchema.optional(),
  leftCalfCm: measurementValueSchema.optional(),
  leftForearmCm: measurementValueSchema.optional(),
  leftThighCm: measurementValueSchema.optional(),
  neckCm: measurementValueSchema.optional(),
  notes: z.string().max(2000).nullable().optional(),
  rightArmCm: measurementValueSchema.optional(),
  rightCalfCm: measurementValueSchema.optional(),
  rightForearmCm: measurementValueSchema.optional(),
  rightThighCm: measurementValueSchema.optional(),
  shouldersCm: measurementValueSchema.optional(),
  silhouette: z.enum(["MALE", "FEMALE"]).default("MALE"),
  waistCm: measurementValueSchema.optional(),
  weightKg: measurementValueSchema.optional(),
};
