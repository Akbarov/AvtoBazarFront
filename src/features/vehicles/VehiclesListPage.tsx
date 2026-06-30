import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Car, Check, Eye, Search, X } from 'lucide-react'
import { vehiclesApi } from '@/lib/api/resources/vehicles'
import { criteria, type SearchCriteria } from '@/lib/api/pageable'
import type { VehicleResponse } from '@/types/api'
import { useServerGrid } from '@/components/data-grid/useServerGrid'
import { ServerDataGrid, type ColumnSpec } from '@/components/data-grid/ServerDataGrid'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { StatusPill } from '@/components/common/StatusPill'
import { ColorSwatch } from '@/components/common/ColorSwatch'
import { useConfirm } from '@/components/common/confirm'
import { useToast } from '@/components/common/toast'
import { parseApiError } from '@/lib/api/errors'
import { formatNumber, formatPrice } from '@/lib/utils'
import { useBrandOptions } from '@/features/shared/useOptions'
import { toColorMap, toLabelMap, toOptions, useColors, useEnum } from '@/lib/enums/enumCache'

export function VehiclesListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const toast = useToast()
  const qc = useQueryClient()

  const categories = useEnum('categories')
  const currencies = useEnum('currencies')
  const colors = useColors()
  const brandOptions = useBrandOptions()
  const categoryMap = useMemo(() => toLabelMap(categories.data), [categories.data])
  const colorMap = useMemo(() => toColorMap(colors.data), [colors.data])

  const grid = useServerGrid<VehicleResponse>({
    queryKey: 'vehicles',
    fetcher: vehiclesApi.pageable,
    defaultSort: { key: 'created_at', direction: 'DESC' },
  })

  const [searchText, setSearchText] = useState('')
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [currency, setCurrency] = useState('')

  useEffect(() => {
    const id = window.setTimeout(() => {
      const search: SearchCriteria[] = []
      if (searchText.trim()) search.push(criteria('description', '=', searchText.trim()))
      if (status) search.push(criteria('active', '=', status === 'true'))
      if (category) search.push(criteria('category', '=', category))
      if (brand) search.push(criteria('brandId', '=', brand))
      if (currency) search.push(criteria('currency', '=', currency))
      grid.setSearch(search)
    }, 350)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, status, category, brand, currency])

  const toggle = useMutation({
    mutationFn: ({ id, activate }: { id: string; activate: boolean }) =>
      activate ? vehiclesApi.activate(id) : vehiclesApi.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles'] }),
  })

  async function onToggle(v: VehicleResponse) {
    if (v.active) {
      const ok = await confirm({
        title: t('vehicles.deactivateTitle'),
        message: t('vehicles.deactivateMsg'),
        confirmLabel: t('vehicles.deactivate'),
      })
      if (!ok) return
    }
    try {
      await toggle.mutateAsync({ id: v.id, activate: !v.active })
      toast.success(t('toast.updated'))
    } catch (e) {
      toast.danger(parseApiError(e, t('toast.genericError')).message)
    }
  }

  const hasFilters = !!(searchText.trim() || status || category || brand || currency)

  const columns: ColumnSpec<VehicleResponse>[] = [
    {
      id: 'photo',
      header: t('vehicles.colPhoto'),
      cell: (v) => (
        <div
          onClick={() => navigate(`/vehicles/${v.id}`)}
          className="flex h-9 w-12 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-2 text-muted"
        >
          {v.imageUrls?.[0] ? (
            <img src={v.imageUrls[0]} alt="" className="h-full w-full object-cover" />
          ) : (
            <Car size={18} strokeWidth={1.6} />
          )}
        </div>
      ),
    },
    {
      id: 'vehicle',
      header: t('vehicles.colVehicle'),
      cell: (v) => (
        <div onClick={() => navigate(`/vehicles/${v.id}`)} className="cursor-pointer">
          <div className="font-semibold">
            {v.brandName} {v.modelName}
          </div>
          <div className="text-[11.5px] text-muted">{categoryMap[v.category] ?? v.category}</div>
        </div>
      ),
    },
    { id: 'year', header: t('vehicles.colYear'), sortKey: 'year', cell: (v) => <span className="font-mono">{v.year}</span> },
    {
      id: 'price',
      header: t('vehicles.colPrice'),
      sortKey: 'price',
      cell: (v) => <span className="font-mono font-semibold">{formatPrice(v.price, v.currency)}</span>,
    },
    {
      id: 'category',
      header: t('vehicles.colCategory'),
      cell: (v) => <Badge variant="neutral">{categoryMap[v.category] ?? v.category}</Badge>,
    },
    {
      id: 'mileage',
      header: t('vehicles.colMileage'),
      sortKey: 'mileage',
      cell: (v) => (
        <span className="whitespace-nowrap font-mono">
          {formatNumber(v.mileage)} {t('vehicles.km')}
        </span>
      ),
    },
    {
      id: 'color',
      header: t('vehicles.colColor'),
      cell: (v) => (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <ColorSwatch code={colorMap[v.color]?.code ?? null} />
          <span className="text-[12px]">{colorMap[v.color]?.label ?? v.color}</span>
        </div>
      ),
    },
    {
      id: 'owner',
      header: t('vehicles.colOwner'),
      cell: (v) => (
        <div>
          <div className="text-[12.5px] font-medium">{v.owner?.fullName}</div>
          <div className="font-mono text-[11px] text-muted">{v.owner?.phoneNumber}</div>
        </div>
      ),
    },
    { id: 'status', header: t('vehicles.colStatus'), cell: (v) => <StatusPill active={v.active} /> },
    {
      id: 'views',
      header: t('vehicles.colViews'),
      sortKey: 'view_count',
      align: 'right',
      cell: (v) => <span className="font-mono text-fg-2">{formatNumber(v.viewCount)}</span>,
    },
    {
      id: 'actions',
      header: t('vehicles.colActions'),
      align: 'right',
      cell: (v) => (
        <div className="flex justify-end gap-1.5">
          <button
            onClick={() => navigate(`/vehicles/${v.id}`)}
            title={t('vehicles.open')}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-border bg-surface-2 text-fg-2 hover:text-fg"
          >
            <Eye size={15} />
          </button>
          <button
            onClick={() => onToggle(v)}
            title={v.active ? t('vehicles.deactivate') : t('vehicles.activate')}
            className={
              v.active
                ? 'flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-border bg-danger-soft text-danger'
                : 'flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-border bg-green-soft text-green'
            }
          >
            {v.active ? <X size={15} /> : <Check size={15} />}
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-[18px]">
        <div className="text-[22px] font-bold tracking-tight">{t('vehicles.title')}</div>
        <div className="mt-0.5 text-fg-2">{t('vehicles.subtitle')}</div>
      </div>

      <div className="mb-[14px] flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[220px] max-w-[320px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={t('vehicles.searchPlaceholder')}
            className="pl-9"
          />
        </div>
        <Select
          options={[
            { value: 'true', label: t('vehicles.active') },
            { value: 'false', label: t('vehicles.unpublished') },
          ]}
          placeholder={t('vehicles.allStatuses')}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />
        <Select
          options={toOptions(categories.data)}
          placeholder={t('vehicles.allCategories')}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <Select
          options={brandOptions.data ?? []}
          placeholder={t('vehicles.allBrands')}
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        />
        <Select
          options={toOptions(currencies.data)}
          placeholder={t('vehicles.allCurrencies')}
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
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
        rowKey={(v) => v.id}
        minWidth={1040}
        emptyTitle={hasFilters ? t('grid.noResultsTitle') : t('vehicles.emptyTitle')}
        emptyMessage={hasFilters ? t('grid.noResultsMsg') : t('vehicles.emptyMsg')}
      />
    </div>
  )
}
