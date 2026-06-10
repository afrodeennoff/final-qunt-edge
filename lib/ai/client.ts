import { createOpenAI } from "@ai-sdk/openai";
import type { AiFeature } from "./policy";
import { getAiPolicy, DEFAULT_MODEL } from "./policy";
import { cacheAiResponse, setAiResponseCache, getAiCacheStats, resetAiCacheStats } from "./cache";
import type { LanguageModelV3, LanguageModelV3CallOptions } from "@ai-sdk/provider";
import { getEnv } from "@/lib/env";

const baseURL = getEnv().AI_BASE_URL || "https://openrouter.ai/api/v1";
const aiApiKey = getEnv().OPENROUTER_API_KEY;

let hasWarnedMissingApiKey = false;
let hasWarnedMissingBaseUrl = false;

function validateAiConfig() {
  const errors = [];

  if (!aiApiKey || aiApiKey.trim() === "" || aiApiKey.includes("your_")) {
    errors.push("OPENROUTER_API_KEY is not configured. Set a valid API key in environment variables.");
  }

  if (!baseURL || baseURL.trim() === "") {
    errors.push("AI_BASE_URL is not configured. Using default: https://openrouter.ai/api/v1");
  }

  if (errors.length > 0 && !hasWarnedMissingApiKey) {
    console.warn("[AI] Configuration issues detected:");
    errors.forEach(err => console.warn(`  - ${err}`));
    console.warn("[AI] AI features will not work until these are fixed.");
    hasWarnedMissingApiKey = true;
  }

  return {
    isValid: aiApiKey && aiApiKey.trim() !== "" && !aiApiKey.includes("your_"),
    errors,
  };
}

const aiClient = createOpenAI({
  baseURL,
  apiKey: aiApiKey || "dummy-key-for-validation",
  headers: {
    "HTTP-Referer": getEnv().NEXT_PUBLIC_APP_URL || "https://quntedge.com",
    "X-Title": "Qunt Edge",
  },
});

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

// Enhanced AI language model with caching (only for non-streaming generations)
export function getAiLanguageModel(feature: AiFeature, userId?: string) {
  const config = validateAiConfig();

  if (!config.isValid) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[AI] OPENROUTER_API_KEY is not configured. AI features are unavailable in production without a valid API key.')
    }
    if (!hasWarnedMissingApiKey) {
      console.warn("[AI] OPENROUTER_API_KEY is missing or invalid. AI routes will fail.");
      console.warn("[AI] To fix: Add a valid OPENROUTER_API_KEY to your environment variables.");
      hasWarnedMissingApiKey = true;
    }
  }

  if (!getEnv().AI_BASE_URL && !hasWarnedMissingBaseUrl) {
    console.warn(`[AI] AI_BASE_URL not set, defaulting to OpenRouter: ${baseURL}`);
    hasWarnedMissingBaseUrl = true;
  }

  const { model } = getAiPolicy(feature);
  const rawModel = aiClient(normalizeModelForOpenRouter(model));
  
   // Return a wrapped model that adds caching for doGenerate only
   return new Proxy(rawModel, {
     get(target, p: PropertyKey, receiver: object) {
       // If it's a method we want to wrap for caching, return our cached version
       if (p === 'doGenerate') {
         return async function(options: LanguageModelV3CallOptions) {
           // Generate cache key based on feature and options
           const featureStr = String(feature);
           
            // Try to get from cache first
            const cached = await cacheAiResponse(featureStr, options, userId);
            if (cached !== null) {
              return cached;
            }
            
            // Not in cache, call the original method
            const result = await Reflect.get(target, p, receiver)(options);
            
            // Cache the result (with a default TTL of 5 minutes)
            await setAiResponseCache(featureStr, options, result, userId);
           
           return result;
         };
       }
       
       // For all other properties/methods (including doStream), delegate to the target
       return Reflect.get(target, p, receiver);
     }
   }) as LanguageModelV3;
}

// Cache statistics export
export { getAiCacheStats, resetAiCacheStats };

export function getAiLanguageModelById(modelId: string) {
  return aiClient(normalizeModelForOpenRouter(modelId));
}

export function getAiBaseURL(): string {
  return baseURL;
}