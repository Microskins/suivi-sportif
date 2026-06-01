// filepath: server/src/db/queries/workouts.ts
// Workout database queries - NEVER write SQL directly in routes

import prisma from "../index.js";
import type {
  CreateWorkoutInput,
  UpdateWorkoutInput,
  WorkoutResponse,
} from "../../schemas/index.js";

type WorkoutWithDetails = Workout & {
  workoutExercises?: Array<
    WorkoutExercise & {
      // NOTE: le modèle Exercise a évolué (tables de jonction equipment/muscles/etc.).
      // Ici on ne sérialise que les champs scalaires réellement retournés par l'API.
      exercise: {
        id: string;
        name: string;
        description: string | null;
        difficulty: string;
        exerciseType: string;
        createdAt: Date;
        updatedAt: Date;
      };
      sets: WorkoutSet[];
    }
  >;
};

type Workout = {
  createdAt: Date;
  date: Date;
  duration: number;
  id: string;
  name: string;
  notes: string | null;
  status: "PLANNED" | "COMPLETED" | "CANCELED";
  updatedAt: Date;
  userId: string;
};

type WorkoutExercise = {
  exerciseId: string;
  id: string;
  order: number;
};

type WorkoutSet = {
  avgKmh: unknown;
  createdAt: Date;
  durationMinutes: unknown;
  id: string;
  inclinePercent: unknown;
  reps: number;
  rest: number;
  rpe: unknown;
  rir: number | null;
  setNumber: number;
  weight: unknown;
};

type ExerciseType = "STRENGTH" | "CARDIO" | "MOBILITY";

export class WorkoutValidationError extends Error {
  details: Array<{ path: string; message: string }>;

  constructor(details: Array<{ path: string; message: string }>) {
    super("Validation failed");
    this.name = "WorkoutValidationError";
    this.details = details;
  }
}

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
    status: workout.status,
    duration: workout.duration,
    notes: workout.notes,
    createdAt: workout.createdAt.toISOString(),
    updatedAt: workout.updatedAt.toISOString(),
    exercises: workout.workoutExercises?.map((workoutExercise) => ({
      id: workoutExercise.id,
      exerciseId: workoutExercise.exerciseId,
      order: workoutExercise.order,
      exercise: workoutExercise.exercise
        ? {
            id: workoutExercise.exercise.id,
            name: workoutExercise.exercise.name,
            description: workoutExercise.exercise.description,
            difficulty: String(workoutExercise.exercise.difficulty),
            exerciseType: String(workoutExercise.exercise.exerciseType),
            createdAt: workoutExercise.exercise.createdAt.toISOString(),
            updatedAt: workoutExercise.exercise.updatedAt.toISOString(),
          }
        : undefined,
      sets: workoutExercise.sets.map((set) => ({
        id: set.id,
        setNumber: set.setNumber,
        reps: set.reps,
        weight: Number(set.weight),
        durationMinutes:
          set.durationMinutes === null ? null : Number(set.durationMinutes),
        avgKmh: set.avgKmh === null ? null : Number(set.avgKmh),
        inclinePercent:
          set.inclinePercent === null ? null : Number(set.inclinePercent),
        rpe: set.rpe === null || set.rpe === undefined ? null : Number(set.rpe),
        rir: set.rir,
        rest: set.rest,
        createdAt: set.createdAt.toISOString(),
      })),
    })),
  };
}

async function getExerciseTypeMap(exerciseIds: string[]): Promise<Map<string, ExerciseType>> {
  const uniqueExerciseIds = Array.from(new Set(exerciseIds));
  const exercises = await prisma.exercise.findMany({
    where: { id: { in: uniqueExerciseIds } },
    select: { id: true, exerciseType: true },
  });

  return new Map(
    exercises.map((exercise: { id: string; exerciseType: unknown }) => [
      exercise.id,
      String(exercise.exerciseType) as ExerciseType,
    ]),
  );
}

