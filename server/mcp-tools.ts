import type { McpAuthContext } from './mcp-auth'
import { prisma } from '@/lib/prisma'
import { maskEmail } from '@/lib/redact-pii'
import { toolError, toolSuccess, clampInt, buildDateFilter, requireParam, type McpToolResult, type ToolDefinition } from './mcp-helpers'

function computeDrawdown(account: { startingBalance: number; drawdownThreshold: number; buffer: number }, currentBalance: number): {
  drawdownUsed: number
  drawdownUsedPct: string
  bufferRemaining: number
  atRisk: boolean
} {
  const maxLossAllowed = Number(account.drawdownThreshold) || 0
  const buffer = Number(account.buffer) || 0
  const balanceUsed = Number(account.startingBalance) - currentBalance
  const adjustedDrawdown = maxLossAllowed + buffer
  const drawdownUsed = Math.max(0, balanceUsed)
  const drawdownUsedPct = adjustedDrawdown > 0 ? ((drawdownUsed / adjustedDrawdown) * 100) : 0
  return {
    drawdownUsed,
    drawdownUsedPct: drawdownUsedPct.toFixed(1),
    bufferRemaining: Math.max(0, adjustedDrawdown - drawdownUsed),
    atRisk: drawdownUsedPct > 80,
  }
}

async function getAccountHealth(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const accountFilter = typeof args.accountId === 'string' && args.accountId
    ? { id: args.accountId }
    : undefined

  const accounts = await prisma.account.findMany({
    where: { userId: ctx.userId, ...(accountFilter || {}) },
  })

  if (!accounts.length) {
    return toolError(accountFilter ? 'Account not found' : 'No accounts found')
  }

  const now = new Date()
  const results = await Promise.all(accounts.map(async (acc) => {
    const trades = await prisma.trade.findMany({
      where: { accountNumber: acc.number, userId: ctx.userId },
      select: { pnl: true, entryDate: true, closeDate: true },
    })

    const totalPnL = trades.reduce((sum, t) => sum + Number(t.pnl), 0)
    const currentBalance = Number(acc.startingBalance) + totalPnL

    const ddInfo = computeDrawdown(
      { startingBalance: Number(acc.startingBalance), drawdownThreshold: Number(acc.drawdownThreshold), buffer: Number(acc.buffer) },
      currentBalance,
    )

    const uniqueTradeDays = new Set(
      trades.map((t) => t.entryDate.toISOString().slice(0, 10)),
    ).size

    const profitTarget = Number(acc.profitTarget)
    const pnlSinceStart = totalPnL
    const profitTargetPct = profitTarget > 0 ? ((pnlSinceStart / profitTarget) * 100) : 0

    const trailingActive = acc.trailingDrawdown &&
      Number(acc.trailingStopProfit || 0) > 0 &&
      pnlSinceStart >= Number(acc.trailingStopProfit)

    const minDays = acc.minTradingDaysForPayout || 0
    const payoutEligible = !acc.evaluation ||
      (profitTargetPct >= 100 && uniqueTradeDays >= minDays)

    return {
      id: acc.id,
      number: acc.number,
      propfirm: acc.propfirm,
      accountSize: acc.accountSize || '',
      startingBalance: Number(acc.startingBalance),
      currentBalance,
      pnl: totalPnL,
      drawdownUsed: ddInfo.drawdownUsed,
      drawdownUsedPct: ddInfo.drawdownUsedPct,
      bufferRemaining: ddInfo.bufferRemaining,
      atRisk: ddInfo.atRisk,
      profitTargetPct: profitTargetPct.toFixed(1),
      trailingActive,
      daysTraded: uniqueTradeDays,
      isEvaluation: acc.evaluation,
      payoutEligible,
    }
  }))

  return toolSuccess(results)
}

