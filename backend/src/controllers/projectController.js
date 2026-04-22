const pool = require('../db');

// Get all projects for the current user
const getProjects = async (request, reply) => {
  try {
    const user = request.user;
    let result;

    if (user.role === 'student') {
      result = await pool.query(
        `
        SELECT 
          p.*,
          s.name AS student_name,
          sup.name AS supervisor_name,
          prop.document_name AS proposal_document_name,
          prop.document_url AS proposal_document_url
        FROM projects p
        JOIN users s ON p.student_id = s.id
        JOIN users sup ON p.supervisor_id = sup.id
        JOIN proposals prop ON p.proposal_id = prop.id
        WHERE p.student_id = $1
        ORDER BY p.created_at DESC
        `,
        [user.id]
      );
    } else if (user.role === 'supervisor') {
      result = await pool.query(
        `
        SELECT 
          p.*,
          s.name AS student_name,
          sup.name AS supervisor_name,
          prop.document_name AS proposal_document_name,
          prop.document_url AS proposal_document_url
        FROM projects p
        JOIN users s ON p.student_id = s.id
        JOIN users sup ON p.supervisor_id = sup.id
        JOIN proposals prop ON p.proposal_id = prop.id
        WHERE p.supervisor_id = $1
        ORDER BY p.created_at DESC
        `,
        [user.id]
      );
    } else if (user.role === 'admin') {
      result = await pool.query(
        `
        SELECT 
          p.*,
          s.name AS student_name,
          sup.name AS supervisor_name,
          prop.document_name AS proposal_document_name,
          prop.document_url AS proposal_document_url
        FROM projects p
        JOIN users s ON p.student_id = s.id
        JOIN users sup ON p.supervisor_id = sup.id
        JOIN proposals prop ON p.proposal_id = prop.id
        ORDER BY p.created_at DESC
        `
      );
    } else {
      return reply.code(403).send({
        message: 'Unauthorized role',
      });
    }

    const projects = result.rows.map((project) => ({
      id: project.id,
      proposalId: project.proposal_id,
      studentId: project.student_id,
      studentName: project.student_name,
      supervisorId: project.supervisor_id,
      supervisorName: project.supervisor_name,
      title: project.title,
      description: project.description,
      technologiesUsed: project.technologies_used,
      skillsDeveloped: project.skills_developed,
      additionalNotes: project.additional_notes,
      githubUrl: project.github_url,
      liveUrl: project.live_url,
      status: project.status,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      proposalDocumentName: project.proposal_document_name,
      proposalDocumentUrl: project.proposal_document_url,
    }));

    return reply.send({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    return reply.code(500).send({
      message: 'Internal server error',
    });
  }
};

// Get a single project by ID
const getProjectById = async (request, reply) => {
  try {
    const user = request.user;
    const projectId = request.params.id;

    const result = await pool.query(
      `
      SELECT 
        p.*,
        s.name AS student_name,
        sup.name AS supervisor_name,
        prop.document_name AS proposal_document_name,
        prop.document_url AS proposal_document_url
      FROM projects p
      JOIN users s ON p.student_id = s.id
      JOIN users sup ON p.supervisor_id = sup.id
      JOIN proposals prop ON p.proposal_id = prop.id
      WHERE p.id = $1
      `,
      [projectId]
    );

    if (result.rows.length === 0) {
      return reply.code(404).send({
        message: 'Project not found',
      });
    }

    const project = result.rows[0];

    if (
      user.role !== 'admin' &&
      project.student_id !== user.id &&
      project.supervisor_id !== user.id
    ) {
      return reply.code(403).send({
        message: 'You do not have access to this project',
      });
    }

    const attachmentsResult = await pool.query(
      `
      SELECT 
        pa.*,
        u.name AS uploader_name
      FROM project_attachments pa
      JOIN users u ON pa.uploaded_by = u.id
      WHERE pa.project_id = $1
      ORDER BY pa.uploaded_at DESC
      `,
      [projectId]
    );

    const attachments = attachmentsResult.rows.map((att) => ({
      id: att.id,
      fileName: att.file_name,
      fileUrl: att.file_url,
      fileType: att.file_type,
      fileSize: att.file_size,
      uploadedBy: att.uploaded_by,
      uploaderName: att.uploader_name,
      uploadedAt: att.uploaded_at,
    }));

    return reply.send({
      project: {
        id: project.id,
        proposalId: project.proposal_id,
        studentId: project.student_id,
        studentName: project.student_name,
        supervisorId: project.supervisor_id,
        supervisorName: project.supervisor_name,
        title: project.title,
        description: project.description,
        technologiesUsed: project.technologies_used,
        skillsDeveloped: project.skills_developed,
        additionalNotes: project.additional_notes,
        githubUrl: project.github_url,
        liveUrl: project.live_url,
        status: project.status,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        proposalDocumentName: project.proposal_document_name,
        proposalDocumentUrl: project.proposal_document_url,
        attachments,
      },
    });
  } catch (error) {
    console.error('Get project by ID error:', error);
    return reply.code(500).send({
      message: 'Internal server error',
    });
  }
};

// Update a project
const updateProject = async (request, reply) => {
  try {
    const user = request.user;
    const projectId = request.params.id;
    const {
      technologiesUsed,
      skillsDeveloped,
      additionalNotes,
      githubUrl,
      liveUrl,
      status,
    } = request.body;

    const projectCheck = await pool.query(
      `
      SELECT * FROM projects WHERE id = $1
      `,
      [projectId]
    );

    if (projectCheck.rows.length === 0) {
      return reply.code(404).send({
        message: 'Project not found',
      });
    }

    const project = projectCheck.rows[0];

    if (
      user.role !== 'admin' &&
      project.student_id !== user.id &&
      project.supervisor_id !== user.id
    ) {
      return reply.code(403).send({
        message: 'You do not have permission to update this project',
      });
    }

    const result = await pool.query(
      `
      UPDATE projects
      SET 
        technologies_used = COALESCE($1, technologies_used),
        skills_developed = COALESCE($2, skills_developed),
        additional_notes = COALESCE($3, additional_notes),
        github_url = COALESCE($4, github_url),
        live_url = COALESCE($5, live_url),
        status = COALESCE($6, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
      `,
      [
        technologiesUsed,
        skillsDeveloped,
        additionalNotes,
        githubUrl,
        liveUrl,
        status,
        projectId,
      ]
    );

    return reply.send({
      message: 'Project updated successfully',
      project: result.rows[0],
    });
  } catch (error) {
    console.error('Update project error:', error);
    return reply.code(500).send({
      message: 'Internal server error',
    });
  }
};

// Add attachment to a project
const addAttachment = async (request, reply) => {
  try {
    const user = request.user;
    const projectId = request.params.id;
    const { fileName, fileUrl, fileType, fileSize } = request.body;

    if (!fileName || !fileUrl) {
      return reply.code(400).send({
        message: 'File name and URL are required',
      });
    }

    const projectCheck = await pool.query(
      `
      SELECT * FROM projects WHERE id = $1
      `,
      [projectId]
    );

    if (projectCheck.rows.length === 0) {
      return reply.code(404).send({
        message: 'Project not found',
      });
    }

    const project = projectCheck.rows[0];

    if (
      user.role !== 'admin' &&
      project.student_id !== user.id &&
      project.supervisor_id !== user.id
    ) {
      return reply.code(403).send({
        message: 'You do not have permission to add attachments to this project',
      });
    }

    const result = await pool.query(
      `
      INSERT INTO project_attachments (
        project_id,
        file_name,
        file_url,
        file_type,
        file_size,
        uploaded_by
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [projectId, fileName, fileUrl, fileType || null, fileSize || null, user.id]
    );

    return reply.code(201).send({
      message: 'Attachment added successfully',
      attachment: {
        id: result.rows[0].id,
        fileName: result.rows[0].file_name,
        fileUrl: result.rows[0].file_url,
        fileType: result.rows[0].file_type,
        fileSize: result.rows[0].file_size,
        uploadedBy: result.rows[0].uploaded_by,
        uploadedAt: result.rows[0].uploaded_at,
      },
    });
  } catch (error) {
    console.error('Add attachment error:', error);
    return reply.code(500).send({
      message: 'Internal server error',
    });
  }
};

// Delete attachment
const deleteAttachment = async (request, reply) => {
  try {
    const user = request.user;
    const { id: projectId, attachmentId } = request.params;

    const projectCheck = await pool.query(
      `
      SELECT * FROM projects WHERE id = $1
      `,
      [projectId]
    );

    if (projectCheck.rows.length === 0) {
      return reply.code(404).send({
        message: 'Project not found',
      });
    }

    const project = projectCheck.rows[0];

    if (
      user.role !== 'admin' &&
      project.student_id !== user.id &&
      project.supervisor_id !== user.id
    ) {
      return reply.code(403).send({
        message: 'You do not have permission to delete attachments from this project',
      });
    }

    const result = await pool.query(
      `
      DELETE FROM project_attachments
      WHERE id = $1 AND project_id = $2
      RETURNING *
      `,
      [attachmentId, projectId]
    );

    if (result.rows.length === 0) {
      return reply.code(404).send({
        message: 'Attachment not found',
      });
    }

    return reply.send({
      message: 'Attachment deleted successfully',
    });
  } catch (error) {
    console.error('Delete attachment error:', error);
    return reply.code(500).send({
      message: 'Internal server error',
    });
  }
};

// Create a project from an approved proposal
const createProjectFromProposal = async (proposalId, client = pool) => {
  const proposalResult = await client.query(
    `
    SELECT * FROM proposals WHERE id = $1 AND status = 'approved'
    `,
    [proposalId]
  );

  if (proposalResult.rows.length === 0) {
    throw new Error('Approved proposal not found');
  }

  const proposal = proposalResult.rows[0];

  const existingProject = await client.query(
    `
    SELECT id FROM projects WHERE proposal_id = $1
    `,
    [proposalId]
  );

  if (existingProject.rows.length > 0) {
    return existingProject.rows[0];
  }

  const result = await client.query(
    `
    INSERT INTO projects (
      proposal_id,
      student_id,
      supervisor_id,
      title,
      description
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [
      proposalId,
      proposal.student_id,
      proposal.supervisor_id,
      proposal.title,
      proposal.description,
    ]
  );

  return result.rows[0];
};

module.exports = {
  getProjects,
  getProjectById,
  updateProject,
  addAttachment,
  deleteAttachment,
  createProjectFromProposal,
};