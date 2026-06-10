import { describe, expect, it } from "vitest"
import path from "node:path"
import { readFileSync } from "node:fs"

function extractQuotedNames(block: string): string[] {
  const matches = block.match(/"([A-Za-z0-9_]+)"/g) ?? []
  return matches.map((entry) => entry.slice(1, -1))
}

describe("ai chat tool policy alignment", () => {
  it("keeps analytics allowed tool names aligned with mounted availableTools", () => {
    const filePath = path.resolve(process.cwd(), "app/api/ai/chat/route.ts")
    const source = readFileSync(filePath, "utf8")

    const analyticsAllowedMatch = source.match(
      /if \(intent === "analytics_data"\) \{[\s\S]*?allowedToolNames:\s*\[([\s\S]*?)\],/,
    )
    const availableToolsMatch = source.match(
      /createAvailableChatTools\(userId[^)]*\) \{([\s\S]*?)\s+getJournalEntries:/,
    );

    expect(analyticsAllowedMatch?.[1]).toBeTruthy()
    expect(availableToolsMatch?.[1]).toBeTruthy()

    const analyticsAllowed = extractQuotedNames(analyticsAllowedMatch?.[1] ?? "")
    // Extract bare tool names from the create block (keys like getFoo: createGetFooTool )
    const availableToolNames = new Set(
      (availableToolsMatch?.[1] ?? "")
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.includes(": create") || /^[a-zA-Z0-9_]+:/.test(line))
        .map((line) => {
          const m = line.match(/^\s*([a-zA-Z0-9_]+)\s*:/);
          return m ? m[1] : line.replace(/,$/, "").trim();
        })
        .filter(Boolean),
    )

    const staleAllowed = analyticsAllowed.filter((name) => !availableToolNames.has(name))
    expect(staleAllowed).toEqual([])
  })
})
