'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// ============================================
// LOADING COMPONENTS
// ============================================

/**
 * Basic Spinner Component
 * A simple animated spinner for loading states
 */
export function Spinner({
  className,
  size = 'default',
}: {
  className?: string
  size?: 'sm' | 'default' | 'lg'
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <div className={cn('animate-spin', sizeClasses[size], className)} role="status" aria-label="Loading">
      <svg
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  )
}

/**
 * Skeleton Loader Component
 * For showing loading placeholders for content
 */
export function Skeleton({
  className,
  variant = 'default',
  animate = true,
}: {
  className?: string
  variant?: 'default' | 'text' | 'circular' | 'rectangular'
  animate?: boolean
}) {
  const baseClasses = 'rounded-xl bg-muted/30'
  const animateClasses = animate ? 'animate-pulse' : ''
  const variantClasses = {
    default: 'w-full h-4',
    text: 'h-4 w-full',
    circular: 'h-8 w-8 rounded-full',
    rectangular: 'h-24 w-full',
  }

  return (
    <div
      className={cn(baseClasses, animateClasses, variantClasses[variant], className)}
      role="status"
      aria-label="Loading content"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

/**
 * Card Skeleton Component
 * A card-shaped skeleton loader
 */
export function CardSkeleton({
  className,
  header = true,
  image = true,
  actions = false,
}: {
  className?: string
  header?: boolean
  image?: boolean
  actions?: boolean
}) {
  return (
    <div className={cn('rounded-xl border border-border/30 bg-card/40 p-4', className)}>
      {header && (
        <div className="mb-3 flex items-center gap-3">
          <div className="h-3 w-16 rounded bg-muted/30" />
          <div className="ml-auto h-6 w-16 rounded bg-muted/30" />
        </div>
      )}
      {image && <Skeleton variant="rectangular" className="mb-3 h-40" />}
      <div className="space-y-2">
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" className="max-w-[60%]" />
      </div>
      {actions && (
        <div className="mt-4 flex gap-2">
          <Skeleton variant="rectangular" className="h-9 w-20" />
          <Skeleton variant="rectangular" className="h-9 w-20" />
        </div>
      )}
    </div>
  )
}

/**
 * Text Skeleton Component
 * For loading individual text lines
 */
export function TextSkeleton({
  lines = 3,
  className,
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {[...Array(lines)].map((_, index) => (
        <Skeleton key={index} variant="text" />
      ))}
    </div>
  )
}

/**
 * Page Loader Component
 * Full-page loading state with spinner
 */
export function PageLoader({
  message = 'Loading...',
}: {
  message?: string
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        {message && <p className="type-body-sm text-muted-foreground">{message}</p>}
      </div>
    </div>
  )
}

/**
 * Section Loader Component
 * Centered loading state within a section
 */
export function SectionLoader({
  message = 'Loading...',
  showSpinner = true,
}: {
  message?: string
  showSpinner?: boolean
}) {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {showSpinner && <Spinner />}
        {message && <p className="type-body-sm text-muted-foreground">{message}</p>}
      </div>
    </div>
  )
}

/**
 * Button Loader Component
 * Button with loading state
 */
export function ButtonLoader({
  isLoading,
  children,
  className,
}: {
  isLoading?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('relative inline-flex', className)}>
      {isLoading ? (
        <>
          <span className="opacity-0">{children}</span>
          <Spinner size="sm" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        </>
      ) : (
        <>{children}</>
      )}
    </div>
  )
}
