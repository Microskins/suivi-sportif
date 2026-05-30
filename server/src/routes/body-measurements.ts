import { FastifyInstance } from "fastify";
import * as bodyMeasurements from "../db/queries/body-measurements.js";
import {
  createBodyMeasurementSchema,
  idParamSchema,
  updateBodyMeasurementSchema,
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

const nullableNumber = { type: ["number", "null"] };
const bodySilhouetteJsonSchema = {
  type: "string",
  enum: ["MALE", "FEMALE"],
};

const bodyMeasurementBodySchema = {
  type: "object",
  properties: {
    date: { type: "string", format: "date-time" },
    silhouette: bodySilhouetteJsonSchema,
    weightKg: nullableNumber,
    heightCm: nullableNumber,
    chestCm: nullableNumber,
    waistCm: nullableNumber,
    hipsCm: nullableNumber,
    neckCm: nullableNumber,
    shouldersCm: nullableNumber,
    leftArmCm: nullableNumber,
    rightArmCm: nullableNumber,
    leftForearmCm: nullableNumber,
    rightForearmCm: nullableNumber,
    leftThighCm: nullableNumber,
    rightThighCm: nullableNumber,
    leftCalfCm: nullableNumber,
    rightCalfCm: nullableNumber,
    notes: { type: ["string", "null"] },
  },
  required: ["date"],
};

const bodyMeasurementSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    userId: { type: "string", format: "uuid" },
    date: { type: "string", format: "date-time" },
    silhouette: bodySilhouetteJsonSchema,
    weightKg: nullableNumber,
    heightCm: nullableNumber,
    chestCm: nullableNumber,
    waistCm: nullableNumber,
    hipsCm: nullableNumber,
    neckCm: nullableNumber,
    shouldersCm: nullableNumber,
    leftArmCm: nullableNumber,
    rightArmCm: nullableNumber,
    leftForearmCm: nullableNumber,
    rightForearmCm: nullableNumber,
    leftThighCm: nullableNumber,
    rightThighCm: nullableNumber,
    leftCalfCm: nullableNumber,
    rightCalfCm: nullableNumber,
    notes: { type: ["string", "null"] },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
  required: [
    "id",
    "userId",
    "date",
    "silhouette",
    "weightKg",
    "heightCm",
    "chestCm",
    "waistCm",
    "hipsCm",
    "neckCm",
    "shouldersCm",
    "leftArmCm",
    "rightArmCm",
    "leftForearmCm",
    "rightForearmCm",
    "leftThighCm",
    "rightThighCm",
    "leftCalfCm",
    "rightCalfCm",
    "notes",
    "createdAt",
    "updatedAt",
  ],
};

const bodyMeasurementListResponseSchema = {
  type: "object",
  properties: {
    data: { type: "array", items: bodyMeasurementSchema },
    meta: metaSchema,
  },
  required: ["data", "meta"],
};

const bodyMeasurementResponseSchema = {
  type: "object",
  properties: { data: bodyMeasurementSchema },
  required: ["data"],
};

function validationError(reply: any, error: any) {
  return reply.code(400).send({
    error: "Validation failed",
    code: "VALIDATION_ERROR",
    details: error.errors,
  });
}

export async function bodyMeasurementsRoutes(fastify: FastifyInstance) {
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
        tags: ["body-measurements"],
        summary: "List body measurements",
        security: [{ bearerAuth: [] }],
        response: {
          200: bodyMeasurementListResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await bodyMeasurements.getBodyMeasurements(
          request.user.id,
        );
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
    "/latest",
    {
      schema: {
        tags: ["body-measurements"],
        summary: "Get latest body measurement",
        security: [{ bearerAuth: [] }],
        response: {
          200: bodyMeasurementResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const measurement = await bodyMeasurements.getLatestBodyMeasurement(
          request.user.id,
        );
        if (!measurement) {
          return reply.code(404).send({
            error: "Body measurement not found",
            code: "BODY_MEASUREMENT_NOT_FOUND",
          });
        }

        return reply.code(200).send({ data: measurement });
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
        tags: ["body-measurements"],
        summary: "Get body measurement by id",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "string", format: "uuid" } },
          required: ["id"],
        },
        response: {
          200: bodyMeasurementResponseSchema,
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
        const measurement = await bodyMeasurements.getBodyMeasurementById(
          id,
          request.user.id,
        );
        if (!measurement) {
          return reply.code(404).send({
            error: "Body measurement not found",
            code: "BODY_MEASUREMENT_NOT_FOUND",
          });
        }

        return reply.code(200).send({ data: measurement });
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
        tags: ["body-measurements"],
        summary: "Create body measurement",
        security: [{ bearerAuth: [] }],
        body: bodyMeasurementBodySchema,
        response: {
          201: bodyMeasurementResponseSchema,
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const parsed = createBodyMeasurementSchema.parse(request.body);
        const measurement = await bodyMeasurements.createBodyMeasurement(
          request.user.id,
          parsed,
        );
        return reply.code(201).send({ data: measurement });
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
        tags: ["body-measurements"],
        summary: "Update body measurement",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "string", format: "uuid" } },
          required: ["id"],
        },
        body: { ...bodyMeasurementBodySchema, required: [] },
        response: {
          200: bodyMeasurementResponseSchema,
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
        const parsed = updateBodyMeasurementSchema.parse(request.body);
        const measurement = await bodyMeasurements.updateBodyMeasurement(
          id,
          request.user.id,
          parsed,
        );
        if (!measurement) {
          return reply.code(404).send({
            error: "Body measurement not found",
            code: "BODY_MEASUREMENT_NOT_FOUND",
          });
        }

        return reply.code(200).send({ data: measurement });
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
        tags: ["body-measurements"],
        summary: "Delete body measurement",
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
        const deleted = await bodyMeasurements.deleteBodyMeasurement(
          id,
          request.user.id,
        );
        if (!deleted) {
          return reply.code(404).send({
            error: "Body measurement not found",
            code: "BODY_MEASUREMENT_NOT_FOUND",
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
