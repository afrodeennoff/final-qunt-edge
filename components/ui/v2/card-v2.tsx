import * as React from "react"
import { cn } from "@/lib/utils"

export type CardVariant = "default" | "glass" | "elevated" | "outlined" | "flat" | "matte"
export type CardSize = "sm" | "md" | "lg"
export type CardStatusTone = "live" | "synced" | "idle" | "error"

interface CardV2Props extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  hover?: boolean
  size?: CardSize
  clickable?: boolean
  status?: CardStatusTone
}

const CardV2 = React.forwardRef<HTMLDivElement, CardV2Props>(
  ({
    className,
    variant = "default",
    hover = true,
    size = "md",
    clickable = false,
    status,
    ...props
  }, ref) => {
    const isInteractive = clickable || typeof props.onClick === "function"

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (isInteractive && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault()
        props.onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>)
      }
    }

    // Variant classes
    const variantClasses = cn(
      {
        // Default: subtle border, surface background
        default: "border-v2-border bg-v2-bg-surface",
        // Glass: subtle border, translucent background, backdrop blur
        glass: "border-v2-border-subtle bg-v2-bg-surface/10 backdrop-blv2",
        // Elevated: subtle border, surface background, medium shadow
        elevated: "border-v2-border bg-v2-bg-surface shadow-v2-md",
        // Outlined: bold border, transparent background, no shadow
        outlined: "border-2 border-v2-border bg-transparent shadow-none",
        // Flat: no border, transparent background, no shadow
        flat: "border-0 bg-transparent shadow-none",
        // Matte: thin border, surface background, text foreground, no shadow (precision panel style)
        matte: "border border-v2-border/60 bg-v2-bg-surface text-v2-text-foreground shadow-none",
      },
      variant
    )

    // Size classes (adjust padding)
    const sizeClasses = cn(
      {
        sm: "p-v2-2",
        md: "p-v2-6",
        lg: "p-v2-8",
      },
      size
    )

    // Status dot (if status is provided)
    const statusDot = status ? (
      <div className="absolute right-[var(--v2-space-3)] top-[var(--v2-space-3)] z-20 flex items-center gap-[var(--v2-space-2)] rounded-full border border-v2-border-muted bg-v2-bg-surface/80 px-[var(--v2-space-2)] py-[var(--v2-space-1)] backdrop-blur-sm">
        <div className={cn(
          "status-dot",
          status === "live" && "status-dot-live",
          status === "synced" && "status-dot-synced",
          status === "idle" && "status-dot-idle",
          status === "error" && "status-dot-error"
        )} />
        <span className="text-[var(--v2-type-xs)] font-semibold uppercase leading-none tracking-widest text-v2-text-muted">
          {status}
        </span>
      </div>
    ) : null

    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-v2-lg border bg-v2-bg-surface text-v2-text-primary shadow-sm",
          variantClasses,
          sizeClasses,
          {
            "border-v2-border bg-v2-bg-surface": variant === "default",
            "border-v2-border-subtle bg-v2-bg-surface/10 backdrop-blv2": variant === "glass",
            "border-v2-border bg-v2-bg-surface shadow-v2-md": variant === "elevated",
            "border-2 border-v2-border bg-transparent shadow-none": variant === "outlined",
            "border-0 bg-transparent shadow-none": variant === "flat",
            "border border-v2-border/60 bg-v2-bg-surface text-v2-text-foreground shadow-none": variant === "matte",
          },
          {
            "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-v2-md": hover,
            "cursor-pointer": isInteractive,
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-ring focus-visible:ring-offset-v2-bg-base":
              isInteractive,
          },
          className
        )}
        onKeyDown={isInteractive ? handleKeyDown : undefined}
        onClick={isInteractive ? props.onClick : undefined}
        {...props}
      >
        {statusDot}
        {props.children}
      </div>
    )
  }
)
CardV2.displayName = "CardV2"

export { CardV2 }