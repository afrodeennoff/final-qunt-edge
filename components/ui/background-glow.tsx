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
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(var(--v2-accent)/0.06),transparent_50%),radial-gradient(ellipse_60%_40%_at_80%_100%,oklch(var(--v2-accent)/0.04),transparent_50%)]" />
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute inset-0 bg-[linear-gradient(oklch(0.97_0_0/0.03)_1px,transparent_1px),linear-gradient(90deg,oklch(0.97_0_0/0.03)_1px,transparent_1px)] bg-[length:48px_48px]" />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
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
        <div className="absolute left-[-10%] top-[-10%] h-[45%] w-[45%] rounded-full bg-primary/6 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[45%] w-[45%] rounded-full bg-primary/8 blur-[120px] animate-pulse-slow" />
      </div>
    )
  }
)

BackgroundGlow.displayName = "BackgroundGlow"

export { BackgroundGlow }
export type { BackgroundGlowProps }