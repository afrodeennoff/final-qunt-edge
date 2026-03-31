# Mobile Optimization Plan — Qunt Edge Trading Platform

## TL;DR

> **Quick Summary**: Comprehensive mobile optimization for the Qunt Edge trading analytics platform. The project already has mobile infrastructure (hooks, breakpoints, responsive components) but has critical gaps that break mobile UX — especially in trade tables, navigation, touch targets, and dashboard widgets.

> **Deliverables**:
> - Fix trade table horizontal scroll overflow
> - Add mobile-optimized dashboard layout mode
> - Create unified mobile navigation with bottom tab bar
> - Fix touch targets (Checkbox/Radio at 16px → 44px)
> - Standardize responsive breakpoints across all components
> - Add iOS safe-area handling to all mobile containers
> - Fix Import dialog mobile width issues

> **Estimated Effort**: Large
> **Parallel Execution**: YES — multiple waves
> **Critical Path**: Touch targets → Table fix → Navigation → Dashboard layout → Polish

---

## Context

### Original Request
User asked to "check the project code base end to end and give me the full plan to optimise for mobile use all the skill to find out only plan no edit ok".

### Research Summary (6 Parallel Agents)

**Agent 1 — Mobile/Responsive Patterns**:
- Found comprehensive mobile infrastructure: `useIsMobile()` hook at 767px, centralized `MOBILE_BREAKPOINT` constant, Tailwind config with extended breakpoints (xs:320px → 4xl:2560px), fluid typography/spacing, iOS safe-area utilities (`pb-safe`, `pt-safe`)
- Dashboard layout uses `px-4 sm:px-6 lg:px-8 xl:px-12` progressive padding
- Widget canvas already has mobile-aware grid (12-col, isResizable=false)
- Animation disable on mobile at 767px via CSS media queries

**Agent 2 — UI Components Analysis**:
- Analyzed 62+ components in `components/ui/` and `components/ui/v2/`
- **CRITICAL ISSUES**:
  - Checkbox and RadioGroup touch targets: 16px (needs 44px minimum)
  - OptimizedTable: Fixed column widths (up to 1200px) cause horizontal overflow
  - Card padding: Fixed `p-8` on lg size breaks on small screens
  - Popover/DropdownMenu: Fixed `w-72` / `min-w-32` widths overflow on narrow screens
- Good: Dialog, Drawer, Sheet, Table, Sidebar all have responsive variants

**Agent 3 — Dashboard Widgets Mobile**:
- Widget grid works: full-width on mobile, sizes coerced to tiny/medium/large
- **CRITICAL ISSUES**:
  - Trade table (`trade-table-review.tsx`): `min-w-fit` with 400px default columns overflows
  - Import dialog: `max-w-[80vw]` too narrow for multi-step forms
- Good: Calendar has dedicated mobile variant, Filter Command Menu switches to Sheet

**Agent 4 — Navigation Mobile Patterns**:
- Found 3 DIFFERENT mobile nav implementations (no consistency):
  1. Sheet in landing navbar
  2. Full-screen overlay in home Navigation
  3. Sheet+Accordion in team navbar
- **NO bottom tab bar** — mobile users must use sidebar
- Inconsistent breakpoints: 767px, 768px, 640px used across components

**Agent 5 — Tailwind Config**:
- Full breakpoint config: xs:320px, sm:480px, md:768px, lg:1024px, xl:1280px, 2xl:1536px, 3xl:1920px, 4xl:2560px
- Extensive fluid typography (`fluid-xs` → `fluid-9xl` using clamp())
- Fluid spacing (`fluid-3xs` → `fluid-3xl`)
- Comprehensive color, shadow, animation systems

**Agent 6 — Lighthouse Mobile Audit**:
- Audit failed with NO_FCP error (page load issue in test environment)
- No useful performance metrics available

---

## Work Objectives

### Core Objective
Optimize Qunt Edge for mobile use — fix broken mobile UX patterns, consolidate inconsistent implementations, and add mobile-specific features for trading workflows.

### Concrete Deliverables

