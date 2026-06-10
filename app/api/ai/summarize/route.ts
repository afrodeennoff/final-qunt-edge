import { streamText, stepCountIs } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v3";
import { getAiLanguageModel, checkAiConfig } from "@/lib/ai/client";
import { getAiPolicy } from "@/lib/ai/policy";
import { categorizeAiError, extractUsage, logAiRequest } from "@/lib/ai/telemetry";
import { rateLimit } from "@/lib/rate-limit";
import { guardAiRequest } from "@/lib/ai/route-guard";
import { apiError } from "@/lib/api-response";
import { getAiErrorCode, logAiError } from "@/lib/ai/error-utils";
import { isTimeoutError, createAiTimeoutSignal } from "@/lib/ai/timeout"
import { detectPromptInjection } from "@/lib/ai/prompt-safety";

export const maxDuration = 60;
const summarizeRateLimit = rateLimit({ limit: 10, window: 60_000, identifier: "ai-summarize" });

const summarizeRequestSchema = z.object({
  content: z.string().min(10, "Content must be at least 10 characters"),
  locale: z.string().optional().default("en"),
});

export async function POST(req: NextRequest) {
  const policy = getAiPolicy("editor");
  const startedAt = Date.now();

  const configCheck = checkAiConfig();
  if (!configCheck.ok) return configCheck.response;

  // Apply AI route guard (auth + entitlements + rate limit)
  const guard = await guardAiRequest(req, 'editor', summarizeRateLimit);
  if (!guard.ok) return guard.response;
  const { userId } = guard;

  try {
    const body = await req.json();
    const { content, locale } = summarizeRequestSchema.parse(body);

    // Apply prompt safety check
    const injectionCheck = detectPromptInjection(content);
    if (injectionCheck.isInjection) {
      return NextResponse.json(
        { error: { code: "PROMPT_INJECTION", message: "Potential prompt injection detected." } },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert trading journal assistant.
TASK: Summarize the provided trading note in a concise and insightful way.
- Return 2-4 bullet points maximum
- Each bullet should be a single sentence
- Focus on key insights, lessons learned, and action items
- Use ${locale} language
- Keep formatting simple with no markdown
- Return ONLY the summary with no preface or explanation`;

    let toolCallsCount = 0;

    const result = streamText({
      model: getAiLanguageModel("editor"),
      prompt: content,
      system: systemPrompt,
      temperature: 0.3,
      stopWhen: stepCountIs(policy.maxSteps),
      abortSignal: createAiTimeoutSignal(policy.timeoutMs),
      onStepFinish: (step) => {
        toolCallsCount += step.toolCalls?.length ?? 0;
      },
      onFinish: (finalResult) => {
        void logAiRequest({
          userId,
          route: "/api/ai/summarize",
          feature: "editor",
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
          route: "/api/ai/summarize",
          feature: "editor",
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

    return result.toUIMessageStreamResponse({
      onError: (error) => {
        logAiError("[Summarize Route] UI Stream error", error, { userId });
        return "An error occurred while generating the summary";
      },
    });
  } catch (error) {
    if (isTimeoutError(error)) {
      void logAiRequest({
        userId,
        route: "/api/ai/summarize",
        feature: "editor",
        model: policy.model,
        provider: policy.provider,
        latencyMs: policy.timeoutMs,
        success: false,
        errorCategory: "model_timeout",
        errorCode: "TIMEOUT",
        sampleRate: 1,
      });
      logAiError("[Summarize Route] AI request timed out", error, { userId, timeoutMs: policy.timeoutMs });
      return apiError(
        "TIMEOUT",
        `AI request timed out after ${Math.round(policy.timeoutMs / 1000)}s`,
        504,
        { timeoutMs: policy.timeoutMs },
        { "Retry-After": String(Math.ceil(policy.timeoutMs / 1000)) },
      );
    }

    if (error instanceof SyntaxError) {
      return apiError("BAD_REQUEST", "Malformed JSON request body", 400);
    }

    if (error instanceof z.ZodError) {
      return apiError("VALIDATION_FAILED", "Invalid summarize request payload", 400, {
        issues: error.errors,
      });
    }

    void logAiRequest({
      userId,
      route: "/api/ai/summarize",
      feature: "editor",
      model: policy.model,
      provider: policy.provider,
      latencyMs: Date.now() - startedAt,
      success: false,
      errorCategory: categorizeAiError(error),
      errorCode: getAiErrorCode(error),
      sampleRate: 1,
    });

    logAiError("Error in summarize route", error, { userId });
    return apiError("INTERNAL_ERROR", "Failed to generate summary", 500);
  }
}
