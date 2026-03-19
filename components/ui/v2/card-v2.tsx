import * as React from "react"
import { cn } from "@/lib/utils"

interface CardV2Props extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

const CardV2 = React.forwardRef<HTMLDivElement, CardV2Props>(
  ({ className, hover = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-v2-lg border border-v2-border bg-v2-bg-surface p-v2-6",
        hover && "card-v2 cursor-pointer",
        className
      )}
      {...props}
    />
  )
)
CardV2.displayName = "CardV2"

const CardV2Header = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 pb-v2-4", className)} {...props} />
  )
)
CardV2Header.displayName = "CardV2Header"

const CardV2Title = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight text-v2-text-primary", className)} {...props} />
  )
)
CardV2Title.displayName = "CardV2Title"

const CardV2Description = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-v2-text-secondary", className)} {...props} />
  )
)
CardV2Description.displayName = "CardV2Description"

const CardV2Content = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("pt-0", className)} {...props} />
  )
)
CardV2Content.displayName = "CardV2Content"

const CardV2Footer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center pt-v2-4", className)} {...props} />
  )
)
CardV2Footer.displayName = "CardV2Footer"

export { CardV2, CardV2Header, CardV2Title, CardV2Description, CardV2Content, CardV2Footer }
