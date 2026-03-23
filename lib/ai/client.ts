import { createOpenAI } from "@ai-sdk/openai";
import type { AiFeature } from "@/lib/ai/policy";
import { getAiPolicy } from "@/lib/ai/policy";

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
  return aiClient(normalizeModelForOpenRouter(model));
}

export function getAiLanguageModelById(modelId: string) {
  return aiClient(normalizeModelForOpenRouter(modelId));
}

export function getAiBaseURL(): string {
  return baseURL;
}