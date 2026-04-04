'use client'

import { useEffect } from 'react'
import { ButtonV2 } from '@/components/ui/v2'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Admin Error Boundary]', error)
  }, [error])

  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6">
      <section className="w-full max-w-lg rounded-lg border bg-background p-6 shadow-sm">
        <h1 className="text-lg font-semibold">Admin panel failed to load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message || 'An admin error occurred.'}
        </p>
        <div className="mt-4 flex gap-2">
          <ButtonV2
            onClick={reset}
          >
            Retry
          </ButtonV2>
          <ButtonV2
            variant="outline"
            onClick={() => window.location.assign('/dashboard')}
          >
            Go to dashboard
          </ButtonV2>
        </div>
      </section>
    </main>
  )
}
