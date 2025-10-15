import { prisma } from '../../core/utils/prisma.js';
import { HttpError } from '../../core/errors/httpError.js';

export function listVersions(productId: string) {
  return prisma.version.findMany({ where: { productId }, orderBy: { createdAt: 'desc' } });
}

export async function createVersion(productId: string, data: { number: string; changelogMD: string; zipUrl: string }) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new HttpError(404, 'PRODUCT_NOT_FOUND', 'Produit introuvable');
  return prisma.version.create({
    data: {
      productId,
      ...data,
    },
  });
}

export function deleteVersion(id: string) {
  return prisma.version.delete({ where: { id } });
}
