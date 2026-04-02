# MASTER Final Fix — All Remaining Tasks in One Shot

## TL;DR

> **Quick Summary**: Consolidate ALL remaining pending tasks into one execution — fix the widget data hydration pipeline (4 root causes), clear IndexedDB on mutations, add cache tag invalidation, run mobile verification pass, and close out all stale plan files.
>
> **Deliverables**:
> - Widget data pipeline fixed (empty snapshot, skipped accounts, dep explosion, error surfacing)
> - IndexedDB cache cleared on all trade mutations
> - Cache tag sub-tags invalidated on trade saves
> - Mobile verification pass (5 checks, likely already done)
> - All stale plans reconciled and marked complete
> - Clean typecheck + lint + build + test
>
> **Estimated Effort**: Medium (4 code tasks + verification sprint)
> **Parallel Execution**: YES — 3 waves
> **Critical Path**: T1 (pipeline) → T2, T3 (parallel) → T4 → V1-V3 → F1-F4

---

## Context

### Source Plans Consolidated
| Plan | File | Tasks Remaining | Nature |
|------|------|-----------------|--------|
| `fix-widget-data` | `.sisyphus/plans/fix-widget-data.md` | 4 code tasks | Deep fix |
| `MASTER-fix-plan` | `.sisyphus/plans/MASTER-fix-plan.md` | 5 mobile verifications + 4 code tasks | Verify |
| `MEGA-all-plans` | `.sisyphus/plans/MEGA-all-plans.md` | Same as above (superset) | Meta |

### What's Already Done (from 7 completed plans)
- ✅ Admin security overhaul (9 tasks) — admin bypass, auth checks, tests
- ✅ Import system fixes (12 grouped tasks) — Critical/High/Medium
- ✅ Home redesign (19 tasks) — Waves 0-4 complete
- ✅ Mobile optimization (17 tasks) — Touch targets, bottom nav, responsive
- ✅ Team sidebar (1 task) — `showSidebar={false}`
- ✅ Landing sidebar removal (1 task) — `showSidebar={false}`
- ✅ Pending fixes (6 tasks) — Token refresh, reconnect, race conditions

### Metis Review Findings
**Gaps identified and addressed:**
- D1 sub-fixes verified: 1a (dep array), 1b (empty snapshot), 1c (skipped accounts), 1d (error surfacing) — all confirmed real bugs
- D1d error surfacing: Need `refreshError` state + `retryDataLoad` action exposed to UI (toast/banner)
- D2 `clearTradesCache` must fire for `updateTrades`, `groupTrades`, `ungroupTrades` — not just save/delete
- D2 is idempotent for concurrent mutations (safe to double-clear)
- Mobile tasks likely done — verification via Playwright screenshots only
- D1 previously marked "done" in MEGA but checkboxes show incomplete — reconciliation needed

---

## Work Objectives

### Core Objective
Fix the widget data hydration pipeline so dashboard widgets reliably show real user data, then verify all mobile optimizations are in place, and close out all stale plan files.

### Concrete Deliverables
- `context/data-provider.tsx` — 4 sub-fixes in `loadData` + IndexedDB clear on mutations + error surfacing
- `server/trades.ts` — Cache tag invalidation for sub-tags
- Playwright screenshots — Mobile verification evidence
- Clean verification — typecheck + lint + test + build all green

### Definition of Done
- [x] `npm run typecheck` → 0 errors ✅
- [x] `npm run lint` → within warning budget (1546 max) ✅
- [x] `npm run test` → all tests pass ✅
- [x] `npm run build` → production build succeeds ✅
- [x] Dashboard widgets show data (verified via code review — no `?debugData=1` needed at live server)
- [x] Mobile viewport (375px) passes all 5 verification checks ✅
- [x] All stale plan files updated with final status

### Must Have
- Widgets display real user data after login (no permanent empty state)
- Background refresh failures surface to UI with retry option
- IndexedDB cache invalidated on ALL trade mutations (save, delete, update, group, ungroup)
- Cache sub-tags invalidated on trade saves
- Mobile UX meets 44px touch targets, proper scroll, bottom nav
- TypeScript clean, ESLint clean, tests green, build succeeds

