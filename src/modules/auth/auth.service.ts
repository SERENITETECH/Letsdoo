import { Role } from '@prisma/client';
import { prisma } from '../../core/utils/prisma.js';
import { comparePassword, hashPassword } from '../../core/utils/password.js';
import { HttpError, badRequest, unauthorized } from '../../core/errors/httpError.js';

type SessionUser = {
  id: string;
  email: string;
  displayName: string;
  role: Role;
};

export async function registerUser(data: { email: string; password: string; displayName: string; role?: Role }) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw badRequest('Un compte existe déjà avec cet email.');
  }

  const passwordHash = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      displayName: data.displayName,
      role: data.role ?? Role.CLIENT,
    },
  });

  return sanitizeUser(user);
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw unauthorized('Identifiants invalides.');
  }

  const match = await comparePassword(password, user.passwordHash);
  if (!match) {
    throw unauthorized('Identifiants invalides.');
  }

  return sanitizeUser(user);
}

export function sanitizeUser(user: { id: string; email: string; displayName: string; role: Role }): SessionUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
  };
}

export function requireRole(session: Express.Session & { user?: SessionUser }, roles: Role[]) {
  const user = session.user;
  if (!user || !roles.includes(user.role)) {
    throw new HttpError(403, 'FORBIDDEN', 'Vous n’avez pas les droits nécessaires.');
  }
  return user;
}
