# Master Execution Plan — v2.1 Milestone Gap Closure

**Created:** 2026-04-18
**Status:** 10/39 requirements satisfied, 29 gaps to close
**Source:** v2.1-MILESTONE-AUDIT.md + t/memory + t/lessons + t/todo + codebase inspection

---

## What Already Exists (Don't Rebuild)

These files already exist from prior work — the plan accounts for them:

| File | Lines | Status |
|------|-------|--------|
| `lib/cache/cache-service.ts` | 458 | EXISTS — CacheService with LRU, Redis, singleflight, circuit breaker |
| `lib/api/with-api-route.ts` | EXISTS | EXISTS — API route wrapper |
| `lib/idempotency.ts` | EXISTS | EXISTS — Idempotency service |
| `server/dashboard-bootstrap.ts` | 136 | EXISTS — Bootstrap loader (needs integration into layout) |
| `lib/types/bootstrap.ts` | EXISTS | EXISTS — DashboardBootstrapPayload type |
| `context/providers/bootstrap-provider.tsx` | EXISTS | EXISTS — Bootstrap React context |
| `lib/feature-flags.ts` | EXISTS | EXISTS — Feature flags |
| `instrumentation.ts` | EXISTS | EXISTS — Next.js instrumentation hook |
| `.github/workflows/ci.yml` | EXISTS | EXISTS — CI pipeline |
| `app/api/ready/route.ts` | EXISTS | EXISTS — Readiness probe |
| `docs/CACHING_DECISIONS.md` | EXISTS | EXISTS — Caching architecture doc |
| 19 files use `withRateLimited` | — | EXISTS — Rate limiting on 19 routes |

**Key insight:** A lot of foundational code exists but isn't wired up. The plan focuses on INTEGRATION, not creation from scratch.

---

## Execution Waves

### WAVE 1: High-Impact User-Facing (Phases 02 + 04)
**Goal:** Dashboard loads instantly. Import flow doesn't jump.
**Unlocks:** Phases 03, 07 (blocked on Phase 02)

---

#### Phase 02: Server Dashboard Bootstrap — WIRE IT UP
**Closes:** REQ-SRV-001, REQ-SRV-002, REQ-SRV-003, REQ-SRV-004

**What exists:** Bootstrap loader, types, provider, feature flags — all written but NOT connected to layout.

| # | Task | Files | What to do |
|---|------|-------|-----------|
| 1 | Wire bootstrap into dashboard layout | `app/[locale]/dashboard/layout.tsx` | Call `getDashboardBootstrap()` in server layout, pass to `DashboardBootstrapProvider` |
| 2 | Wire provider into DataProvider | `context/data-provider.tsx` | Accept `initialBootstrap` prop, use it when available, fall back to `loadData()` |
| 3 | Create slice providers | `context/providers/trades-slice-provider.tsx`, `accounts-slice-provider.tsx`, `filters-slice-provider.tsx`, `derived-slice-provider.tsx` | Extract state from monolithic DataProvider into independent slices |
| 4 | Feature flag gate | `lib/feature-flags.ts` | Ensure `shouldUseServerBootstrap()` defaults false, verify rollout logic |
| 5 | Verify + test | — | Typecheck, lint, test dashboard loads with flag on and off |

**Lessons to apply:**
- L54: `'use client'` on any hook components
- L50: Use shared shell, don't rebuild locally
- L46: Cache invalidation after commit, never blocking

---

#### Phase 04: Import Flow Polish
**Closes:** REQ-IMPORT-001, REQ-IMPORT-002, REQ-IMPORT-003 + REQ-VISUAL-003 (partial)

