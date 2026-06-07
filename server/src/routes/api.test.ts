import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../app.js";

const mocks = vi.hoisted(() => ({
  users: {
    getUsers: vi.fn(),
    getUserById: vi.fn(),
    getUserByEmail: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    verifyCredentials: vi.fn(),
  },
  exercises: {
    getExercises: vi.fn(),
    getExerciseById: vi.fn(),
    getExercisesByMuscleGroup: vi.fn(),
    createExercise: vi.fn(),
    updateExercise: vi.fn(),
    deleteExercise: vi.fn(),
  },
  workouts: {
    WorkoutValidationError: class WorkoutValidationError extends Error {
      details: Array<{ path: string; message: string }>;

      constructor(details: Array<{ path: string; message: string }>) {
        super("Validation failed");
        this.name = "WorkoutValidationError";
        this.details = details;
      }
    },
    getWorkouts: vi.fn(),
    getWorkoutById: vi.fn(),
    getWorkoutsByDateRange: vi.fn(),
    createWorkout: vi.fn(),
    updateWorkout: vi.fn(),
    deleteWorkout: vi.fn(),
  },
  workoutTemplates: {
    getWorkoutTemplates: vi.fn(),
    createWorkoutTemplate: vi.fn(),
    updateWorkoutTemplate: vi.fn(),
    instantiateWorkoutTemplate: vi.fn(),
  },
  foods: {
    getFoods: vi.fn(),
    getFoodById: vi.fn(),
    createFood: vi.fn(),
    updateFood: vi.fn(),
    deleteFood: vi.fn(),
  },
  openFoodFacts: {
    lookupFoodByBarcode: vi.fn(),
  },
  meals: {
    getMeals: vi.fn(),
    getMealById: vi.fn(),
    getMealsByDateRange: vi.fn(),
    createMeal: vi.fn(),
    updateMeal: vi.fn(),
    deleteMeal: vi.fn(),
  },
  nutritionGoals: {
    getNutritionGoals: vi.fn(),
    getActiveNutritionGoal: vi.fn(),
    getNutritionGoalById: vi.fn(),
    createNutritionGoal: vi.fn(),
    updateNutritionGoal: vi.fn(),
    deleteNutritionGoal: vi.fn(),
  },
  userGoals: {
    getUserGoals: vi.fn(),
    getUserGoalById: vi.fn(),
    createUserGoal: vi.fn(),
    updateUserGoal: vi.fn(),
    deleteUserGoal: vi.fn(),
  },
  bodyMeasurements: {
    getBodyMeasurements: vi.fn(),
    getLatestBodyMeasurement: vi.fn(),
    getBodyMeasurementById: vi.fn(),
    createBodyMeasurement: vi.fn(),
    updateBodyMeasurement: vi.fn(),
    deleteBodyMeasurement: vi.fn(),
  },
}));

vi.mock("../db/queries/users.js", () => mocks.users);
vi.mock("../db/queries/exercises.js", () => mocks.exercises);
vi.mock("../db/queries/workouts.js", () => mocks.workouts);
vi.mock("../db/queries/workout-templates.js", () => mocks.workoutTemplates);
vi.mock("../db/queries/foods.js", () => mocks.foods);
vi.mock("../services/open-food-facts.js", () => mocks.openFoodFacts);
vi.mock("../db/queries/meals.js", () => mocks.meals);
vi.mock("../db/queries/nutrition-goals.js", () => mocks.nutritionGoals);
vi.mock("../db/queries/user-goals.js", () => mocks.userGoals);
vi.mock("../db/queries/body-measurements.js", () => mocks.bodyMeasurements);

const USER_ID = "11111111-1111-4111-8111-111111111111";
const EXERCISE_ID = "22222222-2222-4222-8222-222222222222";
const WORKOUT_ID = "33333333-3333-4333-8333-333333333333";
const WORKOUT_TEMPLATE_ID = "77777777-7777-4777-8777-777777777777";
const FOOD_ID = "44444444-4444-4444-8444-444444444444";
const MEAL_ID = "55555555-5555-4555-8555-555555555555";
const NUTRITION_GOAL_ID = "66666666-6666-4666-8666-666666666666";
const BODY_MEASUREMENT_ID = "99999999-9999-4999-8999-999999999999";
const USER_GOAL_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

const user = {
  id: USER_ID,
  email: "test@example.com",
  name: "Test User",
  dateOfBirth: null,
  createdAt: "2026-05-04T10:00:00.000Z",
  updatedAt: "2026-05-04T10:00:00.000Z",
};

const exercise = {
  id: EXERCISE_ID,
  name: "Squat",
  description: null,
  difficulty: "INTERMEDIATE",
  exerciseType: "STRENGTH",
  createdAt: "2026-05-04T10:00:00.000Z",
  updatedAt: "2026-05-04T10:00:00.000Z",
};

const workout = {
  id: WORKOUT_ID,
  userId: USER_ID,
  name: "Séance jambes",
  date: "2026-05-04T10:00:00.000Z",
  status: "COMPLETED",
  duration: 60,
  notes: null,
  createdAt: "2026-05-04T10:00:00.000Z",
  updatedAt: "2026-05-04T10:00:00.000Z",
  exercises: [],
};

const workoutTemplate = {
  id: WORKOUT_TEMPLATE_ID,
  name: "Push",
  category: "Musculation",
  level: "Intermediaire",
  duration: 60,
  description: "Pectoraux, epaules et triceps.",
  displayOrder: 1,
  createdAt: "2026-05-04T10:00:00.000Z",
  updatedAt: "2026-05-04T10:00:00.000Z",
  exercises: [
    {
      id: "88888888-8888-4888-8888-888888888888",
      exerciseId: EXERCISE_ID,
      order: 0,
      sets: 4,
      reps: 8,
      durationSeconds: null,
      rest: 120,
      weight: 0,
      exercise,
    },
  ],
};

const food = {
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
  isGlobal: false,
  createdAt: "2026-05-04T10:00:00.000Z",
  updatedAt: "2026-05-04T10:00:00.000Z",
};

const meal = {
  id: MEAL_ID,
  userId: USER_ID,
  name: "Déjeuner",
  date: "2026-05-04T12:00:00.000Z",
  mealType: "lunch",
  notes: null,
  createdAt: "2026-05-04T12:00:00.000Z",
  updatedAt: "2026-05-04T12:00:00.000Z",
  items: [
    {
      id: "77777777-7777-4777-8777-777777777777",
      foodId: FOOD_ID,
      foodName: food.name,
      quantityGrams: 150,
      caloriesKcalPer100g: 350,
      proteinGramsPer100g: 7,
      carbsGramsPer100g: 78,
      fatGramsPer100g: 1,
      totals: {
        caloriesKcal: 525,
        proteinGrams: 10.5,
        carbsGrams: 117,
        fatGrams: 1.5,
      },
      createdAt: "2026-05-04T12:00:00.000Z",
    },
  ],
  totals: {
    caloriesKcal: 525,
    proteinGrams: 10.5,
    carbsGrams: 117,
    fatGrams: 1.5,
  },
};

const nutritionGoal = {
  id: NUTRITION_GOAL_ID,
  userId: USER_ID,
  name: "Maintien",
  startDate: "2026-05-04T00:00:00.000Z",
  endDate: null,
  dailyCaloriesKcal: 2400,
  dailyProteinGrams: 160,
  dailyCarbsGrams: 260,
  dailyFatGrams: 70,
  isActive: true,
  createdAt: "2026-05-04T10:00:00.000Z",
  updatedAt: "2026-05-04T10:00:00.000Z",
};

const userGoal = {
  id: USER_GOAL_ID,
  userId: USER_ID,
  domain: "BODY",
  exerciseId: null,
  metric: "BODY_WEIGHT_KG",
  direction: "AT_MOST",
  name: "Poids cible",
  targetValue: 80,
  startDate: "2026-05-04T00:00:00.000Z",
  endDate: null,
  isActive: true,
  notes: null,
  createdAt: "2026-05-04T10:00:00.000Z",
  updatedAt: "2026-05-04T10:00:00.000Z",
};

const bodyMeasurement = {
  id: BODY_MEASUREMENT_ID,
  userId: USER_ID,
  date: "2026-05-04T08:00:00.000Z",
  silhouette: "MALE",
  isActiveLifestyle: true,
  weightKg: 82.4,
  heightCm: 181,
  chestCm: 104,
  waistCm: 86,
  hipsCm: 99,
  neckCm: 39,
  shouldersCm: 121,
  leftArmCm: 36,
  rightArmCm: 36.5,
  leftForearmCm: 29,
  rightForearmCm: 29.5,
  leftThighCm: 60,
  rightThighCm: 60.5,
  leftCalfCm: 39,
  rightCalfCm: 39.5,
  notes: "Mesure du matin",
  createdAt: "2026-05-04T08:00:00.000Z",
  updatedAt: "2026-05-04T08:00:00.000Z",
};