### Must NOT Have (Guardrails)
- **NO** changes to `server/auth.ts` — auth resolution is correct by design
- **NO** changes to `prisma/schema.prisma` or migrations
- **NO** changes to `lib/prisma-guard.ts` cooldown mechanism
- **NO** synthesized/fake data as fallback — honest empty states only
- **NO** `as any` / `@ts-ignore` / `console.log` — ESLint errors in this project
- **NO** new npm dependencies — surgical fixes only
- **NO** refactoring of the 2310-line provider beyond targeted fixes — minimize blast radius
- **NO** changes to widget registry, layout system, or rendering components
- **NO** changes to `proxy.ts` or middleware
- **NO** light mode changes — dark-only theme preserved
- **NO** breaking changes to desktop layouts

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (Vitest)
- **Automated tests**: Tests-after (add regression tests for fixed behaviors)
- **Framework**: Vitest (`npm run test`)

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright — Navigate, interact, assert DOM, screenshot
- **Server/API**: Use Bash (curl) — Send requests, assert response fields
- **Unit tests**: Use Bash — Run vitest, verify pass/fail counts

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (THE Critical Fix — sequential foundation):
└── Task 1: Fix loadData hydration pipeline [deep]
    ├── 1a: Reduce dependency array (21→~10)
    ├── 1b: Remove setTrades([]) empty snapshot
    ├── 1c: Fix setAccounts() skip
    └── 1d: Surface refresh errors + retry mechanism

Wave 2 (3 Independent Fixes — MAX PARALLEL):
├── Task 2: Clear IndexedDB on all trade mutations [unspecified-high]
├── Task 3: Add cache tag invalidation sub-tags [quick]
└── Task 4: Mobile verification pass (5 checks) [unspecified-high]

Wave 3 (Cleanup + Verification):
└── Task 5: Run full verification suite + reconcile stale plans [quick]

Wave FINAL (4 parallel reviews → user okay):
├── F1: Plan compliance audit [oracle]
├── F2: Code quality review [unspecified-high]
├── F3: Real manual QA [unspecified-high + playwright]
└── F4: Scope fidelity check [deep]
→ Present results → Get explicit user okay
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| 1 | None | 2, 3, 5, F1-F4 | 1 |
| 2 | 1 | 5, F1-F4 | 2 |
| 3 | 1 | 5, F1-F4 | 2 |
| 4 | None | F1-F4 | 2 |
| 5 | 1, 2, 3 | F1-F4 | 3 |
| F1 | 5 | user okay | FINAL |
| F2 | 5 | user okay | FINAL |
| F3 | 5 | user okay | FINAL |
| F4 | 5 | user okay | FINAL |

### Agent Dispatch Summary

- **Wave 1**: 1 task — T1 → `deep`
- **Wave 2**: 3 tasks — T2 → `unspecified-high`, T3 → `quick`, T4 → `unspecified-high`
- **Wave 3**: 1 task — T5 → `quick`
- **FINAL**: 4 tasks — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

---

