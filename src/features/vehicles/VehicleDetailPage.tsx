import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BadgeCheck, BadgeX, Check, ChevronLeft, Film, Image as ImageIcon, Trash2, X } from 'lucide-react'
import { vehiclesApi } from '@/lib/api/resources/vehicles'
import { VehicleGallery } from './VehicleGallery'
import { mediaApi } from '@/lib/api/resources/media'
import { soatoApi } from '@/lib/api/resources/soato'
import { parseApiError } from '@/lib/api/errors'
import { formatEpoch, formatNumber, formatPrice, initials } from '@/lib/utils'
import { toColorMap, toLabelMap, useColors, useEnum } from '@/lib/enums/enumCache'
import { StatusPill } from '@/components/common/StatusPill'
import { VerificationPill } from '@/components/common/VerificationPill'
import { ColorSwatch } from '@/components/common/ColorSwatch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FullScreenLoader } from '@/components/common/FullScreenLoader'
import { useConfirm } from '@/components/common/confirm'
import { useToast } from '@/components/common/toast'

function Spec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface px-3.5 py-2.5">
      <div className="text-[11px] text-muted">{label}</div>
      <div className="mt-0.5 text-[13px] font-medium">{children}</div>
    </div>
  )
}

export function VehicleDetailPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const toast = useToast()
  const qc = useQueryClient()
  const { id = '' } = useParams()

  const vehicleQ = useQuery({ queryKey: ['vehicle', id], queryFn: () => vehiclesApi.getById(id), enabled: !!id })
  const mediaQ = useQuery({ queryKey: ['vehicle-media', id], queryFn: () => vehiclesApi.media(id), enabled: !!id })

  const vehicle = vehicleQ.data
  const soatoQ = useQuery({
    queryKey: ['soato', vehicle?.soatoId, i18n.language],
    queryFn: () => soatoApi.getById(vehicle!.soatoId),
    enabled: !!vehicle?.soatoId,
  })

  const categories = useEnum('categories')
  const engines = useEnum('engine-types')
  const transmissions = useEnum('transmissions')
  const drives = useEnum('drive-types')
  const bodies = useEnum('body-types')
  const features = useEnum('features')
  const colors = useColors()

  const maps = useMemo(
    () => ({
      category: toLabelMap(categories.data),
      engine: toLabelMap(engines.data),
      transmission: toLabelMap(transmissions.data),
      drive: toLabelMap(drives.data),
      body: toLabelMap(bodies.data),
      feature: toLabelMap(features.data),
      color: toColorMap(colors.data),
    }),
    [categories.data, engines.data, transmissions.data, drives.data, bodies.data, features.data, colors.data],
  )

  const toggle = useMutation({
    mutationFn: (activate: boolean) => (activate ? vehiclesApi.activate(id) : vehiclesApi.deactivate(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicle', id] })
      qc.invalidateQueries({ queryKey: ['vehicles'] })
    },
  })

  const verify = useMutation({
    mutationFn: (approve: boolean) => (approve ? vehiclesApi.verify(id) : vehiclesApi.unverify(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicle', id] })
      qc.invalidateQueries({ queryKey: ['vehicles'] })
    },
  })

  const deleteMedia = useMutation({
    mutationFn: (fileId: string) => mediaApi.remove(fileId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicle-media', id] }),
  })

  if (vehicleQ.isLoading) return <FullScreenLoader />
  if (!vehicle) return <div className="text-fg-2">404</div>

  async function onToggle() {
    if (vehicle!.active) {
      const ok = await confirm({
        title: t('vehicles.deactivateTitle'),
        message: t('vehicles.deactivateMsg'),
        confirmLabel: t('vehicles.deactivate'),
      })
      if (!ok) return
    }
    try {
      await toggle.mutateAsync(!vehicle!.active)
      toast.success(t('toast.updated'))
    } catch (e) {
      toast.danger(parseApiError(e, t('toast.genericError')).message)
    }
  }

  async function onVerify() {
    if (vehicle!.verified) {
      const ok = await confirm({
        title: t('vehicles.unverifyTitle'),
        message: t('vehicles.unverifyMsg'),
        confirmLabel: t('vehicles.unverify'),
      })
      if (!ok) return
    }
    try {
      await verify.mutateAsync(!vehicle!.verified)
      toast.success(t('toast.updated'))
    } catch (e) {
      toast.danger(parseApiError(e, t('toast.genericError')).message)
    }
  }

  async function onDeleteMedia(fileId: string, name: string) {
    const ok = await confirm({
      title: t('vehicles.deleteMediaTitle'),
      message: `${name} — ${t('vehicles.deleteMediaMsg')}`,
      danger: true,
      noRestore: true,
      confirmLabel: t('common.delete'),
    })
    if (!ok) return
    try {
      await deleteMedia.mutateAsync(fileId)
      toast.success(t('toast.deleted'))
    } catch (e) {
      toast.danger(parseApiError(e, t('toast.genericError')).message)
    }
  }

  const mediaFiles = [...(mediaQ.data ?? [])].sort((a, b) => a.orderNumber - b.orderNumber)

  return (
    <div>
      <button
        onClick={() => navigate('/vehicles')}
        className="mb-3.5 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-fg-2"
      >
        <ChevronLeft size={15} /> {t('vehicles.back')}
      </button>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="text-[24px] font-bold tracking-tight">
              {vehicle.brandName} {vehicle.modelName}
            </div>
            <StatusPill active={vehicle.active} />
            <VerificationPill verified={vehicle.verified} />
          </div>
          <div className="mt-1 text-fg-2">
            {vehicle.year} · {maps.category[vehicle.category] ?? vehicle.category}
          </div>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="text-right">
            <div className="font-mono text-[24px] font-bold tracking-tight">
              {formatPrice(vehicle.price, vehicle.currency)}
            </div>
            {vehicle.negotiable && (
              <div className="text-right text-[11.5px] font-semibold text-accent">{t('vehicles.negotiable')}</div>
            )}
          </div>
          <Button variant={vehicle.verified ? 'outline' : 'primary'} onClick={onVerify} disabled={verify.isPending}>
            {vehicle.verified ? <BadgeX size={16} /> : <BadgeCheck size={16} />}
            {vehicle.verified ? t('vehicles.unverify') : t('vehicles.verify')}
          </Button>
          <Button variant={vehicle.active ? 'danger' : 'primary'} onClick={onToggle} disabled={toggle.isPending}>
            {vehicle.active ? <X size={16} /> : <Check size={16} />}
            {vehicle.active ? t('vehicles.deactivate') : t('vehicles.activate')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.7fr_1fr]">
        {/* LEFT */}
        <div className="flex flex-col gap-4">
          <VehicleGallery images={vehicle.imageUrls ?? []} />

          <div className="rounded-[14px] border border-border bg-surface p-[18px] shadow-sm">
            <div className="mb-3.5 text-[14px] font-semibold">{t('vehicles.specifications')}</div>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-border bg-border">
              <Spec label={t('vehicles.category')}>{maps.category[vehicle.category] ?? vehicle.category}</Spec>
              <Spec label={t('vehicles.year')}>{vehicle.year}</Spec>
              <Spec label={t('vehicles.mileage')}>
                {formatNumber(vehicle.mileage)} {t('vehicles.km')}
              </Spec>
              <Spec label={t('vehicles.engineVolume')}>{vehicle.engineVolume}</Spec>
              <Spec label={t('vehicles.engineType')}>{maps.engine[vehicle.engineType] ?? vehicle.engineType}</Spec>
              <Spec label={t('vehicles.transmission')}>{maps.transmission[vehicle.transmission] ?? vehicle.transmission}</Spec>
              <Spec label={t('vehicles.driveType')}>{maps.drive[vehicle.driveType] ?? vehicle.driveType}</Spec>
              <Spec label={t('vehicles.bodyType')}>{maps.body[vehicle.bodyType] ?? vehicle.bodyType}</Spec>
              <Spec label={t('vehicles.color')}>
                <span className="flex items-center gap-2">
                  <ColorSwatch code={maps.color[vehicle.color]?.code ?? null} />
                  {maps.color[vehicle.color]?.label ?? vehicle.color}
                </span>
              </Spec>
              <Spec label={t('vehicles.location')}>{soatoQ.data?.name ?? '—'}</Spec>
            </div>
            {vehicle.description && (
              <div className="mt-3.5">
                <div className="mb-1.5 text-[11px] text-muted">{t('vehicles.description')}</div>
                <div className="text-[13px] leading-relaxed text-fg-2">{vehicle.description}</div>
              </div>
            )}
          </div>

          {vehicle.features?.length > 0 && (
            <div className="rounded-[14px] border border-border bg-surface p-[18px] shadow-sm">
              <div className="mb-3.5 text-[14px] font-semibold">{t('vehicles.features')}</div>
              <div className="flex flex-wrap gap-2">
                {vehicle.features.map((f) => (
                  <span key={f} className="rounded-[7px] border border-border bg-surface-2 px-2.5 py-1 text-[12px]">
                    {maps.feature[f] ?? f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-4">
          <div className="rounded-[14px] border border-border bg-surface p-[18px] shadow-sm">
            <div className="mb-3.5 text-[14px] font-semibold">{t('vehicles.owner')}</div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-[13px] font-bold text-accent">
                {initials(vehicle.owner?.fullName)}
              </span>
              <div>
                <div className="flex items-center gap-1.5 text-[13px] font-semibold">
                  {vehicle.owner?.fullName}
                  {vehicle.owner?.verified && <BadgeCheck size={15} className="text-green" />}
                </div>
                <div className="font-mono text-[12px] text-muted">{vehicle.owner?.phoneNumber}</div>
              </div>
            </div>
            <div className="mt-3 border-t border-border pt-3 text-[12px] text-fg-2">
              {t('vehicles.registered')}: {formatEpoch(vehicle.owner?.registeredAt, i18n.language)}
            </div>
            <div className="mt-2 text-[12px] text-fg-2">
              {t('vehicles.sellerRating')}:{' '}
              {vehicle.owner?.ratingCount ? (
                <span className="font-medium text-fg">★ {vehicle.owner.ratingAvg} ({vehicle.owner.ratingCount})</span>
              ) : (
                <span className="text-muted">{t('vehicles.noRating')}</span>
              )}
            </div>
          </div>

          <div className="rounded-[14px] border border-border bg-surface p-[18px] shadow-sm">
            <div className="mb-3.5 text-[14px] font-semibold">{t('vehicles.metrics')}</div>
            <div className="flex flex-col gap-2.5 text-[13px]">
              <div className="flex justify-between">
                <span className="text-fg-2">{t('vehicles.views')}</span>
                <span className="font-mono font-semibold">{formatNumber(vehicle.viewCount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fg-2">{t('vehicles.created')}</span>
                <span className="text-fg-2">{formatEpoch(vehicle.createdAt, i18n.language)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fg-2">{t('vehicles.status')}</span>
                <StatusPill active={vehicle.active} />
              </div>
              <div className="flex justify-between">
                <span className="text-fg-2">{t('vehicles.verification')}</span>
                <VerificationPill verified={vehicle.verified} />
              </div>
            </div>
          </div>

          <div className="rounded-[14px] border border-border bg-surface p-[18px] shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[14px] font-semibold">{t('vehicles.mediaFiles')}</div>
              <span className="font-mono text-[11px] text-muted">{mediaFiles.length}</span>
            </div>
            {mediaFiles.length === 0 ? (
              <div className="rounded-[10px] border border-dashed border-border-strong py-8 text-center text-[12.5px] text-muted">
                {t('vehicles.noMedia')}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {mediaFiles.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 rounded-[10px] border border-border p-2">
                    <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-2 text-muted">
                      {f.fileType === 'IMAGE' && f.fileUrl ? (
                        <img src={f.fileUrl} alt="" className="h-full w-full object-cover" />
                      ) : f.fileType === 'VIDEO' ? (
                        <Film size={16} />
                      ) : (
                        <ImageIcon size={16} />
                      )}
                      <span className="absolute left-0 top-0 rounded-br-lg bg-black/60 px-1.5 py-0.5 font-mono text-[9.5px] font-semibold leading-none text-white">
                        {f.orderNumber}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12px] font-medium">{f.originalFileName}</div>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span className="text-[11px] text-muted">
                          {t('vehicles.order')}: {f.orderNumber}
                        </span>
                        {f.primary && <Badge variant="accent">{t('media.primary')}</Badge>}
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteMedia(f.id, f.originalFileName)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-danger hover:bg-danger-soft"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
