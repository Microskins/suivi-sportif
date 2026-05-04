// filepath: server/src/routes/workouts.ts
import { FastifyInstance } from "fastify";
import * as workouts from "../db/queries/workouts.js";
import {
  createWorkoutSchema,
  dateRangeParamSchema,
  idParamSchema,
  updateWorkoutSchema,
} from "../schemas/index.js";

const errorResponseSchema = {
  type: "object",
  properties: {
    error: { type: "string" },
    code: { type: "string" },
  },
  required: ["error", "code"],
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
    exercises: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          exerciseId: { type: "string", format: "uuid" },
          order: { type: "number" },
          sets: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                setNumber: { type: "number" },
                reps: { type: "number" },
                weight: { type: "number" },
                rest: { type: "number" },
                createdAt: { type: "string", format: "date-time" },
              },
            },
          },
        },
      },
    },
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

export async function workoutsRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply
        .code(401)
        .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
    }
  });

  // GET /api/workouts - List all workouts for user
  fastify.get(
    "/",
    {
      schema: {
        tags: ["workouts"],
        summary: "List workouts",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: "object",
            properties: {
              data: { type: "array", items: workoutSchema },
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
      const userId = request.user.id;
      const result = await workouts.getWorkouts(userId);
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

  // GET /api/workouts/range/:start/:end - Get workouts by date range
  fastify.get(
    "/range/:start/:end",
    {
      schema: {
        tags: ["workouts"],
        summary: "List workouts by date range",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            start: { type: "string", format: "date-time" },
            end: { type: "string", format: "date-time" },
          },
          required: ["start", "end"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              data: { type: "array", items: workoutSchema },
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
          400: errorResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
    try {
      const { start, end } = dateRangeParamSchema.parse(request.params);
      const userId = request.user.id;
      const result = await workouts.getWorkoutsByDateRange(userId, start, end);
      return reply.code(200).send({
        data: result,
        meta: { total: result.length, page: 1, limit: result.length },
      });
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

  // GET /api/workouts/:id - Get workout by ID
  fastify.get(
    "/:id",
    {
      schema: {
        tags: ["workouts"],
        summary: "Get workout by id",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "string", format: "uuid" } },
          required: ["id"],
        },
        response: {
          200: {
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
      const userId = request.user.id;
      const workout = await workouts.getWorkoutById(id, userId);

      if (!workout) {
        return reply
          .code(404)
          .send({ error: "Workout not found", code: "WORKOUT_NOT_FOUND" });
      }

      return reply.code(200).send({ data: workout });
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

  // POST /api/workouts - Create new workout
  fastify.post(
    "/",
    {
      schema: {
        tags: ["workouts"],
        summary: "Create workout",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            date: { type: "string", format: "date-time" },
            duration: { type: "number" },
            notes: { type: ["string", "null"] },
            exercises: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  exerciseId: { type: "string", format: "uuid" },
                  sets: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        reps: { type: "number" },
                        weight: { type: "number" },
                        rest: { type: "number" },
                      },
                      required: ["reps", "weight", "rest"],
                    },
                  },
                },
                required: ["exerciseId", "sets"],
              },
            },
          },
          required: ["name", "date", "duration"],
        },
        response: {
          201: {
            type: "object",
            properties: { data: workoutSchema },
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
      const parsed = createWorkoutSchema.parse(data);
      const userId = request.user.id;

      const workout = await workouts.createWorkout(userId, parsed);
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

  // PUT /api/workouts/:id - Update workout
  fastify.put(
    "/:id",
    {
      schema: {
        tags: ["workouts"],
        summary: "Update workout",
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
            date: { type: "string", format: "date-time" },
            duration: { type: "number" },
            notes: { type: ["string", "null"] },
          },
        },
        response: {
          200: {
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
      const data = request.body as object;
      const parsed = updateWorkoutSchema.parse(data);
      const userId = request.user.id;

      const workout = await workouts.updateWorkout(id, userId, parsed);

      if (!workout) {
        return reply
          .code(404)
          .send({ error: "Workout not found", code: "WORKOUT_NOT_FOUND" });
      }

      return reply.code(200).send({ data: workout });
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

  // DELETE /api/workouts/:id - Delete workout
  fastify.delete(
    "/:id",
    {
      schema: {
        tags: ["workouts"],
        summary: "Delete workout",
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
      const userId = request.user.id;
      const deleted = await workouts.deleteWorkout(id, userId);

      if (!deleted) {
        return reply
          .code(404)
          .send({ error: "Workout not found", code: "WORKOUT_NOT_FOUND" });
      }

      return reply.code(204).send();
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
