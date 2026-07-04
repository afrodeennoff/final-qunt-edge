'use client'

type OAuthConsentFormProps = {
  authorizationId: string
  clientName: string
  clientUri?: string
  redirectUri?: string
  scopes: string[]
  userEmail: string
}

export function OAuthConsentForm({
  authorizationId,
  clientName,
  clientUri,
  scopes,
  userEmail,
}: OAuthConsentFormProps) {
  return (
    <div className="rounded-xl border border-transparent bg-card p-6 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Authorize MCP access</p>
      <h1 className="mt-2 text-2xl font-semibold">{clientName}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This application wants to access your Qunt Edge account as <strong>{userEmail}</strong>.
      </p>

      {clientUri ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Client:{' '}
          <a href={clientUri} className="underline" target="_blank" rel="noreferrer">
            {clientUri}
          </a>
        </p>
      ) : null}

      {scopes.length > 0 ? (
        <div className="mt-4">
          <p className="text-sm font-medium">Requested permissions</p>
          <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
            {scopes.map((scope) => (
              <li key={scope}>
                <code className="text-xs">{scope}</code>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <form action="/api/oauth/decision" method="POST" className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input type="hidden" name="authorization_id" value={authorizationId} />
        <button
          type="submit"
          name="decision"
          value="approve"
          className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Approve
        </button>
        <button
          type="submit"
          name="decision"
          value="deny"
          className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-transparent bg-background px-4 text-sm font-medium"
        >
          Deny
        </button>
      </form>
    </div>
  )
}