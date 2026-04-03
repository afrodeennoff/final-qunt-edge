# Dashboard Stabilization + 24h Chat Retention

## TL;DR

> **Quick Summary**: One-shot stabilization pass fixing sidebar bugs, parallelizing dashboard data loading, closing equity-chart cache invalidation gap, migrating chat surfaces to AI Elements, adding 24-hour chat artifact retention, and verifying runtime/deploy health.
> 
> **Deliverables**:
> - Sidebar header button fix (unified-sidebar.tsx)
> - Parallel `refreshAllData` with Promise.allSettled + sticky error recovery
> - Centralized cache tag layer with equity-chart invalidation on all mutation paths
> - Dashboard chat + accounts analysis migrated to AI Elements (preserving custom tool renderers)
> - 24-hour chat artifact retention with cleanup cron
> - Runtime/deploy verification pass + unit tests
> 
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 5 waves
> **Critical Path**: Cache tags (T1-T2) -> Data provider (T4) -> Chat migration (T5-T6) -> Retention (T7-T8) -> Tests (T9) -> Integration (T10) -> Verification (T11)

---

## Context

### Original Request
One-shot dashboard stabilization covering: sidebar behavior, dashboard loading, cache integrity, chat/AI rendering, 24-hour chat artifact retention, and runtime/deploy hardening — without replacing core auth/data providers.

### Interview Summary
**Key Corrections from Exploration** (3 findings that changed scope):
1. **Sidebar cookie flow WORKS** — Cookie IS read server-side in all 3 authenticated layouts (dashboard, teams, admin). `getInitialSidebarOpen` is a passthrough by design. Only real sidebar fix: inert header button.
2. **Chat persistence ALREADY EXISTS** — Via `Mood.conversation` JSON field, not client-side only. `saveChat()` persists after every AI response, `loadChat()` loads today's messages. However, `saveChat` strips non-text parts (tool calls, artifacts), and no cleanup cron exists.
3. **Force param ALREADY bypasses server cache** — When `force=true`, server actions call `updateTag()` + direct DB reads. The gap is client-side: partial state on failure and error state handling.

### Metis Review
**Identified Gaps** (addressed):
- Sidebar scope reduced from 2 fixes to 1 (cookie flow confirmed working)
- Chat retention scoped to enhance existing Mood-based persistence, not create new models
- Custom tool renderers (EquityChartMessage 470 lines, askForConfirmation) marked as MUST PRESERVE — no AI Element equivalent
- `refreshAllData` error handling: missing `setRefreshError(null)` in finally block
- `CACHE_TAGS.DASHBOARD_LAYOUT` naming mismatch needs alignment (default: change constant to match server reality)

---

## Work Objectives

### Core Objective
Stabilize the dashboard shell, data orchestration, and cache integrity while adding 24-hour chat artifact retention — all without replacing core auth/data providers.

### Concrete Deliverables
- `components/ui/unified-sidebar.tsx` — header button wired to navigation or made non-interactive
- `context/data-provider.tsx` — parallel refresh, sticky error state, clean force-refresh contract
- `lib/cache/cache-invalidation.ts` — unified tag constants with EQUITY_CHART, aligned DASHBOARD_LAYOUT
 removed ACCOUNT_METRICS
 - `server/equity-chart.ts` + all mutation files — equity-chart cache invalidation
- Dashboard chat + accounts analysis migrated to AI Elements (custom tool renderers preserved)
- 24-hour chat retention via enhanced Mood persistence + cleanup cron
- Unit tests for cache tags, sidebar state, data-provider refresh



### Definition of Done
- [ ] `npm run typecheck` passes with zero errors
- [ ] `npm run lint` passes within warning budget
- [ ] Targeted Vitest tests pass for sidebar state, data-provider, cache tags, chat retention
- [ ] Equity-chart cache invalidation verified on all mutation paths
- [ ] Dashboard chat renders via AI Elements (custom tool renderers preserved)
- [ ] 24h chat retention cron runs and only deletes expired chat data
- [ ] `refreshAllData({ force: true })` provides full-consistency refresh

### Must Have
- Sidebar header button no longer appears interactive without action
- Equity-chart cache invalidated on ALL mutation paths (trades, accounts, groups, tags, journal, imports)
- `CACHE_TAGS.DASHBOARD_LAYOUT` maps to `dashboard-layout-${userId}` matching server reality
- `CACHE_TAGS.EQUITY_CHART` constant exists and `invalidateEquityChart(userId)` helper
- `refreshAllData` runs independent reads in parallel (Promise.allSettled)
- Error state remains sticky until successful recovery
- `saveChat()` persists ALL message part types (text, tool-invocation, reasoning)
- `loadChat()` filters expired messages at read time
- Cleanup cron hard-deletes expired chat data (not trades, billing, users)
- All 3 chat surfaces use AI Elements for rendering (with custom tool renderers preserved where no AI Element equivalent exists)



