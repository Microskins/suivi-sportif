// filepath: server/src/routes/users.ts
import { FastifyInstance } from "fastify";
import * as users from "../db/queries/users.js";
import {
  createUserSchema,
  loginUserSchema,
  updateUserSchema,
} from "../schemas/index.js";
import { generateToken } from "../plugins/auth.js";
import {
  errorResponseSchema,
  sendConflict,
  sendCreated,
  sendForbidden,
  sendInternalError,
  sendNotFound,
  sendOk,
  sendUnauthorized,
  sendValidationError,
} from "../lib/api-response.js";

const userSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    email: { type: "string", format: "email" },
    name: { type: "string" },
    dateOfBirth: { type: ["string", "null"], format: "date-time" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
  required: ["id", "email", "name", "dateOfBirth", "createdAt", "updatedAt"],
};

const authRateLimit = {
  max: Number(process.env.AUTH_RATE_LIMIT_MAX ?? 10),
  timeWindow: process.env.AUTH_RATE_LIMIT_WINDOW ?? "1 minute",
};

export async function usersRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/login",
    {
      config: {
        rateLimit: authRateLimit,
      },
      schema: {
        tags: ["users"],
        summary: "Login",
        body: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
          },
          required: ["email", "password"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              data: {
                type: "object",
                properties: {
                  user: userSchema,
                  token: { type: "string" },
                },
                required: ["user", "token"],
              },
            },
            required: ["data"],
          },
          400: errorResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const parsed = loginUserSchema.parse(request.body as object);
        const user = await users.verifyCredentials(
          parsed.email,
          parsed.password,
        );

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
          return sendValidationError(reply, error.errors);
        }
        fastify.log.error(error);
        return sendInternalError(reply);
      }
    },
  );

  fastify.post(
    "/register",
    {
      config: {
        rateLimit: authRateLimit,
      },
      schema: {
        tags: ["users"],
        summary: "Register",
        body: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
            currentPassword: { type: "string" },
            name: { type: "string" },
            dateOfBirth: { type: ["string", "null"], format: "date-time" },
          },
          required: ["email", "password", "name"],
        },
        response: {
          201: {
            type: "object",
            properties: {
              data: {
                type: "object",
                properties: {
                  user: userSchema,
                  token: { type: "string" },
                },
                required: ["user", "token"],
              },
            },
            required: ["data"],
          },
          400: errorResponseSchema,
          409: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const parsed = createUserSchema.parse(request.body as object);

        const existing = await users.getUserByEmail(parsed.email);
        if (existing) {
          return sendConflict(
            reply,
            "Email déjà utilisé",
            "EMAIL_ALREADY_EXISTS",
          );
        }

        const user = await users.createUser(parsed);
        const token = generateToken(fastify, user);
        return sendCreated(reply, { user, token });
      } catch (error: any) {
        if (error.name === "ZodError") {
          return sendValidationError(reply, error.errors);
        }
        fastify.log.error(error);
        return sendInternalError(reply);
      }
    },
  );

  fastify.addHook("preHandler", async (request, reply) => {
    const currentPath = request.url.split("?")[0];
    if (currentPath.endsWith("/login") || currentPath.endsWith("/register")) {
      return;
    }

    try {
      await request.jwtVerify();
    } catch {
      return sendUnauthorized(reply);
    }
  });

  fastify.get(
    "/me",
    {
      schema: {
        tags: ["users"],
        summary: "Get current user",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: "object",
            properties: { data: userSchema },
            required: ["data"],
          },
          401: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const user = await users.getUserById(request.user.id);

        if (!user) {
          return sendNotFound(reply, "User not found", "USER_NOT_FOUND");
        }

        return sendOk(reply, user);
      } catch (error) {
        fastify.log.error(error);
        return sendInternalError(reply);
      }
    },
  );

  fastify.put(
    "/me",
    {
      schema: {
        tags: ["users"],
        summary: "Update current user",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
            name: { type: "string" },
            dateOfBirth: { type: ["string", "null"], format: "date-time" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: { data: userSchema },
            required: ["data"],
          },
          400: errorResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const parsed = updateUserSchema.parse(request.body as object);
        const currentUser =
          parsed.email || parsed.password
            ? await users.getUserById(request.user.id)
            : null;
        if ((parsed.email || parsed.password) && !currentUser) {
          return sendNotFound(reply, "User not found", "USER_NOT_FOUND");
        }

        const emailChange = Boolean(
          parsed.email && currentUser && parsed.email !== currentUser.email,
        );
        const sensitiveChange = emailChange || Boolean(parsed.password);
        if (sensitiveChange) {
          if (!parsed.currentPassword) {
            return reply.code(400).send({
              error: "Mot de passe actuel requis",
              code: "CURRENT_PASSWORD_REQUIRED",
            });
          }

          const verified = await users.verifyCredentials(
            currentUser!.email,
            parsed.currentPassword,
          );
          if (!verified) {
            return reply.code(401).send({
              error: "Mot de passe actuel invalide",
              code: "INVALID_CURRENT_PASSWORD",
            });
          }
        }

        if (emailChange && parsed.email) {
          const existing = await users.getUserByEmail(parsed.email);
          if (existing && existing.id !== request.user.id) {
            return sendConflict(
              reply,
              "Email deja utilise",
              "EMAIL_ALREADY_EXISTS",
            );
          }
        }

        const { currentPassword, ...updateData } = parsed;
        void currentPassword;
        const user = await users.updateUser(request.user.id, updateData);

        if (!user) {
          return sendNotFound(reply, "User not found", "USER_NOT_FOUND");
        }

        if (sensitiveChange) {
          request.log.info(
            {
              userId: request.user.id,
              changedFields: [
                emailChange ? "email" : null,
                parsed.password ? "password" : null,
              ].filter(Boolean),
            },
            "Sensitive profile fields updated",
          );
        }

        return sendOk(reply, user);
      } catch (error: any) {
        if (error.name === "ZodError") {
          return sendValidationError(reply, error.errors);
        }
        fastify.log.error(error);
        return sendInternalError(reply);
      }
    },
  );

  fastify.get("/", async (request, reply) => {
    return sendForbidden(reply, "Listing users is not available");
  });

  fastify.post("/", async (request, reply) => {
    return sendForbidden(
      reply,
      "Use /api/users/register to create an account",
    );
  });

  fastify.get("/:id", async (request, reply) => {
    return sendForbidden(reply, "Reading arbitrary users is not available");
  });

  fastify.put("/:id", async (request, reply) => {
    return sendForbidden(reply, "Updating arbitrary users is not available");
  });

  fastify.delete("/:id", async (request, reply) => {
    return sendForbidden(reply, "Deleting users is not available");
  });
}
