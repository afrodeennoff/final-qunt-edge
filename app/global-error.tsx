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
      <body className="min-h-screen bg-black text-white antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
            <svg
              className="h-6 w-6 text-red-400"
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
          <h1 className="text-2xl font-medium tracking-tight text-white">
            Something went wrong
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-white/60">
            {error.message || 'An unexpected error occurred. Reload to restore the application.'}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
            >
              Reload
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80 transition-[background-color,border-color] hover:bg-white/10 hover:text-white"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
