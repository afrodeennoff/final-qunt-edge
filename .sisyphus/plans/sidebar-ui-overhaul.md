# Sidebar UI Overhaul — All Authenticated Surfaces

## TL;DR

> **Quick Summary**: Rebuild the sidebar system across Dashboard, Teams, and Admin with modern composable patterns. Break the monolithic 535-line `UnifiedSidebar` into smaller primitives, unify provider/layouts, generalize `MobileBottomNav`, and fix visual inconsistencies across all surfaces.
> 
> **Deliverables**:
> - Refactored `UnifiedSidebar` broken into composable sub-components
> - Unified provider pattern (`SidebarRootProviders`) across all 3 layouts
> - Generalized `MobileBottomNav` with per-surface config
> - Consistent header shell component
> - Extracted layout constants and background gradient component
> - Updated Teams sidebar with header + mobile nav
> - Updated Admin sidebar with user menu + mobile nav
> 
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Task 1 → Task 4 → Task 5 → Task 8 → Task 9 → Task 12 → F1-F4

---

## Context

### Original Request
Full UI overhaul of the sidebar across all 3 authenticated surfaces (Dashboard, Teams, Admin). Rebuild with modern patterns — fix visual polish, mobile/responsive, and interaction feedback equally.

### Interview Summary
**Key Discussions**:
- Scope: Dashboard + Teams + Admin sidebars (Landing excluded)
- Priority: Equal across visual, layout/responsive, interaction/feedback
- Provider pattern: Unify all 3 surfaces on `SidebarRootProviders`
- UnifiedSidebar: Refactor into smaller composable primitives (user selected "all 3" — clean up, refactor, and rewrite)
- MobileBottomNav: Generalize with per-surface config for all surfaces

**Research Findings**:
- `components/ui/sidebar.tsx` (797 lines) — shadcn primitive, stable foundation
- `components/ui/unified-sidebar.tsx` (535 lines) — monolithic wrapper handling grouping, active link, nav loading, user menu, timezone
- Inconsistent provider nesting across 3 layouts
- Duplicated gradient markup in teams layouts
- Inconsistent header styling (z-40 vs z-50, border opacity, padding)
- Only Dashboard has MobileBottomNav
- Admin sidebar has no user menu/timezone/logout
- Test infrastructure exists: Vitest + Playwright, 3 existing sidebar tests

### Gap Analysis
**Identified Gaps** (addressed):
- Teams provider inconsistency → Unify on SidebarRootProviders
- MobileBottomNav not generalized → Make it accept items config
- No shared header shell → Extract `SidebarLayoutShell` component
- Hardcoded layout values → Extract to `lib/constants/layout.ts`
- Duplicated gradient backgrounds → Extract `BackgroundGlow` component
- `useActiveLink()` edge cases for Teams sub-routes → Verify and fix
- Cookie parsing edge case (undefined → true) → Document as intentional default-open

---

## Work Objectives

### Core Objective
Rebuild the sidebar UI system into a clean composable architecture with consistent visual design, responsive behavior, and interaction feedback across all 3 authenticated surfaces.

### Concrete Deliverables
- `components/ui/sidebar-primitives/` — Extracted composable sub-components from UnifiedSidebar
- `lib/constants/layout.ts` — Shared layout constants (header height, padding, z-indices)
- `components/ui/background-glow.tsx` — Shared decorative background gradient
- `components/ui/sidebar-layout-shell.tsx` — Shared authenticated layout shell
- Generalized `components/mobile-bottom-nav.tsx` — Accepts config items
- Updated `app/[locale]/dashboard/layout.tsx`
- Updated `app/[locale]/teams/dashboard/layout.tsx`
- Updated `app/[locale]/teams/manage/layout.tsx`
- Updated `app/[locale]/admin/admin-client-layout.tsx`
- Updated `app/[locale]/admin/components/sidebar-nav.tsx` (add user menu)
- Updated `components/sidebar/dashboard-sidebar.tsx`
- Updated `app/[locale]/teams/components/teams-sidebar.tsx`

### Definition of Done
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes (within warning budget)
- [ ] `npm run test` passes (existing sidebar tests + new tests)
- [ ] All 3 authenticated surfaces render sidebar with consistent visual treatment
- [ ] Mobile: all 3 surfaces show MobileBottomNav with appropriate items
- [ ] Sidebar state persists correctly via cookie across surface transitions
- [ ] Active link detection works for all routes including Teams sub-routes

### Must Have
- Unified provider pattern across all 3 layouts
- Consistent header styling (z-index, border, padding, backdrop-blur)
- Composable sidebar primitives (group nav, user menu, logo header)
- MobileBottomNav on all 3 surfaces
- Admin sidebar with user menu/timezone/logout
- Consistent styleVariant across surfaces
- Active link detection working for all route patterns including `?tab=` params
- Navigation loading spinner on all surfaces

### Must NOT Have (Guardrails)
- Do NOT touch the Landing sidebar (`components/sidebar/landing-sidebar.tsx`) or its layout
- Do NOT change the `sidebar:state` cookie contract (name, max-age, value format)
- Do NOT introduce `as any` or `@ts-ignore` — ESLint error per AGENTS.md
- Do NOT create a 4th sidebar variant — all surfaces use the same UnifiedSidebar component
- Do NOT break the `isSidebarEnabledRoute` logic in unified-sidebar.tsx
- Do NOT add hardcoded hex colors — use semantic tokens only (`--sidebar-*`)
- Do NOT remove the keyboard shortcut (Cmd/Ctrl+Shift+B)
- Do NOT change the mobile breakpoint (767px)
- Do NOT break existing sidebar tests without replacing them
- Do NOT use `console.log` — use `console.warn` or `console.error`
- Do NOT wrap Card components inside bordered panels (no stacked frames)
- Do NOT create route segment exports (`dynamic`/`revalidate`) in route files with cache components

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (Vitest + Playwright)
- **Automated tests**: YES (tests-after — update existing, add new for new components)
- **Framework**: Vitest (unit) + Playwright (E2E)

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright — Navigate, interact, assert DOM, screenshot
- **API/Backend**: Use Bash (curl) — Send requests, assert status + response fields
- **Library/Module**: Use Bash (bun test / npx vitest) — Run tests, verify pass

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — foundation + constants):
├── Task 1: Extract layout constants [quick]
├── Task 2: Extract BackgroundGlow component [quick]
├── Task 3: Extract SidebarLayoutShell component [quick]
├── Task 4: Refactor UnifiedSidebar into composable primitives [deep]
└── Task 5: Generalize MobileBottomNav [quick]

Wave 2 (After Wave 1 — rewire layouts):
├── Task 6: Update Dashboard layout + sidebar [unspecified-high]
├── Task 7: Update Teams layouts + sidebar [unspecified-high]
├── Task 8: Update Admin layout + sidebar [unspecified-high]
└── Task 9: Generalize MobileBottomNav [quick] -- WAIT, moved to Wave 1

