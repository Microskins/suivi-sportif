import { FastifyInstance } from "fastify";
import * as nutritionGoals from "../db/queries/nutrition-goals.js";
import {
  createNutritionGoalSchema,
  idParamSchema,
  updateNutritionGoalSchema,
} from "../schemas/index.js";

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

const metaSchema = {
  type: "object",
  properties: {
    total: { type: "number" },
    page: { type: "number" },
    limit: { type: "number" },
  },
  required: ["total", "page", "limit"],
};

const nutritionGoalBodySchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    startDate: { type: "string", format: "date-time" },
    endDate: { type: ["string", "null"], format: "date-time" },
    dailyCaloriesKcal: { type: "number" },
    dailyProteinGrams: { type: ["number", "null"] },
    dailyCarbsGrams: { type: ["number", "null"] },
    dailyFatGrams: { type: ["number", "null"] },
    isActive: { type: "boolean" },
  },
  required: ["name", "startDate", "dailyCaloriesKcal"],
};

const nutritionGoalSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    userId: { type: "string", format: "uuid" },
    name: { type: "string" },
    startDate: { type: "string", format: "date-time" },
    endDate: { type: ["string", "null"], format: "date-time" },
    dailyCaloriesKcal: { type: "number" },
    dailyProteinGrams: { type: ["number", "null"] },
    dailyCarbsGrams: { type: ["number", "null"] },
    dailyFatGrams: { type: ["number", "null"] },
    isActive: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
  required: [
    "id",
    "userId",
    "name",
    "startDate",
    "endDate",
    "dailyCaloriesKcal",
    "dailyProteinGrams",
    "dailyCarbsGrams",
    "dailyFatGrams",
    "isActive",
    "createdAt",
    "updatedAt",
  ],
};

const nutritionGoalListResponseSchema = {
  type: "object",
  properties: {
    data: { type: "array", items: nutritionGoalSchema },
    meta: metaSchema,
  },
  required: ["data", "meta"],
};

const nutritionGoalResponseSchema = {
  type: "object",
  properties: { data: nutritionGoalSchema },
  required: ["data"],
};

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

  fastify.get(
    "/",
    {
      schema: {
        tags: ["nutrition-goals"],
        summary: "List nutrition goals",
        security: [{ bearerAuth: [] }],
        response: {
          200: nutritionGoalListResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
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
    },
  );

  fastify.get(
    "/active",
    {
      schema: {
        tags: ["nutrition-goals"],
        summary: "Get active nutrition goal",
        security: [{ bearerAuth: [] }],
        response: {
          200: nutritionGoalResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
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
    },
  );

  fastify.get(
    "/:id",
    {
      schema: {
        tags: ["nutrition-goals"],
        summary: "Get nutrition goal by id",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "string", format: "uuid" } },
          required: ["id"],
        },
        response: {
          200: nutritionGoalResponseSchema,
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
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
    },
  );

  fastify.post(
    "/",
    {
      schema: {
        tags: ["nutrition-goals"],
        summary: "Create nutrition goal",
        security: [{ bearerAuth: [] }],
        body: nutritionGoalBodySchema,
        response: {
          201: nutritionGoalResponseSchema,
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
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
    },
  );

  fastify.put(
    "/:id",
    {
      schema: {
        tags: ["nutrition-goals"],
        summary: "Update nutrition goal",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "string", format: "uuid" } },
          required: ["id"],
        },
        body: {
          ...nutritionGoalBodySchema,
          required: [],
        },
        response: {
          200: nutritionGoalResponseSchema,
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
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
    },
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        tags: ["nutrition-goals"],
        summary: "Delete nutrition goal",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "string", format: "uuid" } },
          required: ["id"],
        },
        response: {
          204: { type: "null" },
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
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
    },
  );
}