export const standardTools: ToolDefinition[] = [
  {
    name: 'get_account_health',
    description: `Get a complete health snapshot for all trading accounts. Returns current balance, drawdown used %, buffer remaining, trailing stop status, profit target progress, payout eligibility, and days traded.

Args:
  - accountId (string, optional): Filter to a specific account by ID

Returns: Array of account health objects with balance, drawdown, buffer, trailing, profit target, payout, days traded`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        accountId: { type: 'string', description: 'Optional account ID to get health for a specific account' },
      },
    },
    outputSchema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          number: { type: 'string' },
          propfirm: { type: 'string' },
          accountSize: { type: 'string' },
          startingBalance: { type: 'number' },
          currentBalance: { type: 'number' },
          pnl: { type: 'number' },
          drawdownUsed: { type: 'number' },
          drawdownUsedPct: { type: 'string' },
          bufferRemaining: { type: 'number' },
          atRisk: { type: 'boolean' },
          profitTargetPct: { type: 'string' },
          trailingActive: { type: 'boolean' },
          daysTraded: { type: 'number' },
          isEvaluation: { type: 'boolean' },
          payoutEligible: { type: 'boolean' },
        },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'list_accounts',
    description: `List all trading accounts for the authenticated user.

Returns account number, prop firm name, account size, starting balance, and creation date.

Args: none

Returns: Array of account objects with id, number, propfirm, accountSize, startingBalance, createdAt`,
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
          number: { type: 'string' },
          propfirm: { type: 'string' },
          accountSize: { type: 'number' },
          startingBalance: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'get_account_details',
    description: `Get detailed information about a specific trading account, including its recent trades.

Args:
  - accountId (string, required): The account ID

Returns: Account object with trades array (last 10 trades)`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        accountId: { type: 'string', description: 'The account ID' },
      },
      required: ['accountId'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        number: { type: 'string' },
        propfirm: { type: 'string' },
        accountSize: { type: 'number' },
        startingBalance: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
        trades: { type: 'array', items: { type: 'object' } },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'list_trades',
    description: `List trades for the authenticated user with optional date range filtering and pagination.

Args:
  - startDate (string, optional): Start date (ISO 8601, e.g. "2024-01-01")
  - endDate (string, optional): End date (ISO 8601)
  - limit (number, optional): Max trades to return (default 50, max 200)
  - offset (number, optional): Pagination offset (default 0)

Returns: Array of trade objects sorted by entryDate descending`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        startDate: { type: 'string', description: 'Start date (ISO 8601, e.g. "2024-01-01")' },
        endDate: { type: 'string', description: 'End date (ISO 8601)' },
        limit: { type: 'number', description: 'Max trades to return (default 50, max 200)' },
        offset: { type: 'number', description: 'Pagination offset (default 0)' },
      },
    },
    outputSchema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          accountId: { type: 'string' },
          instrument: { type: 'string' },
          direction: { type: 'string', enum: ['LONG', 'SHORT'] },
          entryDate: { type: 'string', format: 'date-time' },
          exitDate: { type: 'string', format: 'date-time' },
          pnl: { type: 'number' },
          commission: { type: 'number' },
        },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'get_performance_summary',
    description: `Get overall trading performance metrics including PnL, win rate, profit factor, and averages.

Args:
  - startDate (string, optional): Start date (ISO 8601)
  - endDate (string, optional): End date (ISO 8601)

Returns: Object with totalTrades, grossPnL, netPnL, winRate, totalWins, totalLosses, avgWin, avgLoss, profitFactor`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        startDate: { type: 'string', description: 'Start date (ISO 8601)' },
        endDate: { type: 'string', description: 'End date (ISO 8601)' },
      },
    },
    outputSchema: {
      type: 'object',
      properties: {
        totalTrades: { type: 'number' },
        grossPnL: { type: 'string' },
        netPnL: { type: 'string' },
        winRate: { type: 'string' },
        totalWins: { type: 'number' },
        totalLosses: { type: 'number' },
        avgWin: { type: 'string' },
        avgLoss: { type: 'string' },
        profitFactor: { type: 'string' },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'get_user_profile',
    description: `Get the authenticated user's profile information.

Returns username, masked email, language preference, and account creation date.

Args: none

Returns: Object with id, username, email (masked), language, createdAt`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {},
    },
    outputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        username: { type: 'string' },
        email: { type: 'string' },
        language: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'list_tags',
    description: `List all trade tags for the authenticated user.

Args: none

Returns: Array of tag objects with id, name, color, and userId`,
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
          name: { type: 'string' },
          color: { type: 'string' },
          userId: { type: 'string' },
        },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'get_risk_metrics',
    description: `Get key risk metrics across all trades: max drawdown, avg risk per trade, RR distribution, violation count, expectancy, Sharpe-like ratio.

Args:
  - startDate (string, optional): Start date (ISO 8601)
  - endDate (string, optional): End date (ISO 8601)
  - accountId (string, optional): Filter to specific account

Returns: Object with totalTrades, maxDrawdown, maxDrawdownPct, avgRiskPerTrade, avgRR, bestRR, worstRR, expectancy, profitFactor, sharpeRatio, violationCount`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        startDate: { type: 'string', description: 'Start date (ISO 8601)' },
        endDate: { type: 'string', description: 'End date (ISO 8601)' },
        accountId: { type: 'string', description: 'Optional account ID filter' },
      },
    },
    outputSchema: {
      type: 'object',
      properties: {
        totalTrades: { type: 'number' },
        maxDrawdown: { type: 'number' },
        maxDrawdownPct: { type: 'string' },
        avgRiskPerTrade: { type: 'string' },
        avgRR: { type: 'string' },
        bestRR: { type: 'string' },
        worstRR: { type: 'string' },
        expectancy: { type: 'string' },
        profitFactor: { type: 'string' },
        sharpeRatio: { type: 'string' },
        violationCount: { type: 'number' },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'create_journal_entry',
    description: `Create a journal entry (Mood) for a specific day with emotional state, trade reflections, and TTFM checklist.

Args:
  - day (string, required): Date (ISO 8601, e.g. "2024-01-15")
  - mood (string, required): Mood label (e.g. "focused", "anxious", "confident", "tilted", "neutral")
  - emotionValue (number, optional): 0-100 emotion score (default 50)
  - journalContent (string, optional): Detailed journal text
  - tradeIds (string[], optional): Trade IDs to link to this entry

Returns: Created mood entry object`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        day: { type: 'string', description: 'Date (ISO 8601, e.g. "2024-01-15")' },
        mood: { type: 'string', description: 'Mood label: focused, anxious, confident, tilted, neutral, etc.' },
        emotionValue: { type: 'number', description: 'Emotion score 0-100 (default 50)' },
        journalContent: { type: 'string', description: 'Detailed journal text' },
        tradeIds: { type: 'array', items: { type: 'string' }, description: 'Trade IDs to link to this entry' },
      },
      required: ['day', 'mood'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        day: { type: 'string', format: 'date-time' },
        mood: { type: 'string' },
        emotionValue: { type: 'number' },
        journalContent: { type: 'string' },
      },
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  },
]

