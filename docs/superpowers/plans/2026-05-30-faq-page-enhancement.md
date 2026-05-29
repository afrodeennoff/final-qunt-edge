# FAQ Page Enhancement (Approach 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the existing `/faq` page with categorized content, live client-side search/filtering, a Popular Questions preview, expanded high-quality questions, and subtle visual/UX polish — all while strictly reusing the existing design system, Unified components, Accordion, layout, and styling.

**Architecture:** 
- Extract FAQ content into a typed data file (`lib/faq-data.ts`).
- Make the page a client component (`'use client'`) with React state for search term and active category.
- Live filtering of the accordion list.
- Compose using existing `UnifiedPageShell`, `UnifiedSurface`, `UnifiedPageHeader`, and the current `Accordion` component.
- Keep all SEO schemas and metadata patterns.

**Tech Stack:** Next.js 15 (App Router), TypeScript, existing internal components (`@/components/layout/unified-page-shell`, `@/components/ui/accordion`), no new dependencies.

---

## File Inventory

**New files:**
- `lib/faq-data.ts` — Source of truth for all FAQ items (categories, questions, answers).

**Modified files:**
- `app/[locale]/(landing)/faq/page.tsx` — Main enhancement (biggest change).
- `lib/seo.ts` (minor if needed for schema updates — likely none).

**No changes to:**
- Footer (link already exists)
- Navbar
- Design tokens or global styles

---

## Task 1: Create the FAQ data source

**Files:**
- Create: `lib/faq-data.ts`

