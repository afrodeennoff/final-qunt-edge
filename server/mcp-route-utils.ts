import { NextRequest } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { MCP_PROTOCOL_VERSION } from '@/lib/mcp-constants'
import type { McpAuthContext } from './mcp-auth'

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Max-Age': '86400',
}

export interface McpRouteConfig {
  tools: Array<{ name: string; description: string; inputSchema: Record<string, unknown> }>
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

export async function handleMcpRequest(request: NextRequest, config: McpRouteConfig): Promise<Response> {
  let reqId: unknown = null
  try {
    const limiter = DEFAULT_LIMITER
    const rlResult = await limiter(request)
    if (!rlResult.success) {
      return jsonRpcError(null, -32000, 'Rate limit exceeded', 429)
    }

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

    const ctx = method !== 'tools/list' && method !== 'tools/call'
      ? null
      : await config.authenticate(request)

    if (method === 'tools/list') {
      return jsonRpcResult(reqId, { tools: config.tools })
    }

    if (method === 'tools/call') {
      const toolName = params?.name
      const toolArgs = (params?.arguments ?? {}) as Record<string, unknown>

      if (!toolName || typeof toolName !== 'string') {
        return jsonRpcError(reqId, -32602, 'Invalid params: tool name required', 400)
      }

      if (typeof toolArgs !== 'object' || toolArgs === null) {
        return jsonRpcError(reqId, -32602, 'Invalid params: arguments must be an object', 400)
      }

      const toolDef = config.tools.find((t) => t.name === toolName)
      if (!toolDef) {
        return jsonRpcError(reqId, -32601, `Method not found: ${toolName}`, 404)
      }

      let result: { content: Array<{ type: string; text: string }>; isError?: boolean }
      try {
        result = await config.handleToolCall(toolName, toolArgs, ctx)
      } catch (toolError_) {
        const msg = toolError_ instanceof Error ? toolError_.message : 'Tool call failed'
        result = { content: [{ type: 'text', text: msg }], isError: true }
      }
      return jsonRpcResult(reqId, result)
    }

    return jsonRpcError(reqId, -32601, `Method not found: ${method}`, 404)
  } catch (error) {
    const auth = isAuthError(error)
    const forbidden = error instanceof Error && error.message.includes('Forbidden')
    const code = auth ? -32001 : forbidden ? -32002 : -32603
    const message = auth ? 'Authentication failed' : forbidden ? 'Access denied' : 'Internal server error'
    return jsonRpcError(reqId, code, message, auth ? 401 : forbidden ? 403 : 500)
  }
}
