import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { Check, Info, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastVariant = 'success' | 'info' | 'danger'
interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
}

interface ToastApi {
  show: (message: string, variant?: ToastVariant) => void
  success: (message: string) => void
  info: (message: string) => void
  danger: (message: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const ICONS = { success: Check, info: Info, danger: Trash2 } as const
const ACCENTS: Record<ToastVariant, string> = {
  success: 'border-l-green text-green',
  info: 'border-l-accent text-accent',
  danger: 'border-l-danger text-danger',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const show = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = ++counter.current
    setItems((prev) => [...prev, { id, message, variant }])
    window.setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3400)
  }, [])

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (m) => show(m, 'success'),
      info: (m) => show(m, 'info'),
      danger: (m) => show(m, 'danger'),
    }),
    [show],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-live="polite" aria-atomic="true" className="pointer-events-none fixed right-5 top-5 z-[90] flex flex-col gap-2">
        {items.map((t) => {
          const Icon = ICONS[t.variant]
          return (
            <div
              key={t.id}
              role={t.variant === 'danger' ? 'alert' : 'status'}
              className={cn(
                'pointer-events-auto flex items-center gap-3 rounded-[11px] border border-l-[3px] border-border bg-surface px-4 py-3 shadow animate-ab-slidein',
                ACCENTS[t.variant],
              )}
            >
              <Icon size={18} />
              <span className="text-[13px] font-medium text-fg">{t.message}</span>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
