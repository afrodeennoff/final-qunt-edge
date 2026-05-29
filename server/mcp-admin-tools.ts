import type { McpAuthContext } from './mcp-auth'
import { prisma } from '@/lib/prisma'
import { maskEmail } from '@/lib/redact-pii'
import { toolError, toolSuccess, requireParam, type McpToolResult, type ToolDefinition } from './mcp-helpers'

export const adminTools: ToolDefinition[] = [
  {
    name: 'admin_list_users',
    description: `List all platform users with basic info (admin only).

Args: none

Returns: Array of user objects with id, username, email (masked), language, isBeta, createdAt, showOnLeaderboard`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {},
    },
    outputSchema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          username: { type: 'string' },
          email: { type: 'string' },
          language: { type: 'string' },
          isBeta: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'admin_get_user',
    description: `Get detailed information for a specific user by ID, including their accounts and subscription.

Args:
  - userId (string, required): The user ID to look up

Returns: User object with accounts and subscription data`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: { userId: { type: 'string', description: 'The user ID to look up' } },
      required: ['userId'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        username: { type: 'string' },
        email: { type: 'string' },
        language: { type: 'string' },
        accounts: { type: 'array', items: { type: 'object' } },
        subscription: { type: 'object' },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'admin_list_subscriptions',
    description: `List all subscriptions with user info (admin only).

Args: none

Returns: Array of subscription objects with user email/username`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {},
    },
    outputSchema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          plan: { type: 'string' },
          status: { type: 'string' },
          user: { type: 'object', properties: { email: { type: 'string' }, username: { type: 'string' } } },
        },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'admin_get_analytics',
    description: `Get platform-wide analytics including user, account, trade, and subscription counts.

Args: none

Returns: Object with totalUsers, totalAccounts, totalTrades, activeSubscriptions`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {},
    },
    outputSchema: {
      type: 'object',
      properties: {
        totalUsers: { type: 'number' },
        totalAccounts: { type: 'number' },
        totalTrades: { type: 'number' },
        activeSubscriptions: { type: 'number' },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
]

export async function handleAdminMcpToolCall(toolName: string, args: Record<string, unknown>, ctx: McpAuthContext): Promise<McpToolResult> {
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
      return toolError(`Unknown admin tool: ${toolName}`)
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
