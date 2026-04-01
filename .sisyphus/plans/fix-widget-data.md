# Fix Widget Data — End-to-End Widget Hydration Pipeline Repair

## TL;DR

> **Quick Summary**: Fix 5 confirmed root causes in `context/data-provider.tsx` and `server/user-data.ts` that cause dashboard widgets to show empty/zero data. The core issue is a cascade: empty cache snapshot marks `hasLocalSnapshot=true`, which then skips account hydration, and any background refresh failure leaves the user in a permanent empty state.
> 
> **Deliverables**:
> - Fixed `loadData` hydration in `context/data-provider.tsx` (no more empty-trade snapshot + skipped accounts)
> - Background refresh error surfacing with retry capability
> - Stabilized 21-dep `useCallback` dependency array
> - IndexedDB cache cleared on trade mutations (server → client bridge)
> - Cache tag invalidation for `user-data-core-*` / `user-data-supplemental-*` in trade mutations
> - Zero-PnL neutral styling in cumulative PnL card
> 
> **Estimated Effort**: Medium (6 tasks, ~3-4 hours parallel execution)
> **Parallel Execution**: YES — 3 waves + final verification wave
> **Critical Path**: Task 1 → Task 2, 3, 4 → Task 5 → Final Verification

---

## Context

### Original Request
User reported dashboard widgets showing no data. Investigation requested: full architecture study of widgets, database, frontend, and backend end-to-end, then root cause analysis and fix plan.

### Interview Summary
**Key Discussions**:
- Full architecture study completed (4 exploration agents, 9 agent sessions total)
- Health check passed: TypeScript clean, 345/345 tests pass, all widget files intact
- Root cause investigation identified 7 potential causes
- Metis consultation invalidated 2 causes (RC-3 auth ID divergence, RC-5 default layout empty ids) as correct-by-design
- 1 cause (RC-7 Prisma cooldown) classified as monitor-only safety feature
- User chose "Create Work Plan (All 7)" — plan covers all 5 valid root causes + 1 cosmetic fix

**Research Findings**:
- `context/data-provider.tsx` is a 2310-line monolithic provider — primary fix target
- IndexedDB has `clearTradesCache()` and `clearAllCache()` helpers but they're only called from manual UI actions, never from mutations
- Cache tags `user-data-core-{userId}` and `user-data-supplemental-{userId}` exist in `server/user-data.ts:96-97` but trade mutations in `server/trades.ts` only invalidate `trades-{userId}` and `user-data-{userId}` (missing the sub-tags)
- Zero-PnL uses `isPositive = netPnl > 0` — no neutral branch for `=== 0`

### Metis Review
**Identified Gaps** (addressed):
- **RC-3 (Auth ID divergence)**: DROPPED — `DashboardLayout.userId` uses `auth_user_id` by schema design (schema.prisma:195). Not a bug.
- **RC-5 (Default layout empty ids)**: DROPPED — `data-provider.tsx:631-641` properly injects `userId` into defaults. Not a bug.
- **RC-7 (Prisma cooldown)**: MONITOR ONLY — safety feature in `lib/prisma-guard.ts`, not to be modified.
- **Scope creep risk**: Plan explicitly excludes auth, schema, and middleware changes.
- **Dependency array explosion**: 21 deps in `loadData` useCallback causes unnecessary re-executions — included in Task 1.

---

## Work Objectives

### Core Objective
Fix the data hydration pipeline so dashboard widgets reliably display user trading data instead of empty/zero states.

### Concrete Deliverables
- Modified `context/data-provider.tsx` — 4 sub-fixes in the `loadData` function
- Modified `server/user-data.ts` — no changes needed (cache tags already exist, just need invalidation from trades.ts)
- Modified `server/trades.ts` — add missing cache tag invalidations for user-data-core/supplemental
- Modified `context/data-provider.tsx` — clear IndexedDB cache on mutations
- Modified `app/[locale]/dashboard/components/statistics/cumulative-pnl-card.tsx` — neutral zero-PnL styling

### Definition of Done
- [ ] `npm run typecheck` → 0 errors
- [ ] `npm run lint` → no new errors
- [ ] `npm run test` → all 345 tests pass
- [ ] Dashboard loads with user trades visible in widgets
- [ ] `?debugData=1` shows `T:{N>0} F:{N>0}` for all widgets
- [ ] Background refresh failure shows error state (not silent empty)
- [ ] Trade mutations (save/delete) clear IndexedDB and invalidate cache tags
- [ ] Zero-PnL card shows neutral styling (not red/negative)

