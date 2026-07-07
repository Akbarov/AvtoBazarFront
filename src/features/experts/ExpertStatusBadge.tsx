import { useTranslation } from 'react-i18next'
import type { ExpertProfileStatus } from '@/types/api'
import { Badge, type BadgeProps } from '@/components/ui/badge'

const VARIANT: Record<ExpertProfileStatus, BadgeProps['variant']> = {
  PENDING: 'warn',
  APPROVED: 'green',
  SUSPENDED: 'danger',
  REJECTED: 'neutral',
}

export function ExpertStatusBadge({ status }: { status: ExpertProfileStatus }) {
  const { t } = useTranslation()
  return (
    <Badge variant={VARIANT[status]} shape="pill">
      {t(`experts.status.${status}`)}
    </Badge>
  )
}
