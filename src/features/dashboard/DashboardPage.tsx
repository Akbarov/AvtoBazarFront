import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '@/lib/hooks/useDocumentTitle'
import { useQuery } from '@tanstack/react-query'
import { Car, CarFront, Check, Image as ImageIcon, MapPin, Tag, Users, X, type LucideIcon } from 'lucide-react'
import { vehiclesApi } from '@/lib/api/resources/vehicles'
import { usersApi } from '@/lib/api/resources/users'
import { brandsApi } from '@/lib/api/resources/brands'
import { modelsApi } from '@/lib/api/resources/models'
import { soatoApi } from '@/lib/api/resources/soato'
import { mediaApi } from '@/lib/api/resources/media'
import { countOnly, criteria, pageable } from '@/lib/api/pageable'
import { StatusPill } from '@/components/common/StatusPill'
import { formatNumber, formatPrice } from '@/lib/utils'

function useCount(key: string, fetcher: () => Promise<{ meta: { totalItems: number } }>) {
  const q = useQuery({ queryKey: ['count', key], queryFn: fetcher })
  return q.data?.meta.totalItems
}

function Kpi({ icon: Icon, value, label }: { icon: LucideIcon; value: number | undefined; label: string }) {
  return (
    <div className="rounded-[14px] border border-border bg-surface p-[17px] shadow-sm">
      <div className="mb-3 flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-accent-soft text-accent">
        <Icon size={18} />
      </div>
      <div className="font-mono text-[27px] font-bold tracking-tight">
        {value === undefined ? '—' : formatNumber(value)}
      </div>
      <div className="mt-0.5 text-[12.5px] text-fg-2">{label}</div>
    </div>
  )
}

export function DashboardPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('dashboard.title'))
  const navigate = useNavigate()

  const totalVehicles = useCount('vehicles', () => vehiclesApi.pageable(countOnly()))
  const activeVehicles = useCount('vehicles-active', () => vehiclesApi.pageable(countOnly([criteria('active', '=', true)])))
  const inactiveVehicles = useCount('vehicles-inactive', () => vehiclesApi.pageable(countOnly([criteria('active', '=', false)])))
  const users = useCount('users', () => usersApi.pageable(countOnly()))
  const brands = useCount('brands', () => brandsApi.pageable(countOnly()))
  const models = useCount('models', () => modelsApi.pageable(countOnly()))
  const regions = useCount('soato', () => soatoApi.pageable(countOnly()))
  const media = useCount('media', () => mediaApi.pageable(countOnly()))

  const recent = useQuery({
    queryKey: ['recent-vehicles'],
    queryFn: () => vehiclesApi.pageable(pageable({ page: 1, perPage: 5, sort: { key: 'created_at', direction: 'DESC' } })),
  })

  const active = activeVehicles ?? 0
  const inactive = inactiveVehicles ?? 0
  const activePct = active + inactive > 0 ? Math.round((active / (active + inactive)) * 100) : 0

  const kpis = [
    { icon: Car, value: totalVehicles, label: t('dashboard.totalListings') },
    { icon: Check, value: activeVehicles, label: t('dashboard.activeListings') },
    { icon: X, value: inactiveVehicles, label: t('dashboard.unpublishedListings') },
    { icon: Users, value: users, label: t('dashboard.users') },
    { icon: Tag, value: brands, label: t('dashboard.brands') },
    { icon: CarFront, value: models, label: t('dashboard.models') },
    { icon: MapPin, value: regions, label: t('dashboard.regions') },
    { icon: ImageIcon, value: media, label: t('dashboard.mediaFiles') },
  ]

  return (
    <div>
      <div className="mb-[3px] text-[22px] font-bold tracking-tight">{t('dashboard.title')}</div>
      <div className="mb-[22px] text-fg-2">{t('dashboard.subtitle')}</div>

      <div className="mb-3.5 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {kpis.map((k) => (
          <Kpi key={k.label} icon={k.icon} value={k.value} label={k.label} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[1.6fr_1fr]">
        <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-[18px] py-[15px]">
            <div className="text-[14px] font-semibold">{t('dashboard.recentListings')}</div>
            <button onClick={() => navigate('/vehicles')} className="text-[12px] font-medium text-accent">
              {t('dashboard.viewAll')} →
            </button>
          </div>
          <div>
            {(recent.data?.content ?? []).map((v) => (
              <div
                key={v.id}
                onClick={() => navigate(`/vehicles/${v.id}`)}
                className="flex cursor-pointer items-center gap-3.5 border-b border-border px-[18px] py-3 hover:bg-surface-2"
              >
                <div className="flex h-9 w-[46px] flex-shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-muted">
                  <Car size={18} strokeWidth={1.6} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold">
                    {v.brandName} {v.modelName}
                  </div>
                  <div className="text-[11.5px] text-muted">{v.year}</div>
                </div>
                <div className="font-mono text-[13px] font-semibold">{formatPrice(v.price, v.currency)}</div>
                <StatusPill active={v.active} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[14px] border border-border bg-surface p-[18px] shadow-sm">
          <div className="mb-4 text-[14px] font-semibold">{t('dashboard.listingStatus')}</div>
          <div className="mb-4 flex h-[13px] overflow-hidden rounded-[7px] bg-gray-pill">
            <div className="bg-green" style={{ width: `${activePct}%` }} />
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-[9px] w-[9px] rounded-sm bg-green" />
                <span className="text-fg-2">{t('dashboard.active')}</span>
              </div>
              <span className="font-mono font-semibold">{formatNumber(active)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-[9px] w-[9px] rounded-sm bg-gray-pill-fg" />
                <span className="text-fg-2">{t('dashboard.unpublished')}</span>
              </div>
              <span className="font-mono font-semibold">{formatNumber(inactive)}</span>
            </div>
          </div>
          <div className="mt-[18px] border-t border-border pt-4 text-[11.5px] leading-relaxed text-muted">
            {t('dashboard.noTimeSeries')}
          </div>
        </div>
      </div>
    </div>
  )
}
