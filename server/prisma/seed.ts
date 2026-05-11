import { ExerciseDifficulty, ExerciseType, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const exercises = [
  {
    name: "Velo",
    description: "Travail cardio accessible pour l'endurance de base.",
    difficulty: "BEGINNER",
    exerciseType: "CARDIO",
  },
  {
    name: "Rameur",
    description: "Cardio complet mobilisant jambes, dos et bras.",
    difficulty: "BEGINNER",
    exerciseType: "CARDIO",
  },
  {
    name: "Corde a sauter",
    description: "Exercice cardio et coordination au poids du corps.",
    difficulty: "BEGINNER",
    exerciseType: "CARDIO",
  },
  {
    name: "Pompes inclinees",
    description: "Variante accessible des pompes pour debuter.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Wall sit / chaise",
    description: "Gainage statique des quadriceps contre un mur.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Planche",
    description: "Gainage statique pour le tronc.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Crunch",
    description: "Exercice simple pour les abdominaux.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Developpe couche",
    description: "Mouvement de poussee horizontal pour les pectoraux.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Developpe incline halteres",
    description: "Poussee inclinee avec halteres pour le haut des pectoraux.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Shoulder press",
    description: "Poussee verticale pour les epaules.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Extension triceps poulie corde",
    description: "Isolation des triceps a la poulie.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Tractions assistees",
    description: "Tirage vertical assiste pour apprendre les tractions.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Rowing barre",
    description: "Tirage horizontal polyarticulaire pour le dos.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Tirage vertical poitrine",
    description: "Tirage vertical a la poulie pour le dos.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Curl barre EZ",
    description: "Exercice d'isolation pour les biceps.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Squat arriere",
    description: "Mouvement polyarticulaire pour les jambes.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Presse a cuisses",
    description: "Poussee guidee pour les quadriceps et fessiers.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Leg curl assis",
    description: "Isolation des ischio-jambiers a la machine.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Mollets debout",
    description: "Extension des mollets debout.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
];

const workoutTemplates = [
  {
    name: "Cardio debutant",
    category: "Cardio",
    level: "Debutant",
    duration: 20,
    description: "Seance cardio simple pour reprendre progressivement.",
    displayOrder: 1,
    exercises: [
      { name: "Velo", sets: 1, reps: 0, durationSeconds: 600, rest: 60 },
      { name: "Rameur", sets: 1, reps: 0, durationSeconds: 300, rest: 60 },
      { name: "Corde a sauter", sets: 1, reps: 0, durationSeconds: 300, rest: 60 },
    ],
  },
  {
    name: "Full body poids du corps debutant",
    category: "Poids du corps",
    level: "Debutant",
    duration: 25,
    description: "Base complete sans charge pour construire une routine.",
    displayOrder: 2,
    exercises: [
      { name: "Pompes inclinees", sets: 3, reps: 10, rest: 60 },
      { name: "Wall sit / chaise", sets: 3, reps: 0, durationSeconds: 30, rest: 60 },
      { name: "Planche", sets: 3, reps: 0, durationSeconds: 30, rest: 60 },
      { name: "Crunch", sets: 3, reps: 15, rest: 45 },
    ],
  },
  {
    name: "Push",
    category: "Musculation",
    level: "Intermediaire",
    duration: 60,
    description: "Pectoraux, epaules et triceps.",
    displayOrder: 3,
    exercises: [
      { name: "Developpe couche", sets: 4, reps: 8, rest: 120 },
      { name: "Developpe incline halteres", sets: 3, reps: 10, rest: 90 },
      { name: "Shoulder press", sets: 3, reps: 10, rest: 90 },
      { name: "Extension triceps poulie corde", sets: 3, reps: 12, rest: 60 },
    ],
  },
  {
    name: "Pull",
    category: "Musculation",
    level: "Intermediaire",
    duration: 60,
    description: "Dos et biceps.",
    displayOrder: 4,
    exercises: [
      { name: "Tractions assistees", sets: 4, reps: 8, rest: 120 },
      { name: "Rowing barre", sets: 4, reps: 8, rest: 120 },
      { name: "Tirage vertical poitrine", sets: 3, reps: 10, rest: 90 },
      { name: "Curl barre EZ", sets: 3, reps: 12, rest: 60 },
    ],
  },
  {
    name: "Legs",
    category: "Musculation",
    level: "Intermediaire",
    duration: 60,
    description: "Quadriceps, ischios et mollets.",
    displayOrder: 5,
    exercises: [
      { name: "Squat arriere", sets: 4, reps: 8, rest: 150 },
      { name: "Presse a cuisses", sets: 4, reps: 10, rest: 120 },
      { name: "Leg curl assis", sets: 3, reps: 12, rest: 90 },
      { name: "Mollets debout", sets: 4, reps: 15, rest: 60 },
    ],
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
        data: {
          description: exercise.description,
          difficulty: exercise.difficulty as ExerciseDifficulty,
          exerciseType: exercise.exerciseType as ExerciseType,
        },
      });
      continue;
    }

    await prisma.exercise.create({
      data: {
        name: exercise.name,
        description: exercise.description,
        difficulty: exercise.difficulty as ExerciseDifficulty,
        exerciseType: exercise.exerciseType as ExerciseType,
      },
    });
  }
}

async function seedWorkoutTemplates() {
  for (const template of workoutTemplates) {
    const savedTemplate = await prisma.workoutTemplate.upsert({
      where: { name: template.name },
      update: {
        category: template.category,
        level: template.level,
        duration: template.duration,
        description: template.description,
        displayOrder: template.displayOrder,
      },
      create: {
        name: template.name,
        category: template.category,
        level: template.level,
        duration: template.duration,
        description: template.description,
        displayOrder: template.displayOrder,
      },
    });

    await prisma.workoutTemplateExercise.deleteMany({
      where: { templateId: savedTemplate.id },
    });

    for (const [index, exercise] of template.exercises.entries()) {
      const savedExercise = await prisma.exercise.findFirst({
        where: { name: exercise.name },
      });

      if (!savedExercise) {
        throw new Error(`Exercice introuvable pour le modele: ${exercise.name}`);
      }

      await prisma.workoutTemplateExercise.create({
        data: {
          templateId: savedTemplate.id,
          exerciseId: savedExercise.id,
          order: index,
          sets: exercise.sets,
          reps: exercise.reps,
          durationSeconds: exercise.durationSeconds ?? null,
          rest: exercise.rest,
          weight: 0,
        },
      });
    }
  }
}

async function main() {
  await seedExercises();
  await seedWorkoutTemplates();
  console.info(
    `Seed termine: ${exercises.length} exercices et ${workoutTemplates.length} modeles disponibles.`,
  );
}

main()
  .catch((error) => {
    console.error("Seed impossible a executer.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
