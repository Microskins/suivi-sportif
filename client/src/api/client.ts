// filepath: client/src/api/client.ts
// API client with JWT authentication

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

type ApiEnvelope<T> = {
  data?: T;
  error?: string;
  code?: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
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
  reps: number;
  weight: number;
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
  servingUnit: string;
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
  servingUnit?: string;
};

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

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem("auth_token");
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Request failed", code: "REQUEST_FAILED" }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    const result = (await response.json()) as ApiEnvelope<T> | T;

    if (typeof result === "object" && result !== null && "data" in result) {
      return (result as ApiEnvelope<T>).data as T;
    }

    return result as T;
  }

  // Auth
  async login(email: string, password: string) {
    const result = await this.request<{ user: User; token: string }>(
      "/api/users/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
    );
    this.setToken(result.token);
    return result;
  }

  async register(email: string, password: string, name: string) {
    const result = await this.request<{ user: User; token: string }>(
      "/api/users/register",
      {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
      },
    );
    this.setToken(result.token);
    return result;
  }

  logout() {
    this.setToken(null);
  }

  // Users
  async getMe() {
    return this.request<User>("/api/users/me");
  }

  async updateMe(
    data: Partial<Pick<User, "email" | "name">> & { password?: string },
  ) {
    return this.request<User>("/api/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Exercises
  async getExercises() {
    return this.request<Exercise[]>("/api/exercises");
  }

  async getExercise(id: string) {
    return this.request<Exercise>(`/api/exercises/${id}`);
  }

  async getExercisesByMuscleGroup(group: string) {
    return this.request<Exercise[]>(`/api/exercises/muscle/${group}`);
  }

  async createExercise(data: ExerciseInput) {
    return this.request<Exercise>("/api/exercises", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateExercise(id: string, data: Partial<ExerciseInput>) {
    return this.request<Exercise>(`/api/exercises/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteExercise(id: string) {
    return this.request<void>(`/api/exercises/${id}`, {
      method: "DELETE",
    });
  }

  // Workouts
  async getWorkouts() {
    return this.request<Workout[]>("/api/workouts");
  }

  async getWorkout(id: string) {
    return this.request<Workout>(`/api/workouts/${id}`);
  }

  async getWorkoutsByDateRange(start: string, end: string) {
    return this.request<Workout[]>(
      `/api/workouts/range/${encodeURIComponent(start)}/${encodeURIComponent(end)}`,
    );
  }

  async createWorkout(data: WorkoutInput) {
    return this.request<Workout>("/api/workouts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateWorkout(id: string, data: Partial<WorkoutInput>) {
    return this.request<Workout>(`/api/workouts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteWorkout(id: string) {
    return this.request<void>(`/api/workouts/${id}`, {
      method: "DELETE",
    });
  }

  // Workout templates
  async getWorkoutTemplates() {
    return this.request<WorkoutTemplate[]>("/api/workout-templates");
  }

  async instantiateWorkoutTemplate(id: string, date: string) {
    return this.request<Workout>(`/api/workout-templates/${id}/instantiate`, {
      method: "POST",
      body: JSON.stringify({ date }),
    });
  }

  async createWorkoutTemplate(data: WorkoutTemplateInput) {
    return this.request<WorkoutTemplate>("/api/workout-templates", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Foods
  async getFoods() {
    return this.request<Food[]>("/api/foods");
  }

  async getFood(id: string) {
    return this.request<Food>(`/api/foods/${id}`);
  }

  async createFood(data: FoodInput) {
    return this.request<Food>("/api/foods", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateFood(id: string, data: Partial<FoodInput>) {
    return this.request<Food>(`/api/foods/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteFood(id: string) {
    return this.request<void>(`/api/foods/${id}`, {
      method: "DELETE",
    });
  }

  // Meals
  async getMeals() {
    return this.request<Meal[]>("/api/meals");
  }

  async getMeal(id: string) {
    return this.request<Meal>(`/api/meals/${id}`);
  }

  async getMealsByDateRange(start: string, end: string) {
    return this.request<Meal[]>(
      `/api/meals/range/${encodeURIComponent(start)}/${encodeURIComponent(end)}`,
    );
  }

  async createMeal(data: MealInput) {
    return this.request<Meal>("/api/meals", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateMeal(id: string, data: Partial<MealInput>) {
    return this.request<Meal>(`/api/meals/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteMeal(id: string) {
    return this.request<void>(`/api/meals/${id}`, {
      method: "DELETE",
    });
  }

  // Nutrition goals
  async getNutritionGoals() {
    return this.request<NutritionGoal[]>("/api/nutrition-goals");
  }

  async getActiveNutritionGoal() {
    return this.request<NutritionGoal>("/api/nutrition-goals/active");
  }

  async getNutritionGoal(id: string) {
    return this.request<NutritionGoal>(`/api/nutrition-goals/${id}`);
  }

  async createNutritionGoal(data: NutritionGoalInput) {
    return this.request<NutritionGoal>("/api/nutrition-goals", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateNutritionGoal(id: string, data: Partial<NutritionGoalInput>) {
    return this.request<NutritionGoal>(`/api/nutrition-goals/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteNutritionGoal(id: string) {
    return this.request<void>(`/api/nutrition-goals/${id}`, {
      method: "DELETE",
    });
  }
}

export const api = new ApiClient();
