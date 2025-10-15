import { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';

export function adminGuard(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user || req.session.user.role !== Role.ADMIN) {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Réservé aux administrateurs.' } });
  }
  next();
}
