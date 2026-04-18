'use client'

import { useEffect } from 'react'
import { RouteErrorScreen } from '@/components/ui/route-state'

export default function AuthenticationError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Auth] Rendering error:', error)
  }, [error])

  return (
    <RouteErrorScreen
      eyebrow="Authentication"
      title="Secure access failed to load"
      description={error.message || 'The authentication surface could not be prepared right now.'}
      onRetry={reset}
    />
  )
}
