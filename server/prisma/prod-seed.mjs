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
    name: "Squat",
    description: "Mouvement polyarticulaire pour les jambes.",
    muscleGroup: "legs",
    equipment: "barbell",
    difficulty: "intermediate",
  },
  {
    name: "Developpe couche",
    description: "Mouvement de poussee horizontal pour les pectoraux.",
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
    name: "Developpe militaire",
    description: "Mouvement de poussee vertical pour les epaules.",
    muscleGroup: "shoulders",
    equipment: "barbell",
    difficulty: "intermediate",
  },
  {
    name: "Curl halteres",
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
    name: "Course a pied",
    description: "Travail cardio sans materiel.",
    muscleGroup: "cardio",
    equipment: "none",
    difficulty: "beginner",
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
        data: exercise,
      });
      continue;
    }

    await prisma.exercise.create({ data: exercise });
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
  await upsertGlobalFoods();

  console.info("Production seed OK");
  console.info(`Account: ${ADMIN_EMAIL}`);
  console.info(`Account name: ${ADMIN_NAME}`);
  console.info(`Exercises upserted: ${exercises.length}`);
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
