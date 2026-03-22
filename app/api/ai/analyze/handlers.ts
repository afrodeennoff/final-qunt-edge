import { convertToModelMessages, streamText, stepCountIs, UIMessage } from "ai";
import { z } from "zod/v3";
import { getAiLanguageModel } from "@/lib/ai/client";
import { getAiPolicy } from "@/lib/ai/policy";
import { categorizeAiError, extractUsage, logAiRequest } from "@/lib/ai/telemetry";
import { apiError } from "@/lib/api-response";
import { getAiErrorCode, logAiError } from "@/lib/ai/error-utils";
import { isTimeoutError, createAiTimeoutSignal } from "@/lib/ai/timeout";

// Analysis Tools - Accounts
import { generateAnalysisComponent } from "../analysis/accounts/generate-analysis-component";
import { getAccountPerformance } from "../analysis/accounts/get-account-performance";

// Analysis Tools - Shared
import { getTimeOfDayPerformance } from "../chat/tools/get-time-of-day-performance";
import { getInstrumentPerformance } from "../chat/tools/get-instrument-performance";
import { getCurrentWeekSummary } from "../chat/tools/get-current-week-summary";
import { getPreviousWeekSummary } from "../chat/tools/get-previous-week-summary";
import { getTradesSummary } from "../chat/tools/get-trades-summary";
import { getMostTradedInstruments } from "../chat/tools/get-most-traded-instruments";

// Analysis Tools - Global (moved from inline route)
import { getOverallPerformanceMetrics } from "../chat/tools/get-overall-performance-metrics";
import { getPerformanceTrends } from "../chat/tools/get-performance-trends";
import { getGlobalAnalysisPrompt } from "@/lib/ai/prompts/analysis";
import { getAccountAnalysisPrompt } from "@/lib/ai/prompts/analysis";
import { getInstrumentAnalysisPrompt } from "@/lib/ai/prompts/analysis";
import { getTimeOfDayAnalysisPrompt } from "@/lib/ai/prompts/analysis";

// Unified schema with type dispatch - all fields optional except type
export const unifiedSchema = z.object({
  type: z.enum(["accounts", "instrument", "time-of-day", "global"]),
  messages: z.array(z.custom<UIMessage>()).optional(),
  username: z.string().optional(),
  locale: z.string().optional().default("en"),
  timezone: z.string().optional().default("UTC"),
  currentTime: z.string().optional().default(new Date().toISOString()),
});

type UnifiedData = z.infer<typeof unifiedSchema>;

// Functions moved to lib/ai/prompts/analysis.ts

// Handler for accounts analysis (returns UIMessage stream)
export async function handleAccountsAnalysis(
  data: UnifiedData,
  policy: ReturnType<typeof getAiPolicy>,
  startedAt: number,
  userId: string,
  route: string
) {
  const modelMessages = await convertToModelMessages(data.messages || []);
  let toolCallsCount = 0;

  const result = streamText({
    model: getAiLanguageModel("analysis"),
    system: getAccountAnalysisPrompt(
      data.locale,
      data.username,
      data.timezone,
      data.currentTime,
    ),
    tools: {
      getAccountPerformance,
      generateAnalysisComponent,
    },
    messages: modelMessages,
    temperature: policy.temperature,
    stopWhen: stepCountIs(policy.maxSteps),
    abortSignal: createAiTimeoutSignal(policy.timeoutMs),
    onStepFinish: (step) => {
      toolCallsCount += step.toolCalls?.length ?? 0;
    },
    onFinish: (finalResult) => {
      void logAiRequest({
        userId,
        route,
        feature: "analysis",
        model: policy.model,
        provider: policy.provider,
        usage: extractUsage(finalResult.usage),
        latencyMs: Date.now() - startedAt,
        toolCallsCount,
        finishReason: finalResult.finishReason ?? null,
        success: true,
        sampleRate: policy.logSampleRate,
      });
    },
    onError: ({ error }) => {
      void logAiRequest({
        userId,
        route,
        feature: "analysis",
        model: policy.model,
        provider: policy.provider,
        latencyMs: Date.now() - startedAt,
        toolCallsCount,
        success: false,
        errorCategory: categorizeAiError(error),
        errorCode: getAiErrorCode(error),
        sampleRate: 1,
      });
    },
  });

  return result.toUIMessageStreamResponse();
}

