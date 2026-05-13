import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().uuid("ID invalide"),
});

export const dateRangeParamSchema = z
  .object({
    start: z.string().datetime("Date de début invalide"),
    end: z.string().datetime("Date de fin invalide"),
  })
  .refine((params) => new Date(params.start) <= new Date(params.end), {
    message: "La date de fin doit être après la date de début",
    path: ["end"],
  });

// ============== User Schemas ==============
export const createUserSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Mot de passe minimum 8 caractères"),
  name: z.string().min(1, "Nom requis").max(100),
});

export const loginUserSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const updateUserSchema = createUserSchema.partial().extend({
  password: z.string().min(8).optional(),
});

export const userResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const userListSchema = z.array(userResponseSchema);

// ============== Exercise Schemas ==============
export const createExerciseSchema = z.object({
  name: z.string().min(1, "Nom requis").max(200),
  description: z.string().max(1000).nullable().optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).default("BEGINNER"),
  exerciseType: z.enum(["STRENGTH", "CARDIO", "MOBILITY"]).default("STRENGTH"),
  bodyParts: z.array(z.string().min(1).max(100)).optional(),
});

export const updateExerciseSchema = createExerciseSchema.partial();

// NOTE: muscleGroup n'est plus une colonne de Exercise (relation via muscles)
// on garde ce schema pour le endpoint /by-muscle-group/:group.
export const muscleGroupParamSchema = z.object({
  group: z.string().min(1).max(100),
});

export const exerciseResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  difficulty: z.string(),
  exerciseType: z.string(),
  bodyParts: z.array(z.string()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const exerciseListSchema = z.array(exerciseResponseSchema);

// ============== Workout Schemas ==============
export const createWorkoutSchema = z.object({
  name: z.string().min(1, "Nom requis").max(200),
  date: z.string().datetime(),
  status: z.enum(["PLANNED", "COMPLETED", "CANCELED"]).optional(),
  duration: z.number().int().min(0), // en minutes
  notes: z.string().max(2000).nullable().optional(),
  exercises: z
    .array(
      z.object({
        exerciseId: z.string().uuid(),
        sets: z.array(
          z.object({
            reps: z.number().int().min(0),
            weight: z.number().min(0),
            rest: z.number().int().min(0),
          }),
        ),
      }),
    )
    .optional(),
});

export const updateWorkoutSchema = createWorkoutSchema.partial();

export const workoutSetResponseSchema = z.object({
  id: z.string().uuid(),
  setNumber: z.number().int(),
  reps: z.number().int(),
  weight: z.number(),
  rest: z.number().int(),
  createdAt: z.string().datetime(),
});

export const workoutExerciseResponseSchema = z.object({
  id: z.string().uuid(),
  exerciseId: z.string().uuid(),
  order: z.number().int(),
  exercise: exerciseResponseSchema.optional(),
  sets: z.array(workoutSetResponseSchema),
});

export const workoutResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  date: z.string().datetime(),
  status: z.enum(["PLANNED", "COMPLETED", "CANCELED"]),
  duration: z.number().int(),
  notes: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  exercises: z.array(workoutExerciseResponseSchema).optional(),
});

export const workoutListSchema = z.array(workoutResponseSchema);

// ============== Workout Template Schemas ==============
export const instantiateWorkoutTemplateSchema = z.object({
  date: z.string().datetime(),
});

export const createWorkoutTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  level: z.string().min(1).max(100),
  duration: z.number().int().min(0),
  description: z.string().max(2000).nullable().optional(),
  displayOrder: z.number().int().min(0).optional(),
  exercises: z.array(
    z.object({
      exerciseId: z.string().uuid(),
      order: z.number().int().min(0),
      sets: z.number().int().min(1),
      reps: z.number().int().min(0),
      durationSeconds: z.number().int().min(0).nullable().optional(),
      rest: z.number().int().min(0),
      weight: z.number().min(0),
    }),
  ).min(1),
});

export const updateWorkoutTemplateSchema = createWorkoutTemplateSchema.partial();

export const workoutTemplateExerciseResponseSchema = z.object({
  id: z.string().uuid(),
  exerciseId: z.string().uuid(),
  order: z.number().int(),
  sets: z.number().int(),
  reps: z.number().int(),
  durationSeconds: z.number().int().nullable(),
  rest: z.number().int(),
  weight: z.number(),
  exercise: exerciseResponseSchema,
});

export const workoutTemplateResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  category: z.string(),
  level: z.string(),
  duration: z.number().int(),
  description: z.string().nullable(),
  displayOrder: z.number().int(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  exercises: z.array(workoutTemplateExerciseResponseSchema),
});

export const workoutTemplateListSchema = z.array(workoutTemplateResponseSchema);

// ============== Nutrition Schemas ==============
const macroValueSchema = z.number().min(0).max(100000);

export const mealTypeSchema = z.enum([
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "other",
]);

