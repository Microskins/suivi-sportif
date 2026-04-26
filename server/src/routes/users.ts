// filepath: server/src/routes/users.ts
import { FastifyInstance } from 'fastify';
import * as users from '../db/queries/users.js';
import { createUserSchema, loginUserSchema, updateUserSchema, userResponseSchema } from '../schemas/index.js';
import { generateToken } from '../plugins/auth.js';

export async function usersRoutes(fastify: FastifyInstance) {
  // POST /api/users/login - User login (public)
  fastify.post('/login', async (request, reply) => {
    try {
      const data = request.body as object;
      const parsed = loginUserSchema.parse(data);
      
      const user = await users.verifyCredentials(parsed.email, parsed.password);
      
      if (!user) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }
      
      // Generate JWT token
      const token = generateToken(fastify, user);
      
      return { user, token };
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.code(400).send({ error: 'Validation failed', details: error.errors });
      }
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  // All routes below require authentication
  fastify.addHook('preHandler', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  // GET /api/users - List all users
  fastify.get('/', async (request, reply) => {
    try {
      const result = await users.getUsers();
      return result;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  // GET /api/users/:id - Get user by ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const user = await users.getUserById(id);
      
      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }
      
      return user;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  // POST /api/users - Create new user
  fastify.post('/', async (request, reply) => {
    try {
      const data = request.body as object;
      const parsed = createUserSchema.parse(data);
      
      // Check if email already exists
      const existing = await users.getUserByEmail(parsed.email);
      if (existing) {
        return reply.code(400).send({ error: 'Email already exists' });
      }
      
      const user = await users.createUser(parsed);
      reply.code(201);
      return user;
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.code(400).send({ error: 'Validation failed', details: error.errors });
      }
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  // PUT /api/users/:id - Update user
  fastify.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = request.body as object;
      const parsed = updateUserSchema.parse(data);
      
      const user = await users.updateUser(id, parsed);
      
      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }
      
      return user;
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.code(400).send({ error: 'Validation failed', details: error.errors });
      }
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  // DELETE /api/users/:id - Delete user
  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const deleted = await users.deleteUser(id);
      
      if (!deleted) {
        return reply.code(404).send({ error: 'User not found' });
      }
      
      reply.code(204);
      return null;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
}