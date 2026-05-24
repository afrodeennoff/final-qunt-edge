import * as React from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'embedded'
  hover?: boolean
  size?: 'sm' | 'md' | 'lg'
  clickable?: boolean
  isLoading?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      hover = false,
      size = 'md',
      clickable = false,
      isLoading = false,
      onClick,
      children,
      ...props
    },
    ref,
  ) => {
    const isInteractive = clickable || typeof onClick === 'function'

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!isInteractive) return
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onClick?.(event as unknown as React.MouseEvent<HTMLDivElement>)
      }
    }

    const baseClasses = cn(
      'relative overflow-hidden text-foreground',
      'transition-[opacity,background-color,border-color] duration-[200ms] ease-out',
      hover && 'hover:shadow-sm',
      isInteractive && 'cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/30',
      isLoading && 'pointer-events-none opacity-80'
    )

    const variantClasses = {
      default: 'rounded-xl border border-border/30 bg-card shadow-none',
      flat: 'rounded-xl border-transparent bg-transparent shadow-none',
      embedded: 'rounded-xl border border-border/40 bg-card shadow-none',
    }

    const sizeClasses = {
      sm: 'p-3 type-body-sm',
      md: 'p-4',
      lg: 'p-6 type-body-lg',
    }

    return (
      <div
        ref={ref}
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onKeyDown={isInteractive ? handleKeyDown : undefined}
        onClick={isInteractive ? onClick : undefined}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <div className="absolute inset-0 z-10 overflow-hidden rounded-[inherit]">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
          </div>
        )}
        {children}
      </div>
    )
  }
)
Card.displayName = 'Card'

// Export header and content components
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-lg font-semibold tracking-tight', className)} {...props} />
  )
)
CardTitle.displayName = 'CardTitle'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

export { Card, CardHeader, CardTitle, CardContent, Card as MinimalCard }
