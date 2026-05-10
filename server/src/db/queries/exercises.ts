// filepath: server/src/db/queries/exercises.ts
// Exercise database queries - NEVER write SQL directly in routes

import prisma from "../index.js";
import type {
  CreateExerciseInput,
  UpdateExerciseInput,
  ExerciseResponse,
} from "../../schemas/index.js";

type ExerciseRecord = Omit<ExerciseResponse, "createdAt" | "updatedAt"> & {
  createdAt: Date;
  updatedAt: Date;
};

function formatExercise(e: ExerciseRecord): ExerciseResponse {
  return {
    ...e,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  };
}

export async function getExercises(): Promise<ExerciseResponse[]> {
  const exercises = await prisma.exercise.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      difficulty: true,
      exerciseType: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return (exercises as ExerciseRecord[]).map(formatExercise);
}

export async function getExerciseById(
  id: string,
): Promise<ExerciseResponse | null> {
  const exercise = await prisma.exercise.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      difficulty: true,
      exerciseType: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!exercise) return null;
  return formatExercise(exercise as ExerciseRecord);
}

export async function getExercisesByMuscleGroup(
  muscleGroup: string,
): Promise<ExerciseResponse[]> {
  // NOTE: muscleGroup n'existe plus sur Exercise : désormais c'est une relation via ExerciseMuscle.
  const exercises = await prisma.exercise.findMany({
    where: {
      muscles: {
        some: {
          muscle: {
            name: muscleGroup,
          },
        },
      },
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      difficulty: true,
      exerciseType: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return (exercises as ExerciseRecord[]).map(formatExercise);
}

export async function createExercise(
  data: CreateExerciseInput,
): Promise<ExerciseResponse> {
  const exercise = await prisma.exercise.create({
    data: {
      name: data.name,
      description: data.description,
      difficulty: data.difficulty,
      // exerciseType est requis côté Prisma (default), mais on le passe si disponible dans le schema Zod.
      ...("exerciseType" in data && data.exerciseType
        ? { exerciseType: data.exerciseType }
        : {}),
    },
    select: {
      id: true,
      name: true,
      description: true,
      difficulty: true,
      exerciseType: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return formatExercise(exercise as ExerciseRecord);
}

export async function updateExercise(
  id: string,
  data: UpdateExerciseInput,
): Promise<ExerciseResponse | null> {
  const existing = await prisma.exercise.findUnique({ where: { id } });
  if (!existing) return null;

  const exercise = await prisma.exercise.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.difficulty && { difficulty: data.difficulty }),
      ...("exerciseType" in data && data.exerciseType
        ? { exerciseType: data.exerciseType }
        : {}),
    },
    select: {
      id: true,
      name: true,
      description: true,
      difficulty: true,
      exerciseType: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return formatExercise(exercise as ExerciseRecord);
}

export async function deleteExercise(id: string): Promise<boolean> {
  try {
    await prisma.exercise.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
