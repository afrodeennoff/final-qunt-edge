import { NextRequest } from 'next/server'
import { streamText, stepCountIs } from 'ai'
import { z } from 'zod/v3'
import { getAiLanguageModel, checkAiConfig } from '@/lib/ai/client'
import { guardAiRequest } from '@/lib/ai/route-guard'
import { getAiPolicy } from '@/lib/ai/policy'
import { apiError } from '@/lib/api-response'
import { rateLimit } from '@/lib/rate-limit'
import { isTimeoutError, createAiTimeoutSignal } from '@/lib/ai/timeout'
import { logAiError } from '@/lib/ai/error-utils'
import { categorizeAiError, logAiRequest } from '@/lib/ai/telemetry'

export const maxDuration = 60

const insightRateLimit = rateLimit({ limit: 10, window: 60_000, identifier: 'ai-statistics-insight' })

const metricsSchema = z.object({
  grandTotal: z.number(),
  grandWinRate: z.number(),
  grandPnl: z.number(),
  profitFactor: z.number(),
  avgRR: z.number(),
  avgWin: z.number(),
  avgLoss: z.number(),
  maxConsecWins: z.number(),
  maxConsecLosses: z.number(),
  grossProfit: z.number(),
  grossLoss: z.number(),
  expectancy: z.number(),
  bestDay: z.number(),
  worstDay: z.number(),
})

const requestSchema = z.object({
  metrics: metricsSchema,
})

function buildPrompt(metrics: z.infer<typeof metricsSchema>): string {
  const {
    grandTotal, grandWinRate, grandPnl, profitFactor, avgRR,
    avgWin, avgLoss, maxConsecWins, maxConsecLosses,
    grossProfit, grossLoss, expectancy, bestDay, worstDay,
  } = metrics

  return `Analyze this trader's recent performance and provide 3-5 specific, actionable insights. Keep each insight under 2 sentences. Format as a bullet list with **bold** key metrics.

**Performance Snapshot:**
- Total trades: ${grandTotal}
- Win rate: ${grandWinRate.toFixed(1)}%
- Total PnL: ${grandPnl >= 0 ? '+' : ''}$${grandPnl.toFixed(2)}
- Profit factor: ${profitFactor.toFixed(2)}
- Avg R: ${avgRR.toFixed(2)}R
- Avg win: +$${avgWin.toFixed(2)} | Avg loss: -$${Math.abs(avgLoss).toFixed(2)}
- Win/loss streaks: ${maxConsecWins}W / ${maxConsecLosses}L
- Gross profit/loss: +$${grossProfit.toFixed(2)} / -$${Math.abs(grossLoss).toFixed(2)}
- Expectancy: ${expectancy >= 0 ? '+' : ''}$${expectancy.toFixed(2)}
- Best/worst day: +$${bestDay.toFixed(2)} / -$${Math.abs(worstDay).toFixed(2)}

Focus on:
1. What they're doing well (strengths to reinforce)
2. Weaknesses or patterns hurting performance
3. Specific, measurable next steps
4. Risk management observations
5. Psychological patterns (tilt, overconfidence, fear)`
}

export async function POST(req: NextRequest) {
  try {
    const configCheck = checkAiConfig()
    if (!configCheck.ok) return configCheck.response!

    const guard = await guardAiRequest(req, 'chat', insightRateLimit)
    if (!guard.ok) return guard.response

    const { userId } = guard

    const body = await req.json()
    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) {
      return apiError('BAD_REQUEST', 'Invalid metrics data', 400)
    }

    const policy = getAiPolicy('chat')
    const model = getAiLanguageModel('chat', userId)
    const prompt = buildPrompt(parsed.data.metrics)

    const result = streamText({
      model,
      system: 'You are a brutally honest trading mentor. Analyze the trader data and provide direct, unfiltered, actionable insights. Call out weaknesses, poor decisions, and dangerous patterns without sugar-coating. Praise genuine strengths but keep it short. Be specific, use bold (**) for key numbers. No fluff, no empathy padding. If the data shows bad habits, say so.',
      messages: [{ role: 'user', content: prompt }],
      stopWhen: stepCountIs(1),
      temperature: 0.4,
      abortSignal: createAiTimeoutSignal(policy.timeoutMs),
      onFinish: async (res) => {
        try {
          await logAiRequest({
            userId,
            route: '/api/ai/statistics-insight',
            feature: 'statistics-insight',
            model: policy.model,
            provider: policy.provider ?? 'openai',
            usage: res.usage,
            latencyMs: 0,
            success: true,
          })
        } catch {}
      },
      onError: (err) => {
        logAiError('statistics-insight error', err)
      },
    })

    return result.toTextStreamResponse()
  } catch (err) {
    if (isTimeoutError(err) || categorizeAiError(err) === 'model_timeout') {
      return apiError('GATEWAY_TIMEOUT', 'AI analysis timed out. Please try again.', 504)
    }
    const category = categorizeAiError(err)
    const status = category === 'rate_limit' ? 429 : category === 'validation' ? 400 : category === 'budget_exceeded' ? 402 : 500
    logAiError('statistics-insight error', err)
    return apiError('AI_ERROR', 'Analysis failed. Please try again.', status)
  }
}