// Handler for instrument analysis (returns text stream)
export async function handleInstrumentAnalysis(
  data: UnifiedData,
  policy: ReturnType<typeof getAiPolicy>,
  startedAt: number,
  userId: string,
  route: string
) {
  let toolCallsCount = 0;

  const result = streamText({
    model: getAiLanguageModel("analysis"),
    system: getInstrumentAnalysisPrompt(data.locale),
    tools: {
      generateAnalysisComponent,
      getInstrumentPerformance,
      getMostTradedInstruments,
      getTradesSummary,
      getCurrentWeekSummary,
      getPreviousWeekSummary,
    },
    messages: [
      {
        role: "user",
        content: `Analyze my instrument trading performance and provide detailed insights in ${data.locale} language. Use the generateAnalysisComponent tool to create structured analysis components.`,
      },
    ],
    temperature: policy.temperature,
    stopWhen: stepCountIs(policy.maxSteps),
    onStepFinish: (step) => {
      toolCallsCount += step.toolCalls?.length ?? 0;
    },
    onFinish: (finalResult) => {
      void logAiRequest({
        userId,
        route,
        feature: "analysis",
        model: policy.model,
        provider: policy.provider,
        usage: extractUsage(finalResult.usage),
        latencyMs: Date.now() - startedAt,
        toolCallsCount,
        finishReason: finalResult.finishReason ?? null,
        success: true,
        sampleRate: policy.logSampleRate,
      });
    },
    onError: ({ error }) => {
      void logAiRequest({
        userId,
        route,
        feature: "analysis",
        model: policy.model,
        provider: policy.provider,
        latencyMs: Date.now() - startedAt,
        toolCallsCount,
        success: false,
        errorCategory: categorizeAiError(error),
        errorCode: getAiErrorCode(error),
        sampleRate: 1,
      });
    },
  });

  return result.toTextStreamResponse();
}

// Handler for time-of-day analysis (returns text stream)
export async function handleTimeOfDayAnalysis(
  data: UnifiedData,
  policy: ReturnType<typeof getAiPolicy>,
  startedAt: number,
  userId: string,
  route: string
) {
  let toolCallsCount = 0;

  const result = streamText({
    model: getAiLanguageModel("analysis"),
    system: getTimeOfDayAnalysisPrompt(data.locale, data.timezone),
    tools: {
      generateAnalysisComponent,
      getTimeOfDayPerformance,
      getTradesSummary,
      getCurrentWeekSummary,
      getPreviousWeekSummary,
      getMostTradedInstruments,
    },
    messages: [
      {
        role: "user",
        content: `Analyze my time-based trading performance and provide detailed insights in ${data.locale} language. Use the generateAnalysisComponent tool to create structured analysis components.`,
      },
    ],
    temperature: policy.temperature,
    stopWhen: stepCountIs(policy.maxSteps),
    onStepFinish: (step) => {
      toolCallsCount += step.toolCalls?.length ?? 0;
    },
    onFinish: (finalResult) => {
      void logAiRequest({
        userId,
        route,
        feature: "analysis",
        model: policy.model,
        provider: policy.provider,
        usage: extractUsage(finalResult.usage),
        latencyMs: Date.now() - startedAt,
        toolCallsCount,
        finishReason: finalResult.finishReason ?? null,
        success: true,
        sampleRate: policy.logSampleRate,
      });
    },
    onError: ({ error }) => {
      void logAiRequest({
        userId,
        route,
        feature: "analysis",
        model: policy.model,
        provider: policy.provider,
        latencyMs: Date.now() - startedAt,
        toolCallsCount,
        success: false,
        errorCategory: categorizeAiError(error),
        errorCode: getAiErrorCode(error),
        sampleRate: 1,
      });
    },
  });

  return result.toTextStreamResponse();
}

// Handler for global analysis (returns UIMessage stream)
export async function handleGlobalAnalysis(
  data: UnifiedData,
  policy: ReturnType<typeof getAiPolicy>,
  startedAt: number,
  userId: string,
  route: string
) {
  const modelMessages = await convertToModelMessages(data.messages || []);
  let toolCallsCount = 0;

  const result = streamText({
    model: getAiLanguageModel("analysis"),
    system: getGlobalAnalysisPrompt(data.locale),
    tools: {
      generateAnalysisComponent,
      getOverallPerformanceMetrics,
      getPerformanceTrends,
      getTradesSummary,
      getCurrentWeekSummary,
      getPreviousWeekSummary,
      getMostTradedInstruments,
    },
    messages: modelMessages,
    temperature: policy.temperature,
    stopWhen: stepCountIs(policy.maxSteps),
    onStepFinish: (step) => {
      toolCallsCount += step.toolCalls?.length ?? 0;
    },
    onFinish: (finalResult) => {
      void logAiRequest({
        userId,
        route,
        feature: "analysis",
        model: policy.model,
        provider: policy.provider,
        usage: extractUsage(finalResult.usage),
        latencyMs: Date.now() - startedAt,
        toolCallsCount,
        finishReason: finalResult.finishReason ?? null,
        success: true,
        sampleRate: policy.logSampleRate,
      });
    },
    onError: ({ error }) => {
      void logAiRequest({
        userId,
        route,
        feature: "analysis",
        model: policy.model,
        provider: policy.provider,
        latencyMs: Date.now() - startedAt,
        toolCallsCount,
        success: false,
        errorCategory: categorizeAiError(error),
        errorCode: getAiErrorCode(error),
        sampleRate: 1,
      });
    },
  });

  return result.toUIMessageStreamResponse();
}