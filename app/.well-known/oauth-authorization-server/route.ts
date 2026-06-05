import { getSupabaseAuthorizationServerMetadataUrl } from '@/lib/mcp/oauth-metadata'
import { getSiteOrigin } from '@/lib/site-url'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

/**
 * Proxies Supabase OAuth 2.1 authorization server metadata for MCP clients
 * that probe the app origin before the Supabase project origin.
 */
export async function GET() {
  const discoveryUrl = getSupabaseAuthorizationServerMetadataUrl()
  if (!discoveryUrl) {
    return Response.json(
      {
        error: 'oauth_not_configured',
        message:
          'Set NEXT_PUBLIC_SUPABASE_URL and enable OAuth 2.1 Server in Supabase Dashboard → Authentication → OAuth Server.',
      },
      { status: 503, headers: CORS_HEADERS },
    )
  }

  try {
    const res = await fetch(discoveryUrl, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    })
    if (!res.ok) {
      return Response.json(
        {
          error: 'upstream_discovery_failed',
          message: `Failed to load Supabase OAuth metadata (${res.status}). Enable OAuth 2.1 Server in Supabase.`,
          upstream: discoveryUrl,
        },
        { status: 502, headers: CORS_HEADERS },
      )
    }
    const metadata = (await res.json()) as Record<string, unknown>
    // Help MCP clients (Cursor) that probe the app origin: keep Supabase endpoints but
    // document where consent UI lives.
    const origin = getSiteOrigin().replace(/\/$/, '')
    const enriched = {
      ...metadata,
      service_documentation: `${origin}/docs/mcp`,
    }
    return Response.json(enriched, { headers: CORS_HEADERS })
  } catch (error) {
    return Response.json(
      {
        error: 'discovery_fetch_error',
        message: error instanceof Error ? error.message : 'Failed to fetch OAuth metadata',
        upstream: discoveryUrl,
      },
      { status: 502, headers: CORS_HEADERS },
    )
  }
}