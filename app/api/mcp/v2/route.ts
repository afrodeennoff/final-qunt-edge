import { NextRequest } from 'next/server'
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/server'
import { getMcpServer } from '@/server/mcp/servers/factory'
import { registerUserTools } from '@/server/mcp/servers/user'
import { authenticateSdkRequest } from '@/server/mcp/sdk-auth'
import { CORS_HEADERS } from '@/server/mcp-route-utils'

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(request: NextRequest) {
  const ctx = await authenticateSdkRequest(request)
  if (!ctx) {
    return Response.json(
      { jsonrpc: '2.0', error: { code: -32001, message: 'Unauthorized' }, id: null },
      { status: 401, headers: CORS_HEADERS },
    )
  }

  const server = getMcpServer('user')
  await registerUserTools(server, { userId: ctx.userId })

  const transport = new WebStandardStreamableHTTPServerTransport({
    enableJsonResponse: true,
  })
  await server.connect(transport)

  try {
    const response = await transport.handleRequest(request)

    const headers = new Headers(response.headers)
    for (const [key, value] of Object.entries(CORS_HEADERS)) {
      headers.set(key, value)
    }

    return new Response(response.body, {
      status: response.status,
      headers,
    })
  } finally {
    await transport.close()
  }
}