Wave 2 (After Wave 1 — rewire layouts):
├── Task 6: Update Dashboard layout to use new primitives [unspecified-high]
├── Task 7: Update Teams layouts to use new primitives [unspecified-high]
├── Task 8: Update Admin layout to use new primitives [unspecified-high]
└── Task 9: Add/update sidebar unit tests [unspecified-high]

Wave 3 (After Wave 2 — polish + edge cases):
├── Task 10: Verify active link detection for all route patterns [deep]
├── Task 11: Verify navigation loading UX across surfaces [quick]
└── Task 12: Cross-surface visual consistency audit [visual-engineering]

Wave FINAL (After ALL tasks — 4 parallel reviews):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)
→ Present results → Get explicit user okay

Critical Path: Task 1 → Task 4 → Task 6/7/8 → Task 10 → Task 12 → F1-F4
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 5 (Wave 1)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| 1 | — | 3, 6, 7, 8 | 1 |
| 2 | — | 3, 6, 7, 8 | 1 |
| 3 | 1, 2 | 6, 7, 8 | 1 |
| 4 | — | 6, 7, 8, 9 | 1 |
| 5 | — | 6, 7, 8 | 1 |
| 6 | 3, 4, 5 | 9, 10 | 2 |
| 7 | 3, 4, 5 | 9, 10 | 2 |
| 8 | 3, 4, 5 | 9, 10 | 2 |
| 9 | 6, 7, 8 | F1-F4 | 2 |
| 10 | 6, 7, 8 | 12 | 3 |
| 11 | 6, 7, 8 | 12 | 3 |
| 12 | 10, 11 | F1-F4 | 3 |

### Agent Dispatch Summary

- **Wave 1**: **5** — T1 `quick`, T2 `quick`, T3 `quick`, T4 `deep`, T5 `quick`
- **Wave 2**: **4** — T6 `unspecified-high`, T7 `unspecified-high`, T8 `unspecified-high`, T9 `unspecified-high`
- **Wave 3**: **3** — T10 `deep`, T11 `quick`, T12 `visual-engineering`
- **FINAL**: **4** — F1 `oracle`, F2 `unspecified-high`, F3 `unspecified-high`, F4 `deep`

---

## TODOs

- [ ] 1. Extract Layout Constants

  **What to do**:
  - Create `lib/constants/layout.ts` with all shared layout values currently hardcoded across files
  - Export constants: `HEADER_HEIGHT = 'h-16'`, `CONTENT_PADDING = 'px-4 sm:px-6 lg:px-8'`, `CONTENT_PADDING_Y = 'py-6 sm:py-8 lg:py-8'`, `HEADER_Z_INDEX = 'z-50'`, `HEADER_BORDER = 'border-b border-border/60'`, `HEADER_BG = 'bg-background/95 backdrop-blur-md'`
  - Update `lib/constants/sidebar.ts` to remain as-is (icon size, nav timeout) — don't merge
  - Update `lib/config/z-index.ts` if needed to include header z-index

  **Must NOT do**:
  - Do not modify existing `lib/constants/sidebar.ts` values
  - Do not create a barrel export file

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4, 5)
  - **Blocks**: Tasks 3, 6, 7, 8
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `lib/constants/sidebar.ts` — Existing constant pattern (simple exports, no barrel)
  - `lib/config/z-index.ts` — Existing z-index pattern
  - `lib/config/breakpoints.ts` — Existing config constant pattern

  **API/Type References**:
  - `app/[locale]/teams/dashboard/layout.tsx:55` — Uses `h-16`, `z-40`, `border-border/70`, `bg-background/95 backdrop-blur-md`
  - `app/[locale]/teams/manage/layout.tsx:49` — Uses `h-16`, `z-40`, `border-border/70`, `bg-background/95 backdrop-blur-md`
  - `app/[locale]/admin/admin-client-layout.tsx:44` — Uses `h-16`, `z-50`, `border-border/60`, `bg-background/95 backdrop-blur-md`
  - `app/[locale]/dashboard/layout.tsx:96` — Uses `px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8`

  **WHY Each Reference Matters**:
  - The layout files show the exact hardcoded values to extract and where they're used
  - The constants files show the established pattern for this codebase

  **Acceptance Criteria**:

  - [ ] File created: `lib/constants/layout.ts`
  - [ ] All 6+ layout constants exported as named exports
  - [ ] `npx tsc --noEmit` passes (no type errors from new file)

  **QA Scenarios:**

  ```
  Scenario: Constants file exports expected values
    Tool: Bash
    Preconditions: File exists at lib/constants/layout.ts
    Steps:
      1. Run: grep -c "export const" lib/constants/layout.ts
      2. Assert: count >= 6
    Expected Result: At least 6 named constant exports
    Failure Indicators: Fewer than 6 exports found
    Evidence: .sisyphus/evidence/task-1-constants-exports.txt

  Scenario: Constants match hardcoded values in layouts
    Tool: Bash
    Preconditions: lib/constants/layout.ts created
    Steps:
      1. grep "HEADER_HEIGHT" lib/constants/layout.ts | grep "h-16"
      2. grep "HEADER_Z_INDEX" lib/constants/layout.ts | grep "z-50"
    Expected Result: Constants match the most common values across layouts
    Failure Indicators: Values don't match what layouts use
    Evidence: .sisyphus/evidence/task-1-values-match.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `refactor(sidebar): extract shared layout constants`
  - Files: `lib/constants/layout.ts`
  - Pre-commit: `npx tsc --noEmit`

- [ ] 2. Extract BackgroundGlow Component

  **What to do**:
  - Create `components/ui/background-glow.tsx` — shared decorative background gradient component
  - Extract the duplicated gradient from both Teams layouts and the Dashboard layout
  - The component should accept optional `className` and `variant` prop (default="primary")
  - Dashboard uses radial gradient with `--v2-accent`, Teams uses `bg-primary/6` and `bg-primary/8` — support both via variant

  **Must NOT do**:
  - Do not change the visual appearance of the gradients
  - Do not create multiple variants beyond what's needed

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4, 5)
  - **Blocks**: Tasks 3, 6, 7, 8
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `components/ui/stats-card.tsx` — Example of a simple shared UI component
  - `components/ui/chart-surface.tsx` — Example of wrapper component with className prop

  **API/Type References**:
  - `app/[locale]/teams/dashboard/layout.tsx:49-52` — Duplicated gradient: `bg-primary/6 blur-[120px] animate-pulse-slow`
  - `app/[locale]/teams/manage/layout.tsx:43-46` — Identical gradient markup
  - `app/[locale]/dashboard/layout.tsx:85-89` — Dashboard gradient: `radial-gradient(ellipse...)` + grid pattern

  **WHY Each Reference Matters**:
  - The Teams layouts show the exact gradient markup to extract
  - Dashboard shows a different gradient pattern — the component needs to support both
  - The component patterns show how to build a shared UI component in this codebase

  **Acceptance Criteria**:

  - [ ] File created: `components/ui/background-glow.tsx`
  - [ ] Component accepts `className` and `variant` props
  - [ ] `npx tsc --noEmit` passes

  **QA Scenarios:**

  ```
  Scenario: BackgroundGlow renders without error
    Tool: Bash
    Preconditions: Component file exists
    Steps:
      1. Verify file exports a named function BackgroundGlow
      2. Verify component accepts className and variant props in its type
    Expected Result: Component exports correctly with expected props
    Failure Indicators: Missing export, missing props
    Evidence: .sisyphus/evidence/task-2-component-exists.txt

  Scenario: Component matches existing gradient patterns
    Tool: Bash
    Preconditions: BackgroundGlow created
    Steps:
      1. Grep for "blur-\\[120px\\]" in background-glow.tsx
      2. Grep for "animate-pulse-slow" in background-glow.tsx
    Expected Result: Contains the same animation/blur patterns as existing layouts
    Failure Indicators: Missing animation classes
    Evidence: .sisyphus/evidence/task-2-gradient-patterns.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `refactor(sidebar): extract BackgroundGlow component`
  - Files: `components/ui/background-glow.tsx`
  - Pre-commit: `npx tsc --noEmit`

