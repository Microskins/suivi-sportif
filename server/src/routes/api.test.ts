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
});
