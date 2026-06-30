import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[]
  placeholder?: string
  invalid?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, invalid, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'h-[38px] cursor-pointer rounded-[9px] border bg-surface px-2.5 text-[13px] text-fg outline-none focus:border-accent',
        invalid ? 'border-danger' : 'border-border-strong',
        className,
      )}
      {...props}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
)
Select.displayName = 'Select'
