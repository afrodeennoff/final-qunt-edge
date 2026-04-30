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
      eyebrow="Qunt Edge"
      title="Something went wrong"
      description={
        error.message || 'We could not load the page. Please try again.'
      }
      onRetry={reset}
      fullScreen={false}
    />
  )
}
