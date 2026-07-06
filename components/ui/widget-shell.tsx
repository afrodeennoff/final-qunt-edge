"use client"

import * as React from "react"
import { AlertCircle, Info, Inbox } from "lucide-react"
import { motion } from "motion/react"

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
   <div className="space-y-3 p-4">
    <div className="flex items-center gap-2">
      <Skeleton className="h-3 w-1/3 rounded-full" />
      <Skeleton className="h-3 w-1/5 rounded-full" />
    </div>
    <Skeleton className="h-24 rounded-lg" />
    <div className="flex gap-2">
      <Skeleton className="h-3 w-1/4 rounded-full" />
      <Skeleton className="h-3 w-1/6 rounded-full" />
    </div>
  </div>
  )
  }

  if (state ==="error") {
  return (
  <div className="p-4">
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
  <div className="flex h-full min-h-[160px] flex-col items-center justify-center gap-3 p-4">
  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/30 border-0">
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
      variant="default"
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out",
        variant === "hoverable" && "hover:border-primary/25 hover:shadow-[0_0_35px_-18px] hover:shadow-primary/15 hover:-translate-y-0.5",
        className
      )}
    >
  {(title || actions || icon || description) && (
    <CardHeader className="border-b-0 bg-card/50 px-4 py-2.5">
  <div className="flex items-start justify-between gap-3">
  <div className="min-w-0 space-y-1">
  {(title || icon) && (
  <div className="flex items-center gap-2">
  {icon ? <span className="size-[15px] text-muted-foreground/50 shrink-0">{icon}</span> : null}
  {title ? (
  <CardTitle className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">{title}</CardTitle>
  ) : null}
  {info ? (
  <TooltipProvider>
  <Tooltip>
  <TooltipTrigger asChild>
  <button
  type="button"
  className="text-muted-foreground/40 transition-colors hover:text-foreground"
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


 <CardContent className={cn("flex-1 min-h-0 p-0 flex flex-col justify-center", contentClassName)}>
 {renderContent()}
 </CardContent>

 {footer ? (
 <CardFooter className="flex flex-col p-0">
  <Separator className="-mx-4 mb-0" />
  <div className="p-4">{footer}</div>
 </CardFooter>
 ) : null}
 </Card>
 )
}
