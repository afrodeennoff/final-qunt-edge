import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

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
    const sizeClasses = cn(
      {
        sm: "p-v2-2",
        md: "p-v2-6",
        lg: "p-v2-8",
      },
      size
    )

    return (
      <Card
        ref={ref}
        variant={variant}
        hover={hover}
        size={size}
        clickable={clickable}
        status={status}
        className={cn(
          "rounded-v2-lg border-v2-border bg-v2-bg-surface text-v2-text-primary",
          variant === "glass" && "border-v2-border-subtle bg-v2-bg-surface/10 backdrop-blur-md",
          variant === "elevated" && "shadow-v2-md",
          variant === "outlined" && "border-2 border-v2-border bg-transparent shadow-none",
          variant === "flat" && "border-0 bg-transparent shadow-none",
          variant === "matte" && "border-v2-border/60 bg-v2-bg-surface text-v2-text-primary shadow-none",
          sizeClasses,
          className
        )}
        {...props}
      >
        {props.children}
      </Card>
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
