import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'

export function StatusPill({ active }: { active: boolean }) {
  const { t } = useTranslation()
  return (
    <Badge variant={active ? 'green' : 'neutral'} shape="pill">
      {active ? t('vehicles.active') : t('vehicles.unpublished')}
    </Badge>
  )
}
