import { NextRequest } from 'next/server'
import { handleMcpRequest, CORS_HEADERS, type McpRouteConfig } from '@/server/mcp-route-utils'
import { authenticateMcpRequest } from '@/server/mcp-auth'
import { handleMcpToolCall, standardTools } from '@/server/mcp-tools'
import { handleUserWriteToolCall, userWriteTools } from '@/server/mcp-user-write-tools'
import { handleAdminMcpToolCall, adminTools } from '@/server/mcp-admin-tools'
import { handleAdminWriteToolCall, adminWriteTools } from '@/server/mcp-admin-write-tools'
import { handleWebsiteMcpToolCall, websiteTools } from '@/server/mcp-website-tools'
import { MCP_SERVER_NAME, MCP_SERVER_VERSION } from '@/lib/mcp-constants'
import { getSiteOrigin } from '@/lib/site-url'

const USER_TOOLS = [...standardTools, ...userWriteTools, ...websiteTools]

const mainConfig: McpRouteConfig = {
  tools: USER_TOOLS,
  authenticate: async (request) => {
    return authenticateMcpRequest(request.headers.get('authorization'))
  },
  handleToolCall: async (toolName, args, ctx) => {
    if (websiteTools.some((t) => t.name === toolName)) {
      return handleWebsiteMcpToolCall(toolName, args, ctx!)
    }
    if (userWriteTools.some((t) => t.name === toolName)) {
      return handleUserWriteToolCall(toolName, args, ctx!)
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
  // Stable production path — legacy router is the only supported path.
  // It powers all 95+ tools with full auth, rate limiting, and audit logging.
  return handleMcpRequest(request, mainConfig)
}

export async function GET(request: NextRequest) {
  const origin = getSiteOrigin()

  // Per Streamable HTTP spec: if client wants SSE stream for server messages, we currently
  // do not offer persistent server->client notifications on this endpoint (tools-focused,
  // responses are returned directly on the POST). Return 405 so clients fall back gracefully.
  const accept = request.headers.get('accept') ?? ''
  if (accept.includes('text/event-stream')) {
    return new Response('SSE stream not offered on this endpoint (use POST for requests; responses are JSON or SSE per Accept on the initiating POST).', {
      status: 405,
      headers: { ...CORS_HEADERS, 'Allow': 'POST, OPTIONS' },
    })
  }

  const personalTools = [...standardTools, ...userWriteTools]
  const totalTools = personalTools.length + websiteTools.length
  const adminTotal = totalTools + adminTools.length + adminWriteTools.length

  return Response.json({
    name: MCP_SERVER_NAME,
    version: MCP_SERVER_VERSION,
    protocol: 'MCP JSON-RPC 2.0 (stable, Streamable HTTP compatible)',
    description: 'Qunt Edge MCP — connect any AI agent to your trading data, journal, analytics, imports, teams, and platform admin tools. 95+ tools.',
    authentication: {
      methods: ['api-key', 'oauth'],
      apiKey: {
        recommended: true,
        description: 'Generate keys in Settings → API Keys (qunt_usr_* for normal, qunt_adm_* for admin). Also accepts Supabase access tokens.',
        header: 'Authorization: Bearer <key-or-token>',
      },
      oauth: {
        protectedResourceMetadata: `${origin}/.well-known/oauth-protected-resource/api/mcp`,
        authorizationServer: 'Supabase Auth (enable OAuth 2.1 Server in dashboard)',
        consentPath: '/oauth/consent',
        scopes: ['openid', 'email', 'profile'],
      },
    },
    endpoints: [
      {
        path: '/api/mcp',
        url: `${origin}/api/mcp`,
        auth: 'Bearer (user key or token)',
        tools: totalTools,
        description: 'Your personal trading data + public tools.',
      },
      {
        path: '/api/mcp/public',
        url: `${origin}/api/mcp/public`,
        auth: 'none',
        tools: websiteTools.length,
        description: 'Public data (prop firms, deals, blog, leaderboard, etc.).',
      },
      {
        path: '/api/mcp/admin',
        url: `${origin}/api/mcp/admin`,
        auth: 'Bearer (admin key)',
        tools: adminTotal,
        description: 'Full platform access + admin tools.',
      },
    ],
    notes: [
      "All discovery methods (resources/*, prompts/*, roots/*) are handled gracefully.",
      "This is the stable, production MCP server used by Claude Desktop, Cursor, Cline, and other agents. Streamable HTTP compatible (POST + optional SSE per Accept).",
      "For Grok / xAI Remote MCP: use this URL as server_url and pass your qunt_usr_* key via the authorization field in the MCP tool config.",
    ],
  }, { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } })
}

export async function DELETE(request: NextRequest) {
  // Per Streamable HTTP spec: client can DELETE with Mcp-Session-Id to terminate session.
  // We are mostly stateless; just acknowledge.
  const sessionId = request.headers.get('mcp-session-id')
  // No server-side session to clean in the legacy path; return 204.
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}
