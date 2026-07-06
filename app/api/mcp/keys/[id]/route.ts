import { NextRequest } from 'next/server'
import { CORS_HEADERS } from '@/server/mcp-route-utils'
import { getMcpKeyRouteAuthUserId } from '@/server/mcp-key-route-auth'
import { revokeApiKeyForAuthUser } from '@/server/mcp-key-service'

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, {
    ...init,
    headers: { ...CORS_HEADERS, ...(init?.headers ?? {}) },
  })
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const authUserId = await getMcpKeyRouteAuthUserId(request)
  if (!authUserId) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const result = await revokeApiKeyForAuthUser(authUserId, id)
  return json(result, { status: result.success ? 200 : 404 })
}
