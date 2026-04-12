import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-full border font-medium uppercase tracking-[0.1em] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-accent focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-[hsl(var(--v2-border)/0.72)] bg-[rgba(255,255,255,0.04)] text-v2-text-primary",
        secondary: "border-[hsl(var(--v2-border)/0.72)] bg-[rgba(255,255,255,0.03)] text-v2-text-secondary",
        outline: "border-[hsl(var(--v2-border)/0.9)] bg-transparent text-v2-text-primary",
        destructive: "border-[hsl(var(--v2-error)/0.22)] bg-[hsl(var(--v2-error)/0.12)] text-v2-error",
        accent: "border-[hsl(var(--v2-accent)/0.22)] bg-[hsl(var(--v2-accent)/0.14)] text-v2-accent",
        success: "border-[hsl(var(--v2-success)/0.22)] bg-[hsl(var(--v2-success)/0.12)] text-v2-success",
        warning: "border-[hsl(var(--v2-warning)/0.22)] bg-[hsl(var(--v2-warning)/0.12)] text-v2-warning",
        error: "border-[hsl(var(--v2-error)/0.22)] bg-[hsl(var(--v2-error)/0.12)] text-v2-error",
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
        sm: "px-2 py-0.5 text-[0.6rem]",
        md: "px-2.5 py-1 text-[0.68rem]",
        pill: "px-2.5 py-0.5 text-[0.62rem]",
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