describe("buildApp configuration", () => {
  const originalEnv = {
    CORS_ORIGINS: process.env.CORS_ORIGINS,
    JWT_SECRET: process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV,
  };

  afterEach(() => {
    if (originalEnv.CORS_ORIGINS === undefined) delete process.env.CORS_ORIGINS;
    else process.env.CORS_ORIGINS = originalEnv.CORS_ORIGINS;

    if (originalEnv.JWT_SECRET === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalEnv.JWT_SECRET;

    if (originalEnv.NODE_ENV === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalEnv.NODE_ENV;
  });

  it("requires JWT_SECRET in production", () => {
    process.env.NODE_ENV = "production";
    delete process.env.JWT_SECRET;

    expect(() => buildApp({ logger: false })).toThrow(
      "JWT_SECRET is required in production",
    );
  });

  it("does not allow arbitrary CORS origins in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.JWT_SECRET = "test-production-secret-at-least-32-chars";
    delete process.env.CORS_ORIGINS;

    const app = buildApp({ logger: false });
    await app.ready();

    const response = await app.inject({
      headers: { origin: "https://example.com" },
      method: "GET",
      url: "/health",
    });

    expect(response.headers["access-control-allow-origin"]).toBeUndefined();

    await app.close();
  });

  it("allows configured CORS origins in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.JWT_SECRET = "test-production-secret-at-least-32-chars";
    process.env.CORS_ORIGINS = "https://suivi-sportif.fr";

    const app = buildApp({ logger: false });
    await app.ready();

    const response = await app.inject({
      headers: { origin: "https://suivi-sportif.fr" },
      method: "GET",
      url: "/health",
    });

    expect(response.headers["access-control-allow-origin"]).toBe(
      "https://suivi-sportif.fr",
    );

    await app.close();
  });
});

