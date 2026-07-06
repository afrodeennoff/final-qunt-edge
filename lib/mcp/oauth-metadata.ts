import { getSiteOrigin, getSiteUrl } from '@/lib/site-url'

/** Scopes Supabase OAuth 2.1 supports (openid, profile, email, phone). */
export const MCP_OAUTH_SCOPES = ['openid', 'email', 'profile'] as const
export const MCP_OAUTH_SCOPE_CHALLENGE = 'openid email profile'

export const MCP_OAUTH_CONSENT_PATH =
  (process.env.MCP_OAUTH_CONSENT_PATH || '/oauth/consent').replace(/\/+$/, '') || '/oauth/consent'

export function getSupabaseProjectOrigin(): string | null {
  const raw = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim()
  if (!raw) return null
  try {
    const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
    return url.origin
  } catch {
    return null
  }
}

/** OAuth 2.1 authorization server issuer (Supabase Auth). */
export function getSupabaseAuthIssuer(): string | null {
  const origin = getSupabaseProjectOrigin()
  if (!origin) return null
  return `${origin.replace(/\/$/, '')}/auth/v1`
}

/** Canonical MCP resource URI (RFC 8707 / RFC 9728). */
export function getMcpResourceUri(): string {
  return `${getSiteOrigin().replace(/\/$/, '')}/api/mcp`
}

/**
 * Issuer advertised to MCP clients for OAuth discovery.
 * Must be the app origin — NOT Supabase `/auth/v1`. Cursor builds
 * `/.well-known/oauth-authorization-server` from this value; Supabase metadata
 * lives at `/.well-known/oauth-authorization-server/auth/v1` on the project host,
 * which we proxy from the app origin route.
 */
export function getMcpAuthorizationServerIssuer(): string {
  return getSiteOrigin().replace(/\/$/, '')
}

export function getMcpProtectedResourceMetadata(resource?: string) {
  const resourceUri = resource || getMcpResourceUri()
  const origin = getSiteOrigin()
  const authServer = getMcpAuthorizationServerIssuer()

  return {
    resource: resourceUri,
    resource_name: 'Qunt Edge MCP',
    bearer_methods_supported: ['header'] as const,
    scopes_supported: [...MCP_OAUTH_SCOPES],
    documentation_uri: `${origin}/docs/mcp`,
    authorization_servers: [authServer],
  }
}

export function getSupabaseAuthorizationServerMetadataUrl(): string | null {
  const projectOrigin = getSupabaseProjectOrigin()
  if (!projectOrigin) return null
  return `${projectOrigin}/.well-known/oauth-authorization-server/auth/v1`
}

/**
 * Rewrite upstream Supabase AS metadata for MCP clients (Cursor).
 * `authorization_servers` in protected-resource metadata uses the app origin;
 * the proxied `issuer` must match so clients accept `authorization_endpoint`.
 */
export function normalizeAuthorizationServerMetadataForMcpClients(
  upstream: Record<string, unknown>,
): Record<string, unknown> {
  const issuer = getMcpAuthorizationServerIssuer()
  return {
    ...upstream,
    issuer,
    service_documentation: `${issuer}/docs/mcp`,
  }
}

export function getOAuthConsentUrl(authorizationId: string): string {
  return getSiteUrl(`${MCP_OAUTH_CONSENT_PATH}?authorization_id=${encodeURIComponent(authorizationId)}`)
}