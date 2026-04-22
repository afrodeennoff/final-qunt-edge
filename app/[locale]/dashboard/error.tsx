'use client'

import { useEffect } from 'react'
import { RouteErrorScreen } from '@/components/ui/route-state'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Dashboard Error Boundary]', error)
  }, [error])

  return (
    <RouteErrorScreen
      eyebrow="Dashboard"
      title="Dashboard failed to load"
      description={error.message || 'A dashboard error interrupted your trading workspace.'}
      onRetry={reset}
      retryLabel="Reload dashboard"
      secondaryLabel="Go home"
      onSecondary={() => window.location.assign('/')}
      fullScreen={false}
    />
  )
}
