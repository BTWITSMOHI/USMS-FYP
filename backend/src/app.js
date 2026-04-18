require('dotenv').config();
const supervisorRoutes = require('./routes/supervisors');
const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const jwt = require('@fastify/jwt');
const pool = require('./db');
const authRoutes = require('./routes/auth');
const proposalRoutes = require('./routes/proposals');
const messageRoutes = require('./routes/messages');

async function buildApp() {
  await fastify.register(cors, {
    origin: [
      'http://localhost:5173',
      process.env.FRONTEND_URL,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET,
  });

  fastify.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.code(401).send({ message: 'Unauthorized' });
    }
  });

  fastify.get('/', async () => {
    return { message: 'USMS backend is running' };
  });

  fastify.get('/db-test', async () => {
    const result = await pool.query('SELECT NOW()');
    return {
      message: 'Database connected successfully',
      time: result.rows[0].now,
    };
  });

  await fastify.register(authRoutes, { prefix: '/auth' });
  await fastify.register(proposalRoutes, { prefix: '/proposals' });
  await fastify.register(messageRoutes);
  await fastify.register(supervisorRoutes, { prefix: '/supervisors' });
  return fastify;
}

module.exports = buildApp;