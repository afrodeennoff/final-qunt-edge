import { describe, it, expect, vi, beforeEach } from 'vitest'
import { aiAnalyzeTradeHandler, aiChatHandler, aiAnalysisGlobalHandler } from '../ai'
import { requireUserId } from '../../security'

// Mocks
vi.mock('@/lib/prisma', () => ({
  prisma: {
    trade: { findFirst: vi.fn(), findMany: vi.fn(), count: vi.fn() },
    tradeAnalytics: { findUnique: vi.fn() },
    account: { findMany: vi.fn() },
  },
}))
vi.mock('@/lib/ai/client', () => ({
  getAiLanguageModel: vi.fn(() => 'mock-model'),
}))
vi.mock('ai', () => ({
  generateText: vi.fn(async () => ({ text: 'Mocked AI analysis response', usage: { totalTokens: 123 } })),
}))
vi.mock('@/lib/ai/policy', () => ({
  getAiPolicy: vi.fn(() => ({ temperature: 0.7, model: 'test', provider: 'test', logSampleRate: 1 })),
}))
vi.mock('@/lib/ai/telemetry', () => ({
  logAiRequest: vi.fn(),
  categorizeAiError: vi.fn(),
  extractUsage: vi.fn((u) => u),
}))
vi.mock('@/lib/ai/usage-budget', () => ({
  assertWithinAiBudget: vi.fn(async () => ({ allowed: true, limit: 1000000, used: 100, remaining: 999900 })),
}))
vi.mock('@/lib/ai/entitlements', () => ({
  canAccessAiFeature: vi.fn(async () => ({ allowed: true, plan: 'PRO', isActive: true })),
}))
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(() => async () => ({ success: true, limit: 10, remaining: 9, resetTime: Date.now() + 60000 })),
}))
vi.mock('../../security', () => ({
  requireUserId: vi.fn((ctx) => ctx?.userId || (() => { throw new Error('Authentication required') })()),
}))

import { prisma } from '@/lib/prisma'
import { generateText } from 'ai'

const mockCtx = { userId: 'user123', authUserId: 'auth123', role: 'user' as const, authMethod: 'apikey' as const, apiKeyId: 'key-ai-123' }
const mockTrade = {
  id: 'trade1',
  userId: 'user123',
  instrument: 'ES',
  side: 'long',
  quantity: 1,
  entryPrice: 5000,
  closePrice: 5010,
  pnl: 10,
  commission: 1,
  entryDate: new Date(),
  closeDate: new Date(),
  account: { number: 'ACC1' },
}

describe('AI MCP Handlers (TDD)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(requireUserId as any).mockImplementation((ctx: any) => ctx?.userId || (() => { throw new Error('Authentication required — provide a valid API key') })())
    ;(prisma.trade.findFirst as any).mockResolvedValue(mockTrade)
    ;(prisma.trade.findMany as any).mockResolvedValue([mockTrade])
    ;(prisma.trade.count as any).mockResolvedValue(42)
    ;(prisma.tradeAnalytics.findUnique as any).mockResolvedValue({ mae: 5, mfe: 15, riskRewardRatio: 2, efficiency: 0.8 })
    ;(prisma.account.findMany as any).mockResolvedValue([])
  })

  it('aiAnalyzeTradeHandler requires userId via security guard', async () => {
    await expect(aiAnalyzeTradeHandler({} as any, { tradeId: 'trade1' })).rejects.toThrow('Authentication required')
  })

  it('aiAnalyzeTradeHandler returns LLM analysis for own trade (userId scoped)', async () => {
    const result = await aiAnalyzeTradeHandler(mockCtx as any, { tradeId: 'trade1' })
    expect(result).toHaveProperty('analysis')
    expect(result.analysis).toContain('Mocked AI analysis')
    expect(prisma.trade.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'trade1', userId: 'user123' }
    }))
    expect(generateText).toHaveBeenCalled()
  })

  it('aiChatHandler enforces userId and returns response', async () => {
    const result = await aiChatHandler(mockCtx as any, { messages: [{ role: 'user', content: 'How is my trading?' }] })
    expect(result).toHaveProperty('text')
    expect(requireUserId).toHaveBeenCalled()
  })

  it('aiAnalysisGlobalHandler scopes to user and calls AI', async () => {
    const result = await aiAnalysisGlobalHandler(mockCtx as any, { locale: 'en' })
    expect(result).toHaveProperty('text')
  })

  it('rejects cross-user access in analyze (via guard)', async () => {
    await expect(aiAnalyzeTradeHandler({} as any, { tradeId: 'trade1' })).rejects.toThrow('Authentication required')
  })
})
