'use client'

import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
          <div className="text-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
            <p className="text-sm text-muted-foreground">
              The dashboard encountered an error. Your data is safe.
            </p>
            {this.state.error && (
              <p className="text-xs text-muted-foreground/60 font-mono max-w-md truncate">
                {this.state.error.message}
              </p>
            )}
          </div>
          <ButtonV2 
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Reload Dashboard
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}