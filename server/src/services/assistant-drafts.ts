import type { AssistantDraftRequestInput } from "../schemas/index.js";

export type AssistantDraftAction =
  | "create_exercise"
  | "create_food"
  | "create_meal"
  | "update_meal"
  | "delete_meal"
  | "create_body_measurement"
  | "update_body_measurement"
  | "delete_body_measurement"
  | "create_workout"
  | "update_workout"
  | "delete_workout"
  | "create_user_goal"
  | "update_profile"
  | "unknown";

export type AssistantDraft = {
  action: AssistantDraftAction;
  confidence: "low" | "medium" | "high";
  requiresConfirmation: boolean;
  reply?: string;
  summary: string;
  payload: Record<string, unknown>;
  missingFields: string[];
};

type MealItemDraft = {
  foodId?: string;
  name?: string;
  quantityGrams?: number;
  resolvedName?: string;
};

const MISSING_FIELD_LABELS: Record<string, string> = {
  caloriesKcal: "les calories",
  carbsGrams: "les glucides",
  currentPassword: "le mot de passe actuel",
  exerciseIds: "les exercices",
  fatGrams: "les lipides",
  fiberGrams: "les fibres",
  foodIds: "les aliments",
  id: "l'élément à modifier",
  intent: "la demande",
  items: "les aliments",
  name: "le nom",
  proteinGrams: "les proteines",
  quantities: "les quantites",
  sets: "les series",
  targetValue: "la valeur cible",
  weightKg: "le poids",
};

export function humanizeMissingFields(fields: string[]) {
  const labels = fields
    .map((field) => MISSING_FIELD_LABELS[field] ?? field)
    .filter((label) => Boolean(label));

  if (labels.length === 0) return "quelques informations";
  if (labels.length === 1) return labels[0];

  return `${labels.slice(0, -1).join(", ")} et ${labels[labels.length - 1]}`;
}

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

