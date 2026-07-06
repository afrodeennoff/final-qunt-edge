/**
 * SECURITY: All queries and mutations in this file MUST be scoped by ctx.userId.
 * Never accept userId from args. Use requireUserId(ctx) from '../security'.
 * AI tools additionally enforce entitlements, budget, and rate limits via lib/ai/*.
 * All AI calls log to AiRequestLog via telemetry. Zero cross-user leakage.
 */

import type { McpAuthContext } from '../../mcp-auth'
import { requireUserId } from '../security'
import { prisma } from '@/lib/prisma'
import { getAiLanguageModel } from '@/lib/ai/client'
import { getAiPolicy } from '@/lib/ai/policy'
import { categorizeAiError, extractUsage, logAiRequest } from '@/lib/ai/telemetry'
import { canAccessAiFeature } from '@/lib/ai/entitlements'
import { assertWithinAiBudget } from '@/lib/ai/usage-budget'
import { rateLimit } from '@/lib/rate-limit'
import { generateText } from 'ai'
import { getAiErrorCode, logAiError } from '@/lib/ai/error-utils'

// Rate limiters for MCP AI (subject = userId for isolation)
const mcpChatRateLimit = rateLimit({ limit: 20, window: 60_000, identifier: 'mcp-ai-chat' })
const mcpAnalysisRateLimit = rateLimit({ limit: 8, window: 60_000, identifier: 'mcp-ai-analysis' })
const mcpAnalyzeTradeRateLimit = rateLimit({ limit: 15, window: 60_000, identifier: 'mcp-ai-analyze-trade' })

async function guardMcpAiRequest(ctx: McpAuthContext, feature: 'chat' | 'analysis' | 'analyze-trade' | 'search') {
  const userId = requireUserId(ctx)
  const authUserId = ctx.authUserId

  // Admin bypass
  if (ctx.role === 'admin') {
    return { userId, authUserId }
  }

  // In dev/test, all AI features are free — skip entitlement + budget checks
  if (process.env.NODE_ENV === 'production') {
    const mappedFeature = feature === 'analyze-trade' ? 'analysis' : feature
    const entitlement = await canAccessAiFeature(authUserId, mappedFeature)
    if (!entitlement.allowed) {
      throw new Error(entitlement.reason || 'AI feature not available for current plan')
    }

    try {
      const budget = await assertWithinAiBudget(userId, entitlement.isActive)
      if (!budget.allowed) {
        throw new Error(`Monthly AI budget exceeded. Limit: ${budget.limit}, used: ${budget.used}`)
      }
    } catch (e) {
      throw e
    }
  }

  const limiter = feature === 'chat' ? mcpChatRateLimit : feature === 'analyze-trade' ? mcpAnalyzeTradeRateLimit : mcpAnalysisRateLimit
  const rate = await limiter({ headers: { get: () => null } }, { subject: userId })
  if (!rate.success) {
    throw new Error('Rate limited for AI requests. Try again later.')
  }

  return { userId, authUserId }
}