| # | Task | Files | What to do |
|---|------|-------|-----------|
| 1 | Fix card height consistency | `app/[locale]/dashboard/components/import/components/platform-item.tsx`, `import-type-selection.tsx` | `min-h-[200px]` with flex stretch, `overflow-hidden` on description |
| 2 | Fix grid layout shift | `import-type-selection.tsx` | Always reserve `lg:grid-cols-[minmax(0,1fr)_320px]`, no toggle |
| 3 | Add search debounce | New `hooks/use-debounced-value.ts`, `import-type-selection.tsx` | Debounce 150ms + React.memo grid |
| 4 | Move exceljs to server action | New `server/imports/atas-actions.ts`, modify `atas/atas-file-upload.tsx` | Dynamic import exceljs server-side, remove from client bundle |
| 5 | Create ImportPlatformCardViewModel | New `app/[locale]/dashboard/components/import/types/import-platform-card-vm.ts` | Lightweight display type, factory function, decouple from PlatformConfig |
| 6 | Lazy-load platform processors | `config/platforms.tsx` | Replace 16 eager imports with `dynamic()` without `ssr: false` |
| 7 | Disable compare on mobile | `import-type-selection.tsx` | `< 768px` show toast, hide compare toggle |
| 8 | Verify + test | — | Typecheck, lint, verify import flow works end-to-end |

**Lessons to apply:**
- L44: Don't use sed for multiline changes — use proper file writes
- L54: `'use client'` on any new hook files

---

### WAVE 2: Performance & Architecture (Phases 03 + 08)
**Goal:** Widgets render instantly. Bundle shrinks. Fonts scoped.
**Depends on:** Wave 1 (Phase 02)

---

#### Phase 03: Widget Server Shells
**Closes:** REQ-WIDGET-001, REQ-WIDGET-002, REQ-WIDGET-003

| # | Task | Files | What to do |
|---|------|-------|-----------|
| 1 | Create WidgetShellServer | New `app/[locale]/dashboard/components/widgets/server/widget-shell-server.tsx` | Server component wrapper with title, icon, description |
| 2 | Create widget skeletons | New `app/[locale]/dashboard/components/widgets/skeletons/widget-skeleton.tsx` | Server-renderable skeleton per widget category |
| 3 | Create new registry | New `app/[locale]/dashboard/components/widgets/widget-registry-v2.tsx` | `getShell()` + `getIsland()` split |
| 4 | Migrate Statistics widgets (10) | `config/widget-registry.tsx` | Remove `ssr: false`, wrap in server shell + Suspense |
| 5 | Migrate Chart widgets (18) | `config/widget-registry.tsx` | Remove `ssr: false`, wrap in server shell + Suspense |
| 6 | Migrate Table widgets (2) | `config/widget-registry.tsx` | Remove `ssr: false`, wrap in server shell + Suspense |
| 7 | Migrate Other widgets (5+) | `config/widget-registry.tsx` | Remove `ssr: false`, wrap in server shell + Suspense |
| 8 | Update widget-canvas | `app/[locale]/dashboard/components/widget-canvas.tsx` | Integrate server shell props |
| 9 | Add feature flag | `lib/feature-flags.ts` | `SERVER_WIDGET_SHELLS` with staged rollout |
| 10 | Deprecate lazy-widget.tsx | `components/lazy-widget.tsx` | Mark deprecated, replaced by Suspense islands |
| 11 | Verify + test | — | Typecheck, lint, verify all 35+ widgets render |

---

#### Phase 08: Font & Bundle Optimization
**Closes:** REQ-PERF-001, REQ-PERF-002, REQ-PERF-003

| # | Task | Files | What to do |
|---|------|-------|-----------|
| 1 | Scope decorative fonts to landing | `app/[locale]/(landing)/layout.tsx`, `app/layout.tsx` | Move decorative font imports from root to landing layout only |
| 2 | Keep only sans + mono global | `app/layout.tsx` | Remove non-essential global font preloads |
| 3 | Verify exceljs removed from client | — | Run bundle analysis, confirm exceljs not in client chunk |
| 4 | Lazy-load other heavy packages | `config/platforms.tsx`, widget imports | Dynamic import heavy libs per feature |
| 5 | Convert marketing routes to server-first | Landing page.tsx files | Move static content to server components, only interactions hydrate |
| 6 | Bundle analysis | — | Run `npm run analyze:bundle`, verify reduced `app-route` sizes |

---

### WAVE 3: Visual Polish (Phase 07)
**Goal:** Dashboard looks cohesive and premium.
**Depends on:** Wave 1 (Phase 02)

---

#### Phase 07: Dashboard Polish Pass
**Closes:** REQ-POLISH-001, REQ-POLISH-002, REQ-POLISH-003

