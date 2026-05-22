'use client'

import { Component, type ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  minHeight?: number
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
      if (this.props.fallback !== undefined) return this.props.fallback
      return (
        <div
          className="flex flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center"
          style={{ minHeight: this.props.minHeight ?? 200 }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive/70" />
          </div>
          <div className="space-y-1">
            <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
              Something went wrong
            </h3>
            <p className="text-[13px] text-muted-foreground">
              An unexpected error occurred. Your data is safe.
            </p>
            {this.state.error && process.env.NODE_ENV === 'development' && (
              <code className="mt-2 block max-w-md truncate text-[11px] text-destructive/70 font-mono">
                {this.state.error.message}
              </code>
            )}
          </div>
          <Button
            onClick={() => {
              this.setState({ hasError: false, error: undefined })
            }}
            variant="outline"
            size="sm"
          >
            Try again
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
