"use client"

import * as React from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type ChartSurfaceState = "ready" | "loading" | "empty" | "error"

interface ChartSurfaceProps {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  actions?: React.ReactNode
  info?: React.ReactNode
  footer?: React.ReactNode
  state?: ChartSurfaceState
  emptyMessage?: React.ReactNode
  errorMessage?: React.ReactNode
  size?: "tiny" | "small" | "small-long" | "medium" | "large" | "extra-large"
  height?: number
  className?: string
  headerClassName?: string
  bodyClassName?: string
  footerClassName?: string
  children?: React.ReactNode
}

export function ChartSurface({
  title,
  subtitle,
  actions,
  info,
  footer,
  state = "ready",
  emptyMessage = "No trades yet.",
  errorMessage = "Unable to load chart.",
  size = "medium",
  height,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
  children,
}: ChartSurfaceProps) {
  const isSmall = size === "small" || size === "tiny"
  const hasHeader = Boolean(title || subtitle || actions || info)
  const hasFooter = Boolean(footer)
  const shouldPadBody = hasHeader || state !== "ready"

  const renderBody = () => {
    if (state === "loading") {
      return (
        <div className="gap-[var(--space-3)] p-[var(--space-3)]">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-3.5 w-24 animate-shimmer" />
            <Skeleton className="h-3.5 w-16 animate-shimmer" />
          </div>
          <div className="relative">
            <Skeleton className="h-[220px] w-full animate-shimmer" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(var(--foreground)_/_0.03)] to-transparent animate-shimmer" />
          </div>
          <div className="flex items-center justify-between mt-3">
            <Skeleton className="h-2.5 w-20 animate-shimmer" />
            <Skeleton className="h-2.5 w-20 animate-shimmer" />
          </div>
        </div>
      )
    }

    if (state === "error") {
      return (
        <div className="flex h-full min-h-[160px] items-center justify-center p-[var(--space-3)] text-xs text-destructive">
          <div className="flex flex-col items-center gap-2">
            <svg
              className="w-8 h-8 text-destructive/60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            {errorMessage}
          </div>
        </div>
      )
    }

    if (state === "empty") {
      return (
        <div className="flex h-full min-h-[160px] items-center justify-center p-[var(--space-3)] text-xs text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <svg
              className="w-8 h-8 text-muted-foreground/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605"
              />
            </svg>
            {emptyMessage}
          </div>
        </div>
      )
    }

    return children
  }

  return (
    <div
      data-chart-surface="modern"
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-xl border",
        "border-[hsl(var(--border))_/_0.32]",
        "bg-[hsl(var(--card))_/_0.9]",
        "shadow-[inset_0_1px_0_hsl(var(--foreground)_/_0.03)]",
        "transition-all duration-[180ms] ease-out",
        "hover:border-[hsl(var(--border))_/_0.4]",
        "hover:bg-[hsl(var(--card))_/_0.94]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))_/_0.5] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))]",
        className
      )}
      style={height ? { height } : undefined}
    >
      {hasHeader && (
        <div
          className={cn(
            "flex shrink-0 items-center border-b border-border/35",
            isSmall ? "h-10 px-2.5" : "h-12 px-3.5",
            headerClassName
          )}
        >
          <div className="flex w-full items-center justify-between gap-[var(--space-2)]">
            <div className="min-w-0 flex items-center gap-[var(--space-2)]">
              {title ? (
                <span
                  className={cn(
                    "line-clamp-1 text-fg-primary",
                    isSmall ? "text-[13px] font-semibold" : "text-sm font-semibold"
                  )}
                >
                  {title}
                </span>
              ) : null}
              {info}
              {subtitle ? (
                <span className="hidden text-[11px] text-fg-muted sm:inline">{subtitle}</span>
              ) : null}
            </div>
            {actions ? <div className="shrink-0">{actions}</div> : null}
          </div>
        </div>
      )}
      <div
        className={cn(
          "flex flex-col flex-1 min-h-0",
          shouldPadBody ? (isSmall ? "p-1.5" : "p-2.5 sm:p-3") : "p-0",
          bodyClassName
        )}
      >
        {renderBody()}
      </div>
      {hasFooter && (
        <div
          className={cn(
            "flex shrink-0 items-center border-t border-border/35",
            isSmall ? "h-8 px-2.5" : "h-10 px-3.5",
            footerClassName
          )}
        >
          {footer}
        </div>
      )}
    </div>
  )
}
