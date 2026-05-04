'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { useI18n } from '@/locales/client'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useI18n()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Shared view error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background/0 to-muted/10 p-4">
      <Card className="w-full max-w-lg border-border/50 bg-card/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl font-semibold">Unable to Load Shared View</CardTitle>
          <CardDescription className="text-muted-foreground">
            We couldn't load the shared trading dashboard you requested.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error.message && (
            <div className="p-3 rounded-lg bg-muted/50 border border-border/30">
              <p className="text-xs text-muted-foreground font-mono break-all">
                {error.message}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Button
              onClick={reset}
              className="w-full"
              variant="default"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              className="w-full"
              variant="outline"
            >
              <Home className="h-4 w-4 mr-2" />
              Return to Home
            </Button>
          </div>

          {error.digest && (
            <div className="text-center text-xs text-muted-foreground mt-4">
              Error reference: {error.digest}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}