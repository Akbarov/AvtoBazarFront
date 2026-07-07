import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye } from 'lucide-react'
import { inspectionsApi } from '@/lib/api/resources/inspections'
import { criteria, type SearchCriteria } from '@/lib/api/pageable'
import type { InspectionRequestResponse } from '@/types/api'
import { useServerGrid } from '@/components/data-grid/useServerGrid'
import { ServerDataGrid, type ColumnSpec } from '@/components/data-grid/ServerDataGrid'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { formatEpoch, formatPrice } from '@/lib/utils'
import { InspectionDetailModal } from './InspectionDetailModal'
import { InspectionStatusBadge } from './InspectionStatusBadge'

const STATUSES = ['REQUESTED', 'ASSIGNED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED'] as const
const SPECS = ['BODY', 'ENGINE', 'TRANSMISSION', 'ELECTRICAL', 'SUSPENSION', 'DIAGNOSTICS', 'GENERAL'] as const

export function InspectionsPage() {
  const { t, i18n } = useTranslation()

  const grid = useServerGrid<InspectionRequestResponse>({
    queryKey: 'inspections',
    fetcher: inspectionsApi.pageable,
    defaultSort: { key: 'created_at', direction: 'DESC' },
  })

  const [status, setStatus] = useState('')
  const [spec, setSpec] = useState('')
  const [detail, setDetail] = useState<InspectionRequestResponse | null>(null)

  useEffect(() => {
    const search: SearchCriteria[] = []
    if (status) search.push(criteria('status', '=', status))
    if (spec) search.push(criteria('specialization', '=', spec))
    grid.setSearch(search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, spec])

  const iconBtn =
    'flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-border bg-surface-2'

  const columns: ColumnSpec<InspectionRequestResponse>[] = [
    {
      id: 'vehicle',
      header: t('inspections.colVehicle'),
      cell: (r) => (
        <Link to={`/vehicles/${r.vehicleId}`} className="font-mono text-[11.5px] text-accent hover:underline">
          {r.vehicleId}
        </Link>
      ),
    },
    {
      id: 'requester',
      header: t('inspections.colRequester'),
      cell: (r) => (
        <div>
          <div className="font-medium">{r.requesterName ?? '—'}</div>
          <Badge variant={r.requesterRole === 'SELLER' ? 'accent' : 'neutral'}>
            {t(`inspections.role.${r.requesterRole}`)}
          </Badge>
        </div>
      ),
    },
    {
      id: 'expert',
      header: t('inspections.colExpert'),
      cell: (r) => (r.expertName ? <span className="font-medium">{r.expertName}</span> : <span className="text-muted">{t('inspections.notAssigned')}</span>),
    },
    {
      id: 'spec',
      header: t('inspections.colSpec'),
      sortKey: 'specialization',
      cell: (r) => <Badge variant="accent">{t(`experts.spec.${r.specialization}`)}</Badge>,
    },
    {
      id: 'status',
      header: t('inspections.colStatus'),
      sortKey: 'status',
      cell: (r) => <InspectionStatusBadge status={r.status} />,
    },
    {
      id: 'scheduled',
      header: t('inspections.colScheduled'),
      sortKey: 'scheduled_at',
      cell: (r) => (
        <span className="text-fg-2">{r.scheduledAt ? formatEpoch(r.scheduledAt, i18n.language) : '—'}</span>
      ),
    },
    {
      id: 'price',
      header: t('inspections.colPrice'),
      sortKey: 'price',
      cell: (r) => (r.price != null ? formatPrice(r.price, r.currency) : '—'),
    },
    {
      id: 'created',
      header: t('inspections.colCreated'),
      sortKey: 'created_at',
      cell: (r) => <span className="text-fg-2">{formatEpoch(r.createdAt, i18n.language)}</span>,
    },
    {
      id: 'actions',
      header: t('inspections.colActions'),
      align: 'right',
      cell: (r) => (
        <div className="flex justify-end gap-1.5">
          <button
            onClick={() => setDetail(r)}
            className={`${iconBtn} text-fg-2 hover:text-fg`}
            title={t('inspections.view')}
          >
            <Eye size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-[18px]">
        <div className="text-[22px] font-bold tracking-tight">{t('inspections.title')}</div>
        <div className="mt-0.5 text-fg-2">{t('inspections.subtitle')}</div>
      </div>

      <div className="mb-[14px] flex flex-wrap items-center gap-2.5">
        <Select
          options={STATUSES.map((s) => ({ value: s, label: t(`inspections.status.${s}`) }))}
          placeholder={t('inspections.allStatuses')}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />
        <Select
          options={SPECS.map((s) => ({ value: s, label: t(`experts.spec.${s}`) }))}
          placeholder={t('inspections.allSpecs')}
          value={spec}
          onChange={(e) => setSpec(e.target.value)}
        />
      </div>

      <ServerDataGrid
        columns={columns}
        rows={grid.rows}
        meta={grid.meta}
        isLoading={grid.isLoading}
        sort={grid.sort}
        onToggleSort={grid.toggleSort}
        page={grid.page}
        perPage={grid.perPage}
        onPage={grid.setPage}
        onPerPage={grid.setPerPage}
        rowKey={(r) => r.id}
        minWidth={1080}
        emptyTitle={grid.search.length ? t('grid.noResultsTitle') : t('inspections.emptyTitle')}
        emptyMessage={grid.search.length ? t('grid.noResultsMsg') : t('inspections.emptyMsg')}
      />

      <InspectionDetailModal inspection={detail} onClose={() => setDetail(null)} />
    </div>
  )
}