export async function aiChatHandler(ctx: McpAuthContext, args: Record<string, unknown>) {
  const startedAt = Date.now()
  const userId = requireUserId(ctx)
  await guardMcpAiRequest(ctx, 'chat')

  try {
    const messages = (args.messages as any[]) || [{ role: 'user', content: String(args.prompt || 'Summarize my recent trading performance.') }]
    const lastUser = [...messages].reverse().find((m: any) => m.role === 'user')
    const question = typeof lastUser?.content === 'string' ? lastUser.content : 'Tell me about my trading.'

    const recentTrades = await prisma.trade.findMany({
      where: { userId },
      orderBy: { entryDate: 'desc' },
      take: 5,
      select: { instrument: true, side: true, pnl: true, entryDate: true },
    })
    const totalTrades = await prisma.trade.count({ where: { userId } })

    const system = `You are a trading coach AI for Qunt Edge user. User has ${totalTrades} trades. Recent: ${JSON.stringify(recentTrades)}. Be concise, data-driven, use trading terms. Respond in English.`

    const policy = getAiPolicy('chat')
    const result = await generateText({
      model: getAiLanguageModel('chat', userId),
      system,
      prompt: question,
      temperature: policy.temperature,
    })

    void logAiRequest({
      userId,
      route: 'mcp://ai_chat',
      feature: 'chat',
      model: policy.model,
      provider: policy.provider,
      usage: extractUsage(result.usage),
      latencyMs: Date.now() - startedAt,
      success: true,
      sampleRate: policy.logSampleRate,
    })

    return { text: result.text, usage: result.usage, tradesAnalyzed: recentTrades.length }
  } catch (error) {
    void logAiRequest({
      userId,
      route: 'mcp://ai_chat',
      feature: 'chat',
      model: 'unknown',
      provider: 'unknown',
      latencyMs: Date.now() - startedAt,
      success: false,
      errorCategory: categorizeAiError(error),
      errorCode: getAiErrorCode(error),
      sampleRate: 1,
    })
    logAiError('MCP ai_chat error', error, { userId })
    throw new Error('Failed to process AI chat')
  }
}

export async function aiAnalyzeTradeHandler(ctx: McpAuthContext, args: Record<string, unknown>) {
  const startedAt = Date.now()
  const userId = requireUserId(ctx)
  await guardMcpAiRequest(ctx, 'analyze-trade')

  try {
    const tradeId = String(args.tradeId || '')
    if (!tradeId) throw new Error('tradeId is required')

    const trade = await prisma.trade.findFirst({
      where: { id: tradeId, userId },
      include: { account: true },
    })
    if (!trade) throw new Error('Trade not found or access denied')

    const analytics = await prisma.tradeAnalytics.findUnique({ where: { tradeId } })

    const tradeData = {
      instrument: trade.instrument,
      side: trade.side,
      quantity: Number(trade.quantity),
      entryPrice: Number(trade.entryPrice),
      closePrice: Number(trade.closePrice),
      pnl: Number(trade.pnl),
      commission: Number(trade.commission),
      entryDate: trade.entryDate,
      closeDate: trade.closeDate,
      account: trade.account?.number,
      mae: analytics ? Number(analytics.mae) : null,
      mfe: analytics ? Number(analytics.mfe) : null,
      rr: analytics?.riskRewardRatio ? Number(analytics.riskRewardRatio) : null,
      efficiency: analytics?.efficiency ? Number(analytics.efficiency) : null,
    }

    const policy = getAiPolicy('analysis')
    const prompt = `Analyze this single trade in detail for a trader. Provide: 1. What went well 2. What could improve 3. Risk notes 4. Actionable tip. Data: ${JSON.stringify(tradeData)}`

    const result = await generateText({
      model: getAiLanguageModel('analysis', userId),
      prompt,
      temperature: policy.temperature,
    })

    void logAiRequest({
      userId,
      route: 'mcp://ai_analyze_trade',
      feature: 'analysis',
      model: policy.model,
      provider: policy.provider,
      usage: extractUsage(result.usage),
      latencyMs: Date.now() - startedAt,
      success: true,
      sampleRate: policy.logSampleRate,
    })

    return { tradeId, analysis: result.text, trade: tradeData, usage: result.usage }
  } catch (error) {
    void logAiRequest({ userId, route: 'mcp://ai_analyze_trade', feature: 'analysis', model: 'unknown', provider: 'unknown', latencyMs: Date.now() - startedAt, success: false, errorCategory: categorizeAiError(error), errorCode: getAiErrorCode(error), sampleRate: 1 })
    logAiError('MCP ai_analyze_trade error', error, { userId })
    throw error
  }
}

