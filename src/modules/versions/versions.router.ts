import { Router } from 'express';
import { Role } from '@prisma/client';
import { csrfProtection } from '../../core/middlewares/csrf.js';
import { requireRole } from '../auth/auth.service.js';
import { createVersion, deleteVersion, listVersions } from './versions.service.js';
import { badRequest } from '../../core/errors/httpError.js';

export const versionsRouter = Router();

versionsRouter.get('/:productId', async (req, res) => {
  const versions = await listVersions(req.params.productId);
  res.json({ versions });
});

versionsRouter.post('/:productId', csrfProtection, async (req, res) => {
  const user = requireRole(req.session, [Role.CREATOR, Role.ADMIN]);
  const { number, changelogMD, zipUrl } = req.body;
  if (!number || !zipUrl) throw badRequest('Version invalide');
  const version = await createVersion(req.params.productId, { number, changelogMD, zipUrl });
  res.status(201).json({ version, user });
});

versionsRouter.delete('/:id', csrfProtection, async (req, res) => {
  requireRole(req.session, [Role.CREATOR, Role.ADMIN]);
  await deleteVersion(req.params.id);
  res.status(204).end();
});
