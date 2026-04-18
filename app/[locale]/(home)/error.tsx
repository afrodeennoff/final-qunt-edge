'use client'

import { useEffect } from 'react'
import { RouteErrorScreen } from '@/components/ui/route-state'

export default function HomeError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[home-error]', error.message, error.digest)
  }, [error])

  return (
    <RouteErrorScreen
      eyebrow="Home"
      title="Home failed to load"
      description={error.message || 'The main public surface could not be composed right now.'}
      onRetry={reset}
      fullScreen={false}
    />
  )
}
