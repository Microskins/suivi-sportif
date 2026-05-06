import { FastifyInstance } from "fastify";
import * as meals from "../db/queries/meals.js";
import {
  createMealSchema,
  dateRangeParamSchema,
  idParamSchema,
  updateMealSchema,
} from "../schemas/index.js";

function validationError(reply: any, error: any) {
  return reply.code(400).send({
    error: "Validation failed",
    code: "VALIDATION_ERROR",
    details: error.errors,
  });
}

export async function mealsRoutes(fastify: FastifyInstance) {
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
      const result = await meals.getMeals(request.user.id);
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

  fastify.get("/range/:start/:end", async (request, reply) => {
    try {
      const { start, end } = dateRangeParamSchema.parse(request.params);
      const result = await meals.getMealsByDateRange(
        request.user.id,
        start,
        end,
      );
      return reply.code(200).send({
        data: result,
        meta: { total: result.length, page: 1, limit: result.length },
      });
    } catch (error: any) {
      if (error.name === "ZodError") return validationError(reply, error);
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
      const meal = await meals.getMealById(id, request.user.id);
      if (!meal) {
        return reply
          .code(404)
          .send({ error: "Meal not found", code: "MEAL_NOT_FOUND" });
      }

      return reply.code(200).send({ data: meal });
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
      const parsed = createMealSchema.parse(request.body);
      const meal = await meals.createMeal(request.user.id, parsed);
      if (!meal) {
        return reply
          .code(400)
          .send({ error: "Food not found", code: "FOOD_NOT_FOUND" });
      }

      return reply.code(201).send({ data: meal });
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
      const parsed = updateMealSchema.parse(request.body);
      const meal = await meals.updateMeal(id, request.user.id, parsed);
      if (!meal) {
        return reply
          .code(404)
          .send({ error: "Meal not found", code: "MEAL_NOT_FOUND" });
      }

      return reply.code(200).send({ data: meal });
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
      const deleted = await meals.deleteMeal(id, request.user.id);
      if (!deleted) {
        return reply
          .code(404)
          .send({ error: "Meal not found", code: "MEAL_NOT_FOUND" });
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
