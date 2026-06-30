import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Car,
  CarFront,
  Image as ImageIcon,
  LayoutDashboard,
  MapPin,
  Tag,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  icon: LucideIcon
  key: string
}

const NAV: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, key: 'nav.dashboard' },
  { to: '/vehicles', icon: Car, key: 'nav.vehicles' },
  { to: '/users', icon: Users, key: 'nav.users' },
  { to: '/brands', icon: Tag, key: 'nav.brands' },
  { to: '/models', icon: CarFront, key: 'nav.models' },
  { to: '/soato', icon: MapPin, key: 'nav.soato' },
  { to: '/media', icon: ImageIcon, key: 'nav.media' },
]

export function Sidebar() {
  const { t } = useTranslation()
  return (
    <aside className="sticky top-0 flex h-screen w-[236px] flex-shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center gap-[11px] px-[18px] pb-4 pt-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-accent text-white">
          <Car size={21} strokeWidth={2} />
        </div>
        <div>
          <div className="text-[15px] font-bold tracking-tight text-sidebar-fg-strong">AvtoBazar</div>
          <div className="text-[9.5px] font-semibold tracking-[0.18em] text-accent">ADMIN</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-[2px] px-3 py-2">
        {NAV.map(({ to, icon: Icon, key }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-[11px] rounded-[9px] px-[11px] py-[9px] text-[13px] transition-colors',
                isActive
                  ? 'bg-accent font-semibold text-accent-fg'
                  : 'font-medium text-sidebar-fg hover:bg-sidebar-2 hover:text-sidebar-fg-strong',
              )
            }
          >
            <Icon size={18} strokeWidth={2} />
            <span>{t(key)}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-[18px] py-[14px] text-[11px] leading-relaxed text-sidebar-fg">
        <div className="flex items-center gap-[7px]">
          <span className="h-[7px] w-[7px] rounded-full bg-green" />
          {t('common.apiConnected')} · :8090
        </div>
        <div className="mt-[3px] opacity-70">{t('common.adminScope')}</div>
      </div>
    </aside>
  )
}
