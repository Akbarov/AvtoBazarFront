import type { ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva('inline-flex items-center font-semibold whitespace-nowrap', {
  variants: {
    variant: {
      accent: 'bg-accent-soft text-accent',
      green: 'bg-green-soft text-green',
      neutral: 'bg-gray-pill text-gray-pill-fg',
      danger: 'bg-danger-soft text-danger',
      warn: 'bg-warn-soft text-warn',
    },
    shape: {
      pill: 'rounded-[20px] px-[10px] py-[3px] text-[10.5px]',
      tag: 'rounded-md px-2 py-[3px] text-[11.5px]',
    },
  },
  defaultVariants: { variant: 'neutral', shape: 'tag' },
})

export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: ReactNode
  className?: string
}

export function Badge({ variant, shape, className, children }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, shape }), className)}>{children}</span>
}
