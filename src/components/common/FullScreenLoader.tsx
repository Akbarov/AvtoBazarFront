import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function FullScreenLoader() {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg text-muted">
      <Loader2 className="animate-ab-spin" size={28} />
      <div className="text-[13px]">{t('common.loading')}</div>
    </div>
  )
}
