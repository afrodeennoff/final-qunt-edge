import { NextRequest } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { MCP_PROTOCOL_VERSION } from '@/lib/mcp-constants'
import type { McpAuthContext } from './mcp-auth'
import type { ToolDefinition } from './mcp-helpers'
import { prisma } from '@/lib/prisma'
import { ensureMcpTables } from './mcp-auto-migrate'

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept, Mcp-Session-Id',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id',
  'Access-Control-Max-Age': '86400',
}

export interface McpRouteConfig {
  tools: ToolDefinition[]
  authenticate: (request: NextRequest) => Promise<McpAuthContext | null>
  handleToolCall: (toolName: string, args: Record<string, unknown>, ctx: McpAuthContext | null) => Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }>
  serverName: string
  serverVersion: string
  rateLimitWindow?: number
  rateLimitMax?: number
}

const DEFAULT_LIMITER = rateLimit({ limit: 60, window: 60_000, identifier: 'mcp' })

function jsonRpcError(id: unknown, code: number, message: string, status: number) {
  return Response.json({ jsonrpc: '2.0', error: { code, message }, id }, { status, headers: CORS_HEADERS })
}

function jsonRpcResult(id: unknown, result: unknown) {
  return Response.json({ jsonrpc: '2.0', result, id }, { headers: CORS_HEADERS })
}

function jsonRpcNoContent(status: number) {
  return new Response(null, { status, headers: CORS_HEADERS })
}

function isAuthError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const msg = error.message
  return msg.includes('Unauthorized') ||
    msg.includes('Missing Authorization') ||
    msg.includes('Invalid or expired') ||
    msg.includes('User account not found') ||
    msg.includes('Forbidden')
}

async function logMcpCall(ctx: McpAuthContext | null, tool: string, args: Record<string, unknown>, success: boolean, durationMs: number, errorCode?: string) {
  try {
    await prisma.mcpAuditLog.create({
      data: {
        userId: ctx?.userId,
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
  const startTime = performance.now()
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
      return jsonRpcResult(reqId, {
        protocolVersion: serverVersion,
        capabilities: {
          tools: { listChanged: false },
        },
        serverInfo: { name: config.serverName, version: config.serverVersion },
        instructions: "Qunt Edge MCP server. Use tools/list and tools/call for trading data, journal, analytics, imports, teams, and admin operations.",
      })
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

    ctx = method !== 'tools/list' && method !== 'tools/call'
      ? null
      : await config.authenticate(request)

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
      await logMcpCall(ctx, toolName, {}, false, duration, 'HANDLER_ERROR')
    }

    const auth = isAuthError(error)
    const forbidden = error instanceof Error && error.message.includes('Forbidden')
    const code = auth ? -32001 : forbidden ? -32002 : -32603
    const message = auth
      ? 'Authentication failed. Use Authorization: Bearer <qunt_usr_... key or Supabase token>. Create keys in Settings → API Keys.'
      : forbidden
        ? 'Admin role required. Use a qunt_adm_... key.'
        : 'Internal server error'
    return jsonRpcError(reqId, code, message, auth ? 401 : forbidden ? 403 : 500)
  }
}
