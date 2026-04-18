const { getMessages, sendMessage } = require('../controllers/messageController');

async function messageRoutes(fastify) {
  fastify.get('/proposals/:id/messages', { preHandler: [fastify.authenticate] }, getMessages);
  fastify.post('/proposals/:id/messages', { preHandler: [fastify.authenticate] }, sendMessage);
}

module.exports = messageRoutes;