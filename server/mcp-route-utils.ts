import { NextRequest } from 'next/server'
import { randomUUID } from 'node:crypto'
import { rateLimit } from '@/lib/rate-limit'
import { MCP_KEY_PREFIX_ADMIN, MCP_KEY_PREFIX_USER, MCP_PROTOCOL_VERSION } from '@/lib/mcp-constants'
import { MCP_OAUTH_SCOPE_CHALLENGE } from '@/lib/mcp/oauth-metadata'
import { extractMcpCredential, type McpAuthContext } from './mcp-auth'

export type McpAuthChallengeMode = 'oauth' | 'api-key'
import type { ToolDefinition } from './mcp-helpers'
import { prisma } from '@/lib/prisma'
import { ensureMcpTables } from './mcp-auto-migrate'

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Authorization, Content-Type, Accept, Mcp-Session-Id, MCP-Protocol-Version, X-API-Key, X-Qunt-Api-Key, X-Requested-With',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id, WWW-Authenticate',
  'Access-Control-Max-Age': '86400',
}

export interface McpRouteConfig {
  tools: ToolDefinition[]
  authenticate: (request: NextRequest) => Promise<McpAuthContext | null>
  handleToolCall: (toolName: string, args: Record<string, unknown>, ctx: McpAuthContext | null) => Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }>
  serverName: string
  serverVersion: string
  /** api-key: no OAuth discovery on 401 (Cursor header auth workaround). oauth: default. */
  authChallenge?: McpAuthChallengeMode
  rateLimitWindow?: number
  rateLimitMax?: number
}

const DEFAULT_LIMITER = rateLimit({ limit: 60, window: 60_000, identifier: 'mcp' })

function jsonRpcError(id: unknown, code: number, message: string, status: number, headers?: HeadersInit) {
  return Response.json({ jsonrpc: '2.0', error: { code, message }, id }, { status, headers: { ...CORS_HEADERS, ...(headers ?? {}) } })
}

function jsonRpcResult(id: unknown, result: unknown) {
  return Response.json({ jsonrpc: '2.0', result, id }, { headers: CORS_HEADERS })
}

function jsonRpcNoContent(status: number) {
  return new Response(null, { status, headers: CORS_HEADERS })
}

function getAuthChallengeHeaders(
  request: NextRequest,
  error = 'invalid_token',
  mode: McpAuthChallengeMode = 'oauth',
): HeadersInit {
  const credential = extractMcpCredential(request)
  const apiKeyAttempt =
    mode === 'api-key' ||
    Boolean(
      credential?.startsWith(MCP_KEY_PREFIX_USER) || credential?.startsWith(MCP_KEY_PREFIX_ADMIN),
    )

  if (apiKeyAttempt) {
    return {
      'WWW-Authenticate': `Bearer error="${error}", error_description="API key required"`,
    }
  }
  const resourceMetadataUrl = new URL('/.well-known/oauth-protected-resource/api/mcp', request.url)
  return {
    'WWW-Authenticate': `Bearer resource_metadata="${resourceMetadataUrl.toString()}", scope="${MCP_OAUTH_SCOPE_CHALLENGE}", error="${error}"`,
  }
}

function isAuthError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const msg = error.message
  return msg.includes('Unauthorized') ||
    msg.includes('Missing Authorization') ||
    msg.includes('Authentication required') ||
    msg.includes('Invalid or expired') ||
    msg.includes('Invalid API key') ||
    msg.includes('User account not found') ||
    msg.includes('Forbidden')
}

function authHeaderError(error: unknown): string {
  if (!(error instanceof Error)) return 'invalid_token'
  return error.message.includes('Missing Authorization') ? 'invalid_request' : 'invalid_token'
}

async function logMcpCall(ctx: McpAuthContext | null, tool: string, args: Record<string, unknown>, success: boolean, durationMs: number, errorCode?: string) {
  try {
      await prisma.mcpAuditLog.create({
        data: {
          userId: ctx?.userId,
          apiKeyId: ctx?.apiKeyId,
          tool,
          argsKeys: Object.keys(args).length > 0 ? JSON.stringify(Object.keys(args)) : null,
          success,
          durationMs,
          errorCode,
        },
      })
  } catch {
    await ensureMcpTables()
    try {
      await prisma.mcpAuditLog.create({
        data: {
          userId: ctx?.userId,
          apiKeyId: ctx?.apiKeyId,
          tool,
          argsKeys: Object.keys(args).length > 0 ? JSON.stringify(Object.keys(args)) : null,
          success,
          durationMs,
          errorCode,
        },
      })
    } catch {
      // audit log failures are non-fatal
    }
  }
}

