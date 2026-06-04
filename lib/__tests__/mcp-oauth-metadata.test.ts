import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import {
  getMcpResourceUri,
  getMcpProtectedResourceMetadata,
  getSupabaseAuthIssuer,
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

  it('includes authorization_servers in protected resource metadata', () => {
    const meta = getMcpProtectedResourceMetadata()
    expect(meta.resource).toBe('https://app.example.com/api/mcp')
    expect(meta.authorization_servers).toEqual(['https://abcdef.supabase.co/auth/v1'])
    expect(meta.scopes_supported).toContain('mcp:tools')
  })

  it('defaults consent path', () => {
    expect(MCP_OAUTH_CONSENT_PATH).toBe('/oauth/consent')
  })
})