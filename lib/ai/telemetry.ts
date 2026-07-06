import { randomUUID } from "crypto";
import pg from "pg";
import { isTimeoutError } from "@/lib/ai/timeout";

let telemetryPool: pg.Pool | null = null;
function getTelemetryPool(): pg.Pool | null {
  if (telemetryPool) return telemetryPool;
  const connStr = process.env.DIRECT_URL || process.env.DATABASE_URL || "";
  if (!connStr) return null;
  telemetryPool = new pg.Pool({
    connectionString: connStr,
    max: 1,
    min: 0,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 3000,
  });
  return telemetryPool;
}

async function telemetryQuery(query: string, params: unknown[]): Promise<void> {
  const pool = getTelemetryPool();
  if (!pool) {
    console.warn("[AI Telemetry] No database connection configured for telemetry");
    return;
  }
  try {
    await pool.query(query, params);
  } catch (error) {
    console.error("[AI Telemetry] Failed to persist telemetry", error);
  }
}

export type AiErrorCategory =
  | "validation"
  | "tool_failure"
  | "model_timeout"
  | "rate_limit"
  | "budget_exceeded"
  | "internal";

export interface AiUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface AiBudgetMetadata {
  budgetLimit?: number;
  budgetUsed?: number;
  budgetRemaining?: number;
}

export interface AiRequestLogInput {
  userId?: string | null;
  route: string;
  feature: string;
  model: string;
  provider: string;
  usage?: AiUsage | null;
  latencyMs: number;
  toolCallsCount?: number;
  finishReason?: string | null;
  success: boolean;
  errorCategory?: AiErrorCategory | null;
  errorCode?: string | null;
  sampleRate?: number;
  budgetMetadata?: AiBudgetMetadata;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return null;
}

interface UsageObject {
  promptTokens?: number;
  inputTokens?: number;
  prompt_tokens?: number;
  completionTokens?: number;
  outputTokens?: number;
  completion_tokens?: number;
  totalTokens?: number;
  total_tokens?: number;
}

export function extractUsage(usage: unknown): AiUsage {
  if (!usage || typeof usage !== "object") return {};

  const usageObj = usage as UsageObject;

  const promptTokens =
    toNumber(usageObj.promptTokens) ??
    toNumber(usageObj.inputTokens) ??
    toNumber(usageObj.prompt_tokens) ??
    undefined;

  const completionTokens =
    toNumber(usageObj.completionTokens) ??
    toNumber(usageObj.outputTokens) ??
    toNumber(usageObj.completion_tokens) ??
    undefined;

  const totalTokens = toNumber(usageObj.totalTokens) ?? toNumber(usageObj.total_tokens) ?? undefined;

  return {
    promptTokens,
    completionTokens,
    totalTokens,
  };
}

export function categorizeAiError(error: unknown): AiErrorCategory {
  if (isTimeoutError(error)) return "model_timeout";
  const maybeError = error as { code?: string; type?: string; message?: string; status?: number; statusCode?: number };
  const code = String(maybeError?.code || maybeError?.type || "").toLowerCase();
  const message = String(maybeError?.message || "").toLowerCase();
  const status = Number(maybeError?.status || maybeError?.statusCode || 0);

  if (status === 429 || code.includes("rate") || message.includes("rate limit")) {
    return "rate_limit";
  }
  if (status === 408 || code.includes("timeout") || message.includes("timeout")) {
    return "model_timeout";
  }
  if (code.includes("budget") || message.includes("budget")) {
    return "budget_exceeded";
  }
  if (code.includes("validation") || message.includes("invalid") || status === 400) {
    return "validation";
  }
  if (code.includes("tool") || message.includes("tool")) {
    return "tool_failure";
  }
  return "internal";
}

function shouldLogSuccess(sampleRate: number): boolean {
  if (sampleRate >= 1) return true;
  if (sampleRate <= 0) return false;
  return Math.random() < sampleRate;
}

function normalizeTokenCount(totalTokens: number | undefined): number | null {
  if (typeof totalTokens !== "number" || !Number.isFinite(totalTokens)) return null;
  const normalized = Math.round(totalTokens);
  if (normalized <= 0) return null;
  return normalized;
}

async function recordDeterministicBudgetUsage(input: AiRequestLogInput): Promise<void> {
  const totalTokens = normalizeTokenCount(input.usage?.totalTokens);
  if (!input.userId || totalTokens === null) {
    return;
  }

  await telemetryQuery(
    `INSERT INTO "public"."AiUsageLedger" ("id","userId","route","feature","totalTokens","createdAt")
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [randomUUID(), input.userId, input.route, input.feature, totalTokens, new Date()],
  );
}

export async function logAiRequest(input: AiRequestLogInput): Promise<void> {
  await recordDeterministicBudgetUsage(input);

  const sampleRate = input.sampleRate ?? 1;
  if (input.success && !shouldLogSuccess(sampleRate)) {
    return;
  }

  await telemetryQuery(
    `INSERT INTO "public"."AiRequestLog" (
      "id","userId","route","feature","model","provider",
      "promptTokens","completionTokens","totalTokens",
      "latencyMs","toolCallsCount","finishReason",
      "success","errorCategory","errorCode",
      "createdAt","budgetLimit","budgetUsed","budgetRemaining"
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
    [
      randomUUID(),
      input.userId ?? null,
      input.route,
      input.feature,
      input.model,
      input.provider,
      input.usage?.promptTokens ?? null,
      input.usage?.completionTokens ?? null,
      input.usage?.totalTokens ?? null,
      Math.round(input.latencyMs),
      input.toolCallsCount ?? 0,
      input.finishReason ?? null,
      input.success,
      input.errorCategory ?? null,
      input.errorCode ?? null,
      new Date(),
      input.budgetMetadata?.budgetLimit ?? null,
      input.budgetMetadata?.budgetUsed ?? null,
      input.budgetMetadata?.budgetRemaining ?? null,
    ],
  );
}
