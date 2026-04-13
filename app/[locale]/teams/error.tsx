'use client'

import { useEffect } from 'react'

export default function TeamsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Teams Error Boundary]', error)
  }, [error])

  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6">
      <section className="w-full max-w-lg rounded-lg border bg-background p-6 shadow-[inset_0_1px_0_oklch(0.65_0.22_260/0.06),0_4px_16px_-4px_rgba(0,0,0,0.3)]">
        <h1 className="text-lg font-semibold">Teams page failed to load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message || 'A teams error occurred.'}
        </p>
        <div className="mt-4 flex gap-2">
          <button
            className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
            onClick={reset}
            type="button"
          >
            Retry
          </button>
          <button
            className="rounded-md border px-3 py-2 text-sm"
            onClick={() => window.location.assign('/dashboard')}
            type="button"
          >
            Go to dashboard
          </button>
        </div>
      </section>
    </main>
  )
}
