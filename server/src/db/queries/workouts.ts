// filepath: server/src/db/queries/workouts.ts
// Workout database queries - NEVER write SQL directly in routes

import prisma from '../index.js';
import type { CreateWorkoutInput, UpdateWorkoutInput, WorkoutResponse } from '../../schemas/index.js';

export async function getWorkouts(userId: string): Promise<WorkoutResponse[]> {
  const workouts = await prisma.workout.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });
  return workouts.map(w => ({
    id: w.id,
    userId: w.userId,
    name: w.name,
    date: w.date.toISOString(),
    duration: w.duration,
    notes: w.notes,
    createdAt: w.createdAt.toISOString(),
    updatedAt: w.updatedAt.toISOString(),
  }));
}

export async function getWorkoutById(id: string): Promise<WorkoutResponse | null> {
  const workout = await prisma.workout.findUnique({
    where: { id },
  });
  if (!workout) return null;
  return {
    id: workout.id,
    userId: workout.userId,
    name: workout.name,
    date: workout.date.toISOString(),
    duration: workout.duration,
    notes: workout.notes,
    createdAt: workout.createdAt.toISOString(),
    updatedAt: workout.updatedAt.toISOString(),
  };
}

export async function getWorkoutsByDateRange(userId: string, start: string, end: string): Promise<WorkoutResponse[]> {
  const workouts = await prisma.workout.findMany({
    where: {
      userId,
      date: {
        gte: new Date(start),
        lte: new Date(end),
      },
    },
    orderBy: { date: 'desc' },
  });
  return workouts.map(w => ({
    id: w.id,
    userId: w.userId,
    name: w.name,
    date: w.date.toISOString(),
    duration: w.duration,
    notes: w.notes,
    createdAt: w.createdAt.toISOString(),
    updatedAt: w.updatedAt.toISOString(),
  }));
}

export async function createWorkout(userId: string, data: CreateWorkoutInput): Promise<WorkoutResponse> {
  const workout = await prisma.workout.create({
    data: {
      userId,
      name: data.name,
      date: new Date(data.date),
      duration: data.duration,
      notes: data.notes,
    },
  });
  return {
    id: workout.id,
    userId: workout.userId,
    name: workout.name,
    date: workout.date.toISOString(),
    duration: workout.duration,
    notes: workout.notes,
    createdAt: workout.createdAt.toISOString(),
    updatedAt: workout.updatedAt.toISOString(),
  };
}

export async function updateWorkout(id: string, data: UpdateWorkoutInput): Promise<WorkoutResponse | null> {
  const existing = await prisma.workout.findUnique({ where: { id } });
  if (!existing) return null;
  
  const workout = await prisma.workout.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.date && { date: new Date(data.date) }),
      ...(data.duration && { duration: data.duration }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
  });
  return {
    id: workout.id,
    userId: workout.userId,
    name: workout.name,
    date: workout.date.toISOString(),
    duration: workout.duration,
    notes: workout.notes,
    createdAt: workout.createdAt.toISOString(),
    updatedAt: workout.updatedAt.toISOString(),
  };
}

export async function deleteWorkout(id: string): Promise<boolean> {
  try {
    await prisma.workout.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}