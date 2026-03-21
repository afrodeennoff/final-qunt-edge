import { beforeEach, describe, expect, it, vi } from 'vitest'

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findMany: vi.fn(),
    },
    account: {
      groupBy: vi.fn(),
    },
    trade: {
      groupBy: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

import { getLeaderboardData } from '@/app/[locale]/(landing)/leaderboard/data/leaderboard-query'

describe('getLeaderboardData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('includes only opted-in users in the leaderboard query and public results', async () => {
    prismaMock.user.findMany.mockResolvedValue([
      { id: 'user-1', email: 'alpha@example.com' },
    ])

    prismaMock.trade.groupBy
      .mockResolvedValueOnce([{ userId: 'user-1', _sum: { pnl: 4200 }, _count: { id: 12 } }])
    prismaMock.account.groupBy.mockResolvedValueOnce([
      { userId: 'user-1', _sum: { startingBalance: 100000 } },
    ])
    prismaMock.trade.findMany.mockResolvedValueOnce([
      { userId: 'user-1', pnl: 500, instrument: 'XAUUSD', timeInPosition: 30, closeDate: new Date('2026-03-01') },
      { userId: 'user-1', pnl: 250, instrument: 'XAUUSD', timeInPosition: 45, closeDate: new Date('2026-03-02') },
      { userId: 'user-1', pnl: -100, instrument: 'NAS100', timeInPosition: 60, closeDate: new Date('2026-03-03') },
    ])

    const entries = await getLeaderboardData()

    expect(prismaMock.trade.groupBy).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        userId: { in: ['user-1'] },
      }),
    }))
    expect(entries).toEqual([
      {
        rank: 1,
        userId: 'user-1',
        username: 'alpha',
        monthlyPnl: 4200,
        totalTrades: 12,
        winRate: 66.67,
        returnPct: 4.2,
        topInstrument: 'XAUUSD',
        avgWin: 375,
        avgLoss: 100,
        avgDurationMinutes: 45,
        longestWinStreak: 2,
        longestLossStreak: 1,
      },
    ])
  })

  it('sorts by total trades with monthly pnl as the tie-breaker', async () => {
    prismaMock.user.findMany.mockResolvedValue([
      { id: 'user-1', email: 'alpha@example.com' },
      { id: 'user-2', email: 'beta@example.com' },
      { id: 'user-3', email: 'gamma@example.com' },
    ])

    prismaMock.trade.groupBy
      .mockResolvedValueOnce([
        { userId: 'user-1', _sum: { pnl: 500 }, _count: { id: 10 } },
        { userId: 'user-2', _sum: { pnl: 900 }, _count: { id: 10 } },
        { userId: 'user-3', _sum: { pnl: 1200 }, _count: { id: 8 } },
      ])
    prismaMock.account.groupBy.mockResolvedValueOnce([
      { userId: 'user-1', _sum: { startingBalance: 100000 } },
      { userId: 'user-2', _sum: { startingBalance: 100000 } },
      { userId: 'user-3', _sum: { startingBalance: 100000 } },
    ])
    prismaMock.trade.findMany.mockResolvedValueOnce([
      { userId: 'user-1', pnl: 100, instrument: 'XAUUSD', timeInPosition: 20, closeDate: new Date('2026-03-01') },
      { userId: 'user-1', pnl: -10, instrument: 'XAUUSD', timeInPosition: 25, closeDate: new Date('2026-03-02') },
      { userId: 'user-2', pnl: 200, instrument: 'USOIL', timeInPosition: 15, closeDate: new Date('2026-03-01') },
      { userId: 'user-2', pnl: -10, instrument: 'USOIL', timeInPosition: 20, closeDate: new Date('2026-03-02') },
      { userId: 'user-3', pnl: 300, instrument: 'GBPUSD', timeInPosition: 35, closeDate: new Date('2026-03-01') },
      { userId: 'user-3', pnl: -10, instrument: 'GBPUSD', timeInPosition: 40, closeDate: new Date('2026-03-02') },
    ])

    const entries = await getLeaderboardData('totalTrades')

    expect(entries.map((entry) => entry.userId)).toEqual(['user-2', 'user-1', 'user-3'])
    expect(entries.map((entry) => entry.rank)).toEqual([1, 2, 3])
  })
})