### Must NOT Have (Guardrails)
- Do NOT create new Prisma models — enhance existing Mood-based persistence (stabilization scope)
- Do NOT replace EquityChartMessage or askForConfirmation with AI Elements — no equivalent exists
- Do NOT change server-side cacheTag strings — change the CONSTANT to match the strings
- Do NOT introduce `turborepo` or `next-forge` or repo restructuring
- Do NOT upgrade Next.js (already on 16.1.6)
- Do NOT change package manager (keep npm for Vercel)
- Do NOT use `as any`, `@ts-ignore`, `console.log`, or hardcoded hex colors
 — all AGENTS.md anti-patterns apply
- Do NOT strip tool call parts from saveChat() without migration plan for existing Mood records
- Do NOT change `CACHE_TAGS.DASHBOARD_LAYOUT` mapping without verifying ALL callers via lsp_find_references
- Do NOT let cleanup cron delete anything other than chat-owned Mood records with expired `expiresAt`

 and conversation data
- Do NOT parallelize `refreshAllData` with `Promise.all` — use `Promise.allSettled` for prevent one failure blocking the other

- Do NOT touch any business logic in mutation files — only invalidation calls

- Do NOT break existing Mood/journal features (mood history, mood entries)

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

 Acceptance criteria requiring "user manually tests/confirms" are FORBIDDEN.

 

### Test Decision
- **Infrastructure exists**: YES (Vitest)
- **Automated tests**: YES (tests-after)
- **Framework**: Vitest
- **Test new files**: YES (each task creates test files alongside implementation)

 - **Test commands**: `npx vitest run`

 --reporter=verbose`

 

### QA Policy
Every task MUST include agent-executed QA scenarios.
 Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

 - **Frontend/UI**: Use Playwright — Navigate, interact, assert DOM, screenshot
 - **API/Backend**: Use Bash (curl) — Send requests, assert status + response fields
 - **Library/Module**: Use Bash (node/bun REPL) — Import, call functions, compare output

 - **CLI/TUI**: Use interactive_bash (tmux) — Run command, send keystrokes, validate output

 check exit code

 

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — cache + sidebar + runtime):
├── Task 1: Centralize cache tags + add EQUITY_CHART + align naming [deep]
 ← highest impact
 unblocks most
 │── Task 2: Add equity-chart invalidation to all mutation paths [deep]
 ← depends on T1
 │── Task 3: Fix inert sidebar header button [quick] ← independent
 │── Task 5: Runtime/deploy verification pass [quick] ← independent

 │
Wave 2 (After Wave 1 — data provider):
├── Task 4: Parallelize refreshAllData + sticky errors + force-refresh [deep] ← depends on T1 for unified tags
 │
Wave 3 (After Wave 2 — chat migration + persistence):
├── Task 6: Enhance chat persistence with retention metadata [deep]
│── Task 7: Add chat artifact cleanup cron job [unspecified-high]
│── Task 8: Migrate dashboard chat to AI Elements [deep] ← depends on understanding current custom renderers
 │
Wave 4 (After Wave 3 — remaining migration + tests):
├── Task 9: Migrate accounts analysis to AI Elements [unspecified-high]
│── Task 10: Add unit tests for cache tags, sidebar, data-provider [quick]
│── Task 11: Final integration verification [deep]
│
Wave FINAL (After ALL tasks):
├── F1: Plan compliance audit [oracle]
├── F2: Code quality review [unspecified-high]
├── F3: Real manual QA [unspecified-high] + playwright
├── F4: Scope fidelity check [deep]
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| T1 | — | T2, T4 | 1 |
| T2 | T1 | T6 | 1 |
| T3 | - | - | 1 |
| T4 | T1 | T8, T9 | 2 |
| T5 | - | F1-F4 | 1 |
| T6 | T2 | T7, T8 | 3 |
| T7 | T6 | F3 | 3 |
| T8 | T6 | T9 | 3 |
| T9 | T3, T4 | F1-F4 | 4 |
| T10 | T8 | F1-F4 | 3 |
| T11 | ALL | F1-F4 | 4 |

### Agent Dispatch Summary

- **Wave 1**: 4 tasks — T1 deep, T2 deep, T3 quick, T5 quick
- **Wave 2**: 1 task — T4 deep
- **Wave 3**: 3 tasks — T6 deep, T7 unspecified-high, T8 deep
- **Wave 4**: 3 tasks — T9 unspecified-high, T10 unspecified-high, T11 deep
- **FINAL**: 4 tasks — F1 oracle, F2 unspecified-high, F3 unspecified-high + playwright, F4 deep

---

## TODOs

- [ ] 1. Centralize Cache Tags — Add EQUITY_CHART, Align DASHBOARD_LAYOUT, Remove ACCOUNT_METRICS

  **What to do**:
  - In `lib/cache/cache-invalidation.ts`:
    - Change `CACHE_TAGS.DASHBOARD_LAYOUT` mapping from `dashboard-${userId}` to `dashboard-layout-${userId}` to match actual server usage at `server/layouts.ts:76`
    - Add `EQUITY_CHART: (userId) => \`equity-chart-${userId}\`` to `CACHE_TAGS` object
    - Add `invalidateEquityChart(userId)` helper function that calls `updateTag(CACHE_TAGS.EQUITY_CHART(userId))`
    - Add `invalidateEquityChart(userId)` to `invalidateAllUserCaches(userId)` so all full invalidations cover equity-chart
    - Remove dead `ACCOUNT_METRICS` constant (defined at line 23 but never used as `cacheTag`)
  - Before changing DASHBOARD_LAYOUT, use `lsp_find_references` on `CACHE_TAGS.DASHBOARD_LAYOUT` to verify ALL callers:
    - `server/groups.ts` (line 19) — calls `invalidateDashboardLayout`
    - `server/layouts.ts` — calls `invalidateDashboardLayout`
    - `server/user-data.ts` — uses dashboard-layout cacheTag directly
    - `lib/cache/cache-invalidation.ts` — the helper itself
    All should still work after renaming the constant string.

  **Must NOT do**:
  - Do NOT change the actual `cacheTag()` strings in server files — change ONLY the CONSTANT
  - Do NOT remove or rename the `dashboard-${userId}` tag pattern used in invalidation calls
  - Do NOT touch any business logic in mutation files

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 5)
  - **Blocks**: Task 2
  - **Blocked By**: None

  **References**:
  - `lib/cache/cache-invalidation.ts` — Central cache tag constants
  - `server/layouts.ts:76` — Actual cacheTag: `dashboard-layout-${userId}`
  - `server/groups.ts:17-20` — Shows two-system pattern
  - `server/user-data.ts:329` — Uses `dashboard-layout-${userId}` as cacheTag
  - `lib/cache/cache-invalidation.ts:23` — `ACCOUNT_METRICS` dead constant

  **Acceptance Criteria**:
  - [ ] `CACHE_TAGS.EQUITY_CHART(userId)` produces `equity-chart-${userId}`
  - [ ] `CACHE_TAGS.DASHBOARD_LAYOUT(userId)` produces `dashboard-layout-${userId}` (not `dashboard-${userId}`)
  - [ ] `invalidateEquityChart(userId)` helper exists and is called from `invalidateAllUserCaches(userId)`
  - [ ] Zero references to `ACCOUNT_METRICS` anywhere in codebase
  - [ ] All callers of `CACHE_TAGS.DASHBOARD_LAYOUT` still resolve correctly after change
  - [ ] `npm run typecheck` passes

  **QA Scenarios**:
  ```
  Scenario: Cache tag constants align with server usage
    Tool: Bash (grep)
    Steps:
      1. grep -r "cacheTag.*dashboard-layout" server/ — count occurrences
      2. grep -r "CACHE_TAGS.DASHBOARD_LAYOUT" server/ lib/ — verify all map to same string
      3. grep -r "EQUITY_CHART" lib/ — verify constant exists
    Expected Result: All CACHE_TAGS references produce same strings as direct cacheTag calls
    Failure Indicators: Mismatch between constant output and actual cacheTag strings
    Evidence: .sisyphus/evidence/task-1-cache-tag-alignment.txt
  ```

  **Commit**: YES (groups with T2)
  - Message: `fix(cache): centralize cache tags, add EQUITY_CHART constant, align DASHBOARD_LAYOUT naming`

