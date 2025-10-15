import { Router } from 'express';
import { Role } from '@prisma/client';
import { adminGuard } from './admin.guard.js';
import { prisma } from '../../core/utils/prisma.js';
import { csrfProtection } from '../../core/middlewares/csrf.js';
import { requireRole } from '../auth/auth.service.js';

export const adminRouter = Router();

adminRouter.use(adminGuard);

adminRouter.get('/stats', async (_req, res) => {
  const [users, products, orders] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.aggregate({ _sum: { totalCents: true }, _count: { id: true } }),
  ]);
  res.json({
    stats: {
      utilisateurs: users,
      produits: products,
      commandes: orders._count.id,
      revenusCents: orders._sum.totalCents ?? 0,
    },
  });
});

adminRouter.get('/orders', async (_req, res) => {
  const orders = await prisma.order.findMany({ include: { items: true, buyer: true }, orderBy: { createdAt: 'desc' } });
  res.json({ orders });
});

adminRouter.post('/products/:id/publish', csrfProtection, async (req, res) => {
  requireRole(req.session, [Role.ADMIN]);
  const product = await prisma.product.update({ where: { id: req.params.id }, data: { status: req.body.status ?? 'PUBLISHED' } });
  res.json({ product });
});

adminRouter.delete('/products/:id', csrfProtection, async (req, res) => {
  await prisma.product.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

export default adminRouter;
