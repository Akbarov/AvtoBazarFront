import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { FileText, Video } from 'lucide-react'
import { inspectionsApi } from '@/lib/api/resources/inspections'
import type {
  ChecklistItemStatus,
  InspectionRequestResponse,
  InspectionVerdict,
} from '@/types/api'
import { Modal } from '@/components/common/Modal'
import { Badge, type BadgeProps } from '@/components/ui/badge'
import { formatEpoch, formatFileSize, formatNumber } from '@/lib/utils'

const VERDICT_VARIANT: Record<InspectionVerdict, BadgeProps['variant']> = {
  RECOMMENDED: 'green',
  MINOR_ISSUES: 'warn',
  MAJOR_ISSUES: 'danger',
  AVOID: 'danger',
}

const ITEM_VARIANT: Record<ChecklistItemStatus, BadgeProps['variant']> = {
  OK: 'green',
  MINOR: 'warn',
  MAJOR: 'danger',
  NOT_APPLICABLE: 'neutral',
}

interface Props {
  inspection: InspectionRequestResponse | null
  onClose: () => void
}

export function InspectionReportModal({ inspection, onClose }: Props) {
  const { t, i18n } = useTranslation()

  const { data: report, isLoading } = useQuery({
    queryKey: ['inspectionReport', inspection?.id],
    queryFn: () => inspectionsApi.reportByRequest(inspection!.id),
    enabled: !!inspection,
  })

  // template names are localized by Accept-Language, so key on the UI language too
  const { data: template } = useQuery({
    queryKey: ['checklistTemplate', inspection?.specialization, i18n.language],
    queryFn: () => inspectionsApi.checklistTemplate(inspection!.specialization),
    enabled: !!inspection,
    staleTime: Infinity,
  })

  const names = useMemo(() => {
    const map = new Map<string, string>()
    template?.sections.forEach((s) => {
      map.set(s.key, s.name)
      s.items.forEach((i) => map.set(i.key, i.name))
    })
    return map
  }, [template])

  if (!inspection) return null

  const images = report?.files.filter((f) => f.fileType === 'IMAGE') ?? []
  const otherFiles = report?.files.filter((f) => f.fileType !== 'IMAGE') ?? []

  return (
    <Modal open title={t('inspections.reportTitle')} onClose={onClose}>
      {isLoading && <div className="py-10 text-center text-fg-2">{t('common.loading')}</div>}

      {report && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={VERDICT_VARIANT[report.overallVerdict]} shape="pill">
              {report.verdictName}
            </Badge>
            {report.overallScore != null && (
              <Badge variant="accent" shape="pill">
                {report.overallScore}/100
              </Badge>
            )}
            <Badge variant={report.published ? 'green' : 'neutral'} shape="pill">
              {report.published ? t('inspections.published') : t('inspections.notPublished')}
            </Badge>
            <Badge variant="neutral" shape="pill">
              {t(`inspections.visibility.${report.visibility}`)}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[13px] sm:grid-cols-3">
            <div>
              <div className="text-[11px] font-semibold uppercase text-muted">{t('inspections.expert')}</div>
              {report.expertName ?? '—'}
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase text-muted">{t('inspections.inspectedAt')}</div>
              {report.inspectedAt ? formatEpoch(report.inspectedAt, i18n.language) : '—'}
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase text-muted">{t('inspections.mileage')}</div>
              {report.mileageAtInspection != null ? `${formatNumber(report.mileageAtInspection)} km` : '—'}
            </div>
          </div>

          {report.summary && (
            <div>
              <div className="mb-1 text-[11px] font-semibold uppercase text-muted">{t('inspections.summary')}</div>
              <p className="whitespace-pre-wrap text-[13px]">{report.summary}</p>
            </div>
          )}

          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase text-muted">{t('inspections.checklist')}</div>
            {report.checklist?.sections?.length ? (
              <div className="space-y-3">
                {report.checklist.sections.map((section) => (
                  <div key={section.key} className="overflow-hidden rounded-[10px] border border-border">
                    <div className="flex items-center justify-between bg-surface-2 px-3 py-2 text-[12.5px] font-semibold">
                      <span>{names.get(section.key) ?? section.key}</span>
                      {section.score != null && <span className="text-fg-2">{section.score}/100</span>}
                    </div>
                    <div className="divide-y divide-border">
                      {section.items?.map((item) => (
                        <div key={item.key} className="flex items-start gap-3 px-3 py-2 text-[12.5px]">
                          <span className="flex-1">{names.get(item.key) ?? item.key}</span>
                          {item.rating != null && <span className="text-fg-2">{item.rating}/10</span>}
                          {item.status && (
                            <Badge variant={ITEM_VARIANT[item.status]}>
                              {t(`inspections.itemStatus.${item.status}`)}
                            </Badge>
                          )}
                          {item.note && <span className="max-w-[240px] text-fg-2">{item.note}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[13px] text-fg-2">{t('inspections.noChecklist')}</div>
            )}
          </div>

          {!!report.files.length && (
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase text-muted">{t('inspections.files')}</div>
              {!!images.length && (
                <div className="mb-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {images.map((f) => (
                    <a key={f.id} href={f.fileUrl} target="_blank" rel="noreferrer">
                      <img
                        src={f.fileUrl}
                        alt={f.originalFileName ?? ''}
                        className="h-20 w-full rounded-lg border border-border object-cover"
                      />
                    </a>
                  ))}
                </div>
              )}
              {!!otherFiles.length && (
                <ul className="space-y-1.5">
                  {otherFiles.map((f) => (
                    <li key={f.id}>
                      <a
                        href={f.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-[13px] text-accent hover:underline"
                      >
                        {f.fileType === 'VIDEO' ? <Video size={15} /> : <FileText size={15} />}
                        {f.originalFileName ?? f.fileUrl}
                        {f.fileSize != null && <span className="text-muted">({formatFileSize(f.fileSize)})</span>}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
