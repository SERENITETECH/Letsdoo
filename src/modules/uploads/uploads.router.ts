import { Router } from 'express';
import multer from 'multer';
import { Role } from '@prisma/client';
import { saveFile } from './storage.service.js';
import { csrfProtection } from '../../core/middlewares/csrf.js';
import { requireRole } from '../auth/auth.service.js';
import { uploadRateLimiter } from '../../config/rateLimit.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

export const uploadsRouter = Router();

uploadsRouter.post('/image', uploadRateLimiter, csrfProtection, upload.single('image'), async (req, res) => {
  requireRole(req.session, [Role.CREATOR, Role.ADMIN]);
  if (!req.file) {
    return res.status(400).json({ error: { code: 'NO_FILE', message: 'Aucun fichier fourni' } });
  }
  const url = await saveFile(req.file);
  res.status(201).json({ url });
});

uploadsRouter.post('/zip', uploadRateLimiter, csrfProtection, upload.single('archive'), async (req, res) => {
  requireRole(req.session, [Role.CREATOR, Role.ADMIN]);
  if (!req.file) {
    return res.status(400).json({ error: { code: 'NO_FILE', message: 'Aucun fichier fourni' } });
  }
  const url = await saveFile(req.file);
  res.status(201).json({ url });
});