export async function aiAnalysisGlobalHandler(ctx: McpAuthContext, args: Record<string, unknown>) {
  const startedAt = Date.now()
  const userId = requireUserId(ctx)
  await guardMcpAiRequest(ctx, 'analysis')

  try {
    const locale = String(args.locale || 'en')
    const policy = getAiPolicy('analysis')

    const trades = await prisma.trade.findMany({ where: { userId }, select: { pnl: true, entryDate: true, instrument: true }, take: 10_000 })
    const totalPnl = trades.reduce((s, t) => s + Number(t.pnl || 0), 0)
    const winRate = trades.length ? (trades.filter(t => Number(t.pnl) > 0).length / trades.length * 100).toFixed(1) : '0'

    const prompt = `Provide global trading performance analysis for ${locale}. Total trades: ${trades.length}, Total PnL: ${totalPnl}, Win rate: ${winRate}%. Focus on trends, risk, consistency.`

    const result = await generateText({
      model: getAiLanguageModel('analysis', userId),
      prompt,
      system: 'You are expert trading analyst. Be actionable.',
      temperature: policy.temperature,
    })

    void logAiRequest({
      userId,
      route: 'mcp://ai_analysis_global',
      feature: 'analysis',
      model: policy.model,
      provider: policy.provider,
      usage: extractUsage(result.usage),
      latencyMs: Date.now() - startedAt,
      success: true,
      sampleRate: policy.logSampleRate,
    })

    return { type: 'global', text: result.text, stats: { totalTrades: trades.length, totalPnl, winRate }, usage: result.usage }
  } catch (error) {
    void logAiRequest({ userId, route: 'mcp://ai_analysis_global', feature: 'analysis', model: 'unknown', provider: 'unknown', latencyMs: Date.now() - startedAt, success: false, errorCategory: categorizeAiError(error), errorCode: getAiErrorCode(error), sampleRate: 1 })
    throw new Error('Failed global analysis')
  }
}

export async function aiAnalysisAccountsHandler(ctx: McpAuthContext, args: Record<string, unknown>) {
  const startedAt = Date.now()
  const userId = requireUserId(ctx)
  await guardMcpAiRequest(ctx, 'analysis')

  try {
    const accounts = await prisma.account.findMany({
      where: { userId },
      select: { number: true },
    })

    if (!accounts.length) return { type: 'accounts', text: 'No accounts found', accounts: [] }

    const accountNumbers = accounts.map(a => a.number)
    const tradesByAccount = await prisma.trade.groupBy({
      by: ['accountNumber'],
      where: { accountNumber: { in: accountNumbers }, userId },
      _sum: { pnl: true },
    })

    const data = accounts.map(a => ({
      number: a.number,
      pnl: Number(tradesByAccount.find(t => t.accountNumber === a.number)?._sum?.pnl || 0),
    }))
    const policy = getAiPolicy('analysis')
    const result = await generateText({ model: getAiLanguageModel('analysis'), prompt: `Analyze these accounts performance: ${JSON.stringify(data)}`, temperature: policy.temperature })
    void logAiRequest({ userId, route: 'mcp://ai_analysis_accounts', feature: 'analysis', model: policy.model, provider: policy.provider, usage: extractUsage(result.usage), latencyMs: Date.now()-startedAt, success: true, sampleRate: policy.logSampleRate })
    return { type: 'accounts', text: result.text, accounts: data }
  } catch (error) {
    logAiError('MCP ai_analysis_accounts error', error, { userId })
    void logAiRequest({
      userId,
      route: 'mcp://ai_analysis_accounts',
      feature: 'analysis',
      model: 'unknown',
      provider: 'unknown',
      latencyMs: Date.now() - startedAt,
      success: false,
      errorCategory: categorizeAiError(error),
      errorCode: getAiErrorCode(error),
      sampleRate: 1,
    })
    throw new Error('Failed accounts analysis')
  }
}

