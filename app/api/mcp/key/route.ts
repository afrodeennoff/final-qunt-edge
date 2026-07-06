import { NextRequest } from 'next/server'
import { handleMcpRequest, CORS_HEADERS } from '@/server/mcp-route-utils'
import { createPersonalMcpRouteConfig } from '@/server/mcp-personal-config'
import { standardTools } from '@/server/mcp-tools'
import { userWriteTools } from '@/server/mcp-user-write-tools'
import { websiteTools } from '@/server/mcp-website-tools'
import { MCP_SERVER_NAME, MCP_SERVER_VERSION } from '@/lib/mcp-constants'
import { getSiteOrigin } from '@/lib/site-url'

/**
 * API-key-only MCP endpoint for Cursor and other clients that ignore configured
 * Authorization headers when OAuth discovery is present on /api/mcp.
 * See: https://forum.cursor.com/t/mcp-headers-config-ignored-when-server-has-oauth-discovery/156054
 */
const keyConfig = createPersonalMcpRouteConfig('api-key')

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(request: NextRequest) {
  return handleMcpRequest(request, keyConfig)
}

export async function GET() {
  const origin = getSiteOrigin()
  const personalTools = [...standardTools, ...userWriteTools]
  const totalTools = personalTools.length + websiteTools.length

  return Response.json(
    {
      name: `${MCP_SERVER_NAME}/key`,
      version: MCP_SERVER_VERSION,
      description:
        'Qunt Edge MCP (API key). Use with Cursor: set QUNT_MCP_API_KEY env and Authorization header. No OAuth on this path.',
      authentication: {
        methods: ['api-key'],
        header: 'Authorization: Bearer qunt_usr_...',
        createKeyAt: `${origin}/en/dashboard/settings`,
      },
      tools: totalTools,
    },
    {
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    },
  )
}

export async function DELETE() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}