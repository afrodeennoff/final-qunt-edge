'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { RouteErrorScreen } from '@/components/ui/route-state'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { locale } = useParams<{ locale: string }>()

  useEffect(() => {
    console.error('[App Error Boundary]', error)
  }, [error])

  return (
    <RouteErrorScreen
      eyebrow="Application boundary"
      title="Something went wrong"
      description={error.message || 'An unexpected error interrupted the application shell.'}
      onRetry={reset}
      secondaryLabel="Go home"
      onSecondary={() => window.location.assign(`/${locale || 'en'}`)}
    />
  )
}
