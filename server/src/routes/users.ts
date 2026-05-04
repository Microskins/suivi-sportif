// filepath: server/src/routes/users.ts
import { FastifyInstance } from "fastify";
import * as users from "../db/queries/users.js";
import {
  createUserSchema,
  loginUserSchema,
  updateUserSchema,
} from "../schemas/index.js";
import { generateToken } from "../plugins/auth.js";

export async function usersRoutes(fastify: FastifyInstance) {
  fastify.post("/login", async (request, reply) => {
    try {
      const parsed = loginUserSchema.parse(request.body as object);
      const user = await users.verifyCredentials(parsed.email, parsed.password);

      if (!user) {
        return reply.code(401).send({
          error: "Identifiants invalides",
          code: "INVALID_CREDENTIALS",
        });
      }

      const token = generateToken(fastify, user);
      return reply.code(200).send({ data: { user, token } });
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

  fastify.post("/register", async (request, reply) => {
    try {
      const parsed = createUserSchema.parse(request.body as object);

      const existing = await users.getUserByEmail(parsed.email);
      if (existing) {
        return reply
          .code(400)
          .send({ error: "Email déjà utilisé", code: "EMAIL_ALREADY_EXISTS" });
      }

      const user = await users.createUser(parsed);
      const token = generateToken(fastify, user);
      return reply.code(201).send({ data: { user, token } });
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

  fastify.addHook("preHandler", async (request, reply) => {
    const currentPath = request.url.split("?")[0];
    if (currentPath.endsWith("/login") || currentPath.endsWith("/register")) {
      return;
    }

    try {
      await request.jwtVerify();
    } catch (err) {
      return reply
        .code(401)
        .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
    }
  });

  fastify.get("/me", async (request, reply) => {
    try {
      const user = await users.getUserById(request.user.id);

      if (!user) {
        return reply
          .code(404)
          .send({ error: "User not found", code: "USER_NOT_FOUND" });
      }

      return reply.code(200).send({ data: user });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: "Internal Server Error",
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  });

  fastify.put("/me", async (request, reply) => {
    try {
      const parsed = updateUserSchema.parse(request.body as object);
      const user = await users.updateUser(request.user.id, parsed);

      if (!user) {
        return reply
          .code(404)
          .send({ error: "User not found", code: "USER_NOT_FOUND" });
      }

      return reply.code(200).send({ data: user });
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

  fastify.get("/", async (request, reply) => {
    return reply.code(403).send({
      error: "Listing users is not available",
      code: "FORBIDDEN",
    });
  });

  fastify.post("/", async (request, reply) => {
    return reply.code(403).send({
      error: "Use /api/users/register to create an account",
      code: "FORBIDDEN",
    });
  });

  fastify.get("/:id", async (request, reply) => {
    return reply.code(403).send({
      error: "Reading arbitrary users is not available",
      code: "FORBIDDEN",
    });
  });

  fastify.put("/:id", async (request, reply) => {
    return reply.code(403).send({
      error: "Updating arbitrary users is not available",
      code: "FORBIDDEN",
    });
  });

  fastify.delete("/:id", async (request, reply) => {
    return reply.code(403).send({
      error: "Deleting users is not available",
      code: "FORBIDDEN",
    });
  });
}
