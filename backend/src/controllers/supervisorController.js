const pool = require('../db');

const getSupervisors = async (request, reply) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        department,
        expertise,
        max_students,
        current_students
      FROM users
      WHERE role = 'supervisor'
      ORDER BY name ASC
      `
    );

    const supervisors = result.rows.map((supervisor) => ({
      id: supervisor.id,
      name: supervisor.name,
      email: supervisor.email,
      department: supervisor.department,
      expertise: supervisor.expertise,
      maxStudents: supervisor.max_students,
      currentStudents: supervisor.current_students,
    }));

    return reply.send({ supervisors });
  } catch (error) {
    console.error('Get supervisors error:', error);
    return reply.code(500).send({
      message: 'Internal server error',
    });
  }
};

module.exports = {
  getSupervisors,
};