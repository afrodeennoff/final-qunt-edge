"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react"
import { unifiedMetricPanelClassName } from "@/components/layout/unified-page-recipes"

export interface DashboardStatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  icon?: LucideIcon | React.ReactNode
  trend?: {
    value: string | number
    direction?: "up" | "down" | "neutral"
    label?: string
  }
  size?: "sm" | "md" | "lg"
  valueClassName?: string
}

const sizeClasses = {
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
} as const

const valueSizeClasses = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
} as const

export function DashboardStatCard({
  label,
  value,
  icon: Icon,
  trend,
  size = "md",
  className,
  valueClassName,
  children,
  ...props
}: DashboardStatCardProps) {
  const TrendIcon = trend
    ? trend.direction === "up"
      ? TrendingUp
      : trend.direction === "down"
        ? TrendingDown
        : Minus
    : null

  const trendColor =
    trend?.direction === "up"
      ? "text-success"
      : trend?.direction === "down"
        ? "text-destructive"
        : "text-muted-foreground"

  return (
    <div
      className={cn(
        unifiedMetricPanelClassName,
        sizeClasses[size],
        "group transition-all duration-300 hover:border-primary/25 hover:shadow-[0_0_35px_-18px] hover:shadow-primary/15",
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {React.isValidElement(Icon) ? (
              Icon
            ) : typeof Icon === "function" ? (
              React.createElement(Icon as LucideIcon, { className: "h-4 w-4" })
            ) : null}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
            {label}
          </p>
          <div
            className={cn(
              "mt-1 font-mono tabular-nums tracking-[1px] font-semibold text-foreground",
              valueSizeClasses[size],
              valueClassName
            )}
          >
            {value}
          </div>
          {trend && (
            <div className={cn("mt-1 flex items-center gap-1 text-xs", trendColor)}>
              {TrendIcon && <TrendIcon className="h-3 w-3" />}
              <span>
                {trend.value}
                {trend.label ? ` ${trend.label}` : ""}
              </span>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}
