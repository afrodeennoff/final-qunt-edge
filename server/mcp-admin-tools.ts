import type { McpAuthContext } from './mcp-auth'
import { requireAdminAccess } from './mcp-auth'
import { prisma } from '@/lib/prisma'
import { maskEmail } from '@/lib/redact-pii'
import { toolError, toolSuccess, requireParam, type McpToolResult } from './mcp-helpers'

export const adminTools = [
  {
    name: 'admin_list_users',
    description: 'List all users (admin only)',
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'admin_get_user',
    description: 'Get details for a specific user by ID (admin only)',
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: { userId: { type: 'string', description: 'The user ID' } },
      required: ['userId'],
    },
  },
  {
    name: 'admin_list_subscriptions',
    description: 'List all subscriptions (admin only)',
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'admin_get_analytics',
    description: 'Get platform-wide analytics (admin only)',
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {},
    },
  },
]

export async function handleAdminMcpToolCall(toolName: string, args: Record<string, unknown>, ctx: McpAuthContext): Promise<McpToolResult> {
  requireAdminAccess(ctx)

  switch (toolName) {
    case 'admin_list_users':
      return await adminListUsers()
    case 'admin_get_user':
      return await adminGetUser(requireParam(args, 'userId'))
    case 'admin_list_subscriptions':
      return await adminListSubscriptions()
    case 'admin_get_analytics':
      return await adminGetAnalytics()
    default:
      throw new Error(`Unknown admin tool: ${toolName}`)
  }
}

async function adminListUsers() {
  const users = await prisma.user.findMany({
    select: { id: true, username: true, email: true, language: true, isBeta: true, createdAt: true, showOnLeaderboard: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return toolSuccess(users.map((u) => ({ ...u, email: maskEmail(u.email) })))
}

async function adminGetUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      accounts: {
        select: { id: true, number: true, propfirm: true, accountSize: true, createdAt: true },
      },
      subscription: {
        select: { id: true, plan: true, status: true, endDate: true },
      },
    },
  })
  if (!user) return toolError('User not found')
  return toolSuccess({ ...user, email: maskEmail(user.email) })
}

async function adminListSubscriptions() {
  const subs = await prisma.subscription.findMany({
    include: { user: { select: { email: true, username: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return toolSuccess(subs.map((s) => ({
    ...s,
    user: s.user ? { ...s.user, email: maskEmail(s.user.email) } : s.user,
  })))
}

async function adminGetAnalytics() {
  const [totalUsers, totalAccounts, totalTrades, activeSubscriptions] = await Promise.all([
    prisma.user.count(),
    prisma.account.count(),
    prisma.trade.count(),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
  ])
  return toolSuccess({ totalUsers, totalAccounts, totalTrades, activeSubscriptions })
}
