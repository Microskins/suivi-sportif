import { FastifyInstance } from "fastify";
import { assistantDraftRequestSchema } from "../schemas/index.js";
import { createAssistantDraftWithAi } from "../services/assistant-ai.js";
import { enrichAssistantDraft } from "../services/assistant-orchestrator.js";
import {
  errorResponseSchema,
  sendInternalError,
  sendOk,
  sendValidationError,
  validationErrorResponseSchema,
} from "../lib/api-response.js";
import { authenticate } from "../plugins/auth.js";

const assistantDraftSchema = {
  type: "object",
  properties: {
    action: {
      type: "string",
      enum: [
        "create_meal",
        "create_food",
        "create_exercise",
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
    reply: { type: "string" },
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
};

const assistantDraftResponseSchema = {
  type: "object",
  properties: { data: assistantDraftSchema },
  required: ["data"],
};

export async function assistantRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  fastify.post(
    "/draft",
    {
      schema: {
        tags: ["assistant"],
        summary: "Create assistant chat reply",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          properties: {
            context: {
              type: "string",
              enum: [
                "dashboard",
                "profile",
                "meals",
                "workouts",
                "measurements",
                "goals",
              ],
            },
            history: {
              type: "array",
              maxItems: 20,
              items: {
                type: "object",
                properties: {
                  content: { type: "string", minLength: 1, maxLength: 2000 },
                  role: { type: "string", enum: ["user", "assistant"] },
                },
                required: ["content", "role"],
              },
            },
            currentDraft: assistantDraftSchema,
            message: { type: "string", minLength: 3, maxLength: 2000 },
          },
          required: ["message"],
        },
        response: {
          200: assistantDraftResponseSchema,
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const parsed = assistantDraftRequestSchema.parse(request.body);
        const draft = await createAssistantDraftWithAi(parsed, {
          logger: fastify.log,
        });
        const enrichedDraft = await enrichAssistantDraft(draft, {
          userId: request.user.id,
        });
        return sendOk(reply, enrichedDraft);
      } catch (error: any) {
        if (error.name === "ZodError") return sendValidationError(reply, error.errors);
        fastify.log.error(error);
        return sendInternalError(reply);
      }
    },
  );
}
