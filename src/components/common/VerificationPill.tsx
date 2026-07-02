import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'

export function VerificationPill({ verified }: { verified: boolean }) {
  const { t } = useTranslation()
  return (
    <Badge variant={verified ? 'accent' : 'warn'} shape="pill">
      {verified ? t('vehicles.verified') : t('vehicles.pending')}
    </Badge>
  )
}
