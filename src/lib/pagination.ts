export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export type NameOrCreatedAtSort =
  | "name_asc"
  | "created_at_desc"
  | "created_at_asc";

export interface NameOrCreatedAtSortParams extends PaginationParams {
  sort?: NameOrCreatedAtSort;
}

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

type RequiredPaginationParams = Required<Pick<PaginationParams, "page" | "limit">>;

export function getEmptyPaginationMeta(
  limit = DEFAULT_PAGE_SIZE,
): PaginationMeta {
  return {
    page: 1,
    limit,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };
}

export async function fetchAllPaginatedItems<T>(
  loadPage: (
    params: RequiredPaginationParams,
  ) => Promise<PaginatedResponse<T>>,
): Promise<T[]> {
  const firstPage = await loadPage({ page: 1, limit: MAX_PAGE_SIZE });

  if (firstPage.meta.totalPages <= 1) {
    return firstPage.items;
  }

  const remainingPages = Array.from(
    { length: firstPage.meta.totalPages - 1 },
    (_, index) => index + 2,
  );
  const remainingResponses = await Promise.all(
    remainingPages.map((page) =>
      loadPage({ page, limit: firstPage.meta.limit }),
    ),
  );

  return [
    ...firstPage.items,
    ...remainingResponses.flatMap((response) => response.items),
  ];
}
