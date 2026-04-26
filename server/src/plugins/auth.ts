// filepath: server/src/plugins/auth.ts
// Authentication plugin with JWT

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fjwt from '@fastify/jwt';
import { getUserByEmail, verifyCredentials } from '../db/queries/users.js';

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: string;
      email: string;
      name: string;
    };
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string; email: string; name: string };
    user: { id: string; email: string; name: string };
  }
}

export async function authPlugin(fastify: FastifyInstance) {
  // Register JWT plugin
  await fastify.register(fjwt, {
    secret: process.env.JWT_SECRET || 'default-secret-change-me',
  });

  // Decorate request with authenticate function
  fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });
}

// Helper function to generate token
export function generateToken(fastify: FastifyInstance, user: { id: string; email: string; name: string }) {
  return fastify.jwt.sign({ id: user.id, email: user.email, name: user.name });
}