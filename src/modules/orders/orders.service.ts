import { OrderStatus, Role } from '@prisma/client';
import { prisma } from '../../core/utils/prisma.js';
import { HttpError } from '../../core/errors/httpError.js';

export async function createOrder(buyerId: string, items: { productId: string; qty: number }[]) {
  const products = await prisma.product.findMany({ where: { id: { in: items.map((item) => item.productId) } } });
  if (products.length !== items.length) {
    throw new HttpError(400, 'PRODUCT_NOT_FOUND', 'Certains produits sont introuvables');
  }
  const totalCents = products.reduce((total, product) => {
    const qty = items.find((item) => item.productId === product.id)?.qty ?? 1;
    return total + product.priceCents * qty;
  }, 0);

  const order = await prisma.order.create({
    data: {
      buyerId,
      totalCents,
      status: OrderStatus.PAID,
      items: {
        create: products.map((product) => ({
          productId: product.id,
          qty: items.find((item) => item.productId === product.id)?.qty ?? 1,
          unitPriceCents: product.priceCents,
        })),
      },
    },
    include: { items: true },
  });

  return order;
}

export function listOrders(user: { id: string; role: Role }) {
  return prisma.order.findMany({
    where: user.role === Role.ADMIN ? {} : { buyerId: user.id },
    include: {
      items: { include: { product: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}
