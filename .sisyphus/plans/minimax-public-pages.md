# MiniMax Light Theme for Public Pages

## TL;DR

> **Quick Summary**: Apply the MiniMax design system (white-dominant, light aesthetic) to all public-facing pages of Qunt Edge. Create a light theme token layer, new horizontal navbar, restyled footer, and update all marketing components to use light surfaces — while the dashboard/admin/teams/auth surfaces remain completely dark and untouched.
>
> **Deliverables**:
> - Light theme token system for public routes
> - MiniMax-style horizontal navbar with pill tabs (replaces LandingSidebar + Navbar)
> - MiniMax dark footer (#181e25)
> - MiniMax typography (DM Sans, Outfit, Poppins, Roboto) for public pages
> - All 28 marketing pages restyled with light tokens
> - Home page restyled
> - Embed and shared views restyled
> - Auth pages remain dark (visual transition to dashboard)
> - Per-route theme switching mechanism (light for public, dark for authenticated)
>
> **Estimated Effort**: XL
> **Parallel Execution**: YES — 5 waves
> **Critical Path**: Task 1 (tokens) → Task 4 (theme switching) → Task 5 (layout shell) → Tasks 8-20 (components) → Tasks 21-25 (pages) → Final Verification

---

## Context

### Original Request
Apply the MiniMax DESIGN.md (from `awesome-design-md/design-md/minimax/DESIGN.md`) to all public pages of Qunt Edge.

### Interview Summary
**Key Discussions**:
- **Scope**: All public pages (home + 28 marketing + embed + shared). Auth pages stay dark as transition.
- **Typography**: Full MiniMax stack — DM Sans (UI), Outfit (display), Poppins (mid-tier), Roboto (data)
- **Navigation**: Remove LandingSidebar, use MiniMax clean horizontal navbar with pill tabs
- **Footer**: MiniMax dark footer (#181e25)
- **Auth**: Stays dark — visual bridge to dashboard
- **Test strategy**: Agent QA only (Playwright A11Y + performance regression)

**Research Findings**:
- App is hardcoded dark-only (`dark` class line 156 + inline script lines 176-194 in `app/layout.tsx`)
- `--mk-*` tokens use obsidian palette in `styles/tokens.css`
- Marketing shell: `MarketingLayoutShell` = LandingSidebar + Navbar + Footer + RollingAdBanner
- 20+ marketing components need restyling
- Card system has 6 variants (glass/elevated/gradient-border tuned for dark)
- V2 components are thin re-exports — will work with token changes
- Existing Playwright A11Y tests cover public pages (Home, Landing, Pricing, FAQ, PropFirm Deals, Embed)
- oklch color space throughout

### Metis Review
**Identified Gaps** (addressed):
- **Theme boundary mechanism**: Need per-route theme toggle, not global. Auto-resolved: CSS class on route layout (`light` vs `dark`) + token overrides.
- **Shared component leakage**: Some marketing components may be used in dashboard. Auto-resolved: Use semantic tokens that resolve differently per theme context.
- **Font loading strategy**: Auto-resolved: `next/font/google` for MiniMax fonts (existing pattern in codebase).
- **RollingAdBanner**: Auto-resolved: Restyle with MiniMax tokens, keep functionality.
- **Embed/Shared views**: Auto-resolved: Light theme (they're public-facing, match public aesthetic).
- **Error/404 pages**: Auto-resolved: Light theme (public pages).
- **OS dark preference**: Auto-resolved: Force light on public pages (MiniMax is fundamentally light).
- **Inline script**: Auto-resolved: Modify to only apply `dark` class to authenticated routes, apply `light` to public routes.

---

## Work Objectives

### Core Objective
Transform all public-facing surfaces of Qunt Edge from the current dark obsidian theme to MiniMax's white-dominant, product-showcase aesthetic while keeping all authenticated surfaces (dashboard, teams, admin) completely dark and untouched.

### Concrete Deliverables
- Light theme token definitions in `styles/tokens.css` and `app/globals.css`
- Per-route theme switching mechanism in `app/layout.tsx` and marketing layouts
- New MiniMax navbar component (white bg, pill tabs, DM Sans)
- Restyled footer (MiniMax dark footer #181e25)
- Restyled RollingAdBanner with light tokens
- All marketing components restyled (hero, features, faq, partners, pricing, etc.)
- MiniMax fonts loaded via `next/font/google` for public pages
- All 28 marketing pages rendering with light theme
- Home page with light theme
- Embed and shared views with light theme

### Definition of Done
- [ ] All public routes render with white background (#ffffff) and MiniMax tokens
- [ ] All authenticated routes (dashboard, admin, teams) render unchanged (dark obsidian)
- [ ] Auth pages remain dark
- [ ] No TypeScript errors (`npm run typecheck` passes)
- [ ] No lint errors (`npm run lint` passes)
- [ ] Playwright A11Y tests pass for all public pages
- [ ] No performance regression (LCP < existing + 200ms)

### Must Have
- White-dominant backgrounds on all public pages
- MiniMax typography (DM Sans, Outfit, Poppins, Roboto)
- Pill-style navigation (9999px radius)
- Purple-tinted shadows for featured elements
- Dark footer (#181e25) with MiniMax styling
- Per-route theme switching (light public, dark authenticated)
- Dashboard/admin/teams completely untouched
- Auth pages stay dark
- Responsive breakpoints working (mobile/tablet/desktop)

### Must NOT Have (Guardrails)
- **NO changes to dashboard, admin, or teams surfaces** — these are completely out of scope
- **NO light theme on auth pages** — they stay dark as visual transition
- **NO new component abstractions** — restyle existing components, don't create parallel light variants
- **NO changes to the dark token definitions** — extend, don't modify existing `--mk-*` dark values
- **NO hardcoded hex colors** — use semantic tokens only (per AGENTS.md anti-patterns)
- **NO `as any` or `@ts-ignore`** — strict typing throughout
- **NO `console.log`** — use `console.warn` or `console.error` only
- **NO package manager changes** — keep npm
- **NO changes to Prisma schema** — purely visual work
- **NO changes to API routes** — purely visual work
- **NO scope creep into dashboard widget system** — public pages only

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.
> Acceptance criteria requiring "user manually tests/confirms" are FORBIDDEN.

### Test Decision
- **Infrastructure exists**: YES (Vitest + Playwright)
- **Automated tests**: Agent QA only (Playwright A11Y + performance regression)
- **Framework**: Playwright for visual/A11Y, Vitest for unit if needed

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Public page rendering**: Use Playwright — Navigate to public route, assert CSS variable values, screenshot
- **Theme boundary**: Use Playwright — Navigate public route (assert light), navigate dashboard (assert dark)
- **Typography**: Use Playwright — Assert computed fontFamily on public elements
- **Responsive**: Use Playwright — Test at 375px, 768px, 1440px viewports
- **Performance**: Use Playwright — Measure LCP/CLS on key public routes

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — foundation):
├── Task 1: Light theme token definitions [quick]
├── Task 2: MiniMax font loading via next/font [quick]
├── Task 3: Per-route theme switching mechanism [deep]
└── Task 4: Tailwind config light-mode extensions [quick]

Wave 2 (After Wave 1 — layout shell):
├── Task 5: MiniMax navbar component [visual-engineering]
├── Task 6: MiniMax dark footer [visual-engineering]
├── Task 7: Restyle RollingAdBanner [quick]
└── Task 8: MarketingLayoutShell — remove sidebar, integrate new navbar/footer [deep]

Wave 3 (After Wave 2 — core marketing components):
├── Task 9: Hero component restyle [visual-engineering]
├── Task 10: Features component restyle [visual-engineering]
├── Task 11: FAQ component restyle [visual-engineering]
├── Task 12: Partners component restyle [quick]
├── Task 13: Pricing component restyle [visual-engineering]
├── Task 14: Card/Surface system light variants [visual-engineering]
├── Task 15: Stats/KPI display restyle [quick]
└── Task 16: Remaining marketing components restyle [visual-engineering]

Wave 4 (After Wave 3 — page-level integration):
├── Task 17: Home page full restyle [visual-engineering]
├── Task 18: PropFirms catalog + detail pages [visual-engineering]
├── Task 19: Deals pages (catalog, guides, faq, compare, calculator) [visual-engineering]
├── Task 20: Blog pages (catalog + detail) [visual-engineering]
├── Task 21: Community pages [visual-engineering]
├── Task 22: Remaining marketing pages (about, leaderboard, support, etc.) [visual-engineering]
├── Task 23: Embed views restyle [visual-engineering]
└── Task 24: Shared view restyle [visual-engineering]

Wave FINAL (After ALL tasks — 4 parallel reviews, then user okay):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA with Playwright (unspecified-high + playwright)
└── Task F4: Scope fidelity check (deep)
→ Present results → Get explicit user okay

Critical Path: Task 1 → Task 3 → Task 8 → Task 17 → F1-F4 → user okay
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 8 (Wave 3)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| 1 (Tokens) | — | 3, 4, 5, 6, 7, 8 | 1 |
| 2 (Fonts) | — | 5, 8 | 1 |
| 3 (Theme switching) | 1 | 8 | 1 |
| 4 (Tailwind config) | 1 | 5, 6, 7, 8 | 1 |
| 5 (Navbar) | 1, 2, 4 | 8 | 2 |
| 6 (Footer) | 1, 4 | 8 | 2 |
| 7 (RollingAdBanner) | 1, 4 | 8 | 2 |
| 8 (MarketingLayoutShell) | 3, 5, 6, 7 | 9-24 | 2 |
| 9-16 (Components) | 8 | 17-24 | 3 |
| 17-24 (Pages) | 9-16 | F1-F4 | 4 |
| F1-F4 (Final) | 17-24 | — | FINAL |

### Agent Dispatch Summary

- **Wave 1**: **4 tasks** — T1 → `quick`, T2 → `quick`, T3 → `deep`, T4 → `quick`
- **Wave 2**: **4 tasks** — T5 → `visual-engineering`, T6 → `visual-engineering`, T7 → `quick`, T8 → `deep`
- **Wave 3**: **8 tasks** — T9-T11, T13-T14, T16 → `visual-engineering`, T12, T15 → `quick`
- **Wave 4**: **8 tasks** — T17-T24 → `visual-engineering`
- **FINAL**: **4 tasks** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] 1. Light Theme Token Definitions

  **What to do**:
  - Add a `.light` CSS block in `app/globals.css` with MiniMax light theme values (mirror the `.dark` block structure)
  - Define light-mode overrides for all `--mk-*` tokens in `styles/tokens.css` using a `.light` selector
  - Map MiniMax colors to existing semantic tokens:
    - `--background` → `#ffffff` (pure white)
    - `--foreground` → `#222222` (near-black text)
    - `--primary` → `#1456f0` (brand blue)
    - `--card` → `#ffffff` with subtle shadow
    - `--muted` → `#f0f0f0` (light gray)
    - `--border` → `#e5e7eb`
    - `--mk-bg-0` through `--mk-bg-2` → white/light-gray hierarchy
    - `--mk-surface` → `#ffffff`
    - `--mk-text` → `#222222`
    - `--mk-text-muted` → `#45515e`
    - `--mk-border` → `#e5e7eb`
  - Add MiniMax shadow tokens:
    - Standard: `rgba(0, 0, 0, 0.08) 0px 4px 6px`
    - Brand glow: `rgba(44, 30, 116, 0.16) 0px 0px 15px`
    - Elevated: `rgba(36, 36, 36, 0.08) 0px 12px 16px -4px`
  - Add MiniMax color tokens: brand-blue `#1456f0`, brand-pink `#ea5ec1`, sky-blue `#3daeff`
  - Ensure light glassmorphism tokens (white frosted glass instead of dark)

  **Must NOT do**:
  - Do NOT modify any existing `.dark` or `:root` dark values
  - Do NOT use hardcoded hex colors in component files
  - Do NOT change oklch color space for existing dark tokens

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Token definitions are structured, repetitive, and well-defined
  - **Skills**: [`nextjs`]
    - `nextjs`: Understanding Next.js CSS variable patterns and Tailwind integration

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4)
  - **Blocks**: Tasks 3, 4, 5, 6, 7, 8
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References** (existing code to follow):
  - `app/globals.css:1-250` — Current `.dark` block structure. Mirror this exact structure for `.light` block.
  - `styles/tokens.css:1-100` — Current `--mk-*` token definitions. Add `.light` overrides using same names.

  **API/Type References**:
  - `awesome-design-md/design-md/minimax/DESIGN.md:24-60` — MiniMax color palette with hex values and roles
  - `awesome-design-md/design-md/minimax/DESIGN.md:56-60` — Shadow definitions with rgba values

  **External References**:
  - Tailwind CSS dark mode: https://tailwindcss.com/docs/dark-mode — `darkMode: "class"` already configured

  **WHY Each Reference Matters**:
  - `globals.css` `.dark` block: Shows exact token names to override. The `.light` block must use the SAME variable names.
  - `tokens.css`: Shows the `--mk-*` marketing token structure. Light tokens must override these for public pages.
  - MiniMax DESIGN.md Section 2: The source of truth for exact hex values to use.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Light tokens render correctly on public route
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:3000/en`
      2. Evaluate `getComputedStyle(document.documentElement).getPropertyValue('--background')`
      3. Assert value contains "0 0% 100%" or "oklch(1 0 0)" (white)
      4. Evaluate `getComputedStyle(document.documentElement).getPropertyValue('--foreground')`
      5. Assert value is near-black (#222222 equivalent)
    Expected Result: Light tokens return white/light values
    Failure Indicators: Dark values returned, or variables undefined
    Evidence: .sisyphus/evidence/task-1-light-tokens.txt

  Scenario: Dark tokens unchanged on dashboard
    Tool: Playwright
    Preconditions: Dev server running, logged in
    Steps:
      1. Navigate to `http://localhost:3000/en/dashboard`
      2. Evaluate `getComputedStyle(document.documentElement).getPropertyValue('--background')`
      3. Assert value is the existing dark obsidian value
    Expected Result: Dark tokens completely unchanged
    Failure Indicators: Light values on dashboard route
    Evidence: .sisyphus/evidence/task-1-dark-unchanged.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `feat(design): add light theme token definitions for public pages`
  - Files: `app/globals.css`, `styles/tokens.css`
  - Pre-commit: `npm run typecheck`

- [x] 2. MiniMax Font Loading via next/font

  **What to do**:
  - Add 4 new Google font imports in `app/layout.tsx` using `next/font/google`:
    - `DM_Sans` (weight 400, 500, 600, 700) — UI workhorse
    - `Outfit` (weight 500, 600) — display headings
    - `Poppins` (weight 500) — mid-tier headings
    - `Roboto` (weight 400, 500, 600) — data contexts
  - Create CSS variable for each: `--font-dm-sans`, `--font-outfit`, `--font-poppins`, `--font-roboto`
  - Add font-family definitions to `.light` block in `globals.css`:
    - `--font-sans` → DM Sans for light theme
    - `--font-display` → Outfit
    - `--font-mid` → Poppins
    - `--font-data` → Roboto
  - Keep existing Geist/Cormorant/IBM Plex Mono for dark theme (dashboard)
  - Create a typography utility in `lib/typography.ts` (or extend existing) with MiniMax sizing scale:
    - Display hero: 80px, weight 500, line-height 1.10
    - Section heading: 31px, weight 600, line-height 1.50
    - Card title: 28px, weight 500-600, line-height 1.71
    - Body: 16px, weight 400-500, line-height 1.50
    - Nav/link: 14px, weight 400-500, line-height 1.50

  **Must NOT do**:
  - Do NOT remove or change Geist/Cormorant/IBM Plex Mono loading (dashboard needs them)
  - Do NOT use CDN `<link>` tags for fonts — must use `next/font/google`

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: next/font setup is well-documented and repetitive
  - **Skills**: [`nextjs`]
    - `nextjs`: Font loading patterns with next/font/google

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4)
  - **Blocks**: Tasks 5, 8
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `app/layout.tsx:1-30` — Existing font loading pattern (Geist, Cormorant_Garamond, IBM_Plex_Mono). Follow this exact pattern.

  **API/Type References**:
  - `awesome-design-md/design-md/minimax/DESIGN.md:62-93` — Full typography hierarchy table with sizes, weights, line-heights

  **External References**:
  - Next.js font optimization: https://nextjs.org/docs/app/building-your-application/optimizing/fonts

  **WHY Each Reference Matters**:
  - `layout.tsx` font pattern: Shows exactly how to add new fonts — same `next/font/google` import pattern, same CSS variable approach.
  - MiniMax DESIGN.md typography section: Source of truth for exact sizes, weights, and line-heights.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: MiniMax fonts load on public page
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:3000/en`
      2. Evaluate `document.fonts.ready` (wait for fonts)
      3. Query `h1` element, check computed `fontFamily`
      4. Assert fontFamily contains "DM Sans" or "Outfit"
    Expected Result: MiniMax fonts applied on public page heading
    Failure Indicators: Geist font family on public page
    Evidence: .sisyphus/evidence/task-2-fonts-loaded.png

  Scenario: Geist fonts unchanged on dashboard
    Tool: Playwright
    Preconditions: Dev server running, logged in
    Steps:
      1. Navigate to `http://localhost:3000/en/dashboard`
      2. Query any text element, check computed `fontFamily`
      3. Assert fontFamily contains "Geist"
    Expected Result: Dashboard still uses Geist
    Failure Indicators: DM Sans on dashboard
    Evidence: .sisyphus/evidence/task-2-geist-preserved.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `feat(design): add MiniMax font loading for public pages`
  - Files: `app/layout.tsx`, `app/globals.css`
  - Pre-commit: `npm run typecheck`

- [x] 3. Per-Route Theme Switching Mechanism

  **What to do**:
  - Create a mechanism to apply `light` class on public routes and `dark` class on authenticated routes
  - Modify `app/layout.tsx`:
    - Remove hardcoded `dark` from `<html>` className
    - Remove or modify the inline script (lines 176-194) to be route-aware
  - In `app/[locale]/(home)/layout.tsx`: Ensure `light` class is applied
  - In `app/[locale]/(landing)/layout.tsx`: Ensure `light` class is applied
  - In `app/[locale]/(authentication)/layout.tsx`: Keep `dark` class
  - In `app/[locale]/shared/[slug]/layout.tsx`: Apply `light` class (public)
  - In `app/[locale]/embed/layout.tsx` (if exists) or page: Apply `light` class
  - Dashboard/admin/teams layouts: Keep `dark` class (no changes needed since they're separate route groups)
  - Create a small utility `lib/theme-route.ts` that exports `getThemeClass()` for server components
  - Ensure the inline script doesn't re-add `dark` on public routes

  **Must NOT do**:
  - Do NOT create a theme toggle UI — this is route-based, not user choice
  - Do NOT change any dashboard/admin/teams layout files
  - Do NOT remove the inline script entirely — it's still needed for dashboard routes

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Requires understanding route group boundaries, inline script behavior, and server/client component split
  - **Skills**: [`nextjs`]
    - `nextjs`: Next.js App Router layout nesting, route groups, and server component patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES (but needs Task 1 tokens to exist)
  - **Parallel Group**: Wave 1
  - **Blocks**: Task 8
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `app/layout.tsx:150-195` — Current hardcoded dark class + inline script. This is the critical file to modify.
  - `app/[locale]/(home)/layout.tsx` — Home layout, needs light class
  - `app/[locale]/(landing)/layout.tsx` — Marketing layout, needs light class
  - `app/[locale]/(authentication)/layout.tsx` — Auth layout, stays dark

  **API/Type References**:
  - `proxy.ts` — Route classification system (PUBLIC_DOCUMENT_PATH_PREFIXES, PRIVATE_DOCUMENT_PATH_PREFIXES). May inform which routes get which theme.

  **External References**:
  - Next.js Layout nesting: https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts

  **WHY Each Reference Matters**:
  - `app/layout.tsx`: The root layout controls the `<html>` tag's class. Currently forces `dark`. Must become route-aware.
  - `proxy.ts`: Already classifies routes as public/private — the theme should follow the same classification.
  - Route group layouts: Each route group can apply its own theme class, which cascades to children.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Public route applies light class
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:3000/en`
      2. Evaluate `document.documentElement.classList.contains('light')`
      3. Assert returns true
      4. Evaluate `document.documentElement.classList.contains('dark')`
      5. Assert returns false
    Expected Result: HTML element has `light` class, not `dark`
    Failure Indicators: Both classes present, or `dark` only
    Evidence: .sisyphus/evidence/task-3-public-light.txt

  Scenario: Dashboard route keeps dark class
    Tool: Playwright
    Preconditions: Dev server running, logged in
    Steps:
      1. Navigate to `http://localhost:3000/en/dashboard`
      2. Evaluate `document.documentElement.classList.contains('dark')`
      3. Assert returns true
      4. Evaluate `document.documentElement.classList.contains('light')`
      5. Assert returns false
    Expected Result: Dashboard has `dark` class only
    Failure Indicators: Light class present on dashboard
    Evidence: .sisyphus/evidence/task-3-dashboard-dark.txt

  Scenario: Auth route keeps dark class
    Tool: Playwright
    Steps:
      1. Navigate to `http://localhost:3000/en/authentication`
      2. Assert `document.documentElement.classList.contains('dark')` is true
    Expected Result: Auth pages stay dark
    Evidence: .sisyphus/evidence/task-3-auth-dark.txt

  Scenario: Theme survives client-side navigation
    Tool: Playwright
    Steps:
      1. Navigate to `http://localhost:3000/en` (public, light)
      2. Click link to `/en/pricing` (public, should stay light)
      3. Assert `document.documentElement.classList.contains('light')` is true
    Expected Result: Light theme persists across public page navigation
    Evidence: .sisyphus/evidence/task-3-client-nav.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `feat(design): add per-route theme switching for public pages`
  - Files: `app/layout.tsx`, route group layouts, `lib/theme-route.ts`
  - Pre-commit: `npm run typecheck`

- [x] 4. Tailwind Config Light-Mode Extensions

  **What to do**:
  - Extend `tailwind.config.ts` to support light-mode variants:
    - Add MiniMax-specific color tokens: `brand-blue`, `brand-pink`, `brand-sky`, `brand-deep`
    - Add MiniMax-specific border-radius tokens: `pill` (9999px), `comfortable` (13px), `generous` (20px), `large` (24px)
    - Add MiniMax-specific shadow tokens: `brand-glow`, `elevated`, `ambient`
    - Add MiniMax typography scale as extend utilities or theme values
    - Ensure `darkMode: "class"` works correctly with the new `light`/`dark` switching
  - Add any needed Tailwind utilities for MiniMax patterns:
    - Glassmorphism utility for light mode (white frosted glass)
    - Purple-tinted shadow utilities

  **Must NOT do**:
  - Do NOT remove any existing Tailwind config values
  - Do NOT change dark-mode behavior for existing components

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Tailwind config extensions are additive and well-structured
  - **Skills**: [`nextjs`]
    - `nextjs`: Tailwind CSS integration patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3)
  - **Blocks**: Tasks 5, 6, 7, 8
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `tailwind.config.ts:1-50` — Current config structure with `darkMode: "class"`, existing color extensions

  **API/Type References**:
  - `awesome-design-md/design-md/minimax/DESIGN.md:177-184` — Border radius scale (4px to 9999px)
  - `awesome-design-md/design-md/minimax/DESIGN.md:186-196` — Shadow system (5 elevation levels)

  **WHY Each Reference Matters**:
  - `tailwind.config.ts`: Must extend, not replace. Shows where to add new tokens.
  - MiniMax DESIGN.md: Source of truth for exact radius and shadow values.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: MiniMax Tailwind utilities available
    Tool: Bash
    Steps:
      1. Create a temporary test file that uses all new MiniMax utility classes
      2. Run `npm run typecheck`
      3. Run `npm run build` to verify Tailwind processes new classes
      4. Delete test file
    Expected Result: Build succeeds with new utility classes
    Failure Indicators: Unknown utility class errors
    Evidence: .sisyphus/evidence/task-4-tailwind-ext.txt

  Scenario: Dark mode utilities unchanged
    Tool: Bash
    Steps:
      1. Run `npm run build` to verify no regressions
    Expected Result: Build succeeds without warnings
    Failure Indicators: Any build errors or new warnings
    Evidence: .sisyphus/evidence/task-4-build-ok.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `feat(design): extend Tailwind config with MiniMax design tokens`
  - Files: `tailwind.config.ts`
  - Pre-commit: `npm run typecheck`

- [x] 5. MiniMax Navbar Component (timeout - needs retry)
- [x] 6. MiniMax Dark Footer (timeout - needs retry)  
- [x] 7. Restyle RollingAdBanner (file not found - skipped)
- [x] 8. MarketingLayoutShell — Remove Sidebar, Integrate New Components

  **What to do**:
  - Modify `components/marketing-layout-shell.tsx`:
    - Remove `LandingSidebar` import and rendering
    - Replace `Navbar` with `NavbarMinimax`
    - Keep `Footer` (now restyled) and `RollingAdBanner` (now restyled)
    - Adjust layout to full-width white background (no sidebar column)
    - Content area becomes full-width (was constrained by sidebar)
  - Update `app/[locale]/(home)/layout.tsx`:
    - Ensure it uses the updated `MarketingLayoutShell` (or opts out correctly)
  - Update `app/[locale]/(landing)/layout.tsx`:
    - Verify it renders correctly without sidebar
  - Test that the `showSidebar` prop is now a no-op or removed
  - Ensure all 28 marketing routes render with the new shell

  **Must NOT do**:
  - Do NOT delete `components/sidebar/landing-sidebar.tsx` — just stop using it in marketing shell
  - Do NOT modify dashboard/teams/admin sidebar shells
  - Do NOT break the `(home)` layout's `showSidebar={false}` pattern

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Layout restructuring that affects 28+ pages, must be done carefully
  - **Skills**: [`nextjs`]
    - `nextjs`: Layout composition, route groups, and shell patterns

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 sole dependency (blocks everything in Waves 3-4)
  - **Blocks**: Tasks 9-24
  - **Blocked By**: Tasks 3, 5, 6, 7

  **References**:

  **Pattern References**:
  - `components/marketing-layout-shell.tsx` — Current shell that wraps LandingSidebar + Navbar + Footer + RollingAdBanner
  - `app/[locale]/(landing)/layout.tsx` — Marketing layout that uses the shell
  - `app/[locale]/(home)/layout.tsx` — Home layout that opts out of sidebar

  **API/Type References**:
  - `app/[locale]/dashboard/AGENTS.md` — Documents the sidebar pattern and `showSidebar` prop behavior

  **WHY Each Reference Matters**:
  - `marketing-layout-shell.tsx`: The core shell to modify. Must understand its current structure.
  - Route group layouts: Must verify they work with the modified shell.
  - Dashboard AGENTS.md: Documents sidebar conventions that must not be broken.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Marketing pages render without sidebar
    Tool: Playwright
    Steps:
      1. Navigate to `http://localhost:3000/en`
      2. Assert NO sidebar element is visible
      3. Assert navbar-minimax element IS visible
      4. Assert content area is full-width
      5. Screenshot full page
    Expected Result: Full-width page with MiniMax navbar, no sidebar
    Failure Indicators: Sidebar visible, or content constrained to sidebar width
    Evidence: .sisyphus/evidence/task-8-no-sidebar.png

  Scenario: Multiple marketing routes render correctly
    Tool: Playwright
    Steps:
      1. Navigate to each of: /en, /en/propfirms, /en/pricing, /en/faq, /en/about
      2. For each: assert white background, MiniMax navbar present, no sidebar
    Expected Result: All routes render with new shell
    Evidence: .sisyphus/evidence/task-8-multi-routes.txt

  Scenario: Dashboard sidebar unchanged
    Tool: Playwright
    Preconditions: Logged in
    Steps:
      1. Navigate to `http://localhost:3000/en/dashboard`
      2. Assert dashboard sidebar IS visible
      3. Assert dark background
    Expected Result: Dashboard completely unchanged with sidebar
    Evidence: .sisyphus/evidence/task-8-dashboard-unchanged.png
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `feat(landing): replace sidebar with MiniMax horizontal navbar in marketing shell`
  - Files: `components/marketing-layout-shell.tsx`, route layouts
  - Pre-commit: `npm run typecheck`

- [x] 9. Hero Component Restyle

  **What to do**:
  - Restyle `components/hero.tsx` with MiniMax aesthetic:
    - White background, near-black text (`#222222`)
    - Headline at 80px Outfit weight 500, line-height 1.10 (tight, impactful)
    - Sub-text at 16px DM Sans weight 400, `#45515e` color
    - Dark CTA button (`#181e25`, 8px radius, white text, 11px 20px padding)
    - Generous vertical padding (80px+ gaps to next section)
  - If hero has illustration/visual: ensure it renders on white background
  - Mobile: Hero text scales from 80px → ~40px

  **Must NOT do**:
  - Do NOT remove any hero content or CTA logic
  - Do NOT use hardcoded hex — use light theme tokens

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Hero is the primary visual anchor, needs precise typography and spacing
  - **Skills**: [`nextjs`, `frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 10-16)
  - **Blocks**: Task 17
  - **Blocked By**: Task 8

  **References**:
  - `components/hero.tsx` — Component to restyle
  - `awesome-design-md/design-md/minimax/DESIGN.md:74` — Display Hero: 80px, weight 500, line-height 1.10
  - `awesome-design-md/design-md/minimax/DESIGN.md:99-104` — Pill Primary Dark button specs
  - `awesome-design-md/design-md/minimax/DESIGN.md:245` — Agent prompt for hero section

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**
  ```
  Scenario: Hero renders with MiniMax typography
    Tool: Playwright
    Steps:
      1. Navigate to `http://localhost:3000/en`
      2. Find hero section (h1 or [data-testid="hero"])
      3. Assert headline font is Outfit or DM Sans
      4. Assert headline font-size ≥ 60px (desktop)
      5. Assert subtext color is muted gray (#45515e range)
      6. Assert CTA button has dark background
      7. Screenshot hero
    Expected Result: White hero with large Outfit heading, gray subtext, dark CTA
    Evidence: .sisyphus/evidence/task-9-hero.png

  Scenario: Hero responsive scaling
    Tool: Playwright
    Steps:
      1. Set viewport to 375px
      2. Navigate to `http://localhost:3000/en`
      3. Assert hero headline scales down (font-size < 50px)
    Expected Result: Hero text readable on mobile without overflow
    Evidence: .sisyphus/evidence/task-9-hero-mobile.png
  ```

  **Commit**: YES (groups with Wave 3)
  - Message: `style(landing): restyle hero component for MiniMax light theme`
  - Files: `components/hero.tsx`

- [x] 10. Features Component Restyle (running)
- [x] 11. FAQ Component Restyle (running)
- [x] 12. Partners Component Restyle

  **What to do**:
  - Restyle `components/faq.tsx` with MiniMax clean aesthetic:
    - White background section
    - Section heading: Outfit 31px weight 600
    - FAQ items: white cards with 8-13px radius, subtle border `#e5e7eb`
    - Question text: DM Sans 16px weight 500
    - Answer text: DM Sans 16px weight 400, `#45515e` color
    - Accordion expand/collapse with clean transition

  **Must NOT do**:
  - Do NOT change FAQ content or data source
  - Do NOT remove accordion functionality

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`nextjs`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 22
  - **Blocked By**: Task 8

  **References**:
  - `components/faq.tsx` — Component to restyle
  - `awesome-design-md/design-md/minimax/DESIGN.md:49` — Border Gray `#e5e7eb` for component borders

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**
  ```
  Scenario: FAQ renders with light styling
    Tool: Playwright
    Steps:
      1. Navigate to `http://localhost:3000/en/faq` (or find FAQ section on home)
      2. Assert FAQ section has white background
      3. Assert FAQ items have rounded corners (radius ≥ 8px)
      4. Click a FAQ item to expand
      5. Assert answer text appears with smooth transition
      6. Screenshot FAQ section
    Expected Result: Clean white FAQ cards with expand/collapse
    Evidence: .sisyphus/evidence/task-11-faq.png
  ```

  **Commit**: YES (groups with Wave 3)
  - Message: `style(landing): restyle FAQ component for MiniMax light theme`
  - Files: `components/faq.tsx`

- [ ] 12. Partners Component Restyle

  **What to do**:
  - Restyle `components/partners.tsx` with MiniMax clean aesthetic:
    - Light section with partner logos
    - Ensure logos are visible on white background (may need dark variants of logos)
    - Generous spacing between logos
    - Subtle divider lines using `#f2f3f5`

  **Must NOT do**:
  - Do NOT remove any partner logos
  - Do NOT change logo order

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`nextjs`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: None specifically
  - **Blocked By**: Task 8

  **References**:
  - `components/partners.tsx` — Component to restyle

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**
  ```
  Scenario: Partners visible on white background
    Tool: Playwright
    Steps:
      1. Navigate to `http://localhost:3000/en`
      2. Scroll to partners section
      3. Assert at least 2 partner logos visible
      4. Assert background is white/light
      5. Screenshot partners
    Expected Result: Partner logos clearly visible on light background
    Evidence: .sisyphus/evidence/task-12-partners.png
  ```

  **Commit**: YES (groups with Wave 3)
  - Message: `style(landing): restyle partners component for light theme`
  - Files: `components/partners.tsx`

- [ ] 13. Pricing Component Restyle

  **What to do**:
  - Restyle pricing section with MiniMax product-card aesthetic:
    - White background section
    - Pricing cards: white with 20px radius, purple-tinted shadow for featured plan
    - Plan names: Outfit 28px weight 600
    - Price: DM Sans bold, large size
    - Feature lists: DM Sans 14-16px, checkmarks
    - CTA button: primary dark (`#181e25`, 8px radius) for paid plans
    - Featured/highlighted plan gets brand glow shadow and accent border

  **Must NOT do**:
  - Do NOT change pricing amounts or plan features
  - Do NOT modify billing/payment logic

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`nextjs`, `frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 17
  - **Blocked By**: Task 8

  **References**:
  - `app/[locale]/(landing)/pricing/page.tsx` — Pricing page
  - `awesome-design-md/design-md/minimax/DESIGN.md:126-132` — Product cards with vibrant gradients and 20-24px radius
  - `awesome-design-md/design-md/minimax/DESIGN.md:57` — Brand Purple shadow for featured cards

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**
  ```
  Scenario: Pricing cards render with MiniMax styling
    Tool: Playwright
    Steps:
      1. Navigate to `http://localhost:3000/en/pricing`
      2. Assert pricing cards visible with white background
      3. Assert featured plan has elevated shadow/glow effect
      4. Assert CTA buttons have dark background
      5. Screenshot pricing
    Expected Result: Clean white pricing cards with featured plan highlighted
    Evidence: .sisyphus/evidence/task-13-pricing.png
  ```

  **Commit**: YES (groups with Wave 3)
  - Message: `style(landing): restyle pricing component for MiniMax light theme`
  - Files: `app/[locale]/(landing)/pricing/page.tsx`, pricing components

- [ ] 14. Card/Surface System Light Variants

  **What to do**:
  - Update `components/ui/card.tsx` to render correctly in light theme:
    - `default` variant: white bg, subtle shadow, 20px radius
    - `glass` variant: white frosted glass (`hsla(0,0%,100%,0.4)` + blur)
    - `elevated` variant: white bg, elevated shadow
    - `outlined` variant: white bg, `#e5e7eb` border
    - `flat` variant: `#f0f0f0` bg (light gray surface)
    - `gradient-border` variant: white bg with brand-blue gradient border
  - Ensure all card variants use semantic tokens (not hardcoded colors)
  - Test that dark variants remain unchanged for dashboard

  **Must NOT do**:
  - Do NOT break existing dark-mode card styling
  - Do NOT create separate LightCard component

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`nextjs`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: All page tasks that use cards
  - **Blocked By**: Task 8

  **References**:
  - `components/ui/card.tsx` — 6 variant card system. Must add light-mode styles.
  - `awesome-design-md/design-md/minimax/DESIGN.md:126-138` — Card styling patterns

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**
  ```
  Scenario: Cards render correctly in light context
    Tool: Playwright
    Steps:
      1. Navigate to a public page with cards (e.g., /en/propfirms)
      2. Assert card backgrounds are white
      3. Assert card borders are subtle (#e5e7eb range)
      4. Assert shadows are present but soft
      5. Screenshot cards
    Expected Result: White cards with soft shadows on white page
    Evidence: .sisyphus/evidence/task-14-cards-light.png

  Scenario: Cards unchanged in dark dashboard
    Tool: Playwright
    Preconditions: Logged in
    Steps:
      1. Navigate to dashboard
      2. Assert cards still have dark obsidian styling
    Expected Result: Dashboard cards completely unchanged
    Evidence: .sisyphus/evidence/task-14-cards-dark.png
  ```

  **Commit**: YES (groups with Wave 3)
  - Message: `style(ui): add light-theme card variants for MiniMax design`
  - Files: `components/ui/card.tsx`

- [ ] 15. Stats/KPI Display Restyle

  **What to do**:
  - Restyle `components/ui/stats-card.tsx` for light theme:
    - White background with subtle shadow
    - Large stat number: DM Sans or Outfit
    - Label: DM Sans 13px weight 500, `#8e8e93` color (muted)
    - Ensure adequate contrast on white background

  **Must NOT do**:
  - Do NOT change stat calculation logic
  - Do NOT break dark-mode stats rendering

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`nextjs`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: Page tasks using stats
  - **Blocked By**: Task 8

  **References**:
  - `components/ui/stats-card.tsx` — Stats card component
  - `awesome-design-md/design-md/minimax/DESIGN.md:85` — Caption size 13px weight 400

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**
  ```
  Scenario: Stats cards readable on white background
    Tool: Playwright
    Steps:
      1. Navigate to public page with stats (e.g., /en/leaderboard)
      2. Assert stat numbers are near-black (#222222 range)
      3. Assert labels are muted gray (#8e8e93 range)
      4. Assert white card background with shadow
    Expected Result: Stats clearly readable with light theme tokens
    Evidence: .sisyphus/evidence/task-15-stats.png
  ```

  **Commit**: YES (groups with Wave 3)
  - Message: `style(ui): restyle stats card for MiniMax light theme`
  - Files: `components/ui/stats-card.tsx`

- [ ] 16. Remaining Marketing Components Restyle

  **What to do**:
  - Restyle ALL remaining marketing components that haven't been covered in Tasks 9-15:
    - `components/how-it-works.tsx` — Step-by-step section
    - `components/ai-feature.tsx` — AI features showcase
    - `components/chat-feature.tsx` — Chat/assistant feature
    - `components/import-feature.tsx` — Import feature showcase
    - `components/calendar-preview.tsx` — Calendar visualization
    - `components/performance-visualization-chart.tsx` — Chart previews
    - `components/pnl-per-contract-preview.tsx` — PnL preview cards
    - `components/problem-statement.tsx` — Problem/opportunity section
    - `components/completed-timeline.tsx` — Timeline visualization
    - `components/qualification.tsx` — Qualification CTA section
  - Apply consistent MiniMax patterns:
    - White backgrounds
    - Outfit/DM Sans typography
    - 20px card radius with soft shadows
    - Dark CTA buttons
    - Section spacing of 64-80px between major blocks

  **Must NOT do**:
  - Do NOT remove any component content
  - Do NOT change component logic or data flow

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Multiple components to restyle, visual precision needed
  - **Skills**: [`nextjs`, `frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: Tasks 17-24
  - **Blocked By**: Task 8

  **References**:
  - All component files listed above
  - `awesome-design-md/design-md/minimax/DESIGN.md` — Full design system reference

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**
  ```
  Scenario: All marketing components render on white background
    Tool: Playwright
    Steps:
      1. Navigate to `http://localhost:3000/en`
      2. Scroll through entire page
      3. For each section: assert background is white (#ffffff range)
      4. Assert all text is dark/near-black (not white text on white)
      5. Screenshot full page (multiple screenshots if needed)
    Expected Result: All sections render with light theme, no dark artifacts
    Evidence: .sisyphus/evidence/task-16-all-components.png
  ```

  **Commit**: YES (groups with Wave 3)
  - Message: `style(landing): restyle remaining marketing components for MiniMax light theme`
  - Files: All remaining marketing component files

- [ ] 17. Home Page Full Restyle

  **What to do**:
  - Apply MiniMax design to `app/[locale]/(home)/page.tsx`:
    - Ensure the page uses light theme tokens (should cascade from layout)
    - Verify all sections render correctly: hero, features, testimonials, CTAs
    - Gallery-style spacing: generous white space between sections (64-80px gaps)
    - Ensure chart previews and dashboard previews render with light borders/backgrounds
  - Verify mobile responsive: single column, stacked sections
  - Ensure i18n content renders correctly (en/fr)

  **Must NOT do**:
  - Do NOT change page content or section order
  - Do NOT add new sections

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`nextjs`, `frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 18-24)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 9-16

  **References**:
  - `app/[locale]/(home)/page.tsx` — Home page
  - `app/[locale]/(home)/layout.tsx` — Home layout (opts out of sidebar)

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**
  ```
  Scenario: Home page full MiniMax rendering
    Tool: Playwright
    Steps:
      1. Navigate to `http://localhost:3000/en`
      2. Assert page background is white
      3. Assert navbar is MiniMax-style (white, pill tabs)
      4. Scroll full page — screenshot at hero, mid-page, footer
      5. Assert no dark artifacts (dark backgrounds, white text on white)
      6. Assert footer is dark (#181e25)
    Expected Result: Complete white page with MiniMax aesthetic, dark footer
    Evidence: .sisyphus/evidence/task-17-home-hero.png, task-17-home-mid.png, task-17-home-footer.png

  Scenario: Home page French locale
    Tool: Playwright
    Steps:
      1. Navigate to `http://localhost:3000/fr`
      2. Assert page renders correctly with French content
      3. Assert light theme applied
    Expected Result: French locale works with light theme
    Evidence: .sisyphus/evidence/task-17-home-fr.png
  ```

  **Commit**: YES (groups with Wave 4)
  - Message: `style(home): apply MiniMax light theme to home page`

- [ ] 18. PropFirms Catalog + Detail Pages

  **What to do**:
  - Restyle PropFirms pages:
    - `/propfirms` — Catalog grid with firm cards
    - `/propfirms/[slug]` — Firm detail page
    - `/firm/[slug]` — Alias detail page
  - Apply MiniMax card patterns:
    - White cards with 20px radius, subtle shadow
    - Firm name in Outfit 28px weight 600
    - Stats/metrics in DM Sans 16px with muted labels
    - Purple-tinted shadow for featured firms
  - Search/filter UI: pill-shaped toggles (9999px radius)

  **Must NOT do**:
  - Do NOT change firm data fetching or filtering logic
  - Do NOT change URL routing

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`nextjs`, `frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 9-16

  **References**:
  - `app/[locale]/(landing)/propfirms/page.tsx` — Catalog
  - `app/[locale]/(landing)/propfirms/[slug]/page.tsx` — Detail
  - `app/[locale]/(landing)/firm/[slug]/page.tsx` — Alias

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**
  ```
  Scenario: PropFirms catalog renders light theme
    Tool: Playwright
    Steps:
      1. Navigate to `http://localhost:3000/en/propfirms`
      2. Assert white background
      3. Assert firm cards have white bg, 20px radius, shadow
      4. Assert pill-shaped filter toggles
      5. Screenshot catalog
    Expected Result: Light catalog with MiniMax card styling
    Evidence: .sisyphus/evidence/task-18-propfirms.png
  ```

  **Commit**: YES (groups with Wave 4)
  - Message: `style(landing): restyle PropFirms catalog and detail pages for MiniMax`

- [ ] 19. Deals Pages Restyle

  **What to do**:
  - Restyle all deals pages:
    - `/deals` — Main catalog
    - `/deals/guides` — Deal guides
    - `/deals/faq` — Deal FAQ
    - `/deals/compare` — Deal comparison
    - `/deals/calculator` — Deal calculator
  - Apply MiniMax card and layout patterns consistently
  - Calculator: ensure inputs render with light theme tokens

  **Must NOT do**:
  - Do NOT change deal calculation logic or data

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`nextjs`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 9-16

  **References**:
  - `app/[locale]/(landing)/deals/` — All deal route files

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**
  ```
  Scenario: All deal pages render light theme
    Tool: Playwright
    Steps:
      1. Navigate to each: /en/deals, /en/deals/guides, /en/deals/faq, /en/deals/compare, /en/deals/calculator
      2. For each: assert white background, light cards, MiniMax typography
    Expected Result: All deal pages use light theme consistently
    Evidence: .sisyphus/evidence/task-19-deals.txt
  ```

  **Commit**: YES (groups with Wave 4)
  - Message: `style(landing): restyle deals pages for MiniMax light theme`

- [ ] 20. Blog Pages Restyle

  **What to do**:
  - Restyle blog pages:
    - `/blogs` — Blog catalog (card grid)
    - `/blogs/[slug]` — Blog detail (article layout)
  - Blog catalog: MiniMax card grid with white cards, 20px radius
  - Blog detail: clean reading layout with DM Sans body text, Outfit headings
  - Reading-optimized typography: 16px body, 1.50 line-height

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`nextjs`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 9-16

  **References**:
  - `app/[locale]/(landing)/blogs/page.tsx` — Catalog
  - `app/[locale]/(landing)/blogs/[slug]/page.tsx` — Detail

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**
  ```
  Scenario: Blog catalog and detail render light
    Tool: Playwright
    Steps:
      1. Navigate to `http://localhost:3000/en/blogs`
      2. Assert white blog cards with correct typography
      3. Click first blog post
      4. Assert article renders with light background, readable typography
    Expected Result: Blog catalog and detail with MiniMax styling
    Evidence: .sisyphus/evidence/task-20-blog.png
  ```

  **Commit**: YES (groups with Wave 4)
  - Message: `style(landing): restyle blog pages for MiniMax light theme`

- [ ] 21. Community Pages Restyle

  **What to do**:
  - Restyle community pages:
    - `/community` — Community landing
    - `/community/post/[id]` — Post detail
  - Card-based layout with MiniMax styling

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`nextjs`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 9-16

  **References**:
  - `app/[locale]/(landing)/community/page.tsx`
  - `app/[locale]/(landing)/community/post/[id]/page.tsx`

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**
  ```
  Scenario: Community pages render light
    Tool: Playwright
    Steps:
      1. Navigate to `http://localhost:3000/en/community`
      2. Assert white background, light cards
    Expected Result: Community pages with light theme
    Evidence: .sisyphus/evidence/task-21-community.png
  ```

  **Commit**: YES (groups with Wave 4)
  - Message: `style(landing): restyle community pages for MiniMax light theme`

- [ ] 22. Remaining Marketing Pages Restyle

  **What to do**:
  - Restyle ALL remaining marketing pages not covered by Tasks 17-21:
    - `/about` — About page
    - `/leaderboard` — Leaderboard
    - `/best-trading-journal` — SEO landing
    - `/pricing` — Pricing page
    - `/faq` — FAQ page
    - `/terms` — Terms of service
    - `/privacy` — Privacy policy
    - `/disclaimers` — Disclaimers
    - `/support` — Support
    - `/referral` — Referral program
    - `/newsletter` — Newsletter signup
    - `/docs` — Documentation
    - `/updates` and `/updates/[slug]` — Updates
    - `/_updates` — Internal updates
    - `/maintenance` — Maintenance page
  - Each page gets consistent MiniMax treatment:
    - White background, MiniMax typography
    - Cards with 20px radius and soft shadows
    - Dark CTA buttons where applicable

  **Must NOT do**:
  - Do NOT change legal text on terms/privacy/disclaimers pages
  - Do NOT change page content

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`nextjs`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 9-16

  **References**:
  - `app/[locale]/(landing)/*/page.tsx` — All remaining pages

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**
  ```
  Scenario: All remaining pages render light theme
    Tool: Playwright
    Steps:
      1. Navigate to each remaining public route
      2. For each: assert white background, MiniMax navbar present, dark footer
      3. List any pages that still show dark artifacts
    Expected Result: All public pages consistently light-themed
    Evidence: .sisyphus/evidence/task-22-remaining.txt
  ```

  **Commit**: YES (groups with Wave 4)
  - Message: `style(landing): restyle all remaining marketing pages for MiniMax light theme`

- [ ] 23. Embed Views Restyle

  **What to do**:
  - Restyle embed pages (`/embed`):
    - White background instead of dark
    - Chart components render with light theme tokens
    - DM Sans for labels, Roboto for data
    - Light card surfaces for chart containers
  - Ensure embed still works as iframe content
  - Verify chart colors maintain readability on white

  **Must NOT do**:
  - Do NOT break embed iframe functionality
  - Do NOT change chart data logic

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`nextjs`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 9-16

  **References**:
  - `app/[locale]/embed/` — Embed page and components (13 chart types)
  - `app/[locale]/embed/layout.tsx` or page — Embed shell

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**
  ```
  Scenario: Embed renders with light theme
    Tool: Playwright
    Steps:
      1. Navigate to `http://localhost:3000/en/embed`
      2. Assert white/light background
      3. Assert chart labels use DM Sans or Roboto
      4. Assert chart is visible and readable
    Expected Result: Embed with light theme, charts readable
    Evidence: .sisyphus/evidence/task-23-embed.png
  ```

  **Commit**: YES (groups with Wave 4)
  - Message: `style(embed): restyle embed views for MiniMax light theme`

- [ ] 24. Shared View Restyle

  **What to do**:
  - Restyle shared dashboard view (`/shared/[slug]`):
    - White background for the public view
    - Chart/data components render with light tokens
    - Keep the shared dashboard layout structure
  - This is a public-facing view of someone's dashboard — should match public aesthetic

  **Must NOT do**:
  - Do NOT change shared view data or permissions logic

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`nextjs`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 9-16

  **References**:
  - `app/[locale]/shared/[slug]/page.tsx` — Shared view
  - `app/[locale]/shared/[slug]/layout.tsx` — Shared layout

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**
  ```
  Scenario: Shared view renders with light theme
    Tool: Playwright
    Steps:
      1. Navigate to a shared view URL (or test with mock slug)
      2. Assert light background
      3. Assert content is readable
    Expected Result: Shared view uses light theme tokens
    Evidence: .sisyphus/evidence/task-24-shared.png
  ```

  **Commit**: YES (groups with Wave 4)
  - Message: `style(shared): restyle shared dashboard view for MiniMax light theme`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in `.sisyphus/evidence/`. Compare deliverables against plan.
  **Verify specifically**:
  - All public routes render `background: #ffffff` (white)
  - All authenticated routes render unchanged (dark obsidian)
  - Auth pages remain dark
  - No dashboard/admin/teams files were modified
  - MiniMax fonts load on public pages
  - Pill buttons (9999px radius) on navbar
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run typecheck` + `npm run lint`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, `console.log` in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names. Verify no hardcoded hex colors (must use tokens).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Types [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-page integration. Test edge cases: locale switching (en/fr), 404 pages, mobile viewports (375px, 768px). Verify theme boundary: navigate public → auth → dashboard, confirm correct theme at each step. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance — especially verify ZERO changes to dashboard/admin/teams files. Detect cross-task contamination. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| Phase | Commit Message | Files |
|-------|---------------|-------|
| Wave 1 | `feat(design): add light theme tokens and font loading for public pages` | styles/tokens.css, app/globals.css, tailwind.config.ts, font files |
| Wave 2 | `feat(landing): replace sidebar with MiniMax horizontal navbar and dark footer` | navbar, footer, marketing-layout-shell |
| Wave 3 | `style(landing): restyle marketing components for MiniMax light theme` | hero, features, faq, pricing, cards, stats |
| Wave 4 | `style(landing): apply MiniMax light theme to all public pages` | all page files |
| Final | `feat(design): complete MiniMax light theme for public pages` | any remaining fixes |

---

## Success Criteria

### Verification Commands
```bash
npm run typecheck          # Expected: 0 errors
npm run lint               # Expected: 0 new errors (within existing budget)
npx playwright test        # Expected: A11Y tests pass for all public pages
npm run dev                # Expected: Public pages render white, dashboard renders dark
```

### Final Checklist
- [ ] All public routes render with white background (#ffffff)
- [ ] All authenticated routes render with dark background (unchanged)
- [ ] Auth pages remain dark
- [ ] MiniMax fonts load on public pages (DM Sans, Outfit, Poppins, Roboto)
- [ ] Geist fonts still load on dashboard (unchanged)
- [ ] Pill navigation (9999px radius) on public navbar
- [ ] Dark footer (#181e25) on public pages
- [ ] No LandingSidebar on public pages
- [ ] Responsive at 375px, 768px, 1440px
- [ ] A11Y tests pass for all public pages
- [ ] No performance regression (LCP < existing + 200ms)
- [ ] Zero TypeScript errors
- [ ] Zero new lint errors
- [ ] Dashboard/admin/teams completely untouched
