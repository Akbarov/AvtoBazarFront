import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { useFocusTrap } from '@/lib/a11y/useFocusTrap'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export function Modal({ open, title, onClose, children, footer }: ModalProps) {
  const panelRef = useFocusTrap<HTMLDivElement>(open, onClose)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-ab-fadein" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-[71] flex max-h-[85vh] w-[480px] max-w-full flex-col overflow-hidden rounded-[16px] border border-border bg-surface shadow animate-ab-pop"
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
