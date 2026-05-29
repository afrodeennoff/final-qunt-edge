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
  const useSdk = process.env.MCP_SDK_ENABLED === 'true'

  if (useSdk) {
    // Official SDK path (Streamable HTTP) - under active migration
    // Full transport + per-endpoint auth + tool registration happens in Tasks 13+
    return Response.json(
      { error: 'MCP SDK transport not fully wired yet in this build. Use MCP_SDK_ENABLED=false for the stable legacy path.' },
      { status: 503, headers: CORS_HEADERS }
    )
  }

  return handleMcpRequest(request, mainConfig)
}

export async function GET() {
  const origin = getSiteOrigin()
  const toolCatalog = (t: (typeof standardTools | typeof websiteTools)[number]) => ({
    name: t.name,
    description: t.description.split('\n')[0],
    inputSchema: t.inputSchema,
    annotations: t.annotations,
  })
  return Response.json({
    name: MCP_SERVER_NAME,
    version: MCP_SERVER_VERSION,
    protocol: 'MCP JSON-RPC 2.0',
    description: 'Qunt Edge Model Context Protocol server — connect AI tools to your trading data',
    documentation: 'https://spec.modelcontextprotocol.io',
    endpoints: [
      {
        path: '/api/mcp',
        url: `${origin}/api/mcp`,
        auth: 'User API key required',
        description: 'Personal trading data + public data. 16 tools: accounts, trades, performance, tags, profile, prop firms, deals, blog, leaderboard.',
      },
      {
        path: '/api/mcp/public',
        url: `${origin}/api/mcp/public`,
        auth: 'None',
        description: 'Public data only. 10 tools: prop firms, deals, blog, leaderboard, benchmarks, community posts.',
      },
      {
        path: '/api/mcp/admin',
        url: `${origin}/api/mcp/admin`,
        auth: 'Admin API key required',
        description: 'Full access including admin operations. All 20 tools.',
      },
    ],
    tools: {
      personal: standardTools.map(toolCatalog),
      website: websiteTools.map(toolCatalog),
    },
  }, { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } })
}
