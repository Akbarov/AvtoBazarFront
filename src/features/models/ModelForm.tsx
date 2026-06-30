import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import type { VehicleModelRequest, VehicleModelResponse } from '@/types/api'
import { parseApiError } from '@/lib/api/errors'
import { Drawer } from '@/components/common/Drawer'
import { TrilingualNameField } from '@/components/common/TrilingualNameField'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/common/toast'
import { useBrandOptions, useModelOptions } from '@/features/shared/useOptions'
import { useModelMutations } from './useModelMutations'

interface FormValues {
  brandId: string
  parentId: string
  nameUz: string
  nameRu: string
  nameEn: string
  position: string
  popular: boolean
}

const EMPTY: FormValues = { brandId: '', parentId: '', nameUz: '', nameRu: '', nameEn: '', position: '', popular: false }

interface Props {
  open: boolean
  model: VehicleModelResponse | null
  onClose: () => void
}

export function ModelForm({ open, model, onClose }: Props) {
  const { t } = useTranslation()
  const toast = useToast()
  const { create, update } = useModelMutations()
  const brandOptions = useBrandOptions()

  const schema = useMemo(
    () =>
      z.object({
        brandId: z.string().min(1, t('common.required')),
        parentId: z.string(),
        nameUz: z.string().min(1, t('common.required')),
        nameRu: z.string(),
        nameEn: z.string(),
        position: z.string(),
        popular: z.boolean(),
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
      model
        ? {
            brandId: model.brandId,
            parentId: model.parentId ?? '',
            nameUz: model.nameUz ?? '',
            nameRu: model.nameRu ?? '',
            nameEn: model.nameEn ?? '',
            position: model.position ?? '',
            popular: model.popular,
          }
        : EMPTY,
    )
  }, [open, model, reset])

  const values = watch()
  const parentOptions = useModelOptions(values.brandId || undefined, model?.id)

  async function onSubmit(form: FormValues) {
    const body: VehicleModelRequest = {
      brandId: form.brandId,
      parentId: form.parentId || undefined,
      nameUz: form.nameUz,
      nameRu: form.nameRu || undefined,
      nameEn: form.nameEn || undefined,
      position: form.position || undefined,
      popular: form.popular,
    }
    try {
      if (model) {
        await update.mutateAsync({ id: model.id, body })
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

  return (
    <Drawer
      open={open}
      title={model ? t('models.edit') : t('models.new')}
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
        <div>
          <div className="mb-2 text-[12px] font-semibold text-fg-2">{t('models.brand')} *</div>
          <Select
            options={brandOptions.data ?? []}
            placeholder="—"
            value={values.brandId}
            invalid={!!formState.errors.brandId}
            onChange={(e) => {
              setValue('brandId', e.target.value, { shouldValidate: !!formState.errors.brandId })
              setValue('parentId', '')
            }}
            className="w-full"
          />
          {formState.errors.brandId && (
            <div className="mt-1.5 text-[11.5px] text-danger">{formState.errors.brandId.message}</div>
          )}
        </div>

        <div>
          <div className="mb-2 text-[12px] font-semibold text-fg-2">{t('models.parent')}</div>
          <Select
            options={parentOptions.data ?? []}
            placeholder={t('models.noParent')}
            value={values.parentId}
            disabled={!values.brandId}
            onChange={(e) => setValue('parentId', e.target.value)}
            className="w-full"
          />
        </div>

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
          <div className="mb-2 text-[12px] font-semibold text-fg-2">{t('models.position')}</div>
          <Input {...register('position')} className="w-[140px] font-mono" />
        </div>

        <label className="flex cursor-pointer items-center justify-between">
          <span className="text-[13px] font-medium">{t('models.popular')}</span>
          <Switch checked={values.popular} onChange={(c) => setValue('popular', c)} />
        </label>
      </div>
    </Drawer>
  )
}