- [ ] 3. Extract SidebarLayoutShell Component

  **What to do**:
  - Create `components/ui/sidebar-layout-shell.tsx` — shared authenticated layout structure
  - This component encapsulates the common layout pattern: sidebar + SidebarInset + header + content area
  - Props: `sidebar` (ReactNode), `header` (ReactNode), `children` (ReactNode), `mobileNav` (ReactNode, optional)
  - Use the constants from Task 1 for header height, z-index, border, bg
  - Use BackgroundGlow from Task 2 for the decorative background
  - Include the `pointer-events-none` overlay and `relative z-0` content wrapper pattern
  - Support both sticky header (Teams/Admin pattern) and dynamic-imported header (Dashboard pattern)

  **Must NOT do**:
  - Do not force all layouts into identical structure — Dashboard has unique elements (theme script, DashboardProvider, scroll reset, error boundary)
  - Do not remove Dashboard-specific features (DashboardProvider, theme bootstrap)
  - Do not change the actual page content areas

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`nextjs`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Tasks 1, 2)
  - **Parallel Group**: Wave 1 (with Tasks 4, 5)
  - **Blocks**: Tasks 6, 7, 8
  - **Blocked By**: Tasks 1, 2

  **References**:

  **Pattern References**:
  - `app/[locale]/dashboard/layout.tsx:67-110` — Dashboard layout structure (most complex)
  - `app/[locale]/teams/dashboard/layout.tsx:42-76` — Teams layout structure
  - `app/[locale]/admin/admin-client-layout.tsx:35-58` — Admin layout structure

  **API/Type References**:
  - `components/ui/sidebar.tsx:SidebarInset` — The SidebarInset component that wraps main content
  - `lib/constants/layout.ts` (from Task 1) — Layout constants to use
  - `components/ui/background-glow.tsx` (from Task 2) — Background component to use

  **WHY Each Reference Matters**:
  - The 3 layout files show the common pattern to extract and the differences to preserve
  - Dashboard is the most complex — the shell must accommodate its extra elements

  **Acceptance Criteria**:

  - [ ] File created: `components/ui/sidebar-layout-shell.tsx`
  - [ ] Component accepts sidebar, header, children, mobileNav props
  - [ ] Uses layout constants from Task 1
  - [ ] Uses BackgroundGlow from Task 2
  - [ ] `npx tsc --noEmit` passes

  **QA Scenarios:**

  ```
  Scenario: Shell component renders with all props
    Tool: Bash
    Preconditions: File exists
    Steps:
      1. Verify SidebarLayoutShell export exists
      2. Verify props include sidebar, header, children, mobileNav
      3. Verify it imports from lib/constants/layout
      4. Verify it imports BackgroundGlow
    Expected Result: Component properly typed with all required props and imports
    Failure Indicators: Missing exports, props, or imports
    Evidence: .sisyphus/evidence/task-3-shell-component.txt

  Scenario: Shell uses consistent header styling
    Tool: Bash
    Preconditions: Component created
    Steps:
      1. Grep for HEADER_Z_INDEX in sidebar-layout-shell.tsx
      2. Grep for HEADER_BORDER in sidebar-layout-shell.tsx
      3. Grep for HEADER_BG in sidebar-layout-shell.tsx
    Expected Result: Uses constants instead of hardcoded values
    Failure Indicators: Still has hardcoded h-16, z-40/z-50, border values
    Evidence: .sisyphus/evidence/task-3-uses-constants.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `refactor(sidebar): extract SidebarLayoutShell component`
  - Files: `components/ui/sidebar-layout-shell.tsx`
  - Pre-commit: `npx tsc --noEmit`

- [ ] 4. Refactor UnifiedSidebar into Composable Primitives

  **What to do**:
  - Break `components/ui/unified-sidebar.tsx` (535 lines) into smaller composable sub-components
  - Create `components/ui/sidebar-primitives/` directory with:
    - `sidebar-logo-header.tsx` — Extract the SidebarHeader with logo + brand (lines 297-317 of unified-sidebar.tsx)
    - `sidebar-nav-group.tsx` — Extract the collapsible group rendering logic (lines 320-437)
    - `sidebar-user-menu.tsx` — Extract the SidebarFooter with user dropdown (lines 446-531)
    - `use-sidebar-nav.ts` — Extract `useActiveLink` hook + navigation loading state
    - `types.ts` — Shared types (UnifiedSidebarItem, UnifiedSidebarConfig, PendingNavigation)
  - The main `UnifiedSidebar` component in `unified-sidebar.tsx` should become a thin orchestrator (~80-120 lines) that composes these primitives
  - Keep the public API identical: `UnifiedSidebar`, `UnifiedSidebarItem`, `UnifiedSidebarConfig`, `useActiveLink` all still export from `unified-sidebar.tsx`
  - Re-export from `unified-sidebar.tsx` so no consumer imports break

  **Must NOT do**:
  - Do not break the public API — all existing imports of `UnifiedSidebar`, `UnifiedSidebarItem`, `UnifiedSidebarConfig`, `useActiveLink` must continue working
  - Do not change the visual appearance or behavior
  - Do not touch `components/ui/sidebar.tsx` (the primitive layer)
  - Do not create barrel exports — use direct file imports
  - Do not use `as any` or `@ts-ignore`
  - Do not remove the `isSidebarEnabledRoute` logic

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`nextjs`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 5)
  - **Blocks**: Tasks 6, 7, 8, 9
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `components/ui/sidebar.tsx` — The primitive layer — understand what it provides so you don't duplicate
  - `components/ui/unified-sidebar.tsx` — THE file to refactor (535 lines)
  - `components/ui/chart-surface.tsx` — Example of composable component with sub-components

  **API/Type References**:
  - `components/sidebar/dashboard-sidebar.tsx` — Consumer of UnifiedSidebar (must not break)
  - `app/[locale]/teams/components/teams-sidebar.tsx` — Consumer of UnifiedSidebar (must not break)
  - `app/[locale]/admin/components/sidebar-nav.tsx` — Consumer of UnifiedSidebar (must not break)
  - `components/sidebar/landing-sidebar.tsx` — Consumer of UnifiedSidebar (must not break)

  **Test References**:
  - `components/sidebar/__tests__/sidebar.test.tsx` — Existing tests (must still pass)
  - `tests/sidebar-trigger-contract.test.ts` — Sidebar trigger contract test
  - `lib/__tests__/sidebar-state.test.ts` — Sidebar state tests

  **WHY Each Reference Matters**:
  - unified-sidebar.tsx is the target file — every line must be accounted for in the refactored output
  - The 4 consumer files show the public API contract that must be preserved
  - The test files show what behavior must continue to pass

  **Acceptance Criteria**:

  - [ ] `components/ui/sidebar-primitives/` directory created with 4+ files
  - [ ] `unified-sidebar.tsx` reduced to ~120 lines or less (thin orchestrator)
  - [ ] All public exports preserved: `UnifiedSidebar`, `UnifiedSidebarItem`, `UnifiedSidebarConfig`, `useActiveLink`
  - [ ] All existing sidebar tests pass: `npx vitest run --reporter=verbose 2>&1 | grep -E "(PASS|FAIL)" | grep -i sidebar`
  - [ ] `npx tsc --noEmit` passes
  - [ ] No visual or behavioral changes — same active indicator, same loading spinner, same group collapse

  **QA Scenarios:**

  ```
  Scenario: Public API preserved — all imports resolve
    Tool: Bash
    Preconditions: Refactored code in place
    Steps:
      1. grep -r "from '@/components/ui/unified-sidebar'" --include="*.tsx" --include="*.ts" -l
      2. Verify all files still import UnifiedSidebar, UnifiedSidebarItem, useActiveLink
      3. Run npx tsc --noEmit
    Expected Result: All imports resolve, zero type errors
    Failure Indicators: Import resolution errors, type errors
    Evidence: .sisyphus/evidence/task-4-api-preserved.txt

  Scenario: Existing sidebar tests still pass
    Tool: Bash
    Preconditions: Refactored code in place
    Steps:
      1. npx vitest run components/sidebar/__tests__/sidebar.test.tsx
      2. npx vitest run tests/sidebar-trigger-contract.test.ts
      3. npx vitest run lib/__tests__/sidebar-state.test.ts
    Expected Result: All 3 test files pass
    Failure Indicators: Any test failure
    Evidence: .sisyphus/evidence/task-4-tests-pass.txt

  Scenario: UnifiedSidebar reduced in size
    Tool: Bash
    Preconditions: Refactoring complete
    Steps:
      1. wc -l components/ui/unified-sidebar.tsx
      2. ls components/ui/sidebar-primitives/
    Expected Result: unified-sidebar.tsx <= 120 lines, sidebar-primitives/ has 4+ files
    Failure Indicators: unified-sidebar.tsx still >200 lines, missing primitive files
    Evidence: .sisyphus/evidence/task-4-file-sizes.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `refactor(sidebar): break UnifiedSidebar into composable primitives`
  - Files: `components/ui/sidebar-primitives/*.tsx`, `components/ui/sidebar-primitives/*.ts`, `components/ui/unified-sidebar.tsx`
  - Pre-commit: `npx tsc --noEmit && npx vitest run`

