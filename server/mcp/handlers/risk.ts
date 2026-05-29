import { prisma } from '@/lib/prisma'
import type { AccountHealthContext } from './account'

export async function getPropComplianceHandler(ctx: AccountHealthContext, args: Record<string, unknown>) {
  const accountId = typeof args.accountId === 'string' && args.accountId ? args.accountId : null
  if (!accountId) throw new Error('Missing required parameter: accountId')
  const account = await prisma.account.findFirst({ where: { id: accountId, userId: ctx.userId } })
  if (!account) throw new Error('Account not found')
  return { accountId, status: 'compliant', rules: [] }
}

// Stubs for run_monte_carlo, suggest_position_size, get_behavioral_patterns, get_challenge_progress
// Full extraction from mcp-tools.ts following the getAccountHealthHandler pattern
