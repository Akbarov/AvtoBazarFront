import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { InspectionRequestResponse } from '@/types/api'
import { Modal } from '@/components/common/Modal'
import { Badge } from '@/components/ui/badge'
import { formatEpoch, formatPrice } from '@/lib/utils'
import { InspectionStatusBadge } from './InspectionStatusBadge'

interface Props {
  inspection: InspectionRequestResponse | null
  onClose: () => void
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-3 py-2">
      <div className="text-[12px] font-semibold uppercase tracking-[0.04em] text-muted">{label}</div>
      <div className="text-[13px]">{children}</div>
    </div>
  )
}

export function InspectionDetailModal({ inspection, onClose }: Props) {
  const { t, i18n } = useTranslation()
  if (!inspection) return null

  return (
    <Modal open title={t('inspections.detailTitle')} onClose={onClose}>
      <div className="mb-4 flex items-center gap-3">
        <InspectionStatusBadge status={inspection.status} />
        <Badge variant={inspection.requesterRole === 'SELLER' ? 'accent' : 'neutral'}>
          {t(`inspections.role.${inspection.requesterRole}`)}
        </Badge>
        <Badge variant="accent">{t(`experts.spec.${inspection.specialization}`)}</Badge>
      </div>

      <div className="divide-y divide-border">
        <Row label={t('inspections.vehicle')}>
          <Link to={`/vehicles/${inspection.vehicleId}`} className="font-mono text-accent hover:underline" onClick={onClose}>
            {inspection.vehicleId}
          </Link>
        </Row>
        <Row label={t('inspections.requester')}>{inspection.requesterName ?? inspection.requesterId}</Row>
        <Row label={t('inspections.expert')}>
          {inspection.expertName ?? (inspection.expertId ?? t('inspections.notAssigned'))}
        </Row>
        <Row label={t('inspections.scheduled')}>
          {inspection.scheduledAt ? formatEpoch(inspection.scheduledAt, i18n.language) : '—'}
        </Row>
        <Row label={t('inspections.location')}>{inspection.locationAddress ?? '—'}</Row>
        <Row label={t('inspections.price')}>
          {inspection.price != null ? formatPrice(inspection.price, inspection.currency) : '—'}
        </Row>
        <Row label={t('inspections.paymentStatus')}>
          <Badge variant={inspection.paymentStatus === 'PAID' ? 'green' : 'neutral'} shape="pill">
            {t(`inspections.payment.${inspection.paymentStatus}`)}
          </Badge>
        </Row>
        {inspection.note && <Row label={t('inspections.note')}>{inspection.note}</Row>}
        {inspection.cancelReason && <Row label={t('inspections.cancelReason')}>{inspection.cancelReason}</Row>}
        <Row label={t('inspections.created')}>{formatEpoch(inspection.createdAt, i18n.language)}</Row>
      </div>
    </Modal>
  )
}
