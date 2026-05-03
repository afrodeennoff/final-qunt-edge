"use client"

import * as React from "react"
import { AlertCircle, Info } from "lucide-react"

import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
 Tooltip,
 TooltipContent,
 TooltipProvider,
 TooltipTrigger,
} from "@/components/ui/tooltip"

export type WidgetShellState ="ready" |"loading" |"empty" |"error"
export type WidgetShellVariant ="default" |"hoverable"

interface WidgetShellProps {
 title?: React.ReactNode
 description?: React.ReactNode
 info?: React.ReactNode
 icon?: React.ReactNode
 actions?: React.ReactNode
 footer?: React.ReactNode
 state?: WidgetShellState
 emptyMessage?: React.ReactNode
 errorMessage?: React.ReactNode
 variant?: WidgetShellVariant
 className?: string
 contentClassName?: string
 children?: React.ReactNode
}

export function WidgetShell({
 title,
 description,
 info,
 icon,
 actions,
 footer,
 state ="ready",
 emptyMessage ="No data available yet.",
 errorMessage ="We couldn't load this widget.",
 variant ="default",
 className,
 contentClassName,
 children,
}: WidgetShellProps) {
 const renderContent = () => {
 if (state ==="loading") {
 return (
 <div className="gap-[var(--space-3)] p-[var(--space-4)]">
 <Skeleton className="h-4 w-1/3" />
 <Skeleton className="h-28 w-full" />
 <Skeleton className="h-4 w-2/3" />
 </div>
 )
 }

 if (state ==="error") {
 return (
 <div className="p-[var(--space-4)]">
 <Alert variant="destructive">
 <AlertCircle className="h-4 w-4" />
 <AlertTitle>Widget Error</AlertTitle>
 <AlertDescription>{errorMessage}</AlertDescription>
 </Alert>
 </div>
 )
 }

 if (state ==="empty") {
 return (
 <div className="flex h-full min-h-[160px] items-center justify-center p-[var(--space-4)] text-sm text-muted-foreground">
 {emptyMessage}
 </div>
 )
 }

 return children
 }

 return (
 <Card
 data-widget-shell="v2"
 className={cn("widget-enter-smooth relative h-full overflow-hidden rounded-[12px] border border-[oklch(0.65_0.22_260_/_0.10)] bg-[linear-gradient(160deg,oklch(0.096_0.016_264_/_0.93)_0%,oklch(0.078_0.013_264_/_0.88)_100%)] shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.07),0_20px_40px_-28px_rgba(0,0,0,0.70)] focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.07),0_0_0_2px_var(--background),0_0_0_4px_oklch(0.62_0.22_290_/_0.45)]",
 variant ==="hoverable" &&
 className
 )}
 >
 {(title || actions || icon || description) && (
 <CardHeader className="border-b border-[oklch(0.65_0.22_260_/_0.08)] bg-[oklch(0.65_0.22_260_/_0.04)] px-4 py-[0.65rem]">
 <div className="flex items-start justify-between gap-[var(--space-3)]">
 <div className="min-w-0 gap-[var(--space-2)]">
 {(title || icon) && (
 <div className="flex items-center gap-[var(--space-2)]">
 {icon ? <span className="size-[15px] text-muted-foreground/50">{icon}</span> : null}
 {title ? (
 <CardTitle className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70">{title}</CardTitle>
 ) : null}
 {info ? (
 <TooltipProvider>
 <Tooltip>
 <TooltipTrigger asChild>
 <button
 type="button"
 className="text-fg-muted transition-colors hover:text-fg-primary"
 aria-label="Widget info"
 >
 <Info className="h-3.5 w-3.5" />
 </button>
 </TooltipTrigger>
 <TooltipContent>{info}</TooltipContent>
 </Tooltip>
 </TooltipProvider>
 ) : null}
 </div>
 )}
 {description ? (
 <p className="line-clamp-1 text-[12px] text-fg-muted">{description}</p>
 ) : null}
 </div>
 {actions ? <div className="shrink-0">{actions}</div> : null}
 </div>
 </CardHeader>
 )}

 <CardContent className={cn("flex-1 min-h-0 p-0", contentClassName)}>
 {renderContent()}
 </CardContent>

 {footer ? (
 <CardFooter className="flex flex-col p-0">
 <Separator className="-mx-[var(--space-4)] mb-0" />
 <div className="p-[var(--space-4)]">{footer}</div>
 </CardFooter>
 ) : null}
 </Card>
 )
}
