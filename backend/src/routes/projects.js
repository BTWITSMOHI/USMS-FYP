const {
    getProjects,
    getProjectById,
    updateProject,
    addAttachment,
    deleteAttachment,
  } = require('../controllers/projectController');
  
  async function projectRoutes(fastify) {
    fastify.get('/', { preHandler: [fastify.authenticate] }, getProjects);
    fastify.get('/:id', { preHandler: [fastify.authenticate] }, getProjectById);
    fastify.patch('/:id', { preHandler: [fastify.authenticate] }, updateProject);
    fastify.post('/:id/attachments', { preHandler: [fastify.authenticate] }, addAttachment);
    fastify.delete('/:id/attachments/:attachmentId', { preHandler: [fastify.authenticate] }, deleteAttachment);
  }
  
  module.exports = projectRoutes;