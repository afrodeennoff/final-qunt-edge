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
          'rounded-md bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:bg-primary/90 active:scale-[0.98]',
        outline:
          'rounded-md border-border bg-background/70 text-foreground shadow-sm hover:bg-muted/70 hover:shadow-md active:scale-[0.98]',
        ghost: 'rounded-md text-muted-foreground hover:bg-muted/70 hover:text-foreground',
        error:
          'rounded-md bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md active:scale-[0.98]',
        destructive:
          'rounded-md bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md active:scale-[0.98]',
        link: 'rounded-md text-primary underline-offset-4 hover:underline',
        'gradient-primary':
          'rounded-md bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-sm hover:shadow-md active:scale-[0.98]',
        'gradient-secondary':
          'rounded-md border-border bg-gradient-to-r from-background to-muted/60 text-foreground shadow-sm hover:shadow-md active:scale-[0.98]',
        shimmer:
          'rounded-md bg-primary text-primary-foreground shadow-sm hover:shadow-md active:scale-[0.98]',
        default:
          'rounded-md bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md active:scale-[0.98]',
        secondary:
          'rounded-md border-border bg-secondary text-secondary-foreground shadow-sm hover:shadow-md active:scale-[0.98]',
        mono: 'rounded-md border-border bg-background text-foreground shadow-sm hover:bg-muted/70 font-mono',
        pill: 'rounded-full border-border bg-background/70 text-foreground shadow-sm hover:bg-muted/70 active:scale-[0.98]',
        'pill-solid':
          'rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md active:scale-[0.98]',
        'pill-ghost': 'rounded-full text-muted-foreground hover:bg-muted/70 hover:text-foreground',
      },
      size: {
        sm: 'h-8 min-h-[32px] min-w-[32px] px-3 rounded-md',
        default: 'h-9 min-h-[36px] min-w-[36px] px-4 rounded-md',
        md: 'h-10 min-h-[40px] min-w-[40px] px-5 rounded-md',
        lg: 'h-11 min-h-[44px] min-w-[44px] px-6 text-sm rounded-md',
        icon: 'h-9 w-9 min-h-[36px] min-w-[36px] rounded-md',
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