export async function aiAnalysisInstrumentHandler(ctx: McpAuthContext, args: Record<string, unknown>) {
  const startedAt = Date.now()
  const userId = requireUserId(ctx)
  await guardMcpAiRequest(ctx, 'analysis')

  try {
    const instrument = String(args.instrument || 'ES')
    const trades = await prisma.trade.findMany({ where: { userId, instrument }, select: { pnl: true, side: true }, take: 10_000 })
    const policy = getAiPolicy('analysis')
    const result = await generateText({ model: getAiLanguageModel('analysis'), prompt: `Analyze performance for instrument ${instrument}. Trades: ${trades.length}. PnL data: ${JSON.stringify(trades.map(t=>Number(t.pnl)))}`, temperature: policy.temperature })
    void logAiRequest({ userId, route: 'mcp://ai_analysis_instrument', feature: 'analysis', model: policy.model, provider: policy.provider, usage: extractUsage(result.usage), latencyMs: Date.now()-startedAt, success: true, sampleRate: policy.logSampleRate })
    return { type: 'instrument', instrument, text: result.text, tradeCount: trades.length }
  } catch (error) {
    logAiError('MCP ai_analysis_instrument error', error, { userId })
    void logAiRequest({
      userId,
      route: 'mcp://ai_analysis_instrument',
      feature: 'analysis',
      model: 'unknown',
      provider: 'unknown',
      latencyMs: Date.now() - startedAt,
      success: false,
      errorCategory: categorizeAiError(error),
      errorCode: getAiErrorCode(error),
      sampleRate: 1,
    })
    throw new Error('Failed instrument analysis')
  }
}

export async function aiAnalysisTimeOfDayHandler(ctx: McpAuthContext, args: Record<string, unknown>) {
  const startedAt = Date.now()
  const userId = requireUserId(ctx)
  await guardMcpAiRequest(ctx, 'analysis')

  try {
    const trades = await prisma.trade.findMany({ where: { userId }, select: { entryDate: true, pnl: true }, take: 10_000 })
    const policy = getAiPolicy('analysis')
    const result = await generateText({ model: getAiLanguageModel('analysis'), prompt: `Analyze time-of-day patterns from these trade entry times and PnL: ${JSON.stringify(trades.slice(0,20))}`, temperature: policy.temperature })
    void logAiRequest({ userId, route: 'mcp://ai_analysis_time_of_day', feature: 'analysis', model: policy.model, provider: policy.provider, usage: extractUsage(result.usage), latencyMs: Date.now()-startedAt, success: true, sampleRate: policy.logSampleRate })
    return { type: 'time-of-day', text: result.text, tradeCount: trades.length }
  } catch (error) {
    logAiError('MCP ai_analysis_time_of_day error', error, { userId })
    void logAiRequest({
      userId,
      route: 'mcp://ai_analysis_time_of_day',
      feature: 'analysis',
      model: 'unknown',
      provider: 'unknown',
      latencyMs: Date.now() - startedAt,
      success: false,
      errorCategory: categorizeAiError(error),
      errorCode: getAiErrorCode(error),
      sampleRate: 1,
    })
    throw new Error('Failed time-of-day analysis')
  }
}

export async function aiSearchDateHandler(ctx: McpAuthContext, args: Record<string, unknown>) {
  const startedAt = Date.now()
  const userId = requireUserId(ctx)
  await guardMcpAiRequest(ctx, 'search')

  try {
    const query = String(args.query || 'last week')
    const policy = getAiPolicy('search')
    const result = await generateText({
      model: getAiLanguageModel('search'),
      prompt: `Parse natural language date query into ISO range or weekdays. Current: ${new Date().toISOString().split('T')[0]}. Query: "${query}". Return JSON {from,to,weekdays}`,
      temperature: 0.1,
    })
    void logAiRequest({ userId, route: 'mcp://ai_search_date', feature: 'search', model: policy.model, provider: policy.provider, usage: extractUsage(result.usage), latencyMs: Date.now()-startedAt, success: true, sampleRate: policy.logSampleRate })
    return { query, parsed: result.text }
  } catch (error) {
    logAiError('MCP ai_search_date error', error, { userId })
    void logAiRequest({
      userId,
      route: 'mcp://ai_search_date',
      feature: 'search',
      model: 'unknown',
      provider: 'unknown',
      latencyMs: Date.now() - startedAt,
      success: false,
      errorCategory: categorizeAiError(error),
      errorCode: getAiErrorCode(error),
      sampleRate: 1,
    })
    throw new Error('Failed date search parse')
  }
}
