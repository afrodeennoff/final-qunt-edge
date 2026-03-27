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
  ({ className, variant = "default", hover = true, size = "md", clickable = false, status, onClick, children, ...props }, ref) => {
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
        onClick={isInteractive ? onClick : undefined}
        className={cn(
          "relative rounded-v2-lg border-v2-border bg-v2-bg-surface text-v2-text-primary",
          variant === "glass" && "border-v2-border bg-v2-bg-surface/10 backdrop-blur-md",
          variant === "elevated" && "shadow-md",
          variant === "outlined" && "border-2 border-v2-border bg-transparent shadow-none",
          variant === "flat" && "border-0 bg-transparent shadow-none",
          variant === "matte" && "border-v2-border/60 bg-v2-bg-surface text-v2-text-primary shadow-none",
          size === "sm" && "p-2",
          size === "md" && "p-6",
          size === "lg" && "p-8",
          isInteractive && "cursor-pointer",
          isInteractive && "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-accent focus-visible:ring-offset-2 focus-visible:ring-offset-v2-bg-base",
          isInteractive && hover && "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
          className
        )}
        {...props}
      >
        {status && (
          <div className="absolute right-3 top-3 z-20 flex items-center gap-2 rounded-full border border-v2-border bg-v2-bg-base/80 px-2 py-1 backdrop-blur-sm">
            <div className={cn(
              "h-1.5 w-1.5 rounded-full",
              status === "live" && "bg-green-500 animate-pulse",
              status === "synced" && "bg-blue-500",
              status === "idle" && "bg-gray-500",
              status === "error" && "bg-red-500"
            )} />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-v2-text-muted">
              {status}
            </span>
          </div>
        )}
        <div className="relative z-10">{children}</div>
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

const CardV2Header = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-2 p-6 pt-0", className)} {...props} />
  )
)
CardV2Header.displayName = "CardV2Header"

const CardV2Footer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
)
CardV2Footer.displayName = "CardV2Footer"

export { CardV2, CardV2Title, CardV2Description, CardV2Content, CardV2Header, CardV2Footer }
