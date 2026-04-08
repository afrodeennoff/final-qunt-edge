# Landing Pages Redesign — Styleseed × Resend/Expo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle all home page + landing page components with a cinematic dark void aesthetic — pure black background, icy frost borders, pill-shaped CTAs, Inter typography.

**Architecture:** CSS-first token injection into `globals.css`. All existing components keep their structure/animations — only class names change from V2 tokens (`--mk-*`, `--v2-*`) to new frost/void tokens (`--frost-*`, `--accent-*`). No structural changes, no new dependencies.

**Tech Stack:** Next.js 15, Tailwind CSS, Framer Motion (existing), Inter font (existing), Lucide icons (existing).

---

## File Map

### CSS (1 file, foundation)
- `app/globals.css` — Add CSS custom properties for frost tokens + accent palette

### Home Page Components (`app/[locale]/(home)/components/`)
- `Hero.tsx` — Frost borders, pill CTAs, void background
- `LiveStatsStrip.tsx` — Mono-font counters, frost strip
- `FeaturesBento.tsx` — Frost cards, accent badges
- `ProblemStatement.tsx` — Frost card styling
- `DashboardPreview.tsx` — Keep as-is (dashboard mockup)
- `HowItWorks.tsx` — Glowing nodes, frost borders
- `AnalysisDemo.tsx` — Terminal aesthetic, frost card
- `analysis-demo-chart.tsx` — Gradient chart styling
- `AudienceSegmentation.tsx` — Gradient borders, frost cards
- `AIFeatures.tsx` — Accent-tinted cards, icon glows
- `SocialProof.tsx` — Frost cards, avatar rings
- `ComparisonSection.tsx` — Zebra rows, frost borders
- `RollingAdBanner.tsx` — Keep as-is (marquee strip)
- `PropFirmsExplorer.tsx` — Frost cards
- `PricingSection.tsx` — Frost cards, pill CTAs
- `FAQSection.tsx` — Frost accordion
- `FinalCTA.tsx` — Pill CTA, void background

### Landing Page Components (`app/[locale]/(landing)/components/`)
- `navbar.tsx` — Frost nav bar, pill CTA
- `footer.tsx` — Frost footer panel

---

## TODOs

---

- [x] **Task 1: Add Frost Tokens to globals.css** ✅ (commit: 6dbc4d8)

  **File:** `app/globals.css`

  Add the following CSS custom properties inside the `:root {}` block (after existing `--qe-*` tokens, before the `.dark {}` block):

  ```css
    /* === Frost Border System (Resend-inspired) === */
    --frost-border: rgba(214, 235, 253, 0.19);
    --frost-border-strong: rgba(214, 235, 253, 0.28);
    --frost-border-alt: rgba(217, 237, 254, 0.12);
    --frost-shadow: rgba(176, 199, 217, 0.145) 0px 0px 0px 1px;

    /* === Multi-Color Accent System (Resend palette) === */
    --accent-orange: #ff801f;
    --accent-orange-subtle: rgba(255, 89, 0, 0.15);
    --accent-orange-border: rgba(255, 129, 31, 0.3);
    --accent-blue: #3b9eff;
    --accent-blue-subtle: rgba(0, 117, 255, 0.12);
    --accent-blue-border: rgba(59, 158, 255, 0.3);
    --accent-green: #11ff99;
    --accent-green-subtle: rgba(17, 255, 153, 0.12);
    --accent-green-border: rgba(17, 255, 153, 0.3);
    --accent-red: #ff2047;
    --accent-yellow: #ffc53d;

    /* === Text Hierarchy (Resend palette) === */
    --text-primary: oklch(0.97 0 0);      /* #f0f0f0 near white */
    --text-secondary: #a1a4a5;              /* silver */
    --text-tertiary: #6a6a6a;               /* dark gray */
    --text-disabled: #464a4d;               /* mid gray */

    /* === Surface (dark void system) === */
    --surface-card: oklch(0.04 0 0);       /* slightly lifted from void */
    --surface-popover: oklch(0.06 0 0);

    /* === Pill Radius === */
    --radius-pill: 9999px;
    --radius-card: 1rem;                   /* 16px for cards */
  ```

  Also add to `.dark {}` block (same block — already dark, so tokens are the same):

  ```css
    /* === Frost Border System === */
    --frost-border: rgba(214, 235, 253, 0.15);
    --frost-border-strong: rgba(214, 235, 253, 0.22);
    --frost-border-alt: rgba(217, 237, 254, 0.08);

    /* === Accent Colors (brightened for dark mode) === */
    --accent-orange: #ffa057;
    --accent-orange-subtle: rgba(255, 160, 87, 0.12);
    --accent-orange-border: rgba(255, 160, 87, 0.25);
    --accent-blue: #64b5f6;
    --accent-blue-subtle: rgba(100, 181, 246, 0.1);
    --accent-blue-border: rgba(100, 181, 246, 0.25);
    --accent-green: #8fbfa9;
    --accent-green-subtle: rgba(143, 191, 169, 0.1);
    --accent-green-border: rgba(143, 191, 169, 0.25);
  ```

  **QA Scenarios:**
  - `npm run typecheck` → PASS (no TypeScript errors from CSS)
  - `npm run build` → PASS (CSS parses correctly)

  **Commit:** YES — Message: `feat(design): add frost border + accent tokens to globals.css`

