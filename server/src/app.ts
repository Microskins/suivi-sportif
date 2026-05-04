import Fastify, { FastifyServerOptions } from "fastify";
import cors from "@fastify/cors";
import fjwt from "@fastify/jwt";
import { usersRoutes } from "./routes/users.js";
import { exercisesRoutes } from "./routes/exercises.js";
import { workoutsRoutes } from "./routes/workouts.js";
import { authPlugin } from "./plugins/auth.js";

export function buildApp(options: FastifyServerOptions = { logger: true }) {
  const fastify = Fastify(options);

  fastify.register(cors, { origin: true });
  fastify.register(fjwt, {
    secret: process.env.JWT_SECRET || "default-secret-change-me",
  });
  fastify.register(authPlugin);

  fastify.get("/health", async (request, reply) => {
    return reply
      .code(200)
      .send({ data: { status: "ok", timestamp: new Date().toISOString() } });
  });

  fastify.register(usersRoutes, { prefix: "/api/users" });
  fastify.register(exercisesRoutes, { prefix: "/api/exercises" });
  fastify.register(workoutsRoutes, { prefix: "/api/workouts" });

  return fastify;
}
