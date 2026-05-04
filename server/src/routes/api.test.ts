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
}));

vi.mock("../db/queries/users.js", () => mocks.users);
vi.mock("../db/queries/exercises.js", () => mocks.exercises);
vi.mock("../db/queries/workouts.js", () => mocks.workouts);

const USER_ID = "11111111-1111-4111-8111-111111111111";
const EXERCISE_ID = "22222222-2222-4222-8222-222222222222";
const WORKOUT_ID = "33333333-3333-4333-8333-333333333333";

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
  muscleGroup: "legs",
  equipment: "barbell",
  difficulty: "intermediate",
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

describe("API", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = buildApp({ logger: false });
    await app.ready();
  });

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
    const pathKeys = Object.keys(body.paths ?? {});
    expect(pathKeys.length).toBeGreaterThan(0);
    expect(pathKeys.some((key) => key.startsWith("/api/users/login"))).toBe(
      true,
    );
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

  it("rejects invalid muscle groups before calling the database", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/exercises/muscle/invalid-group",
      headers: authHeaders(),
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(mocks.exercises.getExercisesByMuscleGroup).not.toHaveBeenCalled();
  });

  it("creates an exercise from a valid payload", async () => {
    mocks.exercises.createExercise.mockResolvedValue(exercise);

    const payload = {
      name: exercise.name,
      description: exercise.description,
      muscleGroup: exercise.muscleGroup,
      equipment: exercise.equipment,
      difficulty: exercise.difficulty,
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
        muscleGroup: "invalid-group",
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
});