| Priority | Deliverable | Files to Modify |
|----------|-------------|-----------------|
| P0-Critical | Fix Trade Table horizontal scroll | `app/[locale]/dashboard/components/tables/trade-table-review.tsx` |
| P0-Critical | Fix Checkbox/Radio touch targets | `components/ui/checkbox.tsx`, `components/ui/radio-group.tsx` |
| P0-Critical | Fix Import dialog mobile width | `app/[locale]/dashboard/components/import/import-button.tsx` |
| P1-High | Add mobile bottom tab bar | New: `components/mobile-bottom-nav.tsx` |
| P1-High | Create unified mobile nav component | New: `components/mobile-nav.tsx` |
| P1-High | Mobile dashboard optimized layout | `app/[locale]/dashboard/components/widget-canvas.tsx` |
| P2-Medium | Standardize responsive breakpoints | All components using inconsistent breakpoints |
| P2-Medium | Fix Card padding responsive | `components/ui/card.tsx` |
| P2-Medium | Fix Popover/DropdownMenu widths | `components/ui/popover.tsx`, `components/ui/dropdown-menu.tsx` |
| P3-Low | Add safe-area to remaining containers | Various layout files |

### Definition of Done

- [ ] Trade table scrolls horizontally on mobile without overflow
- [ ] All interactive elements meet 44px minimum touch target
- [ ] Import wizard works on 375px screens without horizontal scroll
- [ ] Mobile dashboard shows optimized vertical widget layout
- [ ] Bottom tab bar provides quick access to: Dashboard, Trades, Accounts, Settings
- [ ] All mobile navigation uses consistent Sheet-based pattern
- [ ] All breakpoints unified to 767px (MOBILE_BREAKPOINT)
- [ ] iOS safe-area padding on all mobile containers
- [ ] No layout shift when switching mobile ↔ desktop

### Must Have

- Trade table usable on mobile (horizontal scroll, readable columns)
- Touch targets ≥44px on all interactive elements
- Bottom navigation accessible without reaching top of screen
- Import flow works on 375px viewport

### Must NOT Have

- No light mode — dark-only theme preserved
- No breaking changes to desktop layouts
- No new console errors on mobile
- No performance regression on desktop

---

## Verification Strategy

### Test Infrastructure
- **Framework**: Playwright for mobile browser testing
- **Device simulation**: iPhone SE (375×667), iPhone 14 (390×844), iPad (768×1024)
- **Orientation**: Portrait and landscape testing

### QA Scenarios (Agent-Executed)

**Scenario: Trade Table on Mobile**
- Tool: Playwright
- Steps:
  1. Navigate to `/en/dashboard?tab=table`
  2. Set viewport to 375×667
  3. Verify table renders without horizontal overflow
  4. Swipe left/right to scroll columns
  5. Verify sticky headers work with scroll
- Expected: Smooth horizontal scroll, readable content
- Evidence: `.sisyphus/evidence/mobile-table-scroll.webp`

**Scenario: Touch Target Compliance**
- Tool: Playwright + Axe accessibility
- Steps:
  1. Navigate to all major surfaces (dashboard, trades, accounts, settings)
  2. Measure all button/input/checkbox/radio touch areas
  3. Flag any <44px elements
- Expected: Zero elements below 44px
- Evidence: `.sisyphus/evidence/touch-target-report.json`

**Scenario: Import Dialog Mobile**
- Tool: Playwright
- Steps:
  1. Navigate to `/en/dashboard`
  2. Click Import button
  3. Set viewport to 375×667
  4. Complete import wizard steps
- Expected: Dialog fits screen, all form fields accessible
- Evidence: `.sisyphus/evidence/mobile-import-wizard.webp`

**Scenario: Bottom Tab Bar**
- Tool: Playwright
- Steps:
  1. Navigate to `/en/dashboard` on mobile viewport
  2. Verify bottom tab bar with 4 tabs visible
  3. Tap each tab and verify navigation works
- Expected: All tabs functional, no scroll to access
- Evidence: `.sisyphus/evidence/bottom-nav.webp`

---

## Execution Strategy

### Wave 1 (Foundation — Can Run Immediately)

