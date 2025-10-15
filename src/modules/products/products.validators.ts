import { z } from 'zod';
import { ProductStatus, ProductType } from '@prisma/client';

export const productFilterSchema = z.object({
  q: z.string().optional(),
  type: z.nativeEnum(ProductType).optional(),
  compat: z.array(z.string()).optional(),
  minPrice: z.preprocess((value) => (value ? Number(value) : undefined), z.number().int().min(0).optional()),
  maxPrice: z.preprocess((value) => (value ? Number(value) : undefined), z.number().int().min(0).optional()),
  sort: z.enum(['recent', 'popular', 'price-asc', 'price-desc']).optional(),
  page: z.preprocess((value) => Number(value), z.number().int().min(1).optional()),
  pageSize: z.preprocess((value) => Number(value), z.number().int().min(1).max(100).optional()),
});

export const productBodySchema = z.object({
  title: z.string().min(3),
  subtitle: z.string().optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  type: z.nativeEnum(ProductType),
  descriptionMD: z.string().min(20),
  priceCents: z.number().int().min(0),
  compatibility: z.array(z.string()).min(1),
  tags: z.array(z.string()).min(1),
  coverUrl: z.string().url().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  categoryIds: z.array(z.string()).optional(),
});
