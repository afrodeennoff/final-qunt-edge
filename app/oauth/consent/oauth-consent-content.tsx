import { connection } from 'next/server'
import { createClient, ensureUserInDatabase, getWebsiteURL } from '@/server/auth'
import { MCP_OAUTH_CONSENT_PATH } from '@/lib/mcp/oauth-metadata'
import { OAuthConsentForm } from './oauth-consent-form'
import { OAuthConsentSignIn } from './oauth-consent-sign-in'
import { OAuthConsentRedirect } from './oauth-consent-redirect'

type OAuthConsentContentProps = {
  searchParams: Promise<{ authorization_id?: string }>
}

export async function OAuthConsentContent({ searchParams }: OAuthConsentContentProps) {
  await connection()
  const { authorization_id: authorizationId } = await searchParams

  if (!authorizationId?.trim()) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
        <h1 className="text-xl font-semibold">Invalid authorization request</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Missing <code className="text-xs">authorization_id</code>. Start the connection from your MCP client again.
        </p>
      </main>
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <OAuthConsentSignIn authorizationId={authorizationId} />
  }

  try {
    await ensureUserInDatabase(user, 'en', { skipDefaultLayout: true })
  } catch {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
        <h1 className="text-xl font-semibold">Account setup required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We could not finish setting up your Qunt Edge account. Try signing in at the dashboard first, then reconnect MCP.
        </p>
      </main>
    )
  }

  const { data: authDetails, error } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId)

  if (error) {
    const siteUrl = (await getWebsiteURL()).replace(/\/$/, '')
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
        <h1 className="text-xl font-semibold">Authorization unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <p className="mt-4 text-xs text-muted-foreground">
          Ensure OAuth 2.1 Server is enabled in Supabase and the authorization path is set to{' '}
          <code>{MCP_OAUTH_CONSENT_PATH}</code> (Site URL: {siteUrl}).
        </p>
      </main>
    )
  }

  if (!authDetails) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
        <h1 className="text-xl font-semibold">Authorization not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This request may have expired. Try connecting again from your MCP client.</p>
      </main>
    )
  }

  if (authDetails.redirect_url) {
    return <OAuthConsentRedirect redirectUrl={authDetails.redirect_url} />
  }

  const scopes = (authDetails.scope || '')
    .split(/\s+/)
    .map((s) => s.trim())
    .filter(Boolean)

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
      <OAuthConsentForm
        authorizationId={authorizationId}
        clientName={authDetails.client?.name || 'Unknown application'}
        clientUri={authDetails.client?.uri}
        redirectUri={authDetails.redirect_uri ?? authDetails.client?.uri}
        scopes={scopes}
        userEmail={authDetails.user?.email || user.email || ''}
      />
    </main>
  )
}