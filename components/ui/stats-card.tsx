"use client"

import * as React from "react"
import NumberFlow from "@number-flow/react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardProps } from "./card"
import { CardV2 } from "./v2/card-v2"
import { Badge, BadgeProps } from "./badge"
import { Skeleton } from "./skeleton"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"

type StatsCardTrend = {
  value: number
  isPositive: boolean
}

export interface StatsCardProps extends Omit<CardProps, "size"> {
  title: string
  value: string | number
  icon?: LucideIcon | React.ReactNode
  trend?: StatsCardTrend
  description?: string
  size?: "sm" | "md" | "lg"
  isLoading?: boolean
  onClick?: () => void
  animateValue?: boolean
  formatCurrency?: boolean
  locale?: string
  variant?: "default" | "glass" | "elevated" | "flat"
}

const SIZE_CONFIG = {
  sm: {
    icon: "h-4 w-4",
    value: "text-lg",
    title: "text-xs",
    trend: "text-xs",
    padding: "p-[var(--space-3)]",
    cardTitleSize: "sm" as const,
  },
  md: {
    icon: "h-5 w-5",
    value: "text-2xl",
    title: "text-sm",
    trend: "text-sm",
    padding: "p-[var(--space-4)]",
    cardTitleSize: "md" as const,
  },
  lg: {
    icon: "h-6 w-6",
    value: "text-3xl",
    title: "text-base",
    trend: "text-base",
    padding: "p-[var(--space-5)]",
    cardTitleSize: "lg" as const,
  },
} as const

function formatCurrencyValue(value: number, locale: string = "en-US"): string {
  const formatted = new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value))

  if (locale === "fr") {
    return `${formatted} $`
  }
  return `$${formatted}`
}

function getTrendBadgeVariant(isPositive: boolean): BadgeProps["variant"] {
  return isPositive ? "default" : "destructive"
}

function getTrendIcon(isPositive: boolean) {
  return isPositive ? TrendingUp : TrendingDown
}

interface StatsCardSkeletonProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

function StatsCardSkeleton({ size = "md", className }: StatsCardSkeletonProps) {
  const config = SIZE_CONFIG[size]

  return (
    <Card
      variant="flat"
      className={cn("border-border/40", config.padding, className)}
    >
      <div className="flex flex-col gap-[var(--space-3)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[var(--space-2)] flex-1 min-w-0">
            <Skeleton className={cn(config.icon, "shrink-0")} />
            <Skeleton className={cn("h-4 w-20", config.title)} />
          </div>
          <Skeleton className="h-5 w-12 shrink-0" />
        </div>
        <Skeleton className={cn("h-8 w-32", config.value)} />
        <Skeleton className="h-3 w-24" />
      </div>
    </Card>
  )
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  (
    {
      title,
      value,
      icon: Icon,
      trend,
      description,
      size = "md",
      isLoading = false,
      animateValue = true,
      formatCurrency = false,
      locale = "en-US",
      onClick,
      className,
      variant = "flat",
      ...props
    },
    ref
  ) => {
    const config = SIZE_CONFIG[size]
    const displayValue = React.useMemo(() => {
      if (typeof value !== "number") return value
      if (formatCurrency) return formatCurrencyValue(value, locale)
      return value.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")
    }, [value, formatCurrency, locale])

    if (isLoading) {
      return <StatsCardSkeleton size={size} className={className} />
    }

    const rawNumber = typeof value === "number" && !formatCurrency ? value : undefined

    const renderIcon = () => {
      if (!Icon) return null
      if (React.isValidElement(Icon)) return Icon
      if (typeof Icon === "function") {
        const IconComponent = Icon as LucideIcon
        return <IconComponent className={config.icon} />
      }
      return null
    }

    return (
      <Card
        ref={ref}
        variant={variant}
        hover={!!onClick}
        clickable={!!onClick}
        className={cn("group", config.padding, className)}
        onClick={onClick}
        aria-label={title}
        {...props}
      >
        {(title || Icon || trend) && (
          <CardHeader size={size} className="flex-row items-center justify-between pb-[var(--space-2)]">
            <div className="flex items-center gap-[var(--space-2)] flex-1 min-w-0">
              {renderIcon() && (
                <div className="shrink-0 text-v2-text-muted group-hover:text-v2-accent transition-colors duration-200" aria-hidden="true">
                  {renderIcon()}
                </div>
              )}
              <h3 className={cn(
                "font-medium text-v2-text-muted truncate micro-sans",
                config.title
              )}>
                {title}
              </h3>
            </div>

            {trend && (
              <Badge
                variant={getTrendBadgeVariant(trend.isPositive)}
                className={cn(
                  "shrink-0 gap-1 font-medium",
                  config.trend,
                  "bg-v2-bg-surface/50 border-v2-border/40"
                )}
                aria-label={`${trend.isPositive ? 'Increased' : 'Decreased'} by ${Math.abs(trend.value)}%`}
              >
                {React.createElement(getTrendIcon(trend.isPositive), {
                  className: cn(config.icon, "stroke-2"),
                  "aria-hidden": true,
                })}
                <span>{trend.isPositive ? "+" : ""}{trend.value}%</span>
              </Badge>
            )}
          </CardHeader>
        )}

        <CardContent size={size} className="gap-[var(--space-2)]">
          <div
            className={cn(
              "font-bold tracking-tight tabular-nums micro-sans",
              config.value,
              trend
                ? trend.isPositive
                  ? "metric-positive"
                  : "metric-negative"
                : "text-v2-text-primary",
              "transition-colors duration-200"
            )}
            aria-label={`Value: ${displayValue}`}
          >
            {rawNumber !== undefined && animateValue ? (
              <NumberFlow
                value={rawNumber}
                locales={locale === "fr" ? "fr-FR" : "en-US"}
                className="inherit"
              />
            ) : (
              displayValue
            )}
          </div>

          {description && (
            <p className={cn(
              "text-v2-text-muted micro-sans",
              config.trend
            )}>
              {description}
            </p>
          )}
        </CardContent>
      </Card>
    )
  }
)

