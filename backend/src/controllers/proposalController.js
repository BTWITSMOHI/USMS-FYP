const pool = require('../db');
const { createProjectFromProposal } = require('./projectController');

const createProposal = async (request, reply) => {
  try {
    const { title, description, supervisorId, documentName, documentUrl } =
      request.body;
    const user = request.user;

    if (user.role !== 'student') {
      return reply.code(403).send({
        message: 'Only students can submit proposals',
      });
    }

    if (!title || !description) {
      return reply.code(400).send({
        message: 'Title and description are required',
      });
    }

    let validatedSupervisorId = null;

    if (
      supervisorId !== undefined &&
      supervisorId !== null &&
      supervisorId !== ''
    ) {
      const supervisorCheck = await pool.query(
        `
        SELECT id, role
        FROM users
        WHERE id = $1
        `,
        [supervisorId]
      );

      if (supervisorCheck.rows.length === 0) {
        return reply.code(404).send({
          message: 'Selected supervisor not found',
        });
      }

      if (supervisorCheck.rows[0].role !== 'supervisor') {
        return reply.code(400).send({
          message: 'Selected user is not a supervisor',
        });
      }

      validatedSupervisorId = supervisorId;
    }

    const result = await pool.query(
      `
      INSERT INTO proposals (
        student_id,
        supervisor_id,
        title,
        description,
        document_name,
        document_url
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        user.id,
        validatedSupervisorId,
        title,
        description,
        documentName || null,
        documentUrl || null,
      ]
    );

    return reply.code(201).send({
      message: 'Proposal submitted successfully',
      proposal: result.rows[0],
    });
  } catch (error) {
    console.error('Create proposal error:', error);
    return reply.code(500).send({
      message: 'Internal server error',
    });
  }
};

const getProposals = async (request, reply) => {
  try {
    const user = request.user;
    let result;

    if (user.role === 'student') {
      result = await pool.query(
        `
        SELECT
          p.*,
          s.name AS student_name,
          sup.name AS supervisor_name
        FROM proposals p
        JOIN users s ON p.student_id = s.id
        LEFT JOIN users sup ON p.supervisor_id = sup.id
        WHERE p.student_id = $1
        ORDER BY p.submitted_at DESC
        `,
        [user.id]
      );
    } else if (user.role === 'supervisor') {
      result = await pool.query(
        `
        SELECT
          p.*,
          s.name AS student_name,
          sup.name AS supervisor_name
        FROM proposals p
        JOIN users s ON p.student_id = s.id
        LEFT JOIN users sup ON p.supervisor_id = sup.id
        WHERE p.supervisor_id = $1
        ORDER BY p.submitted_at DESC
        `,
        [user.id]
      );
    } else if (user.role === 'admin') {
      result = await pool.query(
        `
        SELECT
          p.*,
          s.name AS student_name,
          sup.name AS supervisor_name
        FROM proposals p
        JOIN users s ON p.student_id = s.id
        LEFT JOIN users sup ON p.supervisor_id = sup.id
        ORDER BY p.submitted_at DESC
        `
      );
    } else {
      return reply.code(403).send({
        message: 'Unauthorized role',
      });
    }

    const proposals = result.rows.map((proposal) => ({
      id: proposal.id,
      studentId: proposal.student_id,
      studentName: proposal.student_name,
      supervisorId: proposal.supervisor_id,
      supervisorName: proposal.supervisor_name,
      title: proposal.title,
      description: proposal.description,
      status: proposal.status,
      feedback: proposal.feedback,
      documentName: proposal.document_name,
      documentUrl: proposal.document_url,
      submittedAt: proposal.submitted_at,
      reviewedAt: proposal.reviewed_at,
    }));

    return reply.send({ proposals });
  } catch (error) {
    console.error('Get proposals error:', error);
    return reply.code(500).send({
      message: 'Internal server error',
    });
  }
};

const assignSupervisor = async (request, reply) => {
  try {
    const user = request.user;
    const proposalId = request.params.id;
    const { supervisorId } = request.body;

    if (user.role !== 'admin') {
      return reply.code(403).send({
        message: 'Only admins can assign supervisors',
      });
    }

    if (!supervisorId) {
      return reply.code(400).send({
        message: 'Supervisor ID is required',
      });
    }

    const supervisorResult = await pool.query(
      `
      SELECT id, role, max_students, current_students
      FROM users
      WHERE id = $1
      `,
      [supervisorId]
    );

    if (supervisorResult.rows.length === 0) {
      return reply.code(404).send({
        message: 'Supervisor not found',
      });
    }

    const supervisor = supervisorResult.rows[0];

    if (supervisor.role !== 'supervisor') {
      return reply.code(400).send({
        message: 'Selected user is not a supervisor',
      });
    }

    if (supervisor.current_students >= supervisor.max_students) {
      return reply.code(400).send({
        message: 'Supervisor has reached maximum capacity',
      });
    }

    const proposalResult = await pool.query(
      `
      UPDATE proposals
      SET supervisor_id = $1
      WHERE id = $2
      RETURNING *
      `,
      [supervisorId, proposalId]
    );

    if (proposalResult.rows.length === 0) {
      return reply.code(404).send({
        message: 'Proposal not found',
      });
    }

    await pool.query(
      `
      UPDATE users
      SET current_students = current_students + 1
      WHERE id = $1
      `,
      [supervisorId]
    );

    return reply.send({
      message: 'Supervisor assigned successfully',
      proposal: proposalResult.rows[0],
    });
  } catch (error) {
    console.error('Assign supervisor error:', error);
    return reply.code(500).send({
      message: 'Internal server error',
    });
  }
};

const reviewProposal = async (request, reply) => {
  try {
    const user = request.user;
    const proposalId = request.params.id;
    const { status, feedback } = request.body;

    if (user.role !== 'supervisor') {
      return reply.code(403).send({
        message: 'Only supervisors can review proposals',
      });
    }

    if (!status || !['approved', 'rejected'].includes(status)) {
      return reply.code(400).send({
        message: 'Status must be approved or rejected',
      });
    }

    const proposalCheck = await pool.query(
      `
      SELECT *
      FROM proposals
      WHERE id = $1 AND supervisor_id = $2
      `,
      [proposalId, user.id]
    );

    if (proposalCheck.rows.length === 0) {
      return reply.code(404).send({
        message: 'Proposal not found or not assigned to this supervisor',
      });
    }

    const result = await pool.query(
      `
      UPDATE proposals
      SET status = $1,
          feedback = $2,
          reviewed_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
      `,
      [status, feedback || null, proposalId]
    );

    if (status === 'approved') {
      await createProjectFromProposal(proposalId);
    }

    return reply.send({
      message: 'Proposal reviewed successfully',
      proposal: result.rows[0],
    });
  } catch (error) {
    console.error('Review proposal error:', error);
    return reply.code(500).send({
      message: 'Internal server error',
    });
  }
};

const updateProposal = async (request, reply) => {
  try {
    const user = request.user;
    const proposalId = request.params.id;
    const { title, description, supervisorId, documentName, documentUrl } =
      request.body;

    if (user.role !== 'student') {
      return reply.code(403).send({
        message: 'Only students can edit proposals',
      });
    }

    const proposalCheck = await pool.query(
      `
      SELECT *
      FROM proposals
      WHERE id = $1
      `,
      [proposalId]
    );

    if (proposalCheck.rows.length === 0) {
      return reply.code(404).send({
        message: 'Proposal not found',
      });
    }

    const proposal = proposalCheck.rows[0];

    if (proposal.student_id !== user.id) {
      return reply.code(403).send({
        message: 'You can only edit your own proposals',
      });
    }

    if (proposal.status !== 'pending') {
      return reply.code(400).send({
        message: 'Only pending proposals can be edited',
      });
    }

    let validatedSupervisorId = proposal.supervisor_id;

    if (supervisorId !== undefined) {
      if (supervisorId === null || supervisorId === '') {
        validatedSupervisorId = null;
      } else {
        const supervisorCheck = await pool.query(
          `
          SELECT id, role
          FROM users
          WHERE id = $1
          `,
          [supervisorId]
        );

        if (supervisorCheck.rows.length === 0) {
          return reply.code(404).send({
            message: 'Selected supervisor not found',
          });
        }

        if (supervisorCheck.rows[0].role !== 'supervisor') {
          return reply.code(400).send({
            message: 'Selected user is not a supervisor',
          });
        }

        validatedSupervisorId = supervisorId;
      }
    }

    const result = await pool.query(
      `
      UPDATE proposals
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        supervisor_id = $3,
        document_name = $4,
        document_url = $5
      WHERE id = $6
      RETURNING *
      `,
      [
        title ?? proposal.title,
        description ?? proposal.description,
        validatedSupervisorId,
        documentName ?? proposal.document_name,
        documentUrl ?? proposal.document_url,
        proposalId,
      ]
    );

    return reply.send({
      message: 'Proposal updated successfully',
      proposal: result.rows[0],
    });
  } catch (error) {
    console.error('Update proposal error:', error);
    return reply.code(500).send({
      message: 'Internal server error',
    });
  }
};

const deleteProposal = async (request, reply) => {
  try {
    const user = request.user;
    const proposalId = request.params.id;

    if (user.role !== 'student') {
      return reply.code(403).send({
        message: 'Only students can delete proposals',
      });
    }

    const proposalCheck = await pool.query(
      `
      SELECT *
      FROM proposals
      WHERE id = $1
      `,
      [proposalId]
    );

    if (proposalCheck.rows.length === 0) {
      return reply.code(404).send({
        message: 'Proposal not found',
      });
    }

    const proposal = proposalCheck.rows[0];

    if (proposal.student_id !== user.id) {
      return reply.code(403).send({
        message: 'You can only delete your own proposals',
      });
    }

    if (proposal.status === 'approved') {
      return reply.code(400).send({
        message: 'Approved proposals cannot be deleted',
      });
    }

    await pool.query(
      `
      DELETE FROM proposals
      WHERE id = $1
      `,
      [proposalId]
    );

    return reply.send({
      message: 'Proposal deleted successfully',
    });
  } catch (error) {
    console.error('Delete proposal error:', error);
    return reply.code(500).send({
      message: 'Internal server error',
    });
  }
};

module.exports = {
  createProposal,
  getProposals,
  assignSupervisor,
  reviewProposal,
  updateProposal,
  deleteProposal,
};