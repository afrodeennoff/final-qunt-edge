import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  extractIbkrOrdersHandler,
  computeIbkrFifoHandler,
  importIbkrPdfHandler,
  syncTradovateHandler,
} from '../imports'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    account: { findFirst: vi.fn() },
  },
}))

vi.mock('@/server/database', () => ({
  saveTradesForUserAction: vi.fn(),
}))

vi.mock('@/server/imports/tradovate-actions', () => ({
  getTradovateToken: vi.fn(),
  getTradovateTrades: vi.fn(),
}))

vi.mock('@/app/api/imports/ibkr/extract-orders/route', () => ({
  parseOrders: vi.fn(() => [{ rawSymbol: 'ESZ5', side: 'BUY', quantity: 1, price: 5000, timestamp: '2026-01-01T00:00:00Z' }]),
  parseInstrumentInformation: vi.fn(() => []),
}))

vi.mock('@/app/api/imports/ibkr/fifo-computation/route', () => ({
  matchOrdersWithFIFO: vi.fn(() => [{ quantity: 1, pnl: 10, commission: 0, timeInPosition: 60, side: 'long', entryDate: '2026-01-01', closeDate: '2026-01-01', instrument: 'ES', accountNumber: 'U123', entryPrice: '5000', closePrice: '5010', orderIds: [] }]),
}))

vi.mock('@/app/api/imports/ibkr/ocr/route', () => ({
  extractTextFromPdf: vi.fn(async () => 'Trades\nU***123 ESZ5 2026-01-01, 09:30:00 2026-01-01 - BUY 1 5000.00 ...'),
}))

vi.mock('@/lib/trade-factory', () => ({
  createTradeWithDefaults: vi.fn((t) => ({ ...t, id: 'mock-trade' })),
}))

import { prisma } from '@/lib/prisma'
import { saveTradesForUserAction } from '@/server/database'
import { getTradovateToken, getTradovateTrades } from '@/server/imports/tradovate-actions'

const mockCtx = { userId: 'user-mcp-123', authUserId: 'auth-123', role: 'user' as const, authMethod: 'apikey' as const, apiKeyId: 'key-imp-123' }

describe('IBKR MCP handlers (TDD)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('extractIbkrOrdersHandler requires auth via ctx, returns parsed orders (pure fn wrapped)', async () => {
    const result = await extractIbkrOrdersHandler(mockCtx, { text: 'sample pdf text with Trades U***123 ...' })
    expect(result.userId).toBe('user-mcp-123')
    expect(result.orders.length).toBeGreaterThan(0)
    // SECURITY: never accepts userId in args
    expect((result as any).userIdFromArgs).toBeUndefined()
  })

  it('computeIbkrFifoHandler enforces ctx userId, computes trades via FIFO wrap', async () => {
    const result = await computeIbkrFifoHandler(mockCtx, { orders: [{}], instruments: [] })
    expect(result.userId).toBe('user-mcp-123')
    expect(result.trades.length).toBe(1)
  })
})

describe('importIbkrPdfHandler (TDD - failing until impl)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('imports IBKR PDF with strict user scoping, progress, no cross user', async () => {
    vi.mocked(prisma.account.findFirst).mockResolvedValue({ number: 'U123', userId: 'user-mcp-123' } as any)
    vi.mocked(saveTradesForUserAction).mockResolvedValue({ numberOfTradesAdded: 5, error: null })

    const pdfB64 = Buffer.from('fake pdf').toString('base64')
    const result = await importIbkrPdfHandler(mockCtx, {
      accountNumber: 'U123',
      pdfBase64: pdfB64,
      // malicious
      userId: 'attacker-999',
    })

    expect(prisma.account.findFirst).toHaveBeenCalledWith({
      where: { number: 'U123', userId: 'user-mcp-123' },
      select: { number: true },
    })
    expect(result.imported).toBe(5)
    expect(result.progress).toBe('100%')
    expect(result.userId).toBe('user-mcp-123')
    expect(result.accountNumber).toBe('U123')
  })
})

describe('syncTradovateHandler (TDD - failing until impl)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('syncs tradovate using stored creds (via userId from ctx only), credential safety, progress report', async () => {
    vi.mocked(getTradovateToken).mockResolvedValue({ accessToken: 'tok-abc', error: null })
    vi.mocked(getTradovateTrades).mockResolvedValue({ savedCount: 42, ordersCount: 84, error: null })

    const result = await syncTradovateHandler(mockCtx, { accountId: 'my-acc' })

    // SECURITY: get token called with userId from ctx, never from args
    expect(getTradovateToken).toHaveBeenCalledWith('my-acc', 'user-mcp-123')
    expect(getTradovateTrades).toHaveBeenCalledWith('tok-abc', expect.objectContaining({ userId: 'user-mcp-123' }))

    expect(result.success).toBe(true)
    expect(result.savedCount).toBe(42)
    expect(result.progress).toBe('100%')
    // credential safety
    expect((result as any).accessToken).toBeUndefined()
    expect((result as any).token).toBeUndefined()
  })
})
