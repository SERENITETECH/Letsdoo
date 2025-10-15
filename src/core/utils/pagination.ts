export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}

export function parsePagination(query: PaginationQuery) {
  const page = Number(query.page ?? 1);
  const pageSize = Number(query.pageSize ?? 20);
  return {
    skip: (page - 1) * pageSize,
    take: Math.min(pageSize, 100),
  };
}
