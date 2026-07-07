import { useTranslation } from 'react-i18next'
import type { InspectionStatus } from '@/types/api'
import { Badge, type BadgeProps } from '@/components/ui/badge'

const VARIANT: Record<InspectionStatus, BadgeProps['variant']> = {
  REQUESTED: 'warn',
  ASSIGNED: 'accent',
  SCHEDULED: 'accent',
  IN_PROGRESS: 'accent',
  COMPLETED: 'green',
  CANCELLED: 'neutral',
  REJECTED: 'danger',
}

export function InspectionStatusBadge({ status }: { status: InspectionStatus }) {
  const { t } = useTranslation()
  return (
    <Badge variant={VARIANT[status]} shape="pill">
      {t(`inspections.status.${status}`)}
    </Badge>
  )
}
