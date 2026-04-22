'use client'

import { useEffect } from 'react'
import { RouteErrorScreen } from '@/components/ui/route-state'

export default function SharedError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[shared-view]', error.message, error.digest)
  }, [error])

  return (
    <RouteErrorScreen
      eyebrow="Shared view"
      title="This shared view is unavailable"
      description={
        error.message || 'The shared link may have expired, been removed, or failed to render.'
      }
      onRetry={reset}
      retryLabel="Try again"
      compact
    />
  )
}
