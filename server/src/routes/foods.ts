import { FastifyInstance } from "fastify";
import * as foods from "../db/queries/foods.js";
import {
  createFoodSchema,
  idParamSchema,
  updateFoodSchema,
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
    servingUnit: { type: "string" },
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
    servingUnit: { type: "string" },
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

export async function foodsRoutes(fastify: FastifyInstance) {
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
        const result = await foods.getFoods(request.user.id);
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
        return reply
          .code(404)
          .send({ error: "Food not found", code: "FOOD_NOT_FOUND" });
      }

      return reply.code(200).send({ data: food });
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
        return reply.code(201).send({ data: food });
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
        return reply
          .code(404)
          .send({ error: "Food not found", code: "FOOD_NOT_FOUND" });
      }

      return reply.code(200).send({ data: food });
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
        return reply
          .code(404)
          .send({ error: "Food not found", code: "FOOD_NOT_FOUND" });
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
