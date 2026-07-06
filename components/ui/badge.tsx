import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'type-label inline-flex items-center justify-center gap-1 rounded-full border transition-[background-color,border-color,color] duration-120',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-muted text-muted-foreground',
        secondary: 'border-transparent bg-muted text-muted-foreground',
        outline: 'border-transparent bg-transparent text-foreground',
        destructive: 'border-destructive/30 bg-destructive/10 text-destructive',
        accent: 'border-primary/30 bg-primary/10 text-primary',
        success: 'border-success/30 bg-success/10 text-success',
        warning: 'border-warning/30 bg-warning/10 text-warning',
        error: 'border-destructive/30 bg-destructive/10 text-destructive',
        pill: 'border-transparent bg-transparent text-foreground rounded-full',
        'pill-success': 'border-success/30 bg-success/10 text-success rounded-full',
        'pill-warning': 'border-warning/30 bg-warning/10 text-warning rounded-full',
        'pill-error': 'border-destructive/30 bg-destructive/10 text-destructive rounded-full',
        'frost-info': 'border-primary/30 bg-primary/10 text-primary',
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
