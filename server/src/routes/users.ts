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
  // POST /api/users/login - User login (public)
  fastify.post("/login", async (request, reply) => {
    try {
      const data = request.body as object;
      const parsed = loginUserSchema.parse(data);

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

  // POST /api/users/register - Register new user (public)
  fastify.post("/register", async (request, reply) => {
    try {
      const data = request.body as object;
      const parsed = createUserSchema.parse(data);

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

  // All routes below require authentication
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

  // GET /api/users - List all users
  fastify.get("/", async (request, reply) => {
    try {
      const result = await users.getUsers();
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
  });

  // GET /api/users/:id - Get user by ID
  fastify.get("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const user = await users.getUserById(id);

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

  // POST /api/users - Create new user
  fastify.post("/", async (request, reply) => {
    try {
      const data = request.body as object;
      const parsed = createUserSchema.parse(data);

      // Check if email already exists
      const existing = await users.getUserByEmail(parsed.email);
      if (existing) {
        return reply.code(400).send({
          error: "Email already exists",
          code: "EMAIL_ALREADY_EXISTS",
        });
      }

      const user = await users.createUser(parsed);
      return reply.code(201).send({ data: user });
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

  // PUT /api/users/:id - Update user
  fastify.put("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = request.body as object;
      const parsed = updateUserSchema.parse(data);

      const user = await users.updateUser(id, parsed);

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

  // DELETE /api/users/:id - Delete user
  fastify.delete("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const deleted = await users.deleteUser(id);

      if (!deleted) {
        return reply
          .code(404)
          .send({ error: "User not found", code: "USER_NOT_FOUND" });
      }

      return reply.code(204).send();
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: "Internal Server Error",
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  });
}
