// filepath: server/src/db/queries/exercises.ts
// Exercise database queries - NEVER write SQL directly in routes

import prisma from "../index.js";
import type {
  CreateExerciseInput,
  UpdateExerciseInput,
  ExerciseResponse,
} from "../../schemas/index.js";

type ExerciseRecord = Omit<ExerciseResponse, "createdAt" | "updatedAt"> & {
  bodyParts?: string[];
  createdAt: Date;
  updatedAt: Date;
};

type ExerciseMuscleRow = {
  muscle: {
    name: string;
  };
};

type ExerciseRowWithMuscles = {
  id: string;
  name: string;
  description: string | null;
  difficulty: string;
  exerciseType: string;
  muscles: ExerciseMuscleRow[];
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

// `pagination` est optionnel : les routes le passent toujours, les services
// internes (assistant) l'omettent car ils ont besoin du catalogue complet
// pour faire du rapprochement par nom.
export async function getExercises(
  pagination?: { skip: number; take: number },
): Promise<{ items: ExerciseResponse[]; total: number }> {
  const [exercises, total] = await Promise.all([
    prisma.exercise.findMany({
      orderBy: { name: "asc" },
      ...(pagination ? { skip: pagination.skip, take: pagination.take } : {}),
      select: {
        id: true,
        name: true,
        description: true,
        difficulty: true,
        exerciseType: true,
        muscles: {
          select: {
            muscle: {
              select: { name: true },
            },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.exercise.count(),
  ]);
  return {
    items: exercises.map((exercise: ExerciseRowWithMuscles) =>
      formatExercise({
        ...exercise,
        bodyParts: exercise.muscles.map((item: ExerciseMuscleRow) => item.muscle.name),
      } as ExerciseRecord),
    ),
    total,
  };
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
      muscles: {
        select: {
          muscle: {
            select: { name: true },
          },
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!exercise) return null;
  return formatExercise({
    ...exercise,
    bodyParts: exercise.muscles.map((item: ExerciseMuscleRow) => item.muscle.name),
  } as ExerciseRecord);
}

export async function getExercisesByMuscleGroup(
  muscleGroup: string,
  pagination: { skip: number; take: number },
): Promise<{ items: ExerciseResponse[]; total: number }> {
  // NOTE: muscleGroup n'existe plus sur Exercise : désormais c'est une relation via ExerciseMuscle.
  const where = {
    muscles: {
      some: {
        muscle: {
          name: muscleGroup,
        },
      },
    },
  };
  const [exercises, total] = await Promise.all([
    prisma.exercise.findMany({
      where,
      orderBy: { name: "asc" },
      skip: pagination.skip,
      take: pagination.take,
      select: {
        id: true,
        name: true,
        description: true,
        difficulty: true,
        exerciseType: true,
        muscles: {
          select: {
            muscle: {
              select: { name: true },
            },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.exercise.count({ where }),
  ]);
  return {
    items: exercises.map((exercise: ExerciseRowWithMuscles) =>
      formatExercise({
        ...exercise,
        bodyParts: exercise.muscles.map((item: ExerciseMuscleRow) => item.muscle.name),
      } as ExerciseRecord),
    ),
    total,
  };
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
      ...(data.bodyParts
        ? {
            muscles: {
              create: data.bodyParts.map((name) => ({
                role: "PRIMARY" as const,
                muscle: {
                  connectOrCreate: {
                    where: { name },
                    create: { name },
                  },
                },
              })),
            },
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      description: true,
      difficulty: true,
      exerciseType: true,
      muscles: {
        select: {
          muscle: {
            select: { name: true },
          },
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });
  return formatExercise({
    ...exercise,
    bodyParts: exercise.muscles.map((item: ExerciseMuscleRow) => item.muscle.name),
  } as ExerciseRecord);
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
      ...(data.bodyParts
        ? {
            muscles: {
              deleteMany: {},
              create: data.bodyParts.map((name) => ({
                role: "PRIMARY" as const,
                muscle: {
                  connectOrCreate: {
                    where: { name },
                    create: { name },
                  },
                },
              })),
            },
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      description: true,
      difficulty: true,
      exerciseType: true,
      muscles: {
        select: {
          muscle: {
            select: { name: true },
          },
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });
  return formatExercise({
    ...exercise,
    bodyParts: exercise.muscles.map((item: ExerciseMuscleRow) => item.muscle.name),
  } as ExerciseRecord);
}

export async function deleteExercise(id: string): Promise<boolean> {
  try {
    await prisma.exercise.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
