import { createOpenAI } from "@ai-sdk/openai";
import type { AiFeature } from "./policy";
import { getAiPolicy, DEFAULT_MODEL } from "./policy";
import { cacheAiResponse, setAiResponseCache, getAiCacheStats, resetAiCacheStats } from "./cache";
import type { LanguageModelV3, LanguageModelV3CallOptions } from "@ai-sdk/provider";
import { getEnv } from "@/lib/env";

function getProviderBaseUrl(): string | undefined {
  return getEnv().AI_PROVIDER_BASE_URL || getEnv().AI_BASE_URL || undefined;
}

function getProviderApiKey(): string | undefined {
  return getEnv().AI_PROVIDER_API_KEY || getEnv().OPENROUTER_API_KEY;
}

function getDefaultModel(): string {
  return getEnv().AI_DEFAULT_MODEL || getEnv().AI_MODEL_DEFAULT || getEnv().AI_MODEL || DEFAULT_MODEL;
}

function getAnalyticsModel(): string {
  return getEnv().AI_ANALYTICS_MODEL || getEnv().AI_MODEL_ANALYSIS || getDefaultModel();
}

const baseURL = getProviderBaseUrl();
const aiApiKey = getProviderApiKey();

let hasWarnedMissingApiKey = false;
let hasWarnedMissingBaseUrl = false;

export function validateAiConfig() {
  const errors: string[] = [];
  const effectiveApiKey = getProviderApiKey();
  const effectiveBaseUrl = getProviderBaseUrl();

  if (!effectiveApiKey || effectiveApiKey.trim() === "" || effectiveApiKey.includes("your_")) {
    errors.push(
      "AI_PROVIDER_API_KEY (or legacy OPENROUTER_API_KEY) is not configured. Set a valid API key in environment variables.",
    );
  }

  if (!effectiveBaseUrl || effectiveBaseUrl.trim() === "") {
    errors.push("AI_PROVIDER_BASE_URL is not configured. The provider's default URL will be used.");
  }

  if (errors.length > 0 && !hasWarnedMissingApiKey) {
    console.warn("[AI] Configuration issues detected:");
    errors.forEach(err => console.warn(`  - ${err}`));
    console.warn("[AI] AI features will not work until these are fixed.");
    hasWarnedMissingApiKey = true;
  }

  return {
    isValid: !!effectiveApiKey && effectiveApiKey.trim() !== "" && !effectiveApiKey.includes("your_"),
    errors,
  };
}

export function assertAiConfigured(): void {
  const { isValid, errors } = validateAiConfig();
  if (!isValid) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "[AI] AI_PROVIDER_API_KEY is not configured. AI features are unavailable in production without a valid API key.",
      );
    }
    if (!hasWarnedMissingApiKey) {
      console.warn("[AI] AI_PROVIDER_API_KEY is missing or invalid. AI routes will fail.");
      console.warn("[AI] To fix: Add a valid AI_PROVIDER_API_KEY to your environment variables.");
      hasWarnedMissingApiKey = true;
    }
  }
}

const aiClient = createOpenAI({
  baseURL: baseURL || undefined,
  apiKey: aiApiKey || "dummy-key-for-validation",
  headers: {
    "HTTP-Referer": getEnv().NEXT_PUBLIC_APP_URL || "https://quntedge.com",
    "X-Title": "Qunt Edge",
  },
});

export const primaryModel = aiClient(getDefaultModel());
export const analyticsModel = aiClient(getAnalyticsModel());

export function getDefaultModelId(): string {
  return getDefaultModel();
}

export function getAnalyticsModelId(): string {
  return getAnalyticsModel();
}

function normalizeModelForOpenRouter(model: string): string {
  const trimmed = model.trim();
  if (!trimmed) return normalizeModelForOpenRouter(DEFAULT_MODEL);
  if (trimmed.includes("/")) return trimmed;
  if (trimmed.startsWith("gpt-") || trimmed.startsWith("o1") || trimmed.startsWith("o3")) {
    return `openai/${trimmed}`;
  }
  if (trimmed.startsWith("glm-")) {
    return `zai/${trimmed}`;
  }
  if (trimmed.startsWith("gemini-") || trimmed.startsWith("gemma-")) {
    return `google/${trimmed}`;
  }
  if (trimmed.startsWith("claude-")) {
    return `anthropic/${trimmed}`;
  }
  if (trimmed.startsWith("llama-") || trimmed.startsWith("llama3") || trimmed.startsWith("llama-3")) {
    return `meta-llama/${trimmed}`;
  }
  if (trimmed.startsWith("mistral-") || trimmed.startsWith("mixtral-")) {
    return `mistralai/${trimmed}`;
  }
  return trimmed;
}

export function getAiLanguageModel(feature: AiFeature, userId?: string) {
  assertAiConfigured();

  if (!getProviderBaseUrl() && !hasWarnedMissingBaseUrl) {
    console.warn(`[AI] AI_PROVIDER_BASE_URL not set, defaulting to provider's native URL.`);
    hasWarnedMissingBaseUrl = true;
  }

  const { model } = getAiPolicy(feature);
  const rawModel = aiClient(normalizeModelForOpenRouter(model));

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

export { getAiCacheStats, resetAiCacheStats };

export function getAiLanguageModelById(modelId: string) {
  return aiClient(normalizeModelForOpenRouter(modelId));
}

export function getAiBaseURL(): string {
  return getProviderBaseUrl() || "https://openrouter.ai/api/v1";
}