- [ ] 2. Add Equity-Chart Cache Invalidation to All Mutation Paths

  **What to do**:
  - Since T1 wires `invalidateEquityChart` INTO `invalidateAllUserCaches`, most mutation paths are auto-covered.
  - Verify ALL mutation files that call `invalidateAllUserCaches` actually hit the equity-chart cache:
    - `server/trades.ts` — trade save/delete mutations (line 140, 527)
    - `server/accounts.ts` — account mutations (lines 67, 100, 150, 217, 257, 612, 665)
    - `server/groups.ts` — group CRUD (line 19-20)
    - `server/tags.ts` — tag mutations (line 10)
    - `server/journal.ts` — mood/journal mutations (line 23)
    - `server/imports/tradovate-actions.ts` — import sync completion (line ~1182)
    - `server/thor.ts` — thor sync (line 26)
  - Use `lsp_find_references` on `invalidateAllUserCaches` to find all call sites
  - For each call site, verify it covers trade-affecting mutations
  - Specifically check `server/layouts.ts` — layout save mutations should invalidate equity-chart
  - No double-invalidation: if `invalidateAllUserCaches` already covers equity-chart, do NOT add a separate call

  **Must NOT do**:
  - Do NOT duplicate invalidation calls
  - Do NOT add equity-chart invalidation to non-mutation reads
  - Do NOT change any mutation business logic

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 5)
  - **Blocks**: Task 4
  - **Blocked By**: Task 1 (needs `invalidateEquityChart` helper to exist)

  **References**:
  - `server/groups.ts:17-20` — Pattern: invalidateAllUserCaches + specific tags
  - `server/trades.ts:137-140` — Shows direct updateTag calls that BYPASS invalidateAllUserCaches
  - `server/layouts.ts` — Layout mutations need equity-chart invalidation too

  **Acceptance Criteria**:
  - [ ] Every mutation path that changes trade/account/group/tag/import data invalidates equity-chart
  - [ ] Zero files with duplicate equity-chart invalidation
  - [ ] `npm run typecheck` passes

  **QA Scenarios**:
  ```
  Scenario: Equity-chart invalidated on trade mutation
    Tool: Bash (grep)
    Steps:
      1. grep -r "updateTag" server/trades.ts — list all invalidation calls
      2. Verify each mutation path calls invalidateAllUserCaches OR directly includes equity-chart
    Expected Result: Every trade mutation invalidates equity-chart tag
    Failure Indicators: Any mutation file missing equity-chart coverage
    Evidence: .sisyphus/evidence/task-2-equity-chart-coverage.txt
  ```

  **Commit**: YES (groups with T1)
  - Message: `fix(cache): centralize cache tags, add EQUITY_CHART constant, align DASHBOARD_LAYOUT naming`

