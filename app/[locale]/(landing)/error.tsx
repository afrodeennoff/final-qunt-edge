'use client'

import { useEffect } from 'react'
import { RouteErrorScreen } from '@/components/ui/route-state'

export default function LandingError({
  error,
  reset,
}: {
  error?: Error & { digest?: string }
  reset?: () => void
}) {
  useEffect(() => {
    console.warn(error)
  }, [error])

  return (
    <RouteErrorScreen
      eyebrow="Public page"
      title="This page failed to load"
      description={error?.message || 'The public experience hit an unexpected rendering issue.'}
      onRetry={reset}
    />
  )
}
