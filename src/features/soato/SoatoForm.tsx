import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import type { SoatoRequest, SoatoResponse } from '@/types/api'
import { parseApiError } from '@/lib/api/errors'
import { Drawer } from '@/components/common/Drawer'
import { TrilingualNameField } from '@/components/common/TrilingualNameField'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/common/toast'
import { useRegionOptions } from '@/features/shared/useOptions'
import { useSoatoMutations } from './useSoatoMutations'

interface FormValues {
  nameUz: string
  nameRu: string
  nameEn: string
  type: '' | 'REGION' | 'DISTRICT'
  parentId: string
  soatoCode: string
  nationalCode: string
}

const EMPTY: FormValues = { nameUz: '', nameRu: '', nameEn: '', type: '', parentId: '', soatoCode: '', nationalCode: '' }

interface Props {
  open: boolean
  entry: SoatoResponse | null
  onClose: () => void
}

export function SoatoForm({ open, entry, onClose }: Props) {
  const { t } = useTranslation()
  const toast = useToast()
  const { create, update } = useSoatoMutations()
  const regionOptions = useRegionOptions()

  const schema = useMemo(
    () =>
      z
        .object({
          nameUz: z.string().min(1, t('common.required')),
          nameRu: z.string(),
          nameEn: z.string(),
          type: z.enum(['REGION', 'DISTRICT'], { message: t('common.required') }),
          parentId: z.string(),
          soatoCode: z.string().regex(/^\d+$/, t('common.required')),
          nationalCode: z.string().regex(/^\d*$/, t('common.optional')),
        })
        .refine((v) => v.type !== 'DISTRICT' || v.parentId.length > 0, {
          path: ['parentId'],
          message: t('common.required'),
        }),
    [t],
  )

  const { handleSubmit, watch, setValue, setError, reset, register, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  })

  useEffect(() => {
    if (!open) return
    reset(
      entry
        ? {
            nameUz: entry.nameUz ?? '',
            nameRu: entry.nameRu ?? '',
            nameEn: entry.nameEn ?? '',
            type: entry.type,
            parentId: entry.parentId ?? '',
            soatoCode: entry.soatoCode != null ? String(entry.soatoCode) : '',
            nationalCode: entry.nationalCode != null ? String(entry.nationalCode) : '',
          }
        : EMPTY,
    )
  }, [open, entry, reset])

  const values = watch()

  async function onSubmit(form: FormValues) {
    const body: SoatoRequest = {
      nameUz: form.nameUz,
      nameRu: form.nameRu || undefined,
      nameEn: form.nameEn || undefined,
      type: form.type as 'REGION' | 'DISTRICT',
      parentId: form.type === 'DISTRICT' ? form.parentId || undefined : undefined,
      soatoCode: Number(form.soatoCode),
      nationalCode: form.nationalCode ? Number(form.nationalCode) : undefined,
    }
    try {
      if (entry) {
        await update.mutateAsync({ id: entry.id, body })
        toast.success(t('toast.updated'))
      } else {
        await create.mutateAsync(body)
        toast.success(t('toast.created'))
      }
      onClose()
    } catch (e) {
      const parsed = parseApiError(e, t('toast.genericError'))
      for (const [field, message] of Object.entries(parsed.fieldErrors)) {
        setError(field as keyof FormValues, { message })
      }
      toast.danger(parsed.message)
    }
  }

  const busy = create.isPending || update.isPending
  const typeOptions = [
    { value: 'REGION', label: t('soato.region') },
    { value: 'DISTRICT', label: t('soato.district') },
  ]

  return (
    <Drawer
      open={open}
      title={entry ? t('soato.edit') : t('soato.new')}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={busy}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-[18px]">
        <TrilingualNameField
          value={{ nameUz: values.nameUz, nameRu: values.nameRu, nameEn: values.nameEn }}
          onChange={(v) => {
            setValue('nameUz', v.nameUz, { shouldValidate: !!formState.errors.nameUz })
            setValue('nameRu', v.nameRu)
            setValue('nameEn', v.nameEn)
          }}
          errorUz={formState.errors.nameUz?.message}
        />

        <div>
          <div className="mb-2 text-[12px] font-semibold text-fg-2">{t('soato.type')} *</div>
          <Select
            options={typeOptions}
            placeholder="—"
            value={values.type}
            invalid={!!formState.errors.type}
            onChange={(e) => setValue('type', e.target.value as FormValues['type'], { shouldValidate: true })}
            className="w-full"
          />
        </div>

        {values.type === 'DISTRICT' && (
          <div>
            <div className="mb-2 text-[12px] font-semibold text-fg-2">{t('soato.parentRegion')} *</div>
            <Select
              options={regionOptions.data ?? []}
              placeholder="—"
              value={values.parentId}
              invalid={!!formState.errors.parentId}
              onChange={(e) => setValue('parentId', e.target.value, { shouldValidate: true })}
              className="w-full"
            />
            {formState.errors.parentId && (
              <div className="mt-1.5 text-[11.5px] text-danger">{formState.errors.parentId.message}</div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <div className="flex-1">
            <div className="mb-2 text-[12px] font-semibold text-fg-2">{t('soato.soatoCode')} *</div>
            <Input
              {...register('soatoCode')}
              inputMode="numeric"
              invalid={!!formState.errors.soatoCode}
              className="font-mono"
            />
          </div>
          <div className="flex-1">
            <div className="mb-2 text-[12px] font-semibold text-fg-2">{t('soato.nationalCode')}</div>
            <Input {...register('nationalCode')} inputMode="numeric" className="font-mono" />
          </div>
        </div>
      </div>
    </Drawer>
  )
}