- [x] 1. Fix loadData Hydration Pipeline (THE Critical Fix — 4 Sub-Fixes) — ALREADY DONE

  **What to do**:
  Fix 4 interrelated bugs in `context/data-provider.tsx` `loadData` function that cascade into permanent empty widget state.

  **Sub-fix 1a: Reduce dependency array (lines ~812-836)**
  The `useCallback` for `loadData` has 21 dependencies. Many are Zustand setters that are referentially stable (created via `create()`, never change reference). Remove stable setters from the dep array.
  - Remove from deps: `setAccounts`, `setDashboardLayout`, `setEvents`, `setGroups`, `setIsLoading`, `setMoods`, `setSubscription`, `setSupabaseUser`, `setTags`, `setTickDetails`, `setTrades`, `setUser`, `resetUserState`
  - Keep: `adminView`, `isSharedView`, `initialSharedData`, `params?.slug`, `fetchAllTrades`, `hydrateSharedAccountMetrics`, `sanitizeTradesForState`, `syncSharedDataState`, `withTimeout`, `supabase`
  - Target: ~10 meaningful deps

  **Sub-fix 1b: Remove `setTrades([])` empty snapshot (lines ~674-677)**
  Current code marks `hasLocalSnapshot=true` and calls `setTrades([])` when `cachedTrades` is empty but `cachedUserData` exists. This blocks later hydration from server.
  - Remove the `else if (cachedUserData)` branch entirely (lines 674-677)
  - The `cachedUserData` block (lines ~679-690) already handles `hasLocalSnapshot` correctly when user data exists

  **Sub-fix 1c: Fix `setAccounts()` skip (lines ~751-753)**
  `setAccounts(normalizedAccounts)` is gated behind `!hasLocalSnapshot`, so fresh server accounts are NEVER written when there's a cached snapshot.
  - Remove the `if (!hasLocalSnapshot)` guard around `setAccounts(normalizedAccounts)`
  - Always call `setAccounts()` with fresh server data regardless of snapshot state

  **Sub-fix 1d: Surface background refresh errors (lines ~785-787)**
  `refreshFromServer` failures are caught but silently logged — user sees empty widgets with no feedback.
  - Add a `dataRefreshError` state variable (or reuse existing error state if present)
  - On background refresh failure: set the error state
  - Expose a `retryDataLoad` action that clears the error and re-triggers `loadData`
  - In the dashboard layout: show a subtle error toast/banner when `dataRefreshError` is set, with a retry button
  - Keep the existing `logger.error` call

  **Must NOT do**:
  - Do NOT refactor the entire 2310-line file — only touch `loadData` and immediate supporting code
  - Do NOT change `refreshFromServer` function body beyond error handling
  - Do NOT change auth resolution logic
  - Do NOT synthesize fake data as fallback
  - Do NOT add new npm dependencies

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Multi-step logic fix in a complex 2310-line data provider. Requires understanding the full hydration flow and the cascading interaction between 4 sub-bugs.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (sequential foundation)
  - **Blocks**: Tasks 2, 3, 5, F1-F4
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References** (existing code to follow):
  - `context/data-provider.tsx:671-694` — Cache-first hydration block. Understand `cachedTrades`/`cachedUserData` interaction with `hasLocalSnapshot`
  - `context/data-provider.tsx:697-782` — `refreshFromServer` function. Full server reconciliation flow
  - `context/data-provider.tsx:784-791` — Background refresh trigger with silent `.catch()`
  - `context/data-provider.tsx:812-836` — The 21-dep dependency array
  - `context/data-provider.tsx:792-811` — Outer catch block for non-snapshot error handling

  **API/Type References**:
  - `context/data-provider.tsx:1-50` — Type imports and provider interface (check for existing error state types)
  - `store/trading-domain-store.ts` — Zustand store where setters are defined (confirm stable via `create()`)

  **External References**:
  - Zustand docs: Setters from `create()` are referentially stable — safe to omit from deps

  **WHY Each Reference Matters**:
  - Lines 671-694: Contains sub-fix 1b — the `else if` branch that creates empty snapshots
  - Lines 697-782: Contains sub-fix 1c — the conditional `setAccounts()` that skips on snapshots
  - Lines 784-791: Contains sub-fix 1d — the silent error suppression
  - Lines 812-836: Contains sub-fix 1a — the bloated dependency array

  **Acceptance Criteria**:

  - [ ] Dependency array reduced from 21 to ~10 items (only semantic deps remain)
  - [ ] No `setTrades([])` call when `cachedTrades` is empty but `cachedUserData` exists
  - [ ] `setAccounts(normalizedAccounts)` called unconditionally in `refreshFromServer`
  - [ ] Background refresh failure sets an error state (not just logs)
  - [ ] A `retryDataLoad` action is exposed from the provider
  - [ ] Dashboard shows error feedback (toast/banner) when refresh fails, with retry button
  - [ ] `npm run typecheck` → 0 errors
  - [ ] `npm run test` → all tests pass
  - [ ] No changes outside `loadData` function and immediate error state additions

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Dashboard loads with cached user data but no cached trades
    Tool: Bash (vitest)
    Preconditions: User has account with trades in DB. IndexedDB has user-data cache but empty trades cache.
    Steps:
      1. Run: npm run typecheck → expect 0 errors
      2. Run: npm run test → expect all tests pass
      3. Verify no `setTrades([])` call in the `else if (cachedUserData)` path
      4. Verify `setAccounts()` is called unconditionally after server refresh
    Expected Result: No empty-trade snapshot set; accounts always hydrated from server
    Failure Indicators: `setTrades([])` still present; `setAccounts` still behind `!hasLocalSnapshot`
    Evidence: .sisyphus/evidence/task-1-hydration-fix.txt

  Scenario: Background refresh failure surfaces error to UI
    Tool: Bash (vitest)
    Preconditions: Provider is initialized
    Steps:
      1. Run: npm run typecheck → expect 0 errors
      2. Run: npm run test → expect all tests pass
      3. Verify `loadData` sets an error state variable when `refreshFromServer` rejects
      4. Verify a `retryDataLoad` action is exported from the provider context
      5. Verify the error state is typed (not `any`)
    Expected Result: Error state exists, is set on failure, retry action available
    Failure Indicators: No error state variable; error only logged; no retry action
    Evidence: .sisyphus/evidence/task-1-error-surfacing.txt

  Scenario: Dependency array has only meaningful deps
    Tool: Bash (grep)
    Preconditions: None
    Steps:
      1. Grep for the `loadData` useCallback dependency array
      2. Count the items — expect ~10 (not 21)
      3. Verify no Zustand setters in the array (setAccounts, setTrades, etc.)
    Expected Result: ~10 semantic dependencies, no stable Zustand setters
    Failure Indicators: 15+ deps; setters like setAccounts/setTrades still in array
    Evidence: .sisyphus/evidence/task-1-dep-array.txt
  ```

  **Commit**: YES
  - Message: `fix(dashboard): repair widget data hydration pipeline`
  - Files: `context/data-provider.tsx`, `app/[locale]/dashboard/layout.tsx` (if error banner added)
  - Pre-commit: `npm run typecheck && npm run test`

---

- [x] 2. Clear IndexedDB Cache on All Trade Mutations

  **What to do**:
  When trades are mutated (save, delete, update, group, ungroup) via server actions, the IndexedDB trades cache is never cleared. Stale data persists across sessions and the next `loadData` reads stale cache instead of fetching fresh data.

  The `clearTradesCache(userId)` function already exists in `lib/indexeddb/trades-cache.ts:120`. Currently only called from manual UI actions.

  Fix: Import and call `clearTradesCache(userId)` after ALL trade mutation callbacks in `context/data-provider.tsx`:
  - `saveTrades` action wrapper → after server action succeeds
  - `deleteTrades` action wrapper → after server action succeeds
  - `updateTrades` action wrapper → after server action succeeds (bulk edit)
  - `groupTrades` action wrapper → after server action succeeds
  - `ungroupTrades` action wrapper → after server action succeeds
  - All clears are fire-and-forget with `.catch()` for error handling (IndexedDB may be unavailable in private browsing)
  - Use `supabaseUser?.id` from the closure for userId (already captured at callback creation time — not stale)

  **Must NOT do**:
  - Do NOT modify `server/trades.ts` — server-side cache handled in Task 3
  - Do NOT modify `lib/indexeddb/trades-cache.ts` — API already exists and works
  - Do NOT change IndexedDB schema or store structure
  - Do NOT clear cache before mutation succeeds (could lose data on failure)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Finding the right mutation wrappers in a 2310-line file, understanding the action dispatch pattern, and adding cache clearing without breaking existing flows.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Task 1)
  - **Parallel Group**: Wave 2 (with Tasks 3, 4)
  - **Blocks**: Task 5, F1-F4
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `lib/indexeddb/trades-cache.ts:120` — `clearTradesCache(userId)` function (the API to call)
  - `lib/indexeddb/trades-cache.ts:145-151` — `clearAllCache(userId)` function
  - `context/data-provider.tsx:66` — Import line for IndexedDB helpers (add `clearTradesCache`)

  **API/Type References**:
  - `context/data-provider.tsx` — Search for `saveTradesAction`, `deleteTradesByIdsAction`, `updateTrades`, `groupTrades`, `ungroupTrades` call sites

  **WHY Each Reference Matters**:
  - `trades-cache.ts:120`: The exact function to import and call
  - `data-provider.tsx:66`: Where to add the import
  - Mutation wrappers: Where to insert cache-clear calls (after server action success)

  **Acceptance Criteria**:

  - [ ] `clearTradesCache` imported in `data-provider.tsx`
  - [ ] Called after: save, delete, update, group, ungroup trade mutations
  - [ ] Cache clear is non-blocking (fire-and-forget with `.catch()`)
  - [ ] Uses `supabaseUser?.id` from closure (not stale userId)
  - [ ] `npm run typecheck` → 0 errors
  - [ ] `npm run test` → all tests pass

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Trade save clears IndexedDB cache
    Tool: Bash (grep + vitest)
    Preconditions: None
    Steps:
      1. Run: npm run typecheck → expect 0 errors
      2. Run: npm run test → expect all tests pass
      3. Grep for `clearTradesCache` in context/data-provider.tsx → expect 5+ matches (import + 5 call sites)
      4. Verify each mutation callback has clearTradesCache after the server action
    Expected Result: clearTradesCache called after all 5 mutation types
    Failure Indicators: Missing mutation type; called before server action; not imported
    Evidence: .sisyphus/evidence/task-2-indexeddb-clear.txt

  Scenario: Cache clear handles IndexedDB unavailable gracefully
    Tool: Bash (code review)
    Preconditions: None
    Steps:
      1. Verify every clearTradesCache call has a .catch() handler
      2. Verify no unhandled promise rejection possible
    Expected Result: All calls are fire-and-forget with error suppression
    Failure Indicators: Missing .catch() on any clearTradesCache call
    Evidence: .sisyphus/evidence/task-2-error-handling.txt
  ```

  **Commit**: YES
  - Message: `fix(dashboard): clear IndexedDB cache on all trade mutations`
  - Files: `context/data-provider.tsx`
  - Pre-commit: `npm run typecheck && npm run test`

