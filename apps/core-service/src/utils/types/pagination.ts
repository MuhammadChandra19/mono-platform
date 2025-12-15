/**
 * Cursor-based pagination parameters
 */
export interface CursorPagination {
  cursor?: number; // The ID to start from (exclusive)
  limit?: number; // Number of records to fetch (default: 20, max: 100)
}

/**
 * Paginated result with cursor information
 */
export interface CursorPaginatedResult<T> {
  data: T[];
  pageInfo: {
    nextCursor?: number; // Cursor for the next page (ID of last item)
    hasNextPage: boolean; // Whether there are more results
    count: number; // Number of items in current page
  };
}

/**
 * Default pagination values
 */
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

/**
 * Normalize and validate pagination parameters
 */
export const normalizePagination = (
  params?: CursorPagination,
): CursorPagination & { limit: number } => {
  const limit = params?.limit
    ? Math.min(Math.max(1, params.limit), MAX_LIMIT)
    : DEFAULT_LIMIT;

  return {
    cursor: params?.cursor,
    limit,
  };
};
