import { getSiteOrigin, getSiteUrl } from '@/lib/site-url'

export const MCP_OAUTH_SCOPES = ['openid', 'email', 'profile', 'mcp:tools', 'mcp:read'] as const
export const MCP_OAUTH_SCOPE_CHALLENGE = 'openid email profile mcp:tools'

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

export function getMcpProtectedResourceMetadata(resource?: string) {
  const resourceUri = resource || getMcpResourceUri()
  const issuer = getSupabaseAuthIssuer()
  const origin = getSiteOrigin()

  return {
    resource: resourceUri,
    resource_name: 'Qunt Edge MCP',
    bearer_methods_supported: ['header'] as const,
    scopes_supported: [...MCP_OAUTH_SCOPES],
    documentation_uri: `${origin}/docs/mcp`,
    ...(issuer
      ? {
          authorization_servers: [issuer],
        }
      : {}),
  }
}

export function getSupabaseAuthorizationServerMetadataUrl(): string | null {
  const projectOrigin = getSupabaseProjectOrigin()
  if (!projectOrigin) return null
  return `${projectOrigin}/.well-known/oauth-authorization-server/auth/v1`
}

export function getOAuthConsentUrl(authorizationId: string): string {
  return getSiteUrl(`${MCP_OAUTH_CONSENT_PATH}?authorization_id=${encodeURIComponent(authorizationId)}`)
}