import Fastify, { FastifyServerOptions } from "fastify";
import cors from "@fastify/cors";
import fjwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { usersRoutes } from "./routes/users.js";
import { exercisesRoutes } from "./routes/exercises.js";
import { foodsRoutes } from "./routes/foods.js";
import { mealsRoutes } from "./routes/meals.js";
import { nutritionGoalsRoutes } from "./routes/nutrition-goals.js";
import { workoutsRoutes } from "./routes/workouts.js";
import { authPlugin } from "./plugins/auth.js";

export function buildApp(options: FastifyServerOptions = { logger: true }) {
  const fastify = Fastify(options);

  fastify.register(cors, { origin: true });
  fastify.register(fjwt, {
    secret: process.env.JWT_SECRET || "default-secret-change-me",
  });
  fastify.register(authPlugin);
  fastify.setErrorHandler((error, request, reply) => {
    if ("validation" in error) {
      return reply.code(400).send({
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: (error as { validation?: unknown }).validation,
      });
    }

    request.log.error(error);
    return reply.code(500).send({
      error: "Internal Server Error",
      code: "INTERNAL_SERVER_ERROR",
    });
  });

  fastify.register(swagger, {
    openapi: {
      info: {
        title: "Suivi Sportif API",
        description: "API Fastify pour le suivi sportif",
        version: "1.0.0",
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
  });

  fastify.get(
    "/health",
    {
      schema: {
        tags: ["system"],
        summary: "Health check",
        response: {
          200: {
            type: "object",
            properties: {
              data: {
                type: "object",
                properties: {
                  status: { type: "string" },
                  timestamp: { type: "string", format: "date-time" },
                },
                required: ["status", "timestamp"],
              },
            },
            required: ["data"],
          },
        },
      },
    },
    async (request, reply) => {
      return reply
        .code(200)
        .send({ data: { status: "ok", timestamp: new Date().toISOString() } });
    },
  );

  fastify.register(usersRoutes, { prefix: "/api/users" });
  fastify.register(exercisesRoutes, { prefix: "/api/exercises" });
  fastify.register(workoutsRoutes, { prefix: "/api/workouts" });
  fastify.register(foodsRoutes, { prefix: "/api/foods" });
  fastify.register(mealsRoutes, { prefix: "/api/meals" });
  fastify.register(nutritionGoalsRoutes, { prefix: "/api/nutrition-goals" });
  fastify.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
    },
  });

  return fastify;
}
