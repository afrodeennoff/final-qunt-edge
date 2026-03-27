import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-v2-md text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[hsl(var(--ring))] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // New unified variants (recommended)
        solid: "bg-v2-accent text-v2-accent-foreground shadow-sm hover:bg-v2-accent-hover hover:scale-[1.01] active:scale-[0.98]",
        outline: "border border-v2-border bg-v2-bg-base text-v2-text-primary hover:bg-v2-bg-hover hover:scale-[1.01] active:scale-[0.98]",
        ghost: "text-v2-text-secondary hover:text-v2-text-primary hover:bg-v2-bg-hover",
        destructive: "bg-v2-error text-white hover:bg-v2-error/90 shadow-sm hover:scale-[1.01] active:scale-[0.98]",
        link: "text-v2-accent underline-offset-4 hover:underline",
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
        icon: "h-10 w-10 min-h-[40px] min-w-[40px]",
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
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || disabled}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            <span>{loadingText ?? children}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

// For backward compatibility: ButtonV2 is an alias for Button
export { Button as ButtonV2 }
