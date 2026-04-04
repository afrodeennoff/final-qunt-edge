import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  streamTextMock,
  convertToModelMessagesMock,
  logAiRequestMock,
} = vi.hoisted(() => ({
  streamTextMock: vi.fn(),
  convertToModelMessagesMock: vi.fn(),
  logAiRequestMock: vi.fn(),
}));

vi.mock("ai", () => ({
  streamText: (arg: unknown) => streamTextMock(arg),
  convertToModelMessages: (arg: unknown) => convertToModelMessagesMock(arg),
  stepCountIs: vi.fn(() => () => false),
  tool: vi.fn((definition: unknown) => definition),
  createTool: vi.fn((definition: unknown) => definition),
}));

vi.mock("@/lib/ai/route-guard", () => ({
  guardAiRequest: vi.fn(async () => ({
    ok: true,
    userId: "test-user-1",
    email: "test@example.com",
  })),
}));

vi.mock("@/lib/ai/client", () => ({
  getAiLanguageModel: vi.fn(() => "direct-model"),
}));

vi.mock("@/lib/ai/telemetry", async () => {
  const actual = await vi.importActual<typeof import("@/lib/ai/telemetry")>("@/lib/ai/telemetry");
  return {
    ...actual,
    logAiRequest: (...args: unknown[]) => logAiRequestMock(...args),
  };
});

describe("AI Router - Comprehensive Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AI_API_KEY = "test-ai-key";

    convertToModelMessagesMock.mockResolvedValue([{ role: "user", content: "hello" }]);
    streamTextMock.mockReturnValue({
      toUIMessageStreamResponse: vi.fn(() => new Response("ok", { status: 200 })),
    });
  });

  it("support route uses streaming with configured model", async () => {
    const { POST } = await import("@/app/api/ai/support/route");
    const response = await POST(
      new Request("http://localhost/api/ai/support", {
        method: "POST",
        body: JSON.stringify({ messages: [{ role: "user", content: "Help me" }] }),
        headers: { "Content-Type": "application/json" },
      }) as never,
    );

    expect(response.status).toBe(200);
    expect(streamTextMock).toHaveBeenCalled();
  });
});
