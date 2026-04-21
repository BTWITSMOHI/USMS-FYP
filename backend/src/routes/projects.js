const {
  getProjects,
  getProjectById,
  updateProject,
  addAttachment,
  deleteAttachment,
} = require('../controllers/projectController');

async function projectRoutes(fastify) {
  // Get all projects for the current user
  fastify.get('/', { preHandler: [fastify.authenticate] }, getProjects);
  
  // Get a single project by ID
  fastify.get('/:id', { preHandler: [fastify.authenticate] }, getProjectById);
  
  // Update a project
  fastify.patch('/:id', { preHandler: [fastify.authenticate] }, updateProject);
  
  // Add attachment to a project
  fastify.post('/:id/attachments', { preHandler: [fastify.authenticate] }, addAttachment);
  
  // Delete attachment from a project
  fastify.delete('/:id/attachments/:attachmentId', { preHandler: [fastify.authenticate] }, deleteAttachment);
}

module.exports = projectRoutes;
