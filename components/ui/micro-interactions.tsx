"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Hover lift effect
export interface HoverLiftProps extends React.HTMLAttributes<HTMLDivElement> {
  liftAmount?: string
}

export const HoverLift = React.forwardRef<HTMLDivElement, HoverLiftProps>(
  ({
    children,
    className,
    liftAmount = "-translate-y-1",
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "transition-[opacity,background-color,border-color] duration-200 ease-out hover:shadow-sm",
          `hover:${liftAmount}`,
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
HoverLift.displayName = "HoverLift"

// Press feedback
export interface PressFeedbackProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const PressFeedback = React.forwardRef<HTMLButtonElement, PressFeedbackProps>(
  ({
    children,
    className,
    ...props
  }, ref) => {
    return (
      <button
        ref={ref}
        className={cn("transition-transform duration-100 active:scale-[0.97]",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
PressFeedback.displayName = "PressFeedback"

// Shimmer loading effect (simple loading bar, not glow-based)
export interface ShimmerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Shimmer = React.forwardRef<HTMLDivElement, ShimmerProps>(
  ({
    className,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "animate-shimmer bg-gradient-to-r from-transparent via-foreground/5 to-transparent bg-[length:200%_100%]",
          className
        )}
        {...props}
      />
    )
  }
)
Shimmer.displayName = "Shimmer"

// Stagger container for lists
export interface StaggerContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number
}

export const StaggerContainer = React.forwardRef<HTMLDivElement, StaggerContainerProps>(
  ({
    children,
    className,
    delay = 100,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("stagger-reveal", className)}
        style={{ "--stagger-delay": `${delay}ms` } as React.CSSProperties}
        {...props}
      >
        {children}
      </div>
    )
  }
)
StaggerContainer.displayName = "StaggerContainer"
