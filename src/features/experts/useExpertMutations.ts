import { useMutation, useQueryClient } from '@tanstack/react-query'
import { expertsApi } from '@/lib/api/resources/experts'

export function useExpertMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['experts'] })

  const approve = useMutation({
    mutationFn: (userId: string) => expertsApi.approve(userId),
    onSuccess: invalidate,
  })

  const reject = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) => expertsApi.reject(userId, reason),
    onSuccess: invalidate,
  })

  const suspend = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) => expertsApi.suspend(userId, reason),
    onSuccess: invalidate,
  })

  return { approve, reject, suspend }
}
