import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { TriangleAlert, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFocusTrap } from '@/lib/a11y/useFocusTrap'

interface ConfirmOptions {
  title: string
  message?: string
  danger?: boolean
  confirmLabel?: string
  /** Show the "no restore" line (for soft-delete). */
  noRestore?: boolean
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const resolver = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(opts)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const close = useCallback((result: boolean) => {
    resolver.current?.(result)
    resolver.current = null
    setOptions(null)
  }, [])

  const value = useMemo(() => confirm, [confirm])
  const cardRef = useFocusTrap<HTMLDivElement>(!!options, () => close(false))

  const Icon = options?.danger ? Trash2 : TriangleAlert

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {options && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-ab-fadein" onClick={() => close(false)} />
          <div
            ref={cardRef}
            role="alertdialog"
            aria-modal="true"
            aria-label={options.title}
            className="relative z-[81] w-[380px] max-w-full rounded-[16px] border border-border bg-surface p-5 shadow animate-ab-pop"
          >
            <div className="mb-3 flex items-center gap-3">
              <div
                className={
                  options.danger
                    ? 'flex h-9 w-9 items-center justify-center rounded-[10px] bg-danger-soft text-danger'
                    : 'flex h-9 w-9 items-center justify-center rounded-[10px] bg-warn-soft text-warn'
                }
              >
                <Icon size={18} />
              </div>
              <div className="text-[15px] font-semibold">{options.title}</div>
            </div>
            {options.message && <div className="mb-2 text-[13px] leading-relaxed text-fg-2">{options.message}</div>}
            {options.noRestore && <div className="mb-3 text-[12px] text-muted">{t('confirm.noRestore')}</div>}
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => close(false)}>
                {t('confirm.cancel')}
              </Button>
              <Button variant={options.danger ? 'danger' : 'primary'} size="sm" onClick={() => close(true)}>
                {options.confirmLabel ?? t('confirm.confirm')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider')
  return ctx
}
