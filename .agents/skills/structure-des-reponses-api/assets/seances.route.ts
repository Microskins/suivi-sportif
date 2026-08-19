// filepath: server/src/routes/seances.ts
//
// Exemple autonome appliquant la convention de reponse du projet sur une
// ressource fictive "seances". Reprendre ce squelette pour toute nouvelle
// route plutot que d'ecrire les handlers a la main.
import { FastifyInstance } from "fastify";
import { z } from "zod";
import * as seances from "../db/queries/seances.js";
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

const SEANCE_NOT_FOUND = "SEANCE_NOT_FOUND";

const idParamSchema = z.object({
  id: z.string().uuid("ID invalide"),
});

const createSeanceSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  date: z.string().datetime("Date invalide"),
  status: z.enum(["PLANNED", "COMPLETED", "CANCELED"]).default("PLANNED"),
  notes: z.string().nullable().optional(),
});

const updateSeanceSchema = createSeanceSchema.partial();

const seanceSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    userId: { type: "string", format: "uuid" },
    title: { type: "string" },
    date: { type: "string", format: "date-time" },
    status: { type: "string", enum: ["PLANNED", "COMPLETED", "CANCELED"] },
    notes: { type: ["string", "null"] },
  },
  required: ["id", "userId", "title", "date", "status", "notes"],
};

const seanceListResponseSchema = {
  type: "object",
  properties: {
    data: { type: "array", items: seanceSchema },
    meta: metaSchema,
  },
  required: ["data", "meta"],
};

const seanceResponseSchema = {
  type: "object",
  properties: { data: seanceSchema },
  required: ["data"],
};

export async function seancesRoutes(fastify: FastifyInstance) {
  // Le hook partage garantit qu'un appel sans token recoit 401 avant meme
  // que le corps de la requete ne soit lu.
  fastify.addHook("preHandler", authenticate);

  // GET /api/seances - liste paginee
  fastify.get(
    "/",
    {
      schema: {
        tags: ["seances"],
        summary: "List seances",
        security: [{ bearerAuth: [] }],
        response: {
          200: seanceListResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { page, limit } = parsePagination(
          request.query as Record<string, unknown>,
        );
        const { items, total } = await seances.listSeances(request.user.id, {
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

  // GET /api/seances/:id - detail
  fastify.get(
    "/:id",
    {
      schema: {
        tags: ["seances"],
        summary: "Get seance by id",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "string", format: "uuid" } },
          required: ["id"],
        },
        response: {
          200: seanceResponseSchema,
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
        const seance = await seances.getSeanceById(id, request.user.id);
        if (!seance) {
          // Une seance appartenant a quelqu'un d'autre renvoie aussi 404,
          // jamais 403: on ne divulgue pas son existence.
          return sendNotFound(reply, "Seance introuvable.", SEANCE_NOT_FOUND);
        }

        return sendOk(reply, seance);
      } catch (error: any) {
        if (error.name === "ZodError") {
          return sendValidationError(reply, error.errors);
        }
        fastify.log.error(error);
        return sendInternalError(reply);
      }
    },
  );

  // POST /api/seances - creation
  fastify.post(
    "/",
    {
      schema: {
        tags: ["seances"],
        summary: "Create seance",
        security: [{ bearerAuth: [] }],
        response: {
          201: seanceResponseSchema,
          400: validationErrorResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const parsed = createSeanceSchema.parse(request.body);
        const seance = await seances.createSeance(request.user.id, parsed);
        return sendCreated(reply, seance);
      } catch (error: any) {
        if (error.name === "ZodError") {
          return sendValidationError(reply, error.errors);
        }
        fastify.log.error(error);
        return sendInternalError(reply);
      }
    },
  );

  // PUT /api/seances/:id - modification
  fastify.put(
    "/:id",
    {
      schema: {
        tags: ["seances"],
        summary: "Update seance",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "string", format: "uuid" } },
          required: ["id"],
        },
        response: {
          200: seanceResponseSchema,
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
        const parsed = updateSeanceSchema.parse(request.body);
        const seance = await seances.updateSeance(id, request.user.id, parsed);
        if (!seance) {
          return sendNotFound(reply, "Seance introuvable.", SEANCE_NOT_FOUND);
        }

        return sendOk(reply, seance);
      } catch (error: any) {
        if (error.name === "ZodError") {
          return sendValidationError(reply, error.errors);
        }
        fastify.log.error(error);
        return sendInternalError(reply);
      }
    },
  );

  // DELETE /api/seances/:id - suppression
  fastify.delete(
    "/:id",
    {
      schema: {
        tags: ["seances"],
        summary: "Delete seance",
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
        const deleted = await seances.deleteSeance(id, request.user.id);
        if (!deleted) {
          return sendNotFound(reply, "Seance introuvable.", SEANCE_NOT_FOUND);
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