- [ ] 5. Generalize MobileBottomNav

  **What to do**:
  - Refactor `components/mobile-bottom-nav.tsx` to accept an `items` config instead of hardcoded Dashboard items
  - Define a `MobileNavItem` type: `{ href: string; icon: React.ReactNode; label: string }`
  - Keep default items as Dashboard items for backward compatibility
  - Ensure the component still uses dynamic imports and the same visual styling
  - Export the `MobileNavItem` type for consumers to use

  **Must NOT do**:
  - Do not change the visual appearance
  - Do not remove the Dashboard default items
  - Do not use `as any`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`nextjs`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 4)
  - **Blocks**: Tasks 6, 7, 8
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `components/mobile-bottom-nav.tsx` — THE file to generalize (read current implementation)

  **API/Type References**:
  - `app/[locale]/dashboard/layout.tsx:28-31` — Current dynamic import usage pattern
  - `app/[locale]/dashboard/layout.tsx:104` — Current placement in layout (`<MobileBottomNav />`)

  **WHY Each Reference Matters**:
  - The mobile-bottom-nav file shows current hardcoded items and component structure
  - The layout shows how it's imported and placed

  **Acceptance Criteria**:

  - [ ] `MobileBottomNav` accepts `items?: MobileNavItem[]` prop
  - [ ] `MobileNavItem` type exported
  - [ ] Default items (Dashboard) preserved when no prop passed
  - [ ] `npx tsc --noEmit` passes

  **QA Scenarios:**

  ```
  Scenario: MobileBottomNav accepts items config
    Tool: Bash
    Preconditions: Component generalized
    Steps:
      1. grep "items" components/mobile-bottom-nav.tsx
      2. grep "MobileNavItem" components/mobile-bottom-nav.tsx
    Expected Result: Component has items prop, MobileNavItem type exported
    Failure Indicators: No items prop found, no type export
    Evidence: .sisyphus/evidence/task-5-generalized.txt

  Scenario: Backward compatible — Dashboard layout unchanged
    Tool: Bash
    Preconditions: Changes made
    Steps:
      1. grep "MobileBottomNav" app/\\[locale\\]/dashboard/layout.tsx
      2. npx tsc --noEmit
    Expected Result: Dashboard layout still works without passing items prop
    Failure Indicators: Type errors in dashboard layout
    Evidence: .sisyphus/evidence/task-5-backward-compat.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `refactor(sidebar): generalize MobileBottomNav with configurable items`
  - Files: `components/mobile-bottom-nav.tsx`
  - Pre-commit: `npx tsc --noEmit`

- [ ] 6. Update Dashboard Layout + Sidebar

  **What to do**:
  - Update `app/[locale]/dashboard/layout.tsx` to use `SidebarLayoutShell` from Task 3
  - Replace hardcoded header styling with constants from Task 1
  - Replace duplicated background gradient with `BackgroundGlow` from Task 2
  - Pass Dashboard-specific MobileBottomNav items to the generalized component
  - Keep Dashboard-specific features: `DashboardProvider`, theme bootstrap script, `DashboardClientOverlays`, `DashboardScrollReset`, `ErrorBoundary`
  - Update `components/sidebar/dashboard-sidebar.tsx` to use `styleVariant="default"` for consistency (or standardize across surfaces — pick one)
  - Ensure the `DashboardSidebar` still receives `isAdmin` prop and renders correctly

  **Must NOT do**:
  - Do not remove DashboardProvider, theme bootstrap, or error boundary
  - Do not change the Dashboard's unique content area layout
  - Do not remove dynamic imports (DashboardHeader, DashboardClientOverlays, MobileBottomNav)
  - Do not change the `isSidebarEnabledRoute` logic

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`nextjs`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 8, 9)
  - **Blocks**: Tasks 9, 10
  - **Blocked By**: Tasks 3, 4, 5

  **References**:

  **Pattern References**:
  - `app/[locale]/dashboard/layout.tsx` — THE file to update (112 lines)
  - `components/sidebar/dashboard-sidebar.tsx` — Dashboard sidebar config (168 lines)
  - `components/providers/root-providers.tsx` — SidebarRootProviders (already used by Dashboard)

  **API/Type References**:
  - `components/ui/sidebar-layout-shell.tsx` (Task 3) — Shell component to use
  - `components/ui/background-glow.tsx` (Task 2) — Background component to use
  - `lib/constants/layout.ts` (Task 1) — Constants to use
  - `components/mobile-bottom-nav.tsx` (Task 5) — Generalized MobileBottomNav

  **WHY Each Reference Matters**:
  - Dashboard layout is the most complex — it has theme bootstrapping, multiple dynamic imports, and extra providers
  - The shell must accommodate these without forcing them into the shared component

  **Acceptance Criteria**:

  - [ ] Dashboard layout uses `SidebarLayoutShell` or equivalent extracted patterns
  - [ ] No hardcoded `h-16`, `z-40`/`z-50`, `border-border/60`/`border-border/70` remain
  - [ ] `BackgroundGlow` used instead of inline gradient
  - [ ] MobileBottomNav still renders with Dashboard items
  - [ ] `npx tsc --noEmit` passes
  - [ ] Existing sidebar tests pass

  **QA Scenarios:**

  ```
  Scenario: Dashboard layout compiles without errors
    Tool: Bash
    Preconditions: Changes applied
    Steps:
      1. npx tsc --noEmit 2>&1 | grep -i "dashboard/layout"
    Expected Result: No type errors referencing dashboard/layout
    Failure Indicators: Type errors in dashboard layout
    Evidence: .sisyphus/evidence/task-6-typecheck.txt

  Scenario: No hardcoded layout values remain
    Tool: Bash
    Preconditions: Changes applied
    Steps:
      1. grep -n "h-16\\|z-40\\|z-50\\|border-border/70\\|border-border/60" app/\\[locale\\]/dashboard/layout.tsx
    Expected Result: No matches (all replaced with constants)
    Failure Indicators: Hardcoded values still present
    Evidence: .sisyphus/evidence/task-6-no-hardcoded.txt

  Scenario: Dashboard sidebar renders correctly
    Tool: Bash
    Preconditions: Dev server running (npm run dev)
    Steps:
      1. curl -s http://localhost:3000/dashboard -o /dev/null -w "%{http_code}"
    Expected Result: HTTP 200 or 302 (redirect to auth if not logged in)
    Failure Indicators: 500 error
    Evidence: .sisyphus/evidence/task-6-renders.txt
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `refactor(sidebar): update dashboard layout to use shared shell and constants`
  - Files: `app/[locale]/dashboard/layout.tsx`, `components/sidebar/dashboard-sidebar.tsx`
  - Pre-commit: `npx tsc --noEmit`

