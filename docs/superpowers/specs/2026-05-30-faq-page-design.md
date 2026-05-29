# FAQ Page Enhancement — Approach 3 Design Spec

**Date:** 2026-05-30  
**Status:** Design approved by user (Approach 3 — Ambitious Hybrid)  
**Goal:** Improve the existing `/faq` page by combining richer, better-organized content with noticeable but tasteful visual/UX polish, while strictly reusing the current design system and shared components.

## 1. Overview & Approved Direction

The current FAQ page at `app/[locale]/(landing)/faq/page.tsx` is already functional and uses the correct shared components (`UnifiedPageShell`, `UnifiedSurface`, `Accordion`).  

The user approved **Approach 3** (hybrid of content enhancement + visual polish):
- Significantly expand and organize content (categories, search, better placeholders).
- Add noticeable but "subtle" visual and UX improvements (category navigation, refined hierarchy, Popular Questions preview, better breathing room).
- 100% reuse of existing components, layout, Navbar, Footer, design tokens, and dark theme.
- No new major components or design system changes.

This keeps the page feeling like a natural, higher-quality evolution of the current experience.

## 2. Page Structure & Layout

- **Route:** `/faq` (under existing landing layout: `MarketingLayoutShell` → `UnifiedPageShell` with `max-w-[1280px]`).
- **Header:** "Help Center" eyebrow + large title + short intro paragraph (similar to current).
- **Search:** Prominent, always-visible search input directly under the header.
- **Popular Questions:** 4-card preview grid near the top (using `UnifiedSurface`).
- **Category Navigation:** Horizontal tabs (desktop ≥ lg) or scrollable chips (mobile).
- **Main List:** Full accordion list of questions, filtered by search + category.
- **Footer CTA:** "Still have questions?" block linking to `/support` (refined but using existing patterns).
- **Footer:** Existing link under Support section remains unchanged.

The page stays inside the current marketing shell with no layout changes.

## 3. Content Model & Data

**Categories (6):**
- Getting Started
- Trading & Data Import
- Analytics & Features
- Teams & Collaboration
- Billing, Pricing & Plans
- Security, Privacy & Support

**Content volume:** 14–16 high-quality, well-written questions (expanded from current ~5). Questions are benefit-oriented and specific to Qunt Edge (prop trading journal, broker sync, risk analysis, teams, etc.).

**Data source:** 
- Content moved to a simple, typed data file: `lib/faq-data.ts` (or `data/faq.ts`).
- Structure: array of objects with `id`, `category`, `question`, `answer`.
- The page imports this data and performs client-side filtering.
- This makes maintenance easy without touching the page component.

**Popular Questions:** Curated top 4 questions shown as a preview grid above the full list.

## 4. Search & Filtering Behavior

- Live search input at top of page.
- Typing filters the accordion list in real time and shows only matching categories.
- Category tabs/chips work in combination with search.
- "Clear all filters" option.
- Empty state with helpful message and link to support.
- No server requests — pure client-side filtering for speed and simplicity.

## 5. Visual Polish & Component Reuse

**Strict reuse (non-negotiable):**
- `UnifiedPageShell`
- `UnifiedSurface`
- Existing `Accordion` component (from `@/components/ui/accordion`)
- Existing button/ghost styles, typography, spacing tokens, and dark theme

**Polish additions (within existing system):**
- Category navigation as clean horizontal tabs (desktop) or scrollable chips (mobile).
- "Popular Questions" as a compact 2–4 column card grid with subtle hover states.
- Improved visual hierarchy (stronger section headers, better breathing room between elements).
- Slightly refined surface cards with more internal padding and subtle borders.
- Better visual separation between header, popular section, and main list.

No new components, no new design tokens, no breaking changes to existing styling.

## 6. Mobile & Responsive Behavior

- Search remains large and prominent.
- Category filters collapse to a horizontal scrollable bar on mobile.
- Accordion fully usable with good tap targets.
- Popular Questions grid stacks to single column.
- All spacing and typography follow existing responsive patterns.
- No custom breakpoints outside the current design system.

## 7. SEO, Accessibility & Technical Details

- Keep and update existing JSON-LD schemas:
  - `buildFaqPageSchema(faqs)`
  - Organization schema
  - Breadcrumb schema
- Metadata updated to reflect richer content.
- Full keyboard navigation and ARIA support inherited from current Accordion.
- No new accessibility debt.

## 8. Integration & Maintenance

- **Navigation:** Footer link to `/faq` (already exists under Support) — no changes needed. Navbar does not require a new link.
- **Data maintenance:** All questions live in one file (`lib/faq-data.ts`). Future additions, edits, or re-categorization require only editing that file.
- **Scope control:** Lower-priority topics (detailed notes/strategies, full self-service billing) are intentionally excluded per YAGNI.
- **Performance:** Client-side filtering only. No new API calls.

## 9. Trade-offs & Decisions

- **Why not a full redesign?** Approach 3 balances ambition with respect for the existing design system. A bigger visual overhaul would violate the "reuse existing components" constraint.
- **Why a data file instead of hard-coded?** Improves maintainability without adding complexity (no CMS or DB justified for this page).
- **Why no images/icons in answers?** Keeps scope tight and avoids new asset or component dependencies.
- **Search is client-side only:** Acceptable because the total number of questions is small (~15). Keeps implementation simple and fast.

## 10. Next Steps (After User Approves This Spec)

1. Write implementation plan using `writing-plans` skill.
2. Break work into small, testable tasks (data file, search/filter logic, category UI, content expansion, visual polish, testing).
3. Use subagent-driven-development to execute the plan.

---

**Spec Self-Review (performed before presenting):**
- No placeholders or TBDs.
- Consistent with user's explicit request (Approach 3 hybrid).
- Respects all constraints (reuse existing components, no major new UI).
- Scope is focused and achievable.
- No contradictions between sections.

---

**User Review Gate**

Spec written and committed to `docs/superpowers/specs/2026-05-30-faq-page-design.md`.

Please review the full document above and let me know:
- **Yes** — proceed to writing the implementation plan.
- Or specific changes you want before we continue.

(Once you approve, the next step will be invoking the `writing-plans` skill.)