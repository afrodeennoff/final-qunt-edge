// server/mcp/security.ts
import type { McpAuthContext } from '../mcp-auth'

/**
 * SECURITY GUARDS — every MCP handler and tool MUST use these.
 * Zero tolerance for cross-user data access.
 */

export function requireUserId(ctx: McpAuthContext): string {
  if (!ctx?.userId) {
    throw new Error('Authentication required — provide a valid API key')
  }
  return ctx.userId
}

export function requireAdmin(ctx: McpAuthContext): void {
  const userId = requireUserId(ctx)
  if (ctx.role !== 'admin') {
    throw new Error('Admin access required. Use an admin API key (qunt_adm_...)')
  }
}

/**
 * Extra belt-and-suspenders check.
 * Use when a tool receives a userId or accountId from the caller.
 */
export function assertNoCrossUserAccess(requestedUserId: string | undefined, ctxUserId: string) {
  if (requestedUserId && requestedUserId !== ctxUserId) {
    throw new Error('Cross-user access denied. You may only access your own data.')
  }
}
