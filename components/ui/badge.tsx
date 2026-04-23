import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'type-label inline-flex items-center justify-center gap-1 rounded-full border transition-[background-color,border-color,color,box-shadow] duration-150 shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.04)]',
  {
    variants: {
      variant: {
        default: 'border-primary/16 bg-primary/10 text-primary',
        secondary:
          'border-[oklch(0.65_0.22_260_/_0.12)] bg-[oklch(0.058_0.011_260_/_0.8)] text-muted-foreground',
        outline: 'border-[oklch(0.65_0.22_260_/_0.14)] bg-transparent text-foreground shadow-none',
        destructive: 'border-destructive/16 bg-destructive/10 text-destructive',
        accent: 'border-accent/16 bg-accent/10 text-accent-foreground',
        success: 'border-success/16 bg-success/10 text-success',
        warning: 'border-warning/16 bg-warning/10 text-warning',
        error: 'border-destructive/16 bg-destructive/10 text-destructive',
        frost:
          'border-[oklch(0.65_0.22_260_/_0.12)] bg-[oklch(0.058_0.011_260_/_0.8)] text-foreground',
        'frost-accent': 'border-accent/16 bg-accent/10 text-accent-foreground',
        'frost-success': 'border-success/16 bg-success/10 text-success',
        'frost-warning': 'border-warning/16 bg-warning/10 text-warning',
        'frost-error': 'border-destructive/16 bg-destructive/10 text-destructive',
        'frost-info': 'border-primary/16 bg-primary/10 text-primary',
        pill: 'border-[oklch(0.65_0.22_260_/_0.14)] bg-transparent text-foreground shadow-none',
        'pill-accent': 'border-accent/16 bg-accent/10 text-accent-foreground',
        'pill-success': 'border-success/16 bg-success/10 text-success',
        'pill-warning': 'border-warning/16 bg-warning/10 text-warning',
        'pill-error': 'border-destructive/16 bg-destructive/10 text-destructive',
        'pill-info': 'border-primary/16 bg-primary/10 text-primary',
      },
      size: {
        sm: 'h-5 px-2 py-0',
        md: 'h-6 px-2.5 py-0.5',
        pill: 'h-5 px-2.5 py-0',
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