- [ ] 3. Fix Inert Sidebar Header Button

  **What to do**:
  - In `components/ui/unified-sidebar.tsx` (lines 267-284):
    - The `SidebarMenuButton` in `SidebarHeader` has hover effects but no `onClick` or `href`
    - Wire it to navigate to `/dashboard` (or `/${locale}/dashboard` with i18n) using the `Link` + `asChild` pattern already used elsewhere in this file (e.g., lines 309-345)
    - Verify the button works in all 3 authenticated shells (dashboard, teams, admin)

  **Must NOT do**:
  - Do NOT modify cookie/state flow (confirmed working)
  - Do NOT change `role="menu"` on SidebarMenu (confirmed correct ARIA at line 293)
  - Do NOT modify `useActiveLink()` hook (confirmed working with pathname + search)
  - Do NOT change Logo component itself

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 5)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `components/ui/unified-sidebar.tsx:309-345` — `SidebarMenuButton asChild` + `Link` pattern for nav items
  - `components/ui/unified-sidebar.tsx:270-281` — The inert header button that needs wiring

  **Acceptance Criteria**:
  - [ ] Header button navigates to `/dashboard` (or locale-prefixed path) on click
  - [ ] Button no longer has hover-only interactivity without action
  - [ ] `npm run typecheck` passes

  **QA Scenarios**:
  ```
  Scenario: Header button navigates to dashboard
    Tool: Playwright
    Steps:
      1. Navigate to /en/dashboard/analytics (any sub-route)
      2. Click the logo/header button in sidebar
      3. Wait for navigation
      4. Assert URL is /en/dashboard
    Expected Result: Navigation to dashboard home
    Failure Indicators: URL unchanged or JS error
    Evidence: .sisyphus/evidence/task-3-header-navigation.png
  ```

  **Commit**: YES
  - Message: `fix(sidebar): wire inert header button to dashboard navigation`

- [ ] 4. Parallelize refreshAllData + Sticky Error Recovery + Force-Refresh Contract

  **What to do**:
  - In `context/data-provider.tsx`:
    - **Parallel refresh**: Change `refreshAllData` (lines 1025-1046) from sequential `await` to `Promise.allSettled`:
      ```
      Before: await refreshTradesOnly({ force }); await refreshUserDataOnly({ force });
      After:  const results = await Promise.allSettled([
                refreshTradesOnly({ force, withLoading: false }),
                refreshUserDataOnly({ force, includeSubscription: true, withLoading: false }),
              ]);
      ```
    - **Sticky error recovery**: Error state should only clear when BOTH succeed, not in finally block. Currently `loadData` clears in finally (line 818) but `refreshAllData` does not.
    - **Force-refresh contract**: When `force=true`, after parallel refresh completes, also trigger equity chart and layout force-refresh:
      - In `server/equity-chart.ts`: if `forceRefresh=true`, call `updateTag(equityChartCacheTag)` before fetching
      - In `server/layouts.ts`: add force-refresh path that calls `updateTag(dashboardLayoutCacheTag)` before reading
      - In `context/data-provider.tsx`: wire `refreshAllData({ force: true })` to call these force-refresh actions
    - Keep the external API shape `({ force?: boolean })` unchanged

  **Must NOT do**:
  - Do NOT change IndexedDB warm-start behavior for non-force loads
  - Do NOT remove the dev-mode IndexedDB optimization in `refreshTradesOnly`
  - Do NOT use `Promise.all` — must use `Promise.allSettled`

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`next-cache-components`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: Tasks 8, 9
  - **Blocked By**: Task 1

  **References**:
  - `context/data-provider.tsx:1025-1046` — Current sequential `refreshAllData`
  - `context/data-provider.tsx:906-954` — `refreshTradesOnly` with dev-mode cache + force behavior
  - `context/data-provider.tsx:789-818` — `loadData` finally block shows correct error-clearing pattern
  - `server/equity-chart.ts` — Needs `updateTag` call when force-refreshing
  - `server/layouts.ts` — Needs force-refresh path

  **Acceptance Criteria**:
  - [ ] `refreshAllData` runs trades + user data in parallel via `Promise.allSettled`
  - [ ] Error state only clears on full success, not unconditionally in finally
  - [ ] `refreshAllData({ force: true })` triggers equity chart + layout force-refresh
  - [ ] `npm run typecheck` passes
  - [ ] `npx vitest run` passes

  **QA Scenarios**:
  ```
  Scenario: Parallel refresh fires simultaneous requests
    Tool: Playwright (network tab)
    Steps:
      1. Open dashboard, trigger refreshAllData({ force: true })
      2. Observe network tab — trades and user data requests fire simultaneously
    Expected Result: Two server requests fired at same time, not sequentially
    Failure Indicators: Second request only starts after first completes
    Evidence: .sisyphus/evidence/task-4-parallel-timing.txt
  ```

  **Commit**: YES
  - Message: `fix(dashboard): parallelize refreshAllData, add sticky error recovery, force-refresh for equity chart and layout`

