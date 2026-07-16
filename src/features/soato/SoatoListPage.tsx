import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Pencil, Plus, Search, Trash2, Upload } from 'lucide-react'
import { soatoApi } from '@/lib/api/resources/soato'
import { criteria, type SearchCriteria } from '@/lib/api/pageable'
import type { SoatoResponse } from '@/types/api'
import { useServerGrid } from '@/components/data-grid/useServerGrid'
import { ServerDataGrid, type ColumnSpec } from '@/components/data-grid/ServerDataGrid'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useConfirm } from '@/components/common/confirm'
import { useToast } from '@/components/common/toast'
import { parseApiError } from '@/lib/api/errors'
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue'
import { SoatoForm } from './SoatoForm'
import { useSoatoMutations } from './useSoatoMutations'

export function SoatoListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const toast = useToast()
  const { remove } = useSoatoMutations()

  const grid = useServerGrid<SoatoResponse>({
    queryKey: 'soato',
    fetcher: soatoApi.pageable,
    defaultSort: { key: 'soato_code', direction: 'ASC' },
  })

  const [searchText, setSearchText] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<SoatoResponse | null>(null)
  const debouncedSearch = useDebouncedValue(searchText)

  useEffect(() => {
    const search: SearchCriteria[] = []
    if (typeFilter) search.push(criteria('type', '=', typeFilter))
    // SOATO names live in explicit columns; search the Uzbek column (LIKE).
    if (debouncedSearch.trim()) search.push(criteria('nameUz', '=', debouncedSearch.trim()))
    grid.setSearch(search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, typeFilter])

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }
  function openEdit(s: SoatoResponse) {
    setEditing(s)
    setFormOpen(true)
  }

  async function onDelete(s: SoatoResponse) {
    const ok = await confirm({
      title: t('soato.deleteTitle'),
      message: t('soato.deleteMsg', { name: s.name }),
      danger: true,
      noRestore: true,
      confirmLabel: t('common.delete'),
    })
    if (!ok) return
    try {
      await remove.mutateAsync(s.id)
      toast.success(t('toast.deleted'))
    } catch (e) {
      toast.danger(parseApiError(e, t('toast.genericError')).message)
    }
  }

  const hasFilters = useMemo(() => !!typeFilter || !!searchText.trim(), [typeFilter, searchText])
  const typeOptions = [
    { value: 'REGION', label: t('soato.region') },
    { value: 'DISTRICT', label: t('soato.district') },
  ]

  const columns: ColumnSpec<SoatoResponse>[] = [
    {
      id: 'name',
      header: t('soato.colName'),
      cell: (s) => (
        <div>
          <div className="font-medium">{s.name}</div>
          {s.nameRu && s.nameRu !== s.name && <div className="text-[11.5px] text-muted">{s.nameRu}</div>}
        </div>
      ),
    },
    {
      id: 'type',
      header: t('soato.colType'),
      cell: (s) =>
        s.type === 'REGION' ? (
          <Badge variant="accent">{t('soato.region')}</Badge>
        ) : (
          <Badge variant="neutral">{t('soato.district')}</Badge>
        ),
    },
    {
      id: 'code',
      header: t('soato.colCode'),
      sortKey: 'soato_code',
      cell: (s) => <span className="font-mono font-medium">{s.soatoCode}</span>,
    },
    {
      id: 'national',
      header: t('soato.colNational'),
      sortKey: 'national_code',
      cell: (s) => <span className="font-mono text-fg-2">{s.nationalCode ?? '—'}</span>,
    },
    {
      id: 'parent',
      header: t('soato.colParent'),
      cell: (s) => <span className="text-fg-2">{s.parentName || '—'}</span>,
    },
    {
      id: 'actions',
      header: t('soato.colActions'),
      align: 'right',
      cell: (s) => (
        <div className="flex justify-end gap-1.5">
          <button
            onClick={() => openEdit(s)}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-border bg-surface-2 text-fg-2 hover:text-fg"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(s)}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-border bg-surface-2 text-danger hover:bg-danger-soft"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-[18px] flex items-end justify-between">
        <div>
          <div className="text-[22px] font-bold tracking-tight">{t('soato.title')}</div>
          <div className="mt-0.5 text-fg-2">{t('soato.subtitle')}</div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/soato/import')}>
            <Upload size={16} /> {t('soato.importExcel')}
          </Button>
          <Button onClick={openCreate}>
            <Plus size={16} /> {t('soato.add')}
          </Button>
        </div>
      </div>

      <div className="mb-[14px] flex flex-wrap items-center gap-2.5">
        <Select
          options={typeOptions}
          placeholder={t('soato.allTypes')}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        />
        <div className="relative max-w-[320px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={t('soato.searchPlaceholder')}
            className="pl-9"
          />
        </div>
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
        rowKey={(s) => s.id}
        minWidth={720}
        emptyTitle={hasFilters ? t('grid.noResultsTitle') : t('soato.emptyTitle')}
        emptyMessage={hasFilters ? t('grid.noResultsMsg') : t('soato.emptyMsg')}
      />

      <SoatoForm open={formOpen} entry={editing} onClose={() => setFormOpen(false)} />
    </div>
  )
}
