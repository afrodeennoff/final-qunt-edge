import { validateApiKey } from './mcp-key-service'

export interface McpAuthContext {
  userId: string
  role: 'user' | 'admin'
}

export async function authenticateMcpRequest(authHeader: string | null): Promise<McpAuthContext> {
  if (!authHeader) {
    throw new Error('Missing Authorization header')
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader

  const result = await validateApiKey(token)
  if (!result) {
    throw new Error('Invalid or expired API key')
  }

  return result
}

export function requireAdminAccess(ctx: McpAuthContext): void {
  if (ctx.role !== 'admin') {
    throw new Error('Forbidden: Admin access required')
  }
}
