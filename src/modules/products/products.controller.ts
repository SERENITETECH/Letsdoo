import { Request, Response } from 'express';
import 'express-session';
import { Role } from '@prisma/client';
import { listProducts, getProductById, createProduct, updateProduct, deleteProduct } from './products.service.js';
import { productBodySchema, productFilterSchema } from './products.validators.js';
import { badRequest } from '../../core/errors/httpError.js';
import { requireRole } from '../auth/auth.service.js';

export async function listProductsHandler(req: Request, res: Response) {
  const parsed = productFilterSchema.safeParse({
    ...req.query,
    compat: Array.isArray(req.query.compat) ? req.query.compat : req.query.compat ? [req.query.compat] : undefined,
  });
  if (!parsed.success) {
    throw badRequest('Filtres invalides', parsed.error.flatten());
  }
  const products = await listProducts(parsed.data);
  res.json(products);
}

export async function getProductHandler(req: Request, res: Response) {
  const product = await getProductById(req.params.id);
  res.json({ product });
}

export async function createProductHandler(req: Request, res: Response) {
  requireRole(req.session, [Role.CREATOR, Role.ADMIN]);
  const parsed = productBodySchema.safeParse(req.body);
  if (!parsed.success) {
    throw badRequest('Données produit invalides', parsed.error.flatten());
  }
  const product = await createProduct(parsed.data, req.session.user!);
  res.status(201).json({ product });
}

export async function updateProductHandler(req: Request, res: Response) {
  requireRole(req.session, [Role.CREATOR, Role.ADMIN]);
  const parsed = productBodySchema.partial().safeParse(req.body);
  if (!parsed.success) {
    throw badRequest('Données produit invalides', parsed.error.flatten());
  }
  const product = await updateProduct(req.params.id, parsed.data, req.session.user!);
  res.json({ product });
}

export async function deleteProductHandler(req: Request, res: Response) {
  requireRole(req.session, [Role.ADMIN]);
  await deleteProduct(req.params.id);
  res.status(204).end();
}
