import { NextRequest } from 'next/server'
import { CORS_HEADERS } from '@/server/mcp-route-utils'

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const resourcePath = url.pathname.replace('/.well-known/oauth-protected-resource', '') || '/api/mcp'
  const resource = new URL(resourcePath, url.origin).toString()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL

  const metadata: Record<string, unknown> = {
    resource,
    resource_name: 'Qunt Edge MCP',
    bearer_methods_supported: ['header'],
    scopes_supported: ['mcp:read', 'mcp:write'],
    documentation_uri: new URL('/docs/mcp', url.origin).toString(),
  }

  if (supabaseUrl) {
    metadata.authorization_servers = [`${supabaseUrl.replace(/\/$/, '')}/auth/v1`]
  }

  return Response.json(metadata, {
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
    },
  })
}
