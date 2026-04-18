const bcrypt = require('bcryptjs');
const pool = require('../db');

const register = async (request, reply) => {
  try {
    const {
      name,
      email,
      password,
      role,
      department,
      studentId,
      expertise,
      maxStudents,
    } = request.body;

    if (!name || !email || !password || !role) {
      return reply.code(400).send({
        message: 'Name, email, password, and role are required',
      });
    }

    const allowedRoles = ['student', 'supervisor', 'admin'];
    if (!allowedRoles.includes(role)) {
      return reply.code(400).send({
        message: 'Invalid role',
      });
    }

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return reply.code(409).send({
        message: 'Email already in use',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users (
        name,
        email,
        password_hash,
        role,
        department,
        student_id,
        expertise,
        max_students
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, name, email, role, department, student_id, expertise, max_students, current_students, created_at
      `,
      [
        name,
        email,
        passwordHash,
        role,
        department || null,
        studentId || null,
        expertise || null,
        maxStudents ?? 0,
      ]
    );

    return reply.code(201).send({
      message: 'User registered successfully',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Register error:', error);
    return reply.code(500).send({
      message: 'Internal server error',
    });
  }
};

const login = async (request, reply) => {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.code(400).send({
        message: 'Email and password are required',
      });
    }

    const result = await pool.query(
      `
      SELECT id, name, email, password_hash, role, department, student_id, expertise, max_students, current_students
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return reply.code(401).send({
        message: 'Invalid email or password',
      });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return reply.code(401).send({
        message: 'Invalid email or password',
      });
    }

    const token = await reply.jwtSign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      {
        expiresIn: '7d',
      }
    );

    return reply.send({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        studentId: user.student_id,
        expertise: user.expertise,
        maxStudents: user.max_students,
        currentStudents: user.current_students,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return reply.code(500).send({
      message: 'Internal server error',
    });
  }
};

const getMe = async (request, reply) => {
    try {
      const userId = request.user.id;
  
      const result = await pool.query(
        `
        SELECT id, name, email, role, department, student_id, expertise, max_students, current_students, created_at
        FROM users
        WHERE id = $1
        `,
        [userId]
      );
  
      if (result.rows.length === 0) {
        return reply.code(404).send({
          message: 'User not found',
        });
      }
  
      const user = result.rows[0];
  
      return reply.send({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          studentId: user.student_id,
          expertise: user.expertise,
          maxStudents: user.max_students,
          currentStudents: user.current_students,
          createdAt: user.created_at,
        },
      });
    } catch (error) {
      console.error('Get me error:', error);
      return reply.code(500).send({
        message: 'Internal server error',
      });
    }
  };

  module.exports = {
    register,
    login,
    getMe,
  };