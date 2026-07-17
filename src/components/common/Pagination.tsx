import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PER_PAGE_OPTIONS, type PageableMeta } from '@/lib/api/pageable'
import { cn } from '@/lib/utils'

interface PaginationProps {
  meta: PageableMeta
  page: number
  perPage: number
  onPage: (page: number) => void
  onPerPage: (perPage: number) => void
}

/** Windowed page numbers around current page (max 5). */
function pageWindow(current: number, total: number): number[] {
  if (total <= 1) return [1]
  const start = Math.max(1, Math.min(current - 2, total - 4))
  const end = Math.min(total, start + 4)
  const out: number[] = []
  for (let i = start; i <= end; i++) out.push(i)
  return out
}

export function Pagination({ meta, page, perPage, onPage, onPerPage }: PaginationProps) {
  const { t } = useTranslation()
  const totalPages = Math.max(1, meta.totalPages)
  const from = meta.totalItems === 0 ? 0 : (page - 1) * perPage + 1
  const to = (page - 1) * perPage + meta.perPage

  return (
    <div className="flex flex-wrap items-center justify-between gap-[10px] border-t border-border px-4 py-[11px]">
      <div className="flex items-center gap-[9px] text-[12.5px] text-fg-2">
        <span>{t('grid.rows')}</span>
        <select
          value={perPage}
          aria-label={t('grid.rows')}
          onChange={(e) => onPerPage(Number(e.target.value))}
          className="h-[30px] cursor-pointer rounded-[7px] border border-border-strong bg-surface px-1.5 text-[12.5px] text-fg outline-none"
        >
          {PER_PAGE_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <span className="ml-1.5 font-mono">
          {from}–{to} {t('grid.of')} {meta.totalItems}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria-label={t('grid.prevPage')}
          className="flex h-[30px] w-[30px] items-center justify-center rounded-[7px] border border-border-strong text-fg-2 disabled:opacity-40"
        >
          <ChevronLeft size={15} />
        </button>
        {pageWindow(page, totalPages).map((n) => (
          <button
            key={n}
            onClick={() => onPage(n)}
            aria-current={n === page ? 'page' : undefined}
            className={cn(
              'h-[30px] min-w-[30px] rounded-[7px] border px-2 font-mono text-[12.5px] font-semibold',
              n === page ? 'border-accent bg-accent text-accent-fg' : 'border-border-strong text-fg-2',
            )}
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          aria-label={t('grid.nextPage')}
          className="flex h-[30px] w-[30px] items-center justify-center rounded-[7px] border border-border-strong text-fg-2 disabled:opacity-40"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}
