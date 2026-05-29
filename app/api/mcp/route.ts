import { NextRequest } from 'next/server'
import { authenticateMcpRequest, requireAdminAccess } from '@/server/mcp-auth'
import { handleMcpToolCall, standardTools } from '@/server/mcp-tools'
import { handleAdminMcpToolCall, adminTools } from '@/server/mcp-admin-tools'
import { handleWebsiteMcpToolCall, websiteTools } from '@/server/mcp-website-tools'
import { MCP_SERVER_NAME, MCP_SERVER_VERSION, MCP_PROTOCOL_VERSION } from '@/lib/mcp-constants'
import { rateLimit } from '@/lib/rate-limit'

const ALL_TOOLS = [...standardTools, ...adminTools, ...websiteTools]

const limiter = rateLimit({ limit: 60, window: 60_000, identifier: 'mcp' })

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Max-Age': '86400',
}

function jsonRpcError(id: unknown, code: number, message: string, status: number) {
  return Response.json({ jsonrpc: '2.0', error: { code, message }, id }, { status, headers: CORS_HEADERS })
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(request: NextRequest) {
  let reqId: unknown = null
  try {
    // Rate limiting
    const rlResult = await limiter(request)
    if (!rlResult.success) {
      return jsonRpcError(null, -32000, 'Rate limit exceeded', 429)
    }

    const contentType = request.headers.get('content-type') ?? ''
    if (!contentType.includes('application/json')) {
      return jsonRpcError(null, -32700, 'Parse error: Content-Type must be application/json', 415)
    }

    const authCtx = await authenticateMcpRequest(request.headers.get('authorization'))

    const body = await request.json()
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
      return Response.json({ jsonrpc: '2.0', result: {}, id: reqId }, { headers: CORS_HEADERS })
    }

    if (method === 'initialize') {
      return Response.json({
        jsonrpc: '2.0',
        result: {
          protocolVersion: MCP_PROTOCOL_VERSION,
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: MCP_SERVER_NAME, version: MCP_SERVER_VERSION },
        },
        id: reqId,
      }, { headers: CORS_HEADERS })
    }

    if (method === 'notifications/initialized' || method === 'notifications/cancelled') {
      return new Response(null, { status: 202, headers: CORS_HEADERS })
    }

    if (method === 'tools/list') {
      const tools = authCtx.role === 'admin' ? ALL_TOOLS : [...standardTools, ...websiteTools]
      return Response.json({ jsonrpc: '2.0', result: { tools }, id: reqId }, { headers: CORS_HEADERS })
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

      const isAdminTool = adminTools.some((t) => t.name === toolName)
      if (isAdminTool) {
        requireAdminAccess(authCtx)
        const result = await handleAdminMcpToolCall(toolName, toolArgs, authCtx)
        return Response.json({ jsonrpc: '2.0', result, id: reqId }, { headers: CORS_HEADERS })
      }

      const isWebsiteTool = websiteTools.some((t) => t.name === toolName)
      if (isWebsiteTool) {
        const result = await handleWebsiteMcpToolCall(toolName, toolArgs, authCtx)
        return Response.json({ jsonrpc: '2.0', result, id: reqId }, { headers: CORS_HEADERS })
      }

      const result = await handleMcpToolCall(toolName, toolArgs, authCtx)
      return Response.json({ jsonrpc: '2.0', result, id: reqId }, { headers: CORS_HEADERS })
    }

    return jsonRpcError(reqId, -32601, `Method not found: ${method}`, 404)
  } catch (error) {
    const isAuthError = error instanceof Error && (
      error.message.includes('Unauthorized')
      || error.message.includes('Missing Authorization')
      || error.message.includes('Invalid or expired')
      || error.message.includes('User account not found')
    )
    const isForbidden = error instanceof Error && error.message.includes('Forbidden')
    const code = isAuthError ? -32001 : isForbidden ? -32002 : -32603
    const message = isAuthError ? 'Authentication failed' : isForbidden ? 'Access denied' : 'Internal server error'
    return jsonRpcError(reqId, code, message, isAuthError ? 401 : isForbidden ? 403 : 500)
  }
}

export async function GET() {
  return Response.json(
    { error: 'Use POST with JSON-RPC body. See MCP specification at https://spec.modelcontextprotocol.io' },
    { status: 400, headers: CORS_HEADERS },
  )
}
