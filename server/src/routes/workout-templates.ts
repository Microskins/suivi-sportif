import { FastifyInstance } from "fastify";
import * as workoutTemplates from "../db/queries/workout-templates.js";
import {
  createWorkoutTemplateSchema,
  idParamSchema,
  instantiateWorkoutTemplateSchema,
  updateWorkoutTemplateSchema,
} from "../schemas/index.js";
import {
  errorResponseSchema,
  metaSchema,
  parsePagination,
  sendCreated,
  sendInternalError,
  sendList,
  sendNoContent,
  sendNotFound,
  sendOk,
  sendValidationError,
} from "../lib/api-response.js";
import { authenticate } from "../plugins/auth.js";

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
              bodyParts: { type: "array", items: { type: "string" } },
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
    status: { type: "string", enum: ["PLANNED", "COMPLETED", "CANCELED"] },
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
    "status",
    "duration",
    "notes",
    "createdAt",
    "updatedAt",
  ],
};

export async function workoutTemplatesRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

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
              meta: metaSchema,
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
        const { page, limit } = parsePagination(request.query as Record<string, unknown>);
        const { items, total } = await workoutTemplates.getWorkoutTemplates({
          skip: (page - 1) * limit,
          take: limit,
        });
        return sendList(reply, items, { total, page, limit });
      } catch (error) {
        fastify.log.error(error);
        return sendInternalError(reply);
      }
    },
  );

  fastify.post(
    "/",
    {
      schema: {
        tags: ["workout-templates"],
        summary: "Create workout template",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            category: { type: "string" },
            level: { type: "string" },
            duration: { type: "number" },
            description: { type: ["string", "null"] },
            displayOrder: { type: "number" },
            exercises: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  exerciseId: { type: "string", format: "uuid" },
                  order: { type: "number" },
                  sets: { type: "number" },
                  reps: { type: "number" },
                  durationSeconds: { type: ["number", "null"] },
                  rest: { type: "number" },
                  weight: { type: "number" },
                },
                required: ["exerciseId", "order", "sets", "reps", "rest", "weight"],
              },
            },
          },
          required: ["name", "category", "level", "duration", "exercises"],
        },
        response: {
          201: {
            type: "object",
            properties: { data: workoutTemplateSchema },
            required: ["data"],
          },
          400: errorResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const parsed = createWorkoutTemplateSchema.parse(request.body);
        const template = await workoutTemplates.createWorkoutTemplate(parsed);
        return sendCreated(reply, template);
      } catch (error: any) {
        if (error.name === "ZodError") return sendValidationError(reply, error.errors);
        fastify.log.error(error);
        return sendInternalError(reply);
      }
    },
  );

  fastify.put(
    "/:id",
    {
      schema: {
        tags: ["workout-templates"],
        summary: "Update workout template",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "string", format: "uuid" } },
          required: ["id"],
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            category: { type: "string" },
            level: { type: "string" },
            duration: { type: "number" },
            description: { type: ["string", "null"] },
            displayOrder: { type: "number" },
            exercises: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  exerciseId: { type: "string", format: "uuid" },
                  order: { type: "number" },
                  sets: { type: "number" },
                  reps: { type: "number" },
                  durationSeconds: { type: ["number", "null"] },
                  rest: { type: "number" },
                  weight: { type: "number" },
                },
                required: ["exerciseId", "order", "sets", "reps", "rest", "weight"],
              },
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: { data: workoutTemplateSchema },
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
        const parsed = updateWorkoutTemplateSchema.parse(request.body);
        const template = await workoutTemplates.updateWorkoutTemplate(id, parsed);

        if (!template) {
          return sendNotFound(
            reply,
            "Workout template not found",
            "WORKOUT_TEMPLATE_NOT_FOUND",
          );
        }

        return sendOk(reply, template);
      } catch (error: any) {
        if (error.name === "ZodError") return sendValidationError(reply, error.errors);
        fastify.log.error(error);
        return sendInternalError(reply);
      }
    },
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        tags: ["workout-templates"],
        summary: "Delete workout template",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "string", format: "uuid" } },
          required: ["id"],
        },
        response: {
          204: { type: "null" },
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
        const deleted = await workoutTemplates.deleteWorkoutTemplate(id);

        if (!deleted) {
          return sendNotFound(
            reply,
            "Workout template not found",
            "WORKOUT_TEMPLATE_NOT_FOUND",
          );
        }

        return sendNoContent(reply);
      } catch (error: any) {
        if (error.name === "ZodError") return sendValidationError(reply, error.errors);
        fastify.log.error(error);
        return sendInternalError(reply);
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
          return sendNotFound(
            reply,
            "Workout template not found",
            "WORKOUT_TEMPLATE_NOT_FOUND",
          );
        }

        return sendCreated(reply, workout);
      } catch (error: any) {
        if (error.name === "ZodError") return sendValidationError(reply, error.errors);
        fastify.log.error(error);
        return sendInternalError(reply);
      }
    },
  );
}
