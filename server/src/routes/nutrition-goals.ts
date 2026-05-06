import { FastifyInstance } from "fastify";
import * as nutritionGoals from "../db/queries/nutrition-goals.js";
import {
  createNutritionGoalSchema,
  idParamSchema,
  updateNutritionGoalSchema,
} from "../schemas/index.js";

function validationError(reply: any, error: any) {
  return reply.code(400).send({
    error: "Validation failed",
    code: "VALIDATION_ERROR",
    details: error.errors,
  });
}

export async function nutritionGoalsRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply
        .code(401)
        .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
    }
  });

  fastify.get("/", async (request, reply) => {
    try {
      const result = await nutritionGoals.getNutritionGoals(request.user.id);
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

  fastify.get("/active", async (request, reply) => {
    try {
      const goal = await nutritionGoals.getActiveNutritionGoal(
        request.user.id,
      );
      if (!goal) {
        return reply.code(404).send({
          error: "Nutrition goal not found",
          code: "NUTRITION_GOAL_NOT_FOUND",
        });
      }

      return reply.code(200).send({ data: goal });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: "Internal Server Error",
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  });

  fastify.get("/:id", async (request, reply) => {
    try {
      const { id } = idParamSchema.parse(request.params);
      const goal = await nutritionGoals.getNutritionGoalById(
        id,
        request.user.id,
      );
      if (!goal) {
        return reply.code(404).send({
          error: "Nutrition goal not found",
          code: "NUTRITION_GOAL_NOT_FOUND",
        });
      }

      return reply.code(200).send({ data: goal });
    } catch (error: any) {
      if (error.name === "ZodError") return validationError(reply, error);
      fastify.log.error(error);
      return reply.code(500).send({
        error: "Internal Server Error",
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  });

  fastify.post("/", async (request, reply) => {
    try {
      const parsed = createNutritionGoalSchema.parse(request.body);
      const goal = await nutritionGoals.createNutritionGoal(
        request.user.id,
        parsed,
      );
      return reply.code(201).send({ data: goal });
    } catch (error: any) {
      if (error.name === "ZodError") return validationError(reply, error);
      fastify.log.error(error);
      return reply.code(500).send({
        error: "Internal Server Error",
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  });

  fastify.put("/:id", async (request, reply) => {
    try {
      const { id } = idParamSchema.parse(request.params);
      const parsed = updateNutritionGoalSchema.parse(request.body);
      const goal = await nutritionGoals.updateNutritionGoal(
        id,
        request.user.id,
        parsed,
      );
      if (!goal) {
        return reply.code(404).send({
          error: "Nutrition goal not found",
          code: "NUTRITION_GOAL_NOT_FOUND",
        });
      }

      return reply.code(200).send({ data: goal });
    } catch (error: any) {
      if (error.name === "ZodError") return validationError(reply, error);
      fastify.log.error(error);
      return reply.code(500).send({
        error: "Internal Server Error",
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  });

  fastify.delete("/:id", async (request, reply) => {
    try {
      const { id } = idParamSchema.parse(request.params);
      const deleted = await nutritionGoals.deleteNutritionGoal(
        id,
        request.user.id,
      );
      if (!deleted) {
        return reply.code(404).send({
          error: "Nutrition goal not found",
          code: "NUTRITION_GOAL_NOT_FOUND",
        });
      }

      return reply.code(204).send();
    } catch (error: any) {
      if (error.name === "ZodError") return validationError(reply, error);
      fastify.log.error(error);
      return reply.code(500).send({
        error: "Internal Server Error",
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  });
}
