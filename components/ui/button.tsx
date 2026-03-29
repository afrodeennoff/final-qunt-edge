import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-v2-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[hsl(var(--ring))] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        // New unified variants (recommended)
        solid: "bg-v2-accent text-v2-accent-foreground shadow-sm hover:bg-v2-accent-hover hover:scale-[1.01] hover:shadow-md hover:shadow-v2-accent/20 active:scale-[0.98]",
        outline: "border border-v2-border bg-v2-bg-base text-v2-text-primary hover:bg-v2-bg-hover hover:scale-[1.01] active:scale-[0.98]",
        ghost: "text-v2-text-secondary hover:text-v2-text-primary hover:bg-v2-bg-hover",
        destructive: "bg-v2-error text-v2-accent-foreground hover:bg-v2-error/90 shadow-sm hover:scale-[1.01] hover:shadow-md hover:shadow-v2-error/20 active:scale-[0.98]",
        link: "text-v2-accent underline-offset-4 hover:underline",
        "gradient-primary": "bg-gradient-to-r from-v2-accent via-v2-accent/90 to-v2-accent-hover text-v2-accent-foreground shadow-sm hover:shadow-lg hover:shadow-v2-accent/30 hover:scale-[1.01] active:scale-[0.98]",
        "gradient-secondary": "bg-gradient-to-r from-v2-bg-surface to-v2-bg-hover border border-v2-border text-v2-text-primary shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.98]",
        shimmer: "bg-v2-accent text-v2-accent-foreground shadow-sm",
        // Legacy variants for backward compatibility (mapped to new variants)
        default: "bg-v2-accent text-v2-accent-foreground shadow-sm hover:bg-v2-accent-hover hover:scale-[1.01] active:scale-[0.98]",
        secondary: "bg-v2-bg-surface text-v2-text-primary border border-v2-border shadow-sm hover:bg-v2-bg-hover hover:scale-[1.01] active:scale-[0.98]",
        mono: "font-mono rounded-sm border border-v2-border bg-v2-bg-base text-v2-text-primary hover:border-v2-border/70 hover:bg-v2-bg-hover focus-visible:ring-offset-0",
      },
      size: {
        sm: "h-8 min-h-[32px] min-w-[32px] px-3 text-xs",
        default: "h-10 min-h-[40px] min-w-[40px] px-4 text-sm",
        md: "h-11 min-h-[44px] min-w-[44px] px-[var(--space-4)] py-[var(--space-2)]",
        lg: "h-12 min-h-[48px] min-w-[48px] px-6 text-base",
        icon: "h-10 w-10 min-h-[40px] min-w-[40px] hover:bg-v2-bg-hover hover:shadow-md",
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
