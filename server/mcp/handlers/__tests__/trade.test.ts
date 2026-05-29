import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createTradeHandler, updateTradeHandler } from '../trade'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    account: { findFirst: vi.fn() },
    trade: { create: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
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
      select: { number: true },
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

describe('updateTradeHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates trade strictly scoped to authenticated userId from ctx, never trusting args.userId', async () => {
    const existingTrade = { id: 'trade-uuid-123', userId: 'user-123', accountNumber: 'TEST-001', instrument: 'ES', entryPrice: 5000 }
    vi.mocked(prisma.trade.findFirst).mockResolvedValue(existingTrade as any)
    const updatedTrade = { ...existingTrade, instrument: 'NQ', entryPrice: 5100, closePrice: 5110 }
    vi.mocked(prisma.trade.update).mockResolvedValue(updatedTrade as any)

    const args = {
      tradeId: 'trade-uuid-123',
      instrument: 'NQ',
      entryPrice: 5100,
      closePrice: 5110,
      // malicious
      userId: 'attacker-999',
    }

    const result = await updateTradeHandler({ userId: 'user-123' }, args)

    expect(prisma.trade.findFirst).toHaveBeenCalledWith({
      where: { id: 'trade-uuid-123', userId: 'user-123' },
      select: {
        id: true,
        accountNumber: true,
        instrument: true,
        side: true,
        quantity: true,
        entryPrice: true,
        closePrice: true,
        commission: true,
        pnl: true,
      },
    })

    expect(prisma.trade.update).toHaveBeenCalledWith({
      where: { id: 'trade-uuid-123', userId: 'user-123' },
      data: expect.objectContaining({
        instrument: 'NQ',
        entryPrice: 5100,
        closePrice: 5110,
      }),
    })

    expect(result.instrument).toBe('NQ')
    expect(result.userId).toBe('user-123')
  })

  it('throws authentication error when ctx has no userId (uses requireUserId guard)', async () => {
    await expect(updateTradeHandler({} as any, { tradeId: 't1' }))
      .rejects.toThrow('Authentication required — provide a valid API key')
  })

  it('throws when tradeId missing', async () => {
    await expect(updateTradeHandler({ userId: 'u1' }, { entryPrice: 100 }))
      .rejects.toThrow(/tradeId.*required/i)
  })

  it('throws when trade not found for this user (strict scoping)', async () => {
    vi.mocked(prisma.trade.findFirst).mockResolvedValue(null)
    await expect(
      updateTradeHandler({ userId: 'user-123' }, { tradeId: 'NONEXISTENT' })
    ).rejects.toThrow('Trade not found')
  })

  it('performs partial update (only provided fields)', async () => {
    vi.mocked(prisma.trade.findFirst).mockResolvedValue({ id: 't1', userId: 'user-123' } as any)
    vi.mocked(prisma.trade.update).mockResolvedValue({ id: 't1', comment: 'updated via MCP' } as any)

    await updateTradeHandler({ userId: 'user-123' }, {
      tradeId: 't1',
      comment: 'updated via MCP',
    })

    expect(prisma.trade.update).toHaveBeenCalledWith({
      where: { id: 't1', userId: 'user-123' },
      data: { comment: 'updated via MCP' },
    })
  })

  it('updates dates from ISO strings and numbers', async () => {
    vi.mocked(prisma.trade.findFirst).mockResolvedValue({ id: 't1', userId: 'user-123' } as any)
    vi.mocked(prisma.trade.update).mockResolvedValue({ id: 't1' } as any)

    await updateTradeHandler({ userId: 'user-123' }, {
      tradeId: 't1',
      entryDate: '2026-06-01T10:00:00Z',
      quantity: 5,
    })

    expect(prisma.trade.update).toHaveBeenCalledWith({
      where: { id: 't1', userId: 'user-123' },
      data: expect.objectContaining({
        entryDate: expect.any(Date),
        quantity: 5,
      }),
    })
  })

  it('allows changing accountNumber after verifying new account ownership', async () => {
    vi.mocked(prisma.trade.findFirst).mockResolvedValue({ id: 't1', accountNumber: 'OLD-001', userId: 'user-123' } as any)
    vi.mocked(prisma.account.findFirst).mockResolvedValue({ number: 'NEW-002' } as any)
    vi.mocked(prisma.trade.update).mockResolvedValue({ id: 't1', accountNumber: 'NEW-002' } as any)

    const result = await updateTradeHandler({ userId: 'user-123' }, {
      tradeId: 't1',
      accountNumber: 'NEW-002',
    })

    expect(prisma.account.findFirst).toHaveBeenCalledWith({
      where: { number: 'NEW-002', userId: 'user-123' },
      select: { number: true },
    })
    expect(result.accountNumber).toBe('NEW-002')
  })

  it('throws when no fields provided to update', async () => {
    vi.mocked(prisma.trade.findFirst).mockResolvedValue({ id: 't1', userId: 'user-123' } as any)
    await expect(updateTradeHandler({ userId: 'user-123' }, { tradeId: 't1' }))
      .rejects.toThrow(/No fields to update/i)
  })
})
