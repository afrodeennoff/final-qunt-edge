import { NextRequest } from "next/server";
import { z } from "zod/v3";
import { rateLimit } from "@/lib/rate-limit";
import { getAiPolicy } from "@/lib/ai/policy";
import { categorizeAiError, logAiRequest } from "@/lib/ai/telemetry";
import { guardAiRequest } from "@/lib/ai/route-guard";
import { apiError } from "@/lib/api-response";
import { getAiErrorCode, logAiError } from "@/lib/ai/error-utils";
import { isTimeoutError } from "@/lib/ai/timeout";

// Wrapper for accounts analysis - delegates to shared handler
const accountsAnalysisRateLimit = rateLimit({ 
  limit: 10, 
  window: 60_000, 
  identifier: "ai-analysis-accounts" 
});

// Schema for accounts analysis (compatible with old API)
const accountsSchema = z.object({
  messages: z.array(z.any()).min(1),
  username: z.string().optional(),
  locale: z.string().default("en"),
  timezone: z.string().default("UTC"),
  currentTime: z.string().default(new Date().toISOString()),
});

export const maxDuration = 300;

// Import shared handler
import { handleAccountsAnalysis } from "../../analyze/handlers";
import { getEnv } from "@/lib/env";

export async function POST(req: NextRequest) {
  const policy = getAiPolicy("analysis");
  const startedAt = Date.now();

  // Check if AI is properly configured
  const aiApiKey = getEnv().AI_PROVIDER_API_KEY || getEnv().OPENROUTER_API_KEY;

  if (!aiApiKey || aiApiKey.trim() === "" || aiApiKey.includes("your_")) {
    return apiError(
      "SERVICE_UNAVAILABLE",
      "AI service is not configured. Please contact support.",
      503,
      {
        type: "ai_not_configured",
        message: "AI_PROVIDER_API_KEY is not set"
      }
    );
  }

  // Apply AI route guard (auth + entitlements + rate limit)
  const guard = await guardAiRequest(req, "analysis", accountsAnalysisRateLimit);
  if (!guard.ok) return guard.response;
  const { userId } = guard;

  try {
    const body = await req.json();
    const validatedData = accountsSchema.parse(body);

    // Transform to unified format
    const unifiedData = {
      type: "accounts" as const,
      messages: validatedData.messages,
      username: validatedData.username,
      locale: validatedData.locale,
      timezone: validatedData.timezone,
      currentTime: validatedData.currentTime,
    };

    // Delegate to shared handler
    return handleAccountsAnalysis(unifiedData, policy, startedAt, userId, "/api/ai/analysis/accounts");
  } catch (error) {
    if (isTimeoutError(error)) {
      void logAiRequest({
        userId,
        route: "/api/ai/analysis/accounts",
        feature: "analysis",
        model: policy.model,
        provider: policy.provider,
        latencyMs: policy.timeoutMs,
        success: false,
        errorCategory: "model_timeout",
        errorCode: "TIMEOUT",
        sampleRate: 1,
      });
      logAiError("[Accounts Analysis] AI request timed out", error, { userId, timeoutMs: policy.timeoutMs });
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
      return apiError("VALIDATION_FAILED", "Invalid analysis request payload", 400, {
        issues: error.errors,
      });
    }

    void logAiRequest({
      userId,
      route: "/api/ai/analysis/accounts",
      feature: "analysis",
      model: policy.model,
      provider: policy.provider,
      latencyMs: Date.now() - startedAt,
      success: false,
      errorCategory: categorizeAiError(error),
      errorCode: getAiErrorCode(error),
      sampleRate: 1,
    });

    logAiError("Error in account analysis route", error, { userId });
    return apiError("INTERNAL_ERROR", "Failed to process account analysis", 500);
  }
}