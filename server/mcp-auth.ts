import { validateApiKey } from './mcp-key-service'
import { prisma } from '@/lib/prisma'

const VALID_ROLES = new Set(['user', 'admin'])

export interface McpAuthContext {
  userId: string       // Internal database User.id (CUID)
  authUserId: string   // Supabase auth user ID (UUID)
  role: 'user' | 'admin'
}

async function resolveDatabaseUserId(authUserId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { auth_user_id: authUserId },
    select: { id: true },
  })
  return user?.id ?? null
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
  if (!VALID_ROLES.has(result.role)) {
    throw new Error('Invalid API key role')
  }

  const dbUserId = await resolveDatabaseUserId(result.userId)
  if (!dbUserId) {
    throw new Error('User account not found')
  }

  return { userId: dbUserId, authUserId: result.userId, role: result.role as 'user' | 'admin' }
}

export function requireAdminAccess(ctx: McpAuthContext): void {
  if (ctx.role !== 'admin') {
    throw new Error('Forbidden: Admin access required')
  }
}
