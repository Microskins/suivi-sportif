import { FastifyInstance } from "fastify";
import * as workoutTemplates from "../db/queries/workout-templates.js";
import {
  idParamSchema,
  instantiateWorkoutTemplateSchema,
} from "../schemas/index.js";

const errorResponseSchema = {
  type: "object",
  properties: {
    error: { type: "string" },
    code: { type: "string" },
  },
  required: ["error", "code"],
};

const workoutTemplateSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string" },
    category: { type: "string" },
    level: { type: "string" },
    duration: { type: "number" },
    description: { type: ["string", "null"] },
    displayOrder: { type: "number" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    exercises: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          exerciseId: { type: "string", format: "uuid" },
          order: { type: "number" },
          sets: { type: "number" },
          reps: { type: "number" },
          durationSeconds: { type: ["number", "null"] },
          rest: { type: "number" },
          weight: { type: "number" },
          exercise: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              name: { type: "string" },
              description: { type: ["string", "null"] },
              difficulty: { type: "string" },
              exerciseType: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
        },
      },
    },
  },
  required: [
    "id",
    "name",
    "category",
    "level",
    "duration",
    "description",
    "displayOrder",
    "createdAt",
    "updatedAt",
    "exercises",
  ],
};

const workoutSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    userId: { type: "string", format: "uuid" },
    name: { type: "string" },
    date: { type: "string", format: "date-time" },
    duration: { type: "number" },
    notes: { type: ["string", "null"] },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    exercises: { type: "array", items: { type: "object" } },
  },
  required: [
    "id",
    "userId",
    "name",
    "date",
    "duration",
    "notes",
    "createdAt",
    "updatedAt",
  ],
};

export async function workoutTemplatesRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply
        .code(401)
        .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
    }
  });

  fastify.get(
    "/",
    {
      schema: {
        tags: ["workout-templates"],
        summary: "List workout templates",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: "object",
            properties: {
              data: { type: "array", items: workoutTemplateSchema },
              meta: {
                type: "object",
                properties: {
                  total: { type: "number" },
                  page: { type: "number" },
                  limit: { type: "number" },
                },
                required: ["total", "page", "limit"],
              },
            },
            required: ["data", "meta"],
          },
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await workoutTemplates.getWorkoutTemplates();
        return reply.code(200).send({
          data: result,
          meta: { total: result.length, page: 1, limit: result.length },
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          error: "Internal Server Error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  );

  fastify.post(
    "/:id/instantiate",
    {
      schema: {
        tags: ["workout-templates"],
        summary: "Instantiate workout template",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "string", format: "uuid" } },
          required: ["id"],
        },
        body: {
          type: "object",
          properties: {
            date: { type: "string", format: "date-time" },
          },
          required: ["date"],
        },
        response: {
          201: {
            type: "object",
            properties: { data: workoutSchema },
            required: ["data"],
          },
          400: errorResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = idParamSchema.parse(request.params);
        const parsed = instantiateWorkoutTemplateSchema.parse(request.body);
        const workout = await workoutTemplates.instantiateWorkoutTemplate(
          id,
          request.user.id,
          parsed,
        );

        if (!workout) {
          return reply.code(404).send({
            error: "Workout template not found",
            code: "WORKOUT_TEMPLATE_NOT_FOUND",
          });
        }

        return reply.code(201).send({ data: workout });
      } catch (error: any) {
        if (error.name === "ZodError") {
          return reply.code(400).send({
            error: "Validation failed",
            code: "VALIDATION_ERROR",
            details: error.errors,
          });
        }
        fastify.log.error(error);
        return reply.code(500).send({
          error: "Internal Server Error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  );
}
