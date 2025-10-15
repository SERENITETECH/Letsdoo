import { Router } from 'express';
import { Role } from '@prisma/client';
import { csrfProtection } from '../../core/middlewares/csrf.js';
import { requireRole } from '../auth/auth.service.js';
import { createReview, listReviews } from './reviews.service.js';
import { badRequest } from '../../core/errors/httpError.js';

export const reviewsRouter = Router();

reviewsRouter.get('/:productId', async (req, res) => {
  const reviews = await listReviews(req.params.productId);
  res.json({ reviews });
});

reviewsRouter.post('/:productId', csrfProtection, async (req, res) => {
  const user = requireRole(req.session, [Role.CLIENT, Role.CREATOR, Role.ADMIN]);
  const { rating, comment } = req.body;
  if (!rating) throw badRequest('Note obligatoire');
  const review = await createReview(user.id, req.params.productId, { rating: Number(rating), comment });
  res.status(201).json({ review });
});
