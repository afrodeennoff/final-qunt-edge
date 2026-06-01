import { NextRequest } from 'next/server'
import { handleMcpRequest, CORS_HEADERS, type McpRouteConfig } from '@/server/mcp-route-utils'
import { authenticateMcpRequest, requireAdminAccess } from '@/server/mcp-auth'
import { handleMcpToolCall, standardTools } from '@/server/mcp-tools'
import { handleAdminMcpToolCall, adminTools } from '@/server/mcp-admin-tools'
import { handleAdminWriteToolCall, adminWriteTools } from '@/server/mcp-admin-write-tools'
import { handleUserWriteToolCall, userWriteTools } from '@/server/mcp-user-write-tools'
import { handleWebsiteMcpToolCall, websiteTools } from '@/server/mcp-website-tools'
import { MCP_SERVER_NAME, MCP_SERVER_VERSION } from '@/lib/mcp-constants'

const ALL_TOOLS = [...standardTools, ...userWriteTools, ...websiteTools, ...adminTools, ...adminWriteTools]

const adminConfig: McpRouteConfig = {
  tools: ALL_TOOLS,
  authenticate: async (request) => {
    const ctx = await authenticateMcpRequest(request.headers.get('authorization'))
    requireAdminAccess(ctx)
    return ctx
  },
  handleToolCall: async (toolName, args, ctx) => {
    if (adminWriteTools.some((t) => t.name === toolName)) {
      return handleAdminWriteToolCall(toolName, args, ctx!)
    }
    if (adminTools.some((t) => t.name === toolName)) {
      return handleAdminMcpToolCall(toolName, args, ctx!)
    }
    if (websiteTools.some((t) => t.name === toolName)) {
      return handleWebsiteMcpToolCall(toolName, args, ctx!)
    }
    if (userWriteTools.some((t) => t.name === toolName)) {
      return handleUserWriteToolCall(toolName, args, ctx!)
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
  // Stable production path — legacy router is the only supported path.

  return handleMcpRequest(request, adminConfig)
}