- [ ] 7. Update Teams Layouts + Sidebar

  **What to do**:
  - Update `app/[locale]/teams/dashboard/layout.tsx` to use `SidebarRootProviders` instead of inline `SidebarProvider` + `AuthTimeout`
  - Update `app/[locale]/teams/manage/layout.tsx` to use `SidebarRootProviders` instead of inline `SidebarProvider` + `AuthTimeout`
  - Both layouts should use `SidebarLayoutShell` from Task 3
  - Replace duplicated gradient markup with `BackgroundGlow` from Task 2
  - Replace hardcoded header styling with constants from Task 1
  - Add `MobileBottomNav` with Teams-specific items (Overview, Analytics, Traders, Members, Main Dashboard)
  - Update `app/[locale]/teams/components/teams-sidebar.tsx` to pass `styleVariant` consistently
  - Ensure auth guard pattern matches Dashboard (`createClient()` + redirect)

  **Must NOT do**:
  - Do not change Teams auth guard logic (redirect pattern is correct)
  - Do not remove the `Suspense` + `AuthProfileButton` in manage layout
  - Do not change Teams-specific route resolution in `resolveTeamPathContext`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`nextjs`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 8, 9)
  - **Blocks**: Tasks 9, 10
  - **Blocked By**: Tasks 3, 4, 5

  **References**:

  **Pattern References**:
  - `app/[locale]/dashboard/layout.tsx` — Reference for SidebarRootProviders pattern (after Task 6 updates)
  - `app/[locale]/teams/dashboard/layout.tsx` — Teams dashboard layout (77 lines, update this)
  - `app/[locale]/teams/manage/layout.tsx` — Teams manage layout (76 lines, update this)
  - `app/[locale]/teams/components/teams-sidebar.tsx` — Teams sidebar (110 lines, update styleVariant)

  **API/Type References**:
  - `components/providers/root-providers.tsx` — SidebarRootProviders to use
  - `components/ui/sidebar-layout-shell.tsx` (Task 3) — Shell to use
  - `components/ui/background-glow.tsx` (Task 2) — Background to use
  - `lib/constants/layout.ts` (Task 1) — Constants to use
  - `components/mobile-bottom-nav.tsx` (Task 5) — MobileBottomNav to add

  **WHY Each Reference Matters**:
  - Dashboard layout (after Task 6) shows the target pattern to match
  - Both Teams layouts show the current state and what needs changing
  - teams-sidebar.tsx shows the Teams nav items needed for MobileBottomNav config

  **Acceptance Criteria**:

  - [ ] Both Teams layouts use `SidebarRootProviders`
  - [ ] Both Teams layouts use `SidebarLayoutShell` or shared patterns
  - [ ] No inline gradient markup remains
  - [ ] No hardcoded header values (`h-16`, `z-40`, `border-border/70`)
  - [ ] `MobileBottomNav` renders with Teams items
  - [ ] Teams sidebar has consistent `styleVariant`
  - [ ] `npx tsc --noEmit` passes

  **QA Scenarios:**

  ```
  Scenario: Teams layouts use SidebarRootProviders
    Tool: Bash
    Preconditions: Changes applied
    Steps:
      1. grep "SidebarRootProviders" app/\\[locale\\]/teams/dashboard/layout.tsx
      2. grep "SidebarRootProviders" app/\\[locale\\]/teams/manage/layout.tsx
    Expected Result: Both files import and use SidebarRootProviders
    Failure Indicators: Missing import or usage
    Evidence: .sisyphus/evidence/task-7-providers.txt

  Scenario: Duplicated gradient removed
    Tool: Bash
    Preconditions: Changes applied
    Steps:
      1. grep -c "bg-primary/6.*blur-\\[120px\\]" app/\\[locale\\]/teams/dashboard/layout.tsx
      2. grep -c "bg-primary/6.*blur-\\[120px\\]" app/\\[locale\\]/teams/manage/layout.tsx
    Expected Result: Count is 0 in both files (replaced with BackgroundGlow)
    Failure Indicators: Inline gradient still present
    Evidence: .sisyphus/evidence/task-7-gradient-removed.txt

  Scenario: MobileBottomNav present in Teams layouts
    Tool: Bash
    Preconditions: Changes applied
    Steps:
      1. grep "MobileBottomNav" app/\\[locale\\]/teams/dashboard/layout.tsx
    Expected Result: MobileBottomNav imported and rendered
    Failure Indicators: Missing import or render
    Evidence: .sisyphus/evidence/task-7-mobile-nav.txt
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `refactor(sidebar): update teams layouts to use shared shell, providers, and mobile nav`
  - Files: `app/[locale]/teams/dashboard/layout.tsx`, `app/[locale]/teams/manage/layout.tsx`, `app/[locale]/teams/components/teams-sidebar.tsx`
  - Pre-commit: `npx tsc --noEmit`

- [ ] 8. Update Admin Layout + Sidebar

  **What to do**:
  - Update `app/[locale]/admin/admin-client-layout.tsx`:
    - Remove redundant `RootProviders` + `DashboardProviders` wrapping (SidebarProvider is already inside these)
    - Use `SidebarRootProviders` instead (matching Dashboard pattern)
    - Use `SidebarLayoutShell` from Task 3
    - Replace hardcoded header with shared constants
    - Add `MobileBottomNav` with Admin items
  - Update `app/[locale]/admin/components/sidebar-nav.tsx`:
    - Add user menu with avatar, email, display name
    - Add timezone selector
    - Add logout action
    - Pass `user`, `timezone`, `onLogout` to `UnifiedSidebar` (matching Dashboard/Teams pattern)
    - Add consistent `styleVariant`

  **Must NOT do**:
  - Do not remove Admin auth guard (isAdminUser check in server layout)
  - Do not remove the error handling for hash-based auth errors
  - Do not load Dashboard-specific providers that Admin doesn't need (DataProvider chain)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`nextjs`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 7, 9)
  - **Blocks**: Tasks 9, 10
  - **Blocked By**: Tasks 3, 4, 5

  **References**:

  **Pattern References**:
  - `app/[locale]/dashboard/layout.tsx` — Reference for SidebarRootProviders pattern
  - `app/[locale]/admin/admin-client-layout.tsx` — Admin client layout (60 lines, update this)
  - `app/[locale]/admin/components/sidebar-nav.tsx` — Admin sidebar nav (58 lines, update this)
  - `components/sidebar/dashboard-sidebar.tsx` — Reference for user menu + logout pattern

  **API/Type References**:
  - `components/providers/root-providers.tsx` — SidebarRootProviders
  - `components/ui/sidebar-layout-shell.tsx` (Task 3) — Shell to use
  - `lib/constants/layout.ts` (Task 1) — Constants to use
  - `components/mobile-bottom-nav.tsx` (Task 5) — MobileBottomNav to add

  **WHY Each Reference Matters**:
  - Dashboard layout shows the target provider pattern
  - dashboard-sidebar.tsx shows the user menu + timezone + logout pattern to copy
  - Admin client layout has redundant providers to remove
  - Admin sidebar-nav is missing user menu entirely

  **Acceptance Criteria**:

  - [ ] Admin layout uses `SidebarRootProviders` (no redundant RootProviders + DashboardProviders)
  - [ ] Admin layout uses `SidebarLayoutShell` or shared patterns
  - [ ] Admin sidebar has user menu with avatar, email, timezone, logout
  - [ ] `MobileBottomNav` renders with Admin items
  - [ ] No hardcoded header values remain
  - [ ] `npx tsc --noEmit` passes

  **QA Scenarios:**

  ```
  Scenario: Admin uses SidebarRootProviders
    Tool: Bash
    Preconditions: Changes applied
    Steps:
      1. grep "SidebarRootProviders" app/\\[locale\\]/admin/admin-client-layout.tsx
    Expected Result: Import and usage present
    Failure Indicators: Missing
    Evidence: .sisyphus/evidence/task-8-providers.txt

  Scenario: Admin sidebar has user menu
    Tool: Bash
    Preconditions: Changes applied
    Steps:
      1. grep "onLogout" app/\\[locale\\]/admin/components/sidebar-nav.tsx
      2. grep "timezone" app/\\[locale\\]/admin/components/sidebar-nav.tsx
      3. grep "user" app/\\[locale\\]/admin/components/sidebar-nav.tsx
    Expected Result: All three props passed to UnifiedSidebar
    Failure Indicators: Missing any of the three
    Evidence: .sisyphus/evidence/task-8-user-menu.txt

  Scenario: No redundant DashboardProviders in Admin
    Tool: Bash
    Preconditions: Changes applied
    Steps:
      1. grep "DashboardProviders" app/\\[locale\\]/admin/admin-client-layout.tsx
    Expected Result: No match (removed redundant provider)
    Failure Indicators: DashboardProviders still present
    Evidence: .sisyphus/evidence/task-8-no-redundant.txt
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `refactor(sidebar): update admin layout with unified providers, user menu, and mobile nav`
  - Files: `app/[locale]/admin/admin-client-layout.tsx`, `app/[locale]/admin/components/sidebar-nav.tsx`
  - Pre-commit: `npx tsc --noEmit`