- [ ] 5. Runtime/Deploy Verification Pass

  **What to do**:
  - **Node runtime**: Verify `package.json` engines.node = "20.x" matches Vercel project settings
  - **Prisma pool**: Check Vercel runtime logs for `[DB Pool] High connection usage` warnings. If warnings exist, document whether pool floor needs adjustment (no code change unless concrete issue found).
  - **proxy.ts**: Verify `PRIVATE_DOCUMENT_PATH_PREFIXES` still covers all paths: /dashboard, /teams/dashboard, /teams/manage, /teams/join, /admin, /authentication
  - **Build commands**: Verify `vercel.json` installCommand and buildCommand remain npm-only
  - **Turbopack**: Verify `next.config.ts` turbopack config is compatible with new code from T1-T4
  - **.env.example**: If T1-T4 added new env vars, update `.env.example` per AGENTS.md rule

  **Must NOT do**:
  - Do NOT restructure the repo
  - Do NOT change package manager (keep npm for Vercel)
  - Do NOT upgrade Next.js (already on 16.1.6)
  - Do NOT change any code unless verification reveals a concrete defect

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3)
  - **Blocks**: Final verification
  - **Blocked By**: None

  **References**:
  - `package.json:9` — `"node": "20.x"`
  - `vercel.json:2-3` — npm-only install/build commands
  - `lib/prisma.ts:13-16` — Pool constants
  - `proxy.ts:173-180` — PRIVATE_DOCUMENT_PATH_PREFIXES
  - `next.config.ts:116-118` — Turbopack configuration

  **Acceptance Criteria**:
  - [ ] Node 20.x, npm-only build, no discrepancies found
  - [ ] All 6 protected routes correctly covered in proxy.ts
  - [ ] No production Prisma pool warnings (or documented if exist)
  - [ ] `.env.example` updated if new env vars added
  - [ ] `npm run typecheck` passes

  **QA Scenarios**:
  ```
  Scenario: Vercel config is npm-only and Node 20.x
    Tool: Bash (grep)
    Steps:
      1. grep '"node"' package.json — verify "20.x"
      2. grep -i "yarn\|pnpm" vercel.json — should return nothing
    Expected Result: Node 20.x, npm-only
    Evidence: .sisyphus/evidence/task-5-runtime-config.txt
  ```

  **Commit**: YES (only if changes needed)
  - Message: `chore: verify runtime/deploy alignment`

