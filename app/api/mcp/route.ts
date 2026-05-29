import { NextRequest } from 'next/server'
import { handleMcpRequest, CORS_HEADERS, type McpRouteConfig } from '@/server/mcp-route-utils'
import { authenticateMcpRequest } from '@/server/mcp-auth'
import { handleMcpToolCall, standardTools } from '@/server/mcp-tools'
import { handleWebsiteMcpToolCall, websiteTools } from '@/server/mcp-website-tools'
import { MCP_SERVER_NAME, MCP_SERVER_VERSION } from '@/lib/mcp-constants'
import { getSiteOrigin } from '@/lib/site-url'

const USER_TOOLS = [...standardTools, ...websiteTools]

const mainConfig: McpRouteConfig = {
  tools: USER_TOOLS,
  authenticate: async (request) => {
    return authenticateMcpRequest(request.headers.get('authorization'))
  },
  handleToolCall: async (toolName, args, ctx) => {
    if (websiteTools.some((t) => t.name === toolName)) {
      return handleWebsiteMcpToolCall(toolName, args, ctx!)
    }
    return handleMcpToolCall(toolName, args, ctx!)
  },
  serverName: MCP_SERVER_NAME,
  serverVersion: MCP_SERVER_VERSION,
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(request: NextRequest) {
  return handleMcpRequest(request, mainConfig)
}

export async function GET() {
  const origin = getSiteOrigin()
  const endpoints = [
    { path: '/api/mcp', auth: 'User API key required', description: 'Personal trading data + public data' },
    { path: '/api/mcp/public', auth: 'None', description: 'Public data only (prop firms, deals, blog, leaderboard)' },
    { path: '/api/mcp/admin', auth: 'Admin API key required', description: 'Full access including admin operations' },
  ]
  return Response.json({
    name: MCP_SERVER_NAME,
    version: MCP_SERVER_VERSION,
    protocol: 'MCP JSON-RPC 2.0',
    description: 'Qunt Edge Model Context Protocol server — connect AI tools to trading data',
    documentation: 'https://spec.modelcontextprotocol.io',
    endpoints: endpoints.map((e) => ({ ...e, url: `${origin}${e.path}` })),
  }, { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } })
}
