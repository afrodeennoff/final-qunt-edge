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
          'relative rounded-[var(--radius-lg)] text-card-foreground border border-border/50 bg-card shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_20px_40px_-28px_rgba(0,0,0,0.72)] transition-[border-color,box-shadow,background-color] duration-[130ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
          variant === 'glass' &&
            'rounded-[var(--radius-lg)] bg-card/80 backdrop-blur-2xl border border-border/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_18px_36px_-24px_rgba(0,0,0,0.60)]',
          variant === 'elevated' &&
            'rounded-[var(--radius-lg)] bg-card border border-border/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_28px_56px_-32px_rgba(0,0,0,0.80)]',
          variant === 'outlined' &&
            'rounded-[var(--radius-lg)] bg-transparent border-2 border-border/60',
          variant === 'flat' && 'rounded-[var(--radius-lg)] border-0 bg-transparent shadow-none',
          variant === 'gradient-border' &&
            'border-primary/22 bg-card shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_18px_32px_-24px_rgba(0,0,0,0.64)]',
          variant === 'frost' &&
            'rounded-[var(--radius-lg)] bg-transparent border border-border/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_0_1px_rgba(0,102,204,0.04)]',
          accent && accentClassMap[accent],
          size === 'sm' && 'text-body-sm',
          size === 'md' && 'type-body',
          size === 'lg' && 'type-body-lg',
          hover &&
            'transition-[background-color,border-color,box-shadow,transform] duration-200 hover:border-border/80 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_20px_36px_-24px_rgba(0,0,0,0.68)] hover:-translate-y-px',
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
          <div className="absolute right-3 top-3 z-20 flex items-center gap-2 rounded-full border border-border/50 bg-card px-2.5 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
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
        'flex flex-col space-y-1 border-b border-border/30 px-5 py-4',
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
        'text-[13px] font-semibold tracking-[-0.01em] leading-none text-foreground',
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
  <p ref={ref} className={cn('text-[12px] text-muted-foreground leading-relaxed', className)} {...props} />
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
        'px-5 py-4',
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
        'flex items-center border-t border-border/30 px-5 py-4',
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
