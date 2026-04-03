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

[PLACEHOLDER — tasks appended via edit]

---

## Final Verification Wave

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