function cleanExerciseName(value: string) {
  return value
    .replace(/\b(avec|pour|description|difficulte|difficulté|type|muscles?)\b.*$/i, "")
    .replace(/^\s*(un|une|l')\s+/i, "")
    .trim()
    .replace(/[.!?:;,]+$/g, "");
}

function extractExerciseDraftName(message: string) {
  const markerMatch =
    message.match(/(?:exercice|exo)\s*:?\s*(.+)$/i) ??
    message.match(/(?:cree|creer|ajoute|ajouter)\s+(?:un\s+)?(?:exercice|exo)\s+(.+)$/i);

  return cleanExerciseName(markerMatch?.[1] ?? message);
}

function draftExercise(message: string, normalized: string): AssistantDraft | null {
  if (!/(exercice|exo)/.test(normalized)) return null;
  if (/(seance|entrainement|training|workout)/.test(normalized)) return null;

  const name = extractExerciseDraftName(message);
  const exerciseType = /cardio/.test(normalized)
    ? "CARDIO"
    : /(mobilite|mobility|etirement|stretch)/.test(normalized)
      ? "MOBILITY"
      : "STRENGTH";
  const difficulty = /(avance|advanced)/.test(normalized)
    ? "ADVANCED"
    : /(intermediaire|intermediate)/.test(normalized)
      ? "INTERMEDIATE"
      : "BEGINNER";
  const bodyPartsMatch = message.match(/(?:muscles?|parties? du corps)\s*:?\s*([^.;!?]+)/i);
  const bodyParts = bodyPartsMatch?.[1]
    ?.split(/,|;|\bet\b/i)
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    action: "create_exercise",
    confidence: name ? "medium" : "low",
    missingFields: name ? [] : ["name"],
    payload: {
      ...(bodyParts?.length ? { bodyParts } : {}),
      description: message,
      difficulty,
      exerciseType,
      ...(name ? { name } : {}),
    },
    requiresConfirmation: true,
    reply: name
      ? `Je peux ajouter l'exercice ${name}.`
      : "Je peux ajouter un exercice, mais j'ai besoin de son nom.",
    summary: name
      ? `Preparer l'exercice ${name}.`
      : "Preparer un nouvel exercice.",
  };
}

function cleanFoodName(value: string) {
  return value
    .replace(
      /\b(avec|calories?|kcal|proteines?|protéines?|glucides?|lipides?|fibres?)\b.*$/i,
      "",
    )
    .replace(/^\s*(un|une|l')\s+/i, "")
    .trim()
    .replace(/[.!?:;,]+$/g, "");
}

function extractFoodName(message: string, normalized: string) {
  const markerMatch =
    message.match(/(?:aliment|nourriture|food)\s*:?\s*(.+)$/i) ??
    message.match(/(?:cree|creer|ajoute|ajouter)\s+(?:un\s+)?(?:aliment|food)\s+(.+)$/i);

  const value = markerMatch?.[1] ?? message;
  return cleanFoodName(value) || (/(avoine|riz|poulet|banane)/.test(normalized) ? message : "");
}

function extractMacro(normalized: string, labels: string[]) {
  for (const label of labels) {
    const beforeLabelMatch = normalized.match(
      new RegExp(`(\\d+(?:[,.]\\d+)?)\\s*(?:g\\s+)?${label}`),
    );
    if (beforeLabelMatch) return parseNumber(beforeLabelMatch[1]);

    const afterLabelMatch = normalized.match(
      new RegExp(`${label}\\D+(\\d+(?:[,.]\\d+)?)`),
    );
    if (afterLabelMatch) return parseNumber(afterLabelMatch[1]);
  }

  return null;
}

function draftFood(message: string, normalized: string): AssistantDraft | null {
  if (!/(aliment|nourriture|food|flocon|avoine)/.test(normalized)) return null;
  if (/(repas|dejeuner|diner|petit dej|petit-dej|collation)/.test(normalized)) {
    return null;
  }

  const name = extractFoodName(message, normalized);
  const caloriesKcal = extractMacro(normalized, ["kcal", "calories"]);
  const proteinGrams = extractMacro(normalized, ["proteines", "protein"]);
  const carbsGrams = extractMacro(normalized, ["glucides", "carbs"]);
  const fatGrams = extractMacro(normalized, ["lipides", "fat"]);
  const fiberGrams = extractMacro(normalized, ["fibres", "fiber"]);

  return {
    action: "create_food",
    confidence: name ? "medium" : "low",
    missingFields: [
      ...(name ? [] : ["name"]),
      ...(caloriesKcal === null ? ["caloriesKcal"] : []),
      ...(proteinGrams === null ? ["proteinGrams"] : []),
      ...(carbsGrams === null ? ["carbsGrams"] : []),
      ...(fatGrams === null ? ["fatGrams"] : []),
    ],
    payload: {
      ...(name ? { name } : {}),
      ...(caloriesKcal === null ? {} : { caloriesKcal }),
      ...(proteinGrams === null ? {} : { proteinGrams }),
      ...(carbsGrams === null ? {} : { carbsGrams }),
      ...(fatGrams === null ? {} : { fatGrams }),
      ...(fiberGrams === null ? {} : { fiberGrams }),
      servingUnit: "g",
    },
    requiresConfirmation: true,
    summary: name
      ? `Preparer l'aliment ${name}.`
      : "Preparer un nouvel aliment.",
  };
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

function destructiveDraft(
  action: AssistantDraftAction,
  summary: string,
  message: string,
): AssistantDraft {
  return {
    action,
    confidence: "low",
    missingFields: ["id"],
    payload: { notes: message },
    requiresConfirmation: true,
    summary,
  };
}

function draftBodyMeasurement(message: string, normalized: string, now: Date) {
  if (!/(pesee|poids|mensuration)/.test(normalized)) return null;

  if (/(supprime|supprimer|efface|retire)/.test(normalized)) {
    return destructiveDraft(
      "delete_body_measurement",
      "Preparer la suppression d'une mensuration.",
      message,
    );
  }

  const weightMatch =
    normalized.match(/(\d+(?:[,.]\d+)?)\s*kg/) ??
    normalized.match(/(?:pesee|poids)\D+(\d+(?:[,.]\d+)?)/);
  const weightKg = weightMatch ? parseNumber(weightMatch[1]) : null;

  const isUpdate = /(modifie|modifier|corrige|corriger|remplace)/.test(
    normalized,
  );

  return {
    action: isUpdate ? "update_body_measurement" : "create_body_measurement",
    confidence: weightKg === null ? "low" : "high",
    missingFields: [
      ...(isUpdate ? ["id"] : []),
      ...(weightKg === null ? ["weightKg"] : []),
    ],
    payload: {
      date: now.toISOString(),
      ...(weightKg === null ? {} : { weightKg }),
    },
    requiresConfirmation: true,
    summary:
      weightKg === null
        ? isUpdate
          ? "Preparer la modification d'une mensuration."
          : "Preparer une nouvelle mensuration."
        : isUpdate
          ? `Modifier une pesee a ${weightKg} kg.`
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
    .replace(/mon petit dej|petit dej|petit-dej|petit dejeuner/gi, "")
    .replace(/de ce midi|de ce soir|du matin|de ce matin/gi, "");
}

function cleanMealItemName(value: string) {
  return value
    .replace(/^\s*(de|d'|du|des|un|une)\s+/i, "")
    .replace(/[.!?:;,]+$/g, "")
    .trim();
}

function extractMealItemsWithQuantities(text: string) {
  const items: Array<{ name: string; quantityGrams: number }> = [];
  const itemPattern =
    /(\d+(?:[,.]\d+)?)\s*(?:g|gr|grammes?)\s+(?:de\s+|d')?(.+?)(?=(?:[,;]|\bet\b|\d+(?:[,.]\d+)?\s*(?:g|gr|grammes?)\b|$))/gi;

  for (const match of text.matchAll(itemPattern)) {
    const quantityGrams = parseNumber(match[1]);
    const name = cleanMealItemName(match[2]);

    if (name && Number.isFinite(quantityGrams)) {
      items.push({ name, quantityGrams });
    }
  }

  return items;
}

function getMealDraftItems(draft: AssistantDraft) {
  const items = draft.payload.items;
  if (!Array.isArray(items)) return [];

  return items.filter(
    (item): item is MealItemDraft => Boolean(item) && typeof item === "object",
  );
}

function normalizeMealDraft(draft: AssistantDraft, sourceMessage?: string) {
  if (draft.action !== "create_meal" && draft.action !== "update_meal") {
    return draft;
  }

  const source =
    sourceMessage ??
    (typeof draft.payload.notes === "string" ? draft.payload.notes : undefined);
  const parsedItems = source ? extractMealItemsWithQuantities(source) : [];
  if (parsedItems.length === 0) return draft;

  const existingItems = getMealDraftItems(draft);
  const nextItems = parsedItems.map((parsedItem) => {
    const existingItem = existingItems.find((item) => {
      if (typeof item.name !== "string") return false;
      return normalize(item.name).includes(normalize(parsedItem.name));
    });

    const shouldPreserveExistingName =
      Boolean(existingItem?.foodId) || Boolean(existingItem?.resolvedName);

    return {
      ...(existingItem?.foodId ? { foodId: existingItem.foodId } : {}),
      name: shouldPreserveExistingName && existingItem?.name
        ? existingItem.name
        : parsedItem.name,
      quantityGrams: parsedItem.quantityGrams,
      ...(existingItem?.resolvedName
        ? { resolvedName: existingItem.resolvedName }
        : {}),
    };
  });
  const missingFields = draft.missingFields.filter(
    (field) => field !== "items" && field !== "quantities",
  );
  const mealType = typeof draft.payload.mealType === "string" ? draft.payload.mealType : "meal";

  return {
    ...draft,
    confidence: draft.confidence === "low" ? "medium" : draft.confidence,
    missingFields,
    payload: {
      ...draft.payload,
      items: nextItems,
      ...(typeof draft.payload.notes === "string" ? {} : { notes: source }),
    },
    summary:
      draft.action === "update_meal"
        ? `Preparer la modification d'un repas ${mealType} avec ${nextItems.length} element(s).`
        : `Preparer un repas ${mealType} avec ${nextItems.length} element(s).`,
  } satisfies AssistantDraft;
}

function extractQuantityList(text: string) {
  return [...text.matchAll(/(\d+(?:[,.]\d+)?)\s*(?:g|gr|grammes?)?\b/gi)]
    .map((match) => parseNumber(match[1]))
    .filter((value) => Number.isFinite(value));
}

function markMealQuantitiesComplete(draft: AssistantDraft): AssistantDraft {
  const items = getMealDraftItems(draft);
  const hasAllQuantities =
    items.length > 0 &&
    items.every((item) => typeof item.quantityGrams === "number");

  if (!hasAllQuantities) return draft;

  return {
    ...draft,
    missingFields: draft.missingFields.filter((field) => field !== "quantities"),
  };
}

function completeMealDraftFromMessage(
  draft: AssistantDraft,
  message: string,
): AssistantDraft {
  const normalizedDraft = normalizeMealDraft(draft, message);
  const normalizedItems = getMealDraftItems(normalizedDraft);
  if (
    normalizedItems.some((item) => typeof item.quantityGrams === "number") ||
    normalizedItems.length === 0
  ) {
    return markMealQuantitiesComplete(normalizedDraft);
  }

  const quantities = extractQuantityList(message);
  if (quantities.length === 0) return normalizedDraft;

  return markMealQuantitiesComplete({
    ...normalizedDraft,
    payload: {
      ...normalizedDraft.payload,
      items: normalizedItems.map((item, index) => ({
        ...item,
        ...(quantities[index] === undefined
          ? {}
          : { quantityGrams: quantities[index] }),
      })),
    },
  });
}

function completeFoodDraftFromMessage(
  draft: AssistantDraft,
  message: string,
): AssistantDraft {
  const normalized = normalize(message);
  const caloriesKcal = extractMacro(normalized, ["kcal", "calories"]);
  const proteinGrams = extractMacro(normalized, ["proteines", "protein"]);
  const carbsGrams = extractMacro(normalized, ["glucides", "carbs"]);
  const fatGrams = extractMacro(normalized, ["lipides", "fat"]);
  const fiberGrams = extractMacro(normalized, ["fibres", "fiber"]);
  const payload = {
    ...draft.payload,
    ...(caloriesKcal === null ? {} : { caloriesKcal }),
    ...(proteinGrams === null ? {} : { proteinGrams }),
    ...(carbsGrams === null ? {} : { carbsGrams }),
    ...(fatGrams === null ? {} : { fatGrams }),
    ...(fiberGrams === null ? {} : { fiberGrams }),
  };
  const missingFields = draft.missingFields.filter((field) => {
    if (field === "caloriesKcal" && typeof payload.caloriesKcal === "number") {
      return false;
    }
    if (field === "proteinGrams" && typeof payload.proteinGrams === "number") {
      return false;
    }
    if (field === "carbsGrams" && typeof payload.carbsGrams === "number") {
      return false;
    }
    if (field === "fatGrams" && typeof payload.fatGrams === "number") {
      return false;
    }
    if (field === "fiberGrams" && typeof payload.fiberGrams === "number") {
      return false;
    }
    return true;
  });

  return sanitizeAssistantDraft({
    ...draft,
    missingFields,
    payload,
  });
}

function withFollowUpReply(draft: AssistantDraft): AssistantDraft {
  if (draft.action === "create_meal" || draft.action === "update_meal") {
    return {
      ...draft,
      reply:
        draft.missingFields.length === 0
          ? "C'est bon, je m'en occupe."
          : `Je peux continuer, mais il me manque encore ${humanizeMissingFields(
              draft.missingFields,
            )}.`,
    };
  }

  if (draft.action === "create_food") {
    return {
      ...draft,
      reply:
        draft.missingFields.length === 0
          ? "C'est bon, je m'en occupe."
          : `Je peux continuer, mais il me manque encore ${humanizeMissingFields(
              draft.missingFields,
            )}.`,
    };
  }

  return draft;
}

function draftMeal(message: string, normalized: string, now: Date) {
  if (!/(repas|dejeuner|diner|petit dej|petit-dej|collation)/.test(normalized)) {
    return null;
  }

  if (/(supprime|supprimer|efface|retire)/.test(normalized)) {
    return destructiveDraft(
      "delete_meal",
      "Preparer la suppression d'un repas.",
      message,
    );
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
  const isUpdate = /(modifie|modifier|corrige|corriger|remplace)/.test(
    normalized,
  );

  return {
    action: isUpdate ? "update_meal" : "create_meal",
    confidence: itemNames.length > 0 ? "medium" : "low",
    missingFields: [
      ...(isUpdate ? ["id"] : []),
      ...(itemNames.length > 0 ? ["foodIds", "quantities"] : ["items"]),
    ],
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
    summary: isUpdate
      ? `Preparer la modification d'un repas ${mealType} avec ${itemNames.length} element(s).`
      : `Preparer un repas ${mealType} avec ${itemNames.length} element(s).`,
  } satisfies AssistantDraft;
}

function draftWorkout(message: string, normalized: string, now: Date) {
  if (!/(seance|entrainement|training|workout)/.test(normalized)) return null;

  if (/(supprime|supprimer|efface|retire|annule|annuler)/.test(normalized)) {
    return destructiveDraft(
      "delete_workout",
      "Preparer la suppression d'une seance.",
      message,
    );
  }

  const hourMatch = normalized.match(/(\d{1,2})\s*h/);
  const hour = hourMatch ? Number(hourMatch[1]) : 18;
  const date = /demain/.test(normalized)
    ? isoTomorrowAtHour(now, hour)
    : isoAtHour(now, hour);
  const nameMatch = normalized.match(/\b(push|pull|legs|full body|cardio)\b/);
  const name = nameMatch ? nameMatch[1] : "Seance";
  const isUpdate = /(modifie|modifier|corrige|corriger|deplace|deplacer)/.test(
    normalized,
  );

  return {
    action: isUpdate ? "update_workout" : "create_workout",
    confidence: "medium",
    missingFields: [...(isUpdate ? ["id"] : []), "exerciseIds", "sets"],
    payload: {
      date,
      duration: 60,
      name,
      notes: message,
      status: new Date(date).getTime() > now.getTime() ? "PLANNED" : "COMPLETED",
    },
    requiresConfirmation: true,
    summary: isUpdate
      ? `Preparer la modification d'une seance ${name}.`
      : `Preparer une seance ${name}.`,
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

  const draft =
    draftExercise(message, normalized) ??
    draftFood(message, normalized) ??
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
    };

  return normalizeAssistantDraft(draft, message);
}

export function sanitizeAssistantDraft(draft: AssistantDraft): AssistantDraft {
  if (draft.action === "create_meal" || draft.action === "update_meal") {
    return normalizeMealDraft(draft);
  }

  if (draft.action !== "create_food" || typeof draft.payload.name !== "string") {
    return draft;
  }

  const name = cleanFoodName(draft.payload.name);
  if (!name || name === draft.payload.name) return draft;

  return {
    ...draft,
    payload: {
      ...draft.payload,
      name,
    },
    summary: `Preparer l'aliment ${name}.`,
  };
}

export function normalizeAssistantDraft(
  draft: AssistantDraft,
  sourceMessage?: string,
): AssistantDraft {
  return sanitizeAssistantDraft(normalizeMealDraft(draft, sourceMessage));
}

export function continueAssistantDraft(
  draft: AssistantDraft,
  message: string,
): AssistantDraft {
  const nextDraft =
    draft.action === "create_meal" || draft.action === "update_meal"
      ? completeMealDraftFromMessage(draft, message)
      : draft.action === "create_food"
        ? completeFoodDraftFromMessage(draft, message)
        : draft;

  return withFollowUpReply(normalizeAssistantDraft(nextDraft, message));
}
