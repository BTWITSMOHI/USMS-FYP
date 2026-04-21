const { register, login, getMe } = require('../controllers/authController');

async function authRoutes(fastify) {
  fastify.post('/register', register);
  fastify.post('/login', login);
  fastify.get('/me', { preHandler: [fastify.authenticate] }, getMe);
}

module.exports = authRoutes;