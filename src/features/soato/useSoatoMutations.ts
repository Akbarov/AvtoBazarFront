import { useMutation, useQueryClient } from '@tanstack/react-query'
import { soatoApi } from '@/lib/api/resources/soato'
import type { SoatoRequest } from '@/types/api'

export function useSoatoMutations() {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['soato'] })
    qc.invalidateQueries({ queryKey: ['region-options'] })
  }

  const create = useMutation({
    mutationFn: (body: SoatoRequest) => soatoApi.create(body),
    onSuccess: invalidate,
  })
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: SoatoRequest }) => soatoApi.update(id, body),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (id: string) => soatoApi.remove(id),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}
