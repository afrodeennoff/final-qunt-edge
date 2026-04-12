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
          className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_82%_54%_at_50%_-16%,oklch(0.74_0.16_250/0.18),transparent_52%),radial-gradient(ellipse_64%_44%_at_85%_105%,oklch(0.64_0.16_286/0.14),transparent_52%)]" />
          <div className="absolute inset-0 opacity-[0.045]">
            <div className="absolute inset-0 bg-[linear-gradient(oklch(0.97_0_0/0.03)_1px,transparent_1px),linear-gradient(90deg,oklch(0.97_0_0/0.03)_1px,transparent_1px)] bg-[length:48px_48px]" />
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
        {/* Static gradient orbs — no animation for maximum scroll performance */}
        <div className="absolute left-[-10%] top-[-10%] h-[48%] w-[48%] rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute bottom-[-12%] right-[-10%] h-[44%] w-[44%] rounded-full bg-emerald-300/10 blur-[140px]" />
        <div className="absolute inset-0 opacity-[0.035] qe-v2-grid" />
      </div>
    )
  }
)

BackgroundGlow.displayName = "BackgroundGlow"

export { BackgroundGlow }
export type { BackgroundGlowProps }
