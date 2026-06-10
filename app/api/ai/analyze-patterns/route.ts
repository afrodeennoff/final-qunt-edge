import { generateObject } from "ai";
import { NextRequest } from "next/server";
import { z } from 'zod/v3';
import { analyzePatternsRequestSchema, analyzePatternsOutputSchema } from "./schema";
import { getAiLanguageModel, checkAiConfig } from "@/lib/ai/client";
import { getAiPolicy } from "@/lib/ai/policy";
import { categorizeAiError, extractUsage, logAiRequest } from "@/lib/ai/telemetry";
import { apiError } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import { guardAiRequest } from "@/lib/ai/route-guard";
import { getAiErrorCode, logAiError } from "@/lib/ai/error-utils";
import { isTimeoutError, createAiTimeoutSignal } from "@/lib/ai/timeout";
import { prisma } from "@/lib/prisma";

export const maxDuration = 45;
const analyzePatternsRateLimit = rateLimit({ limit: 20, window: 60_000, identifier: "ai-analyze-patterns" });

export async function POST(req: NextRequest) {
  const policy = getAiPolicy("analyze-patterns");
  const startedAt = Date.now();

  const configCheck = checkAiConfig();
  if (!configCheck.ok) return configCheck.response;

  const guard = await guardAiRequest(req, 'analyze-patterns', analyzePatternsRateLimit);
  if (!guard.ok) return guard.response;
  const { userId } = guard;

  try {
    const body = await req.json();
    const parsed = analyzePatternsRequestSchema.parse(body);

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - parsed.periodDays);

    // Reuse similar fetch as behavior insights + journal for rich patterns.
    const [trades, moods] = await Promise.all([
      prisma.trade.findMany({
        where: { userId, entryDate: { gte: fromDate.toISOString() } },
        orderBy: { entryDate: 'asc' },
        select: {
          entryDate: true, pnl: true, commission: true, instrument: true,
          tags: true, comment: true, timeInPosition: true,
        },
      }),
      prisma.mood.findMany({
        where: { userId, day: { gte: fromDate } },
        orderBy: { day: 'asc' },
        select: { day: true, emotionValue: true },
      }),
    ]);

    if (trades.length < 5) {
      return apiError("INSUFFICIENT_DATA", "Need at least 5 trades for reliable pattern analysis.", 400);
    }

    const context = {
      periodDays: parsed.periodDays,
      groupBy: parsed.groupBy,
      tradeCount: trades.length,
      sample: trades.slice(0, 12),
      moodSample: moods.slice(0, 7),
    };

    const prompt = `Analyze this trading data for patterns. Group by ${parsed.groupBy}. Identify time-of-day, instrument, tag/strategy, hold-time, and emotional (mood/journal comments) correlations with PnL/winrate outcomes.

Data (samples):
${JSON.stringify(context, null, 2)}

Provide a concise narrative + top correlations with evidence and recs. Use only the data provided.`;

    const timeoutSignal = createAiTimeoutSignal(policy.timeoutMs);
    const result = await generateObject({
      model: getAiLanguageModel("analyze-patterns", userId),
      schema: analyzePatternsOutputSchema,
      prompt,
      temperature: policy.temperature,
      abortSignal: timeoutSignal,
    });

    void logAiRequest({
      userId,
      route: "/api/ai/analyze-patterns",
      feature: "analyze-patterns",
      model: policy.model,
      provider: policy.provider,
      usage: extractUsage(result.usage),
      latencyMs: Date.now() - startedAt,
      success: true,
      sampleRate: policy.logSampleRate,
    });

    return new Response(JSON.stringify({ ...result.object, analyzedAt: new Date().toISOString() }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) return apiError("VALIDATION_FAILED", "Invalid patterns request", 400);
    if (isTimeoutError(error)) return apiError("TIMEOUT", "Pattern analysis timed out", 504);
    logAiError("analyze-patterns error", error, { userId });
    return apiError("INTERNAL_ERROR", "Failed to analyze patterns", 500);
  }
}