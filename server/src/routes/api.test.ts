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
    getWorkouts: vi.fn(),
    getWorkoutById: vi.fn(),
    getWorkoutsByDateRange: vi.fn(),
    createWorkout: vi.fn(),
    updateWorkout: vi.fn(),
    deleteWorkout: vi.fn(),
  },
  foods: {
    getFoods: vi.fn(),
    getFoodById: vi.fn(),
    createFood: vi.fn(),
    updateFood: vi.fn(),
    deleteFood: vi.fn(),
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
}));

vi.mock("../db/queries/users.js", () => mocks.users);
vi.mock("../db/queries/exercises.js", () => mocks.exercises);
vi.mock("../db/queries/workouts.js", () => mocks.workouts);
vi.mock("../db/queries/foods.js", () => mocks.foods);
vi.mock("../db/queries/meals.js", () => mocks.meals);
vi.mock("../db/queries/nutrition-goals.js", () => mocks.nutritionGoals);

const USER_ID = "11111111-1111-4111-8111-111111111111";
const EXERCISE_ID = "22222222-2222-4222-8222-222222222222";
const WORKOUT_ID = "33333333-3333-4333-8333-333333333333";
const FOOD_ID = "44444444-4444-4444-8444-444444444444";
const MEAL_ID = "55555555-5555-4555-8555-555555555555";
const NUTRITION_GOAL_ID = "66666666-6666-4666-8666-666666666666";

const user = {
  id: USER_ID,
  email: "test@example.com",
  name: "Test User",
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
  duration: 60,
  notes: null,
  createdAt: "2026-05-04T10:00:00.000Z",
  updatedAt: "2026-05-04T10:00:00.000Z",
  exercises: [],
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

describe("API", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = buildApp({ logger: false });
    await app.ready();
  }, 30000);

  afterEach(async () => {
    await app.close();
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

  it("serves swagger UI", async () => {
    const response = await app.inject({ method: "GET", url: "/docs/" });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("./static/index.html");
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
      "/api/foods",
      "/api/foods/{id}",
      "/api/meals",
      "/api/meals/{id}",
      "/api/nutrition-goals",
      "/api/nutrition-goals/{id}",
      "/api/nutrition-goals/active",
    ]) {
      expect(openApiPath(paths, path), path).toBeDefined();
    }

    expect(openApiPath(paths, "/api/meals").get.tags).toContain("meals");
    expect(openApiPath(paths, "/api/nutrition-goals").get.tags).toContain(
      "nutrition-goals",
    );
    expect(openApiPath(paths, "/api/meals").get.security).toEqual([
      { bearerAuth: [] },
    ]);
    expect(openApiPath(paths, "/api/nutrition-goals").post.security).toEqual([
      { bearerAuth: [] },
    ]);
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
  ])("returns a standard 500 response for $name query failures", async (testCase) => {
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
  });
});
