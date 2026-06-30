import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'

export interface TrilingualValue {
  nameUz: string
  nameRu: string
  nameEn: string
}

interface Props {
  value: TrilingualValue
  onChange: (value: TrilingualValue) => void
  errorUz?: string
}

const ROWS: { lang: keyof TrilingualValue; label: string; required: boolean }[] = [
  { lang: 'nameUz', label: 'UZ*', required: true },
  { lang: 'nameRu', label: 'RU', required: false },
  { lang: 'nameEn', label: 'EN', required: false },
]

export function TrilingualNameField({ value, onChange, errorUz }: Props) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-[10px]">
      {ROWS.map(({ lang, label, required }) => (
        <div key={lang}>
          <div className="flex items-center gap-[9px]">
            <span
              className={
                'w-[34px] flex-shrink-0 font-mono text-[10.5px] font-bold ' +
                (required ? 'text-accent' : 'text-muted')
              }
            >
              {label}
            </span>
            <Input
              value={value[lang]}
              onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
              placeholder={required ? t('common.required') : t('common.optional')}
              invalid={required && !!errorUz}
            />
          </div>
          {lang === 'nameUz' && errorUz && (
            <div className="ml-[43px] mt-1.5 text-[11.5px] text-danger">{errorUz}</div>
          )}
        </div>
      ))}
    </div>
  )
}
