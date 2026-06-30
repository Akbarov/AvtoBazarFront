import { useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  pageable,
  type PageableRequest,
  type PageableResponse,
  type SearchCriteria,
  type SortSpec,
} from '@/lib/api/pageable'

interface UseServerGridArgs<T> {
  queryKey: string
  fetcher: (req: PageableRequest) => Promise<PageableResponse<T>>
  defaultSort: SortSpec
  initialPerPage?: number
}

export function useServerGrid<T>({ queryKey, fetcher, defaultSort, initialPerPage = 20 }: UseServerGridArgs<T>) {
  const [page, setPage] = useState(1)
  const [perPage, setPerPageState] = useState(initialPerPage)
  const [sort, setSort] = useState<SortSpec>(defaultSort)
  const [search, setSearchState] = useState<SearchCriteria[]>([])

  const request = useMemo<PageableRequest>(
    () => pageable({ page, perPage, sort, search: search.length ? search : undefined }),
    [page, perPage, sort, search],
  )

  const query = useQuery({
    queryKey: [queryKey, request],
    queryFn: () => fetcher(request),
    placeholderData: keepPreviousData,
  })

  function toggleSort(key: string) {
    setSort((prev) =>
      prev.key === key ? { key, direction: prev.direction === 'ASC' ? 'DESC' : 'ASC' } : { key, direction: 'ASC' },
    )
    setPage(1)
  }

  function setPerPage(value: number) {
    setPerPageState(value)
    setPage(1)
  }

  function setSearch(criteria: SearchCriteria[]) {
    setSearchState(criteria)
    setPage(1)
  }

  return {
    rows: query.data?.content ?? [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isError: query.isError,
    isFetching: query.isFetching,
    refetch: query.refetch,
    page,
    perPage,
    sort,
    search,
    setPage,
    setPerPage,
    toggleSort,
    setSearch,
  }
}