export async function handleMcpToolCall(toolName: string, args: Record<string, unknown>, ctx: McpAuthContext): Promise<McpToolResult> {
  switch (toolName) {
    case 'get_account_health':
      return await getAccountHealth(ctx, args)
    case 'get_risk_metrics':
      return await getRiskMetrics(ctx, args)
    case 'create_journal_entry':
      return await createJournalEntry(ctx, args)
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
      return toolError(`Unknown tool: ${toolName}`)
  }
}

async function getRiskMetrics(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const dateFilter = buildDateFilter(args)
  const where: Record<string, unknown> = { userId: ctx.userId }
  if (dateFilter) where.entryDate = dateFilter
  if (typeof args.accountId === 'string' && args.accountId) {
    where.accountNumber = args.accountId
  }

  const trades = await prisma.trade.findMany({
    where: where as Parameters<typeof prisma.trade.findMany>[0]['where'],
    orderBy: { entryDate: 'asc' },
    select: { pnl: true, entryPrice: true, closePrice: true, entryDate: true },
  })

  if (!trades.length) {
    return toolSuccess({ message: 'No trades in selected period' })
  }

  const pnls = trades.map((t) => Number(t.pnl))
  const totalPnL = pnls.reduce((s, v) => s + v, 0)
  const wins = pnls.filter((p) => p > 0)
  const losses = pnls.filter((p) => p < 0)
  const winRate = trades.length > 0 ? wins.length / trades.length : 0

  // Running max drawdown
  let runningSum = 0
  let peak = 0
  let maxDD = 0
  for (const p of pnls) {
    runningSum += p
    if (runningSum > peak) peak = runningSum
    const dd = peak - runningSum
    if (dd > maxDD) maxDD = dd
  }

  // Risk per trade (|entry - close| / entry as proxy when quantity unknown)
  const riskPcts = trades.map((t) => {
    const entry = Number(t.entryPrice)
    if (entry === 0) return 0
    return Math.abs(Number(t.closePrice) - entry) / entry * 100
  })
  const avgRiskPerTrade = riskPcts.length > 0
    ? (riskPcts.reduce((s, v) => s + v, 0) / riskPcts.length).toFixed(2)
    : '0.00'

  // RR distribution using entry/close for each trade
  const rrs = trades.map((t) => {
    const entry = Number(t.entryPrice)
    if (entry === 0) return 0
    return (Number(t.closePrice) - entry) / entry
  })
  const validRRs = rrs.filter((r) => r !== 0)
  const avgRR = validRRs.length > 0
    ? (validRRs.reduce((s, v) => s + v, 0) / validRRs.length).toFixed(2)
    : '0.00'
  const bestRR = validRRs.length > 0 ? Math.max(...validRRs).toFixed(2) : '0.00'
  const worstRR = validRRs.length > 0 ? Math.min(...validRRs).toFixed(2) : '0.00'

  // Expectancy
  const avgWin = wins.length > 0 ? wins.reduce((s, v) => s + v, 0) / wins.length : 0
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, v) => s + v, 0) / losses.length) : 0
  const expectancy = winRate * avgWin - (1 - winRate) * avgLoss

  // Profit factor
  const totalWinAmount = wins.reduce((s, v) => s + v, 0)
  const totalLossAmount = Math.abs(losses.reduce((s, v) => s + v, 0))
  const profitFactor = totalLossAmount > 0 ? (totalWinAmount / totalLossAmount) : totalWinAmount > 0 ? Infinity : 0

  // Simple Sharpe-like ratio (PnL / std of PnL)
  const meanPnL = totalPnL / trades.length
  const variance = pnls.reduce((s, v) => s + (v - meanPnL) ** 2, 0) / trades.length
  const stdPnL = Math.sqrt(variance)
  const sharpeRatio = stdPnL > 0 ? (meanPnL / stdPnL * Math.sqrt(trades.length)).toFixed(2) : '0.00'

  // Violation count: trades where risk > 2% (proxy)
  const violationCount = riskPcts.filter((r) => r > 2).length

  return toolSuccess({
    totalTrades: trades.length,
    maxDrawdown: Math.round(maxDD * 100) / 100,
    maxDrawdownPct: peak > 0 ? ((maxDD / peak) * 100).toFixed(1) : '0.0',
    avgRiskPerTrade: `${avgRiskPerTrade}%`,
    avgRR,
    bestRR: `${bestRR}:1`,
    worstRR: `${worstRR}:1`,
    expectancy: expectancy.toFixed(2),
    profitFactor: profitFactor === Infinity ? '∞' : profitFactor.toFixed(2),
    sharpeRatio,
    violationCount,
  })
}

