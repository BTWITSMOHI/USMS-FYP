import type { FastifyInstance } from 'fastify';
import { User } from '../models/User.js';
import { hashPassword, comparePassword, generateToken } from '../lib/auth.js';

export async function authRoutes(app: FastifyInstance) {
  // POST /api/auth/signup
  app.post('/api/auth/signup', async (request, reply) => {
    const { email, password, name, role, department, studentId, maxStudents, expertise } =
      request.body as {
        email: string;
        password: string;
        name: string;
        role: 'student' | 'supervisor' | 'admin';
        department?: string;
        studentId?: string;
        maxStudents?: number;
        expertise?: string[];
      };

    if (!email || !password || !name || !role) {
      return reply.status(400).send({ error: 'Email, password, name, and role are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return reply.status(409).send({ error: 'An account with this email already exists' });
    }

    const hashed = await hashPassword(password);

    const user = await User.create({
      email: email.toLowerCase(),
      password: hashed,
      name,
      role,
      department: department || 'Computer Science',
      studentId: role === 'student' ? studentId || `CS${Date.now()}` : undefined,
      maxStudents: role === 'supervisor' ? maxStudents || 5 : undefined,
      currentStudents: role === 'supervisor' ? 0 : undefined,
      expertise: role === 'supervisor' ? expertise || [] : undefined,
    });

    const token = generateToken({ userId: user._id.toString(), email: user.email, role: user.role });

    reply
      .setCookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      })
      .send({
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department,
          studentId: user.studentId,
          maxStudents: user.maxStudents,
          currentStudents: user.currentStudents,
          expertise: user.expertise,
        },
        token,
      });
  });

  // POST /api/auth/login
  app.post('/api/auth/login', async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };

    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return reply.status(401).send({ error: 'Invalid email or password' });
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return reply.status(401).send({ error: 'Invalid email or password' });
    }

    const token = generateToken({ userId: user._id.toString(), email: user.email, role: user.role });

    reply
      .setCookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      })
      .send({
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department,
          studentId: user.studentId,
          supervisorId: user.supervisorId,
          maxStudents: user.maxStudents,
          currentStudents: user.currentStudents,
          expertise: user.expertise,
        },
        token,
      });
  });

  // POST /api/auth/logout
  app.post('/api/auth/logout', async (_request, reply) => {
    reply.clearCookie('token', { path: '/' }).send({ message: 'Logged out' });
  });

  // GET /api/auth/me - get current user from token
  app.get('/api/auth/me', async (request, reply) => {
    const token = request.cookies?.token || request.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return reply.status(401).send({ error: 'Not authenticated' });
    }

    try {
      const { verifyToken } = await import('../lib/auth.js');
      const payload = verifyToken(token);
      const user = await User.findById(payload.userId).select('-password');
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      reply.send({
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department,
          studentId: user.studentId,
          supervisorId: user.supervisorId,
          maxStudents: user.maxStudents,
          currentStudents: user.currentStudents,
          expertise: user.expertise,
        },
      });
    } catch {
      reply.clearCookie('token', { path: '/' }).status(401).send({ error: 'Invalid token' });
    }
  });
}
