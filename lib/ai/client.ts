import { createOpenAI } from "@ai-sdk/openai";
import type { AiFeature } from "./policy";
import { getAiPolicy } from "./policy";
import { cacheAiResponse, setAiResponseCache, getAiCacheStats, resetAiCacheStats } from "./cache";
import type { LanguageModelV3, LanguageModelV3CallOptions } from "@ai-sdk/provider";
import { getEnv } from "@/lib/env";

function getProviderBaseUrl(): string | undefined {
  return getEnv().AI_PROVIDER_BASE_URL || getEnv().AI_BASE_URL || undefined;
}

function getProviderApiKey(): string | undefined {
  return getEnv().AI_PROVIDER_API_KEY || getEnv().OPENROUTER_API_KEY || getEnv().OPENAI_API_KEY;
}

function getDefaultModel(): string | undefined {
  return getEnv().AI_DEFAULT_MODEL || getEnv().AI_MODEL_DEFAULT || getEnv().AI_MODEL || undefined;
}

function getAnalyticsModel(): string | undefined {
  return getEnv().AI_ANALYTICS_MODEL || getEnv().AI_MODEL_ANALYSIS || getDefaultModel();
}

let hasWarnedMissingApiKey = false;
let hasWarnedMissingBaseUrl = false;
let hasWarnedMissingModel = false;

let aiClient: ReturnType<typeof createOpenAI> | null = null;

function getAiClient(): ReturnType<typeof createOpenAI> {
  if (!aiClient) {
    const baseURL = getProviderBaseUrl();
    const apiKey = getProviderApiKey();

    if (!apiKey) {
      throw new Error("[AI] AI_PROVIDER_API_KEY is not configured. Cannot create AI client.");
    }

    console.log(`[AI] Initializing client — baseURL: ${baseURL || "(default)"}, model: ${getDefaultModel() || "(none)"}`);

    aiClient = createOpenAI({
      baseURL: baseURL || undefined,
      apiKey: apiKey,
    });
  }
  return aiClient;
}

export function validateAiConfig() {
  const errors: string[] = [];
  const effectiveApiKey = getProviderApiKey();
  const effectiveBaseUrl = getProviderBaseUrl();
  const effectiveModel = getDefaultModel();

  if (!effectiveApiKey || effectiveApiKey.trim() === "" || effectiveApiKey.includes("your_")) {
    errors.push(
      "AI_PROVIDER_API_KEY (or legacy OPENROUTER_API_KEY) is not configured. Set a valid API key in environment variables.",
    );
  }

  if (!effectiveBaseUrl || effectiveBaseUrl.trim() === "") {
    errors.push("AI_PROVIDER_BASE_URL is not configured. The provider's default URL will be used.");
  }

  if (!effectiveModel || effectiveModel.trim() === "") {
    errors.push("AI_DEFAULT_MODEL is not configured.");
  }

  if (errors.length > 0 && !hasWarnedMissingApiKey) {
    console.warn("[AI] Configuration issues detected:");
    errors.forEach(err => console.warn(`  - ${err}`));
    console.warn("[AI] AI features will not work until these are fixed.");
    hasWarnedMissingApiKey = true;
  }

  return {
    isValid: !!effectiveApiKey && effectiveApiKey.trim() !== "" && !effectiveApiKey.includes("your_") && !!effectiveModel && effectiveModel.trim() !== "",
    errors,
  };
}

export function assertAiConfigured(): void {
  const { isValid } = validateAiConfig();
  if (!isValid) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "[AI] AI_PROVIDER_API_KEY and/or AI_DEFAULT_MODEL are not configured. AI features are unavailable in production.",
      );
    }
    if (!hasWarnedMissingApiKey) {
      console.warn("[AI] AI_PROVIDER_API_KEY and/or AI_DEFAULT_MODEL are missing or invalid. AI routes will fail.");
      console.warn("[AI] To fix: Add valid AI_PROVIDER_API_KEY and AI_DEFAULT_MODEL to your environment variables.");
      hasWarnedMissingApiKey = true;
    }
  }
}

export function getDefaultModelId(): string | undefined {
  return getDefaultModel();
}

export function getAnalyticsModelId(): string | undefined {
  return getAnalyticsModel();
}

export function getAiLanguageModel(feature: AiFeature, userId?: string) {
  assertAiConfigured();

  if (!getProviderBaseUrl() && !hasWarnedMissingBaseUrl) {
    console.warn(`[AI] AI_PROVIDER_BASE_URL not set, defaulting to provider's native URL.`);
    hasWarnedMissingBaseUrl = true;
  }

  const { model } = getAiPolicy(feature);

  if (!model && !hasWarnedMissingModel) {
    console.warn(`[AI] No model configured for feature "${feature}". Check AI_DEFAULT_MODEL in your environment.`);
    hasWarnedMissingModel = true;
  }

  const rawModel = getAiClient().chat(model);

   return new Proxy(rawModel, {
     get(target, p: PropertyKey, receiver: object) {
       if (p === 'doGenerate') {
         return async function(options: LanguageModelV3CallOptions) {
           const featureStr = String(feature);

             const cached = await cacheAiResponse(featureStr, options, userId);
             if (cached !== null) {
               return cached;
             }

             const result = await Reflect.get(target, p, receiver)(options);

             await setAiResponseCache(featureStr, options, result, userId);

            return result;
          };
        }

        return Reflect.get(target, p, receiver);
      }
    }) as LanguageModelV3;
}

export function getTranscribeModelId(): string {
  return getEnv().AI_TRANSCRIBE_MODEL || "whisper-1";
}

export function checkAiConfig():
  | { ok: true }
  | { ok: false; response: Response } {
  const { isValid } = validateAiConfig();
  if (!isValid) {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({
          error: {
            type: "ai_not_configured",
            code: "SERVICE_UNAVAILABLE",
            message: "AI service is not configured. Please contact support.",
          },
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        },
      ),
    };
  }
  return { ok: true };
}

export { getAiCacheStats, resetAiCacheStats };

export function getAiLanguageModelById(modelId: string) {
  return getAiClient().chat(modelId);
}

export function getAiBaseURL(): string | undefined {
  return getProviderBaseUrl();
}