| # | Task | Files | What to do |
|---|------|-------|-----------|
| 1 | Unify header actions | `app/[locale]/dashboard/components/dashboard-header-widget-controls.tsx`, `navbar.tsx` | Single subdued pill system, low-opacity borders |
| 2 | Tighten spacing rhythm | Dashboard section components | Consistent gaps, remove ad-hoc spacing |
| 3 | Remove stacked frames | `widget-canvas.tsx`, widget shells | Widget borders belong to surface component, not canvas wrapper |
| 4 | Clean empty/loading/error states | All widget shells | Consistent skeleton and error patterns |
| 5 | Verify V2 tokens | All dashboard components | No raw `bg-card`/`bg-muted`/`bg-white/[X]`, use oklch cobalt tint |
| 6 | Verify + test | — | Typecheck, lint, visual review |

**Lessons to apply:**
- L52: Centralize surface recipes, don't invent one-off patterns
- L57: Use shared page recipes, not route-local redesigns
- L58: Start with shared chrome, not page-by-page

---

### WAVE 4: Security & Auth (Phases 09 + 11)
**Goal:** Auth is clean. Security holes closed.
**Depends on:** Wave 1 (Phase 02)

---

#### Phase 09: Auth Flow Simplification
**Closes:** REQ-AUTH-001, REQ-AUTH-002, REQ-AUTH-003

| # | Task | Files | What to do |
|---|------|-------|-----------|
| 1 | Create shared auth helper | New `server/auth-shared.ts` | Single function that resolves identity for server components AND route handlers |
| 2 | Consolidate getUser calls | `proxy.ts`, `server/auth.ts`, `server/authz.ts` | Replace 3+ duplicated `supabase.auth.getUser()` with shared helper |
| 3 | Add feature flag | `lib/feature-flags.ts` | `SIMPLIFIED_AUTH_RESOLUTION` defaults off |
| 4 | Verify redirect behavior | — | Test all auth redirects preserved (dashboard, admin, teams, shared, embed) |
| 5 | Verify + test | — | Typecheck, lint, auth flow tests |

**Lessons to apply:**
- L43: Next.js route handler signatures must match exactly — use generic TCtx

---

#### Phase 11: Security Hardening
**Closes:** REQ-SEC-001, REQ-SEC-002, REQ-SEC-003
**Depends on:** Phase 09

| # | Task | Files | What to do |
|---|------|-------|-----------|
| 1 | Rate limit auth routes | Auth API routes | 20/min sign-in/sign-up/forgot/reset |
| 2 | Rate limit AI routes | AI API routes | 30/min chat + tools |
| 3 | Rate limit upload routes | Import API routes | 10/min file uploads |
| 4 | Rate limit webhook-adjacent | Whop routes | Already partially done (19 routes), fill remaining gaps |
| 5 | Verify CSP headers | `proxy.ts` | Confirm security headers on all routes |
| 6 | Verify route auth coverage | All admin/service routes | No unprotected paths |
| 7 | Centralize admin checks | `server/authz.ts` | Single `assertAdminAccess()` used everywhere |
| 8 | Verify + test | — | Typecheck, lint, security review |

**Lessons to apply:**
- L54: `withRateLimited` requires NextRequest + ctx signature
- L55: Mock `createLogger` in tests that import logger-dependent modules

---

### WAVE 5: Observability & Reliability (Phase 10)
**Goal:** Production is observable. Failures are graceful.
**Independent — can run in parallel with Waves 3-4**

---

#### Phase 10: Observability & Reliability Hardening
**Closes:** REQ-OBS-001, REQ-OBS-002, REQ-OBS-003, REQ-OBS-004

**What exists:** `instrumentation.ts`, `app/api/ready/route.ts`, `lib/cache/cache-service.ts`, `lib/idempotency.ts`, `lib/api/with-api-route.ts`

