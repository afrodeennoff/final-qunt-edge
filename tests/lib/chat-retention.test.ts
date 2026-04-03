import { describe, expect, it } from "vitest";
import {
  CHAT_RETENTION_MS,
  createStoredChatConversation,
  isStoredChatConversationExpired,
  readStoredChatConversation,
} from "@/lib/chat-retention";

describe("chat retention helpers", () => {
  const messages = [
    {
      id: "msg-1",
      role: "user",
      parts: [{ type: "text", text: "Hello" }],
    },
  ];

  it("reads legacy stored arrays", () => {
    expect(readStoredChatConversation(JSON.stringify(messages))).toEqual(messages);
  });

  it("returns messages while unexpired", () => {
    const stored = createStoredChatConversation(messages as never, new Date("2026-01-01T00:00:00.000Z"));
    expect(
      readStoredChatConversation(stored, new Date("2026-01-01T23:59:59.000Z")),
    ).toEqual(messages);
  });

  it("treats expired envelopes as unavailable", () => {
    const base = new Date("2026-01-01T00:00:00.000Z");
    const stored = createStoredChatConversation(messages as never, base);
    const now = new Date(base.getTime() + CHAT_RETENTION_MS + 1);

    expect(isStoredChatConversationExpired(stored, now)).toBe(true);
    expect(readStoredChatConversation(stored, now)).toEqual([]);
  });
});