async function createJournalEntry(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const day = requireParam(args, 'day')
  const mood = requireParam(args, 'mood')
  const emotionValue = typeof args.emotionValue === 'number'
    ? Math.min(100, Math.max(0, Math.floor(args.emotionValue)))
    : 50
  const journalContent = typeof args.journalContent === 'string' ? args.journalContent : ''
  const tradeIds = Array.isArray(args.tradeIds) ? args.tradeIds.filter((t): t is string => typeof t === 'string') : []

  const dayDate = new Date(day)
  if (Number.isNaN(dayDate.getTime())) {
    return toolError('Invalid day format. Use ISO 8601 (e.g. "2024-01-15")')
  }

  const existing = await prisma.mood.findUnique({
    where: { userId_day: { userId: ctx.userId, day: dayDate } },
  })

  if (existing) {
    // Update existing entry
    const updated = await prisma.mood.update({
      where: { id: existing.id },
      data: {
        mood,
        emotionValue,
        journalContent: journalContent || existing.journalContent,
        selectedNews: tradeIds.length > 0 ? tradeIds : existing.selectedNews,
      },
    })
    return toolSuccess(updated)
  }

  // Create new entry
  const created = await prisma.mood.create({
    data: {
      userId: ctx.userId,
      day: dayDate,
      mood,
      emotionValue,
      journalContent,
      selectedNews: tradeIds,
      hasTradingExperience: tradeIds.length > 0,
    },
  })
  return toolSuccess(created)
}

async function listAccounts(ctx: McpAuthContext) {
  const accounts = await prisma.account.findMany({
    where: { userId: ctx.userId },
    select: { id: true, number: true, propfirm: true, accountSize: true, startingBalance: true, createdAt: true },
  })
  return toolSuccess(accounts)
}

async function getAccountDetails(ctx: McpAuthContext, accountId: string) {
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId: ctx.userId },
    include: { trades: { take: 10, orderBy: { entryDate: 'desc' } } },
  })
  if (!account) return toolError('Account not found')
  return toolSuccess(account)
}

async function listTrades(ctx: McpAuthContext, args: Record<string, unknown>) {
  const limit = clampInt(args.limit, 1, 200, 50)
  const offset = clampInt(args.offset, 0, 1_000_000, 0)
  const where: Record<string, unknown> = { userId: ctx.userId }
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
  const where: Record<string, unknown> = { userId: ctx.userId }
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
    where: { id: ctx.userId },
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
