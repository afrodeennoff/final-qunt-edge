import { createOpenAI } from "@ai-sdk/openai";
import type { AiFeature } from "@/lib/ai/policy";
import { getAiPolicy } from "@/lib/ai/policy";
import { aiRouter } from "@/lib/ai/router";
import { getRouterConfig } from "@/lib/ai/router/config";
import { logAiError } from "@/lib/ai/error-utils";

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

type RouterAwareModel = ReturnType<typeof aiClient>;

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

/**
 * Returns a router-aware OpenAI-compatible language model via OpenRouter.
 * When AI router is enabled, model calls use the canonical fallback chain:
 * openrouter/free -> openrouter/auto -> liquid fallback.
 * 
 * This is the unified approach that replaces both getAiLanguageModel and 
 * createCompletionWithRouter paths, using the AI SDK's built-in streaming
 * capabilities consistently.
 */
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
  return getAiLanguageModelById(normalizeModelForOpenRouter(model));
}

export function getAiLanguageModelById(model: string) {
  const normalizedModel = normalizeModelForOpenRouter(model);
  const routerConfig = getRouterConfig();
  if (!routerConfig.enabled) {
    return aiClient(normalizedModel);
  }

  const chain = buildRouterModelChain(routerConfig);
  return createUnifiedFallbackModel(chain);
}

function buildRouterModelChain(routerConfig: ReturnType<typeof getRouterConfig>): string[] {
  const seen = new Set<string>();
  const chain = [
    routerConfig.openrouter.models.free,
    routerConfig.openrouter.models.auto,
    routerConfig.openrouter.models.liquid,
  ];
  return chain.filter((id) => {
    const trimmed = id.trim();
    if (!trimmed || seen.has(trimmed)) return false;
    seen.add(trimmed);
    return true;
  });
}

/**
 * Creates a unified fallback model that properly delegates to the AI SDK
 * instead of manually cloning and overriding methods.
 */
function createUnifiedFallbackModel(modelChain: string[]): RouterAwareModel {
  // Instead of manually cloning methods, we create a proxy that
  // delegates to the first working model in the chain
  const baseModel = aiClient(modelChain[0]);
  
  // Create a proxy that tries each model in sequence for generate/stream operations
  return new Proxy(baseModel, {
    get(target, prop) {
      // For doGenerate and doStream, we need special fallback handling
      if (prop === 'doGenerate') {
        return async (options: unknown) => {
          let lastError: unknown;
          for (const modelId of modelChain) {
            try {
              const candidate = aiClient(modelId);
              // @ts-ignore - we know the candidate has doGenerate
              return await candidate.doGenerate(options);
            } catch (error) {
              lastError = error;
            }
          }
          throw lastError ?? new Error("All fallback models failed");
        };
      }
      
      if (prop === 'doStream') {
        return async (options: unknown) => {
          let lastError: unknown;
          for (const modelId of modelChain) {
            try {
              const candidate = aiClient(modelId);
              // @ts-ignore - we know the candidate has doStream
              return await candidate.doStream(options);
            } catch (error) {
              lastError = error;
            }
          }
          throw lastError ?? new Error("All fallback models failed");
        };
      }
      
      // For all other properties, delegate to the base model
      // @ts-ignore - we know target has the property
      return target[prop];
    }
  }) as unknown as RouterAwareModel;
}

/**
 * Direct completion function that uses the router for free tier attempts.
 * This should be used when you want explicit control over the routing process.
 * 
 * Kept for backward compatibility but now internally uses the unified approach.
 */
export async function createCompletionWithRouter(
  feature: AiFeature,
  userId: string,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options: { temperature?: number; model?: string } = {}
): Promise<{ content: string; provider: string; model: string }> {
  // Delegate to the unified AI Router completion function
  const model = options.model ?? getAiPolicy(feature).model;
  const normalizedModel = normalizeModelForOpenRouter(model);
  const result = await aiRouter.createCompletion({
    userId,
    feature,
    messages,
    temperature: options.temperature ?? 0.3,
    requestedModel: normalizedModel,
  });

  return {
    content: result.content,
    provider: result.provider,
    model: result.model,
  };
}

export function getAiBaseURL(): string {
  return baseURL;
}