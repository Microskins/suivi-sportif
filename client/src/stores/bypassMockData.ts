import type { Exercise, Workout } from "../api/client";

const createdAt = "2026-01-01T08:00:00.000Z";
const updatedAt = "2026-01-01T08:00:00.000Z";
const bypassUserId = "00000000-0000-4000-8000-000000000000";

export const bypassExercises: Exercise[] = [
  {
    id: "bypass-exercise-squat",
    name: "Squat barre",
    description: "Mouvement de base pour les jambes et le gainage.",
    muscleGroup: "Jambes",
    equipment: "Barre",
    difficulty: "Intermediaire",
    createdAt,
    updatedAt,
  },
  {
    id: "bypass-exercise-bench-press",
    name: "Developpe couche",
    description: "Exercice de poussee pour les pectoraux, triceps et epaules.",
    muscleGroup: "Pectoraux",
    equipment: "Banc et barre",
    difficulty: "Intermediaire",
    createdAt,
    updatedAt,
  },
  {
    id: "bypass-exercise-row",
    name: "Rowing halteres",
    description: "Tirage horizontal pour renforcer le dos.",
    muscleGroup: "Dos",
    equipment: "Halteres",
    difficulty: "Debutant",
    createdAt,
    updatedAt,
  },
  {
    id: "bypass-exercise-plank",
    name: "Planche",
    description: "Gainage statique pour le tronc.",
    muscleGroup: "Abdominaux",
    equipment: "Poids du corps",
    difficulty: "Debutant",
    createdAt,
    updatedAt,
  },
];

export const bypassWorkouts: Workout[] = [
  {
    id: "bypass-workout-full-body",
    userId: bypassUserId,
    name: "Full body reprise",
    date: "2026-05-01T17:30:00.000Z",
    duration: 55,
    notes: "Seance de reprise sans aller a l'echec.",
    createdAt,
    updatedAt,
    exercises: [
      {
        id: "bypass-workout-exercise-squat",
        exerciseId: "bypass-exercise-squat",
        order: 1,
        exercise: bypassExercises[0],
        sets: [
          {
            id: "bypass-set-squat-1",
            setNumber: 1,
            reps: 10,
            weight: 60,
            rest: 90,
            createdAt,
          },
          {
            id: "bypass-set-squat-2",
            setNumber: 2,
            reps: 8,
            weight: 70,
            rest: 120,
            createdAt,
          },
        ],
      },
      {
        id: "bypass-workout-exercise-bench-press",
        exerciseId: "bypass-exercise-bench-press",
        order: 2,
        exercise: bypassExercises[1],
        sets: [
          {
            id: "bypass-set-bench-1",
            setNumber: 1,
            reps: 10,
            weight: 50,
            rest: 90,
            createdAt,
          },
          {
            id: "bypass-set-bench-2",
            setNumber: 2,
            reps: 8,
            weight: 55,
            rest: 120,
            createdAt,
          },
        ],
      },
    ],
  },
  {
    id: "bypass-workout-core",
    userId: bypassUserId,
    name: "Dos et gainage",
    date: "2026-05-03T10:00:00.000Z",
    duration: 40,
    notes: "Focus technique et respiration.",
    createdAt,
    updatedAt,
    exercises: [
      {
        id: "bypass-workout-exercise-row",
        exerciseId: "bypass-exercise-row",
        order: 1,
        exercise: bypassExercises[2],
        sets: [
          {
            id: "bypass-set-row-1",
            setNumber: 1,
            reps: 12,
            weight: 18,
            rest: 75,
            createdAt,
          },
          {
            id: "bypass-set-row-2",
            setNumber: 2,
            reps: 12,
            weight: 20,
            rest: 90,
            createdAt,
          },
        ],
      },
      {
        id: "bypass-workout-exercise-plank",
        exerciseId: "bypass-exercise-plank",
        order: 2,
        exercise: bypassExercises[3],
        sets: [
          {
            id: "bypass-set-plank-1",
            setNumber: 1,
            reps: 45,
            weight: 0,
            rest: 60,
            createdAt,
          },
          {
            id: "bypass-set-plank-2",
            setNumber: 2,
            reps: 40,
            weight: 0,
            rest: 60,
            createdAt,
          },
        ],
      },
    ],
  },
];