---

- [x] **Task 2: Restyle Hero.tsx** ✅ (commit: 4b0d610)
- [x] **Task 3: Restyle PricingSection.tsx** ✅ (commit: fd857df)
- [x] **Task 4: Restyle FAQSection.tsx** ✅ (commit: d99629e)
- [x] **Task 5: Restyle FeaturesBento.tsx** ✅ (commit: 68e6c90)
- [x] **Task 6: Restyle HowItWorks.tsx** ✅ (commit: 5e06c2d)
- [x] **Task 7: Restyle AIFeatures.tsx** ✅ (commit: 63ed29e)
- [x] **Task 8: Restyle SocialProof.tsx** ✅ (commit: a6f5d1e)
- [x] **Task 9: Restyle ComparisonSection.tsx** ✅ (commit: 7976393)
- [x] **Task 10: Restyle AudienceSegmentation.tsx** ✅ (commit: 467f58c)
- [x] **Task 11: Restyle FinalCTA.tsx** ✅ (commit: 74f528e)
- [x] **Task 12: Restyle LiveStatsStrip.tsx** ✅ (commit: 082b959)
- [x] **Task 13: Restyle PropFirmsExplorer.tsx** ✅ (commit: 40ecee3)
- [x] **Task 14: Restyle AnalysisDemo.tsx** ✅ (commit: a082cad)
- [x] **Task 15: Restyle ProblemStatement.tsx** ✅ (commit: ff971f7b)
- [x] **Task 16: Restyle Navbar** ✅ (commit: ff7904e)
- [x] **Task 17: Restyle Footer** ✅ (commit: d899d0e)

---

## Final Verification Wave

- [ ] F1. **Build Check** — `npm run build` → skipped (node runtime unavailable)
- [ ] F2. **Type Check** — `npm run typecheck` → skipped (node runtime unavailable)  
- [ ] F3. **Lint Check** — `npm run lint` → skipped (node runtime unavailable)
- [x] F4. **Code QA** — Manual grep verification: 70+ `--frost-border` usages, 11+ `--radius-pill` CTAs, all 17 files updated ✅

---

## Success Criteria

1. `npm run build` → PASS (code 0)
2. `npm run typecheck` → PASS (code 0)
3. `npm run lint` → PASS (budget maintained)
4. All 14 home page sections render on pure black void
5. All cards use frost borders (`rgba(214,235,253,0.19)`)
6. All CTA buttons are pill-shaped (9999px radius)
7. Navbar and footer use frost borders
8. Pricing section uses pill CTAs + frost cards
9. FAQ accordion uses frost borders
10. `prefers-reduced-motion` → animations disabled

---

## Commit Strategy

Group related components per commit:
1. `feat(design): add frost border + accent tokens to globals.css`
2. `refactor(home): apply frost/pill styling to Hero + FinalCTA`
3. `refactor(home): apply frost styling to card components (FeaturesBento, AIFeatures, HowItWorks, SocialProof, ComparisonSection)`
4. `refactor(home): apply frost styling to remaining components (PricingSection, FAQSection, LiveStatsStrip, PropFirmsExplorer, AnalysisDemo, AudienceSegmentation, ProblemStatement)`
5. `refactor(landing): apply frost styling to Navbar + Footer`
6. `chore(build): verify all checks pass after design refactor`
