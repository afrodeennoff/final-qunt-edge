'use client'

import { useEffect } from 'react'
import { RouteErrorScreen } from '@/components/ui/route-state'

export default function SharedViewError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Shared View Error]', error)
  }, [error])

  return (
    <RouteErrorScreen
      eyebrow="Shared view"
      title="Unable to load shared dashboard"
      description={error.message || 'The shared trading view could not be rendered right now.'}
      onRetry={reset}
      retryLabel="Reload view"
      secondaryLabel="Go home"
      onSecondary={() => window.location.assign('/')}
    />
  )
}
