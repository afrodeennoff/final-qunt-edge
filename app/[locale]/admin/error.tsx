'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { RouteErrorScreen } from '@/components/ui/route-state'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const params = useParams<{ locale?: string }>() as { locale?: string } | null
  const locale = params?.locale ?? 'en'

  useEffect(() => {
    console.error('[Admin Error Boundary]', error)
  }, [error])

  return (
    <RouteErrorScreen
      eyebrow="Admin"
      title="Operations studio failed to load"
      description={error.message || 'An admin workspace error interrupted this surface.'}
      onRetry={reset}
      secondaryLabel="Go to dashboard"
      onSecondary={() => window.location.assign('/dashboard')}
      fullScreen={false}
    />
  )
}
