import { useMemo } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

const SECTION_TITLE: Record<string, string> = {
  dashboard: 'nav.dashboard',
  vehicles: 'nav.vehicles',
  users: 'nav.users',
  experts: 'nav.experts',
  brands: 'nav.brands',
  models: 'nav.models',
  soato: 'nav.soato',
}

export function AppShell() {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  const title = useMemo(() => {
    const section = pathname.split('/')[1] ?? 'dashboard'
    return t(SECTION_TITLE[section] ?? 'nav.dashboard')
  }, [pathname, t])

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} />
        <main className="min-w-0 flex-1 px-7 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
