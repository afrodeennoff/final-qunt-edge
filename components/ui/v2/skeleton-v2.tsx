import * as React from "react"
import { cn } from "@/lib/utils"

export type SkeletonV2Props = React.HTMLAttributes<HTMLDivElement>

const SkeletonV2 = React.forwardRef<HTMLDivElement, SkeletonV2Props>(
  ({ className, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("skeleton-v2 rounded-v2-md", className)}
      style={{
        backgroundColor: 'hsl(var(--v2-bg-elevated))',
        ...style,
      }}
      {...props}
    />
  )
)
SkeletonV2.displayName = "SkeletonV2"

export { SkeletonV2 }
