import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { brandsApi } from '@/lib/api/resources/brands'
import { criteria } from '@/lib/api/pageable'
import type { VehicleBrandResponse } from '@/types/api'
import { useServerGrid } from '@/components/data-grid/useServerGrid'
import { ServerDataGrid, type ColumnSpec } from '@/components/data-grid/ServerDataGrid'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useConfirm } from '@/components/common/confirm'
import { useToast } from '@/components/common/toast'
import { parseApiError } from '@/lib/api/errors'
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue'
import { initials } from '@/lib/utils'
import { BrandForm } from './BrandForm'
import { useBrandMutations } from './useBrandMutations'

export function BrandsPage() {
  const { t, i18n } = useTranslation()
  const confirm = useConfirm()
  const toast = useToast()
  const { remove } = useBrandMutations()

  const grid = useServerGrid<VehicleBrandResponse>({
    queryKey: 'brands',
    fetcher: brandsApi.pageable,
    defaultSort: { key: 'created_at', direction: 'DESC' },
  })

  const [searchText, setSearchText] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<VehicleBrandResponse | null>(null)
  const debouncedSearch = useDebouncedValue(searchText)

  useEffect(() => {
    // Brand name is localized jsonb — search the current UI language column (name.uz|ru|en).
    const text = debouncedSearch.trim()
    grid.setSearch(text ? [criteria(`name.${i18n.language}`, '=', text)] : [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }
  function openEdit(brand: VehicleBrandResponse) {
    setEditing(brand)
    setFormOpen(true)
  }

  async function onDelete(brand: VehicleBrandResponse) {
    const ok = await confirm({
      title: t('brands.deleteTitle'),
      message: t('brands.deleteMsg', { name: brand.name }),
      danger: true,
      noRestore: true,
      confirmLabel: t('common.delete'),
    })
    if (!ok) return
    try {
      await remove.mutateAsync(brand.id)
      toast.success(t('toast.deleted'))
    } catch (e) {
      toast.danger(parseApiError(e, t('toast.genericError')).message)
    }
  }

  const columns: ColumnSpec<VehicleBrandResponse>[] = [
    {
      id: 'logo',
      header: t('brands.colLogo'),
      cell: (b) => (
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-2 text-[12px] font-bold text-muted">
          {b.logoUrl ? <img src={b.logoUrl} alt="" className="h-full w-full object-cover" /> : initials(b.name)}
        </div>
      ),
    },
    { id: 'name', header: t('brands.colName'), cell: (b) => <span className="font-medium">{b.name}</span> },
    {
      id: 'popular',
      header: t('brands.colPopular'),
      cell: (b) =>
        b.popular ? <Badge variant="accent">{t('brands.popular')}</Badge> : <span className="text-muted">—</span>,
    },
    {
      id: 'actions',
      header: t('brands.colActions'),
      align: 'right',
      cell: (b) => (
        <div className="flex justify-end gap-1.5">
          <button
            onClick={() => openEdit(b)}
            title={t('common.edit')}
            aria-label={t('common.edit')}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-border bg-surface-2 text-fg-2 hover:text-fg"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(b)}
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
          <div className="text-[22px] font-bold tracking-tight">{t('brands.title')}</div>
          <div className="mt-0.5 text-fg-2">{t('brands.subtitle')}</div>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> {t('brands.add')}
        </Button>
      </div>

      <div className="mb-[14px] flex items-center gap-2.5">
        <div className="relative max-w-[340px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={t('brands.searchPlaceholder')}
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
        rowKey={(b) => b.id}
        minWidth={600}
        emptyTitle={grid.search.length ? t('grid.noResultsTitle') : t('brands.emptyTitle')}
        emptyMessage={grid.search.length ? t('grid.noResultsMsg') : t('brands.emptyMsg')}
      />

      <BrandForm open={formOpen} brand={editing} onClose={() => setFormOpen(false)} />
    </div>
  )
}
