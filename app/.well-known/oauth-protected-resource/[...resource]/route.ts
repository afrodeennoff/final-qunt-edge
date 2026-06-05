import { NextRequest } from 'next/server'
import { CORS_HEADERS } from '@/server/mcp-route-utils'
import { getMcpProtectedResourceMetadata } from '@/lib/mcp/oauth-metadata'

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

/** Cursor ignores configured API keys when this metadata exists for the MCP URL path. */
const API_KEY_ONLY_RESOURCE_PREFIXES = ['/api/mcp/key']

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const resourcePath = url.pathname.replace('/.well-known/oauth-protected-resource', '') || '/api/mcp'

  if (API_KEY_ONLY_RESOURCE_PREFIXES.some((p) => resourcePath === p || resourcePath.startsWith(`${p}/`))) {
    return new Response(null, { status: 404, headers: CORS_HEADERS })
  }
  const resource = new URL(resourcePath, url.origin).toString().replace(/\/$/, '') || getMcpProtectedResourceMetadata().resource

  const metadata = getMcpProtectedResourceMetadata(resource)

  return Response.json(metadata, {
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
