import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { soatoApi } from '@/lib/api/resources/soato'
import type { ExpertProfileResponse } from '@/types/api'
import { Modal } from '@/components/common/Modal'
import { Badge } from '@/components/ui/badge'
import { formatEpoch, formatPrice, initials } from '@/lib/utils'
import { ExpertStatusBadge } from './ExpertStatusBadge'

interface Props {
  expert: ExpertProfileResponse | null
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

export function ExpertDetailModal({ expert, onClose }: Props) {
  const { t, i18n } = useTranslation()

  const { data: soato } = useQuery({
    queryKey: ['soato', expert?.soatoId],
    queryFn: () => soatoApi.getById(expert!.soatoId!),
    enabled: !!expert?.soatoId,
    staleTime: Infinity,
  })

  if (!expert) return null

  return (
    <Modal open title={t('experts.detailTitle')} onClose={onClose}>
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-[13px] font-bold text-accent">
          {initials(expert.fullName)}
        </span>
        <div>
          <div className="text-[15px] font-semibold">{expert.fullName ?? '—'}</div>
          <div className="font-mono text-[12.5px] text-fg-2">{expert.phoneNumber ?? '—'}</div>
        </div>
        <div className="ml-auto">
          <ExpertStatusBadge status={expert.status} />
        </div>
      </div>

      <div className="divide-y divide-border">
        <Row label={t('experts.specializations')}>
          <div className="flex flex-wrap gap-1.5">
            {expert.specializations.map((s) => (
              <Badge key={s} variant="accent">
                {t(`experts.spec.${s}`)}
              </Badge>
            ))}
          </div>
        </Row>
        {expert.bio && <Row label={t('experts.bio')}>{expert.bio}</Row>}
        <Row label={t('experts.experience')}>
          {expert.experienceYears != null ? `${expert.experienceYears} ${t('experts.yearsShort')}` : '—'}
        </Row>
        {!!expert.certifications?.length && (
          <Row label={t('experts.certifications')}>
            <ul className="list-inside list-disc space-y-1">
              {expert.certifications.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </Row>
        )}
        <Row label={t('experts.region')}>{expert.soatoId ? soato?.name ?? '…' : '—'}</Row>
        <Row label={t('experts.fee')}>
          {expert.feeAmount != null ? formatPrice(expert.feeAmount, expert.currency) : '—'}
        </Row>
        <Row label={t('experts.completed')}>{expert.completedInspections ?? 0}</Row>
        <Row label={t('experts.rating')}>
          {expert.reviewsCount ? `${expert.avgRating} (${expert.reviewsCount})` : t('experts.noRating')}
        </Row>
        {expert.statusReason && <Row label={t('experts.statusReason')}>{expert.statusReason}</Row>}
        <Row label={t('experts.applied')}>{formatEpoch(expert.createdAt, i18n.language)}</Row>
      </div>
    </Modal>
  )
}