export async function handleMcpRequest(request: NextRequest, config: McpRouteConfig): Promise<Response> {
  let reqId: unknown = null
  let ctx: McpAuthContext | null = null
  let toolName: string | undefined
  const methodStartTime = performance.now()

  // Per MCP Streamable HTTP spec: validate Accept header for POST requests
  if (request.method === 'POST') {
    const accept = request.headers.get('accept') ?? ''
    if (!accept.includes('application/json') && !accept.includes('*/*') && !accept.includes('text/event-stream')) {
      return jsonRpcError(null, -32600, 'Invalid Request: Accept header must include application/json or text/event-stream', 406)
    }
  }

  // Per spec: validate Origin to prevent DNS rebinding (for remote public MCP this is relaxed but we log/allow known AI clients)
  const origin = request.headers.get('origin')
  if (origin) {
    // Allow common AI clients and any https (our public MCP is intended for remote use)
    const allowed = origin.includes('claude.ai') || origin.includes('anthropic.com') || origin.includes('grok') || origin.includes('x.ai') || origin.startsWith('https://')
    if (!allowed && !origin.includes('localhost')) {
      // For strict, we could 403, but for compatibility with remote AI we allow https origins.
      // Uncomment to enforce: return jsonRpcError(null, -32000, 'Origin not allowed', 403)
    }
  }

  // Support MCP-Protocol-Version header (newer spec)
  const protocolVersionHeader = request.headers.get('mcp-protocol-version')
  if (protocolVersionHeader && protocolVersionHeader !== MCP_PROTOCOL_VERSION && !protocolVersionHeader.startsWith('2025-')) {
    return jsonRpcError(null, -32602, `Unsupported MCP-Protocol-Version: ${protocolVersionHeader}. Supported: ${MCP_PROTOCOL_VERSION}`, 400)
  }

  try {
    const contentType = request.headers.get('content-type') ?? ''
    if (!contentType.includes('application/json')) {
      return jsonRpcError(null, -32700, 'Parse error: Content-Type must be application/json', 415)
    }

    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return jsonRpcError(null, -32700, 'Parse error: invalid JSON body', 400)
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return jsonRpcError(null, -32600, 'Invalid Request: body must be a JSON object', 400)
    }

    const { method, params, id } = body as { method?: string; params?: Record<string, unknown>; id?: unknown }
    reqId = id ?? null

    if (body.jsonrpc !== '2.0') {
      return jsonRpcError(reqId, -32600, 'Invalid Request: jsonrpc must be "2.0"', 400)
    }

    if (!method) {
      return jsonRpcError(reqId, -32600, 'Invalid Request: method is required', 400)
    }

    if (method === 'ping') {
      return jsonRpcResult(reqId, {})
    }

    if (method === 'initialize') {
      // Per MCP spec: server responds with its own highest supported protocol version.
      // If the client requests a version we don't support, we still respond with ours
      // and the client decides whether to continue.
      const clientVersion = params?.protocolVersion as string | undefined
      const serverVersion = MCP_PROTOCOL_VERSION
      if (clientVersion && clientVersion !== serverVersion) {
        // Log version mismatch but continue — client may still accept our version
      }
      const sessionId = randomUUID ? randomUUID() : 'sess_' + Date.now()
      const result = {
        protocolVersion: serverVersion,
        capabilities: {
          tools: { listChanged: false },
        },
        serverInfo: { name: config.serverName, version: config.serverVersion },
        instructions: "Qunt Edge MCP server. Use tools/list and tools/call for trading data, journal, analytics, imports, teams, and admin operations.",
      }
      // Return with MCP-Session-Id so clients that want stateful sessions get it (we are mostly stateless but comply with the header contract)
      const res = Response.json({ jsonrpc: '2.0', result, id: reqId }, { headers: { ...CORS_HEADERS, 'Mcp-Session-Id': sessionId } })
      return res
    }

    if (
      method === 'notifications/initialized' ||
      method === 'notifications/cancelled' ||
      method === 'notifications/progress' ||
      method.startsWith('notifications/')
    ) {
      return jsonRpcNoContent(202)
    }

    // Graceful support for common MCP discovery methods that many clients probe.
    // Returning empty successful results prevents "Method not found" errors in Claude Desktop, Cursor, Cline, etc.
    if (
      method === 'resources/list' ||
      method === 'resources/templates/list' ||
      method === 'prompts/list' ||
      method === 'roots/list' ||
      method === 'logging/list' ||
      method === 'completion/complete'
    ) {
      if (method === 'roots/list') return jsonRpcResult(reqId, { roots: [] })
      if (method === 'prompts/list') return jsonRpcResult(reqId, { prompts: [] })
      return jsonRpcResult(reqId, { resources: [] })
    }

    if (method === 'resources/read' || method === 'prompts/get') {
      return jsonRpcError(reqId, -32602, `${method} is not supported on this server. This server primarily exposes tools.`, 200)
    }

    if (method === 'tools/list' || method === 'tools/call') {
      ctx = await config.authenticate(request)
    } else {
      ctx = null
    }

    // Rate limit with API key subject when authenticated
    if (method === 'tools/list' || method === 'tools/call') {
      const rlSubject = ctx?.userId ?? undefined
      const limiter = DEFAULT_LIMITER
      const rlResult = await limiter(request, rlSubject ? { subject: rlSubject } : undefined)
      if (!rlResult.success) {
        return jsonRpcError(reqId, -32000, 'Rate limit exceeded. Try again later.', 429)
      }
    }

    if (method === 'tools/list') {
      if (!ctx) {
        return jsonRpcError(
          reqId,
          -32001,
          'Authentication required for tools/list. Use Authorization: Bearer qunt_usr_* or complete OAuth login.',
          401,
          config.authChallenge === 'oauth'
            ? getAuthChallengeHeaders(request, 'invalid_request', 'oauth')
            : undefined,
        )
      }
      const cursor = typeof params?.cursor === 'string' ? params.cursor : undefined
      const PAGE_SIZE = 50
      const allTools = config.tools
      let startIndex = 0
      if (cursor) {
        try {
          startIndex = parseInt(Buffer.from(cursor, 'base64').toString(), 10)
          if (isNaN(startIndex) || startIndex < 0 || startIndex >= allTools.length) startIndex = 0
        } catch {
          startIndex = 0
        }
      }
      const endIndex = Math.min(startIndex + PAGE_SIZE, allTools.length)
      const page = allTools.slice(startIndex, endIndex)
      const tools = page.map((t) => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
        ...(t.outputSchema ? { outputSchema: t.outputSchema } : {}),
        ...(t.annotations ? { annotations: t.annotations } : {}),
      }))
      const result: Record<string, unknown> = { tools }
      if (endIndex < allTools.length) {
        result.nextCursor = Buffer.from(String(endIndex)).toString('base64')
      }
      return jsonRpcResult(reqId, result)
    }

    if (method === 'tools/call') {
      toolName = params?.name as string | undefined
      const toolArgs = (params?.arguments ?? {}) as Record<string, unknown>

      if (!toolName || typeof toolName !== 'string') {
        return jsonRpcError(reqId, -32602, 'Invalid params: tool name is required and must be a string', 400)
      }

      if (typeof toolArgs !== 'object' || toolArgs === null) {
        return jsonRpcError(reqId, -32602, 'Invalid params: arguments must be an object', 400)
      }

      const toolDef = config.tools.find((t) => t.name === toolName)
      if (!toolDef) {
      return jsonRpcError(reqId, -32601, `Unknown tool: "${toolName}". Use tools/list to get the current catalog.`, 200)
      }

      let result: { content: Array<{ type: string; text: string }>; isError?: boolean }
      if (!ctx) {
        return jsonRpcError(
          reqId,
          -32001,
          'Authentication required for tools/call. Use Authorization: Bearer qunt_usr_* from Settings → API Keys.',
          401,
          config.authChallenge === 'oauth'
            ? getAuthChallengeHeaders(request, 'invalid_request', 'oauth')
            : undefined,
        )
      }

      try {
        result = await config.handleToolCall(toolName, toolArgs, ctx)
      } catch (toolError_) {
        const msg = toolError_ instanceof Error ? toolError_.message : 'Tool call failed'
        result = { content: [{ type: 'text', text: msg }], isError: true }
      }

      const duration = Math.round(performance.now() - methodStartTime)
      await logMcpCall(ctx, toolName, toolArgs, !result.isError, duration, result.isError ? 'TOOL_ERROR' : undefined)

      return jsonRpcResult(reqId, result)
    }

    // Unknown method — return proper JSON-RPC error with 200 status.
    // Using 200 + standard error code is much more compatible than 404/500 for many MCP clients.
    return jsonRpcError(reqId, -32601, `Method not supported: ${method}. Supported: initialize, ping, tools/list, tools/call. Discovery methods (resources/*, prompts/*, roots/*) return empty results.`, 200)
  } catch (error) {
    const duration = Math.round(performance.now() - methodStartTime)
    if (toolName) {
      try {
        await logMcpCall(ctx, toolName, {}, false, duration, 'HANDLER_ERROR')
      } catch {
        // audit failures must not mask auth errors
      }
    }

    const forbidden = error instanceof Error && error.message.includes('Forbidden')
    const auth = isAuthError(error)
    const code = forbidden ? -32002 : auth ? -32001 : -32603
    const message = forbidden
      ? 'Admin role required. Use a qunt_adm_... key.'
      : auth
        ? error instanceof Error
          ? error.message
          : 'Authentication required. Use Authorization: Bearer qunt_usr_* from Settings → API Keys.'
        : error instanceof Error
          ? error.message
          : 'Internal server error'
    const headers =
      auth && !forbidden && config.authChallenge === 'oauth'
        ? getAuthChallengeHeaders(request, authHeaderError(error), 'oauth')
        : undefined
    return jsonRpcError(reqId, code, message, forbidden ? 403 : auth ? 401 : 500, headers)
  }
}
