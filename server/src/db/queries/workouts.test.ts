import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createWorkout,
  deleteWorkout,
  getWorkoutById,
  getWorkouts,
  updateWorkout,
} from "./workouts.js";

const mocks = vi.hoisted(() => ({
  prisma: {
    workout: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("../index.js", () => ({
  default: mocks.prisma,
}));

const USER_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_USER_ID = "99999999-9999-4999-8999-999999999999";
const WORKOUT_ID = "33333333-3333-4333-8333-333333333333";
const EXERCISE_ID = "22222222-2222-4222-8222-222222222222";
const WORKOUT_EXERCISE_ID = "44444444-4444-4444-8444-444444444444";
const SET_ID = "55555555-5555-4555-8555-555555555555";
const CREATED_AT = new Date("2026-05-04T10:00:00.000Z");
const UPDATED_AT = new Date("2026-05-04T10:30:00.000Z");

const workoutRecord = {
  id: WORKOUT_ID,
  userId: USER_ID,
  name: "Séance jambes",
  date: CREATED_AT,
  duration: 60,
  notes: null,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
  workoutExercises: [
    {
      id: WORKOUT_EXERCISE_ID,
      workoutId: WORKOUT_ID,
      exerciseId: EXERCISE_ID,
      order: 0,
      exercise: {
        id: EXERCISE_ID,
        name: "Squat",
        description: null,
        muscleGroup: "legs",
        equipment: "barbell",
        difficulty: "intermediate",
        createdAt: CREATED_AT,
        updatedAt: UPDATED_AT,
      },
      sets: [
        {
          id: SET_ID,
          workoutExerciseId: WORKOUT_EXERCISE_ID,
          setNumber: 1,
          reps: 10,
          weight: 80,
          rest: 90,
          createdAt: CREATED_AT,
        },
      ],
    },
  ],
};

describe("workout queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists workouts scoped to a user and formats nested exercise sets", async () => {
    mocks.prisma.workout.findMany.mockResolvedValue([workoutRecord]);

    const result = await getWorkouts(USER_ID);

    expect(mocks.prisma.workout.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: USER_ID },
        orderBy: { date: "desc" },
      }),
    );
    expect(result).toEqual([
      {
        id: WORKOUT_ID,
        userId: USER_ID,
        name: "Séance jambes",
        date: CREATED_AT.toISOString(),
        duration: 60,
        notes: null,
        createdAt: CREATED_AT.toISOString(),
        updatedAt: UPDATED_AT.toISOString(),
        exercises: [
          {
            id: WORKOUT_EXERCISE_ID,
            exerciseId: EXERCISE_ID,
            order: 0,
            exercise: {
              id: EXERCISE_ID,
              name: "Squat",
              description: null,
              muscleGroup: "legs",
              equipment: "barbell",
              difficulty: "intermediate",
              createdAt: CREATED_AT.toISOString(),
              updatedAt: UPDATED_AT.toISOString(),
            },
            sets: [
              {
                id: SET_ID,
                setNumber: 1,
                reps: 10,
                weight: 80,
                rest: 90,
                createdAt: CREATED_AT.toISOString(),
              },
            ],
          },
        ],
      },
    ]);
  });

  it("gets one workout with both id and user ownership filters", async () => {
    mocks.prisma.workout.findFirst.mockResolvedValue(workoutRecord);

    const result = await getWorkoutById(WORKOUT_ID, USER_ID);

    expect(mocks.prisma.workout.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: WORKOUT_ID, userId: USER_ID },
      }),
    );
    expect(result?.id).toBe(WORKOUT_ID);
  });

  it("creates nested workout exercises and sets", async () => {
    mocks.prisma.workout.create.mockResolvedValue(workoutRecord);

    const payload = {
      name: "Séance jambes",
      date: CREATED_AT.toISOString(),
      duration: 60,
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

    const result = await createWorkout(USER_ID, payload);

    expect(mocks.prisma.workout.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: USER_ID,
          workoutExercises: {
            create: [
              {
                exerciseId: EXERCISE_ID,
                order: 0,
                sets: {
                  create: [
                    {
                      setNumber: 1,
                      reps: 10,
                      weight: 80,
                      rest: 90,
                    },
                  ],
                },
              },
            ],
          },
        }),
      }),
    );
    expect(result.exercises?.[0].sets[0].weight).toBe(80);
  });

  it("does not update a workout owned by another user", async () => {
    mocks.prisma.workout.findUnique.mockResolvedValue({
      ...workoutRecord,
      userId: OTHER_USER_ID,
    });

    const result = await updateWorkout(WORKOUT_ID, USER_ID, {
      name: "Séance interdite",
    });

    expect(result).toBeNull();
    expect(mocks.prisma.workout.update).not.toHaveBeenCalled();
  });

  it("does not delete a workout owned by another user", async () => {
    mocks.prisma.workout.findUnique.mockResolvedValue({
      ...workoutRecord,
      userId: OTHER_USER_ID,
    });

    const result = await deleteWorkout(WORKOUT_ID, USER_ID);

    expect(result).toBe(false);
    expect(mocks.prisma.workout.delete).not.toHaveBeenCalled();
  });
});
