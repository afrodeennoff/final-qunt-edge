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
  const { locale } = useParams<{ locale: string }>()

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
      onSecondary={() => window.location.assign(`/${locale || 'en'}/dashboard`)}
      fullScreen={false}
    />
  )
}
