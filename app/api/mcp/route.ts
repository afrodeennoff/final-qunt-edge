import { NextRequest } from 'next/server'
import { authenticateMcpRequest, requireAdminAccess } from '@/server/mcp-auth'
import { handleMcpToolCall, standardTools } from '@/server/mcp-tools'
import { handleAdminMcpToolCall, adminTools } from '@/server/mcp-admin-tools'

const ALL_TOOLS = [...standardTools, ...adminTools]

export async function POST(request: NextRequest) {
  try {
    const authCtx = await authenticateMcpRequest(request.headers.get('authorization'))

    const body = await request.json()
    const { method, params } = body as { method: string; params: { name: string; arguments?: Record<string, unknown>; id?: unknown } }

    if (!method || !params) {
      return Response.json(
        { jsonrpc: '2.0', error: { code: -32600, message: 'Invalid request' }, id: null },
        { status: 400 },
      )
    }

    if (method === 'initialize') {
      return Response.json({
        jsonrpc: '2.0',
        result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: 'qunt-edge-mcp', version: '1.0.0' },
        },
        id: (params as any).id ?? null,
      })
    }

    if (method === 'tools/list') {
      return Response.json({
        jsonrpc: '2.0',
        result: { tools: authCtx.role === 'admin' ? ALL_TOOLS : standardTools },
        id: (params as any).id ?? null,
      })
    }

    if (method === 'tools/call') {
      const toolName = params.name
      const toolArgs = params.arguments ?? {}

      const isAdminTool = adminTools.some((t) => t.name === toolName)
      if (isAdminTool) {
        requireAdminAccess(authCtx)
        const result = await handleAdminMcpToolCall(toolName, toolArgs, authCtx)
        return Response.json({ jsonrpc: '2.0', result, id: (params as any).id ?? null })
      }

      const result = await handleMcpToolCall(toolName, toolArgs, authCtx)
      return Response.json({ jsonrpc: '2.0', result, id: (params as any).id ?? null })
    }

    return Response.json(
      { jsonrpc: '2.0', error: { code: -32601, message: `Method not found: ${method}` }, id: (params as any).id ?? null },
      { status: 404 },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message.includes('Unauthorized') || message.includes('Missing') ? 401
      : message.includes('Forbidden') ? 403
        : message.includes('not found') ? 404
          : 500
    return Response.json(
      { jsonrpc: '2.0', error: { code: -32000, message }, id: null },
      { status },
    )
  }
}

export async function GET() {
  return Response.json(
    { error: 'Use POST with JSON-RPC body. See MCP specification at https://spec.modelcontextprotocol.io' },
    { status: 400 },
  )
}
