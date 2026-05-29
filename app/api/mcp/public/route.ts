import { NextRequest } from 'next/server'
import { handleMcpRequest, CORS_HEADERS, type McpRouteConfig } from '@/server/mcp-route-utils'
import { websiteTools, handleWebsiteMcpToolCall } from '@/server/mcp-website-tools'
import { MCP_SERVER_NAME, MCP_SERVER_VERSION } from '@/lib/mcp-constants'

const publicConfig: McpRouteConfig = {
  tools: websiteTools,
  authenticate: async () => null,
  handleToolCall: async (toolName, args) => {
    return handleWebsiteMcpToolCall(toolName, args)
  },
  serverName: `${MCP_SERVER_NAME}/public`,
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
  return handleMcpRequest(request, publicConfig)
}
