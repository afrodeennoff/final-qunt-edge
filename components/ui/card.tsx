import * as React from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated' | 'outlined' | 'flat' | 'gradient-border' | 'frost'
  hover?: boolean
  size?: 'sm' | 'md' | 'lg'
  clickable?: boolean
  status?: CardStatusTone
  isLoading?: boolean
  accent?: 'primary' | 'success' | 'warning' | 'destructive' | 'info'
}

export type CardStatusTone = 'live' | 'synced' | 'idle' | 'destructive' | 'error'

const accentClassMap = {
  primary: 'border-primary/22',
  success: 'border-success/22',
  warning: 'border-warning/22',
  destructive: 'border-destructive/22',
  info: 'border-accent/22',
} satisfies Record<NonNullable<CardProps['accent']>, string>

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      hover = false,
      size = 'md',
      clickable = false,
      status,
      isLoading = false,
      accent,
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

    return (
      <div
        ref={ref}
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onKeyDown={isInteractive ? handleKeyDown : undefined}
        onClick={isInteractive ? onClick : undefined}
        className={cn(
          'group relative overflow-hidden text-foreground',
          'rounded-2xl border border-[oklch(0.65_0.22_260_/_0.07)] bg-[linear-gradient(180deg,oklch(0.064_0.011_260_/_0.86)_0%,oklch(0.052_0.009_260_/_0.8)_100%)] shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.04),0_16px_34px_-26px_rgba(0,0,0,0.74)]',
          variant === 'glass' &&
            'border-[oklch(0.65_0.22_260_/_0.06)] bg-[oklch(0.054_0.009_260_/_0.72)]',
          variant === 'elevated' &&
            'border-[oklch(0.65_0.22_260_/_0.08)] bg-[linear-gradient(180deg,oklch(0.068_0.011_260_/_0.9)_0%,oklch(0.055_0.009_260_/_0.84)_100%)] shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.05),0_22px_40px_-28px_rgba(0,0,0,0.8)]',
          variant === 'outlined' &&
            'border-[oklch(0.65_0.22_260_/_0.08)] bg-transparent shadow-none',
          variant === 'flat' && 'border-transparent bg-transparent shadow-none',
          variant === 'gradient-border' &&
            'border-primary/16 bg-[linear-gradient(180deg,oklch(0.066_0.011_260_/_0.88)_0%,oklch(0.054_0.009_260_/_0.82)_100%)] shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.05),0_20px_38px_-28px_rgba(0,0,0,0.78)]',
          variant === 'frost' &&
            'border-[oklch(0.65_0.22_260_/_0.07)] bg-[oklch(0.05_0.009_260_/_0.74)] shadow-[0_14px_30px_-24px_rgba(0,0,0,0.66)]',
          accent && accentClassMap[accent],
          size === 'sm' && 'text-body-sm',
          size === 'md' && 'type-body',
          size === 'lg' && 'type-body-lg',
          hover &&
            'transition-[background-color,border-color,box-shadow] duration-200 hover:border-[oklch(0.65_0.22_260_/_0.11)] hover:shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.05),0_20px_38px_-26px_rgba(0,0,0,0.8)]',
          isInteractive &&
            'cursor-pointer transition-[background-color,border-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          isLoading && 'pointer-events-none opacity-80',
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <div className="absolute inset-0 z-20 overflow-hidden rounded-[inherit]">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        ) : null}

        {status ? (
          <div className="absolute right-3 top-3 z-20 flex items-center gap-2 rounded-full border border-[oklch(0.65_0.22_260_/_0.08)] bg-[oklch(0.052_0.009_260_/_0.76)] px-2.5 py-1 shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.04)]">
            <div
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                status === 'live' && 'bg-success animate-pulse',
                status === 'synced' && 'bg-primary',
                status === 'idle' && 'bg-muted-foreground/50',
                (status === 'destructive' || status === 'error') && 'bg-destructive',
              )}
            />
            <span className="type-label text-muted-foreground">{status}</span>
          </div>
        ) : null}

        <div className="relative z-10 rounded-[inherit]">{children}</div>
      </div>
    )
  },
)
Card.displayName = 'Card'

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  statusDot?: React.ReactNode
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, size = 'md', statusDot, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative flex flex-col gap-3',
        {
          'p-4 pb-0': size === 'sm',
          'p-5 pb-0': size === 'md',
          'p-6 pb-0': size === 'lg',
        },
        className,
      )}
      {...props}
    >
      {statusDot ? <div className="absolute right-3 top-3">{statusDot}</div> : null}
      {children}
    </div>
  ),
)
CardHeader.displayName = 'CardHeader'

export interface CardStatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: CardStatusTone
  label?: string
}

const CardStatusDot = React.forwardRef<HTMLSpanElement, CardStatusDotProps>(
  ({ className, tone = 'idle', label, ...props }, ref) => (
    <span className="inline-flex items-center gap-2.5 text-muted-foreground/80">
      <span
        ref={ref}
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          tone === 'live' && 'bg-success animate-pulse',
          tone === 'synced' && 'bg-primary',
          tone === 'idle' && 'bg-muted-foreground/50',
          (tone === 'destructive' || tone === 'error') && 'bg-destructive',
          className,
        )}
        aria-hidden
        {...props}
      />
      {label ? <span className="type-label">{label}</span> : null}
    </span>
  ),
)
CardStatusDot.displayName = 'CardStatusDot'

export type CardActionProps = React.HTMLAttributes<HTMLDivElement>

const CardAction = React.forwardRef<HTMLDivElement, CardActionProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('shrink-0', className)} {...props} />
  ),
)
CardAction.displayName = 'CardAction'

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, size = 'lg', ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        '[font-family:var(--font-display)] text-foreground',
        {
          'type-body-lg': size === 'sm',
          'type-h4': size === 'md' || size === 'lg',
          'type-h3': size === 'xl',
        },
        className,
      )}
      {...props}
    />
  ),
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('type-body-sm text-muted-foreground', className)} {...props} />
))
CardDescription.displayName = 'CardDescription'

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, size = 'md', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'type-body text-foreground',
        {
          'p-4': size === 'sm',
          'p-5': size === 'md',
          'p-6': size === 'lg',
        },
        className,
      )}
      {...props}
    />
  ),
)
CardContent.displayName = 'CardContent'

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, size = 'md', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center gap-3 border-t border-border/40',
        'border-[oklch(0.65_0.22_260_/_0.06)]',
        {
          'p-4': size === 'sm',
          'p-5': size === 'md',
          'p-6': size === 'lg',
        },
        className,
      )}
      {...props}
    />
  ),
)
CardFooter.displayName = 'CardFooter'

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  CardStatusDot,
}
