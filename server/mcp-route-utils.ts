import { NextRequest } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { MCP_PROTOCOL_VERSION } from '@/lib/mcp-constants'
import type { McpAuthContext } from './mcp-auth'
import type { ToolDefinition } from './mcp-helpers'
import { prisma } from '@/lib/prisma'

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
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
    // audit log failures are non-fatal
  }
}

export async function handleMcpRequest(request: NextRequest, config: McpRouteConfig): Promise<Response> {
  let reqId: unknown = null
  const startTime = performance.now()
  let ctx: McpAuthContext | null = null
  let toolName: string | undefined
  const methodStartTime = performance.now()

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
      return jsonRpcResult(reqId, {
        protocolVersion: MCP_PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: config.serverName, version: config.serverVersion },
      })
    }

    if (method === 'notifications/initialized' || method === 'notifications/cancelled') {
      return jsonRpcNoContent(202)
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
      const tools = config.tools.map((t) => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
        ...(t.outputSchema ? { outputSchema: t.outputSchema } : {}),
        ...(t.annotations ? { annotations: t.annotations } : {}),
      }))
      return jsonRpcResult(reqId, { tools })
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
        return jsonRpcError(reqId, -32601, `Method not found: ${toolName}. Available: ${config.tools.map(t => t.name).join(', ')}`, 404)
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

    return jsonRpcError(reqId, -32601, `Method not found: ${method}`, 404)
  } catch (error) {
    const duration = Math.round(performance.now() - methodStartTime)
    if (toolName) {
      await logMcpCall(ctx, toolName, {}, false, duration, 'HANDLER_ERROR')
    }

    const auth = isAuthError(error)
    const forbidden = error instanceof Error && error.message.includes('Forbidden')
    const code = auth ? -32001 : forbidden ? -32002 : -32603
    const message = auth ? 'Authentication failed. Provide a valid Bearer token.' : forbidden ? 'Access denied. Admin role required.' : 'Internal server error'
    return jsonRpcError(reqId, code, message, auth ? 401 : forbidden ? 403 : 500)
  }
}
