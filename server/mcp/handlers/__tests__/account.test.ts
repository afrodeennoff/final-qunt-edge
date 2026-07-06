import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAccountHealthHandler } from '../account'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    account: { findMany: vi.fn() },
    trade: { findMany: vi.fn() },
    payout: { findMany: vi.fn() },
  },
}))

import { prisma } from '@/lib/prisma'

const mockAccount = {
  id: 'acc1',
  number: '1001',
  propfirm: 'FTMO',
  accountSize: '100000',
  startingBalance: 100000,
  drawdownThreshold: 10000,
  buffer: 2000,
  trailingDrawdown: false,
  trailingStopProfit: null,
  profitTarget: 10000,
  evaluation: true,
  minTradingDaysForPayout: 5,
  dailyLoss: 2500,
}

describe('getAccountHealthHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws error when no accounts found', async () => {
    vi.mocked(prisma.account.findMany).mockResolvedValue([])
    await expect(getAccountHealthHandler({ userId: 'u1' } as any, {}))
      .rejects.toThrow('No accounts found')
  })

  it('returns HEALTHY status when drawdown is minimal', async () => {
    vi.mocked(prisma.account.findMany).mockResolvedValue([mockAccount] as any)
    vi.mocked(prisma.trade.findMany).mockResolvedValue([])
    vi.mocked(prisma.payout.findMany).mockResolvedValue([])

    const result = await getAccountHealthHandler({ userId: 'u1' } as any, {})
    expect(result[0].status).toBe('HEALTHY')
    expect(result[0].drawdownUsedPct).toBe('0.0')
    expect(result[0].currentBalance).toBe(100000)
  })
})
