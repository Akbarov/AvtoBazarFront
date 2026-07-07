import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { expertsApi } from '@/lib/api/resources/experts'
import { criteria, pageable } from '@/lib/api/pageable'
import type { InspectionRequestResponse } from '@/types/api'
import { Modal } from '@/components/common/Modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useToast } from '@/components/common/toast'
import { parseApiError } from '@/lib/api/errors'
import { useInspectionMutations } from './useInspectionMutations'

const CURRENCIES = ['UZS', 'USD', 'EUR'] as const

interface Props {
  inspection: InspectionRequestResponse | null
  onClose: () => void
}

export function AssignExpertModal({ inspection, onClose }: Props) {
  const { t } = useTranslation()
  const toast = useToast()
  const { assign } = useInspectionMutations()

  const [expertId, setExpertId] = useState('')
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState('')

  const { data } = useQuery({
    queryKey: ['experts', 'approved'],
    queryFn: () =>
      expertsApi.pageable(
        pageable({
          perPage: 50,
          sort: { key: 'completed_inspections', direction: 'DESC' },
          search: [criteria('status', '=', 'APPROVED')],
        }),
      ),
    enabled: !!inspection,
  })

  const matching = useMemo(
    () =>
      (data?.content ?? []).filter(
        (e) => inspection && e.specializations.includes(inspection.specialization),
      ),
    [data, inspection],
  )

  // reset on open; prefill price/currency from the picked expert's profile fee
  useEffect(() => {
    if (inspection) {
      setExpertId('')
      setPrice('')
      setCurrency('')
    }
  }, [inspection])

  useEffect(() => {
    const expert = matching.find((e) => e.userId === expertId)
    if (expert) {
      setPrice(expert.feeAmount != null ? String(expert.feeAmount) : '')
      setCurrency(expert.currency ?? '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expertId])

  if (!inspection) return null

  async function onSubmit() {
    if (!expertId || !inspection) return
    try {
      await assign.mutateAsync({
        id: inspection.id,
        body: {
          expertId,
          price: price.trim() ? Number(price) : undefined,
          currency: currency || undefined,
        },
      })
      toast.success(t('toast.updated'))
      onClose()
    } catch (e) {
      toast.danger(parseApiError(e, t('toast.genericError')).message)
    }
  }

  return (
    <Modal
      open
      title={t('inspections.assignTitle')}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={onSubmit} disabled={!expertId || assign.isPending}>
            {t('inspections.confirmAssign')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-fg-2">{t('inspections.colSpec')}:</span>
          <Badge variant="accent">{t(`experts.spec.${inspection.specialization}`)}</Badge>
        </div>

        <div>
          <label className="mb-1.5 block text-[12px] font-semibold text-fg-2">{t('inspections.expertLabel')}</label>
          {matching.length ? (
            <Select
              options={matching.map((e) => ({
                value: e.userId,
                label: `${e.fullName ?? e.userId} · ${e.completedInspections ?? 0} ${t('inspections.inspectionsShort')}${e.reviewsCount ? ` · ★ ${e.avgRating}` : ''}`,
              }))}
              placeholder={t('inspections.selectExpert')}
              value={expertId}
              onChange={(e) => setExpertId(e.target.value)}
              className="w-full"
            />
          ) : (
            <div className="rounded-[9px] border border-border bg-surface-2 px-3 py-2.5 text-[13px] text-fg-2">
              {t('inspections.noMatchingExperts')}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-fg-2">{t('inspections.priceLabel')}</label>
            <Input
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="—"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-fg-2">{t('inspections.currencyLabel')}</label>
            <Select
              options={CURRENCIES.map((c) => ({ value: c, label: c }))}
              placeholder="—"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}
