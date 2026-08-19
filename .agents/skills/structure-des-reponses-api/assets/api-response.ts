// filepath: server/src/lib/api-response.ts (copie de reference du fichier reel)
import type { FastifyReply } from "fastify";

export const errorResponseSchema = {
  type: "object",
  properties: {
    error: { type: "string" },
    code: { type: "string" },
  },
  required: ["error", "code"],
};

export const validationErrorResponseSchema = {
  type: "object",
  properties: {
    error: { type: "string" },
    code: { type: "string" },
    details: { type: "array" },
  },
  required: ["error", "code", "details"],
};

export const metaSchema = {
  type: "object",
  properties: {
    total: { type: "number" },
    page: { type: "number" },
    limit: { type: "number" },
  },
  required: ["total", "page", "limit"],
};

interface ListMeta {
  total: number;
  page: number;
  limit: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// Normalise page/limit depuis la query brute : toute valeur absente, non
// numerique ou hors bornes retombe sur les valeurs par defaut plutot que de
// faire confiance aux parametres d'URL.
export function parsePagination(query: Record<string, unknown>): {
  page: number;
  limit: number;
} {
  const rawPage = Number(query.page);
  const rawLimit = Number(query.limit);

  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : DEFAULT_PAGE;
  const limit =
    Number.isInteger(rawLimit) && rawLimit > 0
      ? Math.min(rawLimit, MAX_LIMIT)
      : DEFAULT_LIMIT;

  return { page, limit };
}

export function sendOk<T>(reply: FastifyReply, data: T) {
  return reply.code(200).send({ data });
}

export function sendList<T>(reply: FastifyReply, data: T[], meta: ListMeta) {
  return reply.code(200).send({ data, meta });
}

export function sendCreated<T>(reply: FastifyReply, data: T) {
  return reply.code(201).send({ data });
}

export function sendNoContent(reply: FastifyReply) {
  return reply.code(204).send();
}

export function sendValidationError(reply: FastifyReply, details: unknown) {
  return reply.code(400).send({
    error: "Validation failed",
    code: "VALIDATION_ERROR",
    details,
  });
}

export function sendUnauthorized(reply: FastifyReply) {
  return reply.code(401).send({ error: "Unauthorized", code: "UNAUTHORIZED" });
}

export function sendForbidden(reply: FastifyReply, message: string) {
  return reply.code(403).send({ error: message, code: "FORBIDDEN" });
}

export function sendNotFound(reply: FastifyReply, message: string, code: string) {
  return reply.code(404).send({ error: message, code });
}

export function sendConflict(reply: FastifyReply, message: string, code: string) {
  return reply.code(409).send({ error: message, code });
}

export function sendInternalError(reply: FastifyReply) {
  return reply.code(500).send({
    error: "Internal Server Error",
    code: "INTERNAL_SERVER_ERROR",
  });
}
