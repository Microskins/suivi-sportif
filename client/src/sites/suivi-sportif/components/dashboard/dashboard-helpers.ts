import type {
  BodyMeasurementInput,
  ExerciseInput,
  FoodInput,
  MealInput,
  UserGoalInput,
  WorkoutInput,
} from "../../api/client";

export type ExerciseCatalogEntry = {
  nom: string;
  image: string;
};

export function repairMojibake(value: string) {
  try {
    return decodeURIComponent(escape(value));
  } catch {
    return value;
  }
}

export function normalizeExerciseKey(value: string) {
  return repairMojibake(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function buildExerciseImageUrl(path?: string | null) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const sanitized = path.replace(/^\/+/, "");
  const siteAssetBase = "/sites/suivi-sportif/exercises";
  if (sanitized.startsWith("exercices-assets/")) {
    return `${siteAssetBase}/${sanitized.replace(/^exercices-assets\//, "")}`;
  }
  if (sanitized.startsWith("images/")) {
    return `${siteAssetBase}/${sanitized}`;
  }
  return `${siteAssetBase}/images/${sanitized}`;
}

export function formatDate(value: string) {
  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function requireString(value: unknown, label: string) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Champ assistant invalide: ${label}`);
  }

  return value;
}

function optionalString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function requireNumber(value: unknown, label: string) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`Champ assistant invalide: ${label}`);
  }

  return value;
}

export function toMealInput(payload: Record<string, unknown>): MealInput {
  const rawItems = Array.isArray(payload.items) ? payload.items : [];
  const items = rawItems.map((item) => {
    if (!item || typeof item !== "object") {
      throw new Error("Item de repas assistant invalide");
    }
    const entry = item as Record<string, unknown>;
    return {
      foodId: requireString(entry.foodId, "foodId"),
      quantityGrams: requireNumber(entry.quantityGrams, "quantityGrams"),
    };
  });

  if (items.length === 0) {
    throw new Error("Le brouillon repas doit contenir au moins un aliment.");
  }

  return {
    date: requireString(payload.date, "date"),
    items,
    mealType:
      typeof payload.mealType === "string"
        ? (payload.mealType as MealInput["mealType"])
        : "other",
    name: requireString(payload.name, "name"),
    notes: optionalString(payload.notes),
  };
}

export function toFoodInput(payload: Record<string, unknown>): FoodInput {
  return {
    barcode: optionalString(payload.barcode),
    brand: optionalString(payload.brand),
    caloriesKcal: requireNumber(payload.caloriesKcal, "caloriesKcal"),
    carbsGrams: requireNumber(payload.carbsGrams, "carbsGrams"),
    fatGrams: requireNumber(payload.fatGrams, "fatGrams"),
    fiberGrams:
      typeof payload.fiberGrams === "number" ? payload.fiberGrams : null,
    name: requireString(payload.name, "name"),
    proteinGrams: requireNumber(payload.proteinGrams, "proteinGrams"),
    servingUnit:
      payload.servingUnit === "unit" || payload.servingUnit === "g"
        ? payload.servingUnit
        : "g",
  };
}

export function toExerciseInput(payload: Record<string, unknown>): ExerciseInput {
  return {
    bodyParts: Array.isArray(payload.bodyParts)
      ? payload.bodyParts.filter(
          (part): part is string => typeof part === "string" && part.length > 0,
        )
      : undefined,
    description: optionalString(payload.description),
    difficulty:
      payload.difficulty === "INTERMEDIATE" || payload.difficulty === "ADVANCED"
        ? payload.difficulty
        : "BEGINNER",
    exerciseType:
      payload.exerciseType === "CARDIO" || payload.exerciseType === "MOBILITY"
        ? payload.exerciseType
        : "STRENGTH",
    name: requireString(payload.name, "name"),
  };
}

export function toBodyMeasurementInput(
  payload: Record<string, unknown>,
): BodyMeasurementInput {
  return {
    date: requireString(payload.date, "date"),
    weightKg:
      typeof payload.weightKg === "number" ? payload.weightKg : undefined,
    notes: optionalString(payload.notes),
  };
}

export function toWorkoutInput(payload: Record<string, unknown>): WorkoutInput {
  const rawExercises = Array.isArray(payload.exercises) ? payload.exercises : [];
  const exercises = rawExercises.map((exercise) => {
    if (!exercise || typeof exercise !== "object") {
      throw new Error("Exercice assistant invalide");
    }
    const entry = exercise as Record<string, unknown>;
    const rawSets = Array.isArray(entry.sets) ? entry.sets : [];
    return {
      exerciseId: requireString(entry.exerciseId, "exerciseId"),
      sets: rawSets.map((set) => {
        if (!set || typeof set !== "object") {
          throw new Error("Serie assistant invalide");
        }
        const setEntry = set as Record<string, unknown>;
        return {
          reps: typeof setEntry.reps === "number" ? setEntry.reps : undefined,
          rest: typeof setEntry.rest === "number" ? setEntry.rest : 90,
          weight:
            typeof setEntry.weight === "number" ? setEntry.weight : undefined,
        };
      }),
    };
  });

  return {
    date: requireString(payload.date, "date"),
    duration: typeof payload.duration === "number" ? payload.duration : 60,
    exercises: exercises.length > 0 ? exercises : undefined,
    name: requireString(payload.name, "name"),
    notes: optionalString(payload.notes),
    status:
      typeof payload.status === "string"
        ? (payload.status as WorkoutInput["status"])
        : undefined,
  };
}

export function toUserGoalInput(payload: Record<string, unknown>): UserGoalInput {
  return {
    direction:
      typeof payload.direction === "string"
        ? (payload.direction as UserGoalInput["direction"])
        : "AT_MOST",
    domain: requireString(payload.domain, "domain") as UserGoalInput["domain"],
    endDate: optionalString(payload.endDate),
    exerciseId: optionalString(payload.exerciseId),
    isActive:
      typeof payload.isActive === "boolean" ? payload.isActive : true,
    metric: requireString(payload.metric, "metric") as UserGoalInput["metric"],
    name: requireString(payload.name, "name"),
    notes: optionalString(payload.notes),
    startDate: requireString(payload.startDate, "startDate"),
    targetValue: requireNumber(payload.targetValue, "targetValue"),
  };
}
