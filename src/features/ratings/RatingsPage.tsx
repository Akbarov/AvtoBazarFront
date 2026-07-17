import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '@/lib/hooks/useDocumentTitle'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { ratingsApi } from '@/lib/api/resources/ratings'
import type { UserRatingAdminResponse } from '@/types/api'
import { useServerGrid } from '@/components/data-grid/useServerGrid'
import { ServerDataGrid, type ColumnSpec } from '@/components/data-grid/ServerDataGrid'
import { Button } from '@/components/ui/button'
import { useConfirm } from '@/components/common/confirm'
import { useToast } from '@/components/common/toast'
import { parseApiError } from '@/lib/api/errors'
import { formatEpoch } from '@/lib/utils'

export function RatingsPage() {
  const { t, i18n } = useTranslation()
  useDocumentTitle(t('ratings.title'))
  const confirm = useConfirm()
  const toast = useToast()
  const qc = useQueryClient()

  const grid = useServerGrid<UserRatingAdminResponse>({
    queryKey: 'ratings',
    fetcher: ratingsApi.pageable,
    defaultSort: { key: 'created_at', direction: 'DESC' },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ratingsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ratings'] }),
  })

  async function remove(rating: UserRatingAdminResponse) {
    const ok = await confirm({
      title: t('ratings.deleteTitle'),
      message: t('ratings.deleteMsg', { name: rating.raterName ?? rating.raterUserId }),
      danger: true,
      confirmLabel: t('ratings.delete'),
    })
    if (!ok) return
    try {
      await deleteMutation.mutateAsync(rating.id)
      toast.success(t('toast.deleted'))
    } catch (e) {
      toast.danger(parseApiError(e, t('toast.genericError')).message)
    }
  }

  const columns: ColumnSpec<UserRatingAdminResponse>[] = [
    {
      id: 'rater',
      header: t('ratings.colRater'),
      cell: (r) => (
        <div>
          <div className="font-medium">{r.raterName ?? '—'}</div>
          <div className="font-mono text-[12px] text-muted">{r.raterPhone}</div>
        </div>
      ),
    },
    {
      id: 'rated',
      header: t('ratings.colRated'),
      cell: (r) => (
        <div>
          <div className="font-medium">{r.ratedName ?? '—'}</div>
          <div className="font-mono text-[12px] text-muted">{r.ratedPhone}</div>
        </div>
      ),
    },
    {
      id: 'stars',
      header: t('ratings.colStars'),
      sortKey: 'stars',
      cell: (r) => <span className="font-medium">★ {r.stars}</span>,
    },
    {
      id: 'date',
      header: t('ratings.colDate'),
      sortKey: 'created_at',
      cell: (r) => <span className="text-fg-2">{formatEpoch(r.createdAt, i18n.language)}</span>,
    },
    {
      id: 'actions',
      header: t('ratings.colActions'),
      align: 'right',
      cell: (r) => (
        <Button variant="outline" size="sm" onClick={() => remove(r)} disabled={deleteMutation.isPending}>
          <Trash2 size={14} />
          {t('ratings.delete')}
        </Button>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-[18px]">
        <div className="text-[22px] font-bold tracking-tight">{t('ratings.title')}</div>
        <div className="mt-0.5 text-fg-2">{t('ratings.subtitle')}</div>
      </div>

      <ServerDataGrid
        columns={columns}
        rows={grid.rows}
        meta={grid.meta}
        isLoading={grid.isLoading}
        isError={grid.isError}
        onRetry={grid.refetch}
        sort={grid.sort}
        onToggleSort={grid.toggleSort}
        page={grid.page}
        perPage={grid.perPage}
        onPage={grid.setPage}
        onPerPage={grid.setPerPage}
        rowKey={(r) => r.id}
        minWidth={720}
        emptyTitle={t('ratings.emptyTitle')}
        emptyMessage={t('ratings.emptyMsg')}
      />
    </div>
  )
}
