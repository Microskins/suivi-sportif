import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.SEED_ACCOUNT_EMAIL || "admin@suivi-sportif.fr";
const ADMIN_NAME = process.env.SEED_ACCOUNT_NAME || "Admin Test";
const PASSWORD_SALT_ROUNDS = 10;

const generatedPassword = !process.env.SEED_ACCOUNT_PASSWORD;
const adminPassword =
  process.env.SEED_ACCOUNT_PASSWORD || randomBytes(18).toString("base64url");

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

const foods = [
  {
    name: "Riz basmati",
    brand: null,
    barcode: null,
    caloriesKcal: 350,
    proteinGrams: 7,
    carbsGrams: 78,
    fatGrams: 1,
    fiberGrams: null,
    servingUnit: "g",
  },
  {
    name: "Pates completes",
    brand: null,
    barcode: null,
    caloriesKcal: 350,
    proteinGrams: 13,
    carbsGrams: 65,
    fatGrams: 2.5,
    fiberGrams: 8,
    servingUnit: "g",
  },
  {
    name: "Blanc de poulet",
    brand: null,
    barcode: null,
    caloriesKcal: 110,
    proteinGrams: 23,
    carbsGrams: 0,
    fatGrams: 1.5,
    fiberGrams: null,
    servingUnit: "g",
  },
  {
    name: "Oeufs",
    brand: null,
    barcode: null,
    caloriesKcal: 143,
    proteinGrams: 13,
    carbsGrams: 1,
    fatGrams: 10,
    fiberGrams: null,
    servingUnit: "g",
  },
  {
    name: "Banane",
    brand: null,
    barcode: null,
    caloriesKcal: 89,
    proteinGrams: 1.1,
    carbsGrams: 23,
    fatGrams: 0.3,
    fiberGrams: 2.6,
    servingUnit: "g",
  },
  {
    name: "Flocons d'avoine",
    brand: null,
    barcode: null,
    caloriesKcal: 370,
    proteinGrams: 13,
    carbsGrams: 60,
    fatGrams: 7,
    fiberGrams: 10,
    servingUnit: "g",
  },
  {
    name: "Yaourt grec",
    brand: null,
    barcode: null,
    caloriesKcal: 97,
    proteinGrams: 9,
    carbsGrams: 4,
    fatGrams: 5,
    fiberGrams: null,
    servingUnit: "g",
  },
  {
    name: "Huile d'olive",
    brand: null,
    barcode: null,
    caloriesKcal: 884,
    proteinGrams: 0,
    carbsGrams: 0,
    fatGrams: 100,
    fiberGrams: null,
    servingUnit: "g",
  },
];

async function upsertAdminAccount() {
  const password = await bcrypt.hash(adminPassword, PASSWORD_SALT_ROUNDS);

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      name: ADMIN_NAME,
      password,
    },
    create: {
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      password,
    },
  });
}

async function upsertExercises() {
  for (const exercise of exercises) {
    const existing = await prisma.exercise.findFirst({
      where: { name: exercise.name },
    });

    if (existing) {
      await prisma.exercise.update({
        where: { id: existing.id },
        data: {
          description: exercise.description,
          difficulty: exercise.difficulty,
          exerciseType: exercise.exerciseType,
        },
      });
      continue;
    }

    await prisma.exercise.create({
      data: {
        name: exercise.name,
        description: exercise.description,
        difficulty: exercise.difficulty,
        exerciseType: exercise.exerciseType,
      },
    });
  }
}

async function upsertWorkoutTemplates() {
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

async function upsertGlobalFoods() {
  for (const food of foods) {
    const existing = await prisma.food.findFirst({
      where: { name: food.name, userId: null },
    });

    if (existing) {
      await prisma.food.update({
        where: { id: existing.id },
        data: food,
      });
      continue;
    }

    await prisma.food.create({
      data: {
        ...food,
        userId: null,
      },
    });
  }
}

try {
  await upsertAdminAccount();
  await upsertExercises();
  await upsertWorkoutTemplates();
  await upsertGlobalFoods();

  console.info("Production seed OK");
  console.info(`Account: ${ADMIN_EMAIL}`);
  console.info(`Account name: ${ADMIN_NAME}`);
  console.info(`Exercises upserted: ${exercises.length}`);
  console.info(`Workout templates upserted: ${workoutTemplates.length}`);
  console.info(`Global foods upserted: ${foods.length}`);

  if (generatedPassword) {
    console.info(`Generated password: ${adminPassword}`);
    console.info("Store this password securely; it is not written anywhere.");
  } else {
    console.info("Password source: SEED_ACCOUNT_PASSWORD");
  }
} catch (error) {
  console.error("Production seed failed", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
