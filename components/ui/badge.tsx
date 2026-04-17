import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'type-label inline-flex items-center justify-center gap-1 rounded-full border transition-[background-color,border-color,color] duration-150',
  {
    variants: {
      variant: {
        default: 'border-primary/22 bg-primary/10 text-primary',
        secondary: 'border-border/50 bg-background/70 text-muted-foreground',
        outline: 'border-border/60 bg-transparent text-foreground',
        destructive: 'border-destructive/22 bg-destructive/10 text-destructive',
        accent: 'border-accent/24 bg-accent/10 text-accent-foreground',
        success: 'border-success/22 bg-success/10 text-success',
        warning: 'border-warning/22 bg-warning/10 text-warning',
        error: 'border-destructive/22 bg-destructive/10 text-destructive',
        frost: 'border-border/50 bg-background/60 text-foreground',
        'frost-accent': 'border-accent/24 bg-accent/10 text-accent-foreground',
        'frost-success': 'border-success/22 bg-success/10 text-success',
        'frost-warning': 'border-warning/22 bg-warning/10 text-warning',
        'frost-error': 'border-destructive/22 bg-destructive/10 text-destructive',
        'frost-info': 'border-primary/22 bg-primary/10 text-primary',
        pill: 'border-border/50 bg-transparent text-foreground',
        'pill-accent': 'border-accent/24 bg-accent/10 text-accent-foreground',
        'pill-success': 'border-success/22 bg-success/10 text-success',
        'pill-warning': 'border-warning/22 bg-warning/10 text-warning',
        'pill-error': 'border-destructive/22 bg-destructive/10 text-destructive',
        'pill-info': 'border-primary/22 bg-primary/10 text-primary',
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
