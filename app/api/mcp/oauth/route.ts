import { NextRequest } from 'next/server'
import { handleMcpRequest, CORS_HEADERS } from '@/server/mcp-route-utils'
import { createPersonalMcpRouteConfig } from '@/server/mcp-personal-config'

/** Supabase OAuth discovery + browser consent (experimental in some MCP clients). */
const oauthConfig = createPersonalMcpRouteConfig('oauth')

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(request: NextRequest) {
  return handleMcpRequest(request, oauthConfig)
}

export async function DELETE() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}