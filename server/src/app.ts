import Fastify, { FastifyServerOptions } from "fastify";
import cors from "@fastify/cors";
import fjwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { usersRoutes } from "./routes/users.js";
import { exercisesRoutes } from "./routes/exercises.js";
import { foodsRoutes } from "./routes/foods.js";
import { mealsRoutes } from "./routes/meals.js";
import { nutritionGoalsRoutes } from "./routes/nutrition-goals.js";
import { userGoalsRoutes } from "./routes/user-goals.js";
import { bodyMeasurementsRoutes } from "./routes/body-measurements.js";
import { workoutsRoutes } from "./routes/workouts.js";
import { workoutTemplatesRoutes } from "./routes/workout-templates.js";
import { authPlugin } from "./plugins/auth.js";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction && (!secret || secret === "default-secret-change-me")) {
    throw new Error("JWT_SECRET must be configured in production");
  }

  return secret || "default-secret-change-me";
}

function getCorsOrigin() {
  const configuredOrigins = process.env.CORS_ORIGIN?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configuredOrigins?.length) {
    return configuredOrigins;
  }

  return process.env.NODE_ENV === "production" ? false : true;
const DEVELOPMENT_JWT_SECRET = "development-only-secret-at-least-32-characters";
const MIN_JWT_SECRET_LENGTH = 32;
const DEFAULT_DEV_CORS_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret) {
    if (isProduction()) {
      throw new Error("JWT_SECRET is required in production");
    }

    return DEVELOPMENT_JWT_SECRET;
  }

  if (isProduction() && secret.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error("JWT_SECRET must be at least 32 characters in production");
  }

  return secret;
}

function getCorsOrigins() {
  const configuredOrigins = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configuredOrigins.length > 0) {
    return configuredOrigins;
  }

  return isProduction() ? [] : DEFAULT_DEV_CORS_ORIGINS;
}

export function buildApp(options: FastifyServerOptions = { logger: true }) {
  const fastify = Fastify(options);
  const corsOrigins = getCorsOrigins();

  fastify.register(cors, {
    origin(origin, callback) {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

  fastify.register(cors, { origin: getCorsOrigin() });
  fastify.register(fjwt, {
    secret: getJwtSecret(),
      callback(null, false);
    },
  });
  fastify.register(fjwt, {
    secret: getJwtSecret(),
  });
  fastify.register(rateLimit, {
    global: false,
    errorResponseBuilder() {
      return {
        statusCode: 429,
        error: "Trop de tentatives, reessayez plus tard",
        code: "RATE_LIMIT_EXCEEDED",
      };
    },
  });
  fastify.register(authPlugin);
  fastify.setErrorHandler((error: any, request, reply) => {
    if ("validation" in error) {
      return reply.code(400).send({
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: (error as { validation?: unknown }).validation,
      });
    }

    if (error.statusCode === 429) {
      return reply.code(429).send({
        error: "Trop de tentatives, reessayez plus tard",
        code: "RATE_LIMIT_EXCEEDED",
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
  fastify.register(workoutTemplatesRoutes, {
    prefix: "/api/workout-templates",
  });
  fastify.register(foodsRoutes, { prefix: "/api/foods" });
  fastify.register(mealsRoutes, { prefix: "/api/meals" });
  fastify.register(nutritionGoalsRoutes, { prefix: "/api/nutrition-goals" });
  fastify.register(userGoalsRoutes, { prefix: "/api/user-goals" });
  fastify.register(bodyMeasurementsRoutes, {
    prefix: "/api/body-measurements",
  });
  fastify.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
    },
  });

  return fastify;
}
