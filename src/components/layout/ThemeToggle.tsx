import { Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/lib/theme/ThemeContext'

export function ThemeToggle() {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const Icon = theme === 'dark' ? Sun : Moon
  return (
    <button
      onClick={toggleTheme}
      title={t('common.toggleTheme')}
      aria-label={t('common.toggleTheme')}
      className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] border border-border bg-surface-2 text-fg-2 hover:text-fg"
    >
      <Icon size={17} strokeWidth={2} />
    </button>
  )
}
