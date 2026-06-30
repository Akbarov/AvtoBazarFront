import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-[9px] border bg-surface px-3 text-[13px] text-fg outline-none transition-colors',
        'placeholder:text-muted focus:border-accent',
        invalid ? 'border-danger' : 'border-border-strong',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
