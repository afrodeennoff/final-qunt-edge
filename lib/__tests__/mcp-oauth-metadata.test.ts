import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import {
  getMcpAuthorizationServerIssuer,
  getMcpResourceUri,
  getMcpProtectedResourceMetadata,
  getSupabaseAuthIssuer,
  normalizeAuthorizationServerMetadataForMcpClients,
  MCP_OAUTH_CONSENT_PATH,
} from '@/lib/mcp/oauth-metadata'

describe('mcp oauth metadata', () => {
  const prevSite = process.env.NEXT_PUBLIC_SITE_URL
  const prevSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://app.example.com'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abcdef.supabase.co'
  })

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = prevSite
    process.env.NEXT_PUBLIC_SUPABASE_URL = prevSupabase
  })

  it('builds canonical MCP resource URI', () => {
    expect(getMcpResourceUri()).toBe('https://app.example.com/api/mcp')
  })

  it('uses Supabase auth issuer', () => {
    expect(getSupabaseAuthIssuer()).toBe('https://abcdef.supabase.co/auth/v1')
  })

  it('advertises app origin as authorization server (not Supabase /auth/v1 path)', () => {
    expect(getMcpAuthorizationServerIssuer()).toBe('https://app.example.com')
    const meta = getMcpProtectedResourceMetadata()
    expect(meta.resource).toBe('https://app.example.com/api/mcp')
    expect(meta.authorization_servers).toEqual(['https://app.example.com'])
    expect(meta.scopes_supported).toEqual(['openid', 'email', 'profile'])
  })

  it('keeps Supabase auth issuer helper for upstream proxy', () => {
    expect(getSupabaseAuthIssuer()).toBe('https://abcdef.supabase.co/auth/v1')
  })

  it('defaults consent path', () => {
    expect(MCP_OAUTH_CONSENT_PATH).toBe('/oauth/consent')
  })

  it('rewrites proxied AS issuer to app origin for Cursor', () => {
    const normalized = normalizeAuthorizationServerMetadataForMcpClients({
      issuer: 'https://abcdef.supabase.co/auth/v1',
      authorization_endpoint: 'https://abcdef.supabase.co/auth/v1/oauth/authorize',
    })
    expect(normalized.issuer).toBe('https://app.example.com')
    expect(normalized.authorization_endpoint).toBe(
      'https://abcdef.supabase.co/auth/v1/oauth/authorize',
    )
    expect(normalized.service_documentation).toBe('https://app.example.com/docs/mcp')
  })
})