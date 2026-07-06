import { generateObject } from "ai";
import { NextRequest } from "next/server";
import { z } from 'zod/v3';
import { journalInsightsRequestSchema, journalInsightsOutputSchema } from "./schema";
import { getAiLanguageModel, checkAiConfig } from "@/lib/ai/client";
import { getAiPolicy } from "@/lib/ai/policy";
import { categorizeAiError, extractUsage, logAiRequest } from "@/lib/ai/telemetry";
import { apiError } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import { guardAiRequest } from "@/lib/ai/route-guard";
import { getAiErrorCode, logAiError } from "@/lib/ai/error-utils";
import { isTimeoutError, createAiTimeoutSignal } from "@/lib/ai/timeout";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;
const journalInsightsRateLimit = rateLimit({ limit: 15, window: 60_000, identifier: "ai-journal-insights" });

export async function POST(req: NextRequest) {
  const policy = getAiPolicy("journal-insights");
  const startedAt = Date.now();

  const configCheck = checkAiConfig();
  if (!configCheck.ok) return configCheck.response;

  const guard = await guardAiRequest(req, 'journal-insights', journalInsightsRateLimit);
  if (!guard.ok) return guard.response;
  const { userId } = guard;

  try {
    const body = await req.json();
    const parsed = journalInsightsRequestSchema.parse(body);

    // Fetch data: trades + linked journal entries + moods for the period. Token-efficient, user-isolated.
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - parsed.periodDays);

    const [trades, journalEntries, moods] = await Promise.all([
      prisma.trade.findMany({
        where: {
          userId,
          ...(parsed.accountNumber ? { accountNumber: parsed.accountNumber } : {}),
          entryDate: { gte: fromDate },
        },
        orderBy: { entryDate: 'desc' },
        take: 100, // cap for token efficiency
        select: {
          id: true,
          instrument: true,
          side: true,
          quantity: true,
          entryPrice: true,
          closePrice: true,
          pnl: true,
          commission: true,
          entryDate: true,
          closeDate: true,
          comment: true,
          tags: true,
          journal: {
            select: {
              preTradeNotes: true,
              postTradeReview: true,
              emotions: true,
              confidenceRating: true,
              disciplineScore: true,
            },
          },
        },
      }),
      prisma.journalEntry.findMany({
        where: {
          userId,
          createdAt: { gte: fromDate },
          ...(parsed.accountNumber ? { accountNumber: parsed.accountNumber } : {}),
        },
        take: 50,
        select: {
          preTradeNotes: true,
          postTradeReview: true,
          emotions: true,
          trade: {
            select: { pnl: true, instrument: true, tags: true, comment: true },
          },
        },
      }),
      prisma.mood.findMany({
        where: { userId, day: { gte: fromDate } },
        orderBy: { day: 'desc' },
        take: 30,
        select: { day: true, emotionValue: true },
      }),
    ]);

    if (trades.length === 0 && journalEntries.length === 0) {
      return apiError("NO_DATA", "No trades or journal entries found in the selected period for AI analysis.", 400);
    }

    // Build compact, token-efficient context (never dump everything blindly; summarize patterns + samples).
    const context = {
      periodDays: parsed.periodDays,
      totalTrades: trades.length,
      sampleTrades: trades.slice(0, 8).map(t => ({
        instrument: t.instrument,
        side: t.side,
        pnl: Number(t.pnl),
        tags: t.tags,
        comment: t.comment?.slice(0, 200),
        journal: t.journal ? {
          pre: t.journal.preTradeNotes?.slice(0, 150),
          post: t.journal.postTradeReview?.slice(0, 150),
          emotions: t.journal.emotions,
        } : null,
      })),
      journalSamples: journalEntries.slice(0, 5).map(j => ({
        pre: j.preTradeNotes?.slice(0, 120),
        post: j.postTradeReview?.slice(0, 120),
        emotions: j.emotions,
        tradePnl: j.trade ? Number(j.trade.pnl) : null,
      })),
      moodTrend: moods.slice(0, 7).map(m => ({ day: m.day.toISOString().slice(0,10), emotion: m.emotionValue })),
    };

    const prompt = `You are an expert trading psychologist and performance coach. Analyze the provided trading data, journal entries, comments, emotions, and mood trends.

Focus on cross-referencing:
- Journal pre/post notes and emotions with actual PnL, tags, instrument, hold time.
- Recurring behavioral patterns, cognitive biases (FOMO, revenge, overconfidence, loss aversion), discipline lapses.
- Correlations between emotional state (from moods/journal) and trade outcomes.
- Strengths and actionable improvements.

Data (compact, recent first):
${JSON.stringify(context, null, 2)}

Return ONLY valid JSON matching the schema. Be specific, evidence-based, and actionable. If data is limited, note lower confidence.`;

    const timeoutSignal = createAiTimeoutSignal(policy.timeoutMs);
    const result = await generateObject({
      model: getAiLanguageModel("journal-insights", userId),
      schema: journalInsightsOutputSchema,
      prompt,
      temperature: policy.temperature,
      abortSignal: timeoutSignal,
    });

    const output = result.object;

    void logAiRequest({
      userId,
      route: "/api/ai/journal-insights",
      feature: "journal-insights",
      model: policy.model,
      provider: policy.provider,
      usage: extractUsage(result.usage),
      latencyMs: Date.now() - startedAt,
      toolCallsCount: 0,
      success: true,
      finishReason: "completed",
      sampleRate: policy.logSampleRate,
    });

    return new Response(JSON.stringify({
      ...output,
      periodDays: parsed.periodDays,
      analyzedAt: new Date().toISOString(),
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return apiError("VALIDATION_FAILED", "Invalid request for journal insights", 400, { issues: error.errors });
    }
    if (isTimeoutError(error)) {
      return apiError("TIMEOUT", `AI journal insights timed out after ${Math.round(policy.timeoutMs / 1000)}s`, 504, { timeoutMs: policy.timeoutMs });
    }

    logAiError("Error in journal-insights route", error, { userId });
    void logAiRequest({
      userId,
      route: "/api/ai/journal-insights",
      feature: "journal-insights",
      model: policy.model,
      provider: policy.provider,
      latencyMs: Date.now() - startedAt,
      success: false,
      errorCategory: categorizeAiError(error),
      errorCode: getAiErrorCode(error),
      sampleRate: 1,
    });

    const err = error as { statusCode?: number };
    if (err?.statusCode === 429) {
      return apiError("RATE_LIMITED", "AI service busy. Try again later.", 429);
    }
    return apiError("INTERNAL_ERROR", "Failed to generate journal insights", 500);
  }
}