describe("API", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = buildApp({ logger: false });
    await app.ready();
  }, 30000);

  afterEach(async () => {
    await app.close();
    vi.unstubAllEnvs();
  });

  function authHeaders() {
    const token = app.jwt.sign({
      id: USER_ID,
      email: user.email,
      name: user.name,
    });

    return { authorization: `Bearer ${token}` };
  }

  function invalidAuthHeaders() {
    return { authorization: "Bearer not-a-valid-token" };
  }

  function expectErrorShape(body: any, code: string) {
    expect(body.error).toEqual(expect.any(String));
    expect(body.code).toBe(code);
  }

  function expectValidationError(body: any) {
    expectErrorShape(body, "VALIDATION_ERROR");
    expect(body.details).toEqual(expect.any(Array));
  }

  function openApiPath(paths: Record<string, any>, path: string) {
    return paths[path] ?? paths[`${path}/`];
  }

  it("returns a structured health response", async () => {
    const response = await app.inject({ method: "GET", url: "/health" });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data.status).toBe("ok");
    expect(body.data.timestamp).toEqual(expect.any(String));
  });

  it("allows configured local CORS origins only", async () => {
    const allowedResponse = await app.inject({
      method: "GET",
      url: "/health",
      headers: { origin: "http://localhost:5173" },
    });
    const rejectedResponse = await app.inject({
      method: "GET",
      url: "/health",
      headers: { origin: "https://evil.example" },
    });

    expect(allowedResponse.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173",
    );
    expect(
      rejectedResponse.headers["access-control-allow-origin"],
    ).toBeUndefined();
  });

  it("requires an explicit strong JWT secret in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("JWT_SECRET", "");

    expect(() => buildApp({ logger: false })).toThrow(
      "JWT_SECRET is required in production",
    );

    vi.stubEnv("JWT_SECRET", "short-secret");

    expect(() => buildApp({ logger: false })).toThrow(
      "JWT_SECRET must be at least 32 characters in production",
    );
  });

  it("serves swagger UI", async () => {
    const response = await app.inject({ method: "GET", url: "/docs/" });

    expect([200, 302]).toContain(response.statusCode);
    if (response.statusCode === 302) {
      expect(response.headers.location).toBe("./static/index.html");
    }
  });

  it("exposes openapi json", async () => {
    const response = await app.inject({ method: "GET", url: "/docs/json" });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.openapi).toEqual(expect.any(String));
    expect(body.components.securitySchemes.bearerAuth).toEqual({
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    });

    const paths = body.paths ?? {};
    for (const path of [
      "/api/users/login",
      "/api/users/register",
      "/api/users/me",
      "/api/exercises",
      "/api/exercises/{id}",
      "/api/workouts",
      "/api/workouts/{id}",
      "/api/workout-templates",
      "/api/workout-templates/{id}",
      "/api/workout-templates/{id}/instantiate",
      "/api/foods",
      "/api/foods/{id}",
      "/api/meals",
      "/api/meals/{id}",
      "/api/nutrition-goals",
      "/api/nutrition-goals/{id}",
      "/api/nutrition-goals/active",
      "/api/user-goals",
      "/api/user-goals/{id}",
      "/api/body-measurements",
      "/api/body-measurements/{id}",
      "/api/body-measurements/latest",
    ]) {
      expect(openApiPath(paths, path), path).toBeDefined();
    }

    expect(openApiPath(paths, "/api/meals").get.tags).toContain("meals");
    expect(openApiPath(paths, "/api/nutrition-goals").get.tags).toContain(
      "nutrition-goals",
    );
    expect(openApiPath(paths, "/api/user-goals").get.tags).toContain(
      "user-goals",
    );
    expect(openApiPath(paths, "/api/body-measurements").get.tags).toContain(
      "body-measurements",
    );
    expect(openApiPath(paths, "/api/meals").get.security).toEqual([
      { bearerAuth: [] },
    ]);
    expect(openApiPath(paths, "/api/nutrition-goals").post.security).toEqual([
      { bearerAuth: [] },
    ]);
    expect(openApiPath(paths, "/api/user-goals").post.security).toEqual([
      { bearerAuth: [] },
    ]);
    expect(openApiPath(paths, "/api/body-measurements").post.security).toEqual([
      { bearerAuth: [] },
    ]);
    expect(openApiPath(paths, "/api/workout-templates").get.security).toEqual([
      { bearerAuth: [] },
    ]);
    expect(
      openApiPath(paths, "/api/workout-templates/{id}").put.security,
    ).toEqual([{ bearerAuth: [] }]);
    expect(
      openApiPath(paths, "/api/workout-templates/{id}").put.responses,
    ).toHaveProperty("404");
    expect(
      openApiPath(paths, "/api/workout-templates/{id}/instantiate").post
        .responses,
    ).toHaveProperty("201");
    expect(openApiPath(paths, "/api/meals").post.responses).toHaveProperty(
      "201",
    );
    expect(
      openApiPath(paths, "/api/meals/{id}").delete.responses,
    ).toHaveProperty("204");
    expect(
      openApiPath(paths, "/api/nutrition-goals/{id}").put.responses,
    ).toHaveProperty("400");
    expect(
      openApiPath(paths, "/api/nutrition-goals/{id}").put.responses,
    ).toHaveProperty("404");
    expect(
      openApiPath(paths, "/api/nutrition-goals/{id}").put.responses,
    ).toHaveProperty("500");
  });

  it("registers a public user and returns a token", async () => {
    mocks.users.getUserByEmail.mockResolvedValue(null);
    mocks.users.createUser.mockResolvedValue(user);

    const response = await app.inject({
      method: "POST",
      url: "/api/users/register",
      payload: {
        email: user.email,
        password: "password123",
        name: user.name,
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(201);
    expect(body.data.user).toEqual(user);
    expect(body.data.token).toEqual(expect.any(String));
    expect(mocks.users.createUser).toHaveBeenCalledWith({
      email: user.email,
      password: "password123",
      name: user.name,
    });
  });

  it("rejects duplicate public registration", async () => {
    mocks.users.getUserByEmail.mockResolvedValue(user);

    const response = await app.inject({
      method: "POST",
      url: "/api/users/register",
      payload: {
        email: user.email,
        password: "password123",
        name: user.name,
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe("EMAIL_ALREADY_EXISTS");
    expect(mocks.users.createUser).not.toHaveBeenCalled();
  });

  it("rate limits repeated public login attempts", async () => {
    mocks.users.verifyCredentials.mockResolvedValue(null);

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const response = await app.inject({
        method: "POST",
        url: "/api/users/login",
        payload: {
          email: user.email,
          password: "wrong-password",
        },
      });

      expect(response.statusCode).toBe(401);
    }

    const response = await app.inject({
      method: "POST",
      url: "/api/users/login",
      payload: {
        email: user.email,
        password: "wrong-password",
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(429);
    expectErrorShape(body, "RATE_LIMIT_EXCEEDED");
  });

  it("rate limits repeated public register attempts", async () => {
    mocks.users.getUserByEmail.mockResolvedValue(user);

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const response = await app.inject({
        method: "POST",
        url: "/api/users/register",
        payload: {
          email: user.email,
          password: "password123",
          name: user.name,
        },
      });

      expect(response.statusCode).toBe(400);
    }

    const response = await app.inject({
      method: "POST",
      url: "/api/users/register",
      payload: {
        email: user.email,
        password: "password123",
        name: user.name,
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(429);
    expectErrorShape(body, "RATE_LIMIT_EXCEEDED");
  });

  it("returns the authenticated user profile", async () => {
    mocks.users.getUserById.mockResolvedValue(user);

    const response = await app.inject({
      method: "GET",
      url: "/api/users/me",
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toEqual(user);
    expect(mocks.users.getUserById).toHaveBeenCalledWith(USER_ID);
  });

  it("rejects /me without a token", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/users/me",
    });
    const body = response.json();

    expect(response.statusCode).toBe(401);
    expect(body.code).toBe("UNAUTHORIZED");
    expect(mocks.users.getUserById).not.toHaveBeenCalled();
  });

  it("returns 404 when the authenticated user no longer exists", async () => {
    mocks.users.getUserById.mockResolvedValue(null);

    const response = await app.inject({
      method: "GET",
      url: "/api/users/me",
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(404);
    expect(body.code).toBe("USER_NOT_FOUND");
  });

  it("updates only the authenticated user profile", async () => {
    const updatedUser = {
      ...user,
      name: "Updated User",
    };
    mocks.users.updateUser.mockResolvedValue(updatedUser);

    const response = await app.inject({
      method: "PUT",
      url: "/api/users/me",
      headers: authHeaders(),
      payload: {
        name: updatedUser.name,
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toEqual(updatedUser);
    expect(mocks.users.updateUser).toHaveBeenCalledWith(USER_ID, {
      name: updatedUser.name,
    });
  });

  it("rejects profile update when email belongs to another user", async () => {
    const otherUser = {
      ...user,
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      email: "taken@example.com",
    };
    mocks.users.getUserById.mockResolvedValue(user);
    mocks.users.verifyCredentials.mockResolvedValue(user);
    mocks.users.getUserByEmail.mockResolvedValue(otherUser);

    const response = await app.inject({
      method: "PUT",
      url: "/api/users/me",
      headers: authHeaders(),
      payload: {
        email: otherUser.email,
        currentPassword: "password123",
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe("EMAIL_ALREADY_EXISTS");
    expect(mocks.users.getUserByEmail).toHaveBeenCalledWith(otherUser.email);
    expect(mocks.users.updateUser).not.toHaveBeenCalled();
  });

  it("requires the current password for sensitive profile updates", async () => {
    mocks.users.getUserById.mockResolvedValue(user);

    const response = await app.inject({
      method: "PUT",
      url: "/api/users/me",
      headers: authHeaders(),
      payload: {
        email: "new@example.com",
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe("CURRENT_PASSWORD_REQUIRED");
    expect(mocks.users.updateUser).not.toHaveBeenCalled();
  });

  it("rejects sensitive profile updates when the current password is invalid", async () => {
    mocks.users.getUserById.mockResolvedValue(user);
    mocks.users.verifyCredentials.mockResolvedValue(null);

    const response = await app.inject({
      method: "PUT",
      url: "/api/users/me",
      headers: authHeaders(),
      payload: {
        password: "newpassword123",
        currentPassword: "wrong-password",
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(401);
    expect(body.code).toBe("INVALID_CURRENT_PASSWORD");
    expect(mocks.users.verifyCredentials).toHaveBeenCalledWith(
      user.email,
      "wrong-password",
    );
    expect(mocks.users.updateUser).not.toHaveBeenCalled();
  });

  it("updates sensitive profile fields after current password confirmation", async () => {
    const updatedUser = { ...user, email: "new@example.com" };
    mocks.users.getUserById.mockResolvedValue(user);
    mocks.users.verifyCredentials.mockResolvedValue(user);
    mocks.users.getUserByEmail.mockResolvedValue(null);
    mocks.users.updateUser.mockResolvedValue(updatedUser);

    const response = await app.inject({
      method: "PUT",
      url: "/api/users/me",
      headers: authHeaders(),
      payload: {
        email: updatedUser.email,
        currentPassword: "password123",
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toEqual(updatedUser);
    expect(mocks.users.updateUser).toHaveBeenCalledWith(USER_ID, {
      email: updatedUser.email,
    });
  });

  it("returns 404 when updating the authenticated user after deletion", async () => {
    mocks.users.updateUser.mockResolvedValue(null);

    const response = await app.inject({
      method: "PUT",
      url: "/api/users/me",
      headers: authHeaders(),
      payload: {
        name: "Missing User",
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(404);
    expect(body.code).toBe("USER_NOT_FOUND");
    expect(mocks.users.updateUser).toHaveBeenCalledWith(USER_ID, {
      name: "Missing User",
    });
  });

  it("rejects invalid authenticated user updates before calling the database", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/users/me",
      headers: authHeaders(),
      payload: {
        email: "not-an-email",
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(mocks.users.updateUser).not.toHaveBeenCalled();
  });

  it("forbids listing users without an admin role", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/users",
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(403);
    expect(body.code).toBe("FORBIDDEN");
    expect(mocks.users.getUsers).not.toHaveBeenCalled();
  });

  it("forbids updating arbitrary users without an admin role", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/users/99999999-9999-4999-8999-999999999999",
      headers: authHeaders(),
      payload: {
        name: "Forbidden",
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(403);
    expect(body.code).toBe("FORBIDDEN");
    expect(mocks.users.updateUser).not.toHaveBeenCalled();
  });

  it("rejects protected exercise routes without a token", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/exercises",
    });
    const body = response.json();

    expect(response.statusCode).toBe(401);
    expect(body.code).toBe("UNAUTHORIZED");
    expect(mocks.exercises.getExercises).not.toHaveBeenCalled();
  });

  it("lists exercises for authenticated users", async () => {
    mocks.exercises.getExercises.mockResolvedValue([exercise]);

    const response = await app.inject({
      method: "GET",
      url: "/api/exercises",
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toEqual([exercise]);
    expect(body.meta).toEqual({ total: 1, page: 1, limit: 1 });
  });

  it("gets an exercise by id", async () => {
    mocks.exercises.getExerciseById.mockResolvedValue(exercise);

    const response = await app.inject({
      method: "GET",
      url: `/api/exercises/${EXERCISE_ID}`,
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toEqual(exercise);
    expect(mocks.exercises.getExerciseById).toHaveBeenCalledWith(EXERCISE_ID);
  });

  it("returns 404 when getting a missing exercise by id", async () => {
    mocks.exercises.getExerciseById.mockResolvedValue(null);

    const response = await app.inject({
      method: "GET",
      url: `/api/exercises/${EXERCISE_ID}`,
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(404);
    expect(body.code).toBe("EXERCISE_NOT_FOUND");
  });

  it("rejects invalid exercise ids before calling the database", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/exercises/not-a-uuid",
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(mocks.exercises.getExerciseById).not.toHaveBeenCalled();
  });

  it("lists exercises by a valid muscle group", async () => {
    mocks.exercises.getExercisesByMuscleGroup.mockResolvedValue([exercise]);

    const response = await app.inject({
      method: "GET",
      url: "/api/exercises/muscle/legs",
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toEqual([exercise]);
    expect(mocks.exercises.getExercisesByMuscleGroup).toHaveBeenCalledWith(
      "legs",
    );
  });

  it("accepts any muscle group string (no longer validated by enum)", async () => {
    mocks.exercises.getExercisesByMuscleGroup.mockResolvedValue([]);

    const response = await app.inject({
      method: "GET",
      url: "/api/exercises/muscle/invalid-group",
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toEqual([]);
    expect(mocks.exercises.getExercisesByMuscleGroup).toHaveBeenCalledWith(
      "invalid-group",
    );
  });

  it("creates an exercise from a valid payload", async () => {
    mocks.exercises.createExercise.mockResolvedValue(exercise);

    const payload = {
      name: exercise.name,
      description: exercise.description,
      difficulty: exercise.difficulty,
      exerciseType: exercise.exerciseType,
    };

    const response = await app.inject({
      method: "POST",
      url: "/api/exercises",
      headers: authHeaders(),
      payload,
    });
    const body = response.json();

    expect(response.statusCode).toBe(201);
    expect(body.data).toEqual(exercise);
    expect(mocks.exercises.createExercise).toHaveBeenCalledWith(payload);
  });

  it("rejects invalid exercise creation before calling the database", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/exercises",
      headers: authHeaders(),
      payload: {
        name: "",
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(mocks.exercises.createExercise).not.toHaveBeenCalled();
  });

  it("updates an exercise from a valid payload", async () => {
    const updatedExercise = {
      ...exercise,
      name: "Front squat",
    };
    mocks.exercises.updateExercise.mockResolvedValue(updatedExercise);

    const response = await app.inject({
      method: "PUT",
      url: `/api/exercises/${EXERCISE_ID}`,
      headers: authHeaders(),
      payload: {
        name: updatedExercise.name,
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toEqual(updatedExercise);
    expect(mocks.exercises.updateExercise).toHaveBeenCalledWith(EXERCISE_ID, {
      name: updatedExercise.name,
    });
  });

  it("returns 404 when updating a missing exercise", async () => {
    mocks.exercises.updateExercise.mockResolvedValue(null);

    const response = await app.inject({
      method: "PUT",
      url: `/api/exercises/${EXERCISE_ID}`,
      headers: authHeaders(),
      payload: {
        name: "Missing",
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(404);
    expect(body.code).toBe("EXERCISE_NOT_FOUND");
  });

  it("rejects invalid exercise ids on update before calling the database", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/exercises/not-a-uuid",
      headers: authHeaders(),
      payload: { name: "Invalid id" },
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(mocks.exercises.updateExercise).not.toHaveBeenCalled();
  });

  it("deletes an exercise by id", async () => {
    mocks.exercises.deleteExercise.mockResolvedValue(true);

    const response = await app.inject({
      method: "DELETE",
      url: `/api/exercises/${EXERCISE_ID}`,
      headers: authHeaders(),
    });

    expect(response.statusCode).toBe(204);
    expect(mocks.exercises.deleteExercise).toHaveBeenCalledWith(EXERCISE_ID);
  });

  it("returns 404 when deleting a missing exercise", async () => {
    mocks.exercises.deleteExercise.mockResolvedValue(false);

    const response = await app.inject({
      method: "DELETE",
      url: `/api/exercises/${EXERCISE_ID}`,
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(404);
    expect(body.code).toBe("EXERCISE_NOT_FOUND");
  });

  it("rejects invalid exercise ids on delete before calling the database", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: "/api/exercises/not-a-uuid",
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(mocks.exercises.deleteExercise).not.toHaveBeenCalled();
  });

  it("rejects workout routes without a token", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/workouts",
    });
    const body = response.json();

    expect(response.statusCode).toBe(401);
    expect(body.code).toBe("UNAUTHORIZED");
    expect(mocks.workouts.getWorkouts).not.toHaveBeenCalled();
  });

  it("lists workouts for the authenticated user only", async () => {
    mocks.workouts.getWorkouts.mockResolvedValue([workout]);

    const response = await app.inject({
      method: "GET",
      url: "/api/workouts",
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toEqual([workout]);
    expect(body.meta).toEqual({ total: 1, page: 1, limit: 1 });
    expect(mocks.workouts.getWorkouts).toHaveBeenCalledWith(USER_ID);
  });

  it("gets a workout by id for the authenticated user only", async () => {
    mocks.workouts.getWorkoutById.mockResolvedValue(workout);

    const response = await app.inject({
      method: "GET",
      url: `/api/workouts/${WORKOUT_ID}`,
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toEqual(workout);
    expect(mocks.workouts.getWorkoutById).toHaveBeenCalledWith(
      WORKOUT_ID,
      USER_ID,
    );
  });

  it("returns 404 when getting a missing workout by id", async () => {
    mocks.workouts.getWorkoutById.mockResolvedValue(null);

    const response = await app.inject({
      method: "GET",
      url: `/api/workouts/${WORKOUT_ID}`,
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(404);
    expect(body.code).toBe("WORKOUT_NOT_FOUND");
  });

  it("rejects invalid workout ids before calling the database", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/workouts/not-a-uuid",
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(mocks.workouts.getWorkoutById).not.toHaveBeenCalled();
  });

  it("lists workouts by a valid date range for the authenticated user", async () => {
    mocks.workouts.getWorkoutsByDateRange.mockResolvedValue([workout]);

    const start = "2026-05-01T00:00:00.000Z";
    const end = "2026-05-31T23:59:59.000Z";
    const response = await app.inject({
      method: "GET",
      url: `/api/workouts/range/${start}/${end}`,
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toEqual([workout]);
    expect(mocks.workouts.getWorkoutsByDateRange).toHaveBeenCalledWith(
      USER_ID,
      start,
      end,
    );
  });

  it("rejects invalid workout date ranges before calling the database", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/workouts/range/2026-05-31T23:59:59.000Z/2026-05-01T00:00:00.000Z",
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(mocks.workouts.getWorkoutsByDateRange).not.toHaveBeenCalled();
  });

  it("creates a workout with exercise sets for the authenticated user", async () => {
    mocks.workouts.createWorkout.mockResolvedValue(workout);

    const payload = {
      name: workout.name,
      date: workout.date,
      duration: workout.duration,
      notes: "Travail lourd",
      exercises: [
        {
          exerciseId: EXERCISE_ID,
          sets: [
            {
              reps: 10,
              weight: 80,
              rpe: 8,
              rir: 2,
              rest: 90,
            },
          ],
        },
      ],
    };

    const response = await app.inject({
      method: "POST",
      url: "/api/workouts",
      headers: authHeaders(),
      payload,
    });
    const body = response.json();

    expect(response.statusCode).toBe(201);
    expect(body.data).toEqual(workout);
    expect(mocks.workouts.createWorkout).toHaveBeenCalledWith(USER_ID, payload);
  });

  it("creates a workout with explicit status for the authenticated user", async () => {
    mocks.workouts.createWorkout.mockResolvedValue({
      ...workout,
      status: "PLANNED",
    });

    const payload = {
      name: workout.name,
      date: workout.date,
      status: "PLANNED",
      duration: workout.duration,
    };

    const response = await app.inject({
      method: "POST",
      url: "/api/workouts",
      headers: authHeaders(),
      payload,
    });

    expect(response.statusCode).toBe(201);
    expect(mocks.workouts.createWorkout).toHaveBeenCalledWith(USER_ID, payload);
  });

  it("rejects invalid workout creation before calling the database", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/workouts",
      headers: authHeaders(),
      payload: {
        name: "",
        date: "not-a-date",
        duration: -1,
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(mocks.workouts.createWorkout).not.toHaveBeenCalled();
  });

  it("returns 400 when cardio workout validation fails in query layer", async () => {
    const validationError = new mocks.workouts.WorkoutValidationError([
      {
        path: "exercises.0.sets.0.durationMinutes",
        message: "durationMinutes est requis pour un exercice cardio",
      },
    ]);
    mocks.workouts.createWorkout.mockRejectedValue(validationError);

    const response = await app.inject({
      method: "POST",
      url: "/api/workouts",
      headers: authHeaders(),
      payload: {
        name: workout.name,
        date: workout.date,
        duration: workout.duration,
        exercises: [
          {
            exerciseId: EXERCISE_ID,
            sets: [
              {
                rest: 60,
              },
            ],
          },
        ],
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(body.error).toEqual(expect.any(String));
  });

  it("rejects workout template routes without a token", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/workout-templates",
    });
    const body = response.json();

    expect(response.statusCode).toBe(401);
    expect(body.code).toBe("UNAUTHORIZED");
    expect(mocks.workoutTemplates.getWorkoutTemplates).not.toHaveBeenCalled();
  });

  it("lists workout templates for authenticated users", async () => {
    mocks.workoutTemplates.getWorkoutTemplates.mockResolvedValue([
      workoutTemplate,
    ]);

    const response = await app.inject({
      method: "GET",
      url: "/api/workout-templates",
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toEqual([workoutTemplate]);
    expect(body.meta).toEqual({ total: 1, page: 1, limit: 1 });
    expect(mocks.workoutTemplates.getWorkoutTemplates).toHaveBeenCalledWith();
  });

  it("instantiates a workout template for the authenticated user", async () => {
    mocks.workoutTemplates.instantiateWorkoutTemplate.mockResolvedValue(
      workout,
    );

    const payload = { date: workout.date };
    const response = await app.inject({
      method: "POST",
      url: `/api/workout-templates/${WORKOUT_TEMPLATE_ID}/instantiate`,
      headers: authHeaders(),
      payload,
    });
    const body = response.json();

    expect(response.statusCode).toBe(201);
    expect(body.data).toEqual(workout);
    expect(
      mocks.workoutTemplates.instantiateWorkoutTemplate,
    ).toHaveBeenCalledWith(WORKOUT_TEMPLATE_ID, USER_ID, payload);
  });

  it("returns 404 when instantiating a missing workout template", async () => {
    mocks.workoutTemplates.instantiateWorkoutTemplate.mockResolvedValue(null);

    const response = await app.inject({
      method: "POST",
      url: `/api/workout-templates/${WORKOUT_TEMPLATE_ID}/instantiate`,
      headers: authHeaders(),
      payload: { date: workout.date },
    });
    const body = response.json();

    expect(response.statusCode).toBe(404);
    expect(body.code).toBe("WORKOUT_TEMPLATE_NOT_FOUND");
  });

  it("rejects invalid workout template instantiation before calling the database", async () => {
    const response = await app.inject({
      method: "POST",
      url: `/api/workout-templates/${WORKOUT_TEMPLATE_ID}/instantiate`,
      headers: authHeaders(),
      payload: { date: "not-a-date" },
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(
      mocks.workoutTemplates.instantiateWorkoutTemplate,
    ).not.toHaveBeenCalled();
  });

  it("updates a workout template", async () => {
    const updatedTemplate = {
      ...workoutTemplate,
      name: "Push avance",
      duration: 70,
    };
    const payload = {
      name: updatedTemplate.name,
      duration: updatedTemplate.duration,
    };
    mocks.workoutTemplates.updateWorkoutTemplate.mockResolvedValue(
      updatedTemplate,
    );

    const response = await app.inject({
      method: "PUT",
      url: `/api/workout-templates/${WORKOUT_TEMPLATE_ID}`,
      headers: authHeaders(),
      payload,
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toEqual(updatedTemplate);
    expect(mocks.workoutTemplates.updateWorkoutTemplate).toHaveBeenCalledWith(
      WORKOUT_TEMPLATE_ID,
      payload,
    );
  });

  it("returns 404 when updating a missing workout template", async () => {
    mocks.workoutTemplates.updateWorkoutTemplate.mockResolvedValue(null);

    const response = await app.inject({
      method: "PUT",
      url: `/api/workout-templates/${WORKOUT_TEMPLATE_ID}`,
      headers: authHeaders(),
      payload: { name: "Inexistant" },
    });
    const body = response.json();

    expect(response.statusCode).toBe(404);
    expect(body.code).toBe("WORKOUT_TEMPLATE_NOT_FOUND");
  });

  it("rejects invalid workout template updates before calling the database", async () => {
    const response = await app.inject({
      method: "PUT",
      url: `/api/workout-templates/${WORKOUT_TEMPLATE_ID}`,
      headers: authHeaders(),
      payload: {
        duration: -1,
        exercises: [],
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(mocks.workoutTemplates.updateWorkoutTemplate).not.toHaveBeenCalled();
  });

  it("updates a workout for the authenticated user only", async () => {
    const updatedWorkout = {
      ...workout,
      name: "Séance jambes lourde",
      duration: 75,
    };
    const payload = {
      name: updatedWorkout.name,
      duration: updatedWorkout.duration,
    };
    mocks.workouts.updateWorkout.mockResolvedValue(updatedWorkout);

    const response = await app.inject({
      method: "PUT",
      url: `/api/workouts/${WORKOUT_ID}`,
      headers: authHeaders(),
      payload,
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toEqual(updatedWorkout);
    expect(mocks.workouts.updateWorkout).toHaveBeenCalledWith(
      WORKOUT_ID,
      USER_ID,
      payload,
    );
  });

  it("updates workout status for the authenticated user only", async () => {
    const updatedWorkout = {
      ...workout,
      status: "CANCELED",
    };
    mocks.workouts.updateWorkout.mockResolvedValue(updatedWorkout);

    const response = await app.inject({
      method: "PUT",
      url: `/api/workouts/${WORKOUT_ID}`,
      headers: authHeaders(),
      payload: { status: "CANCELED" },
    });

    expect(response.statusCode).toBe(200);
    expect(mocks.workouts.updateWorkout).toHaveBeenCalledWith(
      WORKOUT_ID,
      USER_ID,
      { status: "CANCELED" },
    );
  });

  it("returns 404 when updating a workout outside the authenticated user scope", async () => {
    mocks.workouts.updateWorkout.mockResolvedValue(null);

    const response = await app.inject({
      method: "PUT",
      url: `/api/workouts/${WORKOUT_ID}`,
      headers: authHeaders(),
      payload: {
        name: "Séance inaccessible",
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(404);
    expect(body.code).toBe("WORKOUT_NOT_FOUND");
    expect(mocks.workouts.updateWorkout).toHaveBeenCalledWith(
      WORKOUT_ID,
      USER_ID,
      { name: "Séance inaccessible" },
    );
  });

  it("rejects invalid workout ids on update before calling the database", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/workouts/not-a-uuid",
      headers: authHeaders(),
      payload: { name: "Invalid id" },
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(mocks.workouts.updateWorkout).not.toHaveBeenCalled();
  });

  it("deletes a workout for the authenticated user only", async () => {
    mocks.workouts.deleteWorkout.mockResolvedValue(true);

    const response = await app.inject({
      method: "DELETE",
      url: `/api/workouts/${WORKOUT_ID}`,
      headers: authHeaders(),
    });

    expect(response.statusCode).toBe(204);
    expect(response.body).toBe("");
    expect(mocks.workouts.deleteWorkout).toHaveBeenCalledWith(
      WORKOUT_ID,
      USER_ID,
    );
  });

  it("returns 404 when deleting a workout outside the authenticated user scope", async () => {
    mocks.workouts.deleteWorkout.mockResolvedValue(false);

    const response = await app.inject({
      method: "DELETE",
      url: `/api/workouts/${WORKOUT_ID}`,
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(404);
    expect(body.code).toBe("WORKOUT_NOT_FOUND");
    expect(mocks.workouts.deleteWorkout).toHaveBeenCalledWith(
      WORKOUT_ID,
      USER_ID,
    );
  });

  it("rejects invalid workout ids on delete before calling the database", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: "/api/workouts/not-a-uuid",
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(mocks.workouts.deleteWorkout).not.toHaveBeenCalled();
  });

  it("rejects listing foods without a token", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/foods",
    });
    const body = response.json();

    expect(response.statusCode).toBe(401);
    expect(body.code).toBe("UNAUTHORIZED");
    expect(mocks.foods.getFoods).not.toHaveBeenCalled();
  });

  it("lists foods available to the authenticated user", async () => {
    mocks.foods.getFoods.mockResolvedValue([food]);

    const response = await app.inject({
      method: "GET",
      url: "/api/foods",
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toEqual([food]);
    expect(body.meta.total).toBe(1);
    expect(mocks.foods.getFoods).toHaveBeenCalledWith(USER_ID);
  });

  it("rejects barcode lookup without a token", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/foods/barcode/3017620422003/lookup",
    });
    const body = response.json();

    expect(response.statusCode).toBe(401);
    expect(body.code).toBe("UNAUTHORIZED");
    expect(mocks.openFoodFacts.lookupFoodByBarcode).not.toHaveBeenCalled();
  });

  it("looks up food data by barcode for the authenticated user", async () => {
    const lookup = {
      name: "Pate a tartiner",
      brand: "Exemple",
      barcode: "3017620422003",
      caloriesKcal: 539,
      proteinGrams: 6.3,
      carbsGrams: 57.5,
      fatGrams: 30.9,
      fiberGrams: 3.4,
      servingUnit: "g",
    };
    mocks.openFoodFacts.lookupFoodByBarcode.mockResolvedValue(lookup);

    const response = await app.inject({
      method: "GET",
      url: "/api/foods/barcode/3017620422003/lookup",
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toEqual(lookup);
    expect(mocks.openFoodFacts.lookupFoodByBarcode).toHaveBeenCalledWith(
      "3017620422003",
    );
  });

  it("returns 404 when barcode lookup has no result", async () => {
    mocks.openFoodFacts.lookupFoodByBarcode.mockResolvedValue(null);

    const response = await app.inject({
      method: "GET",
      url: "/api/foods/barcode/0000000000000/lookup",
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(404);
    expect(body.code).toBe("FOOD_NOT_FOUND");
    expect(mocks.openFoodFacts.lookupFoodByBarcode).toHaveBeenCalledWith(
      "0000000000000",
    );
  });

  it("creates a custom food for the authenticated user", async () => {
    const payload = {
      name: food.name,
      caloriesKcal: food.caloriesKcal,
      proteinGrams: food.proteinGrams,
      carbsGrams: food.carbsGrams,
      fatGrams: food.fatGrams,
    };
    mocks.foods.createFood.mockResolvedValue(food);

    const response = await app.inject({
      method: "POST",
      url: "/api/foods",
      headers: authHeaders(),
      payload,
    });
    const body = response.json();

    expect(response.statusCode).toBe(201);
    expect(body.data).toEqual(food);
    expect(mocks.foods.createFood).toHaveBeenCalledWith(USER_ID, {
      ...payload,
      servingUnit: "g",
    });
  });

  it("gets a food by id for the authenticated user scope", async () => {
    mocks.foods.getFoodById.mockResolvedValue(food);

    const response = await app.inject({
      method: "GET",
      url: `/api/foods/${FOOD_ID}`,
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toEqual(food);
    expect(mocks.foods.getFoodById).toHaveBeenCalledWith(FOOD_ID, USER_ID);
  });

  it("returns 404 when getting a food outside the authenticated user scope", async () => {
    mocks.foods.getFoodById.mockResolvedValue(null);

    const response = await app.inject({
      method: "GET",
      url: `/api/foods/${FOOD_ID}`,
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(404);
    expect(body.code).toBe("FOOD_NOT_FOUND");
    expect(mocks.foods.getFoodById).toHaveBeenCalledWith(FOOD_ID, USER_ID);
  });

  it("rejects invalid food ids before calling the database", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/foods/not-a-uuid",
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(mocks.foods.getFoodById).not.toHaveBeenCalled();
  });

  it("rejects invalid food creation before calling the database", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/foods",
      headers: authHeaders(),
      payload: {
        name: "",
        caloriesKcal: -1,
        proteinGrams: 1,
        carbsGrams: 1,
        fatGrams: 1,
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(mocks.foods.createFood).not.toHaveBeenCalled();
  });

  it("updates a food for the authenticated user scope", async () => {
    const updatedFood = { ...food, name: "Riz complet" };
    mocks.foods.updateFood.mockResolvedValue(updatedFood);

    const response = await app.inject({
      method: "PUT",
      url: `/api/foods/${FOOD_ID}`,
      headers: authHeaders(),
      payload: {
        name: updatedFood.name,
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toEqual(updatedFood);
    expect(mocks.foods.updateFood).toHaveBeenCalledWith(FOOD_ID, USER_ID, {
      name: updatedFood.name,
    });
  });

  it("returns 404 when updating a food outside the authenticated user scope", async () => {
    mocks.foods.updateFood.mockResolvedValue(null);

    const response = await app.inject({
      method: "PUT",
      url: `/api/foods/${FOOD_ID}`,
      headers: authHeaders(),
      payload: {
        name: "Inaccessible",
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(404);
    expect(body.code).toBe("FOOD_NOT_FOUND");
    expect(mocks.foods.updateFood).toHaveBeenCalledWith(FOOD_ID, USER_ID, {
      name: "Inaccessible",
    });
  });

  it("rejects invalid food updates before calling the database", async () => {
    const response = await app.inject({
      method: "PUT",
      url: `/api/foods/${FOOD_ID}`,
      headers: authHeaders(),
      payload: {
        caloriesKcal: -1,
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(mocks.foods.updateFood).not.toHaveBeenCalled();
  });

  it("deletes a food for the authenticated user scope", async () => {
    mocks.foods.deleteFood.mockResolvedValue(true);

    const response = await app.inject({
      method: "DELETE",
      url: `/api/foods/${FOOD_ID}`,
      headers: authHeaders(),
    });

    expect(response.statusCode).toBe(204);
    expect(response.body).toBe("");
    expect(mocks.foods.deleteFood).toHaveBeenCalledWith(FOOD_ID, USER_ID);
  });

  it("returns 404 when deleting a food outside the authenticated user scope", async () => {
    mocks.foods.deleteFood.mockResolvedValue(false);

    const response = await app.inject({
      method: "DELETE",
      url: `/api/foods/${FOOD_ID}`,
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(404);
    expect(body.code).toBe("FOOD_NOT_FOUND");
    expect(mocks.foods.deleteFood).toHaveBeenCalledWith(FOOD_ID, USER_ID);
  });

  it("rejects invalid food ids on delete before calling the database", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: "/api/foods/not-a-uuid",
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(mocks.foods.deleteFood).not.toHaveBeenCalled();
  });

  it("rejects listing meals without a token", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/meals",
    });
    const body = response.json();

    expect(response.statusCode).toBe(401);
    expect(body.code).toBe("UNAUTHORIZED");
    expect(mocks.meals.getMeals).not.toHaveBeenCalled();
  });

  it("lists meals for the authenticated user only", async () => {
    mocks.meals.getMeals.mockResolvedValue([meal]);

    const response = await app.inject({
      method: "GET",
      url: "/api/meals",
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toEqual([meal]);
    expect(body.meta.total).toBe(1);
    expect(mocks.meals.getMeals).toHaveBeenCalledWith(USER_ID);
  });

  it("gets a meal by id for the authenticated user only", async () => {
    mocks.meals.getMealById.mockResolvedValue(meal);

    const response = await app.inject({
      method: "GET",
      url: `/api/meals/${MEAL_ID}`,
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toEqual(meal);
    expect(mocks.meals.getMealById).toHaveBeenCalledWith(MEAL_ID, USER_ID);
  });

  it("returns 404 when getting a meal outside the authenticated user scope", async () => {
    mocks.meals.getMealById.mockResolvedValue(null);

    const response = await app.inject({
      method: "GET",
      url: `/api/meals/${MEAL_ID}`,
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(404);
    expect(body.code).toBe("MEAL_NOT_FOUND");
  });

  it("rejects invalid meal ids before calling the database", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/meals/not-a-uuid",
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(mocks.meals.getMealById).not.toHaveBeenCalled();
  });

  it("creates a meal with food items for the authenticated user", async () => {
    const payload = {
      name: meal.name,
      date: meal.date,
      mealType: meal.mealType,
      items: [{ foodId: FOOD_ID, quantityGrams: 150 }],
    };
    mocks.meals.createMeal.mockResolvedValue(meal);

    const response = await app.inject({
      method: "POST",
      url: "/api/meals",
      headers: authHeaders(),
      payload,
    });
    const body = response.json();

    expect(response.statusCode).toBe(201);
    expect(body.data.totals.caloriesKcal).toBe(525);
    expect(mocks.meals.createMeal).toHaveBeenCalledWith(USER_ID, payload);
  });

  it("returns a clear error when creating a meal with inaccessible food", async () => {
    mocks.meals.createMeal.mockResolvedValue(null);

    const response = await app.inject({
      method: "POST",
      url: "/api/meals",
      headers: authHeaders(),
      payload: {
        name: meal.name,
        date: meal.date,
        items: [{ foodId: FOOD_ID, quantityGrams: 150 }],
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe("FOOD_NOT_FOUND");
  });

  it("rejects invalid meal creation before calling the database", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/meals",
      headers: authHeaders(),
      payload: {
        name: "",
        date: "not-a-date",
        items: [],
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(mocks.meals.createMeal).not.toHaveBeenCalled();
  });

  it("lists meals by date range for the authenticated user", async () => {
    mocks.meals.getMealsByDateRange.mockResolvedValue([meal]);

    const start = "2026-05-01T00:00:00.000Z";
    const end = "2026-05-31T23:59:59.000Z";
    const response = await app.inject({
      method: "GET",
      url: `/api/meals/range/${start}/${end}`,
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toEqual([meal]);
    expect(mocks.meals.getMealsByDateRange).toHaveBeenCalledWith(
      USER_ID,
      start,
      end,
    );
  });

  it("rejects invalid meal date ranges before calling the database", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/meals/range/2026-05-31T23:59:59.000Z/2026-05-01T00:00:00.000Z",
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(mocks.meals.getMealsByDateRange).not.toHaveBeenCalled();
  });

  it("updates a meal for the authenticated user only", async () => {
    const updatedMeal = {
      ...meal,
      name: "Diner",
    };
    mocks.meals.updateMeal.mockResolvedValue(updatedMeal);

    const response = await app.inject({
      method: "PUT",
      url: `/api/meals/${MEAL_ID}`,
      headers: authHeaders(),
      payload: {
        name: updatedMeal.name,
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toEqual(updatedMeal);
    expect(mocks.meals.updateMeal).toHaveBeenCalledWith(MEAL_ID, USER_ID, {
      name: updatedMeal.name,
    });
  });

  it("returns 404 when updating a meal outside the authenticated user scope", async () => {
    mocks.meals.updateMeal.mockResolvedValue(null);

    const response = await app.inject({
      method: "PUT",
      url: `/api/meals/${MEAL_ID}`,
      headers: authHeaders(),
      payload: {
        name: "Inaccessible",
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(404);
    expect(body.code).toBe("MEAL_NOT_FOUND");
    expect(mocks.meals.updateMeal).toHaveBeenCalledWith(MEAL_ID, USER_ID, {
      name: "Inaccessible",
    });
  });

  it("rejects invalid meal updates before calling the database", async () => {
    const response = await app.inject({
      method: "PUT",
      url: `/api/meals/${MEAL_ID}`,
      headers: authHeaders(),
      payload: {
        mealType: "not-a-meal-type",
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(mocks.meals.updateMeal).not.toHaveBeenCalled();
  });

  it("deletes a meal for the authenticated user only", async () => {
    mocks.meals.deleteMeal.mockResolvedValue(true);

    const response = await app.inject({
      method: "DELETE",
      url: `/api/meals/${MEAL_ID}`,
      headers: authHeaders(),
    });

    expect(response.statusCode).toBe(204);
    expect(response.body).toBe("");
    expect(mocks.meals.deleteMeal).toHaveBeenCalledWith(MEAL_ID, USER_ID);
  });

  it("returns 404 when deleting a meal outside the authenticated user scope", async () => {
    mocks.meals.deleteMeal.mockResolvedValue(false);

    const response = await app.inject({
      method: "DELETE",
      url: `/api/meals/${MEAL_ID}`,
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(404);
    expect(body.code).toBe("MEAL_NOT_FOUND");
    expect(mocks.meals.deleteMeal).toHaveBeenCalledWith(MEAL_ID, USER_ID);
  });

  it("rejects invalid meal ids on delete before calling the database", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: "/api/meals/not-a-uuid",
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(mocks.meals.deleteMeal).not.toHaveBeenCalled();
  });

  it("rejects listing nutrition goals without a token", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/nutrition-goals",
    });
    const body = response.json();

    expect(response.statusCode).toBe(401);
    expect(body.code).toBe("UNAUTHORIZED");
    expect(mocks.nutritionGoals.getNutritionGoals).not.toHaveBeenCalled();
  });

  it("lists nutrition goals for the authenticated user only", async () => {
    mocks.nutritionGoals.getNutritionGoals.mockResolvedValue([nutritionGoal]);

    const response = await app.inject({
      method: "GET",
      url: "/api/nutrition-goals",
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toEqual([nutritionGoal]);
    expect(body.meta.total).toBe(1);
    expect(mocks.nutritionGoals.getNutritionGoals).toHaveBeenCalledWith(
      USER_ID,
    );
  });

  it("creates an active nutrition goal for the authenticated user", async () => {
    const payload = {
      name: nutritionGoal.name,
      startDate: nutritionGoal.startDate,
      dailyCaloriesKcal: nutritionGoal.dailyCaloriesKcal,
      dailyProteinGrams: nutritionGoal.dailyProteinGrams,
      dailyCarbsGrams: nutritionGoal.dailyCarbsGrams,
      dailyFatGrams: nutritionGoal.dailyFatGrams,
    };
    mocks.nutritionGoals.createNutritionGoal.mockResolvedValue(nutritionGoal);

    const response = await app.inject({
      method: "POST",
      url: "/api/nutrition-goals",
      headers: authHeaders(),
      payload,
    });
    const body = response.json();

    expect(response.statusCode).toBe(201);
    expect(body.data).toEqual(nutritionGoal);
    expect(mocks.nutritionGoals.createNutritionGoal).toHaveBeenCalledWith(
      USER_ID,
      { ...payload, isActive: true },
    );
  });

  it("rejects invalid nutrition goal creation before calling the database", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/nutrition-goals",
      headers: authHeaders(),
      payload: {
        name: "",
        startDate: "2026-05-04T00:00:00.000Z",
        endDate: "2026-05-03T00:00:00.000Z",
        dailyCaloriesKcal: -1,
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(mocks.nutritionGoals.createNutritionGoal).not.toHaveBeenCalled();
  });

  it("returns the active nutrition goal for the authenticated user", async () => {
    mocks.nutritionGoals.getActiveNutritionGoal.mockResolvedValue(
      nutritionGoal,
    );

    const response = await app.inject({
      method: "GET",
      url: "/api/nutrition-goals/active",
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toEqual(nutritionGoal);
    expect(mocks.nutritionGoals.getActiveNutritionGoal).toHaveBeenCalledWith(
      USER_ID,
    );
  });

  it("returns 404 when no active nutrition goal exists for the authenticated user", async () => {
    mocks.nutritionGoals.getActiveNutritionGoal.mockResolvedValue(null);

    const response = await app.inject({
      method: "GET",
      url: "/api/nutrition-goals/active",
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(404);
    expect(body.code).toBe("NUTRITION_GOAL_NOT_FOUND");
  });

  it("gets a nutrition goal by id for the authenticated user only", async () => {
    mocks.nutritionGoals.getNutritionGoalById.mockResolvedValue(nutritionGoal);

    const response = await app.inject({
      method: "GET",
      url: `/api/nutrition-goals/${NUTRITION_GOAL_ID}`,
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toEqual(nutritionGoal);
    expect(mocks.nutritionGoals.getNutritionGoalById).toHaveBeenCalledWith(
      NUTRITION_GOAL_ID,
      USER_ID,
    );
  });

  it("returns 404 when getting a nutrition goal outside the authenticated user scope", async () => {
    mocks.nutritionGoals.getNutritionGoalById.mockResolvedValue(null);

    const response = await app.inject({
      method: "GET",
      url: `/api/nutrition-goals/${NUTRITION_GOAL_ID}`,
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(404);
    expect(body.code).toBe("NUTRITION_GOAL_NOT_FOUND");
  });

  it("rejects invalid nutrition goal ids before calling the database", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/nutrition-goals/not-a-uuid",
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(mocks.nutritionGoals.getNutritionGoalById).not.toHaveBeenCalled();
  });

  it("updates a nutrition goal for the authenticated user only", async () => {
    const updatedGoal = {
      ...nutritionGoal,
      name: "Prise de masse",
    };
    mocks.nutritionGoals.updateNutritionGoal.mockResolvedValue(updatedGoal);

    const response = await app.inject({
      method: "PUT",
      url: `/api/nutrition-goals/${NUTRITION_GOAL_ID}`,
      headers: authHeaders(),
      payload: {
        name: updatedGoal.name,
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toEqual(updatedGoal);
    expect(mocks.nutritionGoals.updateNutritionGoal).toHaveBeenCalledWith(
      NUTRITION_GOAL_ID,
      USER_ID,
      { name: updatedGoal.name },
    );
  });

  it("returns 404 when updating a nutrition goal outside the authenticated user scope", async () => {
    mocks.nutritionGoals.updateNutritionGoal.mockResolvedValue(null);

    const response = await app.inject({
      method: "PUT",
      url: `/api/nutrition-goals/${NUTRITION_GOAL_ID}`,
      headers: authHeaders(),
      payload: {
        name: "Inaccessible",
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(404);
    expect(body.code).toBe("NUTRITION_GOAL_NOT_FOUND");
    expect(mocks.nutritionGoals.updateNutritionGoal).toHaveBeenCalledWith(
      NUTRITION_GOAL_ID,
      USER_ID,
      { name: "Inaccessible" },
    );
  });

  it("rejects invalid nutrition goal updates before calling the database", async () => {
    const response = await app.inject({
      method: "PUT",
      url: `/api/nutrition-goals/${NUTRITION_GOAL_ID}`,
      headers: authHeaders(),
      payload: {
        dailyCaloriesKcal: -1,
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(mocks.nutritionGoals.updateNutritionGoal).not.toHaveBeenCalled();
  });

  it("deletes a nutrition goal for the authenticated user only", async () => {
    mocks.nutritionGoals.deleteNutritionGoal.mockResolvedValue(true);

    const response = await app.inject({
      method: "DELETE",
      url: `/api/nutrition-goals/${NUTRITION_GOAL_ID}`,
      headers: authHeaders(),
    });

    expect(response.statusCode).toBe(204);
    expect(response.body).toBe("");
    expect(mocks.nutritionGoals.deleteNutritionGoal).toHaveBeenCalledWith(
      NUTRITION_GOAL_ID,
      USER_ID,
    );
  });

  it("returns 404 when deleting a nutrition goal outside the authenticated user scope", async () => {
    mocks.nutritionGoals.deleteNutritionGoal.mockResolvedValue(false);

    const response = await app.inject({
      method: "DELETE",
      url: `/api/nutrition-goals/${NUTRITION_GOAL_ID}`,
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(404);
    expect(body.code).toBe("NUTRITION_GOAL_NOT_FOUND");
    expect(mocks.nutritionGoals.deleteNutritionGoal).toHaveBeenCalledWith(
      NUTRITION_GOAL_ID,
      USER_ID,
    );
  });

  it("rejects invalid nutrition goal ids on delete before calling the database", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: "/api/nutrition-goals/not-a-uuid",
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(mocks.nutritionGoals.deleteNutritionGoal).not.toHaveBeenCalled();
  });

  it("lists user goals for the authenticated user only", async () => {
    mocks.userGoals.getUserGoals.mockResolvedValue([userGoal]);

    const response = await app.inject({
      method: "GET",
      url: "/api/user-goals",
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toEqual([userGoal]);
    expect(body.meta.total).toBe(1);
    expect(mocks.userGoals.getUserGoals).toHaveBeenCalledWith(USER_ID);
  });

  it("creates a body user goal for the authenticated user only", async () => {
    mocks.userGoals.createUserGoal.mockResolvedValue(userGoal);
    const payload = {
      domain: "BODY",
      exerciseId: null,
      metric: "BODY_WEIGHT_KG",
      direction: "AT_MOST",
      name: "Poids cible",
      targetValue: 80,
      startDate: "2026-05-04T00:00:00.000Z",
      endDate: null,
      isActive: true,
      notes: null,
    };

    const response = await app.inject({
      method: "POST",
      url: "/api/user-goals",
      headers: authHeaders(),
      payload,
    });
    const body = response.json();

    expect(response.statusCode).toBe(201);
    expect(body.data).toEqual(userGoal);
    expect(mocks.userGoals.createUserGoal).toHaveBeenCalledWith(
      USER_ID,
      payload,
    );
  });

  it("creates an exercise performance goal for the authenticated user only", async () => {
    const performanceGoal = {
      ...userGoal,
      domain: "SPORT",
      exerciseId: EXERCISE_ID,
      metric: "SPORT_EXERCISE_ONE_REP_MAX_KG",
      direction: "AT_LEAST",
      name: "Squat 1RM",
      targetValue: 120,
    };
    const payload = {
      domain: "SPORT",
      exerciseId: EXERCISE_ID,
      metric: "SPORT_EXERCISE_ONE_REP_MAX_KG",
      direction: "AT_LEAST",
      name: "Squat 1RM",
      targetValue: 120,
      startDate: "2026-05-04T00:00:00.000Z",
      endDate: null,
      isActive: true,
      notes: null,
    };
    mocks.userGoals.createUserGoal.mockResolvedValue(performanceGoal);

    const response = await app.inject({
      method: "POST",
      url: "/api/user-goals",
      headers: authHeaders(),
      payload,
    });
    const body = response.json();

    expect(response.statusCode).toBe(201);
    expect(body.data).toEqual(performanceGoal);
    expect(mocks.userGoals.createUserGoal).toHaveBeenCalledWith(
      USER_ID,
      payload,
    );
  });

  it("rejects exercise performance goals without exercise id", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/user-goals",
      headers: authHeaders(),
      payload: {
        domain: "SPORT",
        metric: "SPORT_EXERCISE_TEN_REP_MAX_KG",
        name: "Squat 10RM",
        targetValue: 90,
        startDate: "2026-05-04T00:00:00.000Z",
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expectValidationError(body);
    expect(mocks.userGoals.createUserGoal).not.toHaveBeenCalled();
  });

  it("rejects a user goal metric that does not match its domain", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/user-goals",
      headers: authHeaders(),
      payload: {
        domain: "SPORT",
        metric: "BODY_WEIGHT_KG",
        name: "Incoherent",
        targetValue: 80,
        startDate: "2026-05-04T00:00:00.000Z",
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expectValidationError(body);
    expect(mocks.userGoals.createUserGoal).not.toHaveBeenCalled();
  });

  it("rejects listing body measurements without a token", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/body-measurements",
    });
    const body = response.json();

    expect(response.statusCode).toBe(401);
    expect(body.code).toBe("UNAUTHORIZED");
    expect(mocks.bodyMeasurements.getBodyMeasurements).not.toHaveBeenCalled();
  });

  it("lists body measurements for the authenticated user only", async () => {
    mocks.bodyMeasurements.getBodyMeasurements.mockResolvedValue([
      bodyMeasurement,
    ]);

    const response = await app.inject({
      method: "GET",
      url: "/api/body-measurements",
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toEqual([bodyMeasurement]);
    expect(body.meta.total).toBe(1);
    expect(mocks.bodyMeasurements.getBodyMeasurements).toHaveBeenCalledWith(
      USER_ID,
    );
  });

  it("creates a body measurement for the authenticated user", async () => {
    const payload = {
      date: bodyMeasurement.date,
      silhouette: bodyMeasurement.silhouette,
      weightKg: bodyMeasurement.weightKg,
      heightCm: bodyMeasurement.heightCm,
      waistCm: bodyMeasurement.waistCm,
      notes: bodyMeasurement.notes,
    };
    mocks.bodyMeasurements.createBodyMeasurement.mockResolvedValue(
      bodyMeasurement,
    );

    const response = await app.inject({
      method: "POST",
      url: "/api/body-measurements",
      headers: authHeaders(),
      payload,
    });
    const body = response.json();

    expect(response.statusCode).toBe(201);
    expect(body.data).toEqual(bodyMeasurement);
    expect(mocks.bodyMeasurements.createBodyMeasurement).toHaveBeenCalledWith(
      USER_ID,
      payload,
    );
  });

  it("rejects invalid body measurement creation before calling the database", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/body-measurements",
      headers: authHeaders(),
      payload: {
        date: "not-a-date",
        weightKg: -1,
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(mocks.bodyMeasurements.createBodyMeasurement).not.toHaveBeenCalled();
  });

  it("returns the latest body measurement for the authenticated user", async () => {
    mocks.bodyMeasurements.getLatestBodyMeasurement.mockResolvedValue(
      bodyMeasurement,
    );

    const response = await app.inject({
      method: "GET",
      url: "/api/body-measurements/latest",
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toEqual(bodyMeasurement);
    expect(
      mocks.bodyMeasurements.getLatestBodyMeasurement,
    ).toHaveBeenCalledWith(USER_ID);
  });

  it("gets a body measurement by id for the authenticated user only", async () => {
    mocks.bodyMeasurements.getBodyMeasurementById.mockResolvedValue(
      bodyMeasurement,
    );

    const response = await app.inject({
      method: "GET",
      url: `/api/body-measurements/${BODY_MEASUREMENT_ID}`,
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toEqual(bodyMeasurement);
    expect(mocks.bodyMeasurements.getBodyMeasurementById).toHaveBeenCalledWith(
      BODY_MEASUREMENT_ID,
      USER_ID,
    );
  });

  it("updates a body measurement for the authenticated user only", async () => {
    const updatedMeasurement = {
      ...bodyMeasurement,
      weightKg: 81.8,
    };
    mocks.bodyMeasurements.updateBodyMeasurement.mockResolvedValue(
      updatedMeasurement,
    );

    const response = await app.inject({
      method: "PUT",
      url: `/api/body-measurements/${BODY_MEASUREMENT_ID}`,
      headers: authHeaders(),
      payload: {
        weightKg: updatedMeasurement.weightKg,
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.data).toEqual(updatedMeasurement);
    expect(mocks.bodyMeasurements.updateBodyMeasurement).toHaveBeenCalledWith(
      BODY_MEASUREMENT_ID,
      USER_ID,
      { weightKg: updatedMeasurement.weightKg },
    );
  });

  it("deletes a body measurement for the authenticated user only", async () => {
    mocks.bodyMeasurements.deleteBodyMeasurement.mockResolvedValue(true);

    const response = await app.inject({
      method: "DELETE",
      url: `/api/body-measurements/${BODY_MEASUREMENT_ID}`,
      headers: authHeaders(),
    });

    expect(response.statusCode).toBe(204);
    expect(response.body).toBe("");
    expect(mocks.bodyMeasurements.deleteBodyMeasurement).toHaveBeenCalledWith(
      BODY_MEASUREMENT_ID,
      USER_ID,
    );
  });

  it("rejects invalid body measurement ids before calling the database", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/body-measurements/not-a-uuid",
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(
      mocks.bodyMeasurements.getBodyMeasurementById,
    ).not.toHaveBeenCalled();
  });

  it("rejects invalid bearer tokens before calling protected queries", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/meals",
      headers: invalidAuthHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(401);
    expectErrorShape(body, "UNAUTHORIZED");
    expect(mocks.meals.getMeals).not.toHaveBeenCalled();
  });

  it("returns validation details and skips queries for invalid payloads", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/nutrition-goals",
      headers: authHeaders(),
      payload: {
        name: "",
        startDate: "2026-05-04T00:00:00.000Z",
        endDate: "2026-05-03T00:00:00.000Z",
        dailyCaloriesKcal: -1,
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expectValidationError(body);
    expect(mocks.nutritionGoals.createNutritionGoal).not.toHaveBeenCalled();
  });

  it.each([
    {
      name: "users",
      method: "GET" as const,
      url: "/api/users/me",
      mock: mocks.users.getUserById,
    },
    {
      name: "exercises",
      method: "GET" as const,
      url: "/api/exercises",
      mock: mocks.exercises.getExercises,
    },
    {
      name: "workouts",
      method: "GET" as const,
      url: "/api/workouts",
      mock: mocks.workouts.getWorkouts,
    },
    {
      name: "workout templates",
      method: "GET" as const,
      url: "/api/workout-templates",
      mock: mocks.workoutTemplates.getWorkoutTemplates,
    },
    {
      name: "foods",
      method: "GET" as const,
      url: "/api/foods",
      mock: mocks.foods.getFoods,
    },
    {
      name: "meals",
      method: "GET" as const,
      url: "/api/meals",
      mock: mocks.meals.getMeals,
    },
    {
      name: "nutrition goals",
      method: "GET" as const,
      url: "/api/nutrition-goals",
      mock: mocks.nutritionGoals.getNutritionGoals,
    },
    {
      name: "user goals",
      method: "GET" as const,
      url: "/api/user-goals",
      mock: mocks.userGoals.getUserGoals,
    },
    {
      name: "body measurements",
      method: "GET" as const,
      url: "/api/body-measurements",
      mock: mocks.bodyMeasurements.getBodyMeasurements,
    },
  ])(
    "returns a standard 500 response for $name query failures",
    async (testCase) => {
      testCase.mock.mockRejectedValueOnce(new Error("database unavailable"));

      const response = await app.inject({
        method: testCase.method,
        url: testCase.url,
        headers: authHeaders(),
      });
      const body = response.json();

      expect(response.statusCode).toBe(500);
      expectErrorShape(body, "INTERNAL_SERVER_ERROR");
      expect(testCase.mock).toHaveBeenCalledTimes(1);
    },
  );
});
