import { Role } from '@prisma/client';
import { prisma } from '../../core/utils/prisma.js';
import { HttpError } from '../../core/errors/httpError.js';

export function listVersions(productId: string) {
  return prisma.version.findMany({ where: { productId }, orderBy: { createdAt: 'desc' } });
}

async function assertCanMutateProduct(productId: string, user: { id: string; role: Role }) {
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true, authorId: true } });
  if (!product) {
    throw new HttpError(404, 'PRODUCT_NOT_FOUND', 'Produit introuvable');
  }
  if (user.role !== Role.ADMIN && product.authorId !== user.id) {
    throw new HttpError(403, 'FORBIDDEN', 'Modification non autorisée');
  }
  return product;
}

export async function createVersion(
  productId: string,
  data: { number: string; changelogMD: string; zipUrl: string },
  user: { id: string; role: Role }
) {
  await assertCanMutateProduct(productId, user);
  return prisma.version.create({
    data: {
      productId,
      ...data,
    },
  });
}

export async function deleteVersion(id: string, user: { id: string; role: Role }) {
  const version = await prisma.version.findUnique({ where: { id }, select: { id: true, productId: true } });
  if (!version) {
    throw new HttpError(404, 'VERSION_NOT_FOUND', 'Version introuvable');
  }
  await assertCanMutateProduct(version.productId, user);
  return prisma.version.delete({ where: { id } });
}
