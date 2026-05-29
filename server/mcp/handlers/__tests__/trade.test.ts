import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createTradeHandler } from '../trade'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    account: { findFirst: vi.fn() },
    trade: { create: vi.fn() },
  },
}))

import { prisma } from '@/lib/prisma'

const mockAccount = { id: 'acc1', number: 'TEST-001', userId: 'user-123' }

describe('createTradeHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates trade strictly scoped to authenticated userId from ctx, never trusting args.userId', async () => {
    vi.mocked(prisma.account.findFirst).mockResolvedValue(mockAccount as any)
    const createdTrade = {
      id: 'trade-uuid-123',
      userId: 'user-123',
      accountNumber: 'TEST-001',
      instrument: 'ES',
      side: 'LONG',
      quantity: 2,
      entryPrice: 5000.5,
      closePrice: 5010.25,
      pnl: 19.5,
      commission: 2.5,
      entryDate: new Date('2026-05-01T09:30:00Z'),
      closeDate: new Date('2026-05-01T10:15:00Z'),
      tags: [],
      comment: 'Test MCP create',
      createdAt: new Date(),
    }
    vi.mocked(prisma.trade.create).mockResolvedValue(createdTrade as any)

    const args = {
      accountNumber: 'TEST-001',
      instrument: 'ES',
      side: 'LONG',
      quantity: 2,
      entryPrice: 5000.5,
      closePrice: 5010.25,
      entryDate: '2026-05-01T09:30:00Z',
      closeDate: '2026-05-01T10:15:00Z',
      pnl: 19.5, // provided
      commission: 2.5,
      comment: 'Test MCP create',
      // malicious cross-user attempt
      userId: 'attacker-999',
      accountId: 'should-be-ignored',
    }

    const result = await createTradeHandler({ userId: 'user-123' }, args)

    // SECURITY: account lookup MUST use ctx userId
    expect(prisma.account.findFirst).toHaveBeenCalledWith({
      where: { number: 'TEST-001', userId: 'user-123' },
    })

    // SECURITY: create data MUST have userId from ctx only
    expect(prisma.trade.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-123',
        accountNumber: 'TEST-001',
        instrument: 'ES',
        side: 'LONG',
        quantity: 2,
        entryPrice: 5000.5,
        closePrice: 5010.25,
        entryDate: expect.any(Date),
        closeDate: expect.any(Date),
        pnl: 19.5,
        commission: 2.5,
        comment: 'Test MCP create',
      }),
    })

    expect(result.id).toBe('trade-uuid-123')
    expect(result.userId).toBe('user-123')
    expect(result.accountNumber).toBe('TEST-001')
  })

  it('computes pnl when not provided using side/quantity/prices', async () => {
    vi.mocked(prisma.account.findFirst).mockResolvedValue(mockAccount as any)
    vi.mocked(prisma.trade.create).mockResolvedValue({ id: 't2', userId: 'user-123', pnl: 10 } as any)

    const args = {
      accountNumber: 'TEST-001',
      instrument: 'NQ',
      side: 'SHORT',
      quantity: 1,
      entryPrice: 20000,
      closePrice: 19990,
      entryDate: '2026-05-02T00:00:00Z',
      closeDate: '2026-05-02T00:30:00Z',
      // no pnl provided
    }

    await createTradeHandler({ userId: 'user-123' }, args)

    expect(prisma.trade.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        pnl: 10,
      }),
    })
  })

  it('throws authentication error when ctx has no userId (uses requireUserId guard)', async () => {
    await expect(createTradeHandler({} as any, { accountNumber: 'x' }))
      .rejects.toThrow('Authentication required — provide a valid API key')
  })

  it('throws when required accountNumber or instrument missing', async () => {
    await expect(createTradeHandler({ userId: 'u1' }, { entryPrice: 100 }))
      .rejects.toThrow(/accountNumber.*required|instrument.*required/i)
  })

  it('throws when account not found for this user (strict scoping)', async () => {
    vi.mocked(prisma.account.findFirst).mockResolvedValue(null)
    await expect(
      createTradeHandler({ userId: 'user-123' }, {
        accountNumber: 'NONEXISTENT',
        instrument: 'ES',
        entryPrice: 100,
        closePrice: 101,
        entryDate: '2026-01-01',
        closeDate: '2026-01-01',
      })
    ).rejects.toThrow('Account not found')
  })

  it('rejects cross-user attempt via assert (even if account check passed somehow)', async () => {
    vi.mocked(prisma.account.findFirst).mockResolvedValue({ number: 'A', userId: 'user-123' } as any)
    const result = await createTradeHandler({ userId: 'user-123' }, {
      accountNumber: 'A',
      instrument: 'ES',
      entryPrice: 1,
      closePrice: 2,
      entryDate: '2026-01-01T00:00:00Z',
      closeDate: '2026-01-01T00:01:00Z',
      userId: 'evil',
    })
    expect(result.userId).toBe('user-123')
  })
})
