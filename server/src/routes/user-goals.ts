import { FastifyInstance } from "fastify";
import * as userGoals from "../db/queries/user-goals.js";
import {
  createUserGoalSchema,
  idParamSchema,
  updateUserGoalSchema,
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

const userGoalBodySchema = {
  type: "object",
  properties: {
    domain: { type: "string", enum: ["SPORT", "BODY"] },
    metric: {
      type: "string",
      enum: [
        "SPORT_WORKOUTS_PER_WEEK",
        "SPORT_MINUTES_PER_WEEK",
        "SPORT_EXERCISE_ONE_REP_MAX_KG",
        "SPORT_EXERCISE_TEN_REP_MAX_KG",
        "SPORT_EXERCISE_MAX_REPS",
        "BODY_WEIGHT_KG",
        "BODY_BMI",
        "BODY_FAT_PERCENT",
      ],
    },
    exerciseId: { type: ["string", "null"], format: "uuid" },
    direction: { type: "string", enum: ["AT_MOST", "AT_LEAST", "EXACT"] },
    name: { type: "string" },
    targetValue: { type: "number" },
    startDate: { type: "string", format: "date-time" },
    endDate: { type: ["string", "null"], format: "date-time" },
    isActive: { type: "boolean" },
    notes: { type: ["string", "null"] },
  },
  required: ["domain", "metric", "name", "targetValue", "startDate"],
};

const userGoalSchema = {
  ...userGoalBodySchema,
  properties: {
    id: { type: "string", format: "uuid" },
    userId: { type: "string", format: "uuid" },
    ...userGoalBodySchema.properties,
    direction: { type: "string", enum: ["AT_MOST", "AT_LEAST", "EXACT"] },
    endDate: { type: ["string", "null"], format: "date-time" },
    isActive: { type: "boolean" },
    notes: { type: ["string", "null"] },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
  required: [
    "id",
    "userId",
    "domain",
    "exerciseId",
    "metric",
    "direction",
    "name",
    "targetValue",
    "startDate",
    "endDate",
    "isActive",
    "notes",
    "createdAt",
    "updatedAt",
  ],
};

const userGoalListResponseSchema = {
  type: "object",
  properties: {
    data: { type: "array", items: userGoalSchema },
    meta: metaSchema,
  },
  required: ["data", "meta"],
};

const userGoalResponseSchema = {
  type: "object",
  properties: { data: userGoalSchema },
  required: ["data"],
};

function validationError(reply: any, error: any) {
  return reply.code(400).send({
    error: "Validation failed",
    code: "VALIDATION_ERROR",
    details: error.errors,
  });
}

export async function userGoalsRoutes(fastify: FastifyInstance) {
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
        tags: ["user-goals"],
        summary: "List user goals",
        security: [{ bearerAuth: [] }],
        response: {
          200: userGoalListResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await userGoals.getUserGoals(request.user.id);
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
        tags: ["user-goals"],
        summary: "Get user goal by id",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "string", format: "uuid" } },
          required: ["id"],
        },
        response: {
          200: userGoalResponseSchema,
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
        const goal = await userGoals.getUserGoalById(id, request.user.id);
        if (!goal) {
          return reply
            .code(404)
            .send({ error: "User goal not found", code: "USER_GOAL_NOT_FOUND" });
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
        tags: ["user-goals"],
        summary: "Create user goal",
        security: [{ bearerAuth: [] }],
        body: userGoalBodySchema,
        response: {
          201: userGoalResponseSchema,
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const parsed = createUserGoalSchema.parse(request.body);
        const goal = await userGoals.createUserGoal(request.user.id, parsed);
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
        tags: ["user-goals"],
        summary: "Update user goal",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "string", format: "uuid" } },
          required: ["id"],
        },
        body: { ...userGoalBodySchema, required: [] },
        response: {
          200: userGoalResponseSchema,
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
        const parsed = updateUserGoalSchema.parse(request.body);
        const goal = await userGoals.updateUserGoal(id, request.user.id, parsed);
        if (!goal) {
          return reply
            .code(404)
            .send({ error: "User goal not found", code: "USER_GOAL_NOT_FOUND" });
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
        tags: ["user-goals"],
        summary: "Delete user goal",
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
        const deleted = await userGoals.deleteUserGoal(id, request.user.id);
        if (!deleted) {
          return reply
            .code(404)
            .send({ error: "User goal not found", code: "USER_GOAL_NOT_FOUND" });
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
