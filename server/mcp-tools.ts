import type { McpAuthContext } from './mcp-auth'
import { prisma } from '@/lib/prisma'

function parseOptionalDate(value: unknown): Date | undefined {
  if (typeof value !== 'string') return undefined
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? undefined : d
}

function buildDateFilter(args: Record<string, unknown>): Record<string, unknown> | undefined {
  const startDate = parseOptionalDate(args.startDate)
  const endDate = parseOptionalDate(args.endDate)
  if (!startDate && !endDate) return undefined
  const filter: Record<string, unknown> = {}
  if (startDate) filter.gte = startDate
  if (endDate) filter.lte = endDate
  return filter
}

export const standardTools = [
  {
    name: 'list_accounts',
    description: 'List all trading accounts for the authenticated user',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_account_details',
    description: 'Get detailed information about a specific trading account',
    inputSchema: {
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
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'list_tags',
    description: 'List all trade tags for the user',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
]

export async function handleMcpToolCall(toolName: string, args: Record<string, unknown>, ctx: McpAuthContext) {
  switch (toolName) {
    case 'list_accounts':
      return await listAccounts(ctx)
    case 'get_account_details':
      return await getAccountDetails(ctx, args.accountId as string)
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
  return { content: [{ type: 'text' as const, text: JSON.stringify(accounts, null, 2) }] }
}

async function getAccountDetails(ctx: McpAuthContext, accountId: string) {
  const account = await prisma.account.findFirst({
    where: { id: accountId, authUserId: ctx.userId },
    include: { trades: { take: 10, orderBy: { entryDate: 'desc' } } },
  })
  if (!account) throw new Error('Account not found')
  return { content: [{ type: 'text' as const, text: JSON.stringify(account, null, 2) }] }
}

async function listTrades(ctx: McpAuthContext, args: Record<string, unknown>) {
  const limit = Math.min(Number(args.limit) || 50, 200)
  const offset = Number(args.offset) || 0
  const where: Record<string, unknown> = { authUserId: ctx.userId }
  const dateFilter = buildDateFilter(args)
  if (dateFilter) where.entryDate = dateFilter
  const trades = await prisma.trade.findMany({
    where: where as any,
    orderBy: { entryDate: 'desc' },
    take: limit,
    skip: offset,
  })
  return { content: [{ type: 'text' as const, text: JSON.stringify(trades, null, 2) }] }
}

async function getPerformanceSummary(ctx: McpAuthContext, args: Record<string, unknown>) {
  const where: Record<string, unknown> = { authUserId: ctx.userId }
  const dateFilter = buildDateFilter(args)
  if (dateFilter) where.entryDate = dateFilter
  const trades = await prisma.trade.findMany({ where: where as any, select: { pnl: true, commission: true } })
  const pnlValues = trades.map((t) => Number(t.pnl || 0))
  const netValues = trades.map((t) => Number(t.pnl || 0) - Number(t.commission || 0))
  const wins = pnlValues.filter((v) => v > 0)
  const losses = pnlValues.filter((v) => v < 0)
  const summary = {
    totalTrades: trades.length,
    grossPnL: pnlValues.reduce((a, v) => a + v, 0).toFixed(2),
    netPnL: netValues.reduce((a, v) => a + v, 0).toFixed(2),
    winRate: trades.length > 0 ? ((wins.length / trades.length) * 100).toFixed(1) : '0.0',
    totalWins: wins.length,
    totalLosses: losses.length,
    avgWin: wins.length > 0 ? (wins.reduce((a, v) => a + v, 0) / wins.length).toFixed(2) : '0.00',
    avgLoss: losses.length > 0 ? (losses.reduce((a, v) => a + v, 0) / losses.length).toFixed(2) : '0.00',
    profitFactor: losses.length > 0 && losses.reduce((a, v) => a + v, 0) !== 0
      ? (Math.abs(wins.reduce((a, v) => a + v, 0) / losses.reduce((a, v) => a + v, 0))).toFixed(2)
      : 'N/A',
  }
  return { content: [{ type: 'text' as const, text: JSON.stringify(summary, null, 2) }] }
}

async function getUserProfile(ctx: McpAuthContext) {
  const user = await prisma.user.findUnique({
    where: { authUserId: ctx.userId },
    select: { id: true, username: true, email: true, language: true, createdAt: true },
  })
  return { content: [{ type: 'text' as const, text: JSON.stringify(user, null, 2) }] }
}

async function listTags(ctx: McpAuthContext) {
  const tags = await prisma.tag.findMany({ where: { userId: ctx.userId } })
  return { content: [{ type: 'text' as const, text: JSON.stringify(tags, null, 2) }] }
}
