import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'type-label inline-flex items-center justify-center gap-1 rounded-full border transition-[background-color,border-color,color] duration-120',
  {
    variants: {
      variant: {
        default: 'border-[oklch(0.65_0.22_260/0.15)] bg-[oklch(0.65_0.22_260/0.06)] text-[oklch(0.65_0.22_260)]',
        secondary: 'border-[oklch(0.65_0.22_260/0.06)] bg-[oklch(0.65_0.22_260/0.02)] text-muted-foreground',
        outline: 'border-[oklch(0.65_0.22_260/0.1)] bg-transparent text-foreground',
        destructive: 'border-destructive/20 bg-destructive/6 text-destructive',
        accent: 'border-[oklch(0.65_0.22_260/0.12)] bg-[oklch(0.65_0.22_260/0.04)] text-[oklch(0.65_0.22_260)]',
        success: 'border-success/20 bg-success/6 text-success',
        warning: 'border-warning/20 bg-warning/6 text-warning',
        error: 'border-destructive/20 bg-destructive/6 text-destructive',
        frost: 'border-[oklch(0.65_0.22_260/0.06)] bg-[oklch(0.65_0.22_260/0.015)] text-foreground',
        'frost-accent': 'border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.02)] text-[oklch(0.65_0.22_260)]',
        'frost-success': 'border-success/15 bg-success/4 text-success',
        'frost-warning': 'border-warning/15 bg-warning/4 text-warning',
        'frost-error': 'border-destructive/15 bg-destructive/4 text-destructive',
        'frost-info': 'border-[oklch(0.65_0.22_260/0.1)] bg-[oklch(0.65_0.22_260/0.03)] text-[oklch(0.65_0.22_260)]',
        pill: 'border-[oklch(0.65_0.22_260/0.08)] bg-transparent text-foreground',
        'pill-accent': 'border-[oklch(0.65_0.22_260/0.1)] bg-[oklch(0.65_0.22_260/0.02)] text-[oklch(0.65_0.22_260)]',
        'pill-success': 'border-success/15 bg-success/3 text-success',
        'pill-warning': 'border-warning/15 bg-warning/3 text-warning',
        'pill-error': 'border-destructive/15 bg-destructive/3 text-destructive',
        'pill-info': 'border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.015)] text-[oklch(0.65_0.22_260)]',
      },
      size: {
        sm: 'h-5 px-2 py-0 text-[10px]',
        md: 'h-6 px-2 py-0.5 text-xs',
        pill: 'h-6 px-2.5 py-0.5 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
}

export { Badge, Badge as BadgeV2, badgeVariants }
