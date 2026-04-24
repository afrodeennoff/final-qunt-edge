'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { RouteErrorScreen } from '@/components/ui/route-state'

export default function TeamsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { locale } = useParams<{ locale: string }>()

  useEffect(() => {
    console.error('[Teams Error Boundary]', error)
  }, [error])

  return (
    <RouteErrorScreen
      eyebrow="Teams"
      title="Teams surface failed to load"
      description={error.message || 'A teams workspace error interrupted this view.'}
      onRetry={reset}
      secondaryLabel="Go to dashboard"
      onSecondary={() => window.location.assign(`/${locale || 'en'}/dashboard`)}
      fullScreen={false}
    />
  )
}
