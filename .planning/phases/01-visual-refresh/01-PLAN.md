# Phase 01: Visual Refresh — Implementation Plan

**Status**: Ready for implementation  
**Phase**: 01 — Visual Refresh  
**Milestone**: v2.1 Production Hardening  
**Generated**: 2026-04-10

---

## Overview

This plan details the 4-wave implementation strategy for applying StyleSeed design engine across the Qunt Edge application to achieve Resend/Expo-quality visual polish.

### Wave Structure

| Wave | Focus | Pattern Components | Files Modified |
|------|-------|-------------------|----------------|
| Wave 1 | Foundation | 12 pattern + verify | 15-20 |
| Wave 2 | Landing Pages | 12 pattern | 40-50 |
| Wave 3 | Dashboard & Auth | Chart/stat refinements | 20-30 |
| Wave 4 | Polish & Verification | N/A | N/A |

### Requirements Addressed

- REQ-VISUAL-001: Consistent frost/terminal design language
- REQ-VISUAL-002: Dashboard UI components updated to v2 design system
- REQ-VISUAL-003: Import flow visual polish
- REQ-VISUAL-004: Error boundaries and loading states with v2 skeleton/styling
- REQ-VISUAL-005: Responsive design improvements

---

## Wave 1: Foundation & Shared Components

**Goal**: Establish the StyleSeed design engine foundation — tokens, pattern components, animation tokens, and layout configuration.

### Tasks

#### 1.1 Token Verification & Updates

- [ ] **T1.1.1**: Audit `app/globals.css` for StyleSeed token completeness
  - Verify `--primary`, `--foreground`, `--background`, `--card`, `--border`, `--muted` present
  - Verify `--frost-border`, `--frost-border-strong`, `--frost-border-alt` present
  - **Verification**: `grep -E "^\s*--primary|^\s*--frost" app/globals.css` returns all tokens

- [ ] **T1.1.2**: Audit `styles/styleseed-tokens.css` for completeness
  - Verify motion tokens: `--duration-fast`, `--duration-normal`, `--duration-slow`
  - Verify easing tokens: `--ease-spring`, `--ease-entrance`
  - Verify shadow tokens: `--shadow-card`, `--shadow-elevated`
  - Verify text hierarchy: `--text-strong`, `--text-primary`, `--text-secondary`, `--text-tertiary`
  - **Verification**: All 4 token categories present with correct values

- [ ] **T1.1.3**: Audit `tailwind.config.ts` for font scale completeness
  - Verify StyleSeed 14-step scale entries (2xs through 5xl)
  - **Verification**: `grep -E "2xs|5xl" tailwind.config.ts` returns 14 entries

#### 1.2 Pattern Component Verification

All 13 pattern components exist in `components/patterns/`. Verify each:

- [ ] **T1.2.1**: `stat-card.tsx` — Verify 2:1 number:unit ratio (36px value, 18px unit)
  - **Verification**: `grep "text-\[36px\]" components/patterns/stat-card.tsx` and `grep "text-\[18px\]" components/patterns/stat-card.tsx`

- [ ] **T1.2.2**: `hero-card.tsx` — Verify hero with watermark pattern
  - **Verification**: `grep -E "watermark|background" components/patterns/hero-card.tsx`

- [ ] **T1.2.3**: `section-card.tsx` — Verify card structure with proper border/background
  - **Verification**: `grep -E "border-\[hsl.*border" components/patterns/section-card.tsx`

- [ ] **T1.2.4**: `chart-card.tsx` — Verify period toggle support
  - **Verification**: `grep -i "period" components/patterns/chart-card.tsx`

- [ ] **T1.2.5**: `donut-chart-card.tsx` — Verify donut chart pattern
  - **Verification**: `grep -i "donut\|pie" components/patterns/donut-chart-card.tsx`

- [ ] **T1.2.6**: `briefing-carousel.tsx` — Verify horizontal scrolling
  - **Verification**: `grep -E "scrollbar-hide|overflow-x" components/patterns/briefing-carousel.tsx`

- [ ] **T1.2.7**: `page-shell.tsx` + `page-content.tsx` — Verify page container patterns
  - **Verification**: Both files exist with proper mobile marketing page wrappers

- [ ] **T1.2.8**: `ranked-list.tsx` — Verify ranked item pattern
  - **Verification**: File exists with list structure

- [ ] **T1.2.9**: `empty-state.tsx` — Verify empty state pattern
  - **Verification**: `grep -i "empty" components/patterns/empty-state.tsx`

