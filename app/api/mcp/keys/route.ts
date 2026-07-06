import { NextRequest } from 'next/server'
import { CORS_HEADERS } from '@/server/mcp-route-utils'
import { getMcpKeyRouteAuthUserId } from '@/server/mcp-key-route-auth'
import { generateApiKeyForAuthUser, listApiKeysForAuthUser } from '@/server/mcp-key-service'

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, {
    ...init,
    headers: { ...CORS_HEADERS, ...(init?.headers ?? {}) },
  })
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function GET(request: NextRequest) {
  const authUserId = await getMcpKeyRouteAuthUserId(request)
  if (!authUserId) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const result = await listApiKeysForAuthUser(authUserId)
  return json(result, { status: result.success ? 200 : 500 })
}

export async function POST(request: NextRequest) {
  const authUserId = await getMcpKeyRouteAuthUserId(request)
  if (!authUserId) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: { name?: unknown } = {}
  try {
    body = await request.json()
  } catch {
    return json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const name = typeof body.name === 'string' ? body.name : ''
  const result = await generateApiKeyForAuthUser(authUserId, name, 'user')
  return json(result, { status: result.success ? 201 : 400 })
}
