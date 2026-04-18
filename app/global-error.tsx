'use client'

import { useEffect } from 'react'
import { RouteErrorScreen } from '@/components/ui/route-state'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Keep the console error for observability; avoid crashing the page.
    console.error(error)
  }, [error])

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground">
        <RouteErrorScreen
          eyebrow="Global boundary"
          title="The app hit an unexpected error"
          description={error.message || 'Reload the page to restore the full application shell.'}
          onRetry={() => window.location.reload()}
          retryLabel="Reload"
          secondaryLabel="Try again"
          onSecondary={reset}
        />
      </body>
    </html>
  )
}
