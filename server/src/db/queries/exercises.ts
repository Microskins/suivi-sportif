// filepath: server/src/db/queries/exercises.ts
// Exercise database queries - NEVER write SQL directly in routes

import prisma from '../index.js';
import type { CreateExerciseInput, UpdateExerciseInput, ExerciseResponse } from '../../schemas/index.js';

export async function getExercises(): Promise<ExerciseResponse[]> {
  const exercises = await prisma.exercise.findMany({
    orderBy: { name: 'asc' },
  });
  return exercises.map(e => ({
    ...e,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }));
}

export async function getExerciseById(id: string): Promise<ExerciseResponse | null> {
  const exercise = await prisma.exercise.findUnique({
    where: { id },
  });
  if (!exercise) return null;
  return {
    ...exercise,
    createdAt: exercise.createdAt.toISOString(),
    updatedAt: exercise.updatedAt.toISOString(),
  };
}

export async function getExercisesByMuscleGroup(muscleGroup: string): Promise<ExerciseResponse[]> {
  const exercises = await prisma.exercise.findMany({
    where: { muscleGroup },
    orderBy: { name: 'asc' },
  });
  return exercises.map(e => ({
    ...e,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }));
}

export async function createExercise(data: CreateExerciseInput): Promise<ExerciseResponse> {
  const exercise = await prisma.exercise.create({
    data: {
      name: data.name,
      description: data.description,
      muscleGroup: data.muscleGroup,
      equipment: data.equipment,
      difficulty: data.difficulty,
    },
  });
  return {
    ...exercise,
    createdAt: exercise.createdAt.toISOString(),
    updatedAt: exercise.updatedAt.toISOString(),
  };
}

export async function updateExercise(id: string, data: UpdateExerciseInput): Promise<ExerciseResponse | null> {
  const existing = await prisma.exercise.findUnique({ where: { id } });
  if (!existing) return null;
  
  const exercise = await prisma.exercise.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.muscleGroup && { muscleGroup: data.muscleGroup }),
      ...(data.equipment && { equipment: data.equipment }),
      ...(data.difficulty && { difficulty: data.difficulty }),
    },
  });
  return {
    ...exercise,
    createdAt: exercise.createdAt.toISOString(),
    updatedAt: exercise.updatedAt.toISOString(),
  };
}

export async function deleteExercise(id: string): Promise<boolean> {
  try {
    await prisma.exercise.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}