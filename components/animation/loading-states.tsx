"use client"

import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"
import { SPRING_PRESETS } from "./entrance-exit"

const MOTION_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

interface SkeletonProps {
  className?: string
  variant?: "default" | "shimmer" | "pulsing"
  width?: string | number
  height?: string | number
  rounded?: boolean
}

export function Skeleton({
  className,
  variant = "default",
  width,
  height,
  rounded = false,
}: SkeletonProps) {
  const prefersReducedMotion = useReducedMotion()

  const baseClassName = cn(
    "bg-muted",
    rounded ? "rounded-full" : "rounded-md",
    className
  )

  if (prefersReducedMotion || variant === "default") {
    return <div className={baseClassName} style={{ width, height }} />
  }

  if (variant === "shimmer") {
    return (
      <div
        className={cn("relative overflow-hidden", baseClassName)}
        style={{ width, height }}
      >
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ["200% 0", "-200% 0"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            background: `linear-gradient(
              90deg,
              transparent 0%,
              hsl(var(--foreground) / 0.05) 20%,
              hsl(var(--foreground) / 0.1) 50%,
              hsl(var(--foreground) / 0.05) 80%,
              transparent 100%
            )`,
            backgroundSize: "200% 100%",
          }}
        />
      </div>
    )
  }

  if (variant === "pulsing") {
    return (
      <motion.div
        className={baseClassName}
        style={{ width, height }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    )
  }

  return <div className={baseClassName} style={{ width, height }} />
}

interface SkeletonCardProps {
  className?: string
  hasAvatar?: boolean
  hasTitle?: boolean
  hasDescription?: boolean
  lines?: number
  shimmer?: boolean
}

export function SkeletonCard({
  className,
  hasAvatar = true,
  hasTitle = true,
  hasDescription = true,
  lines = 3,
  shimmer = false,
}: SkeletonCardProps) {
  return (
    <div className={cn("space-y-3 p-4", className)}>
      {hasAvatar && (
        <div className="flex items-center space-x-3">
          <Skeleton variant={shimmer ? "shimmer" : "default"} width={40} height={40} rounded />
          <div className="flex-1 space-y-2">
            <Skeleton variant={shimmer ? "shimmer" : "default"} height={16} width="60%" />
            <Skeleton variant={shimmer ? "shimmer" : "default"} height={14} width="40%" />
          </div>
        </div>
      )}
      {hasTitle && (
        <Skeleton variant={shimmer ? "shimmer" : "default"} height={24} width="80%" />
      )}
      {hasDescription &&
        Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            variant={shimmer ? "shimmer" : "default"}
            height={16}
            width={i === lines - 1 ? "70%" : "100%"}
          />
        ))}
    </div>
  )
}

interface ShimmerProps {
  children: React.ReactNode
  className?: string
  shimmerWidth?: string
  shimmerDuration?: number
}

export function Shimmer({
  children,
  className,
  shimmerWidth = "200%",
  shimmerDuration = 2,
}: ShimmerProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          backgroundPosition: [`${shimmerWidth} 0`, `-${shimmerWidth} 0`],
        }}
        transition={{
          duration: shimmerDuration,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          background: `linear-gradient(
            90deg,
            transparent 0%,
            hsl(var(--foreground) / 0.05) 20%,
            hsl(var(--foreground) / 0.1) 50%,
            hsl(var(--foreground) / 0.05) 80%,
            transparent 100%
          )`,
          backgroundSize: `${shimmerWidth} 100%`,
        }}
      />
      {children}
    </div>
  )
}

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  animated?: boolean
  color?: "primary" | "success" | "warning" | "error"
  size?: "sm" | "md" | "lg"
}

export function ProgressBar({
  value,
  max = 100,
  className,
  animated = true,
  color = "primary",
  size = "md",
}: ProgressBarProps) {
  const prefersReducedMotion = useReducedMotion()
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const colorClasses = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    error: "bg-destructive",
  }

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  }

  return (
    <div className={cn("w-full bg-muted rounded-full overflow-hidden", sizeClasses[size], className)}>
      <motion.div
        className={cn("rounded-full", colorClasses[color])}
        initial={prefersReducedMotion ? undefined : { width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={
          animated && !prefersReducedMotion
            ? { duration: 0.6, ease: MOTION_EASE }
            : undefined
        }
      />
    </div>
  )
}

interface CircularProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  className?: string
  animated?: boolean
  color?: "primary" | "success" | "warning" | "error"
}

export function CircularProgress({
  value,
  max = 100,
  size = 48,
  strokeWidth = 4,
  className,
  animated = true,
  color = "primary",
}: CircularProgressProps) {
  const prefersReducedMotion = useReducedMotion()
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const colorClasses = {
    primary: "stroke-primary",
    success: "stroke-success",
    warning: "stroke-warning",
    error: "stroke-destructive",
  }

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted opacity-20"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className={colorClasses[color]}
          strokeLinecap="round"
          initial={
            animated && !prefersReducedMotion
              ? { strokeDashoffset: circumference }
              : { strokeDashoffset }
          }
          animate={{ strokeDashoffset }}
          transition={
            animated && !prefersReducedMotion
              ? { duration: 0.6, ease: MOTION_EASE }
              : undefined
          }
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
          }}
        />
      </svg>
      <span className="absolute text-xs font-medium" style={{ fontSize: size * 0.25 }}>
        {Math.round(percentage)}%
      </span>
    </div>
  )
}

interface PulseLoaderProps {
  className?: string
  size?: "sm" | "md" | "lg"
  count?: number
}

export function PulseLoader({
  className,
  size = "md",
  count = 3,
}: PulseLoaderProps) {
  const prefersReducedMotion = useReducedMotion()

  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  }

  const delay = 0.15

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={cn("rounded-full bg-primary", sizeClasses[size])}
          animate={
            prefersReducedMotion
              ? { scale: 1, opacity: 1 }
              : {
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }
          }
          transition={
            prefersReducedMotion
              ? {}
              : {
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * delay,
                  ease: "easeInOut",
                }
          }
        />
      ))}
    </div>
  )
}

interface SpinLoaderProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function SpinLoader({ className, size = "md" }: SpinLoaderProps) {
  const prefersReducedMotion = useReducedMotion()

  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
  }

  return (
    <motion.div
      className={cn(
        "rounded-full border-primary border-t-transparent",
        sizeClasses[size],
        className
      )}
      animate={
        prefersReducedMotion
          ? {}
          : {
              rotate: 360,
            }
      }
      transition={
        prefersReducedMotion
          ? {}
          : {
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }
      }
    />
  )
}
