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

type CardV2TitleProps = React.HTMLAttributes<HTMLHeadingElement>
type CardV2DescriptionProps = React.HTMLAttributes<HTMLParagraphElement>
type CardV2ContentProps = React.HTMLAttributes<HTMLDivElement>

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

    const variantClasses = cn(
      {
        default: "border-v2-border bg-v2-bg-surface",
        glass: "border-v2-border-subtle bg-v2-bg-surface/10 backdrop-blur-md",
        elevated: "border-v2-border bg-v2-bg-surface shadow-v2-md",
        outlined: "border-2 border-v2-border bg-transparent shadow-none",
        flat: "border-0 bg-transparent shadow-none",
        matte: "border border-v2-border/60 bg-v2-bg-surface text-v2-text-primary shadow-none",
      },
      variant
    )

    const sizeClasses = cn(
      {
        sm: "p-v2-2",
        md: "p-v2-6",
        lg: "p-v2-8",
      },
      size
    )

    const statusDot = status ? (
      <div className="absolute right-[var(--v2-space-3)] top-[var(--v2-space-3)] z-20 flex items-center gap-[var(--v2-space-2)] rounded-full border border-v2-border-subtle bg-v2-bg-surface/80 px-[var(--v2-space-2)] py-[var(--v2-space-1)] backdrop-blur-sm">
        <div className={cn(
          "status-dot",
          status === "live" && "status-dot-live",
          status === "synced" && "status-dot-synced",
          status === "idle" && "status-dot-idle",
          status === "error" && "status-dot-error"
        )} />
        <span className="text-[var(--v2-type-xs)] font-semibold uppercase leading-none tracking-widest text-v2-text-secondary">
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
            "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-v2-md": hover,
            "cursor-pointer": isInteractive,
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-ring focus-visible:ring-offset-v2-bg-base": isInteractive,
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

const CardV2Title = React.forwardRef<HTMLHeadingElement, CardV2TitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-lg font-semibold leading-tight tracking-tight text-v2-text-primary", className)}
      {...props}
    />
  )
)
CardV2Title.displayName = "CardV2Title"

const CardV2Description = React.forwardRef<HTMLParagraphElement, CardV2DescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-v2-text-secondary", className)}
      {...props}
    />
  )
)
CardV2Description.displayName = "CardV2Description"

const CardV2Content = React.forwardRef<HTMLDivElement, CardV2ContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-base text-v2-text-primary", className)}
      {...props}
    />
  )
)
CardV2Content.displayName = "CardV2Content"

export { CardV2, CardV2Title, CardV2Description, CardV2Content }
