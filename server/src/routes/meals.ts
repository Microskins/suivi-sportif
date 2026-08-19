import { FastifyInstance } from "fastify";
import * as meals from "../db/queries/meals.js";
import {
  createMealSchema,
  dateRangeParamSchema,
  idParamSchema,
  updateMealSchema,
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

const mealItemInputSchema = {
  type: "object",
  properties: {
    foodId: { type: "string", format: "uuid" },
    quantityGrams: { type: "number", minimum: 0.01 },
  },
  required: ["foodId", "quantityGrams"],
};

const mealBodySchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    date: { type: "string", format: "date-time" },
    mealType: {
      type: "string",
      enum: ["breakfast", "lunch", "dinner", "snack", "other"],
    },
    notes: { type: ["string", "null"] },
    items: { type: "array", items: mealItemInputSchema },
  },
  required: ["name", "date", "items"],
};

const mealSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    userId: { type: "string", format: "uuid" },
    name: { type: "string" },
    date: { type: "string", format: "date-time" },
    mealType: { type: "string" },
    notes: { type: ["string", "null"] },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          foodId: { type: ["string", "null"], format: "uuid" },
          foodName: { type: "string" },
          quantityGrams: { type: "number" },
          caloriesKcalPer100g: { type: "number" },
          proteinGramsPer100g: { type: "number" },
          carbsGramsPer100g: { type: "number" },
          fatGramsPer100g: { type: "number" },
          totals: {
            type: "object",
            properties: {
              caloriesKcal: { type: "number" },
              proteinGrams: { type: "number" },
              carbsGrams: { type: "number" },
              fatGrams: { type: "number" },
            },
            required: [
              "caloriesKcal",
              "proteinGrams",
              "carbsGrams",
              "fatGrams",
            ],
          },
          createdAt: { type: "string", format: "date-time" },
        },
        required: [
          "id",
          "foodId",
          "foodName",
          "quantityGrams",
          "caloriesKcalPer100g",
          "proteinGramsPer100g",
          "carbsGramsPer100g",
          "fatGramsPer100g",
          "totals",
          "createdAt",
        ],
      },
    },
    totals: {
      type: "object",
      properties: {
        caloriesKcal: { type: "number" },
        proteinGrams: { type: "number" },
        carbsGrams: { type: "number" },
        fatGrams: { type: "number" },
      },
      required: ["caloriesKcal", "proteinGrams", "carbsGrams", "fatGrams"],
    },
  },
  required: [
    "id",
    "userId",
    "name",
    "date",
    "mealType",
    "notes",
    "createdAt",
    "updatedAt",
    "items",
    "totals",
  ],
};

const mealListResponseSchema = {
  type: "object",
  properties: {
    data: { type: "array", items: mealSchema },
    meta: metaSchema,
  },
  required: ["data", "meta"],
};

const mealResponseSchema = {
  type: "object",
  properties: { data: mealSchema },
  required: ["data"],
};

export async function mealsRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  fastify.get(
    "/",
    {
      schema: {
        tags: ["meals"],
        summary: "List meals",
        security: [{ bearerAuth: [] }],
        response: {
          200: mealListResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
    try {
      const { page, limit } = parsePagination(request.query as Record<string, unknown>);
      const { items, total } = await meals.getMeals(request.user.id, {
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

  fastify.get(
    "/range/:start/:end",
    {
      schema: {
        tags: ["meals"],
        summary: "List meals by date range",
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
          200: mealListResponseSchema,
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
    try {
      const { start, end } = dateRangeParamSchema.parse(request.params);
      const { page, limit } = parsePagination(request.query as Record<string, unknown>);
      const { items, total } = await meals.getMealsByDateRange(
        request.user.id,
        start,
        end,
        { skip: (page - 1) * limit, take: limit },
      );
      return sendList(reply, items, { total, page, limit });
    } catch (error: any) {
      if (error.name === "ZodError") return sendValidationError(reply, error.errors);
      fastify.log.error(error);
      return sendInternalError(reply);
    }
    },
  );

  fastify.get(
    "/:id",
    {
      schema: {
        tags: ["meals"],
        summary: "Get meal by id",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "string", format: "uuid" } },
          required: ["id"],
        },
        response: {
          200: mealResponseSchema,
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
      const meal = await meals.getMealById(id, request.user.id);
      if (!meal) {
        return sendNotFound(reply, "Meal not found", "MEAL_NOT_FOUND");
      }

      return sendOk(reply, meal);
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
        tags: ["meals"],
        summary: "Create meal",
        security: [{ bearerAuth: [] }],
        body: mealBodySchema,
        response: {
          201: mealResponseSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
    try {
      const parsed = createMealSchema.parse(request.body);
      const meal = await meals.createMeal(request.user.id, parsed);
      if (!meal) {
        return sendNotFound(reply, "Food not found", "FOOD_NOT_FOUND");
      }

      return sendCreated(reply, meal);
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
        tags: ["meals"],
        summary: "Update meal",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "string", format: "uuid" } },
          required: ["id"],
        },
        body: {
          ...mealBodySchema,
          required: [],
        },
        response: {
          200: mealResponseSchema,
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
      const parsed = updateMealSchema.parse(request.body);
      const meal = await meals.updateMeal(id, request.user.id, parsed);
      if (!meal) {
        return sendNotFound(reply, "Meal not found", "MEAL_NOT_FOUND");
      }

      return sendOk(reply, meal);
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
        tags: ["meals"],
        summary: "Delete meal",
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
      const deleted = await meals.deleteMeal(id, request.user.id);
      if (!deleted) {
        return sendNotFound(reply, "Meal not found", "MEAL_NOT_FOUND");
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
