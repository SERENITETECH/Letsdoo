import { Router } from 'express';
import { Role } from '@prisma/client';
import { csrfProtection } from '../../core/middlewares/csrf.js';
import { requireRole } from '../auth/auth.service.js';
import { listCategories, createCategory, updateCategory, deleteCategory } from './categories.service.js';
import { badRequest } from '../../core/errors/httpError.js';

export const categoriesRouter = Router();

categoriesRouter.get('/', async (_req, res) => {
  const categories = await listCategories();
  res.json({ categories });
});

categoriesRouter.post('/', csrfProtection, async (req, res) => {
  requireRole(req.session, [Role.ADMIN]);
  const { name, slug } = req.body;
  if (!name || !slug) throw badRequest('Nom et slug requis');
  const category = await createCategory({ name, slug });
  res.status(201).json({ category });
});

categoriesRouter.patch('/:id', csrfProtection, async (req, res) => {
  requireRole(req.session, [Role.ADMIN]);
  const category = await updateCategory(req.params.id, req.body);
  res.json({ category });
});

categoriesRouter.delete('/:id', csrfProtection, async (req, res) => {
  requireRole(req.session, [Role.ADMIN]);
  await deleteCategory(req.params.id);
  res.status(204).end();
});
