"use client"

import * as React from "react"
import NumberFlow from "@number-flow/react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardProps } from "./card"
import { Badge, BadgeProps } from "./badge"
import { Skeleton } from "./skeleton"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"

type StatsCardTrend = {
 value: number
 isPositive: boolean
}

export interface StatsCardProps extends Omit<CardProps,"size"> {
 title: string
 value: string | number
 icon?: LucideIcon | React.ReactNode
 trend?: StatsCardTrend
 description?: string
 size?:"sm" |"md" |"lg"
 isLoading?: boolean
 onClick?: () => void
 animateValue?: boolean
 formatCurrency?: boolean
 locale?: string
  variant?:"default" |"flat"
}

const SIZE_CONFIG = {
 sm: {
 icon:"h-4 w-4",
 value:"text-lg",
 title:"text-xs",
 trend:"text-xs",
  padding:"p-4",
 cardTitleSize:"sm" as const,
 },
 md: {
 icon:"h-5 w-5",
 value:"text-2xl",
 title:"text-sm",
 trend:"text-sm",
  padding:"p-4",
 cardTitleSize:"md" as const,
 },
 lg: {
 icon:"h-6 w-6",
 value:"text-3xl",
 title:"text-base",
 trend:"text-base",
 padding:"p-6",
 cardTitleSize:"lg" as const,
 },
} as const

function formatCurrencyValue(value: number, locale: string ="en-US"): string {
 const formatted = new Intl.NumberFormat(locale ==="fr" ?"fr-FR" :"en-US", {
 minimumFractionDigits: 2,
 maximumFractionDigits: 2,
 }).format(Math.abs(value))

 if (locale ==="fr") {
 return `${formatted} $`
 }
 return `$${formatted}`
}

function getTrendBadgeVariant(isPositive: boolean): BadgeProps["variant"] {
 return isPositive ?"success" :"destructive"
}

function getTrendIcon(isPositive: boolean) {
 return isPositive ? TrendingUp : TrendingDown
}

interface StatsCardSkeletonProps {
 size?:"sm" |"md" |"lg"
 className?: string
}

function StatsCardSkeleton({ size ="md", className }: StatsCardSkeletonProps) {
 const config = SIZE_CONFIG[size]

 return (
  <div
   className={cn("rounded-xl bg-card border-0",
  config.padding,
  className
  )}
  >
 <div className="flex flex-col gap-3">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2 flex-1 min-w-0">
 <Skeleton className={cn(config.icon,"shrink-0")} />
 <Skeleton className={cn("h-4 w-20", config.title)} />
 </div>
 <Skeleton className="h-5 w-12 shrink-0" />
 </div>
 <Skeleton className={cn("h-8 w-32", config.value)} />
 <Skeleton className="h-3 w-24" />
 </div>
 </div>
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
 size ="md",
 isLoading = false,
 animateValue = true,
 formatCurrency = false,
 locale ="en-US",
 onClick,
 className,
 variant ="flat",
 ...props
 },
 ref
 ) => {
 const config = SIZE_CONFIG[size]
 const displayValue = React.useMemo(() => {
 if (typeof value !=="number") return value
 if (formatCurrency) return formatCurrencyValue(value, locale)
 return value.toLocaleString(locale ==="fr" ?"fr-FR" :"en-US")
 }, [value, formatCurrency, locale])

 if (isLoading) {
 return <StatsCardSkeleton size={size} className={className} />
 }

 const rawNumber = typeof value ==="number" && !formatCurrency ? value : undefined

 const renderIcon = () => {
 if (!Icon) return null
 if (React.isValidElement(Icon)) return Icon
 if (typeof Icon ==="function") {
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
 className={cn("group flex flex-col justify-center", config.padding, className)}
 onClick={onClick}
 aria-label={title}
 {...props}
 >
 {(title || Icon || trend) && (
 <CardHeader size={size} className="flex-row items-center justify-between pb-2">
 <div className="flex items-center gap-2 flex-1 min-w-0">
  {renderIcon() && (
   <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/50 border-0 text-muted-foreground" aria-hidden="true">
  {renderIcon()}
  </div>
  )}
 <h3 className={cn("font-black text-muted-foreground/80 truncate micro-sans",
 config.title
 )}>
 {title}
 </h3>
 </div>

 {trend && (
 <Badge
 variant={getTrendBadgeVariant(trend.isPositive)}
 size="sm"
 
 className="shrink-0 gap-1"
 aria-label={`${trend.isPositive ? 'Increased' : 'Decreased'} by ${Math.abs(trend.value)}%`}
 >
 {React.createElement(getTrendIcon(trend.isPositive), {
 className: cn("h-3 w-3","stroke-2"),"aria-hidden": true,
 })}
 <span>{trend.isPositive ?"+" :""}{trend.value}%</span>
 </Badge>
 )}
 </CardHeader>
 )}

 <CardContent size={size} className="gap-1.5 flex flex-col justify-center">
 <div
 className={cn("font-bold tracking-tight tabular-nums",
 config.value,
 trend
 ? trend.isPositive
 ?"text-success"
 :"text-destructive"
 :"text-foreground"
 )}
 aria-label={`Value: ${displayValue}`}
 >
 {rawNumber !== undefined && animateValue ? (
 <NumberFlow
 value={rawNumber}
 locales={locale ==="fr" ?"fr-FR" :"en-US"}
 className="inherit"
 />
 ) : (
 displayValue
 )}
 </div>

 {description && (
 <p className={cn("text-muted-foreground/60 micro-sans",
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

StatsCard.displayName ="StatsCard"

export { StatsCard, StatsCardSkeleton }
export type { StatsCardSkeletonProps }
