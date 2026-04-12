import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[hsl(var(--ring))] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        // New unified variants (recommended)
        solid: "border border-[hsl(var(--primary)/0.35)] bg-[linear-gradient(135deg,hsl(var(--primary))_0%,hsl(var(--chart-2))_100%)] text-v2-accent-foreground shadow-[0_18px_42px_-20px_hsl(var(--primary)/0.55)] hover:-translate-y-px hover:brightness-110 hover:shadow-[0_24px_54px_-22px_hsl(var(--primary)/0.62)] active:translate-y-0 active:scale-[0.985]",
        outline: "border border-[hsl(var(--v2-border)/0.9)] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] text-v2-text-primary backdrop-blur-md hover:-translate-y-px hover:border-[hsl(var(--v2-border)/1)] hover:bg-[rgba(255,255,255,0.08)] active:translate-y-0 active:scale-[0.985]",
        ghost: "text-v2-text-secondary hover:text-v2-text-primary hover:bg-[rgba(255,255,255,0.08)]",
        error: "border border-[hsl(var(--destructive)/0.3)] bg-[linear-gradient(135deg,hsl(var(--destructive))_0%,rgb(244_114_182)_100%)] text-v2-accent-foreground shadow-[0_18px_42px_-20px_hsl(var(--destructive)/0.5)] hover:-translate-y-px hover:brightness-105 active:translate-y-0 active:scale-[0.985]",
        destructive: "border border-[hsl(var(--destructive)/0.3)] bg-[linear-gradient(135deg,hsl(var(--destructive))_0%,rgb(244_114_182)_100%)] text-v2-accent-foreground shadow-[0_18px_42px_-20px_hsl(var(--destructive)/0.5)] hover:-translate-y-px hover:brightness-105 active:translate-y-0 active:scale-[0.985]",
        link: "text-v2-accent underline-offset-4 hover:underline",
        "gradient-primary": "border border-white/10 bg-[linear-gradient(135deg,hsl(var(--primary))_0%,rgb(168_85_247)_52%,rgb(34_211_238)_100%)] text-v2-accent-foreground shadow-[0_20px_50px_-22px_rgba(67,97,255,0.65)] hover:-translate-y-px hover:brightness-110 active:translate-y-0 active:scale-[0.985]",
        "gradient-secondary": "border border-[hsl(var(--v2-border)/0.9)] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] text-v2-text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:-translate-y-px hover:border-[hsl(var(--v2-border)/1)] active:translate-y-0 active:scale-[0.985]",
        shimmer: "border border-[hsl(var(--primary)/0.35)] bg-[linear-gradient(135deg,hsl(var(--primary))_0%,hsl(var(--chart-2))_100%)] text-v2-accent-foreground shadow-[0_18px_42px_-20px_hsl(var(--primary)/0.55)]",
        // Legacy variants for backward compatibility (mapped to new variants)
        default: "border border-[hsl(var(--primary)/0.35)] bg-[linear-gradient(135deg,hsl(var(--primary))_0%,hsl(var(--chart-2))_100%)] text-v2-accent-foreground shadow-[0_18px_42px_-20px_hsl(var(--primary)/0.55)] hover:-translate-y-px hover:brightness-110 active:translate-y-0 active:scale-[0.985]",
        secondary: "border border-[hsl(var(--v2-border)/0.8)] bg-[linear-gradient(180deg,hsl(var(--v2-bg-hover)/0.94),hsl(var(--v2-bg-surface)/0.9))] text-v2-text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:-translate-y-px hover:border-[hsl(var(--v2-border)/1)] hover:bg-[linear-gradient(180deg,hsl(var(--v2-bg-active)/0.96),hsl(var(--v2-bg-hover)/0.92))] active:translate-y-0 active:scale-[0.985]",
        mono: "rounded-lg border border-[hsl(var(--v2-border)/0.92)] bg-[hsl(var(--v2-bg-surface)/0.92)] font-mono text-xs text-v2-text-primary hover:bg-[hsl(var(--v2-bg-hover)/0.92)] focus-visible:ring-offset-0",

        // Resend-inspired pill variants
        pill: "rounded-full border border-[hsl(var(--v2-border)/0.88)] bg-[rgba(255,255,255,0.03)] text-v2-text-primary hover:-translate-y-px hover:border-[hsl(var(--primary)/0.45)] hover:bg-[hsl(var(--primary)/0.08)] hover:text-v2-accent active:translate-y-0 active:scale-[0.985]",
        "pill-solid": "rounded-full border border-[hsl(var(--primary)/0.35)] bg-[linear-gradient(135deg,hsl(var(--primary))_0%,hsl(var(--chart-2))_100%)] text-v2-accent-foreground shadow-[0_16px_40px_-20px_hsl(var(--primary)/0.55)] hover:-translate-y-px hover:brightness-110 active:translate-y-0 active:scale-[0.985]",
        "pill-ghost": "rounded-full bg-transparent text-v2-text-secondary hover:bg-[rgba(255,255,255,0.08)] hover:text-v2-text-primary active:scale-[0.985]",
      },
      size: {
        sm: "h-8 min-h-[32px] min-w-[32px] px-3 text-xs",
        default: "h-10 min-h-[40px] min-w-[40px] px-4 text-sm",
        md: "h-11 min-h-[44px] min-w-[44px] px-[var(--space-4)] py-[var(--space-2)]",
        lg: "h-12 min-h-[48px] min-w-[48px] px-6 text-base",
        icon: "h-10 w-10 min-h-[40px] min-w-[40px] px-0 hover:bg-v2-bg-hover hover:shadow-md",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isShimmer = variant === "shimmer"
    
    const content = (
      <>
        {isShimmer && isLoading && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-v2-accent-foreground/20 to-transparent" />
          </div>
        )}
        {leftIcon && !isLoading && <span className="shrink-0">{leftIcon}</span>}
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            <span>{loadingText ?? children}</span>
          </>
        ) : (
          children
        )}
        {rightIcon && !isLoading && <span className="shrink-0">{rightIcon}</span>}
      </>
    )

    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          <span className="inline-flex items-center justify-center gap-2">
            {content}
          </span>
        </Slot>
      )
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || disabled}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {content}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

// For backward compatibility: ButtonV2 is an alias for Button
export { Button as ButtonV2 }
