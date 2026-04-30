'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10">
            <svg
              className="h-6 w-6 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Something went wrong
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            {error.message || 'An unexpected error occurred. Reload to restore the application.'}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.reload()
                }
              }}
              className="inline-flex items-center gap-2 rounded-[0.95rem] border border-primary/18 bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-[0_1px_2px_rgba(0,0,0,0.14)] transition-[background-color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:bg-primary/92 hover:shadow-[0_12px_28px_-22px_rgba(0,0,0,0.48)] active:scale-[0.985]"
            >
              Reload
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-[0.95rem] border border-[oklch(0.65_0.22_260_/_0.09)] bg-[oklch(0.058_0.011_260_/_0.82)] px-5 py-2.5 text-sm font-medium text-foreground transition-[background-color,border-color,box-shadow] duration-200 hover:border-[oklch(0.65_0.22_260_/_0.13)] hover:bg-[oklch(0.068_0.012_260_/_0.92)]"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
