const pool = require('../db');

const getMessages = async (request, reply) => {
  try {
    const user = request.user;
    const proposalId = request.params.id;

    const proposalCheck = await pool.query(
      `
      SELECT p.*, s.id AS student_user_id, sup.id AS supervisor_user_id
      FROM proposals p
      JOIN users s ON p.student_id = s.id
      LEFT JOIN users sup ON p.supervisor_id = sup.id
      WHERE p.id = $1
      `,
      [proposalId]
    );

    if (proposalCheck.rows.length === 0) {
      return reply.code(404).send({
        message: 'Proposal not found',
      });
    }

    const proposal = proposalCheck.rows[0];

    const isAllowed =
      user.role === 'admin' ||
      user.id === proposal.student_user_id ||
      user.id === proposal.supervisor_user_id;

    if (!isAllowed) {
      return reply.code(403).send({
        message: 'You are not allowed to view messages for this proposal',
      });
    }

    const result = await pool.query(
      `
      SELECT
        m.id,
        m.proposal_id,
        m.sender_id,
        u.name AS sender_name,
        u.role AS sender_role,
        m.content,
        m.timestamp
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.proposal_id = $1
      ORDER BY m.timestamp ASC
      `,
      [proposalId]
    );

    const messages = result.rows.map((message) => ({
      id: message.id,
      proposalId: message.proposal_id,
      senderId: message.sender_id,
      senderName: message.sender_name,
      senderRole: message.sender_role,
      content: message.content,
      timestamp: message.timestamp,
    }));

    return reply.send({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    return reply.code(500).send({
      message: 'Internal server error',
    });
  }
};

const sendMessage = async (request, reply) => {
  try {
    const user = request.user;
    const proposalId = request.params.id;
    const { content } = request.body;

    if (!content || !content.trim()) {
      return reply.code(400).send({
        message: 'Message content is required',
      });
    }

    const proposalCheck = await pool.query(
      `
      SELECT p.*, s.id AS student_user_id, sup.id AS supervisor_user_id
      FROM proposals p
      JOIN users s ON p.student_id = s.id
      LEFT JOIN users sup ON p.supervisor_id = sup.id
      WHERE p.id = $1
      `,
      [proposalId]
    );

    if (proposalCheck.rows.length === 0) {
      return reply.code(404).send({
        message: 'Proposal not found',
      });
    }

    const proposal = proposalCheck.rows[0];

    const isAllowed =
      user.role === 'admin' ||
      user.id === proposal.student_user_id ||
      user.id === proposal.supervisor_user_id;

    if (!isAllowed) {
      return reply.code(403).send({
        message: 'You are not allowed to send messages for this proposal',
      });
    }

    const result = await pool.query(
      `
      INSERT INTO messages (proposal_id, sender_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [proposalId, user.id, content.trim()]
    );

    const createdMessage = await pool.query(
      `
      SELECT
        m.id,
        m.proposal_id,
        m.sender_id,
        u.name AS sender_name,
        u.role AS sender_role,
        m.content,
        m.timestamp
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = $1
      `,
      [result.rows[0].id]
    );

    const message = createdMessage.rows[0];

    return reply.code(201).send({
      message: 'Message sent successfully',
      data: {
        id: message.id,
        proposalId: message.proposal_id,
        senderId: message.sender_id,
        senderName: message.sender_name,
        senderRole: message.sender_role,
        content: message.content,
        timestamp: message.timestamp,
      },
    });
  } catch (error) {
    console.error('Send message error:', error);
    return reply.code(500).send({
      message: 'Internal server error',
    });
  }
};

module.exports = {
  getMessages,
  sendMessage,
};