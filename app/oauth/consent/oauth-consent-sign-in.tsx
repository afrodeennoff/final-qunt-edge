'use client'

import { UserAuthForm } from '@/app/[locale]/(authentication)/components/user-auth-form'
import { MCP_OAUTH_CONSENT_PATH } from '@/lib/mcp/oauth-metadata'

type OAuthConsentSignInProps = {
  authorizationId: string
}

export function OAuthConsentSignIn({ authorizationId }: OAuthConsentSignInProps) {
  const returnPath = `${MCP_OAUTH_CONSENT_PATH}?authorization_id=${encodeURIComponent(authorizationId)}`

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">MCP authorization</p>
        <h1 className="mt-2 text-2xl font-semibold">Sign in to continue</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with your Qunt Edge account to approve access for your MCP client. You will stay on this page after
          sign-in.
        </p>
      </div>
      <UserAuthForm forcedNextUrl={returnPath} className="w-full" />
    </main>
  )
}