- [ ] 6. Enhance Chat Persistence with 24-Hour Retention Metadata

  **What to do**:
  - In `app/[locale]/dashboard/components/chat/actions/chat.ts`:
    - Modify `saveChat()` (line 67) to persist ALL message part types (text, tool-invocation, reasoning), not just text parts. AI SDK v6 `Message.parts` array contains the full data.
    - Add `expiresAt` field: set to `new Date(Date.now() + 24 * 60 * 60 * 1000)` (24 hours from now) on the Mood record when saving chat.
    - The `Mood` model already has `expiresAt DateTime?` field — just populate it.
  - Modify `loadChat()` (line 119) to filter out expired conversations at read time:
    - Add `where: { expiresAt: { gt: new Date() } }` or handle in application code
    - Expired chat data should be unavailable immediately (read-time guard), not just after cron runs
  - Ensure backward compatibility: plain mood entries (no conversation) should be unaffected

  **Must NOT do**:
  - Do NOT create new Prisma models — Mood model already exists with conversation + expiresAt fields
  - Do NOT break existing Mood/journal features (mood history, mood entries)
  - Do NOT persist data that belongs to other features

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`supabase-postgres-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T7)
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 7
  - **Blocked By**: Task 2

  **References**:
  - `app/[locale]/dashboard/components/chat/actions/chat.ts:67` — `saveChat()` strips non-text parts (the fix target)
  - `app/[locale]/dashboard/components/chat/actions/chat.ts:119` — `loadChat()` time window filter
  - `app/[locale]/dashboard/components/chat/chat.tsx:287` — `onFinish` calls `saveChat(messages)`
  - `prisma/schema.prisma` — `Mood` model: conversation Json?, expiresAt DateTime?, userId String

  **Acceptance Criteria**:
  - [ ] `saveChat()` persists ALL message parts (text, tool-invocation, reasoning)
  - [ ] `saveChat()` sets `expiresAt` to 24 hours from now on Mood record
  - [ ] `loadChat()` filters expired conversations at read time
  - [ ] Existing Mood/journal features continue working (no regression)
  - [ ] `npm run typecheck` passes

  **QA Scenarios**:
  ```
  Scenario: Tool call messages survive page refresh
    Tool: Playwright
    Steps:
      1. Open dashboard chat, send message triggering tool call
      2. Verify saveChat receives full parts array (not just text)
      3. Refresh page
      4. Assert tool call messages are restored from loadChat
    Expected Result: Tool call messages survive page refresh
    Failure Indicators: Only text parts restored
    Evidence: .sisyphus/evidence/task-6-tool-call-persistence.txt
  ```

  **Commit**: YES
  - Message: `feat(chat): enhance persistence with full part types and 24h retention metadata`

- [ ] 7. Add Chat Artifact Cleanup Cron Job

  **What to do**:
  - Create `app/api/cron/cleanup-chat-artifacts/route.ts`:
    - Use `requireCronAuth` from `server/authz.ts` for authorization (same pattern as existing crons)
    - Query Mood records: `where: { conversation: { not: null }, expiresAt: { lt: new Date() } }`
    - Hard-delete ONLY records matching both conditions (chat with expired expiresAt)
    - Return count of deleted records
    - Must be idempotent — running twice produces same result
  - Add cron entry to `vercel.json`:
    ```json
    { "path": "/api/cron/cleanup-chat-artifacts", "schedule": "0 * * * *" }
    ```
  - Add `CRON_SECRET` and `VERCEL_CRON_SECRET` to `.env.example` if not already present

  **Must NOT do**:
  - Do NOT delete Mood records with no conversation (those are plain mood/journal entries)
  - Do NOT touch trades, accounts, billing, support records, or user/account state
  - Do NOT create new Prisma models

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T6)
  - **Parallel Group**: Wave 3
  - **Blocks**: Final verification
  - **Blocked By**: Task 6

  **References**:
  - `app/api/cron/renewal-notice/route.ts` — Example cron with `requireCronAuth` pattern
  - `server/authz.ts` — `requireCronAuth()` function
  - `prisma/schema.prisma` — Mood model: conversation Json?, expiresAt DateTime?
  - `vercel.json` — Current cron schedule definitions

  **Acceptance Criteria**:
  - [ ] `app/api/cron/cleanup-chat-artifacts/route.ts` exists and uses `requireCronAuth`
  - [ ] Only deletes Mood records where conversation IS NOT NULL AND expiresAt < now()
  - [ ] Cron entry added to `vercel.json` with hourly schedule
  - [ ] `.env.example` includes CRON_SECRET and VERCEL_CRON_SECRET
  - [ ] Idempotent — running twice produces same result

  **QA Scenarios**:
  ```
  Scenario: Cleanup deletes only expired chat data
    Tool: Bash (curl)
    Steps:
      1. Create test Mood: conversation={...}, expiresAt=past (expired chat)
      2. Create test Mood: conversation=null, expiresAt=past (plain mood)
      3. Create test Mood: conversation={...}, expiresAt=future (not expired)
      4. curl /api/cron/cleanup-chat-artifacts -H "Authorization: Bearer $CRON_SECRET"
      5. Verify: only record #1 deleted; #2 and #3 preserved
    Expected Result: Only expired chat record deleted
    Failure Indicators: Plain mood deleted, or non-expired deleted
    Evidence: .sisyphus/evidence/task-7-cleanup-selectivity.txt
  ```

  **Commit**: YES
  - Message: `feat(chat): add 24-hour artifact retention with cleanup cron`

- [ ] 8. Migrate Dashboard Chat to AI Elements

  **What to do**:
  - In `app/[locale]/dashboard/components/chat/chat.tsx` (721 lines):
    - Replace custom `BotMessage` with AI Elements `Message` + `Response` components
    - Replace `UserMessage` with AI Elements `Message` component
    - Replace `ThinkingMessage` with AI Elements `Reasoning` + `ReasoningTrigger` + `ReasoningContent`
    - Replace `FirstMessageLoading` with AI Elements `Loader`
    - Wrap message list in AI Elements `Conversation` + `ConversationContent` + `ConversationScrollButton`
    - Use AI Elements `Actions` + `Action` for copy/retry buttons
    - Follow the support page pattern (`app/[locale]/(landing)/support/page-client.tsx`) as the gold standard
    - Remove deprecated direct `message.content` access — always use `message.parts` iteration
  - **PRESERVE AS CUSTOM COMPONENTS** (no AI Element equivalent exists):
    - `EquityChartMessage` (470 lines) — full Recharts chart with tooltips, payout/reset markers, account legends
    - `askForConfirmation` tool handler (lines 501-562) — interactive Yes/No dialog
    - `ToolCallMessage` as fallback for unknown tool types
  - These custom components integrate INTO the AI Elements wrapper, not replaced by it.

  **Must NOT do**:
  - Do NOT replace EquityChartMessage or askForConfirmation with AI Elements
  - Do NOT change the chat API route or AI tools
  - Do NOT change `saveChat`/`loadChat` persistence flow

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-design`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 9
  - **Blocked By**: Task 6

  **References**:
  - `app/[locale]/(landing)/support/page-client.tsx` — GOLD STANDARD: uses Conversation, Message, Response, Reasoning, Sources, Actions, PromptInput
  - `components/ai-elements/response.tsx` — Uses Streamdown for markdown (same as current BotMessage)
  - `app/[locale]/dashboard/components/chat/chat.tsx` — Current implementation with custom message components
  - `app/[locale]/dashboard/components/chat/equity-chart-message.tsx` — 470 lines, MUST PRESERVE

  **Acceptance Criteria**:
  - [ ] Chat uses AI Elements: Conversation, Message, Response, Reasoning, Loader, Actions
  - [ ] EquityChartMessage and askForConfirmation preserved as custom components
  - [ ] No direct `message.content` access — all rendering via `message.parts`
  - [ ] Visual parity: chat renders identically to before (screenshots)
  - [ ] `npm run typecheck && npm run lint` pass

  **QA Scenarios**:
  ```
  Scenario: Chat renders markdown with AI Elements
    Tool: Playwright
    Steps:
      1. Navigate to /en/dashboard, open chat widget
      2. Send message "Summarize my recent trades"
      3. Wait for AI response
      4. Assert response uses AI Elements Response component (Streamdown markdown)
      5. Screenshot the response
    Expected Result: Markdown renders with proper formatting, no raw HTML
    Failure Indicators: Raw markdown text, missing formatting
    Evidence: .sisyphus/evidence/task-8-chat-markdown.png
  ```

  **Commit**: YES
  - Message: `feat(chat): migrate dashboard chat to AI Elements with preserved custom tool renderers`