- [ ] **T1.2.10**: `list-item.tsx` — Verify list item pattern
  - **Verification**: File exists with proper item structure

- [ ] **T1.2.11**: `top-bar.tsx` — Verify navigation header pattern
  - **Verification**: File exists with header structure

- [ ] **T1.2.12**: `bottom-nav.tsx` — Verify mobile navigation pattern
  - **Verification**: File exists with mobile nav structure

#### 1.3 Animation System Enhancement

- [ ] **T1.3.1**: Audit `components/animation/enhanced-motion.tsx`
  - Verify `SPRING_GENTLE` (stiffness: 300, damping: 20) exists
  - Verify `SPRING_BOUNCY` (stiffness: 400, damping: 15) exists
  - Verify `MOTION_DURATION` (fast: 100, normal: 200, slow: 350) exists
  - Verify `MOTION_EASE` (default, spring, entrance, bounce) exists
  - **Verification**: All tokens verified via grep

- [ ] **T1.3.2**: Add orchestrated entrance variants if missing
  - Verify `blurIn`, `scaleIn`, `fadeIn` variants exist
  - Verify `MotionStagger`, `MotionStaggerItem` components exist
  - **Verification**: Components importable without errors

#### 1.4 Layout Shell Updates

- [ ] **T1.4.1**: Audit `marketing-layout-shell.tsx`
  - Verify max-width: 1320px
  - Verify section gap: space-y-6 (24px)
  - Verify proper container structure
  - **Verification**: Shell renders correctly at all breakpoints

- [ ] **T1.4.2**: Audit `Navbar` and `Footer` components
  - Verify spacing consistency with section rhythm
  - Verify typography follows StyleSeed scale
  - **Verification**: Navbar and Footer render without visual defects

---

## Wave 2: Landing Pages

**Goal**: Apply StyleSeed section types across all 30+ landing pages using pattern components.

### Tasks

#### 2.1 Homepage & Hero Section

- [ ] **T2.1.1**: Audit and refresh `(home)/page.tsx`
  - Verify hero uses Type D section (mx-6 p-8 with transparent watermark)
  - Verify features section uses Type B (px-6 with grid)
  - **Verification**: Homepage renders with proper section types

- [ ] **T2.1.2**: Audit home components (HomeContent, hero section)
  - Verify hero theme consistency (no light/dark mismatch)
  - **Verification**: Hero renders dark theme consistently

#### 2.2 Landing Page Section Types

Apply Type A/B/C section types to each landing page:

##### Type A: Single Floating Card (mx-6)

- [ ] **T2.2.1**: `(landing)/support/page.tsx` — Single contact/support card
- [ ] **T2.2.2**: `(landing)/leaderboard/page.tsx` — Single leaderboard display
- [ ] **T2.2.3**: `(landing)/community/page.tsx` — Community overview card
- [ ] **T2.2.4**: `(landing)/referral/page.tsx` — Referral info card
- [ ] **T2.2.5**: `(landing)/disclaimers/page.tsx` — Legal disclaimer card
- **Verification**: Each page renders single centered card with `mx-6 rounded-2xl`

##### Type B: Grid of Cards (px-6 + gap-4)

- [ ] **T2.2.6**: `(landing)/pricing/page.tsx` — Pricing tier cards
  - **Verification**: `grid gap-4` layout with pricing cards

- [ ] **T2.2.7**: `(landing)/propfirms/page.tsx` — Prop firm catalogue
  - **Verification**: Grid layout for firm cards

- [ ] **T2.2.8**: `(landing)/propfirms/[slug]/page.tsx` — Firm detail
  - **Verification**: Type A/B hybrid with proper hierarchy

- [ ] **T2.2.9**: `(landing)/faq/page.tsx` — FAQ accordion
  - **Verification**: Proper spacing and card structure

- [ ] **T2.2.10**: `(landing)/terms/page.tsx` — Terms content
- [ ] **T2.2.11**: `(landing)/privacy/page.tsx` — Privacy content
- [ ] **T2.2.12**: `(landing)/docs/page.tsx` — Documentation
- [ ] **T2.2.13**: `(landing)/about/page.tsx` — About page
- [ ] **T2.2.14**: `(landing)/best-trading-journal/page.tsx` — Feature page
- **Verification**: All use `space-y-6` for section spacing

##### Type C: Carousel (px-6 + overflow-x-auto)

