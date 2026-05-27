import type { McpAuthContext } from './mcp-auth'
import { requireAdminAccess } from './mcp-auth'
import { prisma } from '@/lib/prisma'

export const adminTools = [
  {
    name: 'admin_list_users',
    description: 'List all users (admin only)',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'admin_get_user',
    description: 'Get details for a specific user by ID (admin only)',
    inputSchema: {
      type: 'object',
      properties: { userId: { type: 'string', description: 'The user ID' } },
      required: ['userId'],
    },
  },
  {
    name: 'admin_list_subscriptions',
    description: 'List all subscriptions (admin only)',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'admin_get_analytics',
    description: 'Get platform-wide analytics (admin only)',
    inputSchema: { type: 'object', properties: {} },
  },
]

export async function handleAdminMcpToolCall(toolName: string, args: Record<string, unknown>, ctx: McpAuthContext) {
  requireAdminAccess(ctx)

  switch (toolName) {
    case 'admin_list_users':
      return await adminListUsers()
    case 'admin_get_user':
      return await adminGetUser(args.userId as string)
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
  return { content: [{ type: 'text' as const, text: JSON.stringify(users, null, 2) }] }
}

async function adminGetUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { accounts: true, subscription: true },
  })
  if (!user) throw new Error('User not found')
  return { content: [{ type: 'text' as const, text: JSON.stringify(user, null, 2) }] }
}

async function adminListSubscriptions() {
  const subs = await prisma.subscription.findMany({
    include: { user: { select: { email: true, username: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return { content: [{ type: 'text' as const, text: JSON.stringify(subs, null, 2) }] }
}

async function adminGetAnalytics() {
  const totalUsers = await prisma.user.count()
  const totalAccounts = await prisma.account.count()
  const totalTrades = await prisma.trade.count()
  const activeSubscriptions = await prisma.subscription.count({ where: { status: 'ACTIVE' } })
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({ totalUsers, totalAccounts, totalTrades, activeSubscriptions }, null, 2),
    }],
  }
}
