import { beforeEach, describe, expect, it, vi } from 'vitest'

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findMany: vi.fn(),
    },
    trade: {
      groupBy: vi.fn(),
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
      .mockResolvedValueOnce([
        { userId: 'user-1', _sum: { pnl: 4200 }, _count: { id: 12 } },
      ])
      .mockResolvedValueOnce([
        { userId: 'user-1', _count: { id: 9 } },
      ])
      .mockResolvedValueOnce([
        { userId: 'user-1', _count: { id: 3 } },
      ])

    const entries = await getLeaderboardData()

    expect(prismaMock.trade.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: { in: ['user-1'] },
        }),
      }),
    )
    expect(entries).toEqual([
      {
        rank: 1,
        userId: 'user-1',
        username: 'alpha',
        monthlyPnl: 4200,
        totalTrades: 12,
        winRate: 75,
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
      .mockResolvedValueOnce([
        { userId: 'user-1', _count: { id: 7 } },
        { userId: 'user-2', _count: { id: 6 } },
        { userId: 'user-3', _count: { id: 6 } },
      ])
      .mockResolvedValueOnce([
        { userId: 'user-1', _count: { id: 3 } },
        { userId: 'user-2', _count: { id: 4 } },
        { userId: 'user-3', _count: { id: 2 } },
      ])

    const entries = await getLeaderboardData('totalTrades')

    expect(entries.map((entry) => entry.userId)).toEqual(['user-2', 'user-1', 'user-3'])
    expect(entries.map((entry) => entry.rank)).toEqual([1, 2, 3])
  })
})
