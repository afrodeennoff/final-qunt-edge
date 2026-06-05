import type { NextRequest } from 'next/server'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { validateApiKey } from './mcp-key-service'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'
import { MCP_KEY_PREFIX_USER, MCP_KEY_PREFIX_ADMIN } from '@/lib/mcp-constants'
import { ensureUserInDatabase } from './auth-user'
import { logger } from '@/lib/logger'

const VALID_ROLES = new Set(['user', 'admin'])

export interface McpAuthContext {
  userId: string       // Internal database User.id (CUID)
  authUserId: string   // Supabase auth user ID (UUID)
  role: 'user' | 'admin'
  authMethod: 'apikey' | 'oauth'
  apiKeyId?: string    // present when authMethod === 'apikey'
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

async function resolveOrProvisionDatabaseUserId(supabaseUser: SupabaseUser): Promise<string | null> {
  const existing = await resolveDatabaseUserId(supabaseUser.id)
  if (existing) return existing

  try {
    await ensureUserInDatabase(supabaseUser, undefined, { skipDefaultLayout: true })
  } catch (error) {
    logger.error('[MCP OAuth] Failed to provision database user', {
      authUserId: supabaseUser.id,
      error: error instanceof Error ? error.message : String(error),
    })
    return null
  }

  return resolveDatabaseUserId(supabaseUser.id)
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

  return { userId: dbUserId, authUserId: result.userId, role: result.role as 'user' | 'admin', authMethod: 'apikey', apiKeyId: result.apiKeyId }
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

  const dbUserId = await resolveOrProvisionDatabaseUserId(user)
  if (!dbUserId) {
    throw new Error(
      'User account not found. Sign in at qunt-edge.vercel.app and complete account setup, then reconnect MCP OAuth.',
    )
  }

  const role = user.app_metadata?.role === 'admin' ? 'admin' as const : 'user' as const

  return { userId: dbUserId, authUserId: user.id, role, authMethod: 'oauth' }
}

/** Read API key / bearer token from headers (Cursor, OpenCode, Grok, etc.). */
export function extractMcpCredential(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization')?.trim()
  if (authorization) {
    return authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : authorization
  }
  const xApiKey = request.headers.get('x-api-key')?.trim()
  if (xApiKey) return xApiKey
  const xQunt = request.headers.get('x-qunt-api-key')?.trim()
  if (xQunt) return xQunt
  return null
}

export async function authenticateMcpRequest(credential: string | null): Promise<McpAuthContext> {
  if (!credential) {
    throw new Error(
      'Missing Authorization header. Use Authorization: Bearer qunt_usr_... (or X-API-Key / X-Qunt-Api-Key). Create keys at Settings → API Keys.',
    )
  }

  const token = credential

  if (isApiKeyToken(token)) {
    return authenticateWithApiKey(token)
  }

  return authenticateWithOAuth(token)
}

export function getApiKeyPrefix(): string {
  return MCP_KEY_PREFIX_USER
}

export function requireAdminAccess(ctx: McpAuthContext): void {
  if (ctx.role !== 'admin') {
    throw new Error('Forbidden: Admin access required')
  }
}
