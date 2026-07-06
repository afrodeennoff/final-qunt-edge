import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    trade: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
    },
  },
}))

vi.mock('@/server/auth', () => ({
  getDatabaseUserId: vi.fn(),
}))

import { getJournalTradesAction } from '@/server/journal'
import { getDatabaseUserId } from '@/server/auth'
import { prisma } from '@/lib/prisma'

describe('getJournalTradesAction MUDI', () => {
  beforeEach(() => vi.clearAllMocks())

  it('derives userId from the session only (no client-supplied param exists)', async () => {
    ;(getDatabaseUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue('SESSION_USER')
    // The new signature has NO userId parameter — callers cannot inject one.
    await getJournalTradesAction(1, 30)
    const where = (prisma.trade.findMany as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0].where
    expect(where.userId).toBe('SESSION_USER')
  })

  it('returns an empty result when there is no session user', async () => {
    ;(getDatabaseUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    const result = await getJournalTradesAction(1, 30)
    expect(result.entries).toEqual([])
    expect(result.total).toBe(0)
  })
})
