import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { modelsApi } from '@/lib/api/resources/models'
import { criteria, type SearchCriteria } from '@/lib/api/pageable'
import type { VehicleModelResponse } from '@/types/api'
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
import { useBrandOptions } from '@/features/shared/useOptions'
import { ModelForm } from './ModelForm'
import { useModelMutations } from './useModelMutations'

export function ModelsPage() {
  const { t, i18n } = useTranslation()
  const confirm = useConfirm()
  const toast = useToast()
  const { remove } = useModelMutations()
  const brandOptions = useBrandOptions()

  const grid = useServerGrid<VehicleModelResponse>({
    queryKey: 'models',
    fetcher: modelsApi.pageable,
    defaultSort: { key: 'position', direction: 'ASC' },
  })

  const [searchText, setSearchText] = useState('')
  const [brandFilter, setBrandFilter] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<VehicleModelResponse | null>(null)
  const debouncedSearch = useDebouncedValue(searchText)

  useEffect(() => {
    const search: SearchCriteria[] = []
    if (brandFilter) search.push(criteria('brandId', '=', brandFilter))
    // Model name is localized jsonb — search the current UI language column.
    if (debouncedSearch.trim()) search.push(criteria(`name.${i18n.language}`, '=', debouncedSearch.trim()))
    grid.setSearch(search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, brandFilter])

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }
  function openEdit(m: VehicleModelResponse) {
    setEditing(m)
    setFormOpen(true)
  }

  async function onDelete(m: VehicleModelResponse) {
    const ok = await confirm({
      title: t('models.deleteTitle'),
      message: t('models.deleteMsg', { name: m.name }),
      danger: true,
      noRestore: true,
      confirmLabel: t('common.delete'),
    })
    if (!ok) return
    try {
      await remove.mutateAsync(m.id)
      toast.success(t('toast.deleted'))
    } catch (e) {
      toast.danger(parseApiError(e, t('toast.genericError')).message)
    }
  }

  const hasFilters = useMemo(() => !!brandFilter || !!searchText.trim(), [brandFilter, searchText])

  const columns: ColumnSpec<VehicleModelResponse>[] = [
    { id: 'name', header: t('models.colName'), cell: (m) => <span className="font-medium">{m.name}</span> },
    { id: 'brand', header: t('models.colBrand'), cell: (m) => <span className="text-fg-2">{m.brandName}</span> },
    {
      id: 'parent',
      header: t('models.colParent'),
      cell: (m) => <span className="text-fg-2">{m.parentName || '—'}</span>,
    },
    {
      id: 'popular',
      header: t('models.colPopular'),
      cell: (m) =>
        m.popular ? <Badge variant="accent">{t('models.popular')}</Badge> : <span className="text-muted">—</span>,
    },
    {
      id: 'position',
      header: t('models.colPosition'),
      sortKey: 'position',
      cell: (m) => <span className="font-mono text-fg-2">{m.position || '—'}</span>,
    },
    {
      id: 'actions',
      header: t('models.colActions'),
      align: 'right',
      cell: (m) => (
        <div className="flex justify-end gap-1.5">
          <button
            onClick={() => openEdit(m)}
            title={t('common.edit')}
            aria-label={t('common.edit')}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-border bg-surface-2 text-fg-2 hover:text-fg"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(m)}
            title={t('common.delete')}
            aria-label={t('common.delete')}
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
          <div className="text-[22px] font-bold tracking-tight">{t('models.title')}</div>
          <div className="mt-0.5 text-fg-2">{t('models.subtitle')}</div>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> {t('models.add')}
        </Button>
      </div>

      <div className="mb-[14px] flex flex-wrap items-center gap-2.5">
        <Select
          options={brandOptions.data ?? []}
          placeholder={t('models.allBrands')}
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
        />
        <div className="relative max-w-[320px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={t('models.searchPlaceholder')}
            className="pl-9"
          />
        </div>
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
        rowKey={(m) => m.id}
        minWidth={660}
        emptyTitle={hasFilters ? t('grid.noResultsTitle') : t('models.emptyTitle')}
        emptyMessage={hasFilters ? t('grid.noResultsMsg') : t('models.emptyMsg')}
      />

      <ModelForm open={formOpen} model={editing} onClose={() => setFormOpen(false)} />
    </div>
  )
}
