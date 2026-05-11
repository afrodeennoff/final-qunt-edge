import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"

describe("Visual shell contract", () => {
  it("keeps the prop-firms catalogue hero free of visible perimeter frames", () => {
    const source = readFileSync(
      join(process.cwd(), "app/[locale]/(landing)/propfirms/components/catalogue-experience.tsx"),
      "utf8"
    )

    expect(source).toContain('variant="minimal"')
    expect(source).toContain("'animate-fade-up-smooth grid gap-6 border-0")
  })

  it("documents the prop-firms catalogue borderless hero rule", () => {
    const guide = readFileSync(join(process.cwd(), "docs/V2_VISUAL_SYSTEM_GUIDE.md"), "utf8")

    expect(guide).toContain("Prop-firm catalogue specifically must keep its hero visually borderless")
    expect(guide).toContain('UnifiedPageShell variant="minimal"')
  })

  it("keeps trader profiles free of repeated summary panels", () => {
    const publicProfile = readFileSync(
      join(process.cwd(), "app/[locale]/(landing)/trader/[slug]/page.tsx"),
      "utf8"
    )
    const dashboardProfile = readFileSync(
      join(process.cwd(), "app/[locale]/dashboard/trader-profile/page-client.tsx"),
      "utf8"
    )

    expect(publicProfile).not.toContain("Total Profit")
    expect(publicProfile).not.toContain("Total Capital")
    expect(publicProfile).not.toContain("Total Trades")
    expect(dashboardProfile).not.toContain("Capital snapshot")
  })
})