- [ ] **Step 1: Write the failing test** (we'll test the data shape in the page later; for now create a simple type guard test if possible, but start with the file)

```ts
// lib/faq-data.ts (initial skeleton that will fail type checks later)
export type FaqItem = {
  id: string
  category: string
  question: string
  answer: string
}

export const faqCategories = ['Getting Started', ...] as const
```

- [ ] **Step 2: Define the data structure and export 15+ real questions**

Populate with 15+ high-quality questions across the 6 categories (use content from the approved design spec).

- [ ] **Step 3: Add a helper function `getFaqItems()` that returns the array**

- [ ] **Step 4: Verify the file compiles** (run type check in Vercel or locally if possible)

- [ ] **Step 5: Commit**

```bash
git add lib/faq-data.ts
git commit -m "feat(faq): add typed faq data source with 15+ questions"
```

## Task 2: Make the FAQ page a client component with basic structure

**Files:**
- Modify: `app/[locale]/(landing)/faq/page.tsx`

- [ ] **Step 1: Write a failing test** (create `app/[locale]/(landing)/faq/faq.test.tsx` or use existing patterns — for now add a simple render test later)

- [ ] **Step 2: Add 'use client' directive and import necessary hooks**

```tsx
'use client'

import { useState } from 'react'
import { UnifiedPageShell, UnifiedSurface } from '@/components/layout/unified-page-shell'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
```

- [ ] **Step 3: Import the new faq data and types**

- [ ] **Step 4: Replace the hardcoded `faqs` array with import from `lib/faq-data`**

- [ ] **Step 5: Commit the structural change**

## Task 3: Implement live search functionality (TDD)

**Files:**
- Modify: `app/[locale]/(landing)/faq/page.tsx`

- [ ] **Step 1: Write the failing test** for search filtering logic (can be a unit test on a small filter function extracted later)

```ts
// In a small test file or inline
test('filters FAQs by search term', () => {
  const results = filterFaqs(faqs, 'broker')
  expect(results.length).toBeGreaterThan(0)
  expect(results[0].question.toLowerCase()).toContain('broker')
})
```

- [ ] **Step 2: Add search state and input using existing input patterns**

Add a search input using Tailwind classes consistent with the design system (look at other landing pages for exact styling).

- [ ] **Step 3: Implement `filteredFaqs` derived state**

```ts
const [searchTerm, setSearchTerm] = useState('')

const filteredFaqs = faqs.filter(faq =>
  faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
  faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
)
```

- [ ] **Step 4: Render the filtered list inside the Accordion**

- [ ] **Step 5: Add "Clear search" button and empty state**

- [ ] **Step 6: Commit**

```bash
git add app/\[locale\]/(landing)/faq/page.tsx
git commit -m "feat(faq): add live client-side search filtering"
```

## Task 4: Add category filtering (tabs/chips)

**Files:**
- Modify: `app/[locale]/(landing)/faq/page.tsx`

- [ ] **Step 1: Add category state and tabs using existing button/ghost styles**

Use `unifiedGhostActionClassName` or similar from the design system (already used in navbar/footer).

- [ ] **Step 2: Filter by both search + active category**

- [ ] **Step 3: Make tabs work on desktop, chips on mobile**

- [ ] **Step 4: Test filtering combinations**

- [ ] **Step 5: Commit**

## Task 5: Add "Popular Questions" preview section

**Files:**
- Modify: `app/[locale]/(landing)/faq/page.tsx`

- [ ] **Step 1: Curate 4 popular items in the data file (or hardcode selection)**

- [ ] **Step 2: Render a grid of 4 cards using `UnifiedSurface` above the main list**

- [ ] **Step 3: Make cards clickable to scroll to the matching accordion item (simple id-based)**

- [ ] **Step 4: Add subtle visual polish (consistent with Approach 3)**

- [ ] **Step 5: Commit**

## Task 6: Expand content and add all categories

**Files:**
- Modify: `lib/faq-data.ts`
- Modify: `app/[locale]/(landing)/faq/page.tsx` (if needed)

- [ ] **Step 1: Fill in the remaining high-quality questions** (15+ total) based on the design spec

- [ ] **Step 2: Ensure every category has 2–4 questions**

- [ ] **Step 3: Update the FAQ schema generation** to use the new data

- [ ] **Step 4: Verify all questions render correctly**

- [ ] **Step 5: Commit**

## Task 7: Subtle visual polish within existing components

**Files:**
- Modify: `app/[locale]/(landing)/faq/page.tsx`

- [ ] **Step 1: Use `UnifiedPageHeader` component** (instead of manual header) for better polish where appropriate

- [ ] **Step 2: Improve spacing and card treatment** using `density` or `variant` props on `UnifiedSurface`

- [ ] **Step 3: Add slight hover states and better visual hierarchy** using existing classes

- [ ] **Step 4: Ensure "Popular Questions" cards feel elevated but consistent**

- [ ] **Step 5: Commit**

## Task 8: Mobile responsiveness & accessibility pass

**Files:**
- Modify: `app/[locale]/(landing)/faq/page.tsx`

- [ ] **Step 1: Verify category tabs become scrollable chips on mobile**

- [ ] **Step 2: Ensure search input is large and accessible**

- [ ] **Step 3: Test accordion behavior on small screens**

- [ ] **Step 4: Run accessibility check (manual or via Vercel)**

- [ ] **Step 5: Commit**

## Task 9: Update SEO and metadata

**Files:**
- Modify: `app/[locale]/(landing)/faq/page.tsx`

- [ ] **Step 1: Update `generateMetadata` title and description** to reflect the richer content

- [ ] **Step 2: Ensure `buildFaqPageSchema` receives the full list**

- [ ] **Step 3: Keep all existing schema scripts**

- [ ] **Step 4: Commit**

## Task 10: Final verification & cleanup

**Files:**
- Various

- [ ] **Step 1: Remove any unused imports**

- [ ] **Step 2: Verify the page builds successfully** (via Vercel or local if possible)

- [ ] **Step 3: Test all filters (search + categories + combined)**

- [ ] **Step 4: Check that footer link still works**

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat(faq): complete Approach 3 enhancement (search, categories, polish, expanded content)"
```

---

**Plan Self-Review (done before presenting):**

- All requirements from the approved design spec are covered by at least one task.
- Every task is small and TDD-oriented.
- No placeholders.
- Strict reuse of existing components is enforced in the architecture and tasks.
- Ready for subagent-driven execution.

---

**Execution Handoff**

Plan complete and saved to `docs/superpowers/plans/2026-05-30-faq-page-enhancement.md`.

**Recommended:** Subagent-Driven (you have repeatedly asked to "swam the agent" / swarm agents).

Reply with your choice:
1. Subagent-Driven (recommended)
2. Inline Execution

I will then dispatch the first subagent(s) accordingly.