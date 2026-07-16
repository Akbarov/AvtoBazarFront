import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowDown, ArrowUp } from 'lucide-react'
import type { PageableMeta, SortSpec } from '@/lib/api/pageable'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/common/EmptyState'
import { Pagination } from '@/components/common/Pagination'
import { Button } from '@/components/ui/button'

export interface ColumnSpec<T> {
  id: string
  header: string
  sortKey?: string
  align?: 'left' | 'right'
  cell: (row: T) => ReactNode
}

interface Props<T> {
  columns: ColumnSpec<T>[]
  rows: T[]
  meta?: PageableMeta
  isLoading: boolean
  isError?: boolean
  onRetry?: () => void
  sort: SortSpec
  onToggleSort: (key: string) => void
  page: number
  perPage: number
  onPage: (page: number) => void
  onPerPage: (perPage: number) => void
  rowKey: (row: T) => string
  minWidth?: number
  emptyTitle: string
  emptyMessage?: string
}

const TH =
  'px-[14px] py-[11px] text-left text-[10.5px] font-semibold uppercase tracking-[0.04em] text-muted border-b border-border whitespace-nowrap'

export function ServerDataGrid<T>({
  columns,
  rows,
  meta,
  isLoading,
  isError = false,
  onRetry,
  sort,
  onToggleSort,
  page,
  perPage,
  onPage,
  onPerPage,
  rowKey,
  minWidth = 720,
  emptyTitle,
  emptyMessage,
}: Props<T>) {
  const { t } = useTranslation()
  const showError = !isLoading && isError && rows.length === 0
  const showEmpty = !isLoading && !showError && rows.length === 0

  return (
    <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[12.5px]" style={{ minWidth }}>
          <thead>
            <tr className="bg-surface-2">
              {columns.map((col) => {
                const active = col.sortKey && sort.key === col.sortKey
                return (
                  <th
                    key={col.id}
                    className={cn(TH, col.align === 'right' && 'text-right', col.sortKey && 'cursor-pointer select-none')}
                    onClick={col.sortKey ? () => onToggleSort(col.sortKey!) : undefined}
                  >
                    <span className={cn('inline-flex items-center gap-1', col.align === 'right' && 'flex-row-reverse')}>
                      {col.header}
                      {active &&
                        (sort.direction === 'ASC' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: Math.min(perPage, 8) }).map((_, i) => (
                  <tr key={`sk-${i}`} className="border-b border-border">
                    {columns.map((col) => (
                      <td key={col.id} className="px-[14px] py-[13px]">
                        <div className="h-3.5 w-3/4 animate-pulse rounded bg-surface-2" />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((row) => (
                  <tr key={rowKey(row)} className="border-b border-border hover:bg-surface-2">
                    {columns.map((col) => (
                      <td key={col.id} className={cn('px-[14px] py-[9px]', col.align === 'right' && 'text-right')}>
                        {col.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {showError && (
        <div className="px-5 py-[54px] text-center">
          <div className="mb-1 text-[14px] font-semibold text-danger">{t('grid.errorTitle')}</div>
          <div className="text-[12.5px] text-muted">{t('grid.errorMsg')}</div>
          {onRetry && (
            <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
              {t('grid.retry')}
            </Button>
          )}
        </div>
      )}

      {showEmpty && <EmptyState title={emptyTitle} message={emptyMessage} />}

      {meta && (
        <Pagination meta={meta} page={page} perPage={perPage} onPage={onPage} onPerPage={onPerPage} />
      )}
    </div>
  )
}
