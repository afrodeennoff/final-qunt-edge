import * as React from "react"
import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "elevated" | "outlined" | "flat" | "gradient-border" | "frost"
  hover?: boolean
  size?: "sm" | "md" | "lg"
  clickable?: boolean
  status?: CardStatusTone
  isLoading?: boolean
  accent?: "primary" | "success" | "warning" | "destructive" | "info"
}

export type CardStatusTone = "live" | "synced" | "idle" | "destructive" | "error"

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
      accent,
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

    const accentBorderMap = {
      primary: "from-[hsl(var(--primary))] to-[hsl(var(--chart-2))]",
      success: "from-[hsl(var(--success))] to-emerald-300",
      warning: "from-[hsl(var(--warning))] to-amber-300",
      destructive: "from-[hsl(var(--destructive))] to-rose-300",
      info: "from-sky-400 to-cyan-300",
    } satisfies Record<NonNullable<CardProps["accent"]>, string>

    return (
      <div
        ref={ref}
        role={isInteractive ? "button" : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onKeyDown={isInteractive ? handleKeyDown : undefined}
        className={cn(
          "group relative overflow-hidden rounded-[calc(var(--radius)+0.15rem)] border text-foreground transition-all duration-300",
          "border-[hsl(var(--v2-border)/0.72)] bg-[linear-gradient(180deg,hsl(var(--v2-bg-surface)/0.98),hsl(var(--v2-bg-elevated)/0.96))]",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_28px_70px_-42px_rgba(4,10,24,0.9)] backdrop-blur-xl",
          accent && "border-transparent",
          variant === "default" && "hover:border-[hsl(var(--v2-border)/0.95)]",
          variant === "glass" && "bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] border-[hsl(var(--v2-border)/0.78)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_26px_60px_-36px_rgba(4,10,24,0.88)]",
          variant === "elevated" && "bg-[linear-gradient(180deg,hsl(var(--v2-bg-hover)/0.98),hsl(var(--v2-bg-surface)/0.94))] border-[hsl(var(--v2-border)/0.94)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_36px_80px_-40px_rgba(4,10,24,0.92)]",
          variant === "outlined" && "border-[hsl(var(--v2-border)/0.9)] bg-transparent shadow-none",
          variant === "flat" && "border-0 bg-transparent shadow-none",
          variant === "gradient-border" && `border-0 p-px bg-gradient-to-br ${accent ? accentBorderMap[accent] : "from-[hsl(var(--primary))] via-violet-400/70 to-cyan-300/70"}`,
          variant === "frost" && "border-[hsl(var(--v2-border)/0.76)] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_28px_72px_-40px_rgba(4,10,24,0.92)]",
          {
            "text-sm": size === "sm",
            "text-base": size === "md",
            "text-lg": size === "lg",
          },
          {
            "cursor-pointer": isInteractive,
            "hover:-translate-y-[2px] hover:border-[hsl(var(--v2-border)/0.96)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_40px_90px_-46px_rgba(4,10,24,0.95)]": hover || isInteractive,
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background":
              isInteractive,
          },
          isLoading && "pointer-events-none opacity-80",
          className
        )}
        onClick={isInteractive ? onClick : undefined}
        {...props}
      >
        {/* Top accent line (all variants except flat) */}
        {variant !== "flat" && !accent && (
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        )}
        
        {/* Accent line at top when accent prop is set */}
        {accent && variant !== "flat" && variant !== "gradient-border" && (
          <div className={`absolute inset-x-4 top-0 h-[2px] rounded-b-full bg-gradient-to-r ${accentBorderMap[accent]} opacity-80`} />
        )}

        {/* Ambient glow on hover */}
        {(hover || isInteractive) && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        )}

        {variant === "gradient-border" && (
          <div className="absolute inset-0 overflow-hidden rounded-[calc(0.75rem-1.5px)]">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--v2-bg-surface)/0.98),hsl(var(--v2-bg-elevated)/0.96))]" />
          </div>
        )}
        {isLoading && (
          <div className="absolute inset-0 overflow-hidden rounded-xl z-20">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        )}
        {status && (
          <div className="absolute right-3 top-3 z-20 flex items-center gap-2 rounded-full border border-white/[0.08] bg-background/80 backdrop-blur-md px-2.5 py-1 shadow-sm">
            <div
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                status === "live" && "bg-emerald-400 animate-pulse shadow-[0_0_8px_hsl(160_70%_55%)]",
                status === "synced" && "bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.5)]",
                status === "idle" && "bg-muted-foreground/40",
                (status === "destructive" || status === "error") && "bg-red-400 shadow-[0_0_6px_hsl(0_80%_60%/0.5)]"
              )}
            />
            <span className="text-[0.6rem] font-bold uppercase leading-none tracking-[0.12em] text-muted-foreground/80">
              {status}
            </span>
          </div>
        )}

        <div className={cn("relative z-10 rounded-[inherit]", variant === "gradient-border" && "bg-[linear-gradient(180deg,hsl(var(--v2-bg-surface)/0.98),hsl(var(--v2-bg-elevated)/0.96))]")}>{children}</div>
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
        "relative flex flex-col gap-2.5",
        {
          "p-4 pb-0": size === "sm",
          "p-5 pb-0 sm:p-6 sm:pb-0": size === "md",
          "p-6 pb-0 sm:p-8 sm:pb-0 lg:p-10 lg:pb-0": size === "lg",
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
    <span className="inline-flex items-center gap-2.5 text-[0.6rem] uppercase tracking-[0.12em] text-muted-foreground/75">
      <span
        ref={ref}
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          tone === "live" && "bg-emerald-400 animate-pulse",
          tone === "synced" && "bg-primary",
          tone === "idle" && "bg-muted-foreground/40",
          (tone === "destructive" || tone === "error") && "bg-red-400",
          className
        )}
        aria-hidden
        {...props}
      />
      {label ? <span className="micro-sans font-semibold">{label}</span> : null}
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
        "font-semibold leading-none tracking-tight text-foreground",
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
    className={cn("text-sm leading-relaxed text-muted-foreground/88", className)}
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
        "text-foreground",
        {
          "p-4": size === "sm",
          "p-5 sm:p-6": size === "md",
          "p-5 sm:p-6 lg:p-10": size === "lg",
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
          "p-5 pt-0 sm:p-6 sm:pt-0": size === "md",
          "p-5 pt-0 sm:p-6 sm:pt-0 lg:p-10 lg:pt-0": size === "lg",
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
  Card as CardV2,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
  CardStatusDot,
}
