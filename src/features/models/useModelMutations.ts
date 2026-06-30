import { useMutation, useQueryClient } from '@tanstack/react-query'
import { modelsApi } from '@/lib/api/resources/models'
import type { VehicleModelRequest } from '@/types/api'

export function useModelMutations() {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['models'] })
    qc.invalidateQueries({ queryKey: ['model-options'] })
  }

  const create = useMutation({
    mutationFn: (body: VehicleModelRequest) => modelsApi.create(body),
    onSuccess: invalidate,
  })
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: VehicleModelRequest }) => modelsApi.update(id, body),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (id: string) => modelsApi.remove(id),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}
