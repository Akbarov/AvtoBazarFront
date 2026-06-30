import { useQuery } from '@tanstack/react-query'
import { brandsApi } from '@/lib/api/resources/brands'
import { modelsApi } from '@/lib/api/resources/models'
import { soatoApi } from '@/lib/api/resources/soato'
import { criteria } from '@/lib/api/pageable'
import type { SelectOption } from '@/components/ui/select'

const PER_PAGE = 50

/** Brand options for selects/filters (first 50 by position). */
export function useBrandOptions() {
  return useQuery({
    queryKey: ['brand-options'],
    queryFn: async (): Promise<SelectOption[]> => {
      const res = await brandsApi.pageable({ page: 1, perPage: PER_PAGE, sort: { key: 'position', direction: 'ASC' } })
      return res.content.map((b) => ({ value: b.id, label: b.name }))
    },
    staleTime: 5 * 60_000,
  })
}

/** Models of a given brand, for the parent-model select. Empty when no brand chosen. */
export function useModelOptions(brandId: string | undefined, excludeId?: string) {
  return useQuery({
    queryKey: ['model-options', brandId],
    enabled: !!brandId,
    queryFn: async (): Promise<SelectOption[]> => {
      const res = await modelsApi.pageable({
        page: 1,
        perPage: PER_PAGE,
        sort: { key: 'position', direction: 'ASC' },
        search: [criteria('brandId', '=', brandId)],
      })
      return res.content.filter((m) => m.id !== excludeId).map((m) => ({ value: m.id, label: m.name }))
    },
    staleTime: 60_000,
  })
}

/** Region (REGION-type) options for the SOATO parent select. */
export function useRegionOptions() {
  return useQuery({
    queryKey: ['region-options'],
    queryFn: async (): Promise<SelectOption[]> => {
      const res = await soatoApi.pageable({
        page: 1,
        perPage: PER_PAGE,
        sort: { key: 'soato_code', direction: 'ASC' },
        search: [criteria('type', '=', 'REGION')],
      })
      return res.content.map((s) => ({ value: s.id, label: s.name }))
    },
    staleTime: 5 * 60_000,
  })
}
