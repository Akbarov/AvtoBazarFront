import { useMutation, useQueryClient } from '@tanstack/react-query'
import { brandsApi } from '@/lib/api/resources/brands'
import type { VehicleBrandRequest } from '@/types/api'

export function useBrandMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['brands'] })

  const create = useMutation({
    mutationFn: (body: VehicleBrandRequest) => brandsApi.create(body),
    onSuccess: invalidate,
  })
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: VehicleBrandRequest }) => brandsApi.update(id, body),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (id: string) => brandsApi.remove(id),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}
