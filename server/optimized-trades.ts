'use server'

import { prisma } from '@/lib/prisma'
import { executeOptimizedQuery } from '@/lib/query-optimizer'
import { getDatabaseUserId } from './auth'

export async function getOptimizedTradesForUser(userId: string, filters?: {
  accountNumbers?: string[]
  instruments?: string[]
  dateRange?: { from: string; to: string }
  limit?: number
}) {
  const authenticatedUserId = await getDatabaseUserId()

  if (userId !== authenticatedUserId) {
    throw new Error('Forbidden: Cannot access another user\'s trades')
  }

  const cacheKey = `trades-${userId}-${JSON.stringify(filters)}`

  return executeOptimizedQuery(
    'getTradesForUser',
    async () => {
      const where: Record<string, unknown> = { userId }

      if (filters?.accountNumbers?.length) {
        where.accountNumber = { in: filters.accountNumbers }
      }

      if (filters?.instruments?.length) {
        where.instrument = { in: filters.instruments }
      }

      if (filters?.dateRange?.from || filters?.dateRange?.to) {
        where.entryDate = {}
        if (filters.dateRange.from) (where.entryDate as Record<string, unknown>).gte = filters.dateRange.from
        if (filters.dateRange.to) (where.entryDate as Record<string, unknown>).lte = filters.dateRange.to
      }

      return prisma.trade.findMany({
        where,
        select: {
          id: true,
          accountNumber: true,
          instrument: true,
          entryDate: true,
          closeDate: true,
          entryPrice: true,
          closePrice: true,
          quantity: true,
          side: true,
          pnl: true,
          commission: true,
          timeInPosition: true,
          tags: true,
          comment: true,
        },
        orderBy: { entryDate: 'desc' },
        take: filters?.limit || 1000,
      })
    },
    cacheKey,
    300
  )
}

export async function getTradesByAccountOptimized(accountNumber: string, userId: string) {
  const authenticatedUserId = await getDatabaseUserId()

  if (userId !== authenticatedUserId) {
    throw new Error('Forbidden: Cannot access another user\'s trades')
  }

  return executeOptimizedQuery(
    'getTradesByAccount',
    () => prisma.trade.findMany({
      where: {
        accountNumber,
        userId,
      },
      select: {
        id: true,
        instrument: true,
        entryDate: true,
        closeDate: true,
        pnl: true,
        commission: true,
        tags: true,
      },
      orderBy: { entryDate: 'desc' },
    }),
    `trades-account-${accountNumber}`,
    600
  )
}

export async function getTradeCountByInstrument(userId: string) {
  const authenticatedUserId = await getDatabaseUserId()

  if (userId !== authenticatedUserId) {
    throw new Error('Forbidden: Cannot access another user\'s trades')
  }

  return executeOptimizedQuery(
    'getTradeCountByInstrument',
    () => prisma.trade.groupBy({
      by: ['instrument'],
      where: { userId },
      _count: { id: true },
      _sum: { pnl: true },
      orderBy: { _count: { id: 'desc' } },
    }),
    `trade-counts-${userId}`,
    1800
  )
}

export async function getDailyPnLOptimized(userId: string, accountNumbers?: string[]) {
  const authenticatedUserId = await getDatabaseUserId()

  if (userId !== authenticatedUserId) {
    throw new Error('Forbidden: Cannot access another user\'s trades')
  }

  return executeOptimizedQuery(
    'getDailyPnL',
    () => prisma.$queryRaw`
      SELECT
        DATE(entry_date) as date,
        SUM(pnl - commission) as net_pnl,
        COUNT(*) as trade_count
      FROM "Trade"
      WHERE user_id = ${userId}
        ${accountNumbers && accountNumbers.length > 0
          ? prisma.$queryRaw`AND account_number = ANY(${accountNumbers})`
          : prisma.$queryRaw``}
      GROUP BY DATE(entry_date)
      ORDER BY date DESC
      LIMIT 365
    `,
    `daily-pnl-${userId}`,
    300
  )
}

export async function getAccountSummaryOptimized(userId: string) {
  const authenticatedUserId = await getDatabaseUserId()

  if (userId !== authenticatedUserId) {
    throw new Error('Forbidden: Cannot access another user\'s data')
  }

  return executeOptimizedQuery(
    'getAccountSummary',
    async () => {
      const accounts = await prisma.account.findMany({
        where: { userId },
        select: {
          id: true,
          number: true,
          startingBalance: true,
          propfirm: true,
          payoutCount: true,
        },
      })

      const accountNumbers = accounts.map(a => a.number)

      const tradeStats = await prisma.trade.groupBy({
        by: ['accountNumber'],
        where: {
          userId,
          accountNumber: { in: accountNumbers },
        },
        _count: { id: true },
        _sum: { pnl: true, commission: true },
      })

      return accounts.map(account => {
        const stats = tradeStats.find(s => s.accountNumber === account.number)
        return {
          ...account,
          tradeCount: stats?._count.id || 0,
          totalPnL: stats?._sum.pnl || 0,
          totalCommission: stats?._sum.commission || 0,
        }
      })
    },
    `account-summary-${userId}`,
    600
  )
}

export async function batchUpdateTradesOptimized(
  userId: string,
  updates: Array<{ id: string; data: Record<string, unknown> }>
) {
  const authenticatedUserId = await getDatabaseUserId()

  if (userId !== authenticatedUserId) {
    throw new Error('Forbidden: Cannot modify another user\'s trades')
  }

  return prisma.$transaction(
    updates.map(update =>
      prisma.trade.updateMany({
        where: { id: update.id, userId },
        data: update.data,
      })
    )
  )
}

export async function getRecentTradesWithPagination(
  userId: string,
  page: number = 1,
  pageSize: number = 50
) {
  const authenticatedUserId = await getDatabaseUserId()

  if (userId !== authenticatedUserId) {
    throw new Error('Forbidden: Cannot access another user\'s trades')
  }

  const skip = (page - 1) * pageSize

  return executeOptimizedQuery(
    'getRecentTradesPaginated',
    async () => {
      const [trades, totalCount] = await Promise.all([
        prisma.trade.findMany({
          where: { userId },
          select: {
            id: true,
            accountNumber: true,
            instrument: true,
            entryDate: true,
            pnl: true,
            commission: true,
            tags: true,
          },
          orderBy: { entryDate: 'desc' },
          skip,
          take: pageSize,
        }),
        prisma.trade.count({ where: { userId } }),
      ])

      return {
        trades,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
        },
      }
    },
    `trades-page-${userId}-${page}`,
    120
  )
}
