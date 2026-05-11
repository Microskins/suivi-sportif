// Workout template database queries - NEVER write SQL directly in routes

import prisma from "../index.js";
import type {
  InstantiateWorkoutTemplateInput,
  WorkoutResponse,
  WorkoutTemplateResponse,
} from "../../schemas/index.js";
import { getWorkoutById } from "./workouts.js";

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
        createdAt: templateExercise.exercise.createdAt.toISOString(),
        updatedAt: templateExercise.exercise.updatedAt.toISOString(),
      },
    })),
  };
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
