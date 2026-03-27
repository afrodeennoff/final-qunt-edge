import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const PUBLIC_PAGES = [
  { name: 'Home', url: '/en' },
  { name: 'Landing', url: '/en/(landing)' },
  { name: 'Pricing', url: '/en/(landing)/pricing' },
  { name: 'FAQ', url: '/en/(landing)/faq' },
  { name: 'PropFirm Deals', url: '/en/(landing)/propfirm-deals' },
  { name: 'Embed', url: '/en/embed' },
] as const

for (const pageDef of PUBLIC_PAGES) {
  test(`[A11Y] ${pageDef.name} page`, async ({ page }: { page: Page }) => {
    await page.goto(pageDef.url, { waitUntil: 'networkidle' })

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    if (results.violations.length > 0) {
      const summary = results.violations
        .slice(0, 5)
        .map(
          (v) => `  - ${v.id}: ${v.description} (${v.nodes.length} nodes)`
        )
        .join('\n')
      console.log(
        `[A11Y] ${results.violations.length} violations on ${pageDef.url}:\n${summary}`
      )
    }

    expect(results.violations).toHaveLength(0)
  })
}

test.describe('Protected pages (auth required)', () => {
  test('Dashboard (requires auth)', async ({ page }: { page: Page }) => {
    await page.goto('/en/dashboard', { waitUntil: 'networkidle' })

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(results.violations).toHaveLength(0)
  })
})