| # | Task | Files | What to do |
|---|------|-------|-----------|
| 1 | Wire structured logs | `instrumentation.ts`, `lib/logger.ts` | Ensure every request carries requestId, userId, route, cache key, timings |
| 2 | Emit request duration metric | `lib/api/with-api-route.ts` | `http_request_duration_ms` per route |
| 3 | Emit query duration metric | `lib/prisma.ts` | Use Prisma `$on('query')` for timing (NOT $extends — see L42) |
| 4 | Emit cache metrics | `lib/cache/cache-service.ts` | hit/miss/refresh/stale/fallback counters |
| 5 | Emit rate limit metric | `lib/api/with-api-route.ts` | `rate_limit_rejected_total` |
| 6 | Add timeout policies | External call sites | Supabase, Whop, broker syncs, AI — strict timeouts |
| 7 | Add retry policies | External call sites | Exponential backoff on transient failures |
| 8 | Wire idempotency | `/api/whop/checkout`, `/api/whop/checkout-team`, `/api/team/invite` | Use existing `lib/idempotency.ts` |
| 9 | Add degraded-state UX | UI components | Redis down → degraded banner, AI down → disabled chat |
| 10 | Enhance `/api/ready` | `app/api/ready/route.ts` | Check Redis, Supabase Auth, Whop reachability |
| 11 | Verify + test | — | Typecheck, lint, verify metrics in logs |

**Lessons to apply:**
- L42: Don't use `$extends` for Prisma timing — use `$on('query')` instead
- L45: Circuit breaker prevents cascading Redis failures
- L46: Cache invalidation is best-effort, never blocking
- L47: Stale-while-recompute prevents thundering herd

---

### WAVE 6: Backend Cache & Query Hardening
**Goal:** 12 cache bugs fixed. Queries bounded. N+1 eliminated.
**Independent — runs in parallel with Waves 3-5**

This maps the backend program from t/todo into actionable tasks:

| # | Task | Category | What to do |
|---|------|----------|-----------|
| 1 | Fix AI cache namespace=key bug | Cache bug | `lib/ai/cache.ts` — separate namespace from key |
| 2 | Fix duplicate queryCache Map | Cache bug | `redis-client.ts` + `query-optimizer.ts` — consolidate |
| 3 | Add missing cacheLife to tags | Cache bug | `server/tags.ts` `_getTagsCached` |
| 4 | Fix inconsistent dashboard TTLs | Cache bug | Standardize to 60/60/300 in both `user-data.ts` and `layouts.ts` |
| 5 | Fix ACCOUNT_METRICS tag unused | Cache bug | Add `cacheTag` to account metrics read |
| 6 | Fix prop-firms-catalogue tag | Cache bug | Invalidate on admin firm CRUD |
| 7 | Migrate AI cache to CacheService | Migration | `lib/ai/cache.ts` → use existing CacheService |
| 8 | Migrate query optimizer | Migration | `lib/query-optimizer.ts` → CacheService or delete |
| 9 | Clean dead code | Cleanup | Remove `executeOptimizedQuery` if unused |
| 10 | Push equity-chart filters to DB | Query | Move date/instrument/tag filters from JS to Prisma where clause |
| 11 | Fix unbounded PnL fetch | Query | `loadTradesPage` stats → SQL window function for winning streak |
| 12 | Fix team overview N+1 | Query | `getTeamOverviewData` — team > members > users > accounts > trades → 2 queries |
| 13 | Fix team analytics N+1 | Query | `updateTeamAnalytics` 6+ queries → 1-2 aggregate queries |
| 14 | Add select projection | Query | `calculateAccountMetricsAction` — add explicit `select` |
| 15 | Consolidate user resolution | Query | 3 files × 2 queries → shared `resolveUser()` |
| 16 | Add measured indexes | Query | `PropFirm.isActive`, coupon active/expires, review status |
| 17 | Enforce pagination on all list endpoints | Bounds | Default 50, max 200, `take`/`skip` on all `findMany` |
| 18 | Define cache policies by data class | Policy | Public (CDN 300s), private (Redis 60s), AI (Redis 90s), entitlement (Redis 30s write-through) |
| 19 | Measure before/after | Metrics | Baseline latency → post-migration hit rate → 3x target |

---

### WAVE 7: Cleanup & CI (Phase 12)
**Goal:** No dead packages. CI gates enforced. Ready for production.
**Runs last — after all other waves**

---

#### Phase 12: Dependency Cleanup & CI
**Closes:** REQ-DEP-001, REQ-CI-001, REQ-CI-002

