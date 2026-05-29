import type { McpAuthContext } from './mcp-auth'
import { prisma } from '@/lib/prisma'
import { maskEmail } from '@/lib/redact-pii'
import { toolError, toolSuccess, clampInt, buildDateFilter, requireParam, type McpToolResult } from './mcp-helpers'

export const standardTools = [
  {
    name: 'list_accounts',
    description: 'List all trading accounts for the authenticated user',
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_account_details',
    description: 'Get detailed information about a specific trading account',
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        accountId: { type: 'string', description: 'The account ID' },
      },
      required: ['accountId'],
    },
  },
  {
    name: 'list_trades',
    description: 'List trades with optional date range and pagination',
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        startDate: { type: 'string', description: 'Start date (ISO 8601)' },
        endDate: { type: 'string', description: 'End date (ISO 8601)' },
        limit: { type: 'number', description: 'Max trades to return (default 50, max 200)' },
        offset: { type: 'number', description: 'Pagination offset' },
      },
    },
  },
  {
    name: 'get_performance_summary',
    description: 'Get overall performance metrics (PnL, win rate, etc.)',
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        startDate: { type: 'string', description: 'Start date (ISO 8601)' },
        endDate: { type: 'string', description: 'End date (ISO 8601)' },
      },
    },
  },
  {
    name: 'get_user_profile',
    description: 'Get the authenticated user profile information',
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'list_tags',
    description: 'List all trade tags for the user',
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {},
    },
  },
]

export async function handleMcpToolCall(toolName: string, args: Record<string, unknown>, ctx: McpAuthContext): Promise<McpToolResult> {
  switch (toolName) {
    case 'list_accounts':
      return await listAccounts(ctx)
    case 'get_account_details':
      return await getAccountDetails(ctx, requireParam(args, 'accountId'))
    case 'list_trades':
      return await listTrades(ctx, args)
    case 'get_performance_summary':
      return await getPerformanceSummary(ctx, args)
    case 'get_user_profile':
      return await getUserProfile(ctx)
    case 'list_tags':
      return await listTags(ctx)
    default:
      throw new Error(`Unknown tool: ${toolName}`)
  }
}

async function listAccounts(ctx: McpAuthContext) {
  const accounts = await prisma.account.findMany({
    where: { authUserId: ctx.userId },
    select: { id: true, number: true, name: true, broker: true, startingBalance: true, createdAt: true },
  })
  return toolSuccess(accounts)
}

async function getAccountDetails(ctx: McpAuthContext, accountId: string) {
  const account = await prisma.account.findFirst({
    where: { id: accountId, authUserId: ctx.userId },
    include: { trades: { take: 10, orderBy: { entryDate: 'desc' } } },
  })
  if (!account) return toolError('Account not found')
  return toolSuccess(account)
}

async function listTrades(ctx: McpAuthContext, args: Record<string, unknown>) {
  const limit = clampInt(args.limit, 1, 200, 50)
  const offset = clampInt(args.offset, 0, 1_000_000, 0)
  const where: Record<string, unknown> = { authUserId: ctx.userId }
  const dateFilter = buildDateFilter(args)
  if (dateFilter) where.entryDate = dateFilter
  const trades = await prisma.trade.findMany({
    where: where as Parameters<typeof prisma.trade.findMany>[0]['where'],
    orderBy: { entryDate: 'desc' },
    take: limit,
    skip: offset,
  })
  return toolSuccess(trades)
}

async function getPerformanceSummary(ctx: McpAuthContext, args: Record<string, unknown>) {
  const where: Record<string, unknown> = { authUserId: ctx.userId }
  const dateFilter = buildDateFilter(args)
  if (dateFilter) where.entryDate = dateFilter

  const [totals, winCount, lossCount, winSum, lossSum] = await Promise.all([
    prisma.trade.aggregate({
      where: where as Parameters<typeof prisma.trade.aggregate>[0]['where'],
      _sum: { pnl: true, commission: true },
      _count: { id: true },
    }),
    prisma.trade.count({
      where: { ...where, pnl: { gt: 0 } } as Parameters<typeof prisma.trade.count>[0]['where'],
    }),
    prisma.trade.count({
      where: { ...where, pnl: { lt: 0 } } as Parameters<typeof prisma.trade.count>[0]['where'],
    }),
    prisma.trade.aggregate({
      where: { ...where, pnl: { gt: 0 } } as Parameters<typeof prisma.trade.aggregate>[0]['where'],
      _sum: { pnl: true },
    }),
    prisma.trade.aggregate({
      where: { ...where, pnl: { lt: 0 } } as Parameters<typeof prisma.trade.aggregate>[0]['where'],
      _sum: { pnl: true },
    }),
  ])

  const totalTrades = totals._count.id
  const grossPnL = Number(totals._sum.pnl ?? 0)
  const totalCommission = Number(totals._sum.commission ?? 0)
  const netPnL = grossPnL - totalCommission
  const totalWinAmount = Number(winSum._sum.pnl ?? 0)
  const totalLossAmount = Number(lossSum._sum.pnl ?? 0)

  const summary = {
    totalTrades,
    grossPnL: grossPnL.toFixed(2),
    netPnL: netPnL.toFixed(2),
    winRate: totalTrades > 0 ? ((winCount / totalTrades) * 100).toFixed(1) : '0.0',
    totalWins: winCount,
    totalLosses: lossCount,
    avgWin: winCount > 0 ? (totalWinAmount / winCount).toFixed(2) : '0.00',
    avgLoss: lossCount > 0 ? (totalLossAmount / lossCount).toFixed(2) : '0.00',
    profitFactor: totalLossAmount !== 0
      ? (Math.abs(totalWinAmount / totalLossAmount)).toFixed(2)
      : 'N/A',
  }
  return toolSuccess(summary)
}

async function getUserProfile(ctx: McpAuthContext) {
  const user = await prisma.user.findUnique({
    where: { authUserId: ctx.userId },
    select: { id: true, username: true, email: true, language: true, createdAt: true },
  })
  if (!user) return toolError('User not found')
  return toolSuccess({
    ...user,
    email: maskEmail(user.email),
  })
}

async function listTags(ctx: McpAuthContext) {
  const tags = await prisma.tag.findMany({ where: { userId: ctx.userId } })
  return toolSuccess(tags)
}
