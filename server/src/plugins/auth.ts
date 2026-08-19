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

// Fonction exportée plutôt que decorate() seul : `authPlugin` est enregistré
// sans `fastify-plugin`, donc un decorate() ici resterait scopé à ce plugin
// et ne serait pas visible dans les routes enregistrées comme plugins voisins.
export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply
      .code(401)
      .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
  }
}

export async function authPlugin(fastify: FastifyInstance) {
  // Helper réutilisable pour les routes protégées.
  fastify.decorate("authenticate", authenticate);
}

// Helper function to generate token
export function generateToken(
  fastify: FastifyInstance,
  user: { id: string; email: string; name: string },
) {
  return fastify.jwt.sign({ id: user.id, email: user.email, name: user.name });
}
