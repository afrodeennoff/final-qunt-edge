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
 variant?:"default" |"glass" |"elevated" |"flat"
}

const SIZE_CONFIG = {
 sm: {
 icon:"h-4 w-4",
 value:"text-lg",
 title:"text-xs",
 trend:"text-xs",
 padding:"p-3.5",
 cardTitleSize:"sm" as const,
 },
 md: {
 icon:"h-5 w-5",
 value:"text-2xl",
 title:"text-sm",
 trend:"text-sm",
 padding:"p-5",
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
 className={cn("relative overflow-hidden rounded-xl border border-[oklch(0.65_0.22_260_/_0.12)] bg-[linear-gradient(180deg,oklch(0.07_0.013_260_/_0.92)_0%,oklch(0.058_0.011_260_/_0.86)_100%)]","shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.08),0_18px_38px_-26px_rgba(0,0,0,0.78)]",
 config.padding,
 className
 )}
 >
 {/* Top accent line */}
 <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
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
 className={cn("group", config.padding, className)}
 onClick={onClick}
 aria-label={title}
 {...props}
 >
 {(title || Icon || trend) && (
 <CardHeader size={size} className="flex-row items-center justify-between pb-2">
 <div className="flex items-center gap-2 flex-1 min-w-0">
 {renderIcon() && (
 <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/15 text-primary group-hover:bg-primary/15 " aria-hidden="true">
 {renderIcon()}
 </div>
 )}
 <h3 className={cn("font-semibold text-muted-foreground/80 truncate micro-sans",
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

 <CardContent size={size} className="gap-1.5">
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

export interface ModernStatsCardProps extends Omit<StatsCardProps,"variant"> {
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
 size ="md",
 isLoading = false,
 animateValue = true,
 formatCurrency = false,
 locale ="en-US",
 glass = false,
 onClick,
 className,
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
 return (
 <div
 className={cn("relative overflow-hidden rounded-xl border border-[oklch(0.65_0.22_260_/_0.12)] bg-[linear-gradient(180deg,oklch(0.07_0.013_260_/_0.92)_0%,oklch(0.058_0.011_260_/_0.86)_100%)]","shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.08),0_18px_38px_-26px_rgba(0,0,0,0.78)]",
 config.padding,
 className
 )}
 >
 <div className="flex flex-col gap-3">
 <Skeleton className="h-4 w-1/3" />
 <Skeleton className={cn("h-8 w-32", config.value)} />
 <Skeleton className="h-3 w-24" />
 </div>
 </div>
 )
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
 <div
 ref={ref}
 data-widget-shell="v2"
 role={onClick ?"button" : undefined}
 tabIndex={onClick ? 0 : undefined}
 onClick={onClick}
 className={cn("group relative overflow-hidden rounded-xl border border-[oklch(0.65_0.22_260_/_0.12)] bg-[linear-gradient(180deg,oklch(0.07_0.013_260_/_0.92)_0%,oklch(0.058_0.011_260_/_0.86)_100%)] ","shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.08),0_18px_38px_-26px_rgba(0,0,0,0.78)]",
 glass &&"bg-[oklch(0.062_0.012_260_/_0.8)]",
 !!onClick &&"cursor-pointer hover:shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.1),0_22px_44px_-26px_rgba(0,0,0,0.82)]",
 config.padding,
 className
 )}
 {...props}
 >
 {/* Top accent line */}
 <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
 
 {/* Hover glow */}
 <div className="absolute inset-0 bg-gradient-to-tr from-primary/[0.06] via-transparent to-transparent opacity-0 group-hover:opacity-100 " />

 {(title || trend) && (
 <div className="relative flex items-center justify-between gap-3 mb-2">
 <div className="flex items-center gap-2 flex-1 min-w-0">
 {renderIcon() && (
 <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/15 text-primary group-hover:bg-primary/15 " aria-hidden="true">
 {renderIcon()}
 </div>
 )}
 <h3 className={cn("text-muted-foreground/70 font-semibold truncate micro-sans", config.title)}>
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
 className:"h-3 w-3 stroke-2","aria-hidden": true,
 })}
 <span>{trend.isPositive ?"+" :""}{trend.value}%</span>
 </Badge>
 )}
 </div>
 )}

 <div
 className={cn("relative font-bold tracking-tight tabular-nums",
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
 <p className={cn("relative text-muted-foreground/55 micro-sans mt-1",
 config.trend
 )}>
 {description}
 </p>
 )}
 </div>
 )
 }
)

ModernStatsCard.displayName ="ModernStatsCard"

export { StatsCard, ModernStatsCard, StatsCardSkeleton }
export type { StatsCardSkeletonProps }
