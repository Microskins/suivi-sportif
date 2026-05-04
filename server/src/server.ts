import { buildApp } from "./app.js";

const fastify = buildApp();

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: "0.0.0.0" });

    fastify.log.info("Server is running on http://localhost:3001");
    fastify.log.info("Routes:");
    fastify.log.info("  GET    /health");
    fastify.log.info("  POST   /api/users/login      (public)");
    fastify.log.info("  POST   /api/users/register   (public)");
    fastify.log.info("  GET    /api/users            (protected)");
    fastify.log.info("  GET    /api/exercises        (protected)");
    fastify.log.info("  POST   /api/exercises        (protected)");
    fastify.log.info("  GET    /api/workouts         (protected)");
    fastify.log.info("  POST   /api/workouts         (protected)");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
