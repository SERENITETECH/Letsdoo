import { Router } from 'express';
import { Role } from '@prisma/client';
import { csrfProtection } from '../../core/middlewares/csrf.js';
import { requireRole } from '../auth/auth.service.js';
import { createOrder, listOrders } from './orders.service.js';
import { badRequest } from '../../core/errors/httpError.js';

export const ordersRouter = Router();

ordersRouter.get('/', async (req, res) => {
  const user = requireRole(req.session, [Role.CLIENT, Role.CREATOR, Role.ADMIN]);
  const orders = await listOrders(user);
  res.json({ orders });
});

ordersRouter.post('/', csrfProtection, async (req, res) => {
  const user = requireRole(req.session, [Role.CLIENT, Role.CREATOR, Role.ADMIN]);
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    throw badRequest('Panier vide');
  }
  const order = await createOrder(user.id, items);
  res.status(201).json({ order });
});
