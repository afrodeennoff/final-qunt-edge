'use client'

import { useEffect } from 'react'
import { RouteErrorScreen } from '@/components/ui/route-state'

export default function DealsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Deals Error Boundary]', error)
  }, [error])

  return (
    <RouteErrorScreen
      eyebrow="Deals"
      title="Deals failed to load"
      description={error.message || 'Something went wrong while loading the partner offers page.'}
      onRetry={reset}
      fullScreen={false}
    />
  )
}
