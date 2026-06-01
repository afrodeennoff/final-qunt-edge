import { NextRequest } from 'next/server'
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/server'
import { getMcpServer } from '@/server/mcp/servers/factory'
import { registerUserTools } from '@/server/mcp/servers/user'
import { authenticateSdkRequest } from '@/server/mcp/sdk-auth'
import { CORS_HEADERS } from '@/server/mcp-route-utils'
import { randomUUID } from 'node:crypto'

// Session store: maps session ID to transport for Streamable HTTP continuity.
// In a production deployment this would be backed by Redis or a shared store.
// For a stateless Next.js serverless deployment, sessions are per-process.
const sessions = new Map<string, { transport: WebStandardStreamableHTTPServerTransport; lastAccess: number }>()

// Cleanup stale sessions (older than 5 minutes) on each request
const SESSION_TTL_MS = 5 * 60 * 1000
function cleanupStaleSessions() {
  const now = Date.now()
  for (const [id, entry] of sessions) {
    if (now - entry.lastAccess > SESSION_TTL_MS) {
      entry.transport.close().catch(() => {})
      sessions.delete(id)
    }
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(request: NextRequest) {
  cleanupStaleSessions()

  const ctx = await authenticateSdkRequest(request)
  if (!ctx) {
    return Response.json(
      { jsonrpc: '2.0', error: { code: -32001, message: 'Unauthorized' }, id: null },
      { status: 401, headers: CORS_HEADERS },
    )
  }

  // Reuse existing session if client provides a valid session ID
  const incomingSessionId = request.headers.get('mcp-session-id')
  let transport: WebStandardStreamableHTTPServerTransport
  let sessionId: string

  if (incomingSessionId && sessions.has(incomingSessionId)) {
    const entry = sessions.get(incomingSessionId)!
    transport = entry.transport
    sessionId = incomingSessionId
    entry.lastAccess = Date.now()
  } else {
    // Create new session
    sessionId = randomUUID()
    const server = getMcpServer('user')
    await registerUserTools(server, { userId: ctx.userId })

    transport = new WebStandardStreamableHTTPServerTransport({
      enableJsonResponse: true,
      sessionIdGenerator: () => sessionId,
    })
    await server.connect(transport)
    sessions.set(sessionId, { transport, lastAccess: Date.now() })
  }

  try {
    const response = await transport.handleRequest(request)

    const headers = new Headers(response.headers)
    for (const [key, value] of Object.entries(CORS_HEADERS)) {
      headers.set(key, value)
    }
    // Always include session ID in response for client to track
    if (!headers.has('Mcp-Session-Id')) {
      headers.set('Mcp-Session-Id', sessionId)
    }

    return new Response(response.body, {
      status: response.status,
      headers,
    })
  } catch (err) {
    // If transport fails, clean up the session
    sessions.delete(sessionId)
    await transport.close().catch(() => {})
    return Response.json(
      { jsonrpc: '2.0', error: { code: -32603, message: 'Internal server error' }, id: null },
      { status: 500, headers: CORS_HEADERS },
    )
  }
}

// GET handler for SSE streams (required by Streamable HTTP spec)
export async function GET(request: NextRequest) {
  const sessionId = request.headers.get('mcp-session-id')
  if (!sessionId || !sessions.has(sessionId)) {
    return new Response('Session not found', { status: 404, headers: CORS_HEADERS })
  }

  const entry = sessions.get(sessionId)!
  entry.lastAccess = Date.now()

  try {
    const response = await entry.transport.handleRequest(request)
    const headers = new Headers(response.headers)
    for (const [key, value] of Object.entries(CORS_HEADERS)) {
      headers.set(key, value)
    }
    return new Response(response.body, { status: response.status, headers })
  } catch {
    return new Response('Stream error', { status: 500, headers: CORS_HEADERS })
  }
}

// DELETE handler for session termination (required by Streamable HTTP spec)
export async function DELETE(request: NextRequest) {
  const sessionId = request.headers.get('mcp-session-id')
  if (!sessionId || !sessions.has(sessionId)) {
    return new Response('Session not found', { status: 404, headers: CORS_HEADERS })
  }

  const entry = sessions.get(sessionId)!
  sessions.delete(sessionId)
  await entry.transport.close().catch(() => {})

  return new Response(null, { status: 204, headers: CORS_HEADERS })
}
