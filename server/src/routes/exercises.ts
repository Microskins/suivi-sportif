// filepath: server/src/routes/exercises.ts
import { FastifyInstance } from 'fastify';
import * as exercises from '../db/queries/exercises.js';
import { createExerciseSchema, updateExerciseSchema, exerciseResponseSchema } from '../schemas/index.js';

export async function exercisesRoutes(fastify: FastifyInstance) {
  // GET /api/exercises - List all exercises
  fastify.get('/', async (request, reply) => {
    try {
      const result = await exercises.getExercises();
      return result;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  // GET /api/exercises/:id - Get exercise by ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const exercise = await exercises.getExerciseById(id);
      
      if (!exercise) {
        return reply.code(404).send({ error: 'Exercise not found' });
      }
      
      return exercise;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  // GET /api/exercises/muscle/:group - Get exercises by muscle group
  fastify.get('/muscle/:group', async (request, reply) => {
    try {
      const { group } = request.params as { group: string };
      const result = await exercises.getExercisesByMuscleGroup(group);
      return result;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  // POST /api/exercises - Create new exercise
  fastify.post('/', async (request, reply) => {
    try {
      const data = request.body as object;
      const parsed = createExerciseSchema.parse(data);
      
      const exercise = await exercises.createExercise(parsed);
      reply.code(201);
      return exercise;
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.code(400).send({ error: 'Validation failed', details: error.errors });
      }
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  // PUT /api/exercises/:id - Update exercise
  fastify.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = request.body as object;
      const parsed = updateExerciseSchema.parse(data);
      
      const exercise = await exercises.updateExercise(id, parsed);
      
      if (!exercise) {
        return reply.code(404).send({ error: 'Exercise not found' });
      }
      
      return exercise;
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.code(400).send({ error: 'Validation failed', details: error.errors });
      }
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  // DELETE /api/exercises/:id - Delete exercise
  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const deleted = await exercises.deleteExercise(id);
      
      if (!deleted) {
        return reply.code(404).send({ error: 'Exercise not found' });
      }
      
      reply.code(204);
      return null;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
}