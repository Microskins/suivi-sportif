// filepath: server/src/routes/exercises.ts
import { FastifyInstance } from "fastify";
import * as exercises from "../db/queries/exercises.js";
import {
  createExerciseSchema,
  idParamSchema,
  muscleGroupParamSchema,
  updateExerciseSchema,
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

const exerciseSchema = {
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
  required: [
    "id",
    "name",
    "description",
    "difficulty",
    "exerciseType",
    "createdAt",
    "updatedAt",
  ],
};

export async function exercisesRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  // GET /api/exercises - List all exercises
  fastify.get(
    "/",
    {
      schema: {
        tags: ["exercises"],
        summary: "List exercises",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: "object",
            properties: {
              data: { type: "array", items: exerciseSchema },
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
      const { items, total } = await exercises.getExercises({
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

  // GET /api/exercises/:id - Get exercise by ID
  fastify.get(
    "/:id",
    {
      schema: {
        tags: ["exercises"],
        summary: "Get exercise by id",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "string", format: "uuid" } },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: { data: exerciseSchema },
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
      const exercise = await exercises.getExerciseById(id);

      if (!exercise) {
        return sendNotFound(reply, "Exercise not found", "EXERCISE_NOT_FOUND");
      }

      return sendOk(reply, exercise);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return sendValidationError(reply, error.errors);
      }
      fastify.log.error(error);
      return sendInternalError(reply);
    }
    },
  );

  // GET /api/exercises/muscle/:group - Get exercises by muscle group
  fastify.get(
    "/muscle/:group",
    {
      schema: {
        tags: ["exercises"],
        summary: "List exercises by muscle group",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { group: { type: "string" } },
          required: ["group"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              data: { type: "array", items: exerciseSchema },
              meta: metaSchema,
            },
            required: ["data", "meta"],
          },
          400: errorResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
    try {
      const { group } = muscleGroupParamSchema.parse(request.params);
      const { page, limit } = parsePagination(request.query as Record<string, unknown>);
      const { items, total } = await exercises.getExercisesByMuscleGroup(group, {
        skip: (page - 1) * limit,
        take: limit,
      });
      return sendList(reply, items, { total, page, limit });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return sendValidationError(reply, error.errors);
      }
      fastify.log.error(error);
      return sendInternalError(reply);
    }
    },
  );

  // POST /api/exercises - Create new exercise
  fastify.post(
    "/",
    {
      schema: {
        tags: ["exercises"],
        summary: "Create exercise",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: ["string", "null"] },
            difficulty: { type: "string" },
            exerciseType: { type: "string" },
          },
          required: ["name"],
        },
        response: {
          201: {
            type: "object",
            properties: { data: exerciseSchema },
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
      const data = request.body as object;
      const parsed = createExerciseSchema.parse(data);

      const exercise = await exercises.createExercise(parsed);
      return sendCreated(reply, exercise);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return sendValidationError(reply, error.errors);
      }
      fastify.log.error(error);
      return sendInternalError(reply);
    }
    },
  );

  // PUT /api/exercises/:id - Update exercise
  fastify.put(
    "/:id",
    {
      schema: {
        tags: ["exercises"],
        summary: "Update exercise",
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
            description: { type: ["string", "null"] },
            difficulty: { type: "string" },
            exerciseType: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: { data: exerciseSchema },
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
      const data = request.body as object;
      const parsed = updateExerciseSchema.parse(data);

      const exercise = await exercises.updateExercise(id, parsed);

      if (!exercise) {
        return sendNotFound(reply, "Exercise not found", "EXERCISE_NOT_FOUND");
      }

      return sendOk(reply, exercise);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return sendValidationError(reply, error.errors);
      }
      fastify.log.error(error);
      return sendInternalError(reply);
    }
    },
  );

  // DELETE /api/exercises/:id - Delete exercise
  fastify.delete(
    "/:id",
    {
      schema: {
        tags: ["exercises"],
        summary: "Delete exercise",
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
      const deleted = await exercises.deleteExercise(id);

      if (!deleted) {
        return sendNotFound(reply, "Exercise not found", "EXERCISE_NOT_FOUND");
      }

      return sendNoContent(reply);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return sendValidationError(reply, error.errors);
      }
      fastify.log.error(error);
      return sendInternalError(reply);
    }
    },
  );
}
