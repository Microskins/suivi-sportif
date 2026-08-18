// filepath: server/src/lib/api-response.ts
import type { FastifyReply } from "fastify";

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

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

export function sendList<T>(reply: FastifyReply, data: T[], meta: PaginationMeta) {
  return reply.code(200).send({ data, meta });
}

export function sendCreated<T>(reply: FastifyReply, data: T) {
  return reply.code(201).send({ data });
}

export function sendNoContent(reply: FastifyReply) {
  return reply.code(204).send();
}

export function sendValidationError(reply: FastifyReply, details: unknown) {
  return reply
    .code(400)
    .send({ error: "Validation échouée", code: "VALIDATION_ERROR", details });
}

export function sendUnauthorized(reply: FastifyReply) {
  return reply
    .code(401)
    .send({ error: "Authentification requise.", code: "UNAUTHORIZED" });
}

export function sendForbidden(reply: FastifyReply) {
  return reply.code(403).send({ error: "Accès refusé.", code: "FORBIDDEN" });
}

// Un accès hors scope (ressource d'un autre utilisateur) renvoie aussi ce
// helper, jamais sendForbidden : on ne confirme ni n'infirme l'existence
// d'une ressource qui n'appartient pas à l'appelant.
export function sendNotFound(reply: FastifyReply, resource = "Ressource") {
  return reply
    .code(404)
    .send({ error: `${resource} introuvable.`, code: "NOT_FOUND" });
}

export function sendConflict(
  reply: FastifyReply,
  message: string,
  code = "CONFLICT",
) {
  return reply.code(409).send({ error: message, code });
}

export function sendInternalError(reply: FastifyReply) {
  return reply
    .code(500)
    .send({ error: "Une erreur interne est survenue.", code: "INTERNAL_ERROR" });
}
