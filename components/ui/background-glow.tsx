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
    // Minimal: no glowing orbs, no heavy gradients — calm professional void
    if (variant === "accent") {
      return (
        <div
          ref={ref}
          className={cn(
            "absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-10",
            className
          )}
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[length:64px_64px]" />
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          "pointer-events-none absolute left-0 top-0 z-0 h-full w-full opacity-5",
          className
        )}
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[length:80px_80px]" />
      </div>
    )
  }
)

BackgroundGlow.displayName = "BackgroundGlow"

export { BackgroundGlow }
export type { BackgroundGlowProps }
