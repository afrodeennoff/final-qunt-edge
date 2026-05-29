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

  const totalTools = standardTools.length + websiteTools.length

  return Response.json({
    name: MCP_SERVER_NAME,
    version: MCP_SERVER_VERSION,
    protocol: 'MCP JSON-RPC 2.0',
    description: 'Qunt Edge Model Context Protocol server — connect AI tools to your trading data',
    documentation: 'https://spec.modelcontextprotocol.io',
    authentication: {
      methods: ['api-key', 'oauth'],
      apiKey: {
        description: 'Generate an API key in Settings → API Keys',
        header: 'Authorization: Bearer <api_key>',
      },
      oauth: {
        description: 'Use your Supabase OAuth access token',
        header: 'Authorization: Bearer <supabase_access_token>',
        metadata: `${origin}/.well-known/oauth-protected-resource`,
      },
    },
    connection: {
      curl: `curl -X POST ${origin}/api/mcp -H "Authorization: Bearer YOUR_API_KEY" -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"initialize","id":1}'`,
      claude_desktop: {
        command: 'npx',
        args: ['mcp-remote', `${origin}/api/mcp`],
      },
      cursor: {
        url: `${origin}/api/mcp`,
      },
    },
    endpoints: [
      {
        path: '/api/mcp',
        url: `${origin}/api/mcp`,
        auth: 'API key or OAuth token required',
        tools: totalTools,
        description: 'Personal trading data + public website data.',
      },
      {
        path: '/api/mcp/public',
        url: `${origin}/api/mcp/public`,
        auth: 'None',
        tools: websiteTools.length,
        description: 'Public data only. Prop firms, deals, blog, leaderboard, benchmarks, community posts.',
      },
      {
        path: '/api/mcp/admin',
        url: `${origin}/api/mcp/admin`,
        auth: 'Admin API key or admin OAuth token required',
        description: 'Full access including admin operations.',
      },
    ],
    tools: {
      personal: standardTools.map(toolCatalog),
      website: websiteTools.map(toolCatalog),
    },
  }, { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } })
}
