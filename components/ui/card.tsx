import * as React from "react"

import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "elevated" | "outlined" | "flat" | "gradient-border"
  hover?: boolean
  size?: "sm" | "md" | "lg"
  clickable?: boolean
  status?: CardStatusTone
  isLoading?: boolean
}

export type CardStatusTone = "live" | "synced" | "idle" | "error"

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "default",
      hover = false,
      size = "md",
      clickable = false,
      status,
      isLoading = false,
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    const isInteractive = clickable || typeof onClick === "function"

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (isInteractive && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault()
        onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>)
      }
    }

    return (
      <div
        ref={ref}
        role={isInteractive ? "button" : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onKeyDown={isInteractive ? handleKeyDown : undefined}
        className={cn(
          "relative rounded-xl border bg-v2-bg-surface text-v2-text-primary shadow-sm shadow-v2-accent/5 transition-all duration-200",
          variant === "default" && "border-v2-border bg-v2-bg-surface",
          variant === "glass" && "border-v2-border/30 bg-v2-bg-surface/20 backdrop-blur-xl shadow-lg",
          variant === "elevated" && "border-v2-border bg-v2-bg-surface shadow-xl shadow-v2-accent/10",
          variant === "outlined" && "border-2 border-v2-border bg-transparent shadow-none",
          variant === "flat" && "border-0 bg-transparent shadow-none",
          variant === "gradient-border" && "border-2 border-transparent bg-gradient-to-r from-v2-bg-surface to-v2-bg-hover p-[2px] shadow-lg shadow-v2-accent/8",
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
        onClick={isInteractive ? onClick : undefined}
        {...props}
      >
        {variant === "gradient-border" && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-v2-accent via-v2-accent-hover to-v2-accent opacity-25 blur-sm -z-10" />
        )}
        {isLoading && (
          <div className="absolute inset-0 overflow-hidden rounded-xl z-20">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-v2-accent-foreground/10 to-transparent" />
          </div>
        )}
        {status && (
          <div className="absolute right-3 top-3 z-20 flex items-center gap-2 rounded-full border border-v2-border/50 bg-v2-bg-base/90 backdrop-blur-md px-2 py-1 shadow-sm">
            <div
              className={cn(
                "status-dot size-2 rounded-full",
                status === "live" && "bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50",
                status === "synced" && "bg-blue-500 shadow-lg shadow-blue-500/50",
                status === "idle" && "bg-v2-text-muted",
                status === "error" && "bg-red-500 shadow-lg shadow-red-500/50"
              )}
            />
            <span className="text-[10px] font-semibold uppercase leading-none tracking-widest text-v2-text-muted">
              {status}
            </span>
          </div>
        )}

        <div className={cn("relative z-10 rounded-xl", variant === "gradient-border" && "bg-v2-bg-surface")}>{children}</div>
      </div>
    )
  }
)
Card.displayName = "Card"

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  statusDot?: React.ReactNode
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, size = "md", statusDot, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex flex-col gap-2",
        {
          "p-3 sm:p-4": size === "sm",
          "p-4 sm:p-6": size === "md",
          "p-4 sm:p-6 lg:p-8": size === "lg",
        },
        className
      )}
      {...props}
    >
      {statusDot ? <div className="absolute right-3 top-3">{statusDot}</div> : null}
      {children}
    </div>
  )
)
CardHeader.displayName = "CardHeader"

export interface CardStatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: CardStatusTone
  label?: string
}

const CardStatusDot = React.forwardRef<HTMLSpanElement, CardStatusDotProps>(
  ({ className, tone = "idle", label, ...props }, ref) => (
    <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-v2-text-muted">
      <span
        ref={ref}
        className={cn(
          "status-dot",
          tone === "live" && "bg-emerald-500 animate-pulse",
          tone === "synced" && "bg-blue-500",
          tone === "idle" && "bg-v2-text-muted",
          tone === "error" && "bg-red-500",
          className
        )}
        aria-hidden
        {...props}
      />
      {label ? <span className="micro-sans">{label}</span> : null}
    </span>
  )
)
CardStatusDot.displayName = "CardStatusDot"

export interface CardActionProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardAction = React.forwardRef<HTMLDivElement, CardActionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("shrink-0", className)}
      {...props}
    />
  )
)
CardAction.displayName = "CardAction"

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  size?: "sm" | "md" | "lg" | "xl"
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, size = "lg", ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "font-semibold leading-none tracking-tight text-v2-text-primary",
        {
          "text-sm": size === "sm",
          "text-base": size === "md",
          "text-lg": size === "lg",
          "text-xl": size === "xl",
        },
        className
      )}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-v2-text-secondary", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, size = "md", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "text-v2-text-primary",
        {
          "p-3 pt-0 sm:p-4 sm:pt-0": size === "sm",
          "p-4 pt-0 sm:p-6 sm:pt-0": size === "md",
          "p-4 pt-0 sm:p-6 sm:pt-0 lg:p-8 lg:pt-0": size === "lg",
        },
        className
      )}
      {...props}
    />
  )
)
CardContent.displayName = "CardContent"

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, size = "md", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center",
        {
          "p-3 pt-0 sm:p-4 sm:pt-0": size === "sm",
          "p-4 pt-0 sm:p-6 sm:pt-0": size === "md",
          "p-4 pt-0 sm:p-6 sm:pt-0 lg:p-8 lg:pt-0": size === "lg",
        },
        className
      )}
      {...props}
    />
  )
)
CardFooter.displayName = "CardFooter"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
  CardStatusDot,
}
