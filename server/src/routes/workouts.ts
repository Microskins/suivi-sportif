// filepath: server/src/routes/workouts.ts
import { FastifyInstance } from 'fastify';
import * as workouts from '../db/queries/workouts.js';
import { createWorkoutSchema, updateWorkoutSchema, workoutResponseSchema } from '../schemas/index.js';

export async function workoutsRoutes(fastify: FastifyInstance) {
  // GET /api/workouts - List all workouts for user
  fastify.get('/', async (request, reply) => {
    try {
      // In production, get userId from auth token
      const userId = (request.headers['x-user-id'] as string) || 'default';
      const result = await workouts.getWorkouts(userId);
      return result;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  // GET /api/workouts/:id - Get workout by ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const workout = await workouts.getWorkoutById(id);
      
      if (!workout) {
        return reply.code(404).send({ error: 'Workout not found' });
      }
      
      return workout;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  // GET /api/workouts/range/:start/:end - Get workouts by date range
  fastify.get('/range/:start/:end', async (request, reply) => {
    try {
      const { start, end } = request.params as { start: string; end: string };
      const userId = (request.headers['x-user-id'] as string) || 'default';
      const result = await workouts.getWorkoutsByDateRange(userId, start, end);
      return result;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  // POST /api/workouts - Create new workout
  fastify.post('/', async (request, reply) => {
    try {
      const data = request.body as object;
      const parsed = createWorkoutSchema.parse(data);
      
      // In production, get userId from auth token
      const userId = (request.headers['x-user-id'] as string) || 'default';
      
      const workout = await workouts.createWorkout(userId, parsed);
      reply.code(201);
      return workout;
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.code(400).send({ error: 'Validation failed', details: error.errors });
      }
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  // PUT /api/workouts/:id - Update workout
  fastify.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = request.body as object;
      const parsed = updateWorkoutSchema.parse(data);
      
      const workout = await workouts.updateWorkout(id, parsed);
      
      if (!workout) {
        return reply.code(404).send({ error: 'Workout not found' });
      }
      
      return workout;
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.code(400).send({ error: 'Validation failed', details: error.errors });
      }
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  // DELETE /api/workouts/:id - Delete workout
  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const deleted = await workouts.deleteWorkout(id);
      
      if (!deleted) {
        return reply.code(404).send({ error: 'Workout not found' });
      }
      
      reply.code(204);
      return null;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
}