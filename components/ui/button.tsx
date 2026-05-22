import * as React from 'react'
import { Slot, Slottable } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'type-body-sm inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap border border-transparent select-none overflow-hidden font-medium tracking-normal transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 min-h-[44px]',
  {
    variants: {
      variant: {
        solid:
          'rounded-xl border-primary/15 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98]',
        outline:
          'rounded-xl border-border/40 bg-background/50 text-foreground hover:border-border/55 hover:bg-primary/6 active:scale-[0.98]',
        ghost:
          'rounded-xl text-muted-foreground hover:bg-muted/50 hover:text-foreground active:scale-[0.98]',
        error:
          'rounded-xl border-destructive/20 bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:scale-[0.98]',
        destructive:
          'rounded-xl border-destructive/20 bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:scale-[0.98]',
        link: 'rounded-xl text-primary underline-offset-4 hover:underline',
        'gradient-primary':
          'rounded-xl border-primary/15 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98]',
        'gradient-secondary':
          'rounded-xl border-border/40 bg-background/50 text-foreground hover:border-border/55 hover:bg-primary/6 active:scale-[0.98]',
        shimmer:
          'rounded-xl border-primary/15 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98]',
        default:
          'rounded-xl border-primary/15 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98]',
        secondary:
          'rounded-xl border-border/40 bg-secondary/70 text-secondary-foreground hover:border-border/55 hover:bg-secondary/80 active:scale-[0.98]',
        mono:
          'rounded-xl border-border/40 bg-background text-foreground hover:bg-muted/50 font-mono',
        pill: 'rounded-full border-border/40 bg-background/50 text-foreground hover:border-border/55 hover:bg-primary/6 active:scale-[0.98]',
        'pill-solid':
          'rounded-full border-primary/15 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98]',
        'pill-ghost':
          'rounded-full text-muted-foreground hover:bg-muted/50 hover:text-foreground active:scale-[0.98]',
      },
      size: {
        sm: 'h-8 min-h-[44px] min-w-[32px] px-3 rounded-xl',
        default: 'h-9 min-h-[44px] min-w-[36px] px-4 rounded-xl',
        md: 'h-10 min-h-[44px] min-w-[40px] px-5 rounded-xl',
        lg: 'h-11 min-h-[44px] min-w-[44px] px-6 text-sm rounded-xl',
        icon: 'h-11 w-11 min-h-[44px] min-w-[44px] rounded-xl',
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
            <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-[oklch(0.65_0.22_260/0.15)] to-transparent" />
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
