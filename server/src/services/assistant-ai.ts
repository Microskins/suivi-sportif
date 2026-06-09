import { z } from "zod";
import {
  assistantDraftRequestSchema,
  assistantDraftResponseSchema,
} from "../schemas/index.js";
import {
  AssistantDraft,
  createAssistantDraft,
  sanitizeAssistantDraft,
} from "./assistant-drafts.js";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";

const anthropicTextBlockSchema = z.object({
  text: z.string(),
  type: z.literal("text"),
});

const anthropicMessageSchema = z.object({
  content: z.array(z.unknown()),
  stop_reason: z.string().nullable().optional(),
});

type AssistantDraftRequest = z.infer<typeof assistantDraftRequestSchema>;

type AssistantAiOptions = {
  fetchImpl?: typeof fetch;
  logger?: {
    warn: (message: string) => void;
  };
  now?: Date;
};

const assistantDraftJsonSchema = {
  type: "object",
  properties: {
    action: {
      type: "string",
      enum: [
        "create_meal",
        "create_food",
        "update_meal",
        "delete_meal",
        "create_body_measurement",
        "update_body_measurement",
        "delete_body_measurement",
        "create_workout",
        "update_workout",
        "delete_workout",
        "create_user_goal",
        "update_profile",
        "unknown",
      ],
    },
    confidence: { type: "string", enum: ["low", "medium", "high"] },
    missingFields: { type: "array", items: { type: "string" } },
    payload: { type: "object", additionalProperties: true },
    requiresConfirmation: { type: "boolean" },
    summary: { type: "string" },
  },
  required: [
    "action",
    "confidence",
    "missingFields",
    "payload",
    "requiresConfirmation",
    "summary",
  ],
  additionalProperties: false,
};

function anthropicModel() {
  return process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_ANTHROPIC_MODEL;
}

function anthropicApiKey() {
  return process.env.ANTHROPIC_API_KEY?.trim() || null;
}

function buildPrompt(input: AssistantDraftRequest, fallbackDraft: AssistantDraft) {
  const history = input.history
    ?.slice(-12)
    .map((item) => `${item.role}: ${item.content}`)
    .join("\n");

  return [
    "Tu transformes une demande utilisateur en brouillon d'action pour une app de suivi sportif.",
    "Tu dois repondre uniquement avec un JSON valide conforme au schema.",
    "Ne cree, modifie ou supprime aucune donnee: ce brouillon sera confirme par l'utilisateur avant application.",
    "Actions disponibles: create_food, create_meal, update_meal, delete_meal, create_body_measurement, update_body_measurement, delete_body_measurement, create_workout, update_workout, delete_workout, create_user_goal, update_profile, unknown.",
    "N'ajoute jamais d'action ou de payload lie au sommeil: ce domaine n'est pas gere par cette application.",
    "Conserve les champs incomplets dans missingFields plutot que d'inventer des identifiants, quantites ou mots de passe.",
    "Pour toute modification ou suppression, ajoute id dans missingFields si l'identifiant de la donnee cible n'est pas explicitement connu.",
    "Pour les repas, si les aliments sont nommes mais pas lies a des foodIds, ajoute foodIds et quantities dans missingFields.",
    "Pour creer un aliment, action create_food avec name, caloriesKcal, proteinGrams, carbsGrams, fatGrams, fiberGrams optionnel, servingUnit. Si une valeur nutritionnelle manque, garde son champ dans missingFields.",
    "Pour une seance, ajoute exerciseIds et sets dans missingFields si la demande donne seulement les noms d'exercices.",
    "Pour un changement d'email ou mot de passe, currentPassword doit rester dans missingFields.",
    `Contexte: ${input.context ?? "dashboard"}.`,
    `Historique recent:\n${history || "Aucun historique."}`,
    `Message utilisateur: ${input.message}`,
    `Brouillon local de secours: ${JSON.stringify(fallbackDraft)}`,
  ].join("\n");
}

async function createAnthropicDraft(
  input: AssistantDraftRequest,
  fallbackDraft: AssistantDraft,
  options: AssistantAiOptions,
) {
  const apiKey = anthropicApiKey();
  if (!apiKey) return null;

  const fetchImpl = options.fetchImpl ?? fetch;
  const response = await fetchImpl(ANTHROPIC_API_URL, {
    body: JSON.stringify({
      max_tokens: 700,
      messages: [
        {
          content: buildPrompt(input, fallbackDraft),
          role: "user",
        },
      ],
      model: anthropicModel(),
      output_config: {
        format: {
          schema: assistantDraftJsonSchema,
          type: "json_schema",
        },
      },
    }),
    headers: {
      "anthropic-version": ANTHROPIC_VERSION,
      "content-type": "application/json",
      "x-api-key": apiKey,
    },
    method: "POST",
  });

  if (!response.ok) {
    options.logger?.warn("Assistant Anthropic request failed");
    return null;
  }

  const rawPayload = await response.json();
  const payload = anthropicMessageSchema.parse(rawPayload);
  if (payload.stop_reason === "refusal" || payload.stop_reason === "max_tokens") {
    options.logger?.warn("Assistant Anthropic response was incomplete");
    return null;
  }

  const textBlock = payload.content
    .map((block) => anthropicTextBlockSchema.safeParse(block))
    .find((block) => block.success);

  if (!textBlock?.success) return null;

  const parsedDraft = assistantDraftResponseSchema.safeParse(
    JSON.parse(textBlock.data.text),
  );

  return parsedDraft.success ? sanitizeAssistantDraft(parsedDraft.data) : null;
}

export async function createAssistantDraftWithAi(
  input: AssistantDraftRequest,
  options: AssistantAiOptions = {},
): Promise<AssistantDraft> {
  const fallbackDraft = sanitizeAssistantDraft(
    createAssistantDraft(input, options.now),
  );

  try {
    return (
      (await createAnthropicDraft(input, fallbackDraft, options)) ?? fallbackDraft
    );
  } catch {
    options.logger?.warn("Assistant AI draft validation failed");
    return fallbackDraft;
  }
}
