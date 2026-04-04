# Codebase Optimization Plan - qunt-edge

**Generated**: 2026-04-05  
**Scope**: 14 issues, ~30K+ lines affected  
**Branch**: `refactor/codebase-optimization` (from `v2`)  

---

## Dependency Graph

```
Phase 1 (zero-risk) ──── independent quick wins
  ├── 1A: Delete redis-cache.ts
  ├── 1B: Remove jspdf
  └── 1C: Extract prop-firms data

Phase 2 (low-risk cleanup) ──── independent of Phase 1
  ├── 2A: Consolidate animation system (enables 2B)
  ├── 2B: Fix barrel exports (depends on 2A for animation/)
  └── 2C: Dynamic import exceljs

Phase 3 (medium-risk migrations) ──── depends on Phase 1
  ├── 3A: framer-motion → motion migration (depends on 2A for animation consolidation)
  ├── 3B: ReducedMotionProvider (independent)
  └── 3C: Redis client LRU refactor (independent)

Phase 4 (high-risk architecture) ──── depends on Phases 1-3
  ├── 4A: data-provider.tsx monolith split (68 files)
  ├── 4B: State management unification (depends on 4A)
  └── 4C: Giant component splits (7 files, depends on 4A for trade-table-review)

Phase 5 (optional / deferred) ──── independent, can run anytime
  ├── 5A: Widget system audit + simplification
  └── 5B: Lazy animation wrappers (depends on 3A)
```

---

## PHASE 1: Zero-Risk Quick Wins

> **Goal**: Remove dead code and unused dependencies. Zero risk of regression. Each sub-phase is independently shippable.

### 1A: Delete Dead Code - redis-cache.ts

**Risk**: LOW (zero imports anywhere in codebase, including tests)

**Files to change**:
- DELETE `lib/redis-cache.ts` (338 lines)

**Verification**:
- `grep -r "redis-cache" --include="*.ts" --include="*.tsx" .` returns zero results (confirmed)
- Run existing tests: `bun test`

---

### 1B: Remove Unused Dependency - jspdf

**Risk**: LOW (zero imports in source, only mentioned in eslint artifact JSON)

**Files to change**:
- EDIT `package.json`: remove `"jspdf": "^4.2.0"` from dependencies
- RUN `bun install` to update lockfile

**Verification**:
- `grep -r "jspdf" --include="*.ts" --include="*.tsx" . | grep -v node_modules | grep -v package-lock` returns zero source imports (confirmed)
- `bun install` succeeds
- Build succeeds: `bun run build`

---

### 1C: Extract Static Data from accounts/config.ts

**Risk**: LOW (pure extraction, no logic changes)

**Files to change**:
- CREATE `data/prop-firms.ts` — move the `AccountSize` interface and `propFirms` record here
- EDIT `app/[locale]/dashboard/components/accounts/config.ts` — import from `data/prop-firms.ts`, keep only logic functions

**Detailed changes**:
1. Create `data/prop-firms.ts` containing:
   - `AccountSize` interface (or import it if defined elsewhere)
   - `propFirms` const object (the ~2,300 lines of static configuration data)
   - Named export: `export { propFirms }` and `export type { AccountSize }`
2. In `config.ts`, add: `import { propFirms } from '@/data/prop-firms'`
3. Remove the `propFirms` definition and `AccountSize` interface from config.ts
4. Keep all functions that operate on the data (formatters, validators, etc.)

**Verification**:
- No import errors (TypeScript compiles)
- `bun run build` succeeds
- Accounts overview page loads correctly

---

## PHASE 2: Low-Risk Cleanup

> **Goal**: Consolidate duplicated systems and fix bundle bloat patterns. Moderate test surface.

### 2A: Consolidate Animation System

**Risk**: MEDIUM (animation touches landing pages, dashboard, and root providers)

**Files to change**:

**Step 1 — Merge `components/motion/` into `components/animation/`**:
- `components/motion/global-motion-effects.tsx` (35 lines) → `components/animation/global-motion-effects.tsx`
- `components/motion/motion-primitives.tsx` (92 lines) → `components/animation/motion-primitives.tsx`
- `components/motion/smooth-scroll-provider.tsx` (105 lines) → `components/animation/smooth-scroll-provider.tsx`
- DELETE `components/motion/` directory

