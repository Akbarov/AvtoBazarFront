import { useTranslation } from 'react-i18next'
import { ShieldX } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { Button } from '@/components/ui/button'

export function AdminDeniedGate() {
  const { t } = useTranslation()
  const { signOut } = useAuth()
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-6">
      <div className="w-full max-w-[404px] rounded-[18px] border border-border bg-surface p-9 text-center shadow">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger">
          <ShieldX size={26} />
        </div>
        <div className="mb-2 text-[20px] font-bold tracking-tight">{t('denied.title')}</div>
        <div className="mb-6 leading-relaxed text-fg-2">{t('denied.message')}</div>
        <Button variant="outline" className="w-full" onClick={signOut}>
          {t('denied.signOut')}
        </Button>
      </div>
    </div>
  )
}
