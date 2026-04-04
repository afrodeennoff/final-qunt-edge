import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const envKeys = [
  "AI_MODEL",
  "AI_TIMEOUT_MS",
  "AI_MAX_STEPS",
  "AI_LOG_SAMPLE_RATE",
] as const;

const originalEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));

describe("AI policy", () => {
  beforeEach(() => {
    vi.resetModules();
    for (const key of envKeys) {
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of envKeys) {
      const value = originalEnv[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it("uses default model when no env override is provided", async () => {
    const { getAiPolicy } = await import("@/lib/ai/policy");
    expect(getAiPolicy("chat").model).toBe("glm-4.7-flash");
  });

  it("uses AI_MODEL env override for all features", async () => {
    process.env.AI_MODEL = "openai/gpt-4o-mini";
    const { getAiPolicy } = await import("@/lib/ai/policy");
    expect(getAiPolicy("chat").model).toBe("openai/gpt-4o-mini");
    expect(getAiPolicy("support").model).toBe("openai/gpt-4o-mini");
    expect(getAiPolicy("analysis").model).toBe("openai/gpt-4o-mini");
  });

  it("reads timeout and max steps from env", async () => {
    process.env.AI_TIMEOUT_MS = "45000";
    process.env.AI_MAX_STEPS = "7";
    const { getAiPolicy } = await import("@/lib/ai/policy");
    const policy = getAiPolicy("editor");
    expect(policy.timeoutMs).toBe(45000);
    expect(policy.maxSteps).toBe(7);
  });
});
