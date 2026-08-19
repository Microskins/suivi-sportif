import { FastifyInstance } from "fastify";
import * as bodyMeasurements from "../db/queries/body-measurements.js";
import {
  createBodyMeasurementSchema,
  idParamSchema,
  updateBodyMeasurementSchema,
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
    isActiveLifestyle: { type: ["boolean", "null"] },
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
    isActiveLifestyle: { type: ["boolean", "null"] },
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
    "isActiveLifestyle",
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

export async function bodyMeasurementsRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

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
        const { page, limit } = parsePagination(request.query as Record<string, unknown>);
        const { items, total } = await bodyMeasurements.getBodyMeasurements(
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
          return sendNotFound(
            reply,
            "Body measurement not found",
            "BODY_MEASUREMENT_NOT_FOUND",
          );
        }

        return sendOk(reply, measurement);
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
          return sendNotFound(
            reply,
            "Body measurement not found",
            "BODY_MEASUREMENT_NOT_FOUND",
          );
        }

        return sendOk(reply, measurement);
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
        return sendCreated(reply, measurement);
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
          return sendNotFound(
            reply,
            "Body measurement not found",
            "BODY_MEASUREMENT_NOT_FOUND",
          );
        }

        return sendOk(reply, measurement);
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
          return sendNotFound(
            reply,
            "Body measurement not found",
            "BODY_MEASUREMENT_NOT_FOUND",
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
