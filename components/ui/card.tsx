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
  primary: 'border-primary/30',
  success: 'border-success/30',
  warning: 'border-warning/30',
  destructive: 'border-destructive/30',
  info: 'border-accent/30',
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
<<<<<<< HEAD
=======
        className={cn(
          "relative rounded-xl border bg-v2-bg-surface text-v2-text-primary shadow-sm shadow-v2-accent/5 transition-all duration-200",
          variant === "default" && "border-v2-border/22 bg-v2-bg-surface",
          variant === "glass" && "border-v2-border/12 bg-v2-bg-surface/20 backdrop-blur-xl shadow-lg",
          variant === "elevated" && "border-v2-border/18 bg-v2-bg-surface shadow-xl shadow-v2-accent/10",
          variant === "outlined" && "border-2 border-v2-border/24 bg-transparent shadow-none",
          variant === "flat" && "border-0 bg-transparent shadow-none",
          variant === "gradient-border" && "border-2 border-transparent bg-gradient-to-r from-v2-bg-surface to-v2-bg-hover p-[2px] shadow-lg shadow-v2-accent/8",
          variant === "frost" && "bg-transparent border border-[var(--frost-border)] shadow-[0_18px_40px_-28px_rgba(0,0,0,0.62)]",
          {
            "text-sm": size === "sm",
            "text-base": size === "md",
            "text-lg": size === "lg",
          },
          {
            "cursor-pointer": isInteractive,
            "hover:-translate-y-1 hover:shadow-xl hover:shadow-v2-accent/20": hover || isInteractive,
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-accent focus-visible:ring-offset-2 focus-visible:ring-offset-v2-bg-base":
              isInteractive,
          },
          isLoading && "pointer-events-none opacity-80",
          className
        )}
>>>>>>> origin/main
        onClick={isInteractive ? onClick : undefined}
        className={cn(
          'group relative overflow-hidden text-foreground',
          'rounded-lg border border-border/45 bg-card/95 shadow-[0_18px_46px_-32px_rgba(0,0,0,0.9)]',
          variant === 'glass' && 'border-primary/12 bg-primary/8',
          variant === 'elevated' &&
            'border-primary/14 bg-card shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_28px_70px_-42px_rgba(0,0,0,0.92)]',
          variant === 'outlined' && 'bg-transparent shadow-none',
          variant === 'flat' && 'border-transparent bg-transparent shadow-none',
          variant === 'gradient-border' &&
            'border-primary/18 bg-card/98 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_22px_52px_-36px_rgba(0,0,0,0.9)]',
          variant === 'frost' && 'border-border/40 bg-background/74 shadow-[0_16px_38px_-30px_rgba(0,0,0,0.88)]',
          accent && accentClassMap[accent],
          size === 'sm' && 'text-body-sm',
          size === 'md' && 'type-body',
          size === 'lg' && 'type-body-lg',
          hover &&
            'transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/16 hover:shadow-[0_24px_58px_-34px_rgba(0,0,0,0.92)]',
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
<<<<<<< HEAD
        ) : null}

        {status ? (
          <div className="absolute right-3 top-3 z-20 flex items-center gap-2 rounded-full border border-border/45 bg-background/82 px-2.5 py-1 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.85)]">
=======
        )}
        {status && (
            <div className="absolute right-3 top-3 z-20 flex items-center gap-2 rounded-full border border-v2-border/14 bg-v2-bg-base/90 backdrop-blur-md px-2 py-1 shadow-sm">
>>>>>>> origin/main
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
        'relative flex flex-col gap-2.5',
        {
          'p-4 pb-0': size === 'sm',
          'p-5 pb-0 sm:p-6 sm:pb-0': size === 'md',
          'p-6 pb-0 sm:p-8 sm:pb-0': size === 'lg',
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
          'p-5 sm:p-6': size === 'md',
          'p-6 sm:p-8': size === 'lg',
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
        'flex items-center gap-3 border-t border-border/50',
        {
          'p-4': size === 'sm',
          'p-5 sm:p-6': size === 'md',
          'p-6 sm:p-8': size === 'lg',
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
