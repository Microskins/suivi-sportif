// Workout template database queries - NEVER write SQL directly in routes

import prisma from "../index.js";
import type {
  CreateWorkoutTemplateInput,
  InstantiateWorkoutTemplateInput,
  UpdateWorkoutTemplateInput,
  WorkoutResponse,
  WorkoutTemplateResponse,
} from "../../schemas/index.js";
import { getWorkoutById } from "./workouts.js";

function inferStatusFromDate(dateIso: string): "PLANNED" | "COMPLETED" {
  return new Date(dateIso).getTime() > Date.now() ? "PLANNED" : "COMPLETED";
}

type WorkoutTemplateWithDetails = {
  id: string;
  name: string;
  category: string;
  level: string;
  duration: number;
  description: string | null;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  exercises: Array<{
    id: string;
    exerciseId: string;
    order: number;
    sets: number;
    reps: number;
    durationSeconds: number | null;
    rest: number;
    weight: unknown;
    exercise: {
      id: string;
      name: string;
      description: string | null;
      difficulty: string;
      exerciseType: string;
      muscles: Array<{
        muscle: { name: string };
      }>;
      createdAt: Date;
      updatedAt: Date;
    };
  }>;
};

const workoutTemplateInclude = {
  exercises: {
    orderBy: { order: "asc" as const },
    include: {
      exercise: {
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
      },
    },
  },
};

function formatWorkoutTemplate(
  template: WorkoutTemplateWithDetails,
): WorkoutTemplateResponse {
  return {
    id: template.id,
    name: template.name,
    category: template.category,
    level: template.level,
    duration: template.duration,
    description: template.description,
    displayOrder: template.displayOrder,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
    exercises: template.exercises.map((templateExercise) => ({
      id: templateExercise.id,
      exerciseId: templateExercise.exerciseId,
      order: templateExercise.order,
      sets: templateExercise.sets,
      reps: templateExercise.reps,
      durationSeconds: templateExercise.durationSeconds,
      rest: templateExercise.rest,
      weight: Number(templateExercise.weight),
      exercise: {
        id: templateExercise.exercise.id,
        name: templateExercise.exercise.name,
        description: templateExercise.exercise.description,
        difficulty: String(templateExercise.exercise.difficulty),
        exerciseType: String(templateExercise.exercise.exerciseType),
        bodyParts: templateExercise.exercise.muscles.map(
          (item) => item.muscle.name,
        ),
        createdAt: templateExercise.exercise.createdAt.toISOString(),
        updatedAt: templateExercise.exercise.updatedAt.toISOString(),
      },
    })),
  };
}

export async function createWorkoutTemplate(
  data: CreateWorkoutTemplateInput,
): Promise<WorkoutTemplateResponse> {
  const created = await prisma.workoutTemplate.create({
    data: {
      name: data.name,
      category: data.category,
      level: data.level,
      duration: data.duration,
      description: data.description ?? null,
      displayOrder: data.displayOrder ?? 0,
      exercises: {
        create: data.exercises.map((item) => ({
          exerciseId: item.exerciseId,
          order: item.order,
          sets: item.sets,
          reps: item.reps,
          durationSeconds: item.durationSeconds ?? null,
          rest: item.rest,
          weight: item.weight,
        })),
      },
    },
    include: workoutTemplateInclude,
  });

  return formatWorkoutTemplate(created as WorkoutTemplateWithDetails);
}

export async function getWorkoutTemplates(): Promise<
  WorkoutTemplateResponse[]
> {
  const templates = await prisma.workoutTemplate.findMany({
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    include: workoutTemplateInclude,
  });

  return (templates as WorkoutTemplateWithDetails[]).map(formatWorkoutTemplate);
}

export async function instantiateWorkoutTemplate(
  id: string,
  userId: string,
  data: InstantiateWorkoutTemplateInput,
): Promise<WorkoutResponse | null> {
  const template = await prisma.workoutTemplate.findUnique({
    where: { id },
    include: workoutTemplateInclude,
  });

  if (!template) {
    return null;
  }

  const workout = await prisma.workout.create({
    data: {
      userId,
      name: template.name,
      date: new Date(data.date),
      status: inferStatusFromDate(data.date),
      duration: template.duration,
      notes: template.description,
      workoutExercises: {
        create: template.exercises.map(
          (
            templateExercise: WorkoutTemplateWithDetails["exercises"][number],
          ) => ({
            order: templateExercise.order,
            exercise: {
              connect: { id: templateExercise.exerciseId },
            },
            sets: {
              create: Array.from(
                { length: templateExercise.sets },
                (_, index) => ({
                  setNumber: index + 1,
                  reps: templateExercise.reps,
                  weight: Number(templateExercise.weight),
                  rest: templateExercise.rest,
                }),
              ),
            },
          }),
        ),
      },
    },
  });

  return getWorkoutById(workout.id, userId);
}

export async function updateWorkoutTemplate(
  id: string,
  data: UpdateWorkoutTemplateInput,
): Promise<WorkoutTemplateResponse | null> {
  const existing = await prisma.workoutTemplate.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return null;
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (data.exercises) {
      await tx.workoutTemplateExercise.deleteMany({
        where: { templateId: id },
      });
    }

    return tx.workoutTemplate.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        level: data.level,
        duration: data.duration,
        description: data.description,
        displayOrder: data.displayOrder,
        exercises: data.exercises
          ? {
              create: data.exercises.map((item) => ({
                exerciseId: item.exerciseId,
                order: item.order,
                sets: item.sets,
                reps: item.reps,
                durationSeconds: item.durationSeconds ?? null,
                rest: item.rest,
                weight: item.weight,
              })),
            }
          : undefined,
      },
      include: workoutTemplateInclude,
    });
  });

  return formatWorkoutTemplate(updated as WorkoutTemplateWithDetails);
}