- [ ] **T2.2.15**: `(landing)/deals/page.tsx` — Deal cards
  - **Verification**: `BriefingCarousel` component used

- [ ] **T2.2.16**: `(landing)/deals/calculator/page.tsx` — Deal calculator
- [ ] **T2.2.17**: `(landing)/deals/compare/page.tsx` — Deal comparison
- [ ] **T2.2.18**: `(landing)/deals/guides/page.tsx` — Deal guides
- [ ] **T2.2.19**: `(landing)/deals/faq/page.tsx` — Deals FAQ
- **Verification**: Carousel pattern with `scrollbar-hide` applied

##### Blog & Updates

- [ ] **T2.2.20**: `(landing)/blogs/page.tsx` — Blog listing
- [ ] **T2.2.21**: `(landing)/blogs/[slug]/page.tsx` — Blog post
- [ ] **T2.2.22**: `(landing)/updates/page.tsx` — Product updates
- [ ] **T2.2.23**: `(landing)/updates/[slug]/page.tsx` — Update detail
- [ ] **T2.2.24**: `(landing)/_updates/page.tsx` — Changelog
- [ ] **T2.2.25**: `(landing)/_updates/[slug]/page.tsx` — Changelog entry
- **Verification**: Proper prose styling with `@tailwindcss/typography`

##### Additional Landing Pages

- [ ] **T2.2.26**: `(landing)/trader/[slug]/page.tsx` — Trader profile
- [ ] **T2.2.27**: `(landing)/firm/page.tsx` — Firm listing
- [ ] **T2.2.28**: `(landing)/firm/[slug]/page.tsx` — Firm detail
- [ ] **T2.2.29**: `(landing)/community/post/[id]/page.tsx` — Community post
- [ ] **T2.2.30**: `(landing)/newsletter/page.tsx` — Newsletter signup

#### 2.3 Landing Component Refresh

- [ ] **T2.3.1**: Audit landing components directory
  - Verify hero components use SectionCard pattern
  - Verify feature sections use proper grid layout
  - Verify how-it-works follows Type A/B pattern
  - Verify partners section uses SectionCard
  - **Verification**: All components follow StyleSeed section rules

- [ ] **T2.3.2**: Footer update
  - Verify StyleSeed spacing and typography
  - Verify proper link styling
  - **Verification**: Footer renders consistently with marketing shell

---

## Wave 3: Dashboard & Auth

**Goal**: Apply StyleSeed chart rules, stat card refinements, and auth form patterns.

### Tasks

#### 3.1 Chart System Refinements (Rule 17)

- [ ] **T3.1.1**: Audit `components/ui/chart-surface.tsx`
  - Verify loading skeleton follows StyleSeed patterns
  - Verify empty/error states use proper styling
  - **Verification**: ChartSurface renders correctly at all states

- [ ] **T3.1.2**: Audit `dashboard/components/charts/equity-chart.tsx`
  - Verify area chart strokeWidth: 2.5
  - Verify gradient fill: 15% → 0%
  - Verify hidden axes or proper styling
  - **Verification**: Chart follows Rule 17 specifications

- [ ] **T3.1.3**: Audit other dashboard charts
  - `pnl-bar-chart.tsx` — Bar chart styling
  - `pnl-time-bar-chart.tsx` — Time-based bars
  - `account-equity-chart.tsx` — Account equity
  - `emotion-trend-chart.tsx` — Emotion tracking
  - **Verification**: All charts follow StyleSeed Rule 17

#### 3.2 Stat Card Refinements

- [ ] **T3.2.1**: Audit `components/ui/stats-card.tsx`
  - Verify 2:1 number:unit ratio where applicable
  - Verify proper trend indicator styling
  - Verify skeleton loading states
  - **Verification**: StatsCard follows Rule 2 specifications

- [ ] **T3.2.2**: Audit `components/patterns/stat-card.tsx`
  - Verify 36px value, 18px unit ratio
  - Verify label: 12px uppercase tracking
  - **Verification**: Pattern component fully compliant

- [ ] **T3.2.3**: Audit dashboard statistics components
  - `statistics-widget.tsx` — Main stats widget
  - `average-position-time-card.tsx` — Position time stats
  - `winning-streak-card.tsx` — Streak stats
  - **Verification**: All use proper stat card patterns

#### 3.3 Dashboard Widget Chrome

