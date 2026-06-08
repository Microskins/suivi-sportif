import { FastifyInstance } from "fastify";
import { assistantDraftRequestSchema } from "../schemas/index.js";
import { createAssistantDraft } from "../services/assistant-drafts.js";

const errorResponseSchema = {
  type: "object",
  properties: {
    error: { type: "string" },
    code: { type: "string" },
  },
  required: ["error", "code"],
};

const validationErrorResponseSchema = {
  type: "object",
  properties: {
    error: { type: "string" },
    code: { type: "string" },
    details: { type: "array" },
  },
  required: ["error", "code", "details"],
};

const assistantDraftSchema = {
  type: "object",
  properties: {
    action: {
      type: "string",
      enum: [
        "create_meal",
        "create_body_measurement",
        "create_workout",
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
};

const assistantDraftResponseSchema = {
  type: "object",
  properties: { data: assistantDraftSchema },
  required: ["data"],
};

function validationError(reply: any, error: any) {
  return reply.code(400).send({
    error: "Validation failed",
    code: "VALIDATION_ERROR",
    details: error.errors,
  });
}

export async function assistantRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply
        .code(401)
        .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
    }
  });

  fastify.post(
    "/draft",
    {
      schema: {
        tags: ["assistant"],
        summary: "Create assistant action draft",
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
        const draft = createAssistantDraft(parsed);
        return reply.code(200).send({ data: draft });
      } catch (error: any) {
        if (error.name === "ZodError") return validationError(reply, error);
        fastify.log.error(error);
        return reply.code(500).send({
          error: "Internal Server Error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  );
}
