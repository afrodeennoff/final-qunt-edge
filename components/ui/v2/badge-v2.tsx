import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeV2Variants = cva(
  "inline-flex items-center justify-center gap-1 rounded-v2-sm border font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-accent focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-v2-border bg-v2-bg-surface text-v2-text-primary",
        secondary: "border-v2-border bg-v2-bg-elevated text-v2-text-secondary",
        outline: "border-v2-border bg-transparent text-v2-text-primary",
        accent: "border-v2-accent/30 bg-v2-accent-subtle text-v2-accent",
        success: "border-v2-success/30 bg-v2-success-subtle text-v2-success",
        warning: "border-v2-warning/30 bg-v2-warning-subtle text-v2-warning",
        error: "border-v2-error/30 bg-v2-error-subtle text-v2-error",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface BadgeV2Props extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeV2Variants> {}

function BadgeV2({ className, variant, size, ...props }: BadgeV2Props) {
  return <div className={cn(badgeV2Variants({ variant, size }), className)} {...props} />
}

export { BadgeV2, badgeV2Variants }