- [ ] **T3.3.1**: Audit `dashboard/components/widget-canvas.tsx`
  - Verify widget chrome: border-[hsl(var(--border)/0.65)]
  - Verify widget background: bg-[hsl(var(--card)/0.95)]
  - Verify no stacked frames
  - **Verification**: Widget canvas follows design contract

- [ ] **T3.3.2**: Audit widget shell components
  - Verify consistent border/background tokens
  - **Verification**: All widgets use consistent chrome

#### 3.4 Auth Page Refinements

- [ ] **T3.4.1**: Audit `(authentication)/authentication/page-client.tsx`
  - Verify Type A two-column card pattern
  - Verify form layout follows SectionCard pattern
  - Verify border: border-[hsl(var(--border)/0.18)]
  - Verify background: bg-card/70
  - **Verification**: Auth page matches design contract

- [ ] **T3.4.2**: Audit `(authentication)/components/user-auth-form.tsx`
  - Verify input styling follows semantic tokens
  - Verify button styling uses V2 imports
  - **Verification**: Form components use proper tokens

- [ ] **T3.4.3**: Audit other auth pages
  - `forgot-password/page.tsx`
  - `reset-password/page.tsx`
  - `import/page.tsx`
  - **Verification**: All auth pages consistent

#### 3.5 Navigation Components

- [ ] **T3.5.1**: Audit dashboard sidebar
  - Verify StyleSeed nav patterns
  - Verify proper active/hover states
  - **Verification**: Sidebar renders correctly

- [ ] **T3.5.2**: Audit `DashboardHeader`
  - Verify header action styling
  - **Verification**: Header follows design contract

---

## Wave 4: Polish & Verification

**Goal**: Ensure visual quality, code compliance, and build success.

### Tasks

#### 4.1 Anti-Pattern Sweep

- [ ] **T4.1.1**: Search for hardcoded hex colors
  - `grep -rnE "\\b#[0-9A-Fa-f]{6}\\b" app/ components/ | grep -v "hsl\|var\|oklch"`
  - **Verification**: Zero hardcoded hex colors outside CSS variables

