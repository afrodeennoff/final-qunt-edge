import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-[5px] font-medium tracking-[0.01em] transition-[background-color,border-color,color] duration-[130ms]",
  {
    variants: {
      variant: {
        default: "border border-[oklch(0.65_0.22_260_/_0.12)] bg-[oklch(0.65_0.22_260_/_0.08)] text-foreground/85",
        secondary:
          "border border-[oklch(0.65_0.22_260_/_0.08)] bg-[oklch(0.65_0.22_260_/_0.05)] text-muted-foreground",
        outline: "border border-[oklch(0.65_0.22_260_/_0.14)] bg-transparent text-foreground/80",
        destructive: "border border-[oklch(0.65_0.22_22_/_0.25)] bg-[oklch(0.65_0.22_22_/_0.10)] text-[oklch(0.70_0.20_22)]",
        accent: "border border-[oklch(0.62_0.22_290_/_0.25)] bg-[oklch(0.62_0.22_290_/_0.12)] text-[oklch(0.80_0.14_290)]",
        success: "border border-[oklch(0.78_0.18_155_/_0.25)] bg-[oklch(0.78_0.18_155_/_0.10)] text-[oklch(0.82_0.16_155)]",
        warning: "border border-[oklch(0.80_0.18_75_/_0.25)] bg-[oklch(0.80_0.18_75_/_0.10)] text-[oklch(0.84_0.16_75)]",
        error: "border border-[oklch(0.65_0.22_22_/_0.25)] bg-[oklch(0.65_0.22_22_/_0.10)] text-[oklch(0.70_0.20_22)]",
        frost:
          'border-[oklch(0.65_0.22_260_/_0.12)] bg-[oklch(0.058_0.011_260_/_0.8)] text-foreground',
        'frost-accent': "border border-[oklch(0.62_0.22_290_/_0.25)] bg-[oklch(0.62_0.22_290_/_0.12)] text-[oklch(0.80_0.14_290)]",
        'frost-success': "border border-[oklch(0.78_0.18_155_/_0.25)] bg-[oklch(0.78_0.18_155_/_0.10)] text-[oklch(0.82_0.16_155)]",
        'frost-warning': "border border-[oklch(0.80_0.18_75_/_0.25)] bg-[oklch(0.80_0.18_75_/_0.10)] text-[oklch(0.84_0.16_75)]",
        'frost-error': "border border-[oklch(0.65_0.22_22_/_0.25)] bg-[oklch(0.65_0.22_22_/_0.10)] text-[oklch(0.70_0.20_22)]",
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
