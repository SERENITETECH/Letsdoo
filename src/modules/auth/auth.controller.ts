import { Request, Response } from 'express';
import 'express-session';
import { Role } from '@prisma/client';
import { authenticateUser, registerUser, sanitizeUser } from './auth.service.js';
import { loginSchema, registerSchema } from './auth.validators.js';
import { badRequest } from '../../core/errors/httpError.js';

export async function registerHandler(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw badRequest('Champs invalides', parsed.error.flatten());
  }
  const user = await registerUser(parsed.data);
  req.session.user = user;
  res.json({ user });
}

export async function loginHandler(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw badRequest('Champs invalides', parsed.error.flatten());
  }
  const user = await authenticateUser(parsed.data.email, parsed.data.password);
  req.session.regenerate((err) => {
    if (err) throw err;
    req.session.user = user;
    res.json({ user });
  });
}

export async function logoutHandler(req: Request, res: Response) {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
}

export async function meHandler(req: Request, res: Response) {
  if (!req.session.user) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Non connecté' } });
  }
  res.json({ user: req.session.user });
}

export async function csrfHandler(req: Request, res: Response) {
  const token = typeof (req as any).csrfToken === 'function' ? (req as any).csrfToken() : res.locals.csrfToken;
  res.json({ token });
}

export function elevateToCreator(req: Request, res: Response) {
  if (!req.session.user) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Non connecté' } });
  }
  req.session.user = sanitizeUser({ ...req.session.user, role: Role.CREATOR });
  res.json({ user: req.session.user });
}
