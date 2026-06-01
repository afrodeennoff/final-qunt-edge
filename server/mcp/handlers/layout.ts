/**
 * SECURITY: All queries and mutations in this file MUST be scoped by ctx.userId.
 * Never accept userId from args. Use requireUserId(ctx) and assertNoCrossUserAccess from '../security'.
 * Admin tools must additionally call requireAdmin(ctx).
 */

import type { McpAuthContext } from '../../mcp-auth'
import { requireUserId, assertNoCrossUserAccess } from '../security'
import { getDashboardLayoutForUser, saveDashboardLayoutForUser } from '@/server/layouts'

export async function getDashboardLayoutHandler(ctx: McpAuthContext, args: Record<string, unknown>) {
  const userId = requireUserId(ctx)
  const requestedUserId = typeof args.userId === 'string' ? args.userId : undefined
  assertNoCrossUserAccess(requestedUserId, userId)
  const result = await getDashboardLayoutForUser(userId)
  return result || { desktop: [], mobile: [] }
}

export async function saveDashboardLayoutHandler(ctx: McpAuthContext, args: Record<string, unknown>) {
  const userId = requireUserId(ctx)
  const requestedUserId = typeof args.userId === 'string' ? args.userId : undefined
  assertNoCrossUserAccess(requestedUserId, userId)
  const layouts = args.layouts as { desktop: unknown; mobile: unknown } | undefined
  if (!layouts) throw new Error('layouts (with desktop + mobile) is required')
  return saveDashboardLayoutForUser(userId, layouts)
}
