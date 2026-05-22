import * as React from 'react'
import { Slot, Slottable } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap select-none cursor-pointer font-medium tracking-[-0.005em] transition-[opacity,background-color,border-color] duration-[200ms] ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground border border-primary/20 hover:bg-primary/90 hover:shadow-md",
        secondary: "bg-muted text-muted-foreground border border-border hover:bg-muted/70 hover:text-foreground",
        outline: "bg-transparent text-foreground border border-border hover:bg-muted/60 hover:text-foreground",
        ghost: "bg-transparent text-foreground hover:bg-muted/60 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: 'h-8 px-3 text-sm rounded-md gap-1.5 [&_svg]:size-3.5',
        default: 'h-9 px-4 text-base rounded-md gap-1.5 [&_svg]:size-4',
        lg: 'h-10 px-6 text-lg rounded-lg gap-1.5 [&_svg]:size-5',
        icon: 'h-9 w-9 rounded-md gap-0 [&_svg]:size-4',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
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
        {leftIcon && !isLoading && (
          <span className="shrink-0">{leftIcon}</span>
        )}
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            <span>{loadingText ?? children}</span>
          </>
        ) : (
          <Slottable>{children}</Slottable>
        )}
        {rightIcon && !isLoading && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </>
    )

    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {content}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants, Button as ButtonMinimal }
