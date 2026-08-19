import { FastifyInstance } from "fastify";
import * as userGoals from "../db/queries/user-goals.js";
import {
  createUserGoalSchema,
  idParamSchema,
  updateUserGoalSchema,
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

export async function userGoalsRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

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
        const { page, limit } = parsePagination(request.query as Record<string, unknown>);
        const { items, total } = await userGoals.getUserGoals(request.user.id, {
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
          return sendNotFound(
            reply,
            "User goal not found",
            "USER_GOAL_NOT_FOUND",
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
          return sendNotFound(
            reply,
            "User goal not found",
            "USER_GOAL_NOT_FOUND",
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
          return sendNotFound(
            reply,
            "User goal not found",
            "USER_GOAL_NOT_FOUND",
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
