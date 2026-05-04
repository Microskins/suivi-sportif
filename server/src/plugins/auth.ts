// filepath: server/src/plugins/auth.ts
// Authentication plugin with JWT

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    user: {
      id: string;
      email: string;
      name: string;
    };
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { id: string; email: string; name: string };
    user: { id: string; email: string; name: string };
  }
}

export async function authPlugin(fastify: FastifyInstance) {
  // Helper réutilisable pour les routes protégées.
  fastify.decorate(
    "authenticate",
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply
          .code(401)
          .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
      }
    },
  );
}

// Helper function to generate token
export function generateToken(
  fastify: FastifyInstance,
  user: { id: string; email: string; name: string },
) {
  return fastify.jwt.sign({ id: user.id, email: user.email, name: user.name });
}
