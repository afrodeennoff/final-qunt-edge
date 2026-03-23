export interface SanitizedAiError {
  code: string | null;
  statusCode: number | null;
  type: string | null;
  message: string;
}

export function logAiError(
  message: string,
  error?: unknown,
  context?: Record<string, unknown>
): void {
  const timestamp = new Date().toISOString();
  const errorInfo = error instanceof Error
    ? { message: error.message, name: error.name, stack: error.stack }
    : error !== undefined ? String(error) : undefined;

  const logEntry = {
    timestamp,
    level: 'error',
    source: 'ai',
    message,
    ...(errorInfo && { error: errorInfo }),
    ...context,
  };

  try {
    console.error(`[AI Error] ${message}`, JSON.stringify(logEntry, null, 2));
  } catch {
    console.error(`[AI Error] ${message}`, logEntry);
  }
}

export function logAiWarn(
  message: string,
  error?: unknown,
  context?: Record<string, unknown>
): void {
  const timestamp = new Date().toISOString();
  const errorInfo = error instanceof Error
    ? { message: error.message, name: error.name, stack: error.stack }
    : error !== undefined ? String(error) : undefined;

  const logEntry = {
    timestamp,
    level: 'warn',
    source: 'ai',
    message,
    ...(errorInfo && { error: errorInfo }),
    ...context,
  };

  try {
    console.warn(`[AI Warn] ${message}`, JSON.stringify(logEntry, null, 2));
  } catch {
    console.warn(`[AI Warn] ${message}`, logEntry);
  }
}

export function estimateTokenCountFromText(text: string): number {
  return Math.ceil(text.length / 4);
}

export function estimateTokenCountFromMessages(messages: Array<{ content?: string | unknown }>, extraText?: string): number {
  let count = messages.reduce((sum, msg) => {
    const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
    return sum + estimateTokenCountFromText(content);
  }, 0);
  if (extraText) {
    count += estimateTokenCountFromText(extraText);
  }
  return count;
}

function toStringOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toNumberOrNull(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value;
}

export function getAiErrorCode(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;
  const maybeCode = (error as { code?: unknown }).code;
  return toStringOrNull(maybeCode);
}

export function sanitizeAiError(error: unknown): SanitizedAiError {
  if (!error || typeof error !== "object") {
    return {
      code: null,
      statusCode: null,
      type: null,
      message: "Unknown error",
    };
  }

  const errorObj = error as Record<string, unknown>;

  let code: string | null = null;
  if (typeof errorObj.code === "string") {
    code = errorObj.code;
  } else if (typeof errorObj.cause === "object" && errorObj.cause !== null) {
    const cause = errorObj.cause as Record<string, unknown>;
    code = toStringOrNull(cause.code);
  }

  let statusCode: number | null = null;
  if (typeof errorObj.status === "number") {
    statusCode = errorObj.status;
  } else if (typeof errorObj.statusCode === "number") {
    statusCode = errorObj.statusCode;
  }

  let type: string | null = null;
  if (typeof errorObj.type === "string") {
    type = errorObj.type;
  }

  let message = "Unknown error";
  if (typeof errorObj.message === "string") {
    message = errorObj.message;
  } else if (typeof errorObj.error === "string") {
    message = errorObj.error;
  } else if (typeof errorObj.msg === "string") {
    message = errorObj.msg;
  }

  return {
    code,
    statusCode,
    type,
    message,
  };
}