**Step 2 — Update imports in consumers** (4 files):
- `components/providers/root-providers.tsx`: update `@/components/motion/smooth-scroll-provider` → `@/components/animation/smooth-scroll-provider`, same for global-motion-effects
- `app/[locale]/(landing)/components/marketing-layout-shell.tsx`: update motion imports

**Step 3 — Keep barrel `index.ts` for now** (it will be fixed in 2B)

**Verification**:
- All animation imports resolve correctly
- Landing page loads with animations intact
- Dashboard animations still work
- `bun run build` succeeds

---

### 2B: Fix Barrel Export Anti-Pattern

**Risk**: MEDIUM (many import paths to update, but purely mechanical)

**Depends on**: 2A (animation consolidation must be done first)

**Primary target — `components/animation/index.ts`**:

Current barrel exports ~25 named exports from 7 files. Force-includes ~1,826 lines.

**Step 1 — Identify actual consumers of each export**:

For each export in the barrel, grep to find which files import it via `@/components/animation`:

| Export | Likely consumers |
|--------|-----------------|
| `AnimateIn`, `AnimateInItem`, `AnimateOut`, `LazyIn`, `SPRING_PRESETS` | Entrance/exit animation users |
| `InteractiveWrapper`, `MagneticButton`, `DraggableCard`, `HoverLift`, `GlowOnHover` | Interactive component users |
| `Skeleton`, `SkeletonCard`, `Shimmer`, `ProgressBar`, `CircularProgress`, `PulseLoader`, `SpinLoader` | Loading state users |
| `PageTransition`, `StaggeredTransition`, etc. | Page transition users |
| `SPING_BOUNCY` | Enhanced motion users |

**Step 2 — Update all import paths** (mechanical find-and-replace):
- `from "@/components/animation"` → `from "@/components/animation/entrance-exit"` (for entrance-exit exports)
- `from "@/components/animation"` → `from "@/components/animation/loading-states"` (for loading exports)
- etc. — one replace per source file, not per export

**Step 3 — Delete `components/animation/index.ts`**
**Step 4 — Delete `components/animation/README.md`** (reference doc, not code)

**Other barrel files to audit** (scan with: `find . -name "index.ts" -path "*/components/*" -not -path "*/node_modules/*"`):
- Check each for re-export patterns
- Fix any that force large static includes

**Verification**:
- `bun run build` succeeds
- Bundle analysis shows animation code is tree-shaken per-page
- No runtime import errors

---

### 2C: Dynamic Import exceljs

**Risk**: LOW (single file change)

**Files to change**:
- EDIT `app/[locale]/dashboard/components/import/atas/atas-file-upload.tsx`

**Detailed changes**:
1. Remove static import: `import ExcelJS from 'exceljs'`
2. Replace with dynamic import inside the handler function:
   ```typescript
   const ExcelJS = await import('exceljs');
   const workbook = new ExcelJS.Workbook();
   ```
3. Ensure the calling function is already async (file upload handlers typically are)

**Verification**:
- ATAS file upload still works end-to-end
- Build shows exceljs in a separate chunk (check `bun run build` output)
- Initial page load bundle size reduced by ~500KB

---

## PHASE 3: Medium-Risk Migrations

> **Goal**: Migrate between packages and refactor runtime patterns. Requires thorough testing per sub-phase.

### 3A: Migrate framer-motion → motion

**Risk**: MEDIUM-HIGH (42 files, API changes between v11 and v12)

**Depends on**: 2A (animation consolidation) should be done first to avoid conflicts

**API Migration Map** (framer-motion v11 → motion v12):

| framer-motion | motion/react | Notes |
|--------------|-------------|-------|
| `import { motion, AnimatePresence } from "framer-motion"` | `import { motion, AnimatePresence } from "motion/react"` | Direct path change |
| `import { useAnimation } from "framer-motion"` | `import { useAnimation } from "motion/react"` | Same API |
| `import { useInView } from "framer-motion"` | `import { useInView } from "motion/react"` | Same API |
| `import { useMotionValue, useTransform } from "framer-motion"` | `import { useMotionValue, useTransform } from "motion/react"` | Same API |
| `import { Variants } from "framer-motion"` | `import { Variants } from "motion/react"` | Type import |
| `import { spring } from "framer-motion"` | May need checking | Verify API parity |

