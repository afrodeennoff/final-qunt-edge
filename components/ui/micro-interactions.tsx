"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface HoverLiftProps extends React.HTMLAttributes<HTMLDivElement> {}

export const HoverLift = React.forwardRef<HTMLDivElement, HoverLiftProps>(
  ({
    children,
    className,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "hover-lift",
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

// Press feedback using CSS utility class
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
        className={cn("press-scale",
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
        className={cn("animate-stagger", className)}
        style={{ "--stagger-delay": `${delay}ms` } as React.CSSProperties}
        {...props}
      >
        {children}
      </div>
    )
  }
)
StaggerContainer.displayName = "StaggerContainer"