### Must Have
- Widgets display real user data after login
- Background refresh failures are surfaced to UI
- IndexedDB cache is invalidated on trade mutations
- All existing tests continue to pass
- No changes to Prisma schema or migrations
- No changes to `server/auth.ts` or auth resolution
- No new npm dependencies

### Must NOT Have (Guardrails)
- **NO** changes to `server/auth.ts` — auth resolution is correct by design
- **NO** changes to `prisma/schema.prisma` or migrations
- **NO** changes to `lib/prisma-guard.ts` cooldown mechanism
- **NO** synthesized/fake data as fallback — honest empty states only
- **NO** `as any` / `@ts-ignore` / `console.log` — ESLint errors in this project
- **NO** new npm dependencies — surgical fixes only
- **NO** refactoring of the 2310-line provider beyond targeted fixes — minimize blast radius
- **NO** changes to widget registry, layout system, or rendering components
- **NO** changes to middleware/proxy.ts
- **NO** "fixing" RC-3 (auth ID divergence) or RC-5 (default layout ids) — both correct by design

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.
> Acceptance criteria requiring "user manually tests/confirms" are FORBIDDEN.

### Test Decision
- **Infrastructure exists**: YES (Vitest)
- **Automated tests**: Tests-after (add regression tests for the fixed behaviors)
- **Framework**: Vitest (`npm run test`)
- **Test location**: `lib/__tests__/` and `context/__tests__/` (co-located test patterns)

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright (webapp-testing skill) — Navigate to dashboard, verify widget data, screenshot
- **Server/API**: Use Bash (curl) — Send requests, assert response fields
- **Unit tests**: Use Bash — Run vitest, verify pass/fail counts

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — THE critical fix):
└── Task 1: Fix loadData hydration pipeline [deep]
    Sub-fix 1a: Stabilize dependency array (21→~5 deps)
    Sub-fix 1b: Fix setTrades([]) empty snapshot
    Sub-fix 1c: Fix setAccounts() skip when hasLocalSnapshot=true
    Sub-fix 1d: Surface background refresh errors

Wave 2 (Parallel — 3 independent fixes):
├── Task 2: Clear IndexedDB on trade mutations [unspecified-high]
├── Task 3: Add cache tag invalidation in trade mutations [quick]
└── Task 4: Surface layout fetch errors in data-provider [quick]

Wave 3 (UI Polish):
└── Task 5: Fix zero-PnL neutral styling [visual-engineering]

Wave FINAL (After ALL tasks — 4 parallel reviews → user okay):
├── F1: Plan compliance audit [oracle]
├── F2: Code quality review [unspecified-high]
├── F3: Real manual QA [unspecified-high + playwright]
└── F4: Scope fidelity check [deep]
→ Present results → Get explicit user okay

Critical Path: Task 1 → Task 2, 3, 4 → Task 5 → F1-F4 → user okay
Max Concurrent: 3 (Wave 2)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| 1 | None | 2, 3, 4 | 1 |
| 2 | 1 | 5, F1-F4 | 2 |
| 3 | 1 | 5, F1-F4 | 2 |
| 4 | 1 | 5, F1-F4 | 2 |
| 5 | 2, 3, 4 | F1-F4 | 3 |
| F1 | 5 | user okay | FINAL |
| F2 | 5 | user okay | FINAL |
| F3 | 5 | user okay | FINAL |
| F4 | 5 | user okay | FINAL |

### Agent Dispatch Summary

