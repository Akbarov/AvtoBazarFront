import { useQuery } from '@tanstack/react-query'
import { enumsApi } from '@/lib/api/resources/enums'
import type { ColorEnumItemResponse, EnumItemResponse } from '@/types/api'
import type { SelectOption } from '@/components/ui/select'

// Enum dropdowns cached for the whole session. `body-paint-conditions` is intentionally
// omitted (no matching field on VehicleResponse). `currencies` is not localized by the backend.
const STALE = Infinity

export function useEnum(name: string) {
  return useQuery({
    queryKey: ['enum', name],
    queryFn: () => enumsApi.get(name),
    staleTime: STALE,
  })
}

export function useColors() {
  return useQuery({
    queryKey: ['enum', 'colors'],
    queryFn: () => enumsApi.colors(),
    staleTime: STALE,
  })
}

export function toOptions(items: EnumItemResponse[] | undefined): SelectOption[] {
  return (items ?? []).map((i) => ({ value: i.value, label: i.label }))
}

export function toLabelMap(items: EnumItemResponse[] | undefined): Record<string, string> {
  const map: Record<string, string> = {}
  for (const i of items ?? []) map[i.value] = i.label
  return map
}

export function toColorMap(items: ColorEnumItemResponse[] | undefined): Record<string, ColorEnumItemResponse> {
  const map: Record<string, ColorEnumItemResponse> = {}
  for (const i of items ?? []) map[i.value] = i
  return map
}
