import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'type-label inline-flex items-center justify-center gap-1 rounded-full border transition-[background-color,border-color,color,box-shadow] duration-150',
  {
    variants: {
      variant: {
        default: 'border-primary/18 bg-primary/8 text-primary',
        secondary: 'border-border/40 bg-background/50 text-muted-foreground',
        outline: 'border-border/50 bg-transparent text-foreground',
        destructive: 'border-destructive/18 bg-destructive/8 text-destructive',
        accent: 'border-accent/20 bg-accent/8 text-accent-foreground',
        success: 'border-success/18 bg-success/8 text-success',
        warning: 'border-warning/18 bg-warning/8 text-warning',
        error: 'border-destructive/18 bg-destructive/8 text-destructive',
        frost: 'border-border/40 bg-background/40 text-foreground',
        'frost-accent': 'border-accent/20 bg-accent/8 text-accent-foreground',
        'frost-success': 'border-success/18 bg-success/8 text-success',
        'frost-warning': 'border-warning/18 bg-warning/8 text-warning',
        'frost-error': 'border-destructive/18 bg-destructive/8 text-destructive',
        'frost-info': 'border-primary/18 bg-primary/8 text-primary',
        pill: 'border-border/40 bg-transparent text-foreground',
        'pill-accent': 'border-accent/20 bg-accent/8 text-accent-foreground',
        'pill-success': 'border-success/18 bg-success/8 text-success',
        'pill-warning': 'border-warning/18 bg-warning/8 text-warning',
        'pill-error': 'border-destructive/18 bg-destructive/8 text-destructive',
        'pill-info': 'border-primary/18 bg-primary/8 text-primary',
      },
      size: {
        sm: 'h-5 px-2 py-0',
        md: 'h-6 px-2.5 py-0.5',
        pill: 'h-6 px-2.5 py-0.5',
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
