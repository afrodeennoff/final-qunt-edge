import { NextRequest } from 'next/server'
import { handleMcpRequest, CORS_HEADERS, type McpRouteConfig } from '@/server/mcp-route-utils'
import { authenticateMcpRequest, requireAdminAccess } from '@/server/mcp-auth'
import { handleMcpToolCall, standardTools } from '@/server/mcp-tools'
import { handleAdminMcpToolCall, adminTools } from '@/server/mcp-admin-tools'
import { handleWebsiteMcpToolCall, websiteTools } from '@/server/mcp-website-tools'
import { MCP_SERVER_NAME, MCP_SERVER_VERSION } from '@/lib/mcp-constants'

const ALL_TOOLS = [...standardTools, ...websiteTools, ...adminTools]

const adminConfig: McpRouteConfig = {
  tools: ALL_TOOLS,
  authenticate: async (request) => {
    const ctx = await authenticateMcpRequest(request.headers.get('authorization'))
    requireAdminAccess(ctx)
    return ctx
  },
  handleToolCall: async (toolName, args, ctx) => {
    if (adminTools.some((t) => t.name === toolName)) {
      return handleAdminMcpToolCall(toolName, args, ctx!)
    }
    if (websiteTools.some((t) => t.name === toolName)) {
      return handleWebsiteMcpToolCall(toolName, args, ctx!)
    }
    return handleMcpToolCall(toolName, args, ctx!)
  },
  serverName: `${MCP_SERVER_NAME}/admin`,
  serverVersion: MCP_SERVER_VERSION,
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(request: NextRequest) {
  const useSdk = process.env.MCP_SDK_ENABLED === 'true'
  if (useSdk) {
    return Response.json(
      { error: 'MCP SDK path not fully wired yet. Use MCP_SDK_ENABLED=false for stable legacy.' },
      { status: 503, headers: CORS_HEADERS }
    )
  }
  return handleMcpRequest(request, adminConfig)
}
