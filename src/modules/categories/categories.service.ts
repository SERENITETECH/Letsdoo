import { prisma } from '../../core/utils/prisma.js';

export function listCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
}

export function createCategory(data: { name: string; slug: string }) {
  return prisma.category.create({ data });
}

export function updateCategory(id: string, data: { name?: string; slug?: string }) {
  return prisma.category.update({ where: { id }, data });
}

export function deleteCategory(id: string) {
  return prisma.category.delete({ where: { id } });
}
