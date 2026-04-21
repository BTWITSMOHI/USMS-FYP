const { getSupervisors } = require('../controllers/supervisorController');

async function supervisorRoutes(fastify) {
  fastify.get('/', { preHandler: [fastify.authenticate] }, getSupervisors);
}

module.exports = supervisorRoutes;