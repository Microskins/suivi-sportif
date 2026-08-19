import { FastifyInstance } from "fastify";
import * as nutritionGoals from "../db/queries/nutrition-goals.js";
import {
  createNutritionGoalSchema,
  idParamSchema,
  updateNutritionGoalSchema,
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
  validationErrorResponseSchema,
} from "../lib/api-response.js";
import { authenticate } from "../plugins/auth.js";

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

export async function nutritionGoalsRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

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
      const { page, limit } = parsePagination(request.query as Record<string, unknown>);
      const { items, total } = await nutritionGoals.getNutritionGoals(
        request.user.id,
        { skip: (page - 1) * limit, take: limit },
      );
      return sendList(reply, items, { total, page, limit });
    } catch (error) {
      fastify.log.error(error);
      return sendInternalError(reply);
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
        return sendNotFound(
          reply,
          "Nutrition goal not found",
          "NUTRITION_GOAL_NOT_FOUND",
        );
      }

      return sendOk(reply, goal);
    } catch (error) {
      fastify.log.error(error);
      return sendInternalError(reply);
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
        return sendNotFound(
          reply,
          "Nutrition goal not found",
          "NUTRITION_GOAL_NOT_FOUND",
        );
      }

      return sendOk(reply, goal);
    } catch (error: any) {
      if (error.name === "ZodError") return sendValidationError(reply, error.errors);
      fastify.log.error(error);
      return sendInternalError(reply);
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
      return sendCreated(reply, goal);
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
        return sendNotFound(
          reply,
          "Nutrition goal not found",
          "NUTRITION_GOAL_NOT_FOUND",
        );
      }

      return sendOk(reply, goal);
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
        return sendNotFound(
          reply,
          "Nutrition goal not found",
          "NUTRITION_GOAL_NOT_FOUND",
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
}
