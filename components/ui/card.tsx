import * as React from "react"

import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "elevated" | "outlined" | "flat"
  hover?: boolean
  size?: "sm" | "md" | "lg"
  clickable?: boolean
  status?: CardStatusTone
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
          "relative rounded-xl border bg-v2-bg-surface text-v2-text-primary shadow-sm",
          variant === "default" && "border-v2-border bg-v2-bg-surface",
          variant === "glass" && "border-v2-border bg-v2-bg-surface/10 backdrop-blur-md",
          variant === "elevated" && "border-v2-border bg-v2-bg-surface shadow-md",
          variant === "outlined" && "border-2 border-v2-border bg-transparent shadow-none",
          variant === "flat" && "border-0 bg-transparent shadow-none",
          {
            "text-sm": size === "sm",
            "text-base": size === "md",
            "text-lg": size === "lg",
          },
          {
            "cursor-pointer": isInteractive,
            "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md": hover || isInteractive,
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-accent focus-visible:ring-offset-2 focus-visible:ring-offset-v2-bg-base":
              isInteractive,
          },
          className
        )}
        onClick={isInteractive ? onClick : undefined}
        {...props}
      >
        {status && (
          <div className="absolute right-3 top-3 z-20 flex items-center gap-2 rounded-full border border-v2-border bg-v2-bg-base/80 px-2 py-1 backdrop-blur-sm">
            <div
              className={cn(
                "status-dot",
                status === "live" && "bg-emerald-500 animate-pulse",
                status === "synced" && "bg-blue-500",
                status === "idle" && "bg-gray-500",
                status === "error" && "bg-red-500"
              )}
            />
            <span className="text-[10px] font-semibold uppercase leading-none tracking-widest text-v2-text-muted">
              {status}
            </span>
          </div>
        )}

        <div className="relative z-10">{children}</div>
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
          "p-4": size === "sm",
          "p-6": size === "md",
          "p-8": size === "lg",
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
          tone === "idle" && "bg-gray-500",
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
          "p-4 pt-0": size === "sm",
          "p-6 pt-0": size === "md",
          "p-8 pt-0": size === "lg",
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
          "p-4 pt-0": size === "sm",
          "p-6 pt-0": size === "md",
          "p-8 pt-0": size === "lg",
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