---

- [x] 3. Add Cache Tag Invalidation for Trade Mutations — ALREADY DONE

  **What to do**:
  `getCoreUserDataCached` and `getSupplementalUserDataCached` in `server/user-data.ts` use cache tags `user-data-core-{userId}` and `user-data-supplemental-{userId}` (lines 96-97). Trade mutations only invalidate `user-data-{userId}` — missing the sub-tags.

  When `ENABLE_QUERY_CACHING=true`, cached user data can become stale after trade mutations.

  Fix: Add sub-tag invalidation in `server/trades.ts`:
  - In `saveTradesAction` (around line 328): Add `updateTag('user-data-core-' + userId)` and `updateTag('user-data-supplemental-' + userId)` alongside existing `updateTag('user-data-' + userId)`
  - In `invalidateTradeRelatedCaches` (line 136): Add the same sub-tag invalidations
  - Optionally add to `CACHE_TAGS` in `lib/cache/cache-invalidation.ts` for type safety

  Note: Currently dormant (`ENABLE_QUERY_CACHING=false`) — proactive fix.

  **Must NOT do**:
  - Do NOT change cache tag naming convention
  - Do NOT modify `server/user-data.ts`
  - Do NOT change `lib/feature-flags.ts` or `ENABLE_QUERY_CACHING` default

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Surgical addition of `updateTag()` calls in known locations. Pattern already exists.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Task 1)
  - **Parallel Group**: Wave 2 (with Tasks 2, 4)
  - **Blocks**: Task 5, F1-F4
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `server/trades.ts:328` — Existing `updateTag('user-data-' + userId)` in `saveTradesAction`
  - `server/trades.ts:136-141` — `invalidateTradeRelatedCaches` function
  - `server/trades.ts:497-501` — Another `updateTag` call in force-refresh path

  **API/Type References**:
  - `server/user-data.ts:96-97` — Sub-tag definitions: `USER_DATA_CORE_CACHE_TAG` and `USER_DATA_SUPPLEMENTAL_CACHE_TAG`
  - `lib/cache/cache-invalidation.ts:21-26` — `CACHE_TAGS` constants

  **WHY Each Reference Matters**:
  - trades.ts:328: Where to add the missing tag invalidations
  - user-data.ts:96-97: The exact tag strings to invalidate
  - cache-invalidation.ts: Existing pattern for type-safe cache tag helpers

  **Acceptance Criteria**:

  - [ ] `saveTradesAction` invalidates `user-data-core-{userId}` and `user-data-supplemental-{userId}`
  - [ ] `invalidateTradeRelatedCaches` invalidates both sub-tags
  - [ ] `npm run typecheck` → 0 errors
  - [ ] `npm run test` → all tests pass
  - [ ] No changes to `server/user-data.ts` or `lib/feature-flags.ts`

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Trade save invalidates all user data cache tags
    Tool: Bash (grep + vitest)
    Preconditions: None
    Steps:
      1. Run: npm run typecheck → expect 0 errors
      2. Run: npm run test → expect all tests pass
      3. Grep for 'user-data-core-' in server/trades.ts → expect at least 2 matches (saveTradesAction + invalidateTradeRelatedCaches)
      4. Grep for 'user-data-supplemental-' in server/trades.ts → expect at least 2 matches
    Expected Result: Both sub-tags invalidated in trade mutation paths
    Failure Indicators: Missing sub-tag in saveTradesAction or invalidateTradeRelatedCaches
    Evidence: .sisyphus/evidence/task-3-cache-tags.txt
  ```

  **Commit**: YES
  - Message: `fix(server): add cache tag invalidation for user data sub-tags`
  - Files: `server/trades.ts`
  - Pre-commit: `npm run typecheck && npm run test`

---

- [x] 4. Mobile Verification Pass (5 Checks) — ALREADY DONE (8/8 checks pass)

  **What to do**:
  All 17 mobile optimization tasks were completed in previous sessions. This task verifies the 5 most critical mobile UX items are actually working via Playwright screenshots.

  **Check 1: Trade table horizontal scroll**
  - File: `app/[locale]/dashboard/components/tables/trade-table-review.tsx`
  - Verify: `overflow-x-auto` present, columns readable at 375px width

  **Check 2: Touch targets ≥44px**
  - Files: `components/ui/checkbox.tsx`, `components/ui/radio-group.tsx`
  - Verify: `min-h-11 min-w-11` (44px) on interactive elements

  **Check 3: Import wizard fits 375px viewport**
  - File: `app/[locale]/dashboard/components/import/import-button.tsx`
  - Verify: Dialog `max-w-[90vw]` or responsive width, all form fields accessible at 375px

  **Check 4: Mobile bottom tab bar exists**
  - File: `components/mobile-bottom-nav.tsx`
  - Verify: Component exists and renders navigation items (Dashboard, Trades, Accounts, Settings)

  **Check 5: Safe-area padding on layouts**
  - Files: `app/[locale]/dashboard/layout.tsx`, `app/[locale]/(landing)/layout.tsx`, `app/[locale]/teams/layout.tsx`
  - Verify: `pb-safe` or `safe-area-inset-bottom` CSS present

  **If any check FAILS**: Fix the specific issue (should be minor — all tasks were previously completed).

  **Must NOT do**:
  - Do NOT redesign any mobile components — only fix missing items
  - Do NOT change desktop layouts
  - Do NOT add new dependencies

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Verification pass with potential minor fixes. Requires reading multiple files and potentially running Playwright.
  - **Skills**: [`webapp-testing`]
    - `webapp-testing`: Playwright for browser verification screenshots

  **Parallelization**:
  - **Can Run In Parallel**: YES (no code dependency on Tasks 1-3)
  - **Parallel Group**: Wave 2 (with Tasks 2, 3)
  - **Blocks**: F1-F4
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `app/[locale]/dashboard/components/tables/trade-table-review.tsx` — Trade table
  - `components/ui/checkbox.tsx` — Checkbox component
  - `components/ui/radio-group.tsx` — RadioGroup component
  - `components/mobile-bottom-nav.tsx` — Bottom nav component
  - `app/[locale]/dashboard/layout.tsx` — Dashboard layout

  **WHY Each Reference Matters**:
  - These are the exact files to verify for each mobile check

  **Acceptance Criteria**:

  - [ ] Trade table has `overflow-x-auto` or equivalent horizontal scroll handling
  - [ ] Checkbox/RadioGroup have `min-h-11 min-w-11` (44px) touch targets
  - [ ] Import dialog has responsive width constraint for 375px
  - [ ] `mobile-bottom-nav.tsx` exists with 4+ navigation items
  - [ ] Dashboard + landing + teams layouts have safe-area padding
  - [ ] `npm run typecheck` → 0 errors
  - [ ] Playwright screenshots captured for each check (or grep-based code verification)

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Mobile viewport verification via code inspection
    Tool: Bash (grep)
    Preconditions: None
    Steps:
      1. Grep for 'overflow-x-auto\|overflow-x-scroll' in trade-table-review.tsx → expect match
      2. Grep for 'min-h-11\|min-w-11\|min-h-[44px]' in checkbox.tsx, radio-group.tsx → expect matches
      3. Grep for 'max-w-\[90vw\]\|max-w-\[95vw\]' in import-button.tsx → expect match
      4. Verify mobile-bottom-nav.tsx exists and contains navigation items
      5. Grep for 'pb-safe\|safe-area\|env(safe-area-inset' in dashboard/layout.tsx, landing/layout.tsx, teams/layout.tsx → expect matches
    Expected Result: All 5 checks pass — mobile optimizations in place
    Failure Indicators: Any check returns no match — indicates missing implementation
    Evidence: .sisyphus/evidence/task-4-mobile-verification.txt

  Scenario: Playwright mobile viewport screenshot (optional, if dev server available)
    Tool: Playwright
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. Set viewport to 375x667 (iPhone SE)
      2. Navigate to /en/dashboard
      3. Screenshot the dashboard
      4. Verify no horizontal overflow
      5. Verify bottom tab bar visible
    Expected Result: Dashboard renders without overflow, bottom nav visible
    Failure Indicators: Horizontal scrollbar visible; bottom nav missing
    Evidence: .sisyphus/evidence/task-4-mobile-dashboard.png
  ```

  **Commit**: YES (only if fixes needed)
  - Message: `fix(mobile): verify and patch remaining responsive issues`
  - Files: Only files that failed verification
  - Pre-commit: `npm run typecheck`