- [ ] 9. Migrate Accounts Analysis to AI Elements

  **What to do**:
  - In `app/[locale]/dashboard/components/analysis/accounts-analysis.tsx`:
    - Replace custom inline rendering with AI Elements components
    - Use `Conversation` + `Message` + `Response` for message rendering
    - Use `Loader` for loading states
    - Use `Actions` for copy/retry
    - Replace any direct `message.content` access with `message.parts` iteration
    - Follow support page pattern for consistency
  - This is simpler than T8 — no custom tool renderers to preserve

  **Must NOT do**:
  - Do NOT change the analysis API route or tools
  - Do NOT break existing analysis functionality

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`frontend-design`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T8)
  - **Parallel Group**: Wave 4
  - **Blocks**: Final verification
  - **Blocked By**: Task 4

  **References**:
  - `app/[locale]/(landing)/support/page-client.tsx` — Gold standard AI Elements pattern
  - `app/[locale]/dashboard/components/analysis/accounts-analysis.tsx` — Current inline rendering

  **Acceptance Criteria**:
  - [ ] Accounts analysis uses AI Elements components
  - [ ] No direct `message.content` access
  - [ ] Visual parity with existing behavior
  - [ ] `npm run typecheck && npm run lint` pass

  **QA Scenarios**:
  ```
  Scenario: Accounts analysis renders AI response correctly
    Tool: Playwright
    Steps:
      1. Navigate to accounts analysis
      2. Trigger analysis
      3. Wait for AI response
      4. Assert AI Elements Response component renders
    Expected Result: Proper AI Elements rendering
    Evidence: .sisyphus/evidence/task-9-analysis-rendering.png
  ```

  **Commit**: YES
  - Message: `feat(chat): migrate accounts analysis to AI Elements`

