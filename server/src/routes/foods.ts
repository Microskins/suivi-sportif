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

  fastify.get("/:id", async (request, reply) => {
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
  });

  fastify.post(
    "/",
    {
      schema: {
        tags: ["foods"],
        summary: "Create a custom food",
        security: [{ bearerAuth: [] }],
        response: { 400: errorResponseSchema, 401: errorResponseSchema },
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

  fastify.put("/:id", async (request, reply) => {
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
  });

  fastify.delete("/:id", async (request, reply) => {
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
  });
}