**The 4 files already using motion/react** (in `components/animated-icons/`):
- `upload.tsx`, `calendar-days.tsx`, `users.tsx`, `clipboard-check.tsx` — NO changes needed

**Files to migrate** (42 files, grouped by area):

**Landing page** (8 files):
- `app/[locale]/(landing)/components/hero.tsx`
- `app/[locale]/(landing)/components/navbar.tsx`
- `app/[locale]/(landing)/components/footer.tsx`
- `app/[locale]/(landing)/components/how-it-works.tsx`
- `app/[locale]/(landing)/components/qualification.tsx`
- `app/[locale]/(landing)/components/problem-statement.tsx`

**Home page** (12 files):
- `app/[locale]/(home)/components/Hero.tsx`
- `app/[locale]/(home)/components/FeaturesBento.tsx`
- `app/[locale]/(home)/components/PricingSection.tsx`
- `app/[locale]/(home)/components/FAQSection.tsx`
- `app/[locale]/(home)/components/HowItWorks.tsx`
- `app/[locale]/(home)/components/SocialProof.tsx`
- `app/[locale]/(home)/components/AnalysisDemo.tsx`
- `app/[locale]/(home)/components/ComparisonSection.tsx`
- `app/[locale]/(home)/components/FinalCTA.tsx`
- `app/[locale]/(home)/components/LiveStatsStrip.tsx`
- `app/[locale]/(home)/components/AudienceSegmentation.tsx`
- `app/[locale]/(home)/components/AIFeatures.tsx`
- `app/[locale]/(home)/components/ProblemStatement.tsx`

**Dashboard** (10 files):
- `app/[locale]/dashboard/components/navbar.tsx`
- `app/[locale]/dashboard/components/daily-summary-modal.tsx`
- `app/[locale]/dashboard/components/widget-canvas.tsx`
- `app/[locale]/dashboard/components/chat/chat.tsx`
- `app/[locale]/dashboard/components/chat/user-message.tsx`
- `app/[locale]/dashboard/components/chat/bot-message.tsx`
- `app/[locale]/dashboard/components/filters/active-filter-tags.tsx`
- `app/[locale]/dashboard/components/import/import-type-selection.tsx`
- `app/[locale]/dashboard/components/import/components/platform-card.tsx`
- `app/[locale]/dashboard/components/import/rithmic/sync/rithmic-sync-progress.tsx`
- `app/[locale]/dashboard/components/tables/trade-image-editor.tsx`
- `app/[locale]/dashboard/components/widgets/smart-insights-widget.tsx`

**Shared components** (4 files):
- `components/consent-banner.tsx`
- `components/mdx-sidebar.tsx`
- `components/magicui/animated-beam.tsx`
- `app/[locale]/(authentication)/authentication/page-client.tsx`

**Animation system** (after 2A merge, these live in components/animation/):
- `components/animation/enhanced-motion.tsx`
- `components/animation/page-transitions.tsx`
- `components/animation/interactive.tsx`
- `components/animation/spring-button.tsx`
- `components/animation/loading-states.tsx`
- `components/animation/entrance-exit.tsx`

**Admin** (1 file):
- `app/[locale]/admin/components/weekly-stats/email-preview-loading.tsx`

**Execution strategy**:
1. Write a codemod script that does the mechanical replacement: `from "framer-motion"` → `from "motion/react"` and `from 'framer-motion'` → `from 'motion/react'`
2. Run codemod across all 42 files
3. Manually review each file for any v11-specific APIs that changed in v12
4. Test each area: landing, home, dashboard, admin

**After migration**:
- EDIT `package.json`: remove `"framer-motion": "^11.18.2"`
- RUN `bun install`

**Verification**:
- `bun run build` succeeds
- All animations work on landing, home, dashboard pages
- No framer-motion in produced bundle (check with `grep -r "framer-motion" dist/`)
- Bundle size reduced by ~120-160KB

---

### 3B: ReducedMotionProvider Consolidation

**Risk**: MEDIUM (11 files, behavioral change in motion preference detection)

