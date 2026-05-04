"use client"

import * as React from "react"
import { AlertCircle, Info, Inbox } from "lucide-react"

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
 <div className="space-y-3 p-5">
 <Skeleton className="h-3 w-2/5 animate-pulse rounded-full bg-muted/60" style={{ animationDelay: '0ms' }} />
 <Skeleton className="h-24 animate-pulse rounded-lg bg-muted/40" style={{ animationDelay: '100ms' }} />
 <Skeleton className="h-3 w-3/5 animate-pulse rounded-full bg-muted/60" style={{ animationDelay: '200ms' }} />
 </div>
 )
 }

 if (state ==="error") {
 return (
 <div className="p-5">
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
 <div className="flex h-full min-h-[160px] flex-col items-center justify-center gap-3 p-5">
 <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/40 bg-muted/30">
 <Inbox className="size-4 text-muted-foreground/50" />
 </div>
 <p className="text-center text-[13px] text-muted-foreground/70">{emptyMessage}</p>
 </div>
 )
 }

 return children
 }

 return (
 <Card
 data-widget-shell="v2"
 className={cn("widget-enter-smooth relative h-full overflow-hidden rounded-[var(--radius-lg)] border border-border/50 bg-card shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_20px_40px_-28px_rgba(0,0,0,0.70)] focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_0_2px_var(--background),0_0_0_4px_var(--ring)/0.45]",
 variant ==="hoverable" &&
 "transition-[border-color,box-shadow,transform] duration-200 hover:border-border/80 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_20px_36px_-24px_rgba(0,0,0,0.68)] hover:-translate-y-px",
 className
 )}
 >
 {(title || actions || icon || description) && (
 <CardHeader className="border-b border-border/30 bg-muted/20 px-4 py-[0.65rem] backdrop-blur-sm">
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
 className="text-muted-foreground/50 transition-colors hover:text-foreground"
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
 <p className="line-clamp-1 text-[12px] text-muted-foreground/60">{description}</p>
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
 <Separator className="-mx-5 mb-0" />
 <div className="p-5">{footer}</div>
 </CardFooter>
 ) : null}
 </Card>
 )
}
