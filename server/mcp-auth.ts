import { validateApiKey } from './mcp-key-service'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'
import { MCP_KEY_PREFIX_USER, MCP_KEY_PREFIX_ADMIN } from '@/lib/mcp-constants'

const VALID_ROLES = new Set(['user', 'admin'])

export interface McpAuthContext {
  userId: string       // Internal database User.id (CUID)
  authUserId: string   // Supabase auth user ID (UUID)
  role: 'user' | 'admin'
  authMethod: 'apikey' | 'oauth'
}

function isApiKeyToken(token: string): boolean {
  return token.startsWith(MCP_KEY_PREFIX_USER) || token.startsWith(MCP_KEY_PREFIX_ADMIN)
}

async function resolveDatabaseUserId(authUserId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { auth_user_id: authUserId },
    select: { id: true },
  })
  return user?.id ?? null
}

async function authenticateWithApiKey(token: string): Promise<McpAuthContext> {
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

  return { userId: dbUserId, authUserId: result.userId, role: result.role as 'user' | 'admin', authMethod: 'apikey' }
}

async function authenticateWithOAuth(token: string): Promise<McpAuthContext> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('OAuth authentication is not configured')
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user?.id) {
    throw new Error('Invalid or expired OAuth token')
  }

  const dbUserId = await resolveDatabaseUserId(user.id)
  if (!dbUserId) {
    throw new Error('User account not found')
  }

  const role = user.app_metadata?.role === 'admin' ? 'admin' as const : 'user' as const

  return { userId: dbUserId, authUserId: user.id, role, authMethod: 'oauth' }
}

export async function authenticateMcpRequest(authHeader: string | null): Promise<McpAuthContext> {
  if (!authHeader) {
    throw new Error('Missing Authorization header')
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader

  if (isApiKeyToken(token)) {
    return authenticateWithApiKey(token)
  }

  return authenticateWithOAuth(token)
}

export function requireAdminAccess(ctx: McpAuthContext): void {
  if (ctx.role !== 'admin') {
    throw new Error('Forbidden: Admin access required')
  }
}
