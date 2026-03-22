export const AI_TIMEOUT_ERROR_NAME = "AiTimeoutError";

export function createAiTimeoutSignal(timeoutMs: number): AbortSignal {
  return AbortSignal.timeout(timeoutMs);
}

export function isTimeoutError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { name?: string; code?: string; type?: string; message?: string };
  return (
    e.name === "TimeoutError" ||
    e.name === "AbortError" ||
    e.code === "ETIMEDOUT" ||
    e.code === "ECONNRESET" ||
    e.type === "timeout" ||
    e.type === "aborted" ||
    (e.message?.includes("aborted") ?? false) ||
    (e.message?.includes("timed out") ?? false)
  );
}
