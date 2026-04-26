import Fastify from 'fastify';
import cors from '@fastify/cors';
import { usersRoutes } from './routes/users.js';
import { exercisesRoutes } from './routes/exercises.js';
import { workoutsRoutes } from './routes/workouts.js';
import { authPlugin } from './plugins/auth.js';

const fastify = Fastify({ logger: true });

// Register plugins
fastify.register(cors, { origin: true });
fastify.register(authPlugin);

// Health check (public)
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Register routes
fastify.register(usersRoutes, { prefix: '/api/users' });
fastify.register(exercisesRoutes, { prefix: '/api/exercises' });
fastify.register(workoutsRoutes, { prefix: '/api/workouts' });

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('Server is running on http://localhost:3001');
    console.log('Routes:');
    console.log('  GET    /health');
    console.log('  POST   /api/users/login     (public)');
    console.log('  GET    /api/users          (protected)');
    console.log('  POST   /api/users          (protected)');
    console.log('  GET    /api/exercises      (protected)');
    console.log('  POST   /api/exercises      (protected)');
    console.log('  GET    /api/workouts      (protected)');
    console.log('  POST   /api/workouts      (protected)');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
