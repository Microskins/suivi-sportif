import * as exercisesQueries from "../db/queries/exercises.js";
import * as foodsQueries from "../db/queries/foods.js";
import type { AssistantDraft } from "./assistant-drafts.js";

type AssistantOrchestratorOptions = {
  userId: string;
};

type NamedPayloadItem = {
  name?: unknown;
};

type MatchResult = {
  id: string;
  name: string;
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function compactMissingFields(fields: string[], remove: string[]) {
  const removeSet = new Set(remove);
  return fields.filter((field) => !removeSet.has(field));
}

function getNamedItems(payload: Record<string, unknown>) {
  const items = payload.items;
  if (!Array.isArray(items)) return [];

  return items
    .filter((item): item is NamedPayloadItem => Boolean(item))
    .map((item) => (typeof item.name === "string" ? item.name : null))
    .filter((name): name is string => Boolean(name));
}

function findByName<T extends { id: string; name: string }>(
  collection: T[],
  name: string,
): MatchResult | null {
  const normalizedName = normalize(name);
  const exact = collection.find((item) => normalize(item.name) === normalizedName);
  if (exact) return { id: exact.id, name: exact.name };

  const partial = collection.find((item) => {
    const normalizedItemName = normalize(item.name);
    return (
      normalizedItemName.includes(normalizedName) ||
      normalizedName.includes(normalizedItemName)
    );
  });

  return partial ? { id: partial.id, name: partial.name } : null;
}

async function enrichMealDraft(
  draft: AssistantDraft,
  options: AssistantOrchestratorOptions,
) {
  const itemNames = getNamedItems(draft.payload);
  if (itemNames.length === 0) return draft;

  const foods = (await foodsQueries.getFoods(options.userId)) ?? [];
  const matches = itemNames
    .map((name) => {
      const match = findByName(foods, name);
      return match ? { foodId: match.id, foodName: match.name, name } : null;
    })
    .filter((match): match is { foodId: string; foodName: string; name: string } =>
      Boolean(match),
    );

  if (matches.length === 0) return draft;

  return {
    ...draft,
    missingFields:
      matches.length === itemNames.length
        ? compactMissingFields(draft.missingFields, ["foodIds"])
        : draft.missingFields,
    payload: {
      ...draft.payload,
      items: itemNames.map((name) => {
        const match = matches.find((candidate) => candidate.name === name);
        return match ? { foodId: match.foodId, name, resolvedName: match.foodName } : { name };
      }),
    },
    summary: `${draft.summary} ${matches.length} aliment(s) reconnu(s).`,
  } satisfies AssistantDraft;
}

function extractExerciseNames(draft: AssistantDraft) {
  const payloadExercises = draft.payload.exercises;
  if (Array.isArray(payloadExercises)) {
    return payloadExercises
      .map((exercise) => {
        if (!exercise || typeof exercise !== "object") return null;
        const name = (exercise as { name?: unknown }).name;
        return typeof name === "string" ? name : null;
      })
      .filter((name): name is string => Boolean(name));
  }

  const notes = typeof draft.payload.notes === "string" ? draft.payload.notes : "";
  const exerciseText = notes.match(/\bavec\b(.+)$/i)?.[1] ?? notes;

  return exerciseText
    .split(/,|;|\bet\b/i)
    .map((part) => part.trim())
    .map((part) => part.replace(/[.!?]+$/g, ""))
    .filter((part) => part.length > 2);
}

async function enrichWorkoutDraft(draft: AssistantDraft) {
  const exerciseNames = extractExerciseNames(draft);
  if (exerciseNames.length === 0) return draft;

  const exercises = (await exercisesQueries.getExercises()) ?? [];
  const matches = exerciseNames
    .map((name) => {
      const match = findByName(exercises, name);
      return match
        ? { exerciseId: match.id, name, resolvedName: match.name }
        : null;
    })
    .filter(
      (match): match is { exerciseId: string; name: string; resolvedName: string } =>
        Boolean(match),
    );

  if (matches.length === 0) return draft;

  return {
    ...draft,
    missingFields:
      matches.length === exerciseNames.length
        ? compactMissingFields(draft.missingFields, ["exerciseIds"])
        : draft.missingFields,
    payload: {
      ...draft.payload,
      exercises: exerciseNames.map((name) => {
        const match = matches.find((candidate) => candidate.name === name);
        return match
          ? {
              exerciseId: match.exerciseId,
              name,
              resolvedName: match.resolvedName,
            }
          : { name };
      }),
    },
    summary: `${draft.summary} ${matches.length} exercice(s) reconnu(s).`,
  } satisfies AssistantDraft;
}

export async function enrichAssistantDraft(
  draft: AssistantDraft,
  options: AssistantOrchestratorOptions,
) {
  try {
    if (draft.action === "create_meal") {
      return enrichMealDraft(draft, options);
    }

    if (draft.action === "create_workout") {
      return enrichWorkoutDraft(draft);
    }

    return draft;
  } catch {
    return draft;
  }
}
