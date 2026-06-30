import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, ChevronLeft, Loader2, Upload } from 'lucide-react'
import { soatoApi } from '@/lib/api/resources/soato'
import { parseApiError } from '@/lib/api/errors'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/common/toast'

const EXPECTED_COLUMNS = ['nameUz', 'nameRu', 'nameEn', 'soatoCode', 'nationalCode', 'type', 'parentId']

export function SoatoImportPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toast = useToast()
  const qc = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [done, setDone] = useState(false)

  const upload = useMutation({
    mutationFn: (file: File) => soatoApi.upload(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['soato'] })
      setDone(true)
    },
    onError: (e) => {
      const parsed = parseApiError(e, t('soato.import.error'))
      // 100011 = SOATO parse failure
      toast.danger(parsed.code === '100011' ? t('soato.import.parseFail') : parsed.message)
    },
  })

  function onFile(file: File | undefined) {
    if (file) upload.mutate(file)
  }

  return (
    <div>
      <button
        onClick={() => navigate('/soato')}
        className="mb-3.5 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-fg-2"
      >
        <ChevronLeft size={15} /> {t('soato.import.back')}
      </button>

      <div className="mb-1 text-[22px] font-bold tracking-tight">{t('soato.import.title')}</div>
      <div className="mb-5 text-fg-2">
        {t('soato.import.subtitle')} ·{' '}
        <span className="font-mono text-[12px]">POST /control/soato/upload</span>
      </div>

      <div className="max-w-[560px]">
        <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
          {upload.isPending ? (
            <div className="flex flex-col items-center gap-3 py-10 text-fg-2">
              <Loader2 className="animate-ab-spin" size={28} />
              <div className="text-[13px]">{t('soato.import.uploading')}</div>
            </div>
          ) : done ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-soft text-green">
                <Check size={26} />
              </div>
              <div className="text-[15px] font-semibold">{t('soato.import.done')}</div>
              <div className="text-[12.5px] text-muted">{t('soato.import.doneMsg')}</div>
              <Button variant="outline" size="sm" className="mt-1" onClick={() => setDone(false)}>
                {t('soato.import.another')}
              </Button>
            </div>
          ) : (
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                onFile(e.dataTransfer.files?.[0])
              }}
              className="flex cursor-pointer flex-col items-center gap-3 rounded-[12px] border-2 border-dashed border-border-strong py-12 text-center text-fg-2 hover:border-accent"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-surface-2 text-muted">
                <Upload size={24} />
              </div>
              <div className="text-[13px]">{t('soato.import.drop')}</div>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0])}
              />
            </div>
          )}
        </div>

        <div className="mt-4 rounded-[14px] border border-border bg-surface p-5 shadow-sm">
          <div className="mb-2.5 text-[13px] font-semibold">{t('soato.import.columns')}</div>
          <div className="flex flex-wrap gap-2">
            {EXPECTED_COLUMNS.map((c) => (
              <span
                key={c}
                className="rounded-[7px] border border-border bg-surface-2 px-2.5 py-1 font-mono text-[11.5px]"
              >
                {c}
              </span>
            ))}
          </div>
          <div className="mt-3 text-[11.5px] leading-relaxed text-muted">{t('soato.import.parseFail')}</div>
        </div>
      </div>
    </div>
  )
}