export const createFoodSchema = z.object({
  name: z.string().min(1, "Nom requis").max(200),
  brand: z.string().min(1).max(200).nullable().optional(),
  barcode: z.string().min(1).max(100).nullable().optional(),
  caloriesKcal: macroValueSchema,
  proteinGrams: macroValueSchema,
  carbsGrams: macroValueSchema,
  fatGrams: macroValueSchema,
  fiberGrams: macroValueSchema.nullable().optional(),
  servingUnit: z.string().min(1).max(20).default("g"),
});

export const updateFoodSchema = createFoodSchema.partial();

export const foodResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  name: z.string(),
  brand: z.string().nullable(),
  barcode: z.string().nullable(),
  caloriesKcal: z.number(),
  proteinGrams: z.number(),
  carbsGrams: z.number(),
  fatGrams: z.number(),
  fiberGrams: z.number().nullable(),
  servingUnit: z.string(),
  isGlobal: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createMealItemSchema = z.object({
  foodId: z.string().uuid(),
  quantityGrams: z.number().min(0.01).max(100000),
});

export const createMealSchema = z.object({
  name: z.string().min(1, "Nom requis").max(200),
  date: z.string().datetime(),
  mealType: mealTypeSchema.default("other"),
  notes: z.string().max(2000).nullable().optional(),
  items: z.array(createMealItemSchema).min(1, "Au moins un aliment requis"),
});

export const updateMealSchema = createMealSchema.partial().extend({
  items: z.array(createMealItemSchema).min(1).optional(),
});

export const mealItemResponseSchema = z.object({
  id: z.string().uuid(),
  foodId: z.string().uuid().nullable(),
  foodName: z.string(),
  quantityGrams: z.number(),
  caloriesKcalPer100g: z.number(),
  proteinGramsPer100g: z.number(),
  carbsGramsPer100g: z.number(),
  fatGramsPer100g: z.number(),
  totals: z.object({
    caloriesKcal: z.number(),
    proteinGrams: z.number(),
    carbsGrams: z.number(),
    fatGrams: z.number(),
  }),
  createdAt: z.string().datetime(),
});

export const mealResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  date: z.string().datetime(),
  mealType: mealTypeSchema,
  notes: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  items: z.array(mealItemResponseSchema),
  totals: z.object({
    caloriesKcal: z.number(),
    proteinGrams: z.number(),
    carbsGrams: z.number(),
    fatGrams: z.number(),
  }),
});

const nutritionGoalBaseSchema = z.object({
  name: z.string().min(1, "Nom requis").max(200),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().nullable().optional(),
  dailyCaloriesKcal: z.number().int().min(0).max(100000),
  dailyProteinGrams: macroValueSchema.nullable().optional(),
  dailyCarbsGrams: macroValueSchema.nullable().optional(),
  dailyFatGrams: macroValueSchema.nullable().optional(),
  isActive: z.boolean().default(true),
});

export const createNutritionGoalSchema = nutritionGoalBaseSchema.refine(
  (goal) => !goal.endDate || new Date(goal.startDate) <= new Date(goal.endDate),
  {
    message: "La date de fin doit être après la date de début",
    path: ["endDate"],
  },
);

export const updateNutritionGoalSchema = nutritionGoalBaseSchema
  .partial()
  .refine(
    (goal) =>
      !goal.startDate ||
      !goal.endDate ||
      new Date(goal.startDate) <= new Date(goal.endDate),
    {
      message: "La date de fin doit être après la date de début",
      path: ["endDate"],
    },
  );

export const nutritionGoalResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().nullable(),
  dailyCaloriesKcal: z.number().int(),
  dailyProteinGrams: z.number().nullable(),
  dailyCarbsGrams: z.number().nullable(),
  dailyFatGrams: z.number().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// ============== Type Exports ==============
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>;
export type ExerciseResponse = z.infer<typeof exerciseResponseSchema>;

export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
export type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;
export type WorkoutResponse = z.infer<typeof workoutResponseSchema>;
export type InstantiateWorkoutTemplateInput = z.infer<
  typeof instantiateWorkoutTemplateSchema
>;
export type CreateWorkoutTemplateInput = z.infer<
  typeof createWorkoutTemplateSchema
>;
export type UpdateWorkoutTemplateInput = z.infer<
  typeof updateWorkoutTemplateSchema
>;
export type WorkoutTemplateResponse = z.infer<
  typeof workoutTemplateResponseSchema
>;

export type CreateFoodInput = z.infer<typeof createFoodSchema>;
export type UpdateFoodInput = z.infer<typeof updateFoodSchema>;
export type FoodResponse = z.infer<typeof foodResponseSchema>;
export type CreateMealInput = z.infer<typeof createMealSchema>;
export type UpdateMealInput = z.infer<typeof updateMealSchema>;
export type MealResponse = z.infer<typeof mealResponseSchema>;
export type CreateNutritionGoalInput = z.infer<
  typeof createNutritionGoalSchema
>;
export type UpdateNutritionGoalInput = z.infer<
  typeof updateNutritionGoalSchema
>;
export type NutritionGoalResponse = z.infer<
  typeof nutritionGoalResponseSchema
>;
