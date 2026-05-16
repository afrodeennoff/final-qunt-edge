'use client'

import { RouteErrorScreen } from '@/components/ui/route-state'

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <RouteErrorScreen
      title="Something went wrong"
      description={error.message || 'An unexpected error occurred while loading this page.'}
      onRetry={reset}
      retryLabel="Try again"
    />
  )
}
