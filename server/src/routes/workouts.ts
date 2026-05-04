// filepath: server/src/routes/workouts.ts
import { FastifyInstance } from "fastify";
import * as workouts from "../db/queries/workouts.js";
import {
  createWorkoutSchema,
  dateRangeParamSchema,
  idParamSchema,
  updateWorkoutSchema,
} from "../schemas/index.js";

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
  fastify.get("/", async (request, reply) => {
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
  });

  // GET /api/workouts/range/:start/:end - Get workouts by date range
  fastify.get("/range/:start/:end", async (request, reply) => {
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
  });

  // GET /api/workouts/:id - Get workout by ID
  fastify.get("/:id", async (request, reply) => {
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
  });

  // POST /api/workouts - Create new workout
  fastify.post("/", async (request, reply) => {
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
  });

  // PUT /api/workouts/:id - Update workout
  fastify.put("/:id", async (request, reply) => {
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
  });

  // DELETE /api/workouts/:id - Delete workout
  fastify.delete("/:id", async (request, reply) => {
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
  });
}
