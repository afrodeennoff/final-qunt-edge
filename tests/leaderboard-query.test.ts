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
        accountCount: 0,
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

  it('fails closed when the leaderboard opt-in column is missing in the database', async () => {
    prismaMock.user.findMany.mockRejectedValue({ code: 'P2022' })

    const entries = await getLeaderboardData()

    expect(entries).toEqual([])
    expect(prismaMock.trade.groupBy).not.toHaveBeenCalled()
    expect(prismaMock.trade.findMany).not.toHaveBeenCalled()
    expect(prismaMock.account.groupBy).not.toHaveBeenCalled()
  })

  it('handles tie on monthly PnL by using winRate as tie-breaker and assigns sequential ranks', async () => {
    prismaMock.user.findMany.mockResolvedValue([
      { id: 'user-1', email: 'alice@example.com' },
      { id: 'user-2', email: 'bob@example.com' },
      { id: 'user-3', email: 'charlie@example.com' },
    ])

    prismaMock.trade.groupBy.mockResolvedValueOnce([
      { userId: 'user-1', _sum: { pnl: 1000 }, _count: { id: 10 } },
      { userId: 'user-2', _sum: { pnl: 1000 }, _count: { id: 8 } },
      { userId: 'user-3', _sum: { pnl: 500 }, _count: { id: 5 } },
    ])
    prismaMock.account.groupBy.mockResolvedValueOnce([
      { userId: 'user-1', _sum: { startingBalance: 100000 } },
      { userId: 'user-2', _sum: { startingBalance: 100000 } },
      { userId: 'user-3', _sum: { startingBalance: 100000 } },
    ])
    prismaMock.trade.findMany.mockResolvedValueOnce([
      { userId: 'user-1', pnl: 600, instrument: 'XAUUSD', timeInPosition: 30, closeDate: new Date('2026-03-01') },
      { userId: 'user-1', pnl: 400, instrument: 'XAUUSD', timeInPosition: 30, closeDate: new Date('2026-03-02') },
      { userId: 'user-2', pnl: 600, instrument: 'EURUSD', timeInPosition: 20, closeDate: new Date('2026-03-01') },
      { userId: 'user-2', pnl: 400, instrument: 'EURUSD', timeInPosition: 20, closeDate: new Date('2026-03-02') },
      { userId: 'user-3', pnl: 500, instrument: 'GBPUSD', timeInPosition: 40, closeDate: new Date('2026-03-01') },
    ])

    const entries = await getLeaderboardData('monthly_pnl')

    expect(entries.length).toBe(3)
    expect(entries.map((e) => e.userId)).toEqual(['user-1', 'user-2', 'user-3'])
    expect(entries.map((e) => e.rank)).toEqual([1, 2, 3])
    expect(entries.map((e) => e.monthlyPnl)).toEqual([1000, 1000, 500])
    expect(entries[0].username).toBe('alice')
    expect(entries[1].username).toBe('bob')
    expect(entries[2].username).toBe('charlie')
  })

  it('sorts by winRate with monthly PnL tie-breaker', async () => {
    prismaMock.user.findMany.mockResolvedValue([
      { id: 'user-1', email: 'alice@example.com' },
      { id: 'user-2', email: 'bob@example.com' },
    ])

    prismaMock.trade.groupBy.mockResolvedValueOnce([
      { userId: 'user-1', _sum: { pnl: 500 }, _count: { id: 4 } },
      { userId: 'user-2', _sum: { pnl: 1000 }, _count: { id: 4 } },
    ])
    prismaMock.account.groupBy.mockResolvedValueOnce([
      { userId: 'user-1', _sum: { startingBalance: 100000 } },
      { userId: 'user-2', _sum: { startingBalance: 100000 } },
    ])
    prismaMock.trade.findMany.mockResolvedValueOnce([
      { userId: 'user-1', pnl: 200, instrument: 'XAUUSD', timeInPosition: 30, closeDate: new Date('2026-03-01') },
      { userId: 'user-1', pnl: 150, instrument: 'XAUUSD', timeInPosition: 30, closeDate: new Date('2026-03-02') },
      { userId: 'user-1', pnl: 150, instrument: 'XAUUSD', timeInPosition: 30, closeDate: new Date('2026-03-03') },
      { userId: 'user-1', pnl: 0, instrument: 'XAUUSD', timeInPosition: 30, closeDate: new Date('2026-03-04') },
      { userId: 'user-2', pnl: 300, instrument: 'EURUSD', timeInPosition: 20, closeDate: new Date('2026-03-01') },
      { userId: 'user-2', pnl: 300, instrument: 'EURUSD', timeInPosition: 20, closeDate: new Date('2026-03-02') },
      { userId: 'user-2', pnl: 300, instrument: 'EURUSD', timeInPosition: 20, closeDate: new Date('2026-03-03') },
      { userId: 'user-2', pnl: 100, instrument: 'EURUSD', timeInPosition: 20, closeDate: new Date('2026-03-04') },
    ])

    const entries = await getLeaderboardData('winrate')

    expect(entries.length).toBe(2)
    expect(entries[0].userId).toBe('user-2')
    expect(entries[0].rank).toBe(1)
    expect(entries[1].userId).toBe('user-1')
    expect(entries[1].rank).toBe(2)
  })

  it('ranks are always sequential 1..N regardless of sort order', async () => {
    // Use mockResolvedValue (persistent) so all three sequential getLeaderboardData calls work.
    prismaMock.user.findMany.mockResolvedValue([
      { id: 'u1', email: 'a@test.com' },
      { id: 'u2', email: 'b@test.com' },
      { id: 'u3', email: 'c@test.com' },
      { id: 'u4', email: 'd@test.com' },
    ])
    prismaMock.trade.groupBy.mockResolvedValue([
      { userId: 'u1', _sum: { pnl: 300 }, _count: { id: 2 } },
      { userId: 'u2', _sum: { pnl: 100 }, _count: { id: 4 } },
      { userId: 'u3', _sum: { pnl: 200 }, _count: { id: 1 } },
      { userId: 'u4', _sum: { pnl: 400 }, _count: { id: 3 } },
    ])
    prismaMock.account.groupBy.mockResolvedValue([
      { userId: 'u1', _sum: { startingBalance: 100000 } },
      { userId: 'u2', _sum: { startingBalance: 100000 } },
      { userId: 'u3', _sum: { startingBalance: 100000 } },
      { userId: 'u4', _sum: { startingBalance: 100000 } },
    ])
    prismaMock.trade.findMany.mockResolvedValue([
      { userId: 'u1', pnl: 200, instrument: 'XAUUSD', timeInPosition: 30, closeDate: new Date('2026-03-01') },
      { userId: 'u1', pnl: 100, instrument: 'XAUUSD', timeInPosition: 30, closeDate: new Date('2026-03-02') },
      { userId: 'u2', pnl: 50, instrument: 'EURUSD', timeInPosition: 20, closeDate: new Date('2026-03-01') },
      { userId: 'u2', pnl: 50, instrument: 'EURUSD', timeInPosition: 20, closeDate: new Date('2026-03-02') },
      { userId: 'u2', pnl: 0, instrument: 'EURUSD', timeInPosition: 20, closeDate: new Date('2026-03-03') },
      { userId: 'u2', pnl: 0, instrument: 'EURUSD', timeInPosition: 20, closeDate: new Date('2026-03-04') },
      { userId: 'u3', pnl: 200, instrument: 'GBPUSD', timeInPosition: 40, closeDate: new Date('2026-03-01') },
      { userId: 'u4', pnl: 400, instrument: 'NAS100', timeInPosition: 15, closeDate: new Date('2026-03-01') },
      { userId: 'u4', pnl: 0, instrument: 'NAS100', timeInPosition: 15, closeDate: new Date('2026-03-02') },
      { userId: 'u4', pnl: 0, instrument: 'NAS100', timeInPosition: 15, closeDate: new Date('2026-03-03') },
    ])

    const byPnl = await getLeaderboardData('monthly_pnl')
    const byWr = await getLeaderboardData('winrate')
    const byTrades = await getLeaderboardData('totalTrades')

    const checkSequential = (entries: typeof byPnl) => {
      const ranks = entries.map((e) => e.rank)
      expect(ranks).toEqual([1, 2, 3, 4])
    }

    checkSequential(byPnl)
    checkSequential(byWr)
    checkSequential(byTrades)
  })
})
