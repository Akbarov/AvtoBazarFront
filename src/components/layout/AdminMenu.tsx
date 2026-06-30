import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { initials } from '@/lib/utils'

export function AdminMenu() {
  const { t } = useTranslation()
  const { identity, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-[9px] rounded-[9px] px-[6px] py-1 hover:bg-surface-2"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-[12px] font-bold text-accent">
          {initials(identity?.fullName)}
        </span>
        <span className="text-left leading-tight">
          <span className="block text-[12.5px] font-semibold">{identity?.fullName ?? '—'}</span>
          <span className="block font-mono text-[11px] text-muted">{identity?.phoneNumber ?? ''}</span>
        </span>
        <ChevronDown size={15} className="text-muted" />
      </button>

      {open && (
        <div className="absolute right-0 top-[46px] z-40 w-[188px] rounded-[11px] border border-border bg-surface p-[6px] shadow">
          <div className="mb-1 border-b border-border px-[10px] py-[9px] text-[11px] text-muted">
            {t('common.signedInAsAdmin')}
          </div>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-[9px] rounded-lg px-[10px] py-[9px] font-medium text-danger hover:bg-danger-soft"
          >
            <LogOut size={16} /> {t('common.signOut')}
          </button>
        </div>
      )}
    </div>
  )
}
