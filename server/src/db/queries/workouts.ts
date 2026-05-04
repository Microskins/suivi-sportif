// filepath: server/src/db/queries/workouts.ts
// Workout database queries - NEVER write SQL directly in routes

import type {
  Exercise,
  Workout,
  WorkoutExercise,
  WorkoutSet,
} from "@prisma/client";
import prisma from "../index.js";
import type {
  CreateWorkoutInput,
  UpdateWorkoutInput,
  WorkoutResponse,
} from "../../schemas/index.js";

type WorkoutWithDetails = Workout & {
  workoutExercises?: Array<
    WorkoutExercise & {
      exercise: Exercise;
      sets: WorkoutSet[];
    }
  >;
};

const workoutDetailsInclude = {
  workoutExercises: {
    orderBy: { order: "asc" as const },
    include: {
      exercise: true,
      sets: {
        orderBy: { setNumber: "asc" as const },
      },
    },
  },
};

function formatWorkout(workout: WorkoutWithDetails): WorkoutResponse {
  return {
    id: workout.id,
    userId: workout.userId,
    name: workout.name,
    date: workout.date.toISOString(),
    duration: workout.duration,
    notes: workout.notes,
    createdAt: workout.createdAt.toISOString(),
    updatedAt: workout.updatedAt.toISOString(),
    exercises: workout.workoutExercises?.map((workoutExercise) => ({
      id: workoutExercise.id,
      exerciseId: workoutExercise.exerciseId,
      order: workoutExercise.order,
      exercise: {
        ...workoutExercise.exercise,
        createdAt: workoutExercise.exercise.createdAt.toISOString(),
        updatedAt: workoutExercise.exercise.updatedAt.toISOString(),
      },
      sets: workoutExercise.sets.map((set) => ({
        id: set.id,
        setNumber: set.setNumber,
        reps: set.reps,
        weight: Number(set.weight),
        rest: set.rest,
        createdAt: set.createdAt.toISOString(),
      })),
    })),
  };
}

export async function getWorkouts(userId: string): Promise<WorkoutResponse[]> {
  const workouts = await prisma.workout.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    include: workoutDetailsInclude,
  });
  return workouts.map(formatWorkout);
}

export async function getWorkoutById(
  id: string,
  userId: string,
): Promise<WorkoutResponse | null> {
  const workout = await prisma.workout.findFirst({
    where: { id, userId },
    include: workoutDetailsInclude,
  });
  if (!workout) return null;
  return formatWorkout(workout);
}

export async function getWorkoutsByDateRange(
  userId: string,
  start: string,
  end: string,
): Promise<WorkoutResponse[]> {
  const workouts = await prisma.workout.findMany({
    where: {
      userId,
      date: {
        gte: new Date(start),
        lte: new Date(end),
      },
    },
    orderBy: { date: "desc" },
    include: workoutDetailsInclude,
  });
  return workouts.map(formatWorkout);
}

export async function createWorkout(
  userId: string,
  data: CreateWorkoutInput,
): Promise<WorkoutResponse> {
  const workout = await prisma.workout.create({
    data: {
      userId,
      name: data.name,
      date: new Date(data.date),
      duration: data.duration,
      notes: data.notes,
      workoutExercises: data.exercises
        ? {
            create: data.exercises.map((exercise, exerciseIndex) => ({
              exerciseId: exercise.exerciseId,
              order: exerciseIndex,
              sets: {
                create: exercise.sets.map((set, setIndex) => ({
                  setNumber: setIndex + 1,
                  reps: set.reps,
                  weight: set.weight,
                  rest: set.rest,
                })),
              },
            })),
          }
        : undefined,
    },
    include: workoutDetailsInclude,
  });
  return formatWorkout(workout);
}

export async function updateWorkout(
  id: string,
  userId: string,
  data: UpdateWorkoutInput,
): Promise<WorkoutResponse | null> {
  const existing = await prisma.workout.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) return null;

  const workout = await prisma.workout.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.date && { date: new Date(data.date) }),
      ...(data.duration && { duration: data.duration }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
    include: workoutDetailsInclude,
  });
  return formatWorkout(workout);
}

export async function deleteWorkout(
  id: string,
  userId: string,
): Promise<boolean> {
  try {
    const existing = await prisma.workout.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) return false;

    await prisma.workout.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
