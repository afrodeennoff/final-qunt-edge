'use client'

import * as React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ============================================
// ERROR BOUNDARY COMPONENT
// ============================================

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  shouldReset: boolean
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  maxRetries?: number
  FallbackComponent?: React.ComponentType<{ error: Error; errorInfo: React.ErrorInfo }>
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      shouldReset: false,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to external error tracking if available (Sentry is optional at runtime)
    const sentry = (window as unknown as { Sentry?: { captureException: (e: Error, ctx: unknown) => void } }).Sentry
    if (sentry) {
      sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      })
    }

    this.setState({
      errorInfo,
    })

    // Call custom error handler (consumer is responsible for any logging)
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      shouldReset: true,
    })
  }

  render() {
    const { hasError, error, errorInfo, shouldReset } = this.state
    const { children, fallback, FallbackComponent } = this.props

    if (hasError && !shouldReset) {
      // If custom fallback component is provided
      if (FallbackComponent) {
        return <FallbackComponent error={error!} errorInfo={errorInfo!} />
      }

      // If custom fallback is provided
      if (fallback) {
        return fallback
      }

      // Default error UI
      return (
        <ErrorFallback
          error={error!}
          errorInfo={errorInfo!}
          onReset={this.handleReset}
        />
      )
    }

    // Reset flag for child re-render
    if (shouldReset) {
      return <>{children}</>
    }

    return children
  }
}

// ============================================
// ERROR FALLBACK COMPONENT
// ============================================

export interface ErrorFallbackProps {
  error: Error
  errorInfo: React.ErrorInfo
  onReset: () => void
}

export function ErrorFallback({ error, errorInfo, onReset }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 rounded-xl border border-border/30 bg-background/50 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>

      <div className="space-y-2 max-w-md">
        <h2 className="type-heading-lg font-black text-foreground">Something went wrong</h2>
        <p className="type-body-sm text-muted-foreground">
          An unexpected error occurred. Please try again or contact support if the problem persists.
        </p>
      </div>

      {/* Error details (hidden by default, can be shown for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="max-h-48 max-w-md overflow-auto rounded-lg border border-border/30 bg-background/80 p-4 text-left">
          <summary className="cursor-pointer type-body-sm font-medium text-muted-foreground">
            Error Details (Development Only)
          </summary>
          <div className="mt-3 space-y-2 text-left">
            <div>
              <p className="type-body-xs font-medium text-muted-foreground">Error Message:</p>
              <p className="mt-1 type-body-sm text-destructive font-mono">
                {error.message}
              </p>
            </div>
            {errorInfo && (
              <div>
                <p className="type-body-xs font-medium text-muted-foreground">Component Stack:</p>
                <p className="mt-1 type-body-xs font-mono text-muted-foreground/70">
                  {errorInfo.componentStack}
                </p>
              </div>
            )}
          </div>
        </details>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onReset}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
        {process.env.NODE_ENV === 'development' && (
          <Button
            onClick={() => window.location.reload()}
            variant="default"
          >
            Refresh Page
          </Button>
        )}
      </div>

      {process.env.NODE_ENV === 'development' && (
        <p className="type-body-xs text-muted-foreground/60">
          Error ID: {error.stack?.split('\n')[0]?.replace(/.*at /, '') || 'unknown'}
        </p>
      )}
    </div>
  )
}

// ============================================
// ERROR BOUNDARY HOOK
// ============================================

export function useErrorBoundary() {
  const [, setError] = React.useState<{ error: Error; errorInfo: React.ErrorInfo } | null>(null)

  const captureError = (error: Error, errorInfo: React.ErrorInfo) => {
    setError({ error, errorInfo })
  }

  const resetError = () => {
    setError(null)
  }

  return {
    captureError,
    resetError,
    hasError: !!setError,
  }
}

// ============================================
// EXPORTED COMPONENT
// ============================================

export default ErrorBoundary
