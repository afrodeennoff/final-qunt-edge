import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-v2-sm border font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-accent focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-v2-border bg-v2-bg-surface text-v2-text-primary",
        secondary: "border-v2-border bg-v2-bg-elevated text-v2-text-secondary",
        outline: "border-v2-border bg-transparent text-v2-text-primary",
        destructive: "border-v2-error/30 bg-v2-error-subtle text-v2-error",
        accent: "border-v2-accent/30 bg-v2-accent-subtle text-v2-accent",
        success: "border-v2-success/30 bg-v2-success-subtle text-v2-success",
        warning: "border-v2-warning/30 bg-v2-warning-subtle text-v2-warning",
        error: "border-v2-error/30 bg-v2-error-subtle text-v2-error",
        // Resend-inspired variants with frost borders
        frost: "border-[var(--frost-border)] bg-transparent text-v2-text-primary",
        "frost-accent": "border-[var(--frost-border)] bg-[oklch(0.55_0.22_264/0.15)] text-[oklch(0.55_0.22_264)]",
        "frost-success": "border-[var(--frost-border)] bg-[oklch(0.55_0.15_166/0.15)] text-[oklch(0.55_0.15_166)]",
        "frost-warning": "border-[var(--frost-border)] bg-[oklch(0.65_0.2_45/0.15)] text-[oklch(0.65_0.2_45)]",
        "frost-error": "border-[var(--frost-border)] bg-[oklch(0.6_0.2_15/0.15)] text-[oklch(0.6_0.2_15)]",
        "frost-info": "border-[var(--frost-border)] bg-[oklch(0.55_0.12_220/0.15)] text-[oklch(0.55_0.12_220)]",
        // Pill variants (Resend signature)
        pill: "rounded-[9999px] border-[var(--frost-border)] bg-transparent text-v2-text-primary",
        "pill-accent": "rounded-[9999px] border-[var(--frost-border)] bg-[oklch(0.55_0.22_264/0.15)] text-[oklch(0.55_0.22_264)]",
        "pill-success": "rounded-[9999px] border-[var(--frost-border)] bg-[oklch(0.55_0.15_166/0.15)] text-[oklch(0.55_0.15_166)]",
        "pill-warning": "rounded-[9999px] border-[var(--frost-border)] bg-[oklch(0.65_0.2_45/0.15)] text-[oklch(0.65_0.2_45)]",
        "pill-error": "rounded-[9999px] border-[var(--frost-border)] bg-[oklch(0.6_0.2_15/0.15)] text-[oklch(0.6_0.2_15)]",
        "pill-info": "rounded-[9999px] border-[var(--frost-border)] bg-[oklch(0.55_0.12_220/0.15)] text-[oklch(0.55_0.12_220)]",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-sm",
        pill: "px-2.5 py-0.5 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
}

export { Badge, Badge as BadgeV2, badgeVariants }
