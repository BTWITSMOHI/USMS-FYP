const {
  createProposal,
  getProposals,
  assignSupervisor,
  reviewProposal,
  updateProposal,
  deleteProposal,
} = require('../controllers/proposalController');
  
  async function proposalRoutes(fastify) {
    fastify.get('/', { preHandler: [fastify.authenticate] }, getProposals);
    fastify.post('/', { preHandler: [fastify.authenticate] }, createProposal);
    fastify.patch('/:id', { preHandler: [fastify.authenticate] }, updateProposal);
    fastify.patch('/:id/assign', { preHandler: [fastify.authenticate] }, assignSupervisor);
    fastify.patch('/:id/review', { preHandler: [fastify.authenticate] }, reviewProposal);
    fastify.delete('/:id', { preHandler: [fastify.authenticate] }, deleteProposal);
  }
  
  module.exports = proposalRoutes;