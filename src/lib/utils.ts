import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function initials(fullName?: string | null): string {
  if (!fullName) return '?'
  const parts = fullName.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?'
}

/** epoch millis -> localized date-time string */
export function formatEpoch(ms?: number | null, locale = 'ru'): string {
  if (!ms) return '—'
  return new Intl.DateTimeFormat(locale === 'uz' ? 'uz-UZ' : locale === 'en' ? 'en-US' : 'ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ms))
}

export function formatPrice(price?: number | null, currency?: string | null): string {
  if (price == null) return '—'
  const grouped = new Intl.NumberFormat('ru-RU').format(price)
  return currency ? `${grouped} ${currency}` : grouped
}

/** bytes -> human-readable size (e.g. "2.3 MB") */
export function formatFileSize(bytes?: number | null): string {
  if (bytes == null) return '—'
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let i = 0
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i++
  }
  return `${value.toFixed(1)} ${units[i]}`
}

/** group a number with thousands separators */
export function formatNumber(value?: number | null): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('ru-RU').format(value)
}

/** camelCase -> snake_case (to match backend field names) */
export function toSnakeCase(value: string): string {
  return value.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`)
}

/** snake_case -> camelCase (maps validations[].key back to form fields) */
export function toCamelCase(value: string): string {
  return value.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
}