| Task | Files | Agent Profile |
|------|-------|---------------|
| Fix Checkbox touch targets | `components/ui/checkbox.tsx` | visual-engineering |
| Fix RadioGroup touch targets | `components/ui/radio-group.tsx` | visual-engineering |
| Fix Card padding responsive | `components/ui/card.tsx`, `card-header.tsx`, `card-content.tsx`, `card-footer.tsx` | visual-engineering |
| Fix Popover width responsive | `components/ui/popover.tsx` | visual-engineering |
| Fix DropdownMenu width responsive | `components/ui/dropdown-menu.tsx` | visual-engineering |

### Wave 2 (Critical Mobile UX)

| Task | Files | Agent Profile |
|------|-------|---------------|
| Fix Trade Table horizontal scroll | `app/[locale]/dashboard/components/tables/trade-table-review.tsx` | visual-engineering |
| Fix Import dialog mobile width | `app/[locale]/dashboard/components/import/import-button.tsx` | visual-engineering |
| Standardize responsive breakpoints | All components using 640px/768px instead of 767px | quick |
| Add safe-area to dashboard layout | `app/[locale]/dashboard/layout.tsx` | visual-engineering |

### Wave 3 (Navigation & Dashboard)

| Task | Files | Agent Profile |
|------|-------|---------------|
| Create mobile bottom tab bar | New: `components/mobile-bottom-nav.tsx` | visual-engineering |
| Create unified mobile nav | New: `components/mobile-nav.tsx` | visual-engineering |
| Update landing pages to use unified nav | `app/[locale]/(landing)/components/navbar.tsx` | visual-engineering |
| Update home page to use unified nav | `app/[locale]/(home)/components/Navigation.tsx` | visual-engineering |
| Update teams page to use unified nav | `app/[locale]/teams/components/team-navbar.tsx` | visual-engineering |
| Mobile dashboard optimized layout | `app/[locale]/dashboard/components/widget-canvas.tsx` | visual-engineering |

### Wave 4 (Polish & Integration)

| Task | Files | Agent Profile |
|------|-------|---------------|
| Fix filter dropdowns mobile | `app/[locale]/dashboard/components/filters/*.tsx` | visual-engineering |
| Fix add-widget-sheet tabs mobile | `app/[locale]/dashboard/components/add-widget-sheet.tsx` | visual-engineering |
| Fix account selection popover mobile | `app/[locale]/dashboard/components/charts/account-selection-popover.tsx` | visual-engineering |
| Add safe-area to landing layouts | `app/[locale]/(landing)/layout.tsx` | visual-engineering |
| Add safe-area to teams layouts | `app/[locale]/teams/layout.tsx` | visual-engineering |

### Final Verification Wave

| Task | Agent | Verification |
|------|-------|--------------|
| Plan compliance audit | oracle | All P0/P1 items implemented |
| Mobile UX review | visual-engineering | All QA scenarios pass |
| Accessibility audit | unspecified-high | Touch targets ≥44px |
| Desktop regression check | quick | No layout breakage |

---

## Commit Strategy

- **Wave 1**: `fix(mobile): improve touch targets and component padding`
- **Wave 2**: `fix(mobile): resolve table and dialog overflow issues`
- **feat(mobile): add bottom tab bar and unified navigation`
- **Wave 4**: `fix(mobile): polish remaining responsive issues`
- **Final**: `refactor(mobile): consolidate mobile patterns`

---

## Success Criteria

### Verification Commands
```bash
# Mobile viewport test
npx playwright test --config=playwright.mobile.config.ts

# Touch target audit
npx axe ./app/[locale]/dashboard --format=json > touch-audit.json

# Responsive breakpoint check (should show 767px everywhere)
grep -r "max-width: 767px\|max-width: 768px\|max-width: 640px" --include="*.tsx"
```

### Final Checklist
- [ ] Trade table scrolls horizontally on 375px viewport
- [ ] All buttons/inputs ≥44px touch target
- [ ] Import wizard fits on mobile without overflow
- [ ] Bottom tab bar visible on mobile dashboard
- [ ] All navigation uses consistent Sheet pattern
- [ ] Breakpoints unified to 767px
- [ ] iOS safe-area on mobile containers
- [ ] No desktop layout regressions