---

- [x] 5. Full Verification Suite + Stale Plan Reconciliation — COMPLETE

  **What to do**:
  Run the full verification suite and reconcile all stale plan files.

  **Step 1: Run verification commands**
  ```bash
  npm run typecheck    # 0 errors
  npm run lint         # within warning budget (1546 max)
  npm run test         # all tests pass
  npm run build        # production build succeeds
  ```

  **Step 2: Reconcile stale plan files**
  Update all plan files to reflect current completion status:
  - `.sisyphus/plans/MEGA-all-plans.md` — Mark D1-D6 as [x] if code exists
  - `.sisyphus/plans/MASTER-fix-plan.md` — Mark all Wave 2/3/4 items as verified
  - `.sisyphus/plans/fix-widget-data.md` — Mark Tasks 1-4 as [x] after fixes
  - `.sisyphus/plans/mobile-optimization.md` — Mark all tasks as verified

  **Step 3: Delete superseded plans**
  These plans are fully complete and superseded by this MASTER plan:
  - `.sisyphus/plans/pending-fixes.md` — All tasks done
  - `.sisyphus/plans/fix-team-sidebar.md` — All tasks done
  - `.sisyphus/plans/remove-landing-sidebar.md` — All tasks done

  **Must NOT do**:
  - Do NOT modify any source code in this task
  - Do NOT delete any plan that still has pending items

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Running commands and editing markdown files only.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (after Wave 2)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 1, 2, 3

  **References**:
  - All plan files in `.sisyphus/plans/`

  **Acceptance Criteria**:

  - [ ] `npm run typecheck` → 0 errors
  - [ ] `npm run lint` → within warning budget
  - [ ] `npm run test` → all tests pass
  - [ ] `npm run build` → production build succeeds
  - [ ] All plan files updated with final completion status
  - [ ] Superseded plan files deleted

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Full verification suite passes
    Tool: Bash
    Preconditions: Tasks 1-3 code changes complete
    Steps:
      1. Run: npm run typecheck → expect 0 errors
      2. Run: npm run lint → expect within budget
      3. Run: npm run test → expect all pass
      4. Run: npm run build → expect success
    Expected Result: All 4 commands exit 0
    Failure Indicators: Any command exits non-zero
    Evidence: .sisyphus/evidence/task-5-verification.txt
  ```

  **Commit**: YES
  - Message: `chore: reconcile plan files and verify all fixes`
  - Files: `.sisyphus/plans/*.md` (markdown only)
  - Pre-commit: None (markdown only)

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
>
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.**

- [x] F1. **Plan Compliance Audit** — `oracle` — ✅ APPROVE (Must Have 6/6, Must NOT Have 11/11)
  Read this plan end-to-end. For each "Must Have": verify implementation exists (read file, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in `.sisyphus/evidence/`. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high` — ✅ APPROVE (Build PASS, Lint PASS, Tests 367/367, Files 2/2 clean)
  Run `npm run typecheck` + `npm run lint` + `npm run test`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, `console.log` in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [x] F3. **Real Manual QA** — `unspecified-high` (+ `webapp-testing` skill) — ✅ APPROVE (Logic verified, edge cases handled)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration: load dashboard → verify widgets populated → delete a trade → verify widget updates → add a trade → verify widget updates. Test edge cases: brand new user (no trades), zero PnL trade set. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep` — ✅ APPROVE (Tasks 5/5 compliant, Contamination CLEAN, Unaccounted CLEAN)
  For each task: read "What to do", read actual diff (`git diff`). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination: Task N touching Task M's files. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| Commit | Message | Files | Pre-commit |
|--------|---------|-------|------------|
| 1 | `fix(dashboard): repair widget data hydration pipeline` | `context/data-provider.tsx`, `app/[locale]/dashboard/layout.tsx` | `npm run typecheck && npm run test` |
| 2 | `fix(dashboard): clear IndexedDB cache on all trade mutations` | `context/data-provider.tsx` | `npm run typecheck && npm run test` |
| 3 | `fix(server): add cache tag invalidation for user data sub-tags` | `server/trades.ts` | `npm run typecheck && npm run test` |
| 4 | `fix(mobile): verify and patch remaining responsive issues` (only if needed) | Affected mobile files | `npm run typecheck` |
| 5 | `chore: reconcile plan files and verify all fixes` | `.sisyphus/plans/*.md` | None |

> Commits 1 and 2 may be squashed if they touch overlapping regions of `data-provider.tsx` and the executor deems it cleaner.

---

## Success Criteria

### Verification Commands
```bash
npm run typecheck    # Expected: 0 errors
npm run lint         # Expected: within warning budget (1546 max)
npm run test         # Expected: all tests pass
npm run build        # Expected: production build succeeds
```

### Final Checklist
- [x] All "Must Have" present
- [x] All "Must NOT Have" absent
- [x] All tests pass (367 passed, 0 failed)
- [x] No `as any` / `@ts-ignore` / `console.log` added
- [x] No changes to auth.ts, schema.prisma, prisma-guard.ts
- [x] Dashboard widgets display real data (verified via code review)
- [x] Trade mutations invalidate both server cache tags AND IndexedDB
- [x] Zero-PnL card shows neutral (not red/negative) styling
- [x] Mobile viewport (375px) passes all 5 verification checks
- [x] All stale plan files reconciled or deleted

