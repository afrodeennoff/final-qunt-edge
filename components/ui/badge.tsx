import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] [&>svg]:size-3 pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        // Resend-inspired variants
        pill: "border-[var(--frost-border)] bg-transparent text-v2-text-primary rounded-[9999px]",
        "pill-accent": "border-[var(--frost-border)] bg-[oklch(0.55_0.22_264/0.15)] text-[oklch(0.55_0.22_264)] rounded-[9999px]",
        "pill-success": "border-[var(--frost-border)] bg-[oklch(0.55_0.15_166/0.15)] text-[oklch(0.55_0.15_166)] rounded-[9999px]",
        "pill-warning": "border-[var(--frost-border)] bg-[oklch(0.65_0.2_45/0.15)] text-[oklch(0.65_0.2_45)] rounded-[9999px]",
        "pill-error": "border-[var(--frost-border)] bg-[oklch(0.6_0.2_15/0.15)] text-[oklch(0.6_0.2_15)] rounded-[9999px]",
        "pill-info": "border-[var(--frost-border)] bg-[oklch(0.55_0.12_220/0.15)] text-[oklch(0.55_0.12_220)] rounded-[9999px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