- **Wave 1**: 1 task — T1 → `deep`
- **Wave 2**: 3 tasks — T2 → `unspecified-high`, T3 → `quick`, T4 → `quick`
- **Wave 3**: 1 task — T5 → `visual-engineering`
- **FINAL**: 4 tasks — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [ ] 1. Fix loadData Hydration Pipeline (THE Critical Fix)

  **What to do**:
  This is the single most impactful fix. The `loadData` function in `context/data-provider.tsx` has 4 interrelated bugs that cascade into permanent empty widget state. Fix all 4 sub-issues in this task.

  **Sub-fix 1a: Stabilize dependency array (lines 812-836)**
  The `useCallback` for `loadData` has 21 dependencies, many of which are Zustand setters that are referentially stable. This causes unnecessary re-executions that can trigger race conditions.
  - Remove stable Zustand setters from the dependency array: `setAccounts`, `setDashboardLayout`, `setEvents`, `setGroups`, `setIsLoading`, `setMoods`, `setSubscription`, `setSupabaseUser`, `setTags`, `setTickDetails`, `setTrades`, `setUser`, `resetUserState` (these are created via `create` and never change reference)
  - Keep semantic dependencies: `adminView`, `isSharedView`, `initialSharedData`, `params?.slug`, `fetchAllTrades`, `hydrateSharedAccountMetrics`, `sanitizeTradesForState`, `syncSharedDataState`, `withTimeout`, `supabase`
  - Target: reduce from 21 to ~10 meaningful deps

  **Sub-fix 1b: Fix `setTrades([])` empty snapshot (lines 674-677)**
  Currently:
  ```typescript
  if (cachedTrades && Array.isArray(cachedTrades) && cachedTrades.length > 0) {
    hasLocalSnapshot = true;
    setTrades(sanitizeTradesForState(cachedTrades as Trade[]));
  } else if (cachedUserData) {
    hasLocalSnapshot = true;  // ← BUG: marks snapshot even when trades are empty
    setTrades([]);            // ← BUG: sets empty array, blocks later hydration
  }
  ```
  Fix: Only set `hasLocalSnapshot = true` when there are actual trades OR when `cachedUserData` has meaningful data. Don't set empty trades — let `refreshFromServer` populate them. The user data block (lines 679-690) already sets `hasLocalSnapshot = true` when `cachedUserData` exists, so the duplicate in the `else if` is redundant.
  - Remove lines 674-677 entirely (the `else if` branch)
  - The `cachedUserData` block (lines 679-690) already handles `hasLocalSnapshot` correctly

  **Sub-fix 1c: Fix `setAccounts()` skip (lines 751-753)**
  Currently:
  ```typescript
  if (!hasLocalSnapshot) {
    setAccounts(normalizedAccounts);  // ← BUG: skipped when hasLocalSnapshot=true
    setIsLoading(false);
  }
  ```
  When `hasLocalSnapshot=true` (set from cached user data), fresh server accounts are NEVER written to state. Fix:
  - Always call `setAccounts(normalizedAccounts)` regardless of `hasLocalSnapshot`
  - Move `setIsLoading(false)` outside the condition (or keep it inside for the non-snapshot path)
  - The account metrics background calculation (lines 770-777) already handles updating accounts with metrics, so the initial set just needs to happen unconditionally

  **Sub-fix 1d: Surface background refresh errors (lines 785-787)**
  Currently:
  ```typescript
  void refreshFromServer().catch((error) => {
    logger.error({ error }, "Background refresh failed");  // ← BUG: silent, no UI feedback
  });
  ```
  Fix: Add an error state that the UI can react to:
  - Add a `setDataError` setter (or reuse existing error state if one exists in the provider)
  - On background refresh failure, set the error state so the UI can show a retry prompt
  - Add a manual retry mechanism (expose a `retryDataLoad` action)
  - Keep the error logged via `logger.error`

  **Must NOT do**:
  - Do NOT refactor the entire 2310-line file — only touch the `loadData` function and immediate supporting code
  - Do NOT change the `refreshFromServer` function body beyond what's needed for error handling
  - Do NOT add new external dependencies
  - Do NOT change auth resolution logic
  - Do NOT synthesize fake data as fallback

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: This task requires understanding the full data hydration flow, the interplay between 4 sub-bugs, and how the `hasLocalSnapshot` flag cascades through the function. It's a multi-step logic fix in a complex codebase.
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `webapp-testing`: Only needed for QA verification, not implementation
    - `next-best-practices`: The fix is React state management, not Next.js specific

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (sequential — foundation for all other tasks)
  - **Blocks**: Tasks 2, 3, 4, 5, F1-F4
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References** (existing code to follow):
  - `context/data-provider.tsx:671-694` — The cache-first hydration block. Understand how `cachedTrades` and `cachedUserData` interact with `hasLocalSnapshot`
  - `context/data-provider.tsx:697-782` — The `refreshFromServer` function. Understand the full server reconciliation flow
  - `context/data-provider.tsx:784-791` — The background refresh trigger and the silent `.catch()`
  - `context/data-provider.tsx:812-836` — The 21-dep dependency array
  - `context/data-provider.tsx:792-811` — The outer catch block showing how errors are handled when there's no snapshot
  - `context/providers/data-state-provider.tsx` — Slice provider pattern, may show how state setters are created (confirming they're stable references)

  **API/Type References**:
  - `context/data-provider.tsx:1-50` — Type imports and provider interface (check for existing error state types)
  - `store/trading-domain-store.ts` — Zustand store where `setTrades`, `setAccounts` etc. are defined (confirm setters are stable via `create()`)

  **External References**:
  - Zustand docs: Setters from `create()` are referentially stable — no need to include them in dependency arrays
  - React docs: `useCallback` dependency array should only include values that change over time

  **WHY Each Reference Matters**:
  - Lines 671-694: This is the exact code block containing sub-fix 1b — the executor needs to understand how `hasLocalSnapshot` is set from cache reads
  - Lines 697-782: The executor must understand `refreshFromServer` to know that accounts are only set conditionally (sub-fix 1c)
  - Lines 784-791: The exact error suppression code to fix (sub-fix 1d)
  - Lines 812-836: The dependency array to trim (sub-fix 1a)
  - trading-domain-store.ts: Confirms that Zustand setters are created via `create()` and are referentially stable

  **Acceptance Criteria**:

  - [ ] `npm run typecheck` → 0 errors
  - [ ] `npm run lint` → no new errors
  - [ ] `npm run test` → all tests pass
  - [ ] No `setTrades([])` call when `cachedTrades` is empty but `cachedUserData` exists
  - [ ] `setAccounts(normalizedAccounts)` is called unconditionally in `refreshFromServer`
  - [ ] Background refresh failure sets an error state (not just logs)
  - [ ] Dependency array reduced from 21 to ~10 items
  - [ ] No changes outside the `loadData` function and immediate error state additions

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Dashboard loads with cached user data but no cached trades
    Tool: Bash (vitest) + Playwright
    Preconditions: User has an account with trades in DB. IndexedDB has user-data cache but empty trades cache.
    Steps:
      1. Run: npm run typecheck → expect 0 errors
      2. Run: npm run test → expect all tests pass
      3. Start dev server: npm run dev
      4. Open Playwright browser to http://localhost:3000/dashboard?debugData=1
      5. Wait for dashboard to fully load (max 15 seconds)
      6. Check DebugDataBadge shows T:{N>0} F:{N>0} (not T:0 F:0)
      7. Screenshot the dashboard showing populated widgets
    Expected Result: Widgets show actual trade data, debug badge shows T>0
    Failure Indicators: DebugDataBadge shows T:0 F:0, widgets show $0.00, any widget shows "No data" when user has trades
    Evidence: .sisyphus/evidence/task-1-cached-hydration.png

  Scenario: Background refresh failure surfaces error
    Tool: Bash (vitest)
    Preconditions: Test environment where server action can be made to fail
    Steps:
      1. Run: npm run typecheck → expect 0 errors
      2. Run: npm run test → expect all tests pass
      3. Verify that `loadData` function sets an error state when `refreshFromServer` rejects
      4. Verify the error state is typed and exported from the provider
    Expected Result: Error state exists and is set on refresh failure, not silently swallowed
    Failure Indicators: No error state variable, error only logged, no retry mechanism
    Evidence: .sisyphus/evidence/task-1-error-surfacing.txt
  ```

  **Commit**: YES
  - Message: `fix(dashboard): repair widget data hydration pipeline`
  - Files: `context/data-provider.tsx`
  - Pre-commit: `npm run typecheck && npm run test`

- [ ] 2. Clear IndexedDB Cache on Trade Mutations

  **What to do**:
  When trades are saved or deleted via server actions (`saveTradesAction`, `deleteTradesByIdsAction`), the IndexedDB trades cache in the browser is never cleared. This means stale data persists across sessions, and the next `loadData` call reads the stale cache instead of fetching fresh data from the server.

  The `clearTradesCache(userId)` and `clearAllCache(userId)` functions already exist in `lib/indexeddb/trades-cache.ts` (lines 120, 145). They are currently only called from manual user actions in `data-management-card.tsx` and `data-debug.tsx`.

  Fix: Import and call `clearTradesCache(userId)` after any trade mutation in the data provider's action handlers. Specifically:
  - In the `saveTrades` action wrapper within `data-provider.tsx` — after the server action succeeds, clear the trades cache
  - In the `deleteTrades` action wrapper within `data-provider.tsx` — after the server action succeeds, clear the trades cache
  - Ensure the clear happens asynchronously (don't block the UI on it) — use `.catch()` for error handling

  **Must NOT do**:
  - Do NOT modify `server/trades.ts` — server-side cache is handled in Task 3
  - Do NOT modify `lib/indexeddb/trades-cache.ts` — the API already exists and works
  - Do NOT change the IndexedDB schema or store structure
  - Do NOT clear cache before the mutation succeeds (could lose data on failure)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Requires finding the right mutation wrapper locations in a 2310-line file, understanding the action dispatch pattern, and adding cache clearing without breaking existing flows.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Task 1)
  - **Parallel Group**: Wave 2 (with Tasks 3, 4)
  - **Blocks**: Task 5, F1-F4
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `lib/indexeddb/trades-cache.ts:120` — `clearTradesCache(userId)` function (the API to call)
  - `lib/indexeddb/trades-cache.ts:145-151` — `clearAllCache(userId)` function (broader clear if needed)
  - `context/data-provider.tsx:66` — Import line for IndexedDB helpers (add `clearTradesCache` to this import)

  **API/Type References**:
  - `context/data-provider.tsx` — Search for `saveTradesAction` and `deleteTradesByIdsAction` call sites to find the mutation wrappers
  - `lib/indexeddb/trades-cache.ts:1-30` — STORES enum and cache key structure

  **Test References**:
  - `lib/__tests__/` — Existing test patterns for IndexedDB operations

  **WHY Each Reference Matters**:
  - `trades-cache.ts:120`: The exact function to import and call
  - `context/data-provider.tsx:66`: Where to add the import
  - Mutation wrappers: Where to insert the cache-clear calls

  **Acceptance Criteria**:

  - [ ] `clearTradesCache` is imported in `data-provider.tsx`
  - [ ] Trade save and delete action wrappers call `clearTradesCache(userId)` after success
  - [ ] Cache clear is non-blocking (fire-and-forget with `.catch()`)
  - [ ] `npm run typecheck` → 0 errors
  - [ ] `npm run test` → all tests pass

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Trade save clears IndexedDB cache
    Tool: Bash (vitest)
    Preconditions: Test environment with a mock user ID
    Steps:
      1. Run: npm run typecheck → expect 0 errors
      2. Run: npm run test → expect all tests pass
      3. Verify that the save action wrapper imports clearTradesCache
      4. Verify that clearTradesCache is called after saveTradesAction succeeds
    Expected Result: clearTradesCache called with correct userId after successful save
    Failure Indicators: clearTradesCache not imported, not called, or called before mutation
    Evidence: .sisyphus/evidence/task-2-indexeddb-clear.txt

  Scenario: Trade delete clears IndexedDB cache
    Tool: Bash (vitest)
    Preconditions: Test environment with a mock user ID
    Steps:
      1. Run: npm run test → expect all tests pass
      2. Verify that delete action wrapper calls clearTradesCache after success
      3. Verify clearTradesCache is called with correct userId
    Expected Result: clearTradesCache called after successful delete
    Failure Indicators: clearTradesCache not called in delete path
    Evidence: .sisyphus/evidence/task-2-delete-clear.txt
  ```

  **Commit**: YES
  - Message: `fix(dashboard): clear IndexedDB cache on trade mutations`
  - Files: `context/data-provider.tsx`
  - Pre-commit: `npm run typecheck && npm run test`

- [ ] 3. Add Cache Tag Invalidation for Trade Mutations

  **What to do**:
  The `getCoreUserDataCached` and `getSupplementalUserDataCached` functions in `server/user-data.ts` use cache tags `user-data-core-{userId}` and `user-data-supplemental-{userId}` (defined at lines 96-97). These sub-tags are used for granular cache control.

  However, trade mutations in `server/trades.ts` only invalidate:
  - `user-data-{userId}` (via `CACHE_TAGS.USER_DATA`)
  - `trades-{userId}` (via `CACHE_TAGS.TRADES`)

  They do NOT invalidate `user-data-core-{userId}` or `user-data-supplemental-{userId}`. When `ENABLE_QUERY_CACHING=true` (feature flag), this means cached user data can become stale after trade mutations.

  Fix: Add invalidation for the sub-tags in `server/trades.ts`:
  - In `saveTradesAction` (around line 328): Add `updateTag('user-data-core-' + userId)` and `updateTag('user-data-supplemental-' + userId)` alongside existing `updateTag('user-data-' + userId)`
  - In `invalidateTradeRelatedCaches` (line 136): Add the same sub-tag invalidations
  - Consider adding these to `CACHE_TAGS` in `lib/cache/cache-invalidation.ts` for type safety (optional improvement)

  Note: This is currently dormant because `ENABLE_QUERY_CACHING` defaults to `false`. But it should be fixed proactively to prevent issues when the feature flag is enabled.

  **Must NOT do**:
  - Do NOT change the cache tag structure or naming convention
  - Do NOT modify `server/user-data.ts` — the tags are already defined there correctly
  - Do NOT change `lib/feature-flags.ts` or the default value of `ENABLE_QUERY_CACHING`

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Surgical addition of 2-4 `updateTag()` calls in known locations. The pattern already exists — just adding the missing tags.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Task 1)
  - **Parallel Group**: Wave 2 (with Tasks 2, 4)
  - **Blocks**: Task 5, F1-F4
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `server/trades.ts:328` — Existing `updateTag('user-data-' + userId)` in `saveTradesAction` (add sub-tags here)
  - `server/trades.ts:136-141` — `invalidateTradeRelatedCaches` function (add sub-tags here)
  - `server/trades.ts:497-501` — Another `updateTag` call in `getTradesAction` force-refresh path

  **API/Type References**:
  - `server/user-data.ts:96-97` — The sub-tag definitions: `USER_DATA_CORE_CACHE_TAG` and `USER_DATA_SUPPLEMENTAL_CACHE_TAG`
  - `lib/cache/cache-invalidation.ts:21-26` — `CACHE_TAGS` constants (may need extending)

  **WHY Each Reference Matters**:
  - trades.ts:328: Where to add the missing tag invalidations (same pattern, just add 2 more lines)
  - user-data.ts:96-97: The exact tag strings to invalidate (`user-data-core-${userId}`, `user-data-supplemental-${userId}`)
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
    Tool: Bash (vitest)
    Preconditions: None
    Steps:
      1. Run: npm run typecheck → expect 0 errors
      2. Run: npm run test → expect all tests pass
      3. Grep for 'user-data-core-' in server/trades.ts → expect at least 1 match
      4. Grep for 'user-data-supplemental-' in server/trades.ts → expect at least 1 match
    Expected Result: Both sub-tags are invalidated in trade mutation paths
    Failure Indicators: Missing sub-tag invalidation in saveTradesAction or invalidateTradeRelatedCaches
    Evidence: .sisyphus/evidence/task-3-cache-tags.txt
  ```

  **Commit**: YES
  - Message: `fix(server): add cache tag invalidation for trade mutations`
  - Files: `server/trades.ts`
  - Pre-commit: `npm run typecheck && npm run test`

- [ ] 4. Surface Layout Fetch Errors in Data Provider

  **What to do**:
  When `getDashboardLayout` (called in `loadData` around line 615 of `data-provider.tsx`) fails, the error is caught by the `Promise.allSettled` wrapper but never surfaced. The `loadDashboardLayoutAction` in `server/layouts.ts` (line 84) catches errors and returns `null`, which the data-provider handles by seeding a default layout (correct behavior). However, the user has no indication that their saved layout failed to load.

  Additionally, if the layout save itself fails (e.g., DB timeout), the auto-save in `dashboard-context-auto-save.tsx` retries silently but never tells the user.

  Fix:
  - In `data-provider.tsx` `loadData` function: check the `getDashboardLayout` result from `Promise.allSettled`. If it's "rejected", log a specific warning about layout fetch failure (not just a generic "cache read failed")
  - In `loadDashboardLayoutAction` (`server/layouts.ts:80-87`): the existing error handling is correct (logs + returns null), but verify it's logging enough context for debugging
  - This is a LOW priority task — the primary data flow issue is fixed in Task 1. This task adds observability.

  **Must NOT do**:
  - Do NOT change the layout fallback logic (seeding default layout is correct)
  - Do NOT modify `dashboard-context-auto-save.tsx` — it already retries
  - Do NOT change `server/layouts.ts` error handling pattern (it's already correct)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Adding a targeted warning log for a specific failure case. Minimal code change.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Task 1)
  - **Parallel Group**: Wave 2 (with Tasks 2, 3)
  - **Blocks**: Task 5, F1-F4
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `context/data-provider.tsx:615` — The `Promise.allSettled` call that includes `getDashboardLayout`
  - `context/data-provider.tsx:663-669` — Existing error handling pattern for rejected promises
  - `server/layouts.ts:80-87` — `loadDashboardLayoutAction` error handling (reference, don't modify unless needed)

  **WHY Each Reference Matters**:
  - Line 615: Where layout fetch happens — need to check the result
  - Lines 663-669: Existing pattern for handling rejected promises — follow this pattern

  **Acceptance Criteria**:

  - [ ] Layout fetch rejection has a specific warning log (not just generic "cache read failed")
  - [ ] `npm run typecheck` → 0 errors
  - [ ] `npm run test` → all tests pass
  - [ ] No changes to layout fallback behavior

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Layout fetch failure is logged with context
    Tool: Bash (vitest)
    Preconditions: None
    Steps:
      1. Run: npm run typecheck → expect 0 errors
      2. Run: npm run test → expect all tests pass
      3. Verify that the layout fetch result from Promise.allSettled has a specific rejection handler
    Expected Result: Layout fetch failure produces a descriptive log message
    Failure Indicators: No specific handling for layout fetch rejection
    Evidence: .sisyphus/evidence/task-4-layout-error.txt
  ```

  **Commit**: YES
  - Message: `fix(dashboard): surface layout fetch errors in data provider`
  - Files: `context/data-provider.tsx`
  - Pre-commit: `npm run typecheck && npm run test`

