import { createOpenAI } from "@ai-sdk/openai";
import type { AiFeature } from "@/lib/ai/policy";
import { getAiPolicy } from "@/lib/ai/policy";
import { getEnv } from "@/lib/env";
import { isRedisConfigured, getRedisJson, setRedisJson } from "@/lib/redis-client";

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

// Simple hash function for caching keys
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

// Create a stable JSON string for hashing (ignoring undefined/null)
function stableStringify(obj: unknown): string {
  return JSON.stringify(obj, (_, value) => 
    typeof value === 'bigint' ? value.toString() : 
    value === undefined || value === null ? null : value
  );
}

// In-memory cache fallback
const inMemoryCache = new Map<string, { value: unknown; expiresAt: number }>();
const CACHE_SWEEP_INTERVAL_MS = 60_000; // 1 minute

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of inMemoryCache.entries()) {
    if (entry.expiresAt <= now) {
      inMemoryCache.delete(key);
    }
  }
}, CACHE_SWEEP_INTERVAL_MS).unref?.();

function getFromInMemoryCache<T>(key: string): T | null {
  const entry = inMemoryCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    inMemoryCache.delete(key);
    return null;
  }
  return entry.value as T;
}

function setInMemoryCache<T>(key: string, value: T, ttlSeconds: number): void {
  inMemoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

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
  
  // Return a wrapped model that adds caching
  return new Proxy(rawModel, {
    get(target, prop: keyof typeof target) {
      // If it's a method we want to wrap for caching, return our cached version
      if (prop === 'doGenerate' || prop === 'doStream') {
        return async (options: unknown) => {
          // Generate cache key
          const env = getEnv();
          const featureStr = String(feature);
          const modelStr = String(model);
          
          // Extract useful parts from options for hashing
          let optionsStr = '';
          if (options && typeof options === 'object') {
            // Try to extract messages/prompt for better cache keys
            if ('messages' in options && options.messages) {
              optionsStr = stableStringify({ 
                messages: options.messages,
                // Include other relevant params that affect output
                temperature: (options as any).temperature,
                maxTokens: (options as any).maxTokens,
                topP: (options as any).topP,
                frequencyPenalty: (options as any).frequencyPenalty,
                presencePenalty: (options as any).presencePenalty,
                stop: (options as any).stop,
              });
            } else if ('prompt' in options && options.prompt) {
              optionsStr = stableStringify({ 
                prompt: options.prompt,
                temperature: (options as any).temperature,
                maxTokens: (options as any).maxTokens,
                topP: (options as any).topP,
                frequencyPenalty: (options as any).frequencyPenalty,
                presencePenalty: (options as any).presencePenalty,
                stop: (options as any).stop,
              });
            } else {
              // Fallback to stringifying everything
              optionsStr = stableStringify(options);
            }
          }
          
          const cacheKey = `ai:${featureStr}:${modelStr}:${hashString(optionsStr)}`;
          
          // Try to get from cache first
          if (isRedisConfigured()) {
            const cached = await getRedisJson<unknown>(cacheKey, cacheKey);
            if (cached !== null) {
              // Return cached result
              return cached as unknown;
            }
          } else {
            const cached = getFromInMemoryCache<unknown>(cacheKey);
            if (cached !== null) {
              return cached;
            }
          }
          
          // Not in cache, call the original method
          const result = await target[prop]!(options);
          
          // Cache the result (with a default TTL of 5 minutes)
          const ttlSeconds = 300; // 5 minutes
          if (isRedisConfigured()) {
            await setRedisJson(cacheKey, cacheKey, result, ttlSeconds);
          } else {
            setInMemoryCache(cacheKey, result, ttlSeconds);
          }
          
          return result;
        };
      }
      
      // For all other properties/methods, delegate to the target
      return Reflect.get(target, prop);
    }
  });
}

export function getAiLanguageModelById(modelId: string) {
  return aiClient(normalizeModelForOpenRouter(modelId));
}

export function getAiBaseURL(): string {
  return baseURL;
}