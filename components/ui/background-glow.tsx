"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type BackgroundGlowVariant = "default" | "accent"

interface BackgroundGlowProps {
  className?: string
  variant?: BackgroundGlowVariant
}

const BackgroundGlow = React.forwardRef<HTMLDivElement, BackgroundGlowProps>(
  ({ className, variant = "default" }, ref) => {
    if (variant === "accent") {
      return (
        <div
          ref={ref}
          className={cn(
            "absolute top-0 left-0 w-full h-full pointer-events-none z-0",
            className
          )}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_82%_54%_at_50%_-16%,oklch(0.80_0.12_82/0.26),transparent_52%),radial-gradient(ellipse_64%_44%_at_85%_105%,oklch(0.54_0.08_20/0.22),transparent_52%)]" />
          <div className="absolute inset-0 opacity-[0.05]">
            <div className="absolute inset-0 bg-[linear-gradient(oklch(0.65_0.22_260/0.03)_1px,transparent_1px),linear-gradient(90deg,oklch(0.65_0.22_260/0.03)_1px,transparent_1px)] bg-[length:48px_48px]" />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/90 to-transparent" />
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          "pointer-events-none absolute left-0 top-0 z-0 h-full w-full",
          className
        )}
      >
        <div className="absolute left-[-20%] top-[-20%] h-[70%] w-[70%] rounded-full bg-[radial-gradient(circle,oklch(0.65_0.22_260/0.12)_0%,transparent_70%)]" />
        <div className="absolute bottom-[-25%] right-[-25%] h-[65%] w-[65%] rounded-full bg-[radial-gradient(circle,oklch(0.65_0.22_260/0.08)_0%,transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.04] qe-v2-grid" />
      </div>
    )
  }
)

BackgroundGlow.displayName = "BackgroundGlow"

export { BackgroundGlow }
export type { BackgroundGlowProps }
