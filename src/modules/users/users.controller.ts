import { Request, Response } from 'express';
import 'express-session';
import { Role } from '@prisma/client';
import { listUsers, updateUserRole, deleteUser } from './users.service.js';
import { requireRole } from '../auth/auth.service.js';
import { badRequest } from '../../core/errors/httpError.js';

export async function listUsersHandler(req: Request, res: Response) {
  requireRole(req.session, [Role.ADMIN]);
  const users = await listUsers();
  res.json({ users });
}

export async function updateUserRoleHandler(req: Request, res: Response) {
  requireRole(req.session, [Role.ADMIN]);
  const { role } = req.body;
  if (!role || !Object.values(Role).includes(role)) {
    throw badRequest('Rôle invalide');
  }
  const user = await updateUserRole(req.params.id, role);
  res.json({ user });
}

export async function deleteUserHandler(req: Request, res: Response) {
  requireRole(req.session, [Role.ADMIN]);
  await deleteUser(req.params.id);
  res.json({ success: true });
}
