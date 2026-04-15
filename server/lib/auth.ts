import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { FastifyRequest, FastifyReply } from 'fastify';

const JWT_SECRET = process.env.JWT_SECRET || 'supervision-system-secret-change-in-production';
const SALT_ROUNDS = 10;

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'student' | 'supervisor' | 'admin';
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

// Fastify decorator to require authentication
export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = request.cookies?.token || request.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return reply.status(401).send({ error: 'Authentication required' });
    }

    const payload = verifyToken(token);
    (request as any).user = payload;
  } catch {
    return reply.status(401).send({ error: 'Invalid or expired token' });
  }
}

// Role-based access helper
export function requireRole(...roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    if (!user || !roles.includes(user.role)) {
      return reply.status(403).send({ error: 'Insufficient permissions' });
    }
  };
}
