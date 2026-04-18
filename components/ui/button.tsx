import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'type-label font-sans inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap border border-transparent select-none transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        solid:
          'rounded-xl border-primary/20 bg-primary text-primary-foreground shadow-[0_14px_28px_-18px_hsl(var(--primary)/0.78)] hover:bg-primary/92 hover:shadow-[0_18px_36px_-20px_hsl(var(--primary)/0.82)] active:scale-[0.98]',
        outline:
          'rounded-xl border-border/50 bg-background/70 text-foreground shadow-[inset_0_1px_0_hsl(var(--foreground)/0.03)] hover:border-primary/20 hover:bg-primary/8 hover:shadow-md active:scale-[0.98]',
        ghost:
          'rounded-xl text-muted-foreground hover:bg-primary/8 hover:text-foreground active:scale-[0.98]',
        error:
          'rounded-xl border-destructive/25 bg-destructive text-destructive-foreground shadow-[0_14px_28px_-18px_hsl(var(--destructive)/0.72)] hover:bg-destructive/92 hover:shadow-md active:scale-[0.98]',
        destructive:
          'rounded-xl border-destructive/25 bg-destructive text-destructive-foreground shadow-[0_14px_28px_-18px_hsl(var(--destructive)/0.72)] hover:bg-destructive/92 hover:shadow-md active:scale-[0.98]',
        link: 'rounded-xl text-primary underline-offset-4 hover:underline',
        'gradient-primary':
          'rounded-xl border-primary/20 bg-primary text-primary-foreground shadow-[0_14px_28px_-18px_hsl(var(--primary)/0.78)] hover:bg-primary/92 hover:shadow-md active:scale-[0.98]',
        'gradient-secondary':
          'rounded-xl border-border/50 bg-background/72 text-foreground shadow-[inset_0_1px_0_hsl(var(--foreground)/0.03)] hover:border-primary/18 hover:bg-primary/8 hover:shadow-md active:scale-[0.98]',
        shimmer:
          'rounded-xl border-primary/20 bg-primary text-primary-foreground shadow-[0_14px_28px_-18px_hsl(var(--primary)/0.78)] hover:bg-primary/92 hover:shadow-md active:scale-[0.98]',
        default:
          'rounded-xl border-primary/20 bg-primary text-primary-foreground shadow-[0_14px_28px_-18px_hsl(var(--primary)/0.78)] hover:bg-primary/92 hover:shadow-md active:scale-[0.98]',
        secondary:
          'rounded-xl border-border/50 bg-secondary/88 text-secondary-foreground shadow-[inset_0_1px_0_hsl(var(--foreground)/0.03)] hover:border-primary/16 hover:bg-secondary active:scale-[0.98]',
        mono:
          'rounded-xl border-border/50 bg-background text-foreground shadow-[inset_0_1px_0_hsl(var(--foreground)/0.03)] hover:bg-muted/70 font-mono',
        pill: 'rounded-full border-border/50 bg-background/72 text-foreground shadow-[inset_0_1px_0_hsl(var(--foreground)/0.03)] hover:border-primary/18 hover:bg-primary/8 active:scale-[0.98]',
        'pill-solid':
          'rounded-full border-primary/20 bg-primary text-primary-foreground shadow-[0_14px_28px_-18px_hsl(var(--primary)/0.78)] hover:bg-primary/92 hover:shadow-md active:scale-[0.98]',
        'pill-ghost':
          'rounded-full text-muted-foreground hover:bg-primary/8 hover:text-foreground active:scale-[0.98]',
      },
      size: {
        sm: 'h-8 min-h-[32px] min-w-[32px] px-3 rounded-xl',
        default: 'h-9 min-h-[36px] min-w-[36px] px-4 rounded-xl',
        md: 'h-10 min-h-[40px] min-w-[40px] px-5 rounded-xl',
        lg: 'h-11 min-h-[44px] min-w-[44px] px-6 text-sm rounded-xl',
        icon: 'h-9 w-9 min-h-[36px] min-w-[36px] rounded-xl',
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
