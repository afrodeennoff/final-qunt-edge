import { NextRequest } from 'next/server'
import { authenticateMcpRequest, requireAdminAccess } from '@/server/mcp-auth'
import { handleMcpToolCall, standardTools } from '@/server/mcp-tools'
import { handleAdminMcpToolCall, adminTools } from '@/server/mcp-admin-tools'
import { handleWebsiteMcpToolCall, websiteTools } from '@/server/mcp-website-tools'
import { MCP_SERVER_NAME, MCP_SERVER_VERSION } from '@/lib/mcp-constants'

const ALL_TOOLS = [...standardTools, ...adminTools, ...websiteTools]

export async function POST(request: NextRequest) {
  let reqId: unknown = null
  try {
    const authCtx = await authenticateMcpRequest(request.headers.get('authorization'))

    const body = await request.json()
    const { method, params } = body as { method?: string; params?: Record<string, unknown> }
    reqId = params?.id ?? null

    if (!method) {
      return Response.json(
        { jsonrpc: '2.0', error: { code: -32600, message: 'Invalid request' }, id: reqId },
        { status: 400 },
      )
    }

    if (method === 'initialize') {
      return Response.json({
        jsonrpc: '2.0',
        result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: MCP_SERVER_NAME, version: MCP_SERVER_VERSION },
        },
        id: reqId,
      })
    }

    if (method === 'tools/list') {
      return Response.json({
        jsonrpc: '2.0',
        result: { tools: authCtx.role === 'admin' ? ALL_TOOLS : [...standardTools, ...websiteTools] },
        id: reqId,
      })
    }

    if (method === 'tools/call') {
      const toolName = params?.name
      const toolArgs = (params?.arguments ?? {}) as Record<string, unknown>

      if (!toolName) {
        return Response.json(
          { jsonrpc: '2.0', error: { code: -32602, message: 'Invalid params: tool name required' }, id: reqId },
          { status: 400 },
        )
      }

      const isAdminTool = adminTools.some((t) => t.name === toolName)
      if (isAdminTool) {
        requireAdminAccess(authCtx)
        const result = await handleAdminMcpToolCall(toolName, toolArgs, authCtx)
        return Response.json({ jsonrpc: '2.0', result, id: reqId })
      }

      const isWebsiteTool = websiteTools.some((t) => t.name === toolName)
      if (isWebsiteTool) {
        const result = await handleWebsiteMcpToolCall(toolName, toolArgs, authCtx)
        return Response.json({ jsonrpc: '2.0', result, id: reqId })
      }

      const result = await handleMcpToolCall(toolName, toolArgs, authCtx)
      return Response.json({ jsonrpc: '2.0', result, id: reqId })
    }

    return Response.json(
      { jsonrpc: '2.0', error: { code: -32601, message: `Method not found: ${method}` }, id: reqId },
      { status: 404 },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message.includes('Unauthorized') || message.includes('Missing') ? 401
      : message.includes('Forbidden') ? 403
        : message.includes('not found') ? 404
          : 500
    return Response.json(
      { jsonrpc: '2.0', error: { code: -32000, message }, id: reqId },
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
