// Client HTTP central avec authentification JWT.

import type {
  AssistantDraft,
  AssistantDraftRequest,
  BodyMeasurement,
  BodyMeasurementInput,
  Exercise,
  ExerciseInput,
  Food,
  FoodBarcodeLookup,
  FoodInput,
  Meal,
  MealInput,
  NutritionGoal,
  NutritionGoalInput,
  User,
  UserGoal,
  UserGoalInput,
  Workout,
  WorkoutInput,
  WorkoutTemplate,
  WorkoutTemplateInput,
} from "./types";

export * from "./types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

type ApiEnvelope<T> = {
  data?: T;
  error?: string;
  code?: string;
};

type ListMeta = {
  total: number;
  page: number;
  limit: number;
};

// Plafond applique par l'API (`parsePagination` cote serveur). On demande
// directement le maximum pour minimiser le nombre d'allers-retours.
const MAX_PAGE_SIZE = 100;

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

  private async fetchJson(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<unknown> {
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
      return null;
    }

    return response.json();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const result = (await this.fetchJson(endpoint, options)) as
      | ApiEnvelope<T>
      | T
      | null;

    if (result === null) {
      return {} as T;
    }

    if (typeof result === "object" && result !== null && "data" in result) {
      return (result as ApiEnvelope<T>).data as T;
    }

    return result as T;
  }

  // Recupere une liste complete en parcourant les pages.
  //
  // L'API pagine par defaut (20 par page, 100 au maximum). Or les ecrans de
  // cette application calculent des agregats sur les listes completes
  // (graphique de poids, regularite hebdomadaire, totaux nutritionnels,
  // calendrier). Leur servir une page tronquee ne masquerait pas seulement
  // des lignes: cela produirait des statistiques fausses, sans erreur
  // visible. On reconstitue donc l'ensemble ici, ce qui laisse au serveur sa
  // protection contre les requetes non bornees.
  private async requestList<T>(endpoint: string): Promise<T[]> {
    const items: T[] = [];
    let page = 1;

    for (;;) {
      const separator = endpoint.includes("?") ? "&" : "?";
      const envelope = (await this.fetchJson(
        `${endpoint}${separator}page=${page}&limit=${MAX_PAGE_SIZE}`,
      )) as { data?: T[]; meta?: ListMeta } | null;

      const pageItems = envelope?.data ?? [];
      items.push(...pageItems);

      const total = envelope?.meta?.total;
      // Sans `meta.total` exploitable, on s'arrete des qu'une page est
      // incomplete: c'etait la derniere.
      if (typeof total !== "number") {
        if (pageItems.length < MAX_PAGE_SIZE) return items;
      } else if (items.length >= total) {
        return items;
      }

      // Garde-fou: une page vide signifie qu'il n'y a plus rien a lire, meme
      // si `total` annonce davantage. Evite une boucle infinie.
      if (pageItems.length === 0) return items;

      page += 1;
    }
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

  async register(
    email: string,
    password: string,
    name: string,
    dateOfBirth?: string | null,
  ) {
    const result = await this.request<{ user: User; token: string }>(
      "/api/users/register",
      {
        method: "POST",
        body: JSON.stringify({ email, password, name, dateOfBirth }),
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
    data: Partial<Pick<User, "email" | "name" | "dateOfBirth">> & {
      password?: string;
      currentPassword?: string;
    },
  ) {
    return this.request<User>("/api/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Exercises
  async getExercises() {
    return this.requestList<Exercise>("/api/exercises");
  }

  async getExercise(id: string) {
    return this.request<Exercise>(`/api/exercises/${id}`);
  }

  async getExercisesByMuscleGroup(group: string) {
    return this.requestList<Exercise>(`/api/exercises/muscle/${group}`);
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
    return this.requestList<Workout>("/api/workouts");
  }

  async getWorkout(id: string) {
    return this.request<Workout>(`/api/workouts/${id}`);
  }

  async getWorkoutsByDateRange(start: string, end: string) {
    return this.requestList<Workout>(
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
    return this.requestList<WorkoutTemplate>("/api/workout-templates");
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

  async updateWorkoutTemplate(id: string, data: Partial<WorkoutTemplateInput>) {
    return this.request<WorkoutTemplate>(`/api/workout-templates/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Foods
  async getFoods() {
    return this.requestList<Food>("/api/foods");
  }

  async getFood(id: string) {
    return this.request<Food>(`/api/foods/${id}`);
  }

  async lookupFoodByBarcode(barcode: string) {
    return this.request<FoodBarcodeLookup>(
      `/api/foods/barcode/${encodeURIComponent(barcode)}/lookup`,
    );
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
    return this.requestList<Meal>("/api/meals");
  }

  async getMeal(id: string) {
    return this.request<Meal>(`/api/meals/${id}`);
  }

  async getMealsByDateRange(start: string, end: string) {
    return this.requestList<Meal>(
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
    return this.requestList<NutritionGoal>("/api/nutrition-goals");
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

  // User goals
  async getUserGoals() {
    return this.requestList<UserGoal>("/api/user-goals");
  }

  async getUserGoal(id: string) {
    return this.request<UserGoal>(`/api/user-goals/${id}`);
  }

  async createUserGoal(data: UserGoalInput) {
    return this.request<UserGoal>("/api/user-goals", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateUserGoal(id: string, data: Partial<UserGoalInput>) {
    return this.request<UserGoal>(`/api/user-goals/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteUserGoal(id: string) {
    return this.request<void>(`/api/user-goals/${id}`, {
      method: "DELETE",
    });
  }

  // Body measurements
  async getBodyMeasurements() {
    return this.requestList<BodyMeasurement>("/api/body-measurements");
  }

  async getLatestBodyMeasurement() {
    return this.request<BodyMeasurement>("/api/body-measurements/latest");
  }

  async getBodyMeasurement(id: string) {
    return this.request<BodyMeasurement>(`/api/body-measurements/${id}`);
  }

  async createBodyMeasurement(data: BodyMeasurementInput) {
    return this.request<BodyMeasurement>("/api/body-measurements", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateBodyMeasurement(
    id: string,
    data: Partial<BodyMeasurementInput>,
  ) {
    return this.request<BodyMeasurement>(`/api/body-measurements/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteBodyMeasurement(id: string) {
    return this.request<void>(`/api/body-measurements/${id}`, {
      method: "DELETE",
    });
  }

  // Assistant
  async createAssistantDraft(data: AssistantDraftRequest) {
    return this.request<AssistantDraft>("/api/assistant/draft", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
