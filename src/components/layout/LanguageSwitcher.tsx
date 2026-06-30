import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGS, changeLang, type Lang } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const active = i18n.language as Lang

  return (
    <div className="flex gap-[3px] rounded-[9px] border border-border bg-surface-2 p-[3px]">
      {SUPPORTED_LANGS.map((lng) => (
        <button
          key={lng}
          onClick={() => changeLang(lng)}
          className={cn(
            'cursor-pointer rounded-md px-[9px] py-1 text-[11.5px] font-semibold uppercase transition-colors',
            active === lng ? 'bg-accent text-accent-fg' : 'text-fg-2 hover:text-fg',
          )}
        >
          {lng}
        </button>
      ))}
    </div>
  )
}
