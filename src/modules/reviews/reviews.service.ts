import { prisma } from '../../core/utils/prisma.js';
import { HttpError } from '../../core/errors/httpError.js';

export async function listReviews(productId: string) {
  return prisma.review.findMany({
    where: { productId },
    include: { user: { select: { id: true, displayName: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createReview(userId: string, productId: string, data: { rating: number; comment: string }) {
  const order = await prisma.order.findFirst({
    where: {
      buyerId: userId,
      items: { some: { productId } },
    },
  });
  if (!order) {
    throw new HttpError(403, 'NOT_ELIGIBLE', 'Vous devez acheter le produit avant de laisser un avis.');
  }
  return prisma.review.create({
    data: {
      userId,
      productId,
      rating: data.rating,
      comment: data.comment,
    },
  });
}