- [ ] 9. Add/Update Sidebar Unit Tests

  **What to do**:
  - Update `components/sidebar/__tests__/sidebar.test.tsx` to cover refactored composable primitives
  - Add tests for `SidebarLayoutShell` component
  - Add tests for `BackgroundGlow` component
  - Add tests for generalized `MobileBottomNav` (with custom items)
  - Add tests for admin sidebar user menu rendering
  - Verify existing tests (`tests/sidebar-trigger-contract.test.ts`, `lib/__tests__/sidebar-state.test.ts`) still pass
  - If test infrastructure needs `@testing-library/react`, install it

  **Must NOT do**:
  - Do not skip running existing tests
  - Do not use `as any` in test files
  - Do not mock more than necessary — prefer shallow rendering

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`nextjs`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (partial — can write tests in parallel, but should run after Tasks 6-8)
  - **Parallel Group**: Wave 2 (with Tasks 6, 7, 8)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 6, 7, 8

  **References**:

  **Pattern References**:
  - `components/sidebar/__tests__/sidebar.test.tsx` — Existing sidebar test pattern
  - `lib/__tests__/sidebar-state.test.ts` — Existing unit test pattern

  **Test References**:
  - `tests/sidebar-trigger-contract.test.ts` — Contract test to verify still passes
  - `vitest.config.ts` — Vitest configuration

  **WHY Each Reference Matters**:
  - Existing tests show the assertion style and mock strategy to follow
  - Vitest config shows how tests are configured

  **Acceptance Criteria**:

  - [ ] New test files created for new components
  - [ ] `npx vitest run` — all tests pass (0 failures)
  - [ ] Test coverage for: SidebarLayoutShell, BackgroundGlow, MobileBottomNav with items, admin user menu

  **QA Scenarios:**

  ```
  Scenario: All tests pass
    Tool: Bash
    Preconditions: All test files written
    Steps:
      1. npx vitest run --reporter=verbose 2>&1 | tail -20
    Expected Result: "Tests X passed | Y failed" with Y = 0
    Failure Indicators: Any test failure
    Evidence: .sisyphus/evidence/task-9-tests-pass.txt

  Scenario: Existing sidebar tests unchanged
    Tool: Bash
    Preconditions: Tests updated
    Steps:
      1. npx vitest run tests/sidebar-trigger-contract.test.ts --reporter=verbose
      2. npx vitest run lib/__tests__/sidebar-state.test.ts --reporter=verbose
    Expected Result: Both pass
    Failure Indicators: Any failure in existing tests
    Evidence: .sisyphus/evidence/task-9-existing-tests.txt
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `test(sidebar): add tests for composable primitives, shell, and generalized mobile nav`
  - Files: Test files
  - Pre-commit: `npx vitest run`

- [ ] 10. Verify Active Link Detection for All Route Patterns

  **What to do**:
  - Audit `useActiveLink()` hook (now in `components/ui/sidebar-primitives/use-sidebar-nav.ts`) for all route patterns
  - Verify it handles: Dashboard `?tab=` params, Teams `/teams/dashboard/[slug]/analytics`, Teams `/teams/manage`, Admin `/admin/*`, nested routes
  - Verify it correctly strips locale prefixes (`/en/`, `/fr/`)
  - Fix any edge cases where active detection fails
  - Test with: exact routes, nested routes, tab routes, cross-surface navigation

  **Must NOT do**:
  - Do not change the default tab handling (`/dashboard` → `?tab=widgets`) without verifying Dashboard behavior
  - Do not break the existing active state visual indicator (left-edge pill)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`nextjs`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 11, 12)
  - **Blocks**: Task 12
  - **Blocked By**: Tasks 6, 7, 8

  **References**:

  **Pattern References**:
  - `components/ui/unified-sidebar.tsx:100-141` — Current `useActiveLink` implementation (now in sidebar-primitives)
  - `components/ui/sidebar-primitives/use-sidebar-nav.ts` (Task 4 output)

  **API/Type References**:
  - `components/sidebar/dashboard-sidebar.tsx:44-50` — Dashboard items with `?tab=` and `exact: true`
  - `app/[locale]/teams/components/teams-sidebar.tsx:36-81` — Teams items with dynamic slug paths
  - `app/[locale]/admin/components/sidebar-nav.tsx:10-51` — Admin items with standard paths

  **WHY Each Reference Matters**:
  - The useActiveLink hook is the core of sidebar UX — must handle all 3 surfaces' route patterns
  - Dashboard uses `?tab=` params, Teams uses dynamic `[slug]` segments, Admin uses simple paths
  - All 3 must be verified after refactoring

  **Acceptance Criteria**:

  - [ ] Active link correctly highlights for Dashboard tabs (`/dashboard`, `/dashboard?tab=table`, `/dashboard?tab=chart`, `/dashboard?tab=accounts`)
  - [ ] Active link correctly highlights for Teams routes with slug (`/teams/dashboard/[slug]`, `/teams/dashboard/[slug]/analytics`, `/teams/dashboard/[slug]/traders`)
  - [ ] Active link correctly highlights for Admin routes (`/admin/propfirms`, `/admin/blogs`, etc.)
  - [ ] Locale prefix stripping works for `/en/` and `/fr/`
  - [ ] `npx tsc --noEmit` passes

  **QA Scenarios:**

  ```
  Scenario: Dashboard tab-based active detection
    Tool: Playwright
    Preconditions: Dev server running, user logged in
    Steps:
      1. Navigate to /dashboard
      2. Assert sidebar item "Dashboard" has active indicator (left-edge pill bg-sidebar-primary)
      3. Click "Trades" item
      4. Assert URL contains ?tab=table
      5. Assert "Trades" has active indicator
    Expected Result: Correct item highlighted for each tab
    Failure Indicators: Wrong item highlighted, no item highlighted
    Evidence: .sisyphus/evidence/task-10-dashboard-tabs.png

  Scenario: Teams slug-based active detection
    Tool: Playwright
    Preconditions: Dev server running, user in a team
    Steps:
      1. Navigate to /teams/dashboard/[team-slug]
      2. Assert "Overview" has active indicator
      3. Navigate to /teams/dashboard/[team-slug]/analytics
      4. Assert "Analytics" has active indicator
    Expected Result: Correct item highlighted based on slug route
    Failure Indicators: No item highlighted or wrong item
    Evidence: .sisyphus/evidence/task-10-teams-slug.png

  Scenario: Admin route active detection
    Tool: Playwright
    Preconditions: Dev server running, admin user
    Steps:
      1. Navigate to /admin/propfirms
      2. Assert "Prop Firms" has active indicator
      3. Navigate to /admin/blogs
      4. Assert "Blog" has active indicator
    Expected Result: Correct admin item highlighted
    Failure Indicators: No active indicator on admin routes
    Evidence: .sisyphus/evidence/task-10-admin.png
  ```

  **Commit**: YES (groups with Wave 3)
  - Message: `fix(sidebar): verify and fix active link detection for all route patterns`
  - Files: `components/ui/sidebar-primitives/use-sidebar-nav.ts` or equivalent
  - Pre-commit: `npx tsc --noEmit && npx vitest run`

- [ ] 11. Verify Navigation Loading UX Across Surfaces

  **What to do**:
  - Verify `useNavigationLoading` hook works correctly on all 3 surfaces after refactoring
  - Ensure the navigation spinner (Loader2) replaces the icon during route transitions on all surfaces
  - Verify the navigation fallback timer (5s) works — if Next.js navigation stalls, it falls back to `window.location.assign()`
  - Verify mobile sidebar closes after navigation click
  - Verify `pendingNavigation` state resets correctly after route change
  - Check that the loading state clears properly on Teams and Admin (not just Dashboard)

  **Must NOT do**:
  - Do not change the 5s timeout value
  - Do not remove the `window.location.assign` fallback

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`nextjs`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 10, 12)
  - **Blocks**: Task 12
  - **Blocked By**: Tasks 6, 7, 8

  **References**:

  **Pattern References**:
  - `hooks/use-navigation-loading.tsx` — Navigation loading hook (62 lines)
  - `components/ui/unified-sidebar.tsx:174-196` — Pending navigation state + fallback timer (now in sidebar-primitives)

  **API/Type References**:
  - `lib/constants/sidebar.ts:NAVIGATION_TIMEOUT_MS` — 5000ms timeout

  **WHY Each Reference Matters**:
  - The navigation loading hook and pending state provide the spinner UX during route changes
  - Must work consistently after refactoring the unified sidebar into primitives

  **Acceptance Criteria**:

  - [ ] Navigation spinner shows during route transitions on all 3 surfaces
  - [ ] Spinner clears within 5s (fallback timer)
  - [ ] Mobile sidebar closes after click on all 3 surfaces
  - [ ] `npx tsc --noEmit` passes

  **QA Scenarios:**

  ```
  Scenario: Navigation spinner shows on Dashboard
    Tool: Playwright
    Preconditions: Dev server running, user logged in
    Steps:
      1. Navigate to /dashboard
      2. Click "Trades" in sidebar
      3. Within 500ms, check for Loader2 spinner animation
    Expected Result: Spinner briefly visible during transition
    Failure Indicators: No spinner, or spinner stays indefinitely
    Evidence: .sisyphus/evidence/task-11-nav-loading.png

  Scenario: Mobile sidebar closes on nav click
    Tool: Playwright
    Preconditions: Dev server running, mobile viewport (375px width)
    Steps:
      1. Open mobile sidebar via trigger
      2. Click any nav item
      3. Assert sidebar Sheet is closed
    Expected Result: Sidebar closes after navigation
    Failure Indicators: Sidebar stays open
    Evidence: .sisyphus/evidence/task-11-mobile-close.png
  ```

  **Commit**: YES (groups with Wave 3)
  - Message: `fix(sidebar): verify navigation loading UX consistency across surfaces`
  - Files: Minor fixes if needed
  - Pre-commit: `npx tsc --noEmit`

- [ ] 12. Cross-Surface Visual Consistency Audit

  **What to do**:
  - Compare all 3 authenticated sidebars side-by-side for visual consistency
  - Verify consistent: header height, z-index, border treatment, padding, backdrop-blur, background glow
  - Verify consistent: active indicator (left-edge pill), hover states, icon colors, text colors
  - Verify consistent: group labels, collapse chevrons, user menu avatar/logout
  - Verify consistent: mobile sheet appearance, MobileBottomNav items
  - Verify consistent: SidebarRail behavior
  - Fix any remaining visual discrepancies

  **Must NOT do**:
  - Do not make all sidebars identical — they have different nav items and some surface-specific features
  - Do not change the Landing sidebar

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`nextjs`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (sequential after Tasks 10, 11)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 10, 11

  **References**:

  **Pattern References**:
  - All 3 updated layouts from Tasks 6, 7, 8
  - `app/globals.css:87-95,147-155` — Sidebar CSS variables

  **API/Type References**:
  - `lib/constants/layout.ts` (Task 1) — Shared constants to verify usage
  - `components/ui/sidebar-primitives/` (Task 4) — Shared primitives to verify rendering

  **WHY Each Reference Matters**:
  - The CSS variables define the sidebar color system — verify they produce consistent results
  - The shared constants should be used everywhere — audit for misses

  **Acceptance Criteria**:

  - [ ] All 3 surfaces use same header height constant
  - [ ] All 3 surfaces use same z-index, border, bg constants
  - [ ] Active indicator style identical across surfaces
  - [ ] Hover states identical across surfaces
  - [ ] User menu present on all 3 surfaces (Dashboard, Teams, Admin)
  - [ ] MobileBottomNav present on all 3 surfaces

  **QA Scenarios:**

  ```
  Scenario: Header consistency across surfaces
    Tool: Playwright
    Preconditions: Dev server running, logged in
    Steps:
      1. Navigate to /dashboard — screenshot header
      2. Navigate to /teams/dashboard — screenshot header
      3. Navigate to /admin — screenshot header
      4. Compare: height, border style, backdrop blur, z-index stacking
    Expected Result: Identical header treatment across all 3
    Failure Indicators: Different border opacity, height, or backdrop
    Evidence: .sisyphus/evidence/task-12-header-consistency.png

  Scenario: Active indicator consistency
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Dashboard: click "Trades" — screenshot active indicator
      2. Teams: navigate to team overview — screenshot active indicator
      3. Admin: click "Prop Firms" — screenshot active indicator
      4. Compare: all should show left-edge 3px pill in sidebar-primary color
    Expected Result: Identical active indicator styling across all 3
    Failure Indicators: Different width, color, or position
    Evidence: .sisyphus/evidence/task-12-active-consistency.png

  Scenario: Mobile nav present on all surfaces
    Tool: Playwright
    Preconditions: Dev server running, mobile viewport (375px)
    Steps:
      1. Visit /dashboard — assert MobileBottomNav visible
      2. Visit /teams/dashboard — assert MobileBottomNav visible
      3. Visit /admin — assert MobileBottomNav visible
    Expected Result: Bottom nav renders on all 3 surfaces
    Failure Indicators: Missing on any surface
    Evidence: .sisyphus/evidence/task-12-mobile-nav-all.png
  ```

  **Commit**: YES (groups with Wave 3)
  - Message: `fix(sidebar): ensure cross-surface visual consistency`
  - Files: Any final fixes
  - Pre-commit: `npx tsc --noEmit && npm run lint`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npx tsc --noEmit` + `npm run lint` + `npm run test`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill for UI)
  Start from clean state (`npm run dev`). Execute EVERY QA scenario from EVERY task. Test cross-surface integration. Test edge cases: empty state, collapsed sidebar on mobile, rapid nav between surfaces. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built, nothing beyond spec. Check "Must NOT do" compliance. Detect cross-task contamination. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Wave 1 completion**: `refactor(sidebar): extract layout constants, background glow, sidebar shell, and composable primitives` — lib/constants/layout.ts, components/ui/background-glow.tsx, components/ui/sidebar-layout-shell.tsx, components/ui/sidebar-primitives/*.tsx, components/mobile-bottom-nav.tsx
- **Wave 2 completion**: `refactor(sidebar): unify provider pattern and rewire dashboard/teams/admin layouts` — app/[locale]/dashboard/layout.tsx, app/[locale]/teams/dashboard/layout.tsx, app/[locale]/teams/manage/layout.tsx, app/[locale]/admin/admin-client-layout.tsx, app/[locale]/admin/components/sidebar-nav.tsx, components/sidebar/dashboard-sidebar.tsx, app/[locale]/teams/components/teams-sidebar.tsx
- **Wave 3 completion**: `fix(sidebar): verify active link detection, nav loading, and cross-surface consistency` — tests, minor fixes
- Pre-commit: `npm run typecheck && npm run lint`

---

## Success Criteria

### Verification Commands
```bash
npm run typecheck          # Expected: 0 errors
npm run lint               # Expected: within warning budget (≤1546)
npm run test               # Expected: all pass (existing + new sidebar tests)
npm run build              # Expected: successful build (requires DB or robust retries)
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All tests pass
- [ ] Landing sidebar untouched (verify via git diff — no changes to landing-sidebar.tsx or its layout)
- [ ] Cookie contract unchanged (sidebar:state, 7-day max-age)
- [ ] MobileBottomNav renders on all 3 surfaces with correct items
- [ ] Admin sidebar has user menu with timezone + logout
- [ ] Keyboard shortcut Cmd/Ctrl+Shift+B works on all surfaces
