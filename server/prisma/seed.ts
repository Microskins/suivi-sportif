import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const exercises = [
  {
    name: "Squat",
    description: "Mouvement polyarticulaire pour les jambes.",
    muscleGroup: "legs",
    equipment: "barbell",
    difficulty: "intermediate",
  },
  {
    name: "Développé couché",
    description: "Mouvement de poussée horizontal pour les pectoraux.",
    muscleGroup: "chest",
    equipment: "barbell",
    difficulty: "intermediate",
  },
  {
    name: "Tractions",
    description: "Mouvement de tirage vertical au poids du corps.",
    muscleGroup: "back",
    equipment: "none",
    difficulty: "intermediate",
  },
  {
    name: "Développé militaire",
    description: "Mouvement de poussée vertical pour les épaules.",
    muscleGroup: "shoulders",
    equipment: "barbell",
    difficulty: "intermediate",
  },
  {
    name: "Curl haltères",
    description: "Exercice d'isolation pour les biceps.",
    muscleGroup: "arms",
    equipment: "dumbbell",
    difficulty: "beginner",
  },
  {
    name: "Planche",
    description: "Gainage statique pour le tronc.",
    muscleGroup: "core",
    equipment: "none",
    difficulty: "beginner",
  },
  {
    name: "Course à pied",
    description: "Travail cardio sans matériel.",
    muscleGroup: "cardio",
    equipment: "none",
    difficulty: "beginner",
  },
];

async function seedExercises() {
  for (const exercise of exercises) {
    const existing = await prisma.exercise.findFirst({
      where: { name: exercise.name },
    });

    if (existing) {
      await prisma.exercise.update({
        where: { id: existing.id },
        data: exercise,
      });
      continue;
    }

    await prisma.exercise.create({ data: exercise });
  }
}

seedExercises()
  .then(async () => {
    console.info(`Seed terminé: ${exercises.length} exercices disponibles.`);
  })
  .catch((error) => {
    console.error("Seed impossible à exécuter.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
