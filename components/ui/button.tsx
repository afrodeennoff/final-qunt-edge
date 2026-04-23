import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'type-label font-sans inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap border border-transparent select-none overflow-hidden transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        solid:
          'rounded-lg border-primary/18 bg-primary text-primary-foreground shadow-[0_2px_4px_rgba(0,0,0,0.15)] hover:bg-primary/92 hover:shadow-[0_2px_4px_rgba(0,0,0,0.25)] active:scale-[0.98]',
        outline:
          'rounded-lg border-[oklch(0.65_0.22_260_/_0.06)] bg-[oklch(0.052_0.009_260_/_0.66)] text-foreground shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.04)] hover:border-[oklch(0.65_0.22_260_/_0.1)] hover:bg-[oklch(0.056_0.009_260_/_0.74)] active:scale-[0.98]',
        ghost:
          'rounded-lg bg-transparent text-muted-foreground hover:border-[oklch(0.65_0.22_260_/_0.07)] hover:bg-[oklch(0.052_0.009_260_/_0.56)] hover:text-foreground active:scale-[0.98]',
        error:
          'rounded-lg border-destructive/18 bg-destructive text-destructive-foreground shadow-[0_2px_4px_rgba(0,0,0,0.15)] hover:bg-destructive/92 active:scale-[0.98]',
        destructive:
          'rounded-lg border-destructive/18 bg-destructive text-destructive-foreground shadow-[0_2px_4px_rgba(0,0,0,0.15)] hover:bg-destructive/92 active:scale-[0.98]',
        link: 'rounded-lg text-primary underline-offset-4 hover:underline',
        'gradient-primary':
          'rounded-lg border-primary/18 bg-primary text-primary-foreground shadow-[0_2px_4px_rgba(0,0,0,0.15)] hover:bg-primary/92 hover:shadow-[0_2px_4px_rgba(0,0,0,0.25)] active:scale-[0.98]',
        'gradient-secondary':
          'rounded-lg border-[oklch(0.65_0.22_260_/_0.07)] bg-[oklch(0.052_0.009_260_/_0.68)] text-foreground shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.04)] hover:border-[oklch(0.65_0.22_260_/_0.12)] hover:bg-[oklch(0.056_0.009_260_/_0.78)] active:scale-[0.98]',
        shimmer:
          'rounded-lg border-primary/18 bg-primary text-primary-foreground shadow-[0_2px_4px_rgba(0,0,0,0.15)] hover:bg-primary/92 hover:shadow-[0_2px_4px_rgba(0,0,0,0.25)] active:scale-[0.98]',
        default:
          'rounded-lg border-primary/18 bg-primary text-primary-foreground shadow-[0_2px_4px_rgba(0,0,0,0.15)] hover:bg-primary/92 hover:shadow-[0_2px_4px_rgba(0,0,0,0.25)] active:scale-[0.98]',
        secondary:
          'rounded-lg border-[oklch(0.65_0.22_260_/_0.06)] bg-[oklch(0.05_0.009_260_/_0.68)] text-secondary-foreground shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.04)] hover:border-[oklch(0.65_0.22_260_/_0.1)] hover:bg-[oklch(0.054_0.009_260_/_0.74)] active:scale-[0.98]',
        mono: 'rounded-lg border-[oklch(0.65_0.22_260_/_0.07)] bg-[oklch(0.05_0.009_260_/_0.72)] text-foreground hover:border-[oklch(0.65_0.22_260_/_0.11)] hover:bg-[oklch(0.054_0.009_260_/_0.8)] font-mono',
        pill: 'rounded-full border-[oklch(0.65_0.22_260_/_0.07)] bg-[oklch(0.052_0.009_260_/_0.68)] text-foreground shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.04)] hover:border-[oklch(0.65_0.22_260_/_0.12)] hover:bg-[oklch(0.056_0.009_260_/_0.78)] active:scale-[0.98]',
        'pill-solid':
          'rounded-full border-primary/18 bg-primary text-primary-foreground shadow-[0_2px_4px_rgba(0,0,0,0.15)] hover:bg-primary/92 active:scale-[0.98]',
        'pill-ghost':
          'rounded-full bg-transparent text-muted-foreground hover:border-[oklch(0.65_0.22_260_/_0.07)] hover:bg-[oklch(0.052_0.009_260_/_0.56)] hover:text-foreground active:scale-[0.98]',
      },
      size: {
        sm: 'h-8 min-h-[32px] min-w-[32px] px-3',
        default: 'h-9 min-h-[36px] min-w-[36px] px-3.5',
        md: 'h-10 min-h-[40px] min-w-[40px] px-4.5',
        lg: 'h-11 min-h-[44px] min-w-[44px] px-6 text-sm',
        icon: 'h-9 w-9 min-h-[36px] min-w-[36px]',
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
          children
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