- [ ] 10. Add Unit Tests for Cache Tags, Sidebar, Data-Provider, and Chat Retention

  **What to do**:
  - Create `server/__tests__/cache-invalidation.test.ts`:
    - Test `CACHE_TAGS.EQUITY_CHART(userId)` produces correct string
    - Test `CACHE_TAGS.DASHBOARD_LAYOUT(userId)` produces `dashboard-layout-${userId}`
    - Test `invalidateAllUserCaches(userId)` includes equity-chart tag
    - Test zero `ACCOUNT_METRICS` references
  - Create `components/ui/__tests__/sidebar-state.test.tsx`:
    - Test header button navigates on click
  - Create `context/__tests__/data-provider.test.ts`:
    - Test `refreshAllData` calls refreshTradesOnly and refreshUserDataOnly in parallel (Promise.allSettled)
    - Test error state remains sticky until successful recovery
    - Test error clears only after both succeed
  - Run `npx vitest run --reporter=verbose` to verify all pass

  **Must NOT do**:
  - Do NOT create integration tests requiring DB connection
  - Do NOT test implementation details — test observable behavior

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: Final verification
  - **Blocked By**: Tasks 1, 3, 4

  **References**:
  - Check existing test patterns in `app/api/ai/chat/__tests__/` or `server/__tests__/`

  **Acceptance Criteria**:
  - [ ] Test files created with passing tests
  - [ ] `npx vitest run` — all tests pass

  **QA Scenarios**:
  ```
  Scenario: All new tests pass
    Tool: Bash
    Steps:
      1. npx vitest run --reporter=verbose
    Expected Result: All test suites pass, 0 failures
    Evidence: .sisyphus/evidence/task-10-test-results.txt
  ```

  **Commit**: YES
  - Message: `test: add unit tests for cache tags, sidebar state, and data-provider refresh`

- [ ] 11. Final Integration Verification

  **What to do**:
  - Run full verification suite:
    - `npm run typecheck` — 0 errors
    - `npm run lint` — within warning budget
    - `npx vitest run` — all tests pass
    - `npm run build` — if DB accessible
  - Verify cross-task integration:
    - Trade mutation -> equity chart updates (cache invalidation works end-to-end)
    - Force refresh -> all dashboard data refreshes (trades + user + chart + layout)
    - Chat message -> persists with all parts -> survives page refresh -> expires after 24h
    - Cleanup cron -> only deletes expired chat data
    - Sidebar toggle -> state persists across navigation
  - Check for cross-task contamination (Task N not touching Task M's files unexpectedly)
  - Verify no new `as any`, `@ts-ignore`, `console.log`, or hardcoded colors

  **Must NOT do**:
  - Do NOT fix issues found — report them for a follow-up task
  - Do NOT modify any code

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4
  - **Blocks**: Final verification wave
  - **Blocked By**: All tasks

  **Acceptance Criteria**:
  - [ ] `npm run typecheck` — 0 errors
  - [ ] `npm run lint` — within budget
  - [ ] `npx vitest run` — all pass
  - [ ] Cross-task integration verified
  - [ ] No cross-task contamination

  **QA Scenarios**:
  ```
  Scenario: Full verification suite passes
    Tool: Bash
    Steps:
      1. npm run typecheck && npm run lint && npx vitest run
    Expected Result: All commands exit 0
    Evidence: .sisyphus/evidence/task-11-full-verification.txt
  ```

  **Commit**: NO (verification only)

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.
> Never mark F1-F4 as checked before getting user's okay. Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + linter + `bun test`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill if UI)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration. Test edge cases: empty state, invalid input, rapid actions. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1 — everything in spec was built, nothing beyond spec. Check "Must NOT do" compliance. Detect cross-task contamination: Task N touching Task M's files. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.
> Never mark F1-F4 as checked before getting user's okay. Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.

 .

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

 .

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + linter + `bun test`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

 .

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill if UI)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration. Test edge cases: empty state, invalid input, rapid actions. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

 .

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1 — everything in spec was built, nothing beyond spec. Check "Must NOT do" compliance. Detect cross-task contamination: Task N touching Task M's files. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **T1+T2**: `fix(cache): centralize cache tags, add EQUITY_CHART constant, align DASHBOARD_LAYOUT naming` — lib/cache/cache-invalidation.ts, server/trades.ts, server/accounts.ts, server/groups.ts, server/tags.ts, server/journal.ts
- **T3**: `fix(sidebar): wire inert header button to dashboard navigation` — components/ui/unified-sidebar.tsx
- **T4+T6+T7+T8**: `feat(chat): parallelize refresh, migrate to AI Elements, enhance persistence, add 24h retention cron` — context/data-provider.tsx, app/[locale]/dashboard/components/chat/*, app/[locale]/dashboard/components/analysis/accounts-analysis.tsx, app/api/cron/cleanup-chat-artifacts/route.ts, vercel.json
- **T5**: `chore: verify runtime/deploy alignment` — only if changes needed
- **T9+T10**: `test: add unit tests for cache tags, sidebar, data-provider` — server/__tests__/*, components/ui/__tests__/*, context/__tests__/*

---

## Success Criteria

### Verification Commands
```bash
npm run typecheck          # Expected: 0 errors
npm run lint               # Expected: within warning budget (1546 max)
npm run build              # Expected: success (when DB available)
npx vitest run             # Expected: all tests pass
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All tests pass
- [ ] Equity-chart cache invalidated on all mutation paths
- [ ] Dashboard chat renders via AI Elements (with custom tool renderers preserved)
- [ ] 24h chat retention cron runs and only deletes expired chat data
- [ ] `refreshAllData({ force: true })` provides full-consistency refresh
- [ ] Sidebar header button no longer appears interactive without action
