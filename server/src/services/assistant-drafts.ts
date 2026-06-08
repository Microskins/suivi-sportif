import type { AssistantDraftRequestInput } from "../schemas/index.js";

export type AssistantDraftAction =
  | "create_meal"
  | "create_body_measurement"
  | "create_workout"
  | "create_user_goal"
  | "update_profile"
  | "unknown";

export type AssistantDraft = {
  action: AssistantDraftAction;
  confidence: "low" | "medium" | "high";
  requiresConfirmation: boolean;
  summary: string;
  payload: Record<string, unknown>;
  missingFields: string[];
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isoAtHour(now: Date, hour: number) {
  const date = new Date(now);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function isoTomorrowAtHour(now: Date, hour: number) {
  const date = new Date(now);
  date.setDate(date.getDate() + 1);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function parseNumber(value: string) {
  return Number(value.replace(",", "."));
}

function extractEmail(message: string) {
  return message.match(/[^\s@]+@[^\s@]+\.[^\s@]+/)?.[0] ?? null;
}

function draftProfile(message: string): AssistantDraft | null {
  const email = extractEmail(message);
  if (!email) return null;

  return {
    action: "update_profile",
    confidence: "high",
    missingFields: ["currentPassword"],
    payload: { email },
    requiresConfirmation: true,
    summary: `Modifier l'email du profil en ${email}.`,
  };
}

function draftBodyMeasurement(message: string, normalized: string, now: Date) {
  if (!/(pesee|poids|mensuration)/.test(normalized)) return null;

  const weightMatch =
    normalized.match(/(\d+(?:[,.]\d+)?)\s*kg/) ??
    normalized.match(/(?:pesee|poids)\D+(\d+(?:[,.]\d+)?)/);
  const weightKg = weightMatch ? parseNumber(weightMatch[1]) : null;

  return {
    action: "create_body_measurement",
    confidence: weightKg === null ? "low" : "high",
    missingFields: weightKg === null ? ["weightKg"] : [],
    payload: {
      date: now.toISOString(),
      ...(weightKg === null ? {} : { weightKg }),
    },
    requiresConfirmation: true,
    summary:
      weightKg === null
        ? "Preparer une nouvelle mensuration."
        : `Ajouter une pesee a ${weightKg} kg.`,
  } satisfies AssistantDraft;
}

function cleanMealItemsText(message: string, normalized: string) {
  const markerIndex = Math.max(
    normalized.indexOf("?"),
    normalized.indexOf(":"),
  );
  if (markerIndex >= 0 && markerIndex + 1 < message.length) {
    return message.slice(markerIndex + 1);
  }

  return message
    .replace(/tu peux/gi, "")
    .replace(/(rajouter|ajouter|creer|cree)/gi, "")
    .replace(/mon repas/gi, "")
    .replace(/de ce midi|de ce soir|du matin|de ce matin/gi, "");
}

function draftMeal(message: string, normalized: string, now: Date) {
  if (!/(repas|dejeuner|diner|petit dej|petit-dej|collation)/.test(normalized)) {
    return null;
  }

  const isDinner = /(soir|diner)/.test(normalized);
  const isBreakfast = /(matin|petit dej|petit-dej)/.test(normalized);
  const isSnack = /collation/.test(normalized);
  const mealType = isDinner
    ? "dinner"
    : isBreakfast
      ? "breakfast"
      : isSnack
        ? "snack"
        : "lunch";
  const date = isoAtHour(now, isDinner ? 19 : isBreakfast ? 8 : isSnack ? 16 : 12);
  const itemsText = cleanMealItemsText(message, normalized);
  const itemNames = itemsText
    .split(/,|;|\bet\b/i)
    .map((item) => item.trim().replace(/[.!?]+$/g, ""))
    .filter((item) => item.length > 1);

  return {
    action: "create_meal",
    confidence: itemNames.length > 0 ? "medium" : "low",
    missingFields: itemNames.length > 0 ? ["foodIds", "quantities"] : ["items"],
    payload: {
      date,
      items: itemNames.map((name) => ({ name })),
      mealType,
      name:
        mealType === "dinner"
          ? "Diner"
          : mealType === "breakfast"
            ? "Petit dejeuner"
            : mealType === "snack"
              ? "Collation"
              : "Dejeuner",
      notes: message,
    },
    requiresConfirmation: true,
    summary: `Preparer un repas ${mealType} avec ${itemNames.length} element(s).`,
  } satisfies AssistantDraft;
}

function draftWorkout(message: string, normalized: string, now: Date) {
  if (!/(seance|entrainement|training|workout)/.test(normalized)) return null;

  const hourMatch = normalized.match(/(\d{1,2})\s*h/);
  const hour = hourMatch ? Number(hourMatch[1]) : 18;
  const date = /demain/.test(normalized)
    ? isoTomorrowAtHour(now, hour)
    : isoAtHour(now, hour);
  const nameMatch = normalized.match(/\b(push|pull|legs|full body|cardio)\b/);
  const name = nameMatch ? nameMatch[1] : "Seance";

  return {
    action: "create_workout",
    confidence: "medium",
    missingFields: ["exerciseIds", "sets"],
    payload: {
      date,
      duration: 60,
      name,
      notes: message,
      status: new Date(date).getTime() > now.getTime() ? "PLANNED" : "COMPLETED",
    },
    requiresConfirmation: true,
    summary: `Preparer une seance ${name}.`,
  } satisfies AssistantDraft;
}

function draftUserGoal(message: string, normalized: string, now: Date) {
  if (!/objectif/.test(normalized)) return null;
  const isBody = /(corps|poids|kg|maigrir|descendre)/.test(normalized);
  const targetMatch = normalized.match(/(\d+(?:[,.]\d+)?)\s*kg/);

  return {
    action: "create_user_goal",
    confidence: isBody && targetMatch ? "medium" : "low",
    missingFields: targetMatch ? [] : ["targetValue"],
    payload: {
      direction: isBody ? "AT_MOST" : "AT_LEAST",
      domain: isBody ? "BODY" : "SPORT",
      metric: isBody ? "BODY_WEIGHT_KG" : "SPORT_WORKOUTS_PER_WEEK",
      name: isBody ? "Objectif poids" : "Objectif sport",
      notes: message,
      startDate: now.toISOString(),
      ...(targetMatch ? { targetValue: parseNumber(targetMatch[1]) } : {}),
    },
    requiresConfirmation: true,
    summary: isBody
      ? "Preparer un objectif de poids corporel."
      : "Preparer un objectif sportif.",
  } satisfies AssistantDraft;
}

export function createAssistantDraft(
  input: AssistantDraftRequestInput,
  now = new Date(),
): AssistantDraft {
  const message = input.message.trim();
  const normalized = normalize(message);

  return (
    draftMeal(message, normalized, now) ??
    draftBodyMeasurement(message, normalized, now) ??
    draftWorkout(message, normalized, now) ??
    draftUserGoal(message, normalized, now) ??
    draftProfile(message) ?? {
      action: "unknown",
      confidence: "low",
      missingFields: ["intent"],
      payload: { message },
      requiresConfirmation: false,
      summary: "Demande non reconnue pour le moment.",
    }
  );
}
