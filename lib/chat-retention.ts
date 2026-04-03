import type { UIMessage } from "ai";

export const CHAT_RETENTION_MS = 24 * 60 * 60 * 1000;

type PersistedChatEnvelope = {
  version: 1;
  kind: "dashboard-chat";
  expiresAt: string;
  messages: UIMessage[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPersistedChatEnvelope(value: unknown): value is PersistedChatEnvelope {
  return (
    isRecord(value) &&
    value.kind === "dashboard-chat" &&
    value.version === 1 &&
    typeof value.expiresAt === "string" &&
    Array.isArray(value.messages)
  );
}

function parseRawConversation(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export function createStoredChatConversation(
  messages: UIMessage[],
  now: Date = new Date(),
): string {
  const payload: PersistedChatEnvelope = {
    version: 1,
    kind: "dashboard-chat",
    expiresAt: new Date(now.getTime() + CHAT_RETENTION_MS).toISOString(),
    messages,
  };

  return JSON.stringify(payload);
}

export function getStoredChatEnvelope(value: unknown): PersistedChatEnvelope | null {
  const parsed = parseRawConversation(value);
  return isPersistedChatEnvelope(parsed) ? parsed : null;
}

export function isStoredChatConversationExpired(
  value: unknown,
  now: Date = new Date(),
): boolean {
  const envelope = getStoredChatEnvelope(value);
  if (!envelope) return false;

  const expiresAt = new Date(envelope.expiresAt);
  return Number.isFinite(expiresAt.getTime()) && expiresAt <= now;
}

export function readStoredChatConversation(
  value: unknown,
  now: Date = new Date(),
): UIMessage[] {
  const parsed = parseRawConversation(value);

  if (Array.isArray(parsed)) {
    return parsed as UIMessage[];
  }

  if (isPersistedChatEnvelope(parsed)) {
    return isStoredChatConversationExpired(parsed, now) ? [] : parsed.messages;
  }

  return [];
}
