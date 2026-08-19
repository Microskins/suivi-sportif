// filepath: server/src/routes/workouts.ts
import { FastifyInstance } from "fastify";
import * as workouts from "../db/queries/workouts.js";
import {
  createWorkoutSchema,
  dateRangeParamSchema,
  idParamSchema,
  updateWorkoutSchema,
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
                durationMinutes: { type: ["number", "null"] },
                avgKmh: { type: ["number", "null"] },
                inclinePercent: { type: ["number", "null"] },
                rpe: { type: ["number", "null"] },
                rir: { type: ["number", "null"] },
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
    "status",
    "duration",
    "notes",
    "createdAt",
    "updatedAt",
  ],
};

export async function workoutsRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

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
      const userId = request.user.id;
      const { page, limit } = parsePagination(request.query as Record<string, unknown>);
      const { items, total } = await workouts.getWorkouts(userId, {
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
      const { start, end } = dateRangeParamSchema.parse(request.params);
      const userId = request.user.id;
      const { page, limit } = parsePagination(request.query as Record<string, unknown>);
      const { items, total } = await workouts.getWorkoutsByDateRange(
        userId,
        start,
        end,
        { skip: (page - 1) * limit, take: limit },
      );
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
        return sendNotFound(reply, "Workout not found", "WORKOUT_NOT_FOUND");
      }

      return sendOk(reply, workout);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return sendValidationError(reply, error.errors);
      }
      fastify.log.error(error);
      return sendInternalError(reply);
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
            status: { type: "string", enum: ["PLANNED", "COMPLETED", "CANCELED"] },
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
                        durationMinutes: { type: ["number", "null"] },
                        avgKmh: { type: ["number", "null"] },
                        inclinePercent: { type: ["number", "null"] },
                        rpe: { type: ["number", "null"] },
                        rir: { type: ["number", "null"] },
                        rest: { type: "number" },
                      },
                      required: ["rest"],
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
      return sendCreated(reply, workout);
    } catch (error: any) {
      const workoutError = error?.cause ?? error;
      if (error.name === "ZodError") {
        return sendValidationError(reply, error.errors);
      }
      const isWorkoutValidationError =
        (typeof workouts.WorkoutValidationError === "function" &&
          workoutError instanceof workouts.WorkoutValidationError) ||
        workoutError?.name === "WorkoutValidationError" ||
        workoutError?.message === "Validation failed" ||
        Array.isArray(workoutError?.details);
      if (isWorkoutValidationError) {
        return sendValidationError(reply, workoutError?.details ?? []);
      }
      fastify.log.error(error);
      return sendInternalError(reply);
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
            status: { type: "string", enum: ["PLANNED", "COMPLETED", "CANCELED"] },
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
                        durationMinutes: { type: ["number", "null"] },
                        avgKmh: { type: ["number", "null"] },
                        inclinePercent: { type: ["number", "null"] },
                        rpe: { type: ["number", "null"] },
                        rir: { type: ["number", "null"] },
                        rest: { type: "number" },
                      },
                      required: ["rest"],
                    },
                  },
                },
                required: ["exerciseId", "sets"],
              },
            },
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
        return sendNotFound(reply, "Workout not found", "WORKOUT_NOT_FOUND");
      }

      return sendOk(reply, workout);
    } catch (error: any) {
      const workoutError = error?.cause ?? error;
      if (error.name === "ZodError") {
        return sendValidationError(reply, error.errors);
      }
      const isWorkoutValidationError =
        (typeof workouts.WorkoutValidationError === "function" &&
          workoutError instanceof workouts.WorkoutValidationError) ||
        workoutError?.name === "WorkoutValidationError" ||
        workoutError?.message === "Validation failed" ||
        Array.isArray(workoutError?.details);
      if (isWorkoutValidationError) {
        return sendValidationError(reply, workoutError?.details ?? []);
      }
      fastify.log.error(error);
      return sendInternalError(reply);
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
        return sendNotFound(reply, "Workout not found", "WORKOUT_NOT_FOUND");
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
