import * as React from 'react'
import { Slot, Slottable } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap select-none cursor-pointer font-medium tracking-[-0.01em] transition-[background-color,border-color,color,box-shadow,opacity] duration-[130ms] ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-[0_0_0_2px_var(--background),0_0_0_4px_oklch(0.62_0.22_290_/_0.5)] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:scale-[0.97] active:duration-75",
  {
    variants: {
      variant: {
        solid:
          "bg-primary text-primary-foreground border border-primary/20 shadow-[inset_0_1px_0_oklch(1_0_0_/_0.12),0_1px_3px_rgba(0,0,0,0.24)] hover:bg-primary/92",
        outline:
          "bg-transparent text-foreground/80 border border-[oklch(0.65_0.22_260_/_0.14)] hover:bg-[oklch(0.65_0.22_260_/_0.08)] hover:text-foreground hover:border-[oklch(0.65_0.22_260_/_0.20)]",
        ghost:
          "bg-transparent text-muted-foreground border border-transparent hover:bg-[oklch(0.65_0.22_260_/_0.08)] hover:text-foreground",
        error:
          "bg-destructive/90 text-destructive-foreground border border-destructive/20 shadow-[inset_0_1px_0_oklch(1_0_0_/_0.08)] hover:bg-destructive",
        destructive:
          "bg-destructive/90 text-destructive-foreground border border-destructive/20 shadow-[inset_0_1px_0_oklch(1_0_0_/_0.08)] hover:bg-destructive",
        link: 'rounded-[0.95rem] text-primary underline-offset-4 hover:underline',
        'gradient-primary':
          "bg-gradient-to-b from-primary via-primary to-primary/88 text-primary-foreground border border-primary/20 shadow-[inset_0_1px_0_oklch(1_0_0_/_0.14),0_4px_16px_-8px_oklch(0.62_0.22_290_/_0.45)] hover:shadow-[inset_0_1px_0_oklch(1_0_0_/_0.14),0_8px_24px_-8px_oklch(0.62_0.22_290_/_0.55)]",
        'gradient-secondary':
          "bg-[oklch(0.65_0.22_260_/_0.08)] text-foreground border border-[oklch(0.65_0.22_260_/_0.12)] hover:bg-[oklch(0.65_0.22_260_/_0.12)]",
        shimmer:
          'rounded-[0.95rem] border-primary/18 bg-primary text-primary-foreground shadow-[0_1px_2px_rgba(0,0,0,0.14)] hover:bg-primary/92 hover:shadow-[0_12px_28px_-22px_rgba(0,0,0,0.48)] active:scale-[0.985]',
        default:
          "bg-primary text-primary-foreground border border-primary/20 shadow-[inset_0_1px_0_oklch(1_0_0_/_0.12),0_1px_3px_rgba(0,0,0,0.24)] hover:bg-primary/92",
        secondary:
          "bg-[oklch(0.65_0.22_260_/_0.07)] text-foreground/88 border border-[oklch(0.65_0.22_260_/_0.12)] shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.05)] hover:bg-[oklch(0.65_0.22_260_/_0.11)] hover:text-foreground hover:border-[oklch(0.65_0.22_260_/_0.18)]",
        mono: "font-mono text-[12px] rounded-md bg-[oklch(0.65_0.22_260_/_0.06)] text-muted-foreground border border-[oklch(0.65_0.22_260_/_0.10)] hover:bg-[oklch(0.65_0.22_260_/_0.10)] hover:text-foreground",
        pill: "rounded-full bg-transparent text-foreground/80 border border-[oklch(0.65_0.22_260_/_0.16)] hover:bg-[oklch(0.65_0.22_260_/_0.08)] hover:text-foreground",
        'pill-solid':
          "rounded-full bg-foreground text-background border-none hover:bg-foreground/92",
        'pill-ghost':
          "rounded-full bg-transparent text-muted-foreground border-transparent hover:bg-[oklch(0.65_0.22_260_/_0.08)] hover:text-foreground",
      },
      size: {
        sm: 'h-7 min-h-7 px-2.5 text-[12px] rounded-md gap-1 [&_svg]:size-3.5',
        default: 'h-8 min-h-8 px-3.5 text-[13px] rounded-md [&_svg]:size-4',
        md: 'h-9 min-h-9 px-4 text-[13px] rounded-[8px] [&_svg]:size-4',
        lg: 'h-10 min-h-10 px-5 text-[14px] rounded-[9px] [&_svg]:size-4',
        icon: 'h-8 w-8 min-h-8 min-w-8 rounded-md [&_svg]:size-4',
      },
    },
    defaultVariants: {
      variant: 'solid',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
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
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button'
    const isShimmer = variant === 'shimmer'

    const content = (
      <>
        {isShimmer && isLoading ? (
          <span className="absolute inset-0 overflow-hidden rounded-[inherit]">
            <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          </span>
        ) : null}
        {leftIcon && !isLoading ? <span className="shrink-0">{leftIcon}</span> : null}
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            <span>{loadingText ?? children}</span>
          </>
        ) : (
          <Slottable>{children}</Slottable>
        )}
        {rightIcon && !isLoading ? <span className="shrink-0">{rightIcon}</span> : null}
      </>
    )

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={asChild ? undefined : isLoading || disabled}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {content}
      </Comp>
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
export { Button as ButtonV2 }
