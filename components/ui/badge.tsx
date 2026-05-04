import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-md font-medium tracking-[0.01em] transition-[background-color,border-color,color] duration-[130ms]",
  {
    variants: {
      variant: {
        default: "border border-border/50 bg-muted/60 text-foreground/85",
        secondary:
          "border border-border/40 bg-muted/40 text-muted-foreground",
        outline: "border border-border/60 bg-transparent text-foreground/80",
        destructive: "border border-destructive/25 bg-destructive/10 text-destructive",
        accent: "border border-primary/25 bg-primary/12 text-primary",
        success: "border border-success/25 bg-success/10 text-success",
        warning: "border border-warning/25 bg-warning/10 text-warning",
        error: "border border-destructive/25 bg-destructive/10 text-destructive",
        frost:
          'border border-border/50 bg-card/80 text-foreground',
        'frost-accent': "border border-primary/25 bg-primary/12 text-primary",
        'frost-success': "border border-success/25 bg-success/10 text-success",
        'frost-warning': "border border-warning/25 bg-warning/10 text-warning",
        'frost-error': "border border-destructive/25 bg-destructive/10 text-destructive",
        'frost-info': 'border-primary/16 bg-primary/10 text-primary',
        pill: 'border border-border/60 bg-transparent text-foreground shadow-none',
        'pill-accent': 'border-accent/16 bg-accent/10 text-accent-foreground',
        'pill-success': 'border-success/16 bg-success/10 text-success',
        'pill-warning': 'border-warning/16 bg-warning/10 text-warning',
        'pill-error': 'border-destructive/16 bg-destructive/10 text-destructive',
        'pill-info': 'border-primary/16 bg-primary/10 text-primary',
      },
      size: {
        sm: 'h-5 px-2 py-0 text-[11px]',
        md: 'h-6 px-2.5 py-0.5 text-[11px]',
        pill: 'h-6 px-2.5 py-0.5 text-[11px]',
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