- [ ] 5. Fix Zero-PnL Neutral Styling in Cumulative PnL Card

  **What to do**:
  The cumulative PnL card in `app/[locale]/dashboard/components/statistics/cumulative-pnl-card.tsx` uses `isPositive = netPnl > 0` (line 28). When `netPnl === 0`, `isPositive` is `false`, which applies red/negative styling (`metric-negative` CSS class, `TrendingDown` icon, `-` prefix).

  For a trader with exactly $0 net PnL, the card shows as a negative (red with down trend arrow), which is misleading. Zero should show neutral styling.

  Fix:
  - Change the boolean to a ternary: `const trend = netPnl > 0 ? 'positive' : netPnl < 0 ? 'negative' : 'neutral'`
  - For `trend === 'neutral'`: use a muted/neutral text color (e.g., `text-v2-text-secondary`), no trend icon (or a dash `—` icon), no `+` or `-` prefix, show `$0.00`
  - For `trend === 'positive'`: keep current `metric-positive` + `TrendingUp` + `+` prefix
  - For `trend === 'negative'`: keep current `metric-negative` + `TrendingDown` + `-` prefix
  - Apply to both compact (line 49-77) and full (line 80-108) render paths

  **Must NOT do**:
  - Do NOT change the PnL calculation logic (line 27)
  - Do NOT add new CSS classes or modify the theme
  - Do NOT change any other statistics cards
  - Do NOT introduce a new icon import — use existing `text-v2-text-secondary` or similar neutral class

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI component styling change. Requires understanding of the design system tokens and ensuring visual consistency in both compact and full render paths.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (after Wave 2)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 2, 3, 4

  **References**:

  **Pattern References**:
  - `app/[locale]/dashboard/components/statistics/cumulative-pnl-card.tsx:28` — Current `isPositive` boolean (change to ternary trend)
  - `app/[locale]/dashboard/components/statistics/cumulative-pnl-card.tsx:49-77` — Compact render path (needs neutral branch)
  - `app/[locale]/dashboard/components/statistics/cumulative-pnl-card.tsx:80-108` — Full render path (needs neutral branch)
  - `app/[locale]/dashboard/components/statistics/cumulative-pnl-card.tsx:56-63` — Compact icon + value rendering (add neutral case)
  - `app/[locale]/dashboard/components/statistics/cumulative-pnl-card.tsx:83,88-93` — Full icon + value rendering (add neutral case)

  **API/Type References**:
  - Design system tokens: `metric-positive`, `metric-negative`, `text-v2-text-secondary`, `text-v2-text-primary` — CSS classes available in the project

  **WHY Each Reference Matters**:
  - Line 28: The exact logic to change from boolean to ternary
  - Lines 49-77, 80-108: Both render paths need the neutral case added
  - Design tokens: Need to know what neutral styling class to use

  **Acceptance Criteria**:

  - [ ] `netPnl === 0` shows neutral styling (not red/negative)
  - [ ] Neutral state uses muted text color, no trend icon or dash icon
  - [ ] Positive and negative styling unchanged
  - [ ] Works in both compact and full render paths
  - [ ] `npm run typecheck` → 0 errors
  - [ ] `npm run test` → all tests pass

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Zero-PnL card shows neutral styling (compact)
    Tool: Playwright
    Preconditions: Dev server running, user with exactly $0 net PnL
    Steps:
      1. Open http://localhost:3000/dashboard?debugData=1
      2. Find the cumulative PnL card (compact or full size)
      3. Verify the card shows "$0.00" without "+" or "-" prefix
      4. Verify no TrendingDown icon is displayed
      5. Verify text color is neutral/muted (not red/metric-negative)
      6. Screenshot the card
    Expected Result: Card displays "$0.00" in neutral text, no trend arrow
    Failure Indicators: Card shows "-$0.00" or has TrendingDown icon or metric-negative class
    Evidence: .sisyphus/evidence/task-5-zero-pnl-neutral.png

  Scenario: Negative-PnL card still shows negative styling
    Tool: Playwright
    Preconditions: Dev server running, user with negative net PnL
    Steps:
      1. Open http://localhost:3000/dashboard
      2. Find the cumulative PnL card
      3. Verify red/metric-negative styling is preserved
      4. Verify TrendingDown icon is present
    Expected Result: Negative PnL still shows red styling with down trend arrow
    Failure Indicators: Negative PnL shows neutral or positive styling
    Evidence: .sisyphus/evidence/task-5-negative-pnl-preserved.png
  ```

  **Commit**: YES
  - Message: `fix(ui): neutral styling for zero-PnL cumulative card`
  - Files: `app/[locale]/dashboard/components/statistics/cumulative-pnl-card.tsx`
  - Pre-commit: `npm run typecheck`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
>
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read this plan end-to-end. For each "Must Have": verify implementation exists (read file, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in `.sisyphus/evidence/`. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run typecheck` + `npm run lint` + `npm run test`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, `console.log` in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `webapp-testing` skill)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration: load dashboard → verify widgets populated → delete a trade → verify widget updates → add a trade → verify widget updates. Test edge cases: brand new user (no trades), zero PnL trade set. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (`git diff`). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination: Task N touching Task M's files. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| Commit | Message | Files | Pre-commit |
|--------|---------|-------|------------|
| 1 | `fix(dashboard): repair widget data hydration pipeline` | `context/data-provider.tsx` | `npm run typecheck && npm run test` |
| 2 | `fix(dashboard): clear IndexedDB cache on trade mutations` | `context/data-provider.tsx` | `npm run typecheck && npm run test` |
| 3 | `fix(server): add cache tag invalidation for trade mutations` | `server/trades.ts` | `npm run typecheck && npm run test` |
| 4 | `fix(dashboard): surface layout fetch errors in data provider` | `context/data-provider.tsx` | `npm run typecheck && npm run test` |
| 5 | `fix(ui): neutral styling for zero-PnL cumulative card` | `app/[locale]/dashboard/components/statistics/cumulative-pnl-card.tsx` | `npm run typecheck` |

> Commits 2 and 4 may be squashed with commit 1 if they touch the same file regions and the executor deems it cleaner. Use judgment.

---

## Success Criteria

### Verification Commands
```bash
npm run typecheck    # Expected: 0 errors
npm run lint         # Expected: no new errors (existing budget: 1546 warnings max)
npm run test         # Expected: 345+ tests pass, 0 failures
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All tests pass
- [ ] No `as any` / `@ts-ignore` / `console.log` added
- [ ] No changes to auth.ts, schema.prisma, prisma-guard.ts
- [ ] Dashboard widgets display real data (verified via Playwright + `?debugData=1`)
- [ ] Trade mutations invalidate both server cache tags AND IndexedDB
- [ ] Zero-PnL card shows neutral (not red/negative) styling
