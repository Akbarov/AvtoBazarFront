import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { useFocusTrap } from '@/lib/a11y/useFocusTrap'

interface DrawerProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export function Drawer({ open, title, onClose, children, footer }: DrawerProps) {
  const panelRef = useFocusTrap<HTMLDivElement>(open, onClose)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/40 animate-ab-fadein" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute right-0 top-0 z-[71] flex h-full w-[440px] max-w-[92vw] flex-col bg-surface shadow animate-ab-drawerin"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="text-[15px] font-semibold">{title}</div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-fg-2 hover:bg-surface-2"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">{footer}</div>
        )}
      </div>
    </div>
  )
}
