// filepath: server/src/routes/exercises.ts
import { FastifyInstance } from "fastify";
import * as exercises from "../db/queries/exercises.js";
import {
  createExerciseSchema,
  idParamSchema,
  muscleGroupParamSchema,
  updateExerciseSchema,
} from "../schemas/index.js";

export async function exercisesRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply
        .code(401)
        .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
    }
  });

  // GET /api/exercises - List all exercises
  fastify.get("/", async (request, reply) => {
    try {
      const result = await exercises.getExercises();
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

  // GET /api/exercises/:id - Get exercise by ID
  fastify.get("/:id", async (request, reply) => {
    try {
      const { id } = idParamSchema.parse(request.params);
      const exercise = await exercises.getExerciseById(id);

      if (!exercise) {
        return reply
          .code(404)
          .send({ error: "Exercise not found", code: "EXERCISE_NOT_FOUND" });
      }

      return reply.code(200).send({ data: exercise });
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

  // GET /api/exercises/muscle/:group - Get exercises by muscle group
  fastify.get("/muscle/:group", async (request, reply) => {
    try {
      const { group } = muscleGroupParamSchema.parse(request.params);
      const result = await exercises.getExercisesByMuscleGroup(group);
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

  // POST /api/exercises - Create new exercise
  fastify.post("/", async (request, reply) => {
    try {
      const data = request.body as object;
      const parsed = createExerciseSchema.parse(data);

      const exercise = await exercises.createExercise(parsed);
      return reply.code(201).send({ data: exercise });
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

  // PUT /api/exercises/:id - Update exercise
  fastify.put("/:id", async (request, reply) => {
    try {
      const { id } = idParamSchema.parse(request.params);
      const data = request.body as object;
      const parsed = updateExerciseSchema.parse(data);

      const exercise = await exercises.updateExercise(id, parsed);

      if (!exercise) {
        return reply
          .code(404)
          .send({ error: "Exercise not found", code: "EXERCISE_NOT_FOUND" });
      }

      return reply.code(200).send({ data: exercise });
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

  // DELETE /api/exercises/:id - Delete exercise
  fastify.delete("/:id", async (request, reply) => {
    try {
      const { id } = idParamSchema.parse(request.params);
      const deleted = await exercises.deleteExercise(id);

      if (!deleted) {
        return reply
          .code(404)
          .send({ error: "Exercise not found", code: "EXERCISE_NOT_FOUND" });
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