StatsCard.displayName = "StatsCard"

export interface ModernStatsCardProps extends Omit<StatsCardProps, "variant"> {
  glass?: boolean
}

const ModernStatsCard = React.forwardRef<HTMLDivElement, ModernStatsCardProps>(
  (
    {
      title,
      value,
      icon: Icon,
      trend,
      description,
      size = "md",
      isLoading = false,
      animateValue = true,
      formatCurrency = false,
      locale = "en-US",
      glass = false,
      onClick,
      className,
      ...props
    },
    ref
  ) => {
    const config = SIZE_CONFIG[size]
    const displayValue = React.useMemo(() => {
      if (typeof value !== "number") return value
      if (formatCurrency) return formatCurrencyValue(value, locale)
      return value.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")
    }, [value, formatCurrency, locale])

    if (isLoading) {
      return (
        <CardV2
          className={cn(
            "relative overflow-hidden rounded-xl border",
            "border-v2-border/16 bg-v2-bg-surface/88",
            "shadow-[inset_0_1px_0_hsl(var(--foreground)_/_0.035)]",
            config.padding,
            className
          )}
        >
          <div className="flex flex-col gap-[var(--space-3)]">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className={cn("h-8 w-32", config.value)} />
            <Skeleton className="h-3 w-24" />
          </div>
        </CardV2>
      )
    }

    const rawNumber = typeof value === "number" && !formatCurrency ? value : undefined

    const renderIcon = () => {
      if (!Icon) return null
      if (React.isValidElement(Icon)) return Icon
      if (typeof Icon === "function") {
        const IconComponent = Icon as LucideIcon
        return <IconComponent className={config.icon} />
      }
      return null
    }

    return (
      <CardV2
        ref={ref}
        data-widget-shell="v2"
        className={cn(
          "group relative overflow-hidden rounded-xl border transition-all duration-[180ms]",
          "border-v2-border/16 bg-v2-bg-surface/88",
          "shadow-[inset_0_1px_0_hsl(var(--foreground)_/_0.035)]",
          "hover:border-v2-border/24 hover:bg-v2-bg-surface/92",
          glass && "bg-v2-bg-surface/60 backdrop-blur-md",
          !!onClick && "cursor-pointer hover:shadow-md",
          config.padding,
          className
        )}
        onClick={onClick}
        aria-label={title}
        {...props}
      >
        {(title || trend) && (
          <div className="flex items-center justify-between gap-[var(--space-3)]">
            <div className="flex items-center gap-[var(--space-2)] flex-1 min-w-0">
              {renderIcon() && (
                <div className="shrink-0 text-v2-text-muted group-hover:text-v2-accent transition-colors duration-200" aria-hidden="true">
                  {renderIcon()}
                </div>
              )}
              <h3 className={cn("text-v2-text-muted truncate micro-sans", config.title)}>
                {title}
              </h3>
            </div>

            {trend && (
              <Badge
                variant={getTrendBadgeVariant(trend.isPositive)}
                className={cn(
                  "shrink-0 gap-1 font-medium",
                  config.trend
                )}
                aria-label={`${trend.isPositive ? 'Increased' : 'Decreased'} by ${Math.abs(trend.value)}%`}
              >
                {React.createElement(getTrendIcon(trend.isPositive), {
                  className: cn(config.icon, "stroke-2"),
                  "aria-hidden": true,
                })}
                <span>{trend.isPositive ? "+" : ""}{trend.value}%</span>
              </Badge>
            )}
          </div>
        )}

        <div
          className={cn(
            "font-bold tracking-tight tabular-nums micro-sans",
            config.value,
            trend
              ? trend.isPositive
                ? "metric-positive"
                : "metric-negative"
              : "text-v2-text-primary",
            "transition-colors duration-200"
          )}
          aria-label={`Value: ${displayValue}`}
        >
          {rawNumber !== undefined && animateValue ? (
            <NumberFlow
              value={rawNumber}
              locales={locale === "fr" ? "fr-FR" : "en-US"}
              className="inherit"
            />
          ) : (
            displayValue
          )}
        </div>

        {description && (
          <p className={cn(
            "text-v2-text-muted micro-sans",
            config.trend
          )}>
            {description}
          </p>
        )}
      </CardV2>
    )
  }
)

ModernStatsCard.displayName = "ModernStatsCard"

export { StatsCard, ModernStatsCard, StatsCardSkeleton }
export type { StatsCardSkeletonProps }
