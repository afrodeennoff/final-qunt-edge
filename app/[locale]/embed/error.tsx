'use client'

import { useEffect } from 'react'
import { RouteErrorScreen } from '@/components/ui/route-state'

export default function EmbedError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[embed]', error.message, error.digest)
  }, [error])

  return (
    <RouteErrorScreen
      eyebrow="Embed"
      title="Embedded chart failed to load"
      description={error.message || 'The embedded view could not be rendered right now.'}
      onRetry={reset}
      retryLabel="Reload chart"
      compact
    />
  )
}
