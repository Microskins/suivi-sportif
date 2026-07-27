export type User = {
  id: string;
  email: string;
  name: string;
  dateOfBirth: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Exercise = {
  id: string;
  name: string;
  description: string | null;
  difficulty: string;
  exerciseType: string;
  bodyParts?: string[];
  createdAt: string;
  updatedAt: string;
};

export type ExerciseInput = {
  name: string;
  description?: string | null;
  difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  exerciseType?: "STRENGTH" | "CARDIO" | "MOBILITY";
  bodyParts?: string[];
};

export type WorkoutSetInput = {
  reps?: number;
  weight?: number;
  durationMinutes?: number | null;
  avgKmh?: number | null;
  inclinePercent?: number | null;
  rpe?: number | null;
  rir?: number | null;
  rest: number;
};

export type WorkoutExerciseInput = {
  exerciseId: string;
  sets: WorkoutSetInput[];
};

export type WorkoutStatus = "PLANNED" | "COMPLETED" | "CANCELED";

export type WorkoutInput = {
  name: string;
  date: string;
  status?: WorkoutStatus;
  duration: number;
  notes?: string | null;
  exercises?: WorkoutExerciseInput[];
};

export type Workout = {
  id: string;
  userId: string;
  name: string;
  date: string;
  status: WorkoutStatus;
  duration: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  exercises?: Array<{
    id: string;
    exerciseId: string;
    order: number;
    exercise?: Exercise;
    sets: Array<{
      id: string;
      setNumber: number;
      reps: number;
      weight: number;
      durationMinutes?: number | null;
      avgKmh?: number | null;
      inclinePercent?: number | null;
      rpe?: number | null;
      rir?: number | null;
      rest: number;
      createdAt: string;
    }>;
  }>;
};

export type WorkoutTemplate = {
  id: string;
  name: string;
  category: string;
  level: string;
  duration: number;
  description: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  exercises: Array<{
    id: string;
    exerciseId: string;
    order: number;
    sets: number;
    reps: number;
    durationSeconds: number | null;
    rest: number;
    weight: number;
    exercise: {
      id: string;
      name: string;
      description: string | null;
      difficulty: string;
      exerciseType: string;
      bodyParts?: string[];
      createdAt: string;
      updatedAt: string;
    };
  }>;
};

export type WorkoutTemplateInput = {
  name: string;
  category: string;
  level: string;
  duration: number;
  description?: string | null;
  displayOrder?: number;
  exercises: Array<{
    exerciseId: string;
    order: number;
    sets: number;
    reps: number;
    durationSeconds?: number | null;
    rest: number;
    weight: number;
  }>;
};

export type Food = {
  id: string;
  userId: string | null;
  name: string;
  brand: string | null;
  barcode: string | null;
  caloriesKcal: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number | null;
  servingUnit: "g" | "unit";
  isGlobal: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FoodInput = {
  name: string;
  brand?: string | null;
  barcode?: string | null;
  caloriesKcal: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams?: number | null;
  servingUnit?: "g" | "unit";
};

export type FoodBarcodeLookup = Required<FoodInput>;

export type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "other";

export type MealItemInput = {
  foodId: string;
  quantityGrams: number;
};

export type MealInput = {
  name: string;
  date: string;
  mealType?: MealType;
  notes?: string | null;
  items: MealItemInput[];
};

export type Meal = {
  id: string;
  userId: string;
  name: string;
  date: string;
  mealType: MealType;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    foodId: string | null;
    foodName: string;
    quantityGrams: number;
    caloriesKcalPer100g: number;
    proteinGramsPer100g: number;
    carbsGramsPer100g: number;
    fatGramsPer100g: number;
    totals: {
      caloriesKcal: number;
      proteinGrams: number;
      carbsGrams: number;
      fatGrams: number;
    };
    createdAt: string;
  }>;
  totals: {
    caloriesKcal: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
  };
};

export type NutritionGoal = {
  id: string;
  userId: string;
  name: string;
  startDate: string;
  endDate: string | null;
  dailyCaloriesKcal: number;
  dailyProteinGrams: number | null;
  dailyCarbsGrams: number | null;
  dailyFatGrams: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NutritionGoalInput = {
  name: string;
  startDate: string;
  endDate?: string | null;
  dailyCaloriesKcal: number;
  dailyProteinGrams?: number | null;
  dailyCarbsGrams?: number | null;
  dailyFatGrams?: number | null;
  isActive?: boolean;
};

export type BodyMeasurement = {
  id: string;
  userId: string;
  date: string;
  silhouette: "MALE" | "FEMALE";
  isActiveLifestyle: boolean | null;
  weightKg: number | null;
  heightCm: number | null;
  chestCm: number | null;
  waistCm: number | null;
  hipsCm: number | null;
  neckCm: number | null;
  shouldersCm: number | null;
  leftArmCm: number | null;
  rightArmCm: number | null;
  leftForearmCm: number | null;
  rightForearmCm: number | null;
  leftThighCm: number | null;
  rightThighCm: number | null;
  leftCalfCm: number | null;
  rightCalfCm: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BodyMeasurementInput = {
  date: string;
  silhouette?: "MALE" | "FEMALE";
  isActiveLifestyle?: boolean | null;
  weightKg?: number | null;
  heightCm?: number | null;
  chestCm?: number | null;
  waistCm?: number | null;
  hipsCm?: number | null;
  neckCm?: number | null;
  shouldersCm?: number | null;
  leftArmCm?: number | null;
  rightArmCm?: number | null;
  leftForearmCm?: number | null;
  rightForearmCm?: number | null;
  leftThighCm?: number | null;
  rightThighCm?: number | null;
  leftCalfCm?: number | null;
  rightCalfCm?: number | null;
  notes?: string | null;
};

export type UserGoalDomain = "SPORT" | "BODY";
export type UserGoalMetric =
  | "SPORT_WORKOUTS_PER_WEEK"
  | "SPORT_MINUTES_PER_WEEK"
  | "SPORT_EXERCISE_ONE_REP_MAX_KG"
  | "SPORT_EXERCISE_TEN_REP_MAX_KG"
  | "SPORT_EXERCISE_MAX_REPS"
  | "BODY_WEIGHT_KG"
  | "BODY_BMI"
  | "BODY_FAT_PERCENT";
export type UserGoalDirection = "AT_MOST" | "AT_LEAST" | "EXACT";

export type UserGoal = {
  id: string;
  userId: string;
  domain: UserGoalDomain;
  exerciseId: string | null;
  metric: UserGoalMetric;
  direction: UserGoalDirection;
  name: string;
  targetValue: number;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserGoalInput = {
  domain: UserGoalDomain;
  exerciseId?: string | null;
  metric: UserGoalMetric;
  direction?: UserGoalDirection;
  name: string;
  targetValue: number;
  startDate: string;
  endDate?: string | null;
  isActive?: boolean;
  notes?: string | null;
};

export type AssistantDraftContext =
  | "dashboard"
  | "profile"
  | "meals"
  | "workouts"
  | "measurements"
  | "goals";

export type AssistantDraftAction =
  | "create_exercise"
  | "create_food"
  | "create_meal"
  | "update_meal"
  | "delete_meal"
  | "create_body_measurement"
  | "update_body_measurement"
  | "delete_body_measurement"
  | "create_workout"
  | "update_workout"
  | "delete_workout"
  | "create_user_goal"
  | "update_profile"
  | "unknown";

export type AssistantDraft = {
  action: AssistantDraftAction;
  confidence: "low" | "medium" | "high";
  missingFields: string[];
  payload: Record<string, unknown>;
  reply?: string;
  requiresConfirmation: boolean;
  summary: string;
};

export type AssistantDraftRequest = {
  context?: AssistantDraftContext;
  currentDraft?: AssistantDraft;
  history?: Array<{
    content: string;
    role: "user" | "assistant";
  }>;
  message: string;
};
