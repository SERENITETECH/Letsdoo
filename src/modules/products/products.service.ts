import { ProductStatus, ProductType, Role } from '@prisma/client';
import { prisma } from '../../core/utils/prisma.js';
import { parsePagination } from '../../core/utils/pagination.js';
import { HttpError } from '../../core/errors/httpError.js';

export interface ProductFilter {
  q?: string;
  type?: ProductType;
  compat?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: 'recent' | 'popular' | 'price-asc' | 'price-desc';
  page?: number;
  pageSize?: number;
}

export async function listProducts(filters: ProductFilter) {
  const { skip, take } = parsePagination(filters);
  const where: any = {
    status: ProductStatus.PUBLISHED,
  };
  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: 'insensitive' } },
      { descriptionMD: { contains: filters.q, mode: 'insensitive' } },
      { tags: { has: filters.q.toLowerCase() } },
    ];
  }
  if (filters.type) {
    where.type = filters.type;
  }
  if (filters.compat?.length) {
    where.compatibility = { array_contains: filters.compat };
  }
  if (typeof filters.minPrice === 'number' || typeof filters.maxPrice === 'number') {
    where.priceCents = {};
    if (typeof filters.minPrice === 'number') where.priceCents.gte = filters.minPrice;
    if (typeof filters.maxPrice === 'number') where.priceCents.lte = filters.maxPrice;
  }

  let orderBy: any = { createdAt: 'desc' };
  switch (filters.sort) {
    case 'popular':
      orderBy = { reviews: { _count: 'desc' } };
      break;
    case 'price-asc':
      orderBy = { priceCents: 'asc' };
      break;
    case 'price-desc':
      orderBy = { priceCents: 'desc' };
      break;
    default:
      break;
  }

  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        author: { select: { id: true, displayName: true } },
        reviews: true,
        versions: { orderBy: { createdAt: 'desc' } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page: filters.page ?? 1, pageSize: filters.pageSize ?? 20 };
}

export async function getProductById(id: string, requester?: { id: string; role: Role } | null) {
  const identifierWhere = { OR: [{ id }, { slug: id }] };
  const productMetadata = await prisma.product.findFirst({
    where: identifierWhere,
    select: { id: true, authorId: true, status: true },
  });
  if (!productMetadata) {
    throw new HttpError(404, 'PRODUCT_NOT_FOUND', 'Produit introuvable');
  }
  const isOwner = requester && productMetadata.authorId === requester.id;
  const isAdmin = requester?.role === Role.ADMIN;
  if (productMetadata.status !== ProductStatus.PUBLISHED && !isOwner && !isAdmin) {
    throw new HttpError(404, 'PRODUCT_NOT_FOUND', 'Produit introuvable');
  }
  return prisma.product.findUnique({
    where: { id: productMetadata.id },
    include: {
      author: { select: { id: true, displayName: true } },
      versions: { orderBy: { createdAt: 'desc' } },
      reviews: {
        include: { user: { select: { id: true, displayName: true } } },
        orderBy: { createdAt: 'desc' },
      },
      categories: { include: { category: true } },
    },
  });
}

export async function createProduct(data: any, user: { id: string; role: Role }) {
  if (![Role.CREATOR, Role.ADMIN].includes(user.role)) {
    throw new HttpError(403, 'FORBIDDEN', 'Seuls les créateurs peuvent publier.');
  }
  return prisma.product.create({
    data: {
      ...data,
      authorId: user.id,
      categories: data.categoryIds
        ? { create: data.categoryIds.map((categoryId: string) => ({ categoryId })) }
        : undefined,
    },
  });
}

export async function updateProduct(id: string, data: any, user: { id: string; role: Role }) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new HttpError(404, 'PRODUCT_NOT_FOUND', 'Produit introuvable');
  if (user.role !== Role.ADMIN && product.authorId !== user.id) {
    throw new HttpError(403, 'FORBIDDEN', 'Modification non autorisée');
  }
  return prisma.product.update({
    where: { id },
    data: {
      ...data,
      categories: data.categoryIds
        ? {
            deleteMany: {},
            create: data.categoryIds.map((categoryId: string) => ({ categoryId })),
          }
        : undefined,
    },
  });
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
}
