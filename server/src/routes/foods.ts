import { FastifyInstance } from "fastify";
import * as foods from "../db/queries/foods.js";
import {
  barcodeParamSchema,
  createFoodSchema,
  idParamSchema,
  updateFoodSchema,
} from "../schemas/index.js";
import { lookupFoodByBarcode } from "../services/open-food-facts.js";
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

const foodBodySchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    brand: { type: ["string", "null"] },
    barcode: { type: ["string", "null"] },
    caloriesKcal: { type: "number" },
    proteinGrams: { type: "number" },
    carbsGrams: { type: "number" },
    fatGrams: { type: "number" },
    fiberGrams: { type: ["number", "null"] },
    servingUnit: { type: "string", enum: ["g", "unit"] },
  },
  required: [
    "name",
    "caloriesKcal",
    "proteinGrams",
    "carbsGrams",
    "fatGrams",
  ],
};

const foodSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    userId: { type: ["string", "null"], format: "uuid" },
    name: { type: "string" },
    brand: { type: ["string", "null"] },
    barcode: { type: ["string", "null"] },
    caloriesKcal: { type: "number" },
    proteinGrams: { type: "number" },
    carbsGrams: { type: "number" },
    fatGrams: { type: "number" },
    fiberGrams: { type: ["number", "null"] },
    servingUnit: { type: "string", enum: ["g", "unit"] },
    isGlobal: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
  required: [
    "id",
    "userId",
    "name",
    "brand",
    "barcode",
    "caloriesKcal",
    "proteinGrams",
    "carbsGrams",
    "fatGrams",
    "fiberGrams",
    "servingUnit",
    "isGlobal",
    "createdAt",
    "updatedAt",
  ],
};

const foodListResponseSchema = {
  type: "object",
  properties: {
    data: { type: "array", items: foodSchema },
    meta: metaSchema,
  },
  required: ["data", "meta"],
};

const foodResponseSchema = {
  type: "object",
  properties: { data: foodSchema },
  required: ["data"],
};

const foodLookupSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    brand: { type: ["string", "null"] },
    barcode: { type: ["string", "null"] },
    caloriesKcal: { type: "number" },
    proteinGrams: { type: "number" },
    carbsGrams: { type: "number" },
    fatGrams: { type: "number" },
    fiberGrams: { type: ["number", "null"] },
    servingUnit: { type: "string", enum: ["g", "unit"] },
  },
  required: [
    "name",
    "brand",
    "barcode",
    "caloriesKcal",
    "proteinGrams",
    "carbsGrams",
    "fatGrams",
    "fiberGrams",
    "servingUnit",
  ],
};

const foodLookupResponseSchema = {
  type: "object",
  properties: { data: foodLookupSchema },
  required: ["data"],
};

export async function foodsRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  fastify.get(
    "/",
    {
      schema: {
        tags: ["foods"],
        summary: "List available foods",
        security: [{ bearerAuth: [] }],
        response: {
          200: foodListResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { page, limit } = parsePagination(request.query as Record<string, unknown>);
        const { items, total } = await foods.getFoods(request.user.id, {
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
    "/barcode/:barcode/lookup",
    {
      schema: {
        tags: ["foods"],
        summary: "Lookup food data by barcode",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { barcode: { type: "string", minLength: 3 } },
          required: ["barcode"],
        },
        response: {
          200: foodLookupResponseSchema,
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { barcode } = barcodeParamSchema.parse(request.params);
        const food = await lookupFoodByBarcode(barcode);
        if (!food) {
          return sendNotFound(reply, "Food not found", "FOOD_NOT_FOUND");
        }

        return sendOk(reply, food);
      } catch (error: any) {
        if (error.name === "ZodError") {
          return sendValidationError(reply, error.errors);
        }
        fastify.log.error(error);
        return sendInternalError(reply);
      }
    },
  );

  fastify.get(
    "/:id",
    {
      schema: {
        tags: ["foods"],
        summary: "Get food by id",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "string", format: "uuid" } },
          required: ["id"],
        },
        response: {
          200: foodResponseSchema,
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
      const food = await foods.getFoodById(id, request.user.id);
      if (!food) {
        return sendNotFound(reply, "Food not found", "FOOD_NOT_FOUND");
      }

      return sendOk(reply, food);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return sendValidationError(reply, error.errors);
      }
      fastify.log.error(error);
      return sendInternalError(reply);
    }
    },
  );

  fastify.post(
    "/",
    {
      schema: {
        tags: ["foods"],
        summary: "Create a custom food",
        security: [{ bearerAuth: [] }],
        body: foodBodySchema,
        response: {
          201: foodResponseSchema,
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const parsed = createFoodSchema.parse(request.body);
        const food = await foods.createFood(request.user.id, parsed);
        return sendCreated(reply, food);
      } catch (error: any) {
        if (error.name === "ZodError") {
          return sendValidationError(reply, error.errors);
        }
        fastify.log.error(error);
        return sendInternalError(reply);
      }
    },
  );

  fastify.put(
    "/:id",
    {
      schema: {
        tags: ["foods"],
        summary: "Update food",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "string", format: "uuid" } },
          required: ["id"],
        },
        body: {
          ...foodBodySchema,
          required: [],
        },
        response: {
          200: foodResponseSchema,
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
      const parsed = updateFoodSchema.parse(request.body);
      const food = await foods.updateFood(id, request.user.id, parsed);
      if (!food) {
        return sendNotFound(reply, "Food not found", "FOOD_NOT_FOUND");
      }

      return sendOk(reply, food);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return sendValidationError(reply, error.errors);
      }
      fastify.log.error(error);
      return sendInternalError(reply);
    }
    },
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        tags: ["foods"],
        summary: "Delete food",
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
      const deleted = await foods.deleteFood(id, request.user.id);
      if (!deleted) {
        return sendNotFound(reply, "Food not found", "FOOD_NOT_FOUND");
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