**Files to create**:
- CREATE `context/reduced-motion-context.tsx`

```typescript
"use client"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

const ReducedMotionContext = createContext(false)

export function ReducedMotionProvider({ children }: { children: ReactNode }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mql.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [])

  return (
    <ReducedMotionContext.Provider value={prefersReducedMotion}>
      {children}
    </ReducedMotionContext.Provider>
  )
}

export function useReducedMotionContext() {
  return useContext(ReducedMotionContext)
}
```

**Files to edit**:

1. **Wire provider into root**:
   - `components/providers/root-providers.tsx` — wrap with `<ReducedMotionProvider>`

2. **Replace individual `useReducedMotion()` calls** (grep for exact pattern across 11 files):
   - Find all files calling `useReducedMotion()` from framer-motion/motion
   - Replace with `useReducedMotionContext()` from `@/context/reduced-motion-context`
   - Remove the framer-motion/motion import for `useReducedMotion` (keep other motion imports if used)

**Verification**:
- Toggle `prefers-reduced-motion` in OS settings — all animations respect it
- Only ONE media query listener active (verify in DevTools Performance)
- Build succeeds

---

### 3C: Redis Client LRU Refactor

**Risk**: MEDIUM (server-side only, affects caching behavior)

**Files to change**:
- EDIT `lib/redis-client.ts` (536 lines)

**Current state** (4 separate Maps + 2 interval timers):
```
inMemoryCache (Map)
inMemoryNamespaceVersions (Map)
versionCache (Map)
queryCache (Map)
inMemorySweep (setInterval)
cacheSweepTimer (setInterval)
```

**Changes**:
1. Create a unified `LRUCache<T>` class with:
   - Single Map with max-size constraint
   - TTL-based expiration
   - Single sweep interval
   - `dispose()` method for cleanup
2. Replace the 4 Maps with typed LRU instances
3. Replace 2 intervals with 1 unified sweep
4. Add `process.on('beforeExit')` handler for cleanup in serverless
5. Export a `shutdownCache()` function for explicit cleanup

**Consumers** (6 files — these should NOT need changes, only internal to redis-client.ts):
- `server/trades.ts`
- `app/api/behavior/insights/route.ts`
- `lib/query-optimizer.ts`
- `lib/api-auth.ts`
- `lib/ai/get-all-trades.ts`
- `lib/ai/cache.ts`

**Verification**:
- `bun run build` succeeds
- Cache behavior unchanged (same TTL, same hit/miss patterns)
- No memory leak on repeated requests (test with load test)
- `process.on('beforeExit')` fires and cleans up

---

## PHASE 4: High-Risk Architectural Changes

> **Goal**: Split monoliths and unify state management. Highest risk, largest blast radius. Each sub-phase MUST be done in its own PR.

### 4A: data-provider.tsx Monolith Migration

**Risk**: HIGH (68 consumer files, 9 nested contexts)

**Depends on**: Phase 1 (config extraction doesn't conflict but should be done first for cleanliness)

**Current state**:
- Monolith: `context/data-provider.tsx` (2,405 lines) — exports `DataProvider`, `useData`, `useDashboardTrades`, `useDashboardAccountsList`, `useDashboardFilters`, `useDashboardStats`, `useDashboardActions`, `useDashboardIsMobile`, `useDashboardIsLoading`, `useDashboardIsSharedView`, `useDashboardRefreshError`
- Split providers already exist: `context/providers/data-state-provider.tsx`, `data-actions-provider.tsx`, `data-derived-provider.tsx`, `ui-provider.tsx`
- Split providers used by only 5 files

**Strategy — Incremental migration**:

**Step 1 — Audit what each split provider exports**:
Read all 4 split provider files. Document what hooks they expose and how they map to monolith exports.

**Step 2 — Migrate by hook, not by file**:

For each hook exported by the monolith, determine which split provider(s) it comes from:

| Monolith Hook | Split Provider Source |
|--------------|----------------------|
| `useDashboardActions` | `data-actions-provider.tsx` |
| `useDashboardTrades` | `data-state-provider.tsx` |
| `useDashboardAccountsList` | `data-state-provider.tsx` |
| `useDashboardFilters` | `data-state-provider.tsx` or `data-derived-provider.tsx` |
| `useDashboardStats` | `data-derived-provider.tsx` |
| `useDashboardIsMobile` | `ui-provider.tsx` |
| `useDashboardIsLoading` | `data-state-provider.tsx` |
| `useDashboardIsSharedView` | `ui-provider.tsx` or `data-state-provider.tsx` |
| `useDashboardRefreshError` | `data-state-provider.tsx` |
| `useData` | Composite — likely needs to remain or be split further |
| `DataProvider` | Composite wrapper |

**Step 3 — Migrate consumers in batches** (each batch = one PR):

**Batch 1 — `useDashboardStats` consumers** (14 files):
All statistics cards and charts. Lowest risk since these are read-only.
- `app/[locale]/dashboard/components/statistics/*.tsx` (8 files)
- `app/[locale]/dashboard/components/charts/*.tsx` (5 files)
- `app/[locale]/dashboard/components/pnl-summary.tsx`
- `app/[locale]/dashboard/components/daily-summary-modal.tsx` (also uses `useDashboardAccountsList`)

**Batch 2 — `useDashboardFilters` consumers** (16 files):
All filter components. Read-only filter state.
- `app/[locale]/dashboard/components/filters/*.tsx` (14 files)
- `app/[locale]/dashboard/components/dashboard-header.tsx`
- `app/[locale]/dashboard/components/charts/time-range-performance.tsx`

**Batch 3 — `useDashboardActions` consumers** (22 files):
Action dispatchers. Need to verify action signatures match.
- Various files calling `useDashboardActions` for mutations

**Batch 4 — `useData` and `DataProvider` consumers** (6 files):
- `app/[locale]/shared/[slug]/shared-page-client.tsx`
- `app/[locale]/shared/[slug]/page.tsx`
- `app/[locale]/shared/[slug]/shared-widget-canvas.tsx`
- `app/[locale]/teams/dashboard/trader/[slug]/page.tsx`
- `app/[locale]/dashboard/trader-profile/page-client.tsx`
- `app/[locale]/dashboard/components/data-debug.tsx`

**Batch 5 — Mixed consumers** (remaining files with 2+ hooks):
- `app/[locale]/dashboard/components/accounts/accounts-overview.tsx`
- `app/[locale]/dashboard/components/tables/trade-table-review.tsx`
- `app/[locale]/dashboard/components/widget-canvas.tsx`
- etc.

**Step 4 — Wire split providers in dashboard layout**:
- `components/providers/dashboard-providers.tsx` — replace `DataProvider` with individual split providers
- Ensure context nesting order matches monolith (inner contexts depend on outer)

**Step 5 — Verify and delete monolith**:
- After all 68 files migrated, `grep -r "from.*data-provider" --include="*.tsx" .` should return zero results
- Keep `context/data-provider.tsx` as a re-export shim for one release cycle if needed
- DELETE `context/data-provider.tsx`

**Verification per batch**:
- `bun run build` succeeds
- All dashboard pages render correctly
- Data flows through (trades load, filters work, stats calculate)
- No React context errors in console

---

### 4B: State Management Unification

**Risk**: HIGH (changes data flow patterns across entire dashboard)

**Depends on**: 4A (must complete monolith migration first)

**Current state**:
- 26 zustand stores in `store/`
- `data-provider.tsx` wraps zustand stores and re-exports custom hooks
- 68 files use zustand directly, ~68 use context wrappers
- Context adds a layer that can cause stale data if not synced

**Strategy**:
1. After 4A is complete, the context wrapper layer is removed
2. Files that were using `useDashboardTrades()` etc. now import directly from zustand: `useTradesStore()`
3. Verify no stale data issues arise

**Detailed steps**:

**Step 1 — Map context hooks to zustand stores**:
| Context Hook | Zustand Store |
|-------------|--------------|
| `useDashboardTrades` | `store/trades-store.ts` (`useTradesStore`) |
| `useDashboardAccountsList` | `store/accounts-store.ts` (if exists) or derived |
| `useDashboardFilters` | `store/table-config-store.ts` or dedicated filter store |
| `useDashboardActions` | Spread across multiple stores |
| `useDashboardStats` | `store/trading-domain-store.ts` or derived |

**Step 2 — For hooks that are pure zustand passthroughs**: Replace import path only. Mechanical change.

**Step 3 — For hooks that combine multiple stores or add derived logic**:
- Option A: Create a custom hook in a utils file that composes multiple stores
- Option B: Move the derived logic into a zustand selector
- Option C: Keep as a context hook if the derivation is truly expensive (useMemo)

**Step 4 — Remove context wrapper files**:
- After all consumers migrated, delete the split context providers that were purely wrapping zustand
- Keep context providers that manage their OWN state (not zustand passthrough)

**Verification**:
- All dashboard features work identically
- No stale data in any view
- Performance unchanged or improved (fewer re-renders without context propagation)

---

### 4C: Giant Component Splits

**Risk**: MEDIUM-HIGH (7 large files, UI refactor)

**Depends on**: 4A for `trade-table-review.tsx` and `accounts-overview.tsx` (they import from data-provider)

**Strategy**: Split each file into co-located modules in a directory. Each split produces an `index.tsx` that re-exports the main component so consumers don't need import changes.

---

#### 4C-1: trade-table-review.tsx (1,742 lines)

**Create**: `app/[locale]/dashboard/components/tables/trade-table-review/`

| New File | Contents |
|----------|----------|
| `index.tsx` | Main `TradeTableReview` component (orchestrator only) |
| `columns.tsx` | Column definitions for the table |
| `inline-editors.tsx` | Inline editing components (PnL, comments, tags, video URL) |
| `trade-row.tsx` | Single row rendering logic |
| `modals.tsx` | Any modal components used by the table |
| `types.ts` | Local types/interfaces |

**Consumer file** (`app/[locale]/dashboard/components/tables/trade-table-review.tsx`) becomes:
```typescript
export { TradeTableReview } from './trade-table-review'
```
(keeps the original path working for all 1 consumer)

---

#### 4C-2: accounts-overview.tsx (1,672 lines)

**Create**: `app/[locale]/dashboard/components/accounts/accounts-overview/`

| New File | Contents |
|----------|----------|
| `index.tsx` | Main `AccountsOverview` orchestrator |
| `account-card.tsx` | Individual account card component |
| `stats-panel.tsx` | Account statistics display |
| `dnd-logic.ts` | Drag-and-drop handling utilities |
| `account-config-row.tsx` | Configuration row per account |

---

#### 4C-3: firm/[slug]/page-client.tsx (1,418 lines)

**Create**: `app/[locale]/(landing)/firm/[slug]/page-client/`

| New File | Contents |
|----------|----------|
| `index.tsx` | Main page client orchestrator |
| `firm-hero.tsx` | Hero section |
| `firm-features.tsx` | Features/pricing comparison |
| `firm-stats.tsx` | Statistics section |
| `firm-faq.tsx` | FAQ accordion section |
| `firm-cta.tsx` | Call-to-action section |

---

#### 4C-4: deals-experience.tsx (1,303 lines)

**Create**: `app/[locale]/(landing)/deals/components/deals-experience/`

| New File | Contents |
|----------|----------|
| `index.tsx` | Main deals experience orchestrator |
| `feature-card.tsx` | Individual feature showcase |
| `pricing-section.tsx` | Deals pricing section |
| `comparison-table.tsx` | Plan comparison |
| `testimonials.tsx` | Social proof section |

---

#### 4C-5: team-management.tsx (1,189 lines)

**Create**: `app/[locale]/teams/components/team-management/`

| New File | Contents |
|----------|----------|
| `index.tsx` | Main team management orchestrator |
| `member-list.tsx` | Team members table/cards |
| `invite-form.tsx` | Invite new member form |
| `role-settings.tsx` | Role/permission management |
| `team-header.tsx` | Team info header |

---

#### 4C-6: equity-chart.tsx (1,077 lines)

**Create**: `app/[locale]/dashboard/components/charts/equity-chart/`

| New File | Contents |
|----------|----------|
| `index.tsx` | Main equity chart component |
| `data-transform.ts` | Data transformation/utilities |
| `chart-renderer.tsx` | Recharts chart configuration |
| `custom-tooltips.tsx` | Custom tooltip components |
| `chart-controls.tsx` | Zoom, timeframe, overlay controls |

---

#### 4C-7: settings/actions.ts (1,071 lines)

**Create**: `app/[locale]/dashboard/settings/actions/`

| New File | Contents |
|----------|----------|
| `index.ts` | Re-exports all actions |
| `profile-actions.ts` | Profile update actions |
| `account-actions.ts` | Account management actions |
| `preferences-actions.ts` | User preference actions |
| `data-actions.ts` | Data export/delete actions |
| `shared.ts` | Shared utilities, types, helpers |

**Verification for all 4C splits**:
- `bun run build` succeeds
- Each split component renders identically to before
- No broken imports from consumer files
- TypeScript strict mode passes

---

## PHASE 5: Optional / Deferred

> **Goal**: Reduce widget infrastructure complexity and add lazy loading. Lower priority, can be deferred.

### 5A: Widget System Audit + Simplification

**Risk**: MEDIUM (large surface area, but only affects widget subsystem)

**Current state**:
- `lib/widget-policy-engine/` (10 files, 2,345 lines): Only 1 real consumer (`components/widget-policy/with-risk-evaluation.tsx`)
- Standalone widget files (9 files, ~2,400 lines): `widget-persistence-manager.ts`, `widget-validator.ts`, etc.
- Only 3 files import from the standalone widget utilities
- Docs reference many features that may not be wired up

**Step 1 — Usage audit**:

For each widget module, find ALL runtime imports (exclude docs, tests, .md):

| Module | Runtime Imports | Verdict |
|--------|----------------|---------|
| `widget-policy-engine/policy-engine.ts` | `with-risk-evaluation.tsx` | KEEP |
| `widget-policy-engine/types.ts` | `with-risk-evaluation.tsx` | KEEP |
| `widget-policy-engine/error-handler.ts` | `with-risk-evaluation.tsx` | KEEP |
| `widget-policy-engine/decision-engine.ts` | `policy-engine.ts` only | KEEP (transitive) |
| `widget-policy-engine/risk-calculator.ts` | `policy-engine.ts` only | KEEP (transitive) |
| `widget-policy-engine/mitigation-provider.ts` | `policy-engine.ts` only | KEEP (transitive) |
| `widget-policy-engine/message-bus.ts` | ? | AUDIT |
| `widget-policy-engine/metrics-collector.ts` | ? | AUDIT |
| `widget-policy-engine/manifest-validator.ts` | ? | AUDIT |
| `widget-policy-engine/index.ts` | barrel | DELETE after audit |
| `widget-layout.ts` | 5 files | KEEP |
| `widget-persistence-manager.ts` | 0 runtime imports | DELETE or wire up |
| `widget-validator.ts` | 0 runtime imports | DELETE or wire up |
| `widget-storage-service.ts` | 0 runtime imports | DELETE or wire up |
| `widget-migration-service.ts` | 0 runtime imports | DELETE or wire up |
| `widget-encryption.ts` | 0 runtime imports | DELETE or wire up |
| `widget-conflict-resolution.ts` | 0 runtime imports | DELETE or wire up |
| `widget-optimistic-updates.ts` | 0 runtime imports | DELETE or wire up |
| `widget-version-service.ts` | 0 runtime imports | DELETE or wire up |

**Step 2 — Decision**: If standalone widget files (persistence, validator, storage, etc.) have zero runtime imports, they are dead code. Delete them.

**Step 3 — Simplify policy engine**: If message-bus, metrics-collector, and manifest-validator are only used internally by policy-engine.ts but never actually called at runtime, consider inlining or removing them.

**Files to potentially delete** (pending audit):
- `lib/widget-persistence-manager.ts` (390 lines)
- `lib/widget-storage-service.ts` (325 lines)
- `lib/widget-validator.ts` (374 lines)
- `lib/widget-migration-service.ts` (291 lines)
- `lib/widget-encryption.ts` (244 lines)
- `lib/widget-conflict-resolution.ts` (188 lines)
- `lib/widget-optimistic-updates.ts` (192 lines)
- `lib/widget-version-service.ts` (220 lines)
- `lib/widget-policy-engine/message-bus.ts` (276 lines)
- `lib/widget-policy-engine/metrics-collector.ts` (360 lines)
- `lib/widget-policy-engine/manifest-validator.ts` (207 lines)
- `lib/widget-policy-engine/index.ts` (81 lines)

**Potential savings**: ~3,148 lines if all are dead code

**Verification**:
- `bun run build` succeeds
- Widget canvas loads and functions correctly
- `with-risk-evaluation.tsx` HOC still works

---

### 5B: Lazy Animation Wrappers

**Risk**: LOW (after 3A completes)

**Depends on**: 3A (framer-motion → motion migration)

**Strategy**:
After all animation imports are on `motion/react`, identify the heaviest animation components that are statically imported in client components:

Priority targets (components with complex animations):
- `components/animation/page-transitions.tsx` — used in page wrappers
- `components/animation/interactive.tsx` — MagneticButton, DraggableCard
- `components/animation/loading-states.tsx` — Skeleton components

For each, create a `next/dynamic` wrapper or use `React.lazy`:
```typescript
// Instead of:
import { MagneticButton } from "@/components/animation/interactive"

// Use:
import dynamic from "next/dynamic"
const MagneticButton = dynamic(
  () => import("@/components/animation/interactive").then(m => ({ default: m.MagneticButton })),
  { ssr: false }
)
```

**Note**: This is lower priority because `motion/react` is already well-optimized. Only do this if bundle analysis shows specific animation components as significant contributors.

---

## Execution Order Summary

| Order | Phase | Issue | Risk | Est. Effort | Dependencies |
|-------|-------|-------|------|------------|-------------|
| 1 | 1A | Delete redis-cache.ts | LOW | 5 min | None |
| 2 | 1B | Remove jspdf | LOW | 5 min | None |
| 3 | 1C | Extract prop-firms data | LOW | 30 min | None |
| 4 | 2C | Dynamic import exceljs | LOW | 15 min | None |
| 5 | 2A | Consolidate animation system | MED | 1-2 hr | None |
| 6 | 2B | Fix barrel exports | MED | 2-3 hr | 2A |
| 7 | 3B | ReducedMotionProvider | MED | 1-2 hr | None |
| 8 | 3C | Redis LRU refactor | MED | 2-3 hr | None |
| 9 | 3A | framer-motion → motion | MED-HIGH | 4-6 hr | 2A |
| 10 | 4A | data-provider split | HIGH | 8-12 hr | Phase 1 |
| 11 | 4C | Giant component splits | MED-HIGH | 6-8 hr | 4A (partial) |
| 12 | 4B | State management unification | HIGH | 4-6 hr | 4A |
| 13 | 5A | Widget audit + cleanup | MED | 2-3 hr | None |
| 14 | 5B | Lazy animation wrappers | LOW | 1-2 hr | 3A |

**Total estimated effort**: ~35-55 hours

**Recommended PR strategy**:
- PR1: Phase 1 (1A + 1B + 1C) — "chore: remove dead code and extract static data"
- PR2: Phase 2 (2A + 2B + 2C) — "refactor: consolidate animation system and fix barrel exports"
- PR3: Phase 3 (3A + 3B + 3C) — "refactor: migrate to motion, add ReducedMotionProvider, fix redis"
- PR4: Phase 4A — "refactor: split data-provider monolith into focused providers"
- PR5: Phase 4C — "refactor: split giant components into focused modules"
- PR6: Phase 4B — "refactor: unify state management on zustand"
- PR7: Phase 5 (5A + 5B) — "chore: clean up widget infrastructure, lazy-load animations"

---

## Testing Strategy Per Phase

| Phase | Test Approach |
|-------|--------------|
| 1 | Build check + manual smoke test |
| 2 | Build check + visual regression on landing/dashboard |
| 3 | Build check + animation visual test + OS reduced-motion toggle |
| 4A | Build check + full dashboard E2E (trades, filters, stats, charts) |
| 4B | Build check + dashboard data flow verification |
| 4C | Build check + visual regression per split component |
| 5 | Build check + widget canvas functional test |

---

## Rollback Strategy

Each phase is on its own PR/branch. If issues arise:
1. Revert the specific PR
2. Cherry-pick safe sub-phases to a new branch
3. Re-approach with smaller batches
