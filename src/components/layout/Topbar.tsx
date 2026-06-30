import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeToggle } from './ThemeToggle'
import { AdminMenu } from './AdminMenu'

export function Topbar({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-[60px] flex-shrink-0 items-center justify-between border-b border-border bg-surface px-6">
      <div className="text-[13px] font-medium text-fg">{title}</div>
      <div className="flex items-center gap-[14px]">
        <LanguageSwitcher />
        <ThemeToggle />
        <div className="h-6 w-px bg-border" />
        <AdminMenu />
      </div>
    </header>
  )
}
