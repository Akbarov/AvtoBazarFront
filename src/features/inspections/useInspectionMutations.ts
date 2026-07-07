import { useMutation, useQueryClient } from '@tanstack/react-query'
import { inspectionsApi } from '@/lib/api/resources/inspections'
import type { InspectionAssignRequest } from '@/types/api'

export function useInspectionMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['inspections'] })

  const assign = useMutation({
    mutationFn: ({ id, body }: { id: string; body: InspectionAssignRequest }) => inspectionsApi.assign(id, body),
    onSuccess: invalidate,
  })

  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => inspectionsApi.reject(id, reason),
    onSuccess: invalidate,
  })

  return { assign, reject }
}
