import * as React from 'react'
import { Slot, Slottable } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'type-body-sm inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap border select-none font-medium tracking-normal transition-[background-color,border-color,color,transform,box-shadow] duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 min-h-[40px] rounded-lg press-scale',
  {
    variants: {
      variant: {
        solid: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        outline: 'border-primary/12 bg-transparent text-foreground hover:bg-primary/4 hover:border-primary/20',
        ghost: 'border-transparent text-muted-foreground hover:bg-primary/4 hover:text-foreground',
        error: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        link: 'border-transparent text-primary underline-offset-2 hover:underline p-0 h-auto min-h-0',
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-primary/12 bg-primary/3 text-foreground hover:bg-primary/6',
        mono: 'border-primary/12 bg-primary/2 text-foreground font-mono hover:bg-primary/4',
        pill: 'rounded-full border-primary/12 bg-primary/2 text-foreground hover:bg-primary/4',
        'pill-solid': 'rounded-full border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        'pill-ghost': 'rounded-full border-transparent text-muted-foreground hover:bg-primary/4 hover:text-foreground',
        'gradient-primary': 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        'gradient-secondary': 'border-primary/12 bg-primary/3 text-foreground hover:bg-primary/6',
        shimmer: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
      },
      size: {
        sm: 'h-8 min-h-[36px] min-w-[28px] px-2.5 text-xs',
        default: 'h-9 min-h-[40px] min-w-[32px] px-3.5',
        md: 'h-10 min-h-[40px] min-w-[36px] px-4',
        lg: 'h-11 min-h-[44px] min-w-[40px] px-5 text-sm',
        icon: 'h-9 w-9 min-h-[36px] min-w-[36px] p-0',
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

    const content = (
      <>
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
