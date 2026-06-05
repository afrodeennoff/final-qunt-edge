'use client'

import { useEffect } from 'react'

type OAuthConsentRedirectProps = {
  redirectUrl: string
}

/**
 * Client redirect back to the MCP client (e.g. cursor://). Server redirect() can cause
 * OAuth popups to close before the user sees feedback; assign location in the browser.
 */
export function OAuthConsentRedirect({ redirectUrl }: OAuthConsentRedirectProps) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.location.replace(redirectUrl)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [redirectUrl])

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
      <h1 className="text-xl font-semibold">Authorization complete</h1>
      <p className="mt-2 text-sm text-muted-foreground">Returning you to your MCP client…</p>
      <p className="mt-4 text-xs text-muted-foreground">
        If nothing happens,{' '}
        <a href={redirectUrl} className="underline">
          continue manually
        </a>
        .
      </p>
    </main>
  )
}