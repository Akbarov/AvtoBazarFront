import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Film, Grid2x2, Image as ImageIcon, List, Search, Trash2 } from 'lucide-react'
import { mediaApi } from '@/lib/api/resources/media'
import { criteria, type SearchCriteria } from '@/lib/api/pageable'
import type { VehicleFilesResponse } from '@/types/api'
import { useServerGrid } from '@/components/data-grid/useServerGrid'
import { ServerDataGrid, type ColumnSpec } from '@/components/data-grid/ServerDataGrid'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/common/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useConfirm } from '@/components/common/confirm'
import { useToast } from '@/components/common/toast'
import { parseApiError } from '@/lib/api/errors'
import { formatEpoch, formatFileSize } from '@/lib/utils'
import { cn } from '@/lib/utils'

function TypeBadge({ type }: { type: 'IMAGE' | 'VIDEO' }) {
  const { t } = useTranslation()
  return (
    <Badge variant={type === 'IMAGE' ? 'accent' : 'warn'}>{type === 'IMAGE' ? t('media.image') : t('media.video')}</Badge>
  )
}

export function MediaLibraryPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const toast = useToast()
  const qc = useQueryClient()

  const grid = useServerGrid<VehicleFilesResponse>({
    queryKey: 'media',
    fetcher: mediaApi.pageable,
    defaultSort: { key: 'created_at', direction: 'DESC' },
  })

  const [view, setView] = useState<'table' | 'grid'>('table')
  const [searchText, setSearchText] = useState('')
  const [type, setType] = useState('')
  const [primary, setPrimary] = useState('')

  useEffect(() => {
    const id = window.setTimeout(() => {
      const search: SearchCriteria[] = []
      if (searchText.trim()) search.push(criteria('originalFileName', '=', searchText.trim()))
      if (type) search.push(criteria('fileType', '=', type))
      if (primary) search.push(criteria('primary', '=', primary === 'true'))
      grid.setSearch(search)
    }, 350)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, type, primary])

  const del = useMutation({
    mutationFn: (fileId: string) => mediaApi.remove(fileId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['media'] }),
  })

  async function onDelete(f: VehicleFilesResponse) {
    const ok = await confirm({
      title: t('media.deleteTitle'),
      message: t('media.deleteMsg', { name: f.originalFileName }),
      danger: true,
      noRestore: true,
      confirmLabel: t('common.delete'),
    })
    if (!ok) return
    try {
      await del.mutateAsync(f.id)
      toast.success(t('toast.deleted'))
    } catch (e) {
      toast.danger(parseApiError(e, t('toast.genericError')).message)
    }
  }

  const hasFilters = !!(searchText.trim() || type || primary)

  const columns: ColumnSpec<VehicleFilesResponse>[] = [
    {
      id: 'preview',
      header: t('media.colPreview'),
      cell: (f) => (
        <div className="flex h-9 w-12 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-2 text-muted">
          {f.fileType === 'IMAGE' && f.fileUrl ? (
            <img src={f.fileUrl} alt="" className="h-full w-full object-cover" />
          ) : f.fileType === 'VIDEO' ? (
            <Film size={16} />
          ) : (
            <ImageIcon size={16} />
          )}
        </div>
      ),
    },
    { id: 'name', header: t('media.colName'), cell: (f) => <span className="font-mono text-[12px]">{f.originalFileName}</span> },
    { id: 'type', header: t('media.colType'), cell: (f) => <TypeBadge type={f.fileType} /> },
    {
      id: 'size',
      header: t('media.colSize'),
      sortKey: 'file_size',
      align: 'right',
      cell: (f) => <span className="font-mono text-fg-2">{formatFileSize(f.fileSize)}</span>,
    },
    {
      id: 'listing',
      header: t('media.colListing'),
      cell: (f) => (
        <button onClick={() => navigate(`/vehicles/${f.vehicleId}`)} className="font-mono text-[12px] text-accent">
          {f.vehicleId.slice(0, 10)}…
        </button>
      ),
    },
    {
      id: 'primary',
      header: t('media.colPrimary'),
      cell: (f) => (f.primary ? <Badge variant="accent">{t('media.primary')}</Badge> : <span className="text-muted">—</span>),
    },
    {
      id: 'created',
      header: t('media.colCreated'),
      sortKey: 'created_at',
      cell: (f) => <span className="text-fg-2">{formatEpoch(f.createdAt, i18n.language)}</span>,
    },
    {
      id: 'actions',
      header: t('media.colActions'),
      align: 'right',
      cell: (f) => (
        <button
          onClick={() => onDelete(f)}
          className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-border bg-surface-2 text-danger hover:bg-danger-soft"
        >
          <Trash2 size={15} />
        </button>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-[18px] flex items-end justify-between">
        <div>
          <div className="text-[22px] font-bold tracking-tight">{t('media.title')}</div>
          <div className="mt-0.5 text-fg-2">{t('media.subtitle')}</div>
        </div>
        <div className="flex gap-[3px] rounded-[9px] border border-border bg-surface-2 p-[3px]">
          {(['table', 'grid'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md',
                view === v ? 'bg-accent text-accent-fg' : 'text-fg-2',
              )}
            >
              {v === 'table' ? <List size={16} /> : <Grid2x2 size={16} />}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-[14px] flex flex-wrap items-center gap-2.5">
        <div className="relative max-w-[320px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={t('media.searchPlaceholder')}
            className="pl-9"
          />
        </div>
        <Select
          options={[
            { value: 'IMAGE', label: t('media.image') },
            { value: 'VIDEO', label: t('media.video') },
          ]}
          placeholder={t('media.allTypes')}
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
        <Select
          options={[
            { value: 'true', label: t('media.primary') },
            { value: 'false', label: t('media.notPrimary') },
          ]}
          placeholder={t('media.allPrimary')}
          value={primary}
          onChange={(e) => setPrimary(e.target.value)}
        />
      </div>

      {view === 'table' ? (
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
          rowKey={(f) => f.id}
          minWidth={820}
          emptyTitle={hasFilters ? t('grid.noResultsTitle') : t('media.emptyTitle')}
          emptyMessage={hasFilters ? t('grid.noResultsMsg') : t('media.emptyMsg')}
        />
      ) : (
        <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
          {grid.rows.length === 0 && !grid.isLoading ? (
            <EmptyState
              title={hasFilters ? t('grid.noResultsTitle') : t('media.emptyTitle')}
              message={hasFilters ? t('grid.noResultsMsg') : t('media.emptyMsg')}
            />
          ) : (
            <div className="grid gap-3 p-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))' }}>
              {grid.rows.map((f) => (
                <div key={f.id} className="overflow-hidden rounded-[13px] border border-border">
                  <div className="relative flex aspect-[4/3] items-center justify-center bg-surface-2 text-muted">
                    {f.fileType === 'IMAGE' && f.fileUrl ? (
                      <img src={f.fileUrl} alt="" className="h-full w-full object-cover" />
                    ) : f.fileType === 'VIDEO' ? (
                      <Film size={26} />
                    ) : (
                      <ImageIcon size={26} />
                    )}
                    <div className="absolute left-2 top-2 flex gap-1">
                      <TypeBadge type={f.fileType} />
                      {f.primary && <Badge variant="accent">{t('media.primary')}</Badge>}
                    </div>
                  </div>
                  <div className="p-2.5">
                    <div className="truncate font-mono text-[11.5px]">{f.originalFileName}</div>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="font-mono text-[11px] text-muted">{formatFileSize(f.fileSize)}</span>
                      <button onClick={() => onDelete(f)} className="text-danger hover:opacity-80">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {grid.meta && (
            <Pagination
              meta={grid.meta}
              page={grid.page}
              perPage={grid.perPage}
              onPage={grid.setPage}
              onPerPage={grid.setPerPage}
            />
          )}
        </div>
      )}
    </div>
  )
}
