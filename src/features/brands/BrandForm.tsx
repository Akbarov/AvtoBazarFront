import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Loader2, Upload } from 'lucide-react'
import type { VehicleBrandRequest, VehicleBrandResponse } from '@/types/api'
import { parseApiError } from '@/lib/api/errors'
import { initials } from '@/lib/utils'
import { mediaApi } from '@/lib/api/resources/media'
import { Modal } from '@/components/common/Modal'
import { TrilingualNameField } from '@/components/common/TrilingualNameField'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/common/toast'
import { useBrandMutations } from './useBrandMutations'

interface FormValues {
  nameUz: string
  nameRu: string
  nameEn: string
  logoUrl: string
  position: string
  popular: boolean
}

const EMPTY: FormValues = { nameUz: '', nameRu: '', nameEn: '', logoUrl: '', position: '', popular: false }

interface Props {
  open: boolean
  brand: VehicleBrandResponse | null
  onClose: () => void
}

export function BrandForm({ open, brand, onClose }: Props) {
  const { t } = useTranslation()
  const toast = useToast()
  const { create, update } = useBrandMutations()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const schema = useMemo(
    () =>
      z.object({
        nameUz: z.string().min(1, t('common.required')),
        nameRu: z.string(),
        nameEn: z.string(),
        logoUrl: z.string(),
        position: z.string(),
        popular: z.boolean(),
      }),
    [t],
  )

  const { handleSubmit, watch, setValue, setError, reset, register, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  })

  // Refill the form whenever the drawer opens or the edited brand changes (B3 gives all 3 languages).
  useEffect(() => {
    if (!open) return
    reset(
      brand
        ? {
            nameUz: brand.nameUz ?? '',
            nameRu: brand.nameRu ?? '',
            nameEn: brand.nameEn ?? '',
            logoUrl: brand.logoUrl ?? '',
            position: brand.position ?? '',
            popular: brand.popular,
          }
        : EMPTY,
    )
  }, [open, brand, reset])

  const values = watch()

  async function onLogoSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-picking the same file
    if (!file) return
    setUploading(true)
    try {
      const uploaded = await mediaApi.upload(file)
      setValue('logoUrl', uploaded.fileUrl, { shouldValidate: false })
    } catch (err) {
      toast.danger(parseApiError(err, t('toast.genericError')).message)
    } finally {
      setUploading(false)
    }
  }

  async function onSubmit(form: FormValues) {
    const body: VehicleBrandRequest = {
      nameUz: form.nameUz,
      nameRu: form.nameRu || undefined,
      nameEn: form.nameEn || undefined,
      logoUrl: form.logoUrl || undefined,
      position: form.position || undefined,
      popular: form.popular,
    }
    try {
      if (brand) {
        await update.mutateAsync({ id: brand.id, body })
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
    <Modal
      open={open}
      title={brand ? t('brands.edit') : t('brands.new')}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={busy || uploading}>
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
          <div className="mb-2 text-[12px] font-semibold text-fg-2">{t('brands.logo')}</div>
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-2 text-[13px] font-bold text-muted">
              {values.logoUrl ? (
                <img src={values.logoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                initials(values.nameUz || values.nameRu)
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onLogoSelected}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              {values.logoUrl ? t('brands.changeLogo') : t('brands.uploadLogo')}
            </Button>
            {values.logoUrl && !uploading && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setValue('logoUrl', '')}>
                {t('brands.removeLogo')}
              </Button>
            )}
          </div>
        </div>

        <div>
          <div className="mb-2 text-[12px] font-semibold text-fg-2">{t('brands.position')}</div>
          <Input {...register('position')} placeholder={t('brands.positionPlaceholder')} className="w-[140px] font-mono" />
        </div>

        <label className="flex cursor-pointer items-center justify-between">
          <span className="text-[13px] font-medium">{t('brands.popular')}</span>
          <Switch checked={values.popular} onChange={(c) => setValue('popular', c)} />
        </label>
      </div>
    </Modal>
  )
}
