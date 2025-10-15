import { Role } from '@prisma/client';
import { prisma } from '../../core/utils/prisma.js';
import { HttpError } from '../../core/errors/httpError.js';

export async function listUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      displayName: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateUserRole(userId: string, role: Role) {
  return prisma.user.update({ where: { id: userId }, data: { role } });
}

export async function deleteUser(userId: string) {
  try {
    await prisma.user.delete({ where: { id: userId } });
  } catch (error) {
    throw new HttpError(400, 'USER_DELETE_FAILED', 'Suppression impossible');
  }
}