| # | Task | Files | What to do |
|---|------|-------|-----------|
| 1 | Remove unused packages | `package.json` | Audit and remove unused runtime deps |
| 2 | Confirm single motion strategy | `package.json` | Keep `framer-motion`, evaluate `motion` usage |
| 3 | Sync .env.example | `.env.example` | Match all `process.env.*` references in code |
| 4 | Fix sidebar-trigger-contract test | Test file | Resolve pre-existing test failure |
| 5 | Create startsAt migration | `prisma/migrations/` | Add `startsAt` column for coupon scheduling |
| 6 | Fix coupon schedule UTC bug | Admin coupon forms | Use local time for `datetime-local` inputs (see L60) |
| 7 | Fix propfirms read-only consistency | `app/[locale]/admin/propfirms/` | Disable mutations in fallback mode (see L61) |
| 8 | Fix resolveWritableUserId error | `server/trades.ts` | Surface as auth error, not DATABASE_ERROR (see F-14) |
| 9 | Enforce CI gates | `.github/workflows/ci.yml` | Typecheck + lint + route-budget + build as required |
| 10 | Update bundle analysis | — | Verify Next 16 app-route output |
| 11 | Verify + test | — | Full test suite, typecheck, lint, build |

---

### WAVE 8: Visual Long-Tail (from t/todo)
**Goal:** Remaining pages unified with shared design system.

| # | Task | What to do |
|---|------|-----------|
| 1 | Audit remaining dashboard routes | Check which routes bypass shared shell |
| 2 | Normalize remaining admin pages | Apply unified shell to admin long-tail |
| 3 | Normalize remaining public pages | Apply unified shell to public long-tail |
| 4 | Normalize remaining teams pages | Apply unified shell to teams long-tail |
| 5 | Responsive review | Check all pages on mobile + tablet |
| 6 | Final lint + typecheck + build | Clean verification |

---

## Critical Path

```
Wave 1 (Phases 02 + 04) ──→ Wave 2 (Phases 03 + 08)
         │                           │
         ├──→ Wave 3 (Phase 07)      │
         │                           │
         ├──→ Wave 4 (Phases 09+11)  │
         │                           │
         └──→ Wave 5 (Phase 10) ←───┘
                    │
                    └──→ Wave 6 (Backend cache/query)
                              │
                              └──→ Wave 7 (Phase 12 CI)
                                        │
                                        └──→ Wave 8 (Visual long-tail)
```

## Parallel Execution Opportunities

| Parallel Track A | Parallel Track B |
|-----------------|-----------------|
| Phase 02 (Server Bootstrap) | Phase 04 (Import Polish) |
| Phase 03 (Widget Shells) | Phase 08 (Font/Bundle) |
| Phase 09 (Auth) | Phase 10 (Observability) |
| Phase 07 (Dashboard Polish) | Wave 6 (Backend Cache/Query) |

## Summary

| Wave | Phases | REQs Closed | Tasks | Depends On |
|------|--------|-------------|-------|-----------|
| 1 | 02 + 04 | 8 | 13 | Nothing |
| 2 | 03 + 08 | 6 | 17 | Wave 1 |
| 3 | 07 | 3 | 6 | Wave 1 |
| 4 | 09 + 11 | 6 | 13 | Wave 1 |
| 5 | 10 | 4 | 11 | Nothing (parallel) |
| 6 | Backend | 0 (supporting) | 19 | Nothing (parallel) |
| 7 | 12 | 3 | 11 | All others |
| 8 | Visual | 0 (supporting) | 6 | Wave 7 |
| **Total** | **12** | **30** | **96 tasks** | |

## Manual Decisions Needed (Not Codex)

These require human product decisions before implementation:

1. **F-05:** Trade multiplication (N×M accounts) — confirmation dialog or single-account?
2. **F-06:** Client/server UUID hash mismatch — which field set is canonical?
3. **motion package:** Keep both `framer-motion` and `motion` or consolidate?
4. **Rollout order:** Which feature flag to enable first in production?

---

*Plan created: 2026-04-18*
*Source: v2.1-MILESTONE-AUDIT.md, t/memory, t/lessons, t/todo, codebase inspection*