- [ ] **T4.1.2**: Search for pure black
  - `grep -rnE "#000000|#000\\b" app/ components/`
  - **Verification**: Zero pure black (#000000) occurrences

- [ ] **T4.1.3**: Verify no key color overuse
  - `grep -rnE "bg-primary(?!\/)" app/ components/`
  - **Verification**: Zero bare `bg-primary` backgrounds (should use `bg-primary/10`)

- [ ] **T4.1.4**: Verify section spacing consistency
  - Search for ad-hoc spacing patterns
  - **Verification**: All sections use `space-y-6` or consistent gaps

#### 4.2 Code Quality Verification

- [ ] **T4.2.1**: Run ESLint
  - `npm run lint`
  - **Verification**: Zero errors (warnings budget: 1546 max)

- [ ] **T4.2.2**: Run TypeScript check
  - `npm run typecheck`
  - **Verification**: Zero type errors

- [ ] **T4.2.3**: Verify no console.log
  - `grep -rnE "console\.log\(" app/ components/`
  - **Verification**: Zero console.log statements

- [ ] **T4.2.4**: Verify no `as any`
  - `grep -rnE "\bas\s+any\b" app/ components/ | grep -v "test\|spec"`
  - **Verification**: Zero `as any` in production code

#### 4.3 Build Verification

- [ ] **T4.3.1**: Production build
  - `npm run build`
  - **Verification**: Build succeeds without errors

- [ ] **T4.3.2**: Route budget check
  - `npm run check:route-budgets`
  - **Verification**: All routes within budget

#### 4.4 Visual QA

- [ ] **T4.4.1**: Homepage visual check
  - Hero section dark theme consistency
  - Feature grid proper spacing
  - **Verification**: Homepage matches Resend/Expo quality

- [ ] **T4.4.2**: Pricing page visual check
  - Pricing cards grid layout
  - Card borders and backgrounds
  - **Verification**: Pricing matches design contract

- [ ] **T4.4.3**: Dashboard visual check
  - Stat cards 2:1 ratio correct
  - Charts Rule 17 styling applied
  - Widget chrome consistent
  - **Verification**: Dashboard matches design contract

- [ ] **T4.4.4**: Auth page visual check
  - Two-column layout correct
  - Card styling consistent
  - **Verification**: Auth matches design contract

#### 4.5 Motion Quality Audit

- [ ] **T4.5.1**: Verify orchestrated entrances
  - Check key interactive elements have staged reveals
  - **Verification**: Icon → label → metric → trend sequence on stat cards

- [ ] **T4.5.2**: Verify reduced motion support
  - Check `prefers-reduced-motion` respected
  - **Verification**: `useReducedMotion()` hook functional

---

## File Inventory

### New Files (Wave 1)

None required — all 13 pattern components already exist.

### Files to Modify

| Wave | File | Change Type |
|------|------|-------------|
| 1 | `app/globals.css` | Token verification |
| 1 | `styles/styleseed-tokens.css` | Token verification |
| 1 | `tailwind.config.ts` | Font scale verification |
| 1 | `components/animation/enhanced-motion.tsx` | Animation token verification |
| 1 | `marketing-layout-shell.tsx` | Layout refinement |
| 2 | `app/[locale]/(home)/page.tsx` + components | Section type application |
| 2 | `app/[locale]/(landing)/pricing/page.tsx` | Section type application |
| 2 | `app/[locale]/(landing)/propfirms/*.tsx` | Section type application |
| 2 | `app/[locale]/(landing)/deals/*.tsx` | Section type application |
| 2 | `app/[locale]/(landing)/blogs/*.tsx` | Section type application |
| 2 | 20+ additional landing pages | Section type application |
| 3 | `dashboard/components/charts/*.tsx` | Chart Rule 17 |
| 3 | `dashboard/components/statistics/*.tsx` | Stat card refinements |
| 3 | `components/ui/stats-card.tsx` | 2:1 ratio verification |
| 3 | `dashboard/components/widget-canvas.tsx` | Widget chrome verification |
| 3 | `app/[locale]/(authentication)/*.tsx` | Auth form layout |
| 4 | Various | Anti-pattern fixes |

**Estimated total files modified**: 50-70

---

## Commit Strategy

### Wave Commits

| Wave | Commit Message | Files |
|------|---------------|-------|
| 1 | `chore(design): verify StyleSeed foundation tokens and pattern components` | 8-10 |
| 1 | `chore(design): update marketing layout shell with section rhythm` | 2-3 |
| 2 | `chore(design): apply Type A/B section types to homepage and features` | 5-8 |
| 2 | `chore(design): apply section types to pricing and propfirms pages` | 8-12 |
| 2 | `chore(design): apply section types to deals and blogs pages` | 10-15 |
| 3 | `chore(design): apply Rule 17 to dashboard charts` | 5-8 |
| 3 | `chore(design): refine dashboard stat cards with 2:1 ratio` | 3-5 |
| 3 | `chore(design): update auth pages with Type A card pattern` | 4-6 |
| 4 | `fix(design): resolve anti-pattern sweep findings` | 5-10 |
| 4 | `chore(design): complete Phase 01 visual refresh` | N/A |

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `chore`, `fix`, `refactor`, `docs`  
Scope: `design`, `landing`, `dashboard`, `auth`, `components`

---

## Success Criteria

### Visual Requirements

- [ ] Frost/terminal design language consistent across all pages
- [ ] Dark-only theme enforced (no light mode branching)
- [ ] Stat cards follow 2:1 number:unit ratio
- [ ] All metrics use proper text hierarchy
- [ ] Section spacing uses `space-y-6` consistently
- [ ] Chart styling follows Rule 17 specifications
- [ ] Orchestrated motion on interactive elements
- [ ] Reduced motion support functional

### Technical Requirements

- [ ] No hardcoded hex colors (use semantic tokens)
- [ ] No pure black text (#000000)
- [ ] No console.log statements
- [ ] No `as any` type assertions
- [ ] ESLint passes with zero errors
- [ ] TypeScript strict mode passes
- [ ] Production build succeeds

### Component Requirements

- [ ] All 13 pattern components exist and functional
- [ ] V2 components used for all new work
- [ ] Widget chrome follows design contract
- [ ] Auth pages use consistent card patterns

---

## Rollback Plan

If issues arise during implementation:

1. **Revert to last stable commit** — Pattern components and tokens remain stable
2. **Disable staged changes** — Use feature flags if partial rollout needed
3. **Incremental approach** — Land Wave 1 completely before Wave 2

---

## Notes

- All changes are visual layer only — business logic, routes, APIs, and auth preserved
- Pattern components already exist — verify and refine, don't rebuild
- Animation system already implemented — verify token completeness
- StyleSeed tokens already configured — verify import chain completeness

---

*Plan Version: 1.0*  
*Phase: 01 — Visual Refresh*  
*Milestone: v2.1 Production Hardening*
