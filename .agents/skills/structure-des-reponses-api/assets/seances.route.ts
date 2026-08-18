// filepath: server/src/routes/seances.ts
import { FastifyInstance } from "fastify";
import { z } from "zod";
import * as seances from "../db/queries/seances.js";
import {
  parsePagination,
  sendCreated,
  sendInternalError,
  sendList,
  sendNoContent,
  sendNotFound,
  sendOk,
  sendUnauthorized,
  sendValidationError,
} from "../lib/api-response.js";

const idParamSchema = z.object({
  id: z.string().uuid("ID invalide"),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

const createSeanceSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  date: z.string().datetime("Date invalide"),
  status: z.enum(["PLANNED", "COMPLETED", "CANCELED"]).default("PLANNED"),
  notes: z.string().nullable().optional(),
});

const updateSeanceSchema = createSeanceSchema.partial();

export async function seancesRoutes(fastify: FastifyInstance) {
  // L'authentification s'exécute avant toute lecture du body : un appel
  // sans token doit recevoir 401, jamais 400, même si le payload est aussi invalide.
  fastify.addHook("preHandler", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      return sendUnauthorized(reply);
    }
  });

  // GET /api/seances - Liste paginée des séances de l'utilisateur courant
  fastify.get("/", async (request, reply) => {
    try {
      const query = listQuerySchema.parse(request.query);
      const { page, limit } = parsePagination(query);
      const userId = request.user.id;

      const { items, total } = await seances.listSeances(userId, { page, limit });
      return sendList(reply, items, { total, page, limit });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return sendValidationError(reply, error.errors);
      }
      fastify.log.error(error);
      return sendInternalError(reply);
    }
  });

  // GET /api/seances/:id - Détail d'une séance
  fastify.get("/:id", async (request, reply) => {
    try {
      const { id } = idParamSchema.parse(request.params);
      const userId = request.user.id;

      const seance = await seances.getSeanceById(id, userId);
      if (!seance) {
        return sendNotFound(reply, "Séance");
      }

      return sendOk(reply, seance);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return sendValidationError(reply, error.errors);
      }
      fastify.log.error(error);
      return sendInternalError(reply);
    }
  });

  // POST /api/seances - Création d'une séance
  fastify.post("/", async (request, reply) => {
    try {
      const parsed = createSeanceSchema.parse(request.body);
      const userId = request.user.id;

      const seance = await seances.createSeance(userId, parsed);
      return sendCreated(reply, seance);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return sendValidationError(reply, error.errors);
      }
      fastify.log.error(error);
      return sendInternalError(reply);
    }
  });

  // PUT /api/seances/:id - Modification d'une séance
  fastify.put("/:id", async (request, reply) => {
    try {
      const { id } = idParamSchema.parse(request.params);
      const parsed = updateSeanceSchema.parse(request.body);
      const userId = request.user.id;

      const seance = await seances.updateSeance(id, userId, parsed);
      if (!seance) {
        return sendNotFound(reply, "Séance");
      }

      return sendOk(reply, seance);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return sendValidationError(reply, error.errors);
      }
      fastify.log.error(error);
      return sendInternalError(reply);
    }
  });

  // DELETE /api/seances/:id - Suppression d'une séance
  fastify.delete("/:id", async (request, reply) => {
    try {
      const { id } = idParamSchema.parse(request.params);
      const userId = request.user.id;

      const deleted = await seances.deleteSeance(id, userId);
      if (!deleted) {
        return sendNotFound(reply, "Séance");
      }

      return sendNoContent(reply);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return sendValidationError(reply, error.errors);
      }
      fastify.log.error(error);
      return sendInternalError(reply);
    }
  });
}
