import { z } from 'zod';

// ============== User Schemas ==============
export const createUserSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Mot de passe minimum 8 caractères'),
  name: z.string().min(1, 'Nom requis').max(100),
});

export const loginUserSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export const updateUserSchema = createUserSchema.partial().extend({
  password: z.string().min(8).optional(),
});

export const userResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const userListSchema = z.array(userResponseSchema);

// ============== Exercise Schemas ==============
export const createExerciseSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(200),
  description: z.string().max(1000).optional(),
  muscleGroup: z.enum(['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio']),
  equipment: z.enum(['none', 'barbell', 'dumbbell', 'machine', 'cable', 'kettlebell', 'resistance_band']).default('none'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
});

export const updateExerciseSchema = createExerciseSchema.partial();

export const exerciseResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  muscleGroup: z.string(),
  equipment: z.string(),
  difficulty: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const exerciseListSchema = z.array(exerciseResponseSchema);

// ============== Workout Schemas ==============
export const createWorkoutSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(200),
  date: z.string().datetime(),
  duration: z.number().int().min(0), // en minutes
  notes: z.string().max(2000).optional(),
  exercises: z.array(z.object({
    exerciseId: z.string().uuid(),
    sets: z.array(z.object({
      reps: z.number().int().min(0),
      weight: z.number().min(0),
      rest: z.number().int().min(0),
    })),
  })).optional(),
});

export const updateWorkoutSchema = createWorkoutSchema.partial();

export const workoutResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  date: z.string().datetime(),
  duration: z.number().int(),
  notes: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const workoutListSchema = z.array(workoutResponseSchema);

// ============== Type Exports ==============
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>;
export type ExerciseResponse = z.infer<typeof exerciseResponseSchema>;

export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
export type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;
export type WorkoutResponse = z.infer<typeof workoutResponseSchema>;