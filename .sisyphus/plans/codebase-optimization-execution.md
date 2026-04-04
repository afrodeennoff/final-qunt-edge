# Codebase Optimization Execution Plan

## TL;DR

> **Quick Summary**: Execute 14 optimization tasks across 5 phases to clean up dead code, consolidate animation system, migrate to motion, split monoliths, and simplify widget infrastructure. Targets ~30K+ lines of code changes.
> 
> **Deliverables**:
> - Delete unused redis-cache.ts and jspdf dependency
> - Extract static prop-firms data to separate module
> - Consolidate animation system and fix barrel exports
> - Dynamic import exceljs
> - Migrate framer-motion → motion (42 files)
> - Add ReducedMotionProvider
> - Refactor Redis client LRU
> - Split data-provider.tsx monolith (68 files)
> - Unify state management on zustand
> - Split 7 giant components into focused modules
> - Audit and simplify widget system
> 
> **Estimated Effort**: ~35-55 hours across 14 tasks
> **Parallel Execution**: YES - Multiple waves with dependencies
> **Critical Path**: Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5

---

## Context

### Original Request
User requested execution of the codebase optimization plan found in `.sisyphus/plans/codebase-optimization-plan.md`. This plan addresses technical debt, dead code removal, and architectural improvements across the qunt-edge project.

### Research Findings
The optimization plan was pre-generated with:
- Clear dependency graph showing task relationships
- Risk levels assigned to each phase
- File counts and line estimates
- PR strategy recommendations

### Execution Branch
All work should be performed on branch: `refactor/codebase-optimization` (from `v2`)

---

## Work Objectives

### Core Objective
Execute the complete codebase optimization plan in 5 phases, removing dead code, consolidating systems, migrating packages, and splitting monoliths while maintaining zero regression.

### Concrete Deliverables
- Phase 1: Remove redis-cache.ts, jspdf dependency, extract prop-firms data
- Phase 2: Consolidate animation system, fix barrel exports, dynamic import exceljs
- Phase 3: Migrate framer-motion to motion, add ReducedMotionProvider, refactor Redis LRU
- Phase 4: Split data-provider.tsx, unify state management, split giant components
- Phase 5: Audit widget system, add lazy animation wrappers

### Definition of Done
- [ ] All 14 tasks completed across 5 phases
- [ ] Build succeeds after each phase
- [ ] No runtime regressions in dashboard, landing, and admin pages
- [ ] Bundle size reduced by estimated amounts

### Must Have
- Zero regression in existing functionality
- Build passes after each phase
- All tests continue to pass

### Must NOT Have
- Breaking changes to public APIs
- Loss of any existing functionality
- Unverified code reaching main branch

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (vitest, eslint)
- **Automated tests**: NO (manual verification per phase)
- **Framework**: N/A - manual verification

### QA Policy
Every task MUST include agent-executed QA scenarios. Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Build Verification**: Use Bash to run `npm run build` and verify success
- **Lint Verification**: Use Bash to run `npm run lint` on touched files
- **Typecheck**: Use Bash to run `npm run typecheck`

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Phase 1 - Zero-Risk Quick Wins):
├── 1A: Delete redis-cache.ts
├── 1B: Remove jspdf dependency
└── 1C: Extract prop-firms data

Wave 2 (Phase 2 - Low-Risk Cleanup):
├── 2A: Consolidate animation system
├── 2B: Fix barrel exports (depends on 2A)
└── 2C: Dynamic import exceljs

Wave 3 (Phase 3 - Medium-Risk Migrations):
├── 3B: ReducedMotionProvider (independent)
├── 3C: Redis client LRU refactor (independent)
└── 3A: framer-motion → motion migration (depends on 2A)

Wave 4 (Phase 4 - High-Risk Architecture):
├── 4A: data-provider.tsx monolith split (68 files)
├── 4B: State management unification (depends on 4A)
└── 4C: Giant component splits (7 files, depends on 4A partial)

Wave 5 (Phase 5 - Optional/Deferred):
├── 5A: Widget system audit + simplification
└── 5B: Lazy animation wrappers (depends on 3A)
```

### Dependency Matrix
- 1A: - - - 2A, 2B, 2C
- 1B: - - - 2A, 2B, 2C
- 1C: - - - 2A, 2B, 2C
- 2A: 1A,1B,1C - 2B, 3A
- 2B: 2A - 3A
- 2C: 1A,1B,1C - -
- 3A: 2A - 5B
- 3B: 1A,1B,1C - -
- 3C: 1A,1B,1C - -
- 4A: 2A,2B,2C,3A,3B,3C - 4B, 4C
- 4B: 4A - -
- 4C: 4A - -
- 5A: - - -
- 5B: 3A - -

---

## TODOs

### Phase 1: Zero-Risk Quick Wins

- [ ] 1A. Delete Dead Code - redis-cache.ts

  **What to do**:
  - DELETE `lib/redis-cache.ts` (338 lines)
  - Verify no imports exist: `grep -r "redis-cache" --include="*.ts" --include="*.tsx" .`

  **Must NOT do**:
  - Modify any other files

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - **Skills Evaluated but Omitted**: N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES (with 1B, 1C)
  - **Parallel Group**: Wave 1
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `lib/redis-cache.ts` - File to delete (zero imports confirmed)

  **Acceptance Criteria**:
  - [ ] File deleted: `lib/redis-cache.ts` no longer exists
  - [ ] `grep -r "redis-cache" --include="*.ts" --include="*.tsx" .` returns zero results
  - [ ] `npm run build` succeeds

  **QA Scenarios**:

  Scenario: Verify redis-cache.ts is deleted
    Tool: Bash
    Preconditions: File exists
    Steps:
      1. `ls lib/redis-cache.ts` - should fail
      2. `grep -r "redis-cache" --include="*.ts" --include="*.tsx" . | grep -v node_modules` - should return nothing
    Expected Result: File deleted, no references remain
    Evidence: .sisyphus/evidence/task-1A-delete-redis-cache.txt

  Scenario: Build still works
    Tool: Bash
    Preconditions: File deleted
    Steps:
      1. `npm run build`
    Expected Result: Build succeeds
    Evidence: .sisyphus/evidence/task-1A-build-success.txt

  **Commit**: YES
  - Message: `chore: remove unused redis-cache.ts`
  - Files: `lib/redis-cache.ts` (deleted)

---

- [ ] 1B. Remove Unused Dependency - jspdf

  **What to do**:
  - EDIT `package.json`: remove `"jspdf": "^4.2.0"` from dependencies
  - RUN `npm install` to update lockfile

  **Must NOT do**:
  - Remove any other dependencies

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - **Skills Evaluated but Omitted**: N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES (with 1A, 1C)
  - **Parallel Group**: Wave 1
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `package.json` - Remove jspdf entry

  **Acceptance Criteria**:
  - [ ] jspdf removed from package.json dependencies
  - [ ] `grep -r "jspdf" --include="*.ts" --include="*.tsx" . | grep -v node_modules | grep -v package-lock` returns zero source imports
  - [ ] `npm install` succeeds
  - [ ] `npm run build` succeeds

  **QA Scenarios**:

  Scenario: Verify jspdf removed and no source imports
    Tool: Bash
    Preconditions: jspdf in package.json
    Steps:
      1. `grep "jspdf" package.json` - should not find in dependencies
      2. `grep -r "jspdf" --include="*.ts" --include="*.tsx" . | grep -v node_modules | grep -v package-lock` - should return nothing
    Expected Result: jspdf removed, no source imports
    Evidence: .sisyphus/evidence/task-1B-remove-jspdf.txt

  Scenario: Build succeeds after removal
    Tool: Bash
    Preconditions: jspdf removed
    Steps:
      1. `npm install && npm run build`
    Expected Result: Build succeeds
    Evidence: .sisyphus/evidence/task-1B-build-success.txt

  **Commit**: YES
  - Message: `chore: remove unused jspdf dependency`
  - Files: `package.json`, `package-lock.json`

---

- [ ] 1C. Extract Static Data from accounts/config.ts

  **What to do**:
  - CREATE `data/prop-firms.ts` — move the `AccountSize` interface and `propFirms` record here
  - EDIT `app/[locale]/dashboard/components/accounts/config.ts` — import from `data/prop-firms.ts`, keep only logic functions

  **Must NOT do**:
  - Modify any logic in the config functions

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - **Skills Evaluated but Omitted**: N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES (with 1A, 1B)
  - **Parallel Group**: Wave 1
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `app/[locale]/dashboard/components/accounts/config.ts` - Source file with static data

  **Acceptance Criteria**:
  - [ ] `data/prop-firms.ts` created with `AccountSize` and `propFirms`
  - [ ] `config.ts` imports from `data/prop-firms.ts`
  - [ ] `npm run typecheck` passes
  - [ ] `npm run build` succeeds

  **QA Scenarios**:

  Scenario: Verify prop-firms data extracted
    Tool: Bash
    Preconditions: config.ts has static data
    Steps:
      1. `ls data/prop-firms.ts` - should exist
      2. `grep "from.*prop-firms" app/[locale]/dashboard/components/accounts/config.ts` - should find import
    Expected Result: File created, import exists
    Evidence: .sisyphus/evidence/task-1C-extract-prop-firms.txt

  Scenario: Build succeeds
    Tool: Bash
    Preconditions: Data extracted
    Steps:
      1. `npm run typecheck && npm run build`
    Expected Result: Both pass
    Evidence: .sisyphus/evidence/task-1C-build-success.txt

  **Commit**: YES
  - Message: `refactor: extract static prop-firms data to separate module`
  - Files: `data/prop-firms.ts` (new), `app/[locale]/dashboard/components/accounts/config.ts`

---

### Phase 2: Low-Risk Cleanup

- [ ] 2A. Consolidate Animation System

  **What to do**:
  - Merge `components/motion/` into `components/animation/`:
    - `components/motion/global-motion-effects.tsx` → `components/animation/global-motion-effects.tsx`
    - `components/motion/motion-primitives.tsx` → `components/animation/motion-primitives.tsx`
    - `components/motion/smooth-scroll-provider.tsx` → `components/animation/smooth-scroll-provider.tsx`
  - DELETE `components/motion/` directory
  - UPDATE imports in consumers:
    - `components/providers/root-providers.tsx`
    - `app/[locale]/(landing)/components/marketing-layout-shell.tsx`

  **Must NOT do**:
  - Change any animation logic or behavior

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - **Skills Evaluated but Omitted**: N/A

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Phase 1)
  - **Parallel Group**: Wave 2
  - **Blocks**: 2B
  - **Blocked By**: 1A, 1B, 1C

  **References**:
  - `components/motion/` - Source directory to merge
  - `components/animation/` - Target directory
  - `components/providers/root-providers.tsx` - Consumer to update
  - `app/[locale]/(landing)/components/marketing-layout-shell.tsx` - Consumer to update

  **Acceptance Criteria**:
  - [ ] All motion files moved to animation directory
  - [ ] `components/motion/` directory deleted
  - [ ] Import paths updated in consumer files
  - [ ] `npm run build` succeeds
  - [ ] Landing page animations work
  - [ ] Dashboard animations work

  **QA Scenarios**:

  Scenario: Verify animation consolidation
    Tool: Bash
    Preconditions: Motion directory exists
    Steps:
      1. `ls components/motion/` - should fail (deleted)
      2. `ls components/animation/global-motion-effects.tsx` - should exist
      3. `grep -r "from.*components/motion" --include="*.tsx" . | grep -v node_modules` - should return nothing
    Expected Result: Motion dir deleted, files in animation
    Evidence: .sisyphus/evidence/task-2A-consolidate-animation.txt

  Scenario: Build and visual verification
    Tool: Bash
    Preconditions: Files moved
    Steps:
      1. `npm run build`
    Expected Result: Build succeeds
    Evidence: .sisyphus/evidence/task-2A-build-success.txt

  **Commit**: YES
  - Message: `refactor: consolidate animation system (merge motion/ into animation/)`
  - Files: `components/animation/` (new files), `components/motion/` (deleted)

---

- [ ] 2B. Fix Barrel Export Anti-Pattern

  **What to do**:
  - IDENTIFY actual consumers of each export in `components/animation/index.ts`
  - UPDATE all import paths to direct file paths:
    - `from "@/components/animation"` → `from "@/components/animation/entrance-exit"` (for entrance-exit exports)
    - `from "@/components/animation"` → `from "@/components/animation/loading-states"` (for loading exports)
  - DELETE `components/animation/index.ts`
  - DELETE `components/animation/README.md`

  **Must NOT do**:
  - Change any animation logic

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - **Skills Evaluated but Omitted**: N/A

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on 2A)
  - **Parallel Group**: Wave 2
  - **Blocks**: None
  - **Blocked By**: 2A

  **References**:
  - `components/animation/index.ts` - Barrel to remove

  **Acceptance Criteria**:
  - [ ] `components/animation/index.ts` deleted
  - [ ] All imports updated to direct paths
  - [ ] `npm run build` succeeds
  - [ ] Bundle analysis shows animation code is tree-shaken

  **QA Scenarios**:

  Scenario: Verify barrel removed
    Tool: Bash
    Preconditions: Barrel exists
    Steps:
      1. `ls components/animation/index.ts` - should fail
      2. `grep -r "from.*components/animation\"" --include="*.tsx" . | grep -v node_modules | wc -l` - should be significantly reduced
    Expected Result: Barrel deleted, fewer barrel imports
    Evidence: .sisyphus/evidence/task-2B-fix-barrel.txt

  Scenario: Build succeeds
    Tool: Bash
    Preconditions: Barrel removed
    Steps:
      1. `npm run build`
    Expected Result: Build succeeds
    Evidence: .sisyphus/evidence/task-2B-build-success.txt

  **Commit**: YES
  - Message: `refactor: remove barrel exports from animation system`
  - Files: `components/animation/index.ts` (deleted), multiple consumer files updated

---

- [ ] 2C. Dynamic Import exceljs

  **What to do**:
  - EDIT `app/[locale]/dashboard/components/import/atas/atas-file-upload.tsx`
  - REMOVE static import: `import ExcelJS from 'exceljs'`
  - REPLACE with dynamic import inside handler:
    ```typescript
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    ```

  **Must NOT do**:
  - Change any upload logic

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - **Skills Evaluated but Omitted**: N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2)
  - **Parallel Group**: Wave 2
  - **Blocks**: None
  - **Blocked By**: 1A, 1B, 1C

  **References**:
  - `app/[locale]/dashboard/components/import/atas/atas-file-upload.tsx` - File to modify

  **Acceptance Criteria**:
  - [ ] exceljs imported dynamically
  - [ ] ATAS file upload still works
  - [ ] Build shows exceljs in separate chunk

  **QA Scenarios**:

  Scenario: Verify dynamic import
    Tool: Bash
    Preconditions: Static import exists
    Steps:
      1. `grep "import.*exceljs" app/[locale]/dashboard/components/import/atas/atas-file-upload.tsx` - should find dynamic import
      2. `grep "await import" app/[locale]/dashboard/components/import/atas/atas-file-upload.tsx` - should find exceljs
    Expected Result: Dynamic import present
    Evidence: .sisyphus/evidence/task-2C-dynamic-exceljs.txt

  Scenario: Build verification
    Tool: Bash
    Preconditions: Dynamic import added
    Steps:
      1. `npm run build`
    Expected Result: Build succeeds
    Evidence: .sisyphus/evidence/task-2C-build-success.txt

  **Commit**: YES
  - Message: `perf: dynamic import exceljs to reduce initial bundle`
  - Files: `app/[locale]/dashboard/components/import/atas/atas-file-upload.tsx`

---

### Phase 3: Medium-Risk Migrations

- [ ] 3A. Migrate framer-motion → motion

  **What to do**:
  - WRITE codemod script for mechanical replacement: `from "framer-motion"` → `from "motion/react"`
  - RUN codemod across 42 files
  - MANUALLY REVIEW each file for v11-specific APIs that changed in v12
  - EDIT `package.json`: remove `"framer-motion": "^11.18.2"`
  - RUN `npm install`

  **Must NOT do**:
  - Break any animation behavior

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - **Skills Evaluated but Omitted**: N/A

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on 2A)
  - **Parallel Group**: Wave 3
  - **Blocks**: 5B
  - **Blocked By**: 2A

  **References**:
  - 42 files across landing, home, dashboard, admin, animation system

  **Acceptance Criteria**:
  - [ ] All 42 files migrated to motion/react
  - [ ] No framer-motion imports remain
  - [ ] `npm run build` succeeds
  - [ ] All animations work on landing, home, dashboard
  - [ ] Bundle size reduced by ~120-160KB

  **QA Scenarios**:

  Scenario: Verify migration complete
    Tool: Bash
    Preconditions: Files migrated
    Steps:
      1. `grep -r "framer-motion" --include="*.tsx" . | grep -v node_modules | wc -l` - should be 0
      2. `grep -r "motion/react" --include="*.tsx" . | grep -v node_modules | wc -l` - should be significant
    Expected Result: No framer-motion, motion/react used
    Evidence: .sisyphus/evidence/task-3A-motion-migration.txt

  Scenario: Build and animation verification
    Tool: Bash
    Preconditions: Migration complete
    Steps:
      1. `npm run build`
    Expected Result: Build succeeds
    Evidence: .sisyphus/evidence/task-3A-build-success.txt

  **Commit**: YES
  - Message: `refactor: migrate framer-motion to motion/react`
  - Files: 42 files updated, package.json updated

---

- [ ] 3B. ReducedMotionProvider Consolidation

  **What to do**:
  - CREATE `context/reduced-motion-context.tsx` with ReducedMotionProvider
  - EDIT `components/providers/root-providers.tsx` — wrap with `<ReducedMotionProvider>`
  - REPLACE individual `useReducedMotion()` calls across 11 files with `useReducedMotionContext()`

  **Must NOT do**:
  - Break reduced motion functionality

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - **Skills Evaluated but Omitted**: N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3)
  - **Parallel Group**: Wave 3
  - **Blocks**: None
  - **Blocked By**: 1A, 1B, 1C

  **References**:
  - `context/reduced-motion-context.tsx` - New file to create

  **Acceptance Criteria**:
  - [ ] ReducedMotionProvider created
  - [ ] Root provider wraps with ReducedMotionProvider
  - [ ] All 11 files use useReducedMotionContext()
  - [ ] Toggle prefers-reduced-motion works

  **QA Scenarios**:

  Scenario: Verify provider created and wired
    Tool: Bash
    Preconditions: Provider created
    Steps:
      1. `ls context/reduced-motion-context.tsx` - should exist
      2. `grep "ReducedMotionProvider" components/providers/root-providers.tsx` - should find
    Expected Result: Provider exists and wired
    Evidence: .sisyphus/evidence/task-3B-reduced-motion.txt

  Scenario: Build verification
    Tool: Bash
    Preconditions: Provider wired
    Steps:
      1. `npm run build`
    Expected Result: Build succeeds
    Evidence: .sisyphus/evidence/task-3B-build-success.txt

  **Commit**: YES
  - Message: `feat: add ReducedMotionProvider for accessibility`
  - Files: `context/reduced-motion-context.tsx` (new), multiple files updated

---

- [ ] 3C. Redis Client LRU Refactor

  **What to do**:
  - EDIT `lib/redis-client.ts` (536 lines)
  - CREATE unified `LRUCache<T>` class with:
    - Single Map with max-size constraint
    - TTL-based expiration
    - Single sweep interval
    - `dispose()` method
  - REPLACE 4 Maps with typed LRU instances
  - REPLACE 2 intervals with 1 unified sweep
  - ADD `process.on('beforeExit')` handler
  - EXPORT `shutdownCache()` function

  **Must NOT do**:
  - Change cache behavior (same TTL, same hit/miss patterns)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - **Skills Evaluated but Omitted**: N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3)
  - **Parallel Group**: Wave 3
  - **Blocks**: None
  - **Blocked By**: 1A, 1B, 1C

  **References**:
  - `lib/redis-client.ts` - File to refactor

  **Acceptance Criteria**:
  - [ ] LRUCache class created
  - [ ] 4 Maps replaced with LRU instances
  - [ ] 2 intervals replaced with 1 sweep
  - [ ] shutdownCache() exported
  - [ ] `npm run build` succeeds

  **QA Scenarios**:

  Scenario: Verify LRU refactor
    Tool: Bash
    Preconditions: Refactor complete
    Steps:
      1. `grep "LRUCache" lib/redis-client.ts` - should find class
      2. `grep "shutdownCache" lib/redis-client.ts` - should find export
    Expected Result: LRU class and shutdown function exist
    Evidence: .sisyphus/evidence/task-3C-redis-lru.txt

  Scenario: Build verification
    Tool: Bash
    Preconditions: Refactor complete
    Steps:
      1. `npm run build`
    Expected Result: Build succeeds
    Evidence: .sisyphus/evidence/task-3C-build-success.txt

  **Commit**: YES
  - Message: `refactor: unify Redis client with LRU cache implementation`
  - Files: `lib/redis-client.ts`

---

### Phase 4: High-Risk Architectural Changes

- [ ] 4A. data-provider.tsx Monolith Migration

  **What to do**:
  - AUDIT split providers to understand exports
  - MIGRATE by hook (not by file) in 5 batches:
    - Batch 1: useDashboardStats consumers (14 files)
    - Batch 2: useDashboardFilters consumers (16 files)
    - Batch 3: useDashboardActions consumers (22 files)
    - Batch 4: useData and DataProvider consumers (6 files)
    - Batch 5: Mixed consumers (remaining files)
  - WIRE split providers in dashboard layout
  - DELETE `context/data-provider.tsx` after migration

  **Must NOT do**:
  - Break any data flow in dashboard

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - **Skills Evaluated but Omitted**: N/A

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Phase 3)
  - **Parallel Group**: Wave 4
  - **Blocks**: 4B, 4C
  - **Blocked By**: 2A, 2B, 2C, 3A, 3B, 3C

  **References**:
  - `context/data-provider.tsx` - Monolith to split (2,405 lines)
  - 68 consumer files

  **Acceptance Criteria**:
  - [ ] All 68 files migrated to split providers
  - [ ] data-provider.tsx deleted
  - [ ] `npm run build` succeeds
  - [ ] All dashboard pages render correctly

  **QA Scenarios**:

  Scenario: Verify monolith split
    Tool: Bash
    Preconditions: Migration complete
    Steps:
      1. `grep -r "from.*data-provider" --include="*.tsx" . | grep -v node_modules | wc -l` - should be 0
      2. `ls context/data-provider.tsx` - should fail
    Expected Result: Monolith deleted, no consumers
    Evidence: .sisyphus/evidence/task-4A-split-monolith.txt

  Scenario: Build and dashboard verification
    Tool: Bash
    Preconditions: Monolith deleted
    Steps:
      1. `npm run build`
    Expected Result: Build succeeds
    Evidence: .sisyphus/evidence/task-4A-build-success.txt

  **Commit**: YES (multiple commits for batches)
  - Message: `refactor: split data-provider.tsx monolith into focused providers`
  - Files: Multiple provider files created, data-provider.tsx deleted

---

- [ ] 4B. State Management Unification

  **What to do**:
  - MAP context hooks to zustand stores
  - REPLACE import paths for pure zustand passthroughs
  - CREATE custom hooks for combined stores
  - REMOVE context wrapper files that are purely zustand passthrough

  **Must NOT do**:
  - Break any data flow

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - **Skills Evaluated but Omitted**: N/A

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on 4A)
  - **Parallel Group**: Wave 4
  - **Blocks**: None
  - **Blocked By**: 4A

  **References**:
  - 26 zustand stores in `store/`
  - 68 files using context wrappers

  **Acceptance Criteria**:
  - [ ] All dashboard features work identically
  - [ ] No stale data in any view
  - [ ] `npm run build` succeeds

  **QA Scenarios**:

  Scenario: Verify state unification
    Tool: Bash
    Preconditions: Unification complete
    Steps:
      1. `grep -r "useDashboardTrades" --include="*.tsx" . | grep -v node_modules | wc -l` - should be 0
      2. `grep -r "useTradesStore" --include="*.tsx" . | grep -v node_modules | wc -l` - should be significant
    Expected Result: Direct zustand usage
    Evidence: .sisyphus/evidence/task-4B-state-unification.txt

  Scenario: Build verification
    Tool: Bash
    Preconditions: Unification complete
    Steps:
      1. `npm run build`
    Expected Result: Build succeeds
    Evidence: .sisyphus/evidence/task-4B-build-success.txt

  **Commit**: YES
  - Message: `refactor: unify state management on zustand`
  - Files: Multiple files updated

---

- [ ] 4C. Giant Component Splits

  **What to do**:
  - SPLIT 7 giant components into co-located modules:
    - trade-table-review.tsx (1,742 lines)
    - accounts-overview.tsx (1,672 lines)
    - firm/[slug]/page-client.tsx (1,418 lines)
    - deals-experience.tsx (1,303 lines)
    - team-management.tsx (1,189 lines)
    - equity-chart.tsx (1,077 lines)
    - settings/actions.ts (1,071 lines)
  - CREATE index.tsx that re-exports main component

  **Must NOT do**:
  - Change any component behavior

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - **Skills Evaluated but Omitted**: N/A

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on 4A partial)
  - **Parallel Group**: Wave 4
  - **Blocks**: None
  - **Blocked By**: 4A

  **References**:
  - 7 large component files

  **Acceptance Criteria**:
  - [ ] All 7 components split into directories
  - [ ] Consumer imports still work
  - [ ] `npm run build` succeeds

  **QA Scenarios**:

  Scenario: Verify component splits
    Tool: Bash
    Preconditions: Splits complete
    Steps:
      1. `ls app/[locale]/dashboard/components/tables/trade-table-review/` - should exist
      2. `ls app/[locale]/dashboard/components/accounts/accounts-overview/` - should exist
    Expected Result: Directories created
    Evidence: .sisyphus/evidence/task-4C-component-splits.txt

  Scenario: Build verification
    Tool: Bash
    Preconditions: Splits complete
    Steps:
      1. `npm run build`
    Expected Result: Build succeeds
    Evidence: .sisyphus/evidence/task-4C-build-success.txt

  **Commit**: YES (multiple commits)
  - Message: `refactor: split giant components into focused modules`
  - Files: 7 directories created with module files

---

### Phase 5: Optional / Deferred

- [ ] 5A. Widget System Audit + Simplification

  **What to do**:
  - AUDIT each widget module for runtime imports
  - DELETE modules with zero runtime imports
  - SIMPLIFY policy engine if message-bus, metrics-collector, manifest-validator are unused

  **Must NOT do**:
  - Break widget canvas functionality

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - **Skills Evaluated but Omitted**: N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 5)
  - **Parallel Group**: Wave 5
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `lib/widget-*.ts` files
  - `lib/widget-policy-engine/` directory

  **Acceptance Criteria**:
  - [ ] Unused widget files deleted
  - [ ] Widget canvas still works
  - [ ] `npm run build` succeeds

  **QA Scenarios**:

  Scenario: Verify widget cleanup
    Tool: Bash
    Preconditions: Audit complete
    Steps:
      1. `ls lib/widget-persistence-manager.ts` - should fail if deleted
      2. `npm run build`
    Expected Result: Build succeeds
    Evidence: .sisyphus/evidence/task-5A-widget-audit.txt

  **Commit**: YES
  - Message: `chore: remove unused widget infrastructure`
  - Files: Multiple widget files deleted

---

- [ ] 5B. Lazy Animation Wrappers

  **What to do**:
  - IDENTIFY heaviest animation components
  - CREATE `next/dynamic` wrappers for:
    - `components/animation/page-transitions.tsx`
    - `components/animation/interactive.tsx`
    - `components/animation/loading-states.tsx`

  **Must NOT do**:
  - Break any animations

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - **Skills Evaluated but Omitted**: N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 5)
  - **Parallel Group**: Wave 5
  - **Blocks**: None
  - **Blocked By**: 3A

  **References**:
  - Animation components in `components/animation/`

  **Acceptance Criteria**:
  - [ ] Lazy wrappers created
  - [ ] Animations still work
  - [ ] Bundle size reduced

  **QA Scenarios**:

  Scenario: Verify lazy loading
    Tool: Bash
    Preconditions: Wrappers created
    Steps:
      1. `grep "dynamic" app/[locale]/dashboard/components/...` - should find dynamic imports
      2. `npm run build`
    Expected Result: Build succeeds
    Evidence: .sisyphus/evidence/task-5B-lazy-animation.txt

  **Commit**: YES
  - Message: `perf: add lazy loading for heavy animation components`
  - Files: Multiple component files updated

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each phase: verify implementation exists. Check evidence files exist in .sisyphus/evidence/.
  Output: `Phases [5/5] | Tasks [14/14] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Build Verification** — `unspecified-high`
  Run `npm run build` after all phases complete.
  Output: `Build [PASS/FAIL] | VERDICT`

- [ ] F3. **Bundle Size Check** — `unspecified-high`
  Analyze bundle size reduction.
  Output: `Bundle reduction [X KB] | VERDICT`

- [ ] F4. **Regression Check** — `deep`
  Verify no functionality regressions in dashboard, landing, admin.
  Output: `Regression [NONE/N] | VERDICT`

---

## Commit Strategy

- **PR1**: Phase 1 (1A + 1B + 1C) — `chore: remove dead code and extract static data`
- **PR2**: Phase 2 (2A + 2B + 2C) — `refactor: consolidate animation system and fix barrel exports`
- **PR3**: Phase 3 (3A + 3B + 3C) — `refactor: migrate to motion, add ReducedMotionProvider, fix redis`
- **PR4**: Phase 4A — `refactor: split data-provider monolith into focused providers`
- **PR5**: Phase 4C — `refactor: split giant components into focused modules`
- **PR6**: Phase 4B — `refactor: unify state management on zustand`
- **PR7**: Phase 5 (5A + 5B) — `chore: clean up widget infrastructure, lazy-load animations`

---

## Success Criteria

### Verification Commands
```bash
npm run build  # Expected: success
npm run lint   # Expected: 0 errors
npm run typecheck  # Expected: success
```

### Final Checklist
- [ ] All 14 tasks completed
- [ ] All 5 phases verified
- [ ] Build passes after each phase
- [ ] No runtime regressions
- [ ] Bundle size reduced
- [ ] All PRs merged to main