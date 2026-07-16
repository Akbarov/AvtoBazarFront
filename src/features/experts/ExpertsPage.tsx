import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Ban, Check, Eye, X } from 'lucide-react'
import { expertsApi } from '@/lib/api/resources/experts'
import { criteria } from '@/lib/api/pageable'
import type { ExpertProfileResponse } from '@/types/api'
import { useServerGrid } from '@/components/data-grid/useServerGrid'
import { ServerDataGrid, type ColumnSpec } from '@/components/data-grid/ServerDataGrid'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { useConfirm } from '@/components/common/confirm'
import { useToast } from '@/components/common/toast'
import { ReasonDialog } from '@/components/common/ReasonDialog'
import { parseApiError } from '@/lib/api/errors'
import { formatEpoch, initials } from '@/lib/utils'
import { ExpertDetailModal } from './ExpertDetailModal'
import { ExpertStatusBadge } from './ExpertStatusBadge'
import { useExpertMutations } from './useExpertMutations'

const STATUSES = ['PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED'] as const

type ReasonAction = { kind: 'reject' | 'suspend'; expert: ExpertProfileResponse } | null

export function ExpertsPage() {
  const { t, i18n } = useTranslation()
  const confirm = useConfirm()
  const toast = useToast()
  const { approve, reject, suspend } = useExpertMutations()

  const grid = useServerGrid<ExpertProfileResponse>({
    queryKey: 'experts',
    fetcher: expertsApi.pageable,
    defaultSort: { key: 'created_at', direction: 'DESC' },
  })

  const [status, setStatus] = useState('')
  const [detail, setDetail] = useState<ExpertProfileResponse | null>(null)
  const [reasonAction, setReasonAction] = useState<ReasonAction>(null)

  useEffect(() => {
    grid.setSearch(status ? [criteria('status', '=', status)] : [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  async function onApprove(expert: ExpertProfileResponse) {
    const ok = await confirm({
      title: t('experts.approveTitle'),
      message: t('experts.approveMsg', { name: expert.fullName ?? expert.userId }),
      confirmLabel: t('experts.approve'),
    })
    if (!ok) return
    try {
      await approve.mutateAsync(expert.userId)
      toast.success(t('toast.updated'))
    } catch (e) {
      toast.danger(parseApiError(e, t('toast.genericError')).message)
    }
  }

  async function onReasonSubmit(reason: string | undefined) {
    if (!reasonAction) return
    const { kind, expert } = reasonAction
    try {
      if (kind === 'reject') await reject.mutateAsync({ userId: expert.userId, reason })
      else await suspend.mutateAsync({ userId: expert.userId, reason })
      toast.success(t('toast.updated'))
      setReasonAction(null)
    } catch (e) {
      toast.danger(parseApiError(e, t('toast.genericError')).message)
    }
  }

  const iconBtn =
    'flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-border bg-surface-2'

  const columns: ColumnSpec<ExpertProfileResponse>[] = [
    {
      id: 'expert',
      header: t('experts.colExpert'),
      cell: (e) => (
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-[11px] font-bold text-accent">
            {initials(e.fullName)}
          </span>
          <div>
            <div className="font-medium">{e.fullName ?? '—'}</div>
            <div className="font-mono text-[11px] text-muted">{e.phoneNumber ?? '—'}</div>
          </div>
        </div>
      ),
    },
    {
      id: 'specs',
      header: t('experts.colSpecs'),
      cell: (e) => (
        <div className="flex max-w-[260px] flex-wrap gap-1">
          {e.specializations.slice(0, 2).map((s) => (
            <Badge key={s} variant="accent">
              {t(`experts.spec.${s}`)}
            </Badge>
          ))}
          {e.specializations.length > 2 && <Badge variant="neutral">+{e.specializations.length - 2}</Badge>}
        </div>
      ),
    },
    {
      id: 'experience',
      header: t('experts.colExperience'),
      sortKey: 'experience_years',
      cell: (e) => (e.experienceYears != null ? `${e.experienceYears} ${t('experts.yearsShort')}` : '—'),
    },
    {
      id: 'stats',
      header: t('experts.colStats'),
      cell: (e) => (
        <span className="text-fg-2">
          {e.completedInspections ?? 0} · {e.reviewsCount ? `★ ${e.avgRating}` : t('experts.noRating')}
        </span>
      ),
    },
    {
      id: 'status',
      header: t('experts.colStatus'),
      sortKey: 'status',
      cell: (e) => <ExpertStatusBadge status={e.status} />,
    },
    {
      id: 'created',
      header: t('experts.colCreated'),
      sortKey: 'created_at',
      cell: (e) => <span className="text-fg-2">{formatEpoch(e.createdAt, i18n.language)}</span>,
    },
    {
      id: 'actions',
      header: t('experts.colActions'),
      align: 'right',
      cell: (e) => (
        <div className="flex justify-end gap-1.5">
          <button onClick={() => setDetail(e)} className={`${iconBtn} text-fg-2 hover:text-fg`} title={t('experts.view')}>
            <Eye size={15} />
          </button>
          {(e.status === 'PENDING' || e.status === 'SUSPENDED') && (
            <button
              onClick={() => onApprove(e)}
              className={`${iconBtn} text-green hover:bg-green-soft`}
              title={t('experts.approve')}
            >
              <Check size={15} />
            </button>
          )}
          {e.status === 'PENDING' && (
            <button
              onClick={() => setReasonAction({ kind: 'reject', expert: e })}
              className={`${iconBtn} text-danger hover:bg-danger-soft`}
              title={t('experts.reject')}
            >
              <X size={15} />
            </button>
          )}
          {e.status === 'APPROVED' && (
            <button
              onClick={() => setReasonAction({ kind: 'suspend', expert: e })}
              className={`${iconBtn} text-danger hover:bg-danger-soft`}
              title={t('experts.suspend')}
            >
              <Ban size={15} />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-[18px]">
        <div className="text-[22px] font-bold tracking-tight">{t('experts.title')}</div>
        <div className="mt-0.5 text-fg-2">{t('experts.subtitle')}</div>
      </div>

      <div className="mb-[14px] flex items-center gap-2.5">
        <Select
          options={STATUSES.map((s) => ({ value: s, label: t(`experts.status.${s}`) }))}
          placeholder={t('experts.allStatuses')}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />
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
        rowKey={(e) => e.id}
        minWidth={900}
        emptyTitle={grid.search.length ? t('grid.noResultsTitle') : t('experts.emptyTitle')}
        emptyMessage={grid.search.length ? t('grid.noResultsMsg') : t('experts.emptyMsg')}
      />

      <ExpertDetailModal expert={detail} onClose={() => setDetail(null)} />

      <ReasonDialog
        open={!!reasonAction}
        title={reasonAction?.kind === 'suspend' ? t('experts.suspendTitle') : t('experts.rejectTitle')}
        message={
          reasonAction
            ? t(reasonAction.kind === 'suspend' ? 'experts.suspendMsg' : 'experts.rejectMsg', {
                name: reasonAction.expert.fullName ?? reasonAction.expert.userId,
              })
            : undefined
        }
        confirmLabel={reasonAction?.kind === 'suspend' ? t('experts.suspend') : t('experts.reject')}
        danger
        placeholder={t('experts.reasonPlaceholder')}
        pending={reject.isPending || suspend.isPending}
        onClose={() => setReasonAction(null)}
        onSubmit={onReasonSubmit}
      />
    </div>
  )
}
