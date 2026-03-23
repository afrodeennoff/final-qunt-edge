import { createOpenAI } from "@ai-sdk/openai";
import type { AiFeature } from "@/lib/ai/policy";
import { getAiPolicy } from "@/lib/ai/policy";
import { cacheAiResponse, setAiResponseCache, getAiCacheStats, resetAiCacheStats } from "@/lib/ai/cache";

const baseURL = process.env.AI_BASE_URL || "https://openrouter.ai/api/v1";
const aiApiKey = process.env.OPENROUTER_API_KEY;

let hasWarnedMissingApiKey = false;
let hasWarnedMissingBaseUrl = false;

const aiClient = createOpenAI({
  baseURL,
  apiKey: aiApiKey,
  headers: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://quntedge.com",
    "X-Title": "Qunt Edge",
  },
});

function normalizeModelForOpenRouter(model: string): string {
  const trimmed = model.trim();
  if (!trimmed || trimmed.includes("/")) return trimmed;
  if (trimmed.startsWith("gpt-") || trimmed.startsWith("o1") || trimmed.startsWith("o3")) {
    return `openai/${trimmed}`;
  }
  if (trimmed.startsWith("glm-")) {
    return `zai/${trimmed}`;
  }
  return trimmed;
}

// Enhanced AI language model with caching (only for non-streaming generations)
export function getAiLanguageModel(feature: AiFeature) {
  if (!aiApiKey && !hasWarnedMissingApiKey) {
    console.warn("[AI] OPENROUTER_API_KEY is missing. AI routes will fail until it is configured.");
    hasWarnedMissingApiKey = true;
  }

  if (!process.env.AI_BASE_URL && !hasWarnedMissingBaseUrl) {
    console.warn(`[AI] AI_BASE_URL not set, defaulting to OpenRouter: ${baseURL}`);
    hasWarnedMissingBaseUrl = true;
  }

  const { model } = getAiPolicy(feature);
  const rawModel = aiClient(normalizeModelForOpenRouter(model));
  
  // Return a wrapped model that adds caching for doGenerate only
  return new Proxy(rawModel, {
    get(target, p: string | symbol, receiver: any) {
      // If it's a method we want to wrap for caching, return our cached version
      if (p === 'doGenerate') {
        return async function(options: Parameters<typeof target['doGenerate']>[0]) {
          // Generate cache key based on feature and options
          const featureStr = String(feature);
          
          // Try to get from cache first
          const cached = await cacheAiResponse(featureStr, options);
          if (cached !== null) {
            return cached;
          }
          
          // Not in cache, call the original method
          const result = await Reflect.get(target, p, receiver)(options);
          
          // Cache the result (with a default TTL of 5 minutes)
          await setAiResponseCache(featureStr, options, result);
          
          return result;
        }.bind(this);
      }
      
      // For all other properties/methods (including doStream), delegate to the target
      return Reflect.get(target, p, receiver);
    }
  });
}

// Cache statistics export
export { getAiCacheStats, resetAiCacheStats };

export function getAiLanguageModelById(modelId: string) {
  return aiClient(normalizeModelForOpenRouter(modelId));
}

export function getAiBaseURL(): string {
  return baseURL;
}