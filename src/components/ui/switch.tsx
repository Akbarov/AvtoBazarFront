import { cn } from '@/lib/utils'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  id?: string
}

export function Switch({ checked, onChange, id }: SwitchProps) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-[22px] w-[38px] flex-shrink-0 overflow-hidden rounded-full transition-colors',
        checked ? 'bg-accent' : 'bg-border-strong',
      )}
    >
      <span
        className={cn(
          'absolute left-[2px] top-[2px] h-[18px] w-[18px] rounded-full bg-white transition-transform',
          checked ? 'translate-x-[16px]' : 'translate-x-0',
        )}
      />
    </button>
  )
}
