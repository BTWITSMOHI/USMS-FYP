const {
  createProposal,
  getProposals,
  assignSupervisor,
  reviewProposal,
  deleteProposal,
} = require('../controllers/proposalController');

async function proposalRoutes(fastify) {
  fastify.post('/', { preHandler: [fastify.authenticate] }, createProposal);
  fastify.get('/', { preHandler: [fastify.authenticate] }, getProposals);
  fastify.patch('/:id/assign', { preHandler: [fastify.authenticate] }, assignSupervisor);
  fastify.patch('/:id/review', { preHandler: [fastify.authenticate] }, reviewProposal);
  fastify.delete('/:id', { preHandler: [fastify.authenticate] }, deleteProposal);
}

module.exports = proposalRoutes;