async function validateWorkoutExerciseSets(exercises: NonNullable<CreateWorkoutInput["exercises"]>) {
  const exerciseTypeMap = await getExerciseTypeMap(
    exercises.map((exercise) => exercise.exerciseId),
  );
  const details: Array<{ path: string; message: string }> = [];

  exercises.forEach((exercise, exerciseIndex) => {
    const type = exerciseTypeMap.get(exercise.exerciseId);
    if (!type) {
      details.push({
        path: `exercises.${exerciseIndex}.exerciseId`,
        message: "Exercice introuvable",
      });
      return;
    }

    exercise.sets.forEach((set, setIndex) => {
      if (type === "CARDIO") {
        if (set.durationMinutes === undefined || set.durationMinutes === null) {
          details.push({
            path: `exercises.${exerciseIndex}.sets.${setIndex}.durationMinutes`,
            message: "durationMinutes est requis pour un exercice cardio",
          });
        }
        if (set.avgKmh === undefined || set.avgKmh === null) {
          details.push({
            path: `exercises.${exerciseIndex}.sets.${setIndex}.avgKmh`,
            message: "avgKmh est requis pour un exercice cardio",
          });
        }
      } else {
        if (set.reps === undefined) {
          details.push({
            path: `exercises.${exerciseIndex}.sets.${setIndex}.reps`,
            message: "reps est requis pour un exercice non cardio",
          });
        }
        if (set.weight === undefined) {
          details.push({
            path: `exercises.${exerciseIndex}.sets.${setIndex}.weight`,
            message: "weight est requis pour un exercice non cardio",
          });
        }
      }
    });
  });

  if (details.length > 0) {
    throw new WorkoutValidationError(details);
  }
}

function inferStatusFromDate(dateIso: string): "PLANNED" | "COMPLETED" {
  return new Date(dateIso).getTime() > Date.now() ? "PLANNED" : "COMPLETED";
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
  if (data.exercises?.length) {
    await validateWorkoutExerciseSets(data.exercises);
  }

  const status = data.status ?? inferStatusFromDate(data.date);
  const workout = await prisma.workout.create({
    data: {
      userId,
      name: data.name,
      date: new Date(data.date),
      status,
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
                  reps: set.reps ?? 0,
                  weight: set.weight ?? 0,
                  durationMinutes: set.durationMinutes ?? null,
                  avgKmh: set.avgKmh ?? null,
                  inclinePercent: set.inclinePercent ?? null,
                  rpe: set.rpe ?? null,
                  rir: set.rir ?? null,
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

  if (!data.exercises) {
    const nextStatus =
      data.status ??
      (data.date ? inferStatusFromDate(data.date) : undefined);
    const workout = await prisma.workout.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.date && { date: new Date(data.date) }),
        ...(nextStatus && { status: nextStatus }),
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: workoutDetailsInclude,
    });

    return formatWorkout(workout);
  }

  const exercises = data.exercises;
  await validateWorkoutExerciseSets(exercises);
  const nextStatus =
    data.status ??
    (data.date ? inferStatusFromDate(data.date) : undefined);

  const workout = await prisma.$transaction(async (tx: any) => {
    await tx.workoutExercise.deleteMany({ where: { workoutId: id } });

    return tx.workout.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.date && { date: new Date(data.date) }),
        ...(nextStatus && { status: nextStatus }),
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.notes !== undefined && { notes: data.notes }),
        workoutExercises: {
          create: exercises.map((exercise, exerciseIndex) => ({
            exerciseId: exercise.exerciseId,
            order: exerciseIndex,
            sets: {
              create: exercise.sets.map((set, setIndex) => ({
                setNumber: setIndex + 1,
                reps: set.reps ?? 0,
                weight: set.weight ?? 0,
                durationMinutes: set.durationMinutes ?? null,
                avgKmh: set.avgKmh ?? null,
                inclinePercent: set.inclinePercent ?? null,
                rpe: set.rpe ?? null,
                rir: set.rir ?? null,
                rest: set.rest,
              })),
            },
          })),
        },
      },
      include: workoutDetailsInclude,
    });
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
