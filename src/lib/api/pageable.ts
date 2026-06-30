import { toSnakeCase } from '@/lib/utils'

export type SortDirection = 'ASC' | 'DESC'
export type SearchOperation = '=' | '!=' | '<' | '>' | '<=' | '>='

export interface SearchCriteria {
  key: string
  operation: SearchOperation
  value: unknown
}

export interface SortSpec {
  key: string
  direction: SortDirection // @NotNull on the backend — always send it
}

export interface PageableRequest {
  page: number // @Min(1)
  perPage: number // @Min(1) @Max(50)
  sort: SortSpec
  search?: SearchCriteria[]
}

export interface PageableMeta {
  totalItems: number
  totalPages: number
  perPage: number // NOTE: count of items on the current page, NOT the requested value
  page: number
}

export interface PageableResponse<T> {
  meta: PageableMeta
  content: T[]
}

export const PER_PAGE_OPTIONS = [10, 20, 50] as const
export const MAX_PER_PAGE = 50

/** Search-criterion helper: the key is normalized to snake_case. */
export function criteria(key: string, operation: SearchOperation, value: unknown): SearchCriteria {
  return { key: toSnakeCase(key), operation, value }
}

/** Base request with a mandatory sort. */
export function pageable(
  partial: Partial<PageableRequest> & Pick<PageableRequest, 'sort'>,
): PageableRequest {
  return {
    page: partial.page ?? 1,
    perPage: Math.min(partial.perPage ?? 20, MAX_PER_PAGE),
    sort: partial.sort,
    // Always send an array (the backend's SearchSpecification expects a non-null list).
    search: partial.search ?? [],
  }
}

/** Count-only request — minimum allowed perPage (1); read meta.totalItems. */
export function countOnly(search: SearchCriteria[] = []): PageableRequest {
  return { page: 1, perPage: 1, sort: { key: 'created_at', direction: 'DESC' }, search }
}
