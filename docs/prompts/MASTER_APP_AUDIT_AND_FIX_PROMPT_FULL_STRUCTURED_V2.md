# Qunt Edge Full-App Audit, Refactor, and Fix Prompt (Structured V2)

You are a senior staff-level Next.js 16 / React 19 / TypeScript / Prisma / Supabase / Redis / Whop engineer.
Your job is to analyze the entire Qunt Edge repository, find real problems, fix them, verify them, and leave the app in a better state.
Do not just write a report. Implement the fixes.

## Primary Mission

Deliver a full-app cleanup and hardening pass across:
- all frontend surfaces
- all backend/API surfaces
- all AI features
- all navigation shells, sidebars, and navbars
- all caching and Redis usage
- all UI/UX inconsistencies
- all auth, billing, import, analytics, and team flows

The result must feel like one coherent product.

## User-Priority Focus (Must Be Addressed)

1. Fix sidebar issues on all pages.
2. Ensure all pages remain dark theme only (no light-mode regressions).
3. Fix broken navbar behavior and visual inconsistencies.
4. Fix the reported single-card UI issue (find it, document it, fix it).
5. Fix import trader rendering problems.
6. Fix all import trade functions end-to-end (UI -> parsing -> normalization -> save -> refresh).
7. Ensure `en/*` public pages are optimized appropriately.
8. Keep `dashboard/*` and authenticated surfaces request-time/dynamic where required by auth/cookies/user data.
9. Ensure frontend + backend communication works reliably after refactor.

## Repository Facts (Assume True)

- Repo root: `/Users/timon/Downloads/qunt-edge`
- Stack: Next.js App Router, React 19, TypeScript strict, Prisma, Supabase Auth, Whop, next-international, Vercel
- Theme: dark-only
- Core surfaces: home, landing, authentication, dashboard, teams, admin, shared views, embed, API routes
- Highest-risk domains: trading correctness, imports, AI behavior, auth/session boundaries, billing/webhooks, cache invalidation, shell/navigation consistency

## Skills To Use And Mention Explicitly

### Codex/Local Skills (must apply)
- `nextjs`
- `shadcn`
- `react-best-practices`
- `next-cache-components`
- `vercel-react-best-practices`

### Claude Skills Found In Repo (must reference in audit notes)
- `/widget` -> `.claude/skills/widget.md`
- `/stat-card` -> `.claude/skills/stat-card.md`
- `/api-route` -> `.claude/skills/api-route.md`

### OpenCode Skills Referenced In Repo Plans (must reference)
- `frontend-ui-ux`
- `frontend-design`
- `widget`
- `subagent-driven-development` (including `superpowers:subagent-driven-development`)
- `executing-plans`
- `using-superpowers`

If any named skill is unavailable in the runtime, state that clearly and proceed with the closest equivalent workflow.

## Read First (Strict Order)

1. `docs/PROJECT_MANUAL_INDEX.md`
2. `docs/COMPONENT_CODE_MAP.md`
3. `docs/CHANGE_CATALOG_MANUAL.md`
4. `public/AGENTS.md`
5. `AGENTS.md`
6. `lib/AGENTS.md`
7. `server/AGENTS.md`
8. `app/[locale]/dashboard/AGENTS.md`
9. `app/api/AGENTS.md`
10. `components/ui/AGENTS.md`
11. `context/AGENTS.md`
12. `store/AGENTS.md`
13. `lib/ai/AGENTS.md`
14. `tests/AGENTS.md`
15. `README.md`
16. `README_AUDIT.md`
17. `package.json`
18. `vercel.json`

Also follow any deeper `AGENTS.md` you discover.

## Current Architecture Snapshot (Use As Initial Map, Then Verify)

- Layouts (12 total):
  - `app/layout.tsx`
  - `app/[locale]/layout.tsx`
  - `app/[locale]/(home)/layout.tsx`
  - `app/[locale]/(landing)/layout.tsx`
  - `app/[locale]/(authentication)/layout.tsx`
  - `app/[locale]/dashboard/layout.tsx`
  - `app/[locale]/admin/layout.tsx`
  - `app/[locale]/teams/layout.tsx`
  - `app/[locale]/teams/(landing)/layout.tsx`
  - `app/[locale]/teams/dashboard/layout.tsx`
  - `app/[locale]/teams/manage/layout.tsx`
  - `app/[locale]/shared/[slug]/layout.tsx`
- Pages: 69
- API routes: 58 (`app/api/**/route.ts`)
- Server modules: 38 files under `server/`
- Tests: 73 files under `tests/`

### Key Shell/Nav Files To Audit Early
- `app/[locale]/(home)/layout.tsx`
- `app/[locale]/(landing)/layout.tsx`
- `app/[locale]/dashboard/layout.tsx`
- `app/[locale]/admin/layout.tsx`
- `app/[locale]/teams/dashboard/layout.tsx`
- `app/[locale]/teams/manage/layout.tsx`
- `components/ui/sidebar.tsx`
- `components/ui/unified-sidebar.tsx`
- `components/sidebar/dashboard-sidebar.tsx`
- `app/[locale]/(landing)/components/navbar.tsx`
- `app/[locale]/dashboard/components/dashboard-header.tsx`
- `components/ui/sidebar-primitives/use-sidebar-nav.ts`

### Key Import/Trader Files To Audit Early
- `app/[locale]/dashboard/components/import/import-button.tsx`
- `app/[locale]/dashboard/components/import/tradovate/tradovate-processor.tsx`
- `app/[locale]/dashboard/components/import/tradovate/tradovate-sync.tsx`
- `app/[locale]/dashboard/components/import/rithmic/rithmic-order-processor-new.tsx`
- `app/[locale]/dashboard/components/import/rithmic/sync/rithmic-sync-connection.tsx`
- `app/[locale]/dashboard/components/import/rithmic/sync/rithmic-sync-progress.tsx`
- `server/trades.ts`
- `server/accounts.ts`
- `server/imports/tradovate-actions.ts`
- `server/imports/rithmic-sync-actions.ts`

### Key AI Paths
- `app/api/ai/**`
- `lib/ai/**`
- `app/[locale]/dashboard/components/chat/**`
- `app/[locale]/dashboard/components/analysis/**`

### Key Caching/Redis Paths
- `server/user-data.ts`, `server/layouts.ts`, `server/trades.ts`, `server/deals.ts`, `server/prop-firms.ts`
- `lib/cache/cache-invalidation.ts`
- `lib/redis-client.ts`
- `lib/rate-limit.ts`
- `lib/ai/cache.ts`

## Non-Negotiable Repo Rules

- Do not revert or overwrite unrelated local changes.
- Do not use `as any`, `@ts-ignore`, `@ts-expect-error`, `console.log`, hardcoded hex colors, arbitrary border-radius, `unstable_cache`, `revalidateTag`, or module-scope Supabase admin clients.
- Do not synthesize fake fallback metrics/data.
- Do not duplicate Trading Score math. Always use `lib/score-calculator.ts` -> `deriveScoreMetricsFromTrades(...)`.
- For server reads, use `use cache` + `cacheLife` + `cacheTag`.
- For writes, invalidate with `updateTag()` (and Redis namespace invalidation if used).
- Do not import Prisma in client components.
- Keep `proxy.ts` as auth/routing boundary (not `middleware.ts`).
- If any `process.env.*` usage changes, update `.env.example` in same change.
- Use shadcn/ui + V2 components for UI refactor.
- Keep Vercel install/build commands npm-only unless explicitly asked otherwise.
- If docs and code disagree, trust code, label discrepancy, verify.

## Work Order (Must Follow Exactly)

### Step 1: Build The Map
Create full inventory of:
- routes
- layouts
- API routes
- server actions
- AI paths
- shell/sidebar/nav components
- shared UI primitives
- cached server helpers
- Redis usage
- env vars
- tests
- behavior docs

### Step 2: Audit By Subsystem (in this exact order)
1. auth/security/permissions/route guards
2. navigation/sidebar/navbar/shell consistency
3. AI features and AI communication contracts
4. backend/server actions/API routes
5. caching and Redis
6. trade/import/analytics/billing correctness
7. UI/UX and shadcn/V2 normalization
8. performance/bundle/rerender/loading behavior
9. tests/docs/env sync

For each issue include:
- severity (P0/P1/P2/P3)
- impact
- evidence
- exact file path
- exact line number(s) when possible

### Step 3: Fix In Priority Order
- P0: security, auth, billing, import integrity, trading correctness
- P1: sidebar/navbar/shell consistency, AI stability, cache correctness
- P2: performance, rerender, bundle, cleanup
- P3: docs/polish

Prefer small, reviewable patches. Avoid speculative rewrites.

### Step 4: Verify Continuously
After each meaningful fix batch:
- run focused tests/type checks for touched area
- inspect lint output
- browser-verify user-visible changes when possible
- confirm no unrelated regressions

### Step 5: Stop Only At Clean Checkpoint
If scope cannot finish in one pass, stop only after:
- current batch is verified
- remaining work is severity-ranked
- handoff is explicit and actionable

## Shell/Nav Specific Constraints

- Home must not leak dashboard chrome.
- Non-dashboard routes must not inherit dashboard sidebar styles/colors.
- Dashboard shell must remain direct/stable (no lazy placeholder shell replacement).
- Teams/admin shells must remain protected and consistent with route guards.
- Sidebar state persistence must follow cookie/server defaults expected by repo.
- Active/hover sidebar text on dark shells must preserve contrast tokens (`sidebar-foreground`).
- Query-parameter-driven route state must be treated as part of route completion.
- Do not introduce a second conflicting shell system.

## AI Specific Constraints

- Audit tools, prompts, policies, model routing, entitlements, response rendering.
- Ensure typed, stable frontend/backend AI contracts.
- Enforce auth + entitlement on both server and client pathways.
- Validate and safely render tool calls.
- Remove duplicate prompt/renderer logic if shared path exists.
- Fix hangs/silent failures/streaming inconsistencies.

## Import/Trader Specific Constraints

- Fix rendering problems in import UI flow.
- Fix all import trade functions across Tradovate, Rithmic, PDF/CSV paths touched by findings.
- Keep ingestion idempotent and explicit on failure.
- Preserve decimal-safe financial correctness and timezone correctness.
- Ensure post-import data refresh/invalidation is correct.
- Ensure malformed data paths fail clearly with actionable messages.

## Caching/Redis Specific Constraints

- Redis for shared/distributed/repeatable cache concerns only.
- Keep Next.js `use cache` as primary server-read pattern.
- Writes must invalidate correct Next cache tags and Redis namespaces.
- Remove brittle in-memory caches only where they create correctness risk.
- Do not let stale cache mask auth/trade/billing/AI issues.

## Next.js Optimization Policy

- Public locale routes (`en/*`, landing/home/docs/blog-like content): optimize safely for static/cacheable behavior where compatible.
- Authenticated routes (`dashboard/*`, `teams/*`, `admin/*`): keep request-time/dynamic behavior when auth/cookies/user state are required.
- Do not accidentally static-optimize protected or user-specific surfaces.
- Use `await connection()` in request-time handlers that intentionally depend on runtime request context.

## UI/UX Refinement Protocol (No Behavior Changes)

### Phase 1: Audit and Catalog First
- Identify token sources (`tailwind.config.ts`, global CSS vars, UI primitives).
- Catalog design tokens: colors, spacing, type scale, radius, shadow, z-index, transitions.
- If missing, derive canonical values from modal usage frequency.
- Audit every page/component touched by this mission and list issues by severity.

### Phase 2: Fix By Severity
Order:
1. critical
2. high
3. medium
4. low

For each fix include:
- file path
- component name
- line number
- issue
- change made
- why

Focus areas:
- broken layout/alignment/overflow/truncation/responsiveness
- CSS conflicts/specificity/duplicate styles/z-index stacking
- consistent transitions/focus/hover/active/disabled states
- token-driven, dark-only visual normalization with shadcn/V2 primitives

Strict guardrails:
- do not change business logic or data flow
- do not alter event handler intent or API behavior unless fixing a verified bug
- preserve functional selectors/attributes/classes where behavior depends on them

## Validation Commands

Run strongest relevant checks and report results:
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run check:route-budgets`
- `npm run check:route-security`
- `npm run analyze:bundle`
- `npm run test:payment`
- `npm run perf:ci`

If build fails due to DB/env dependency, explicitly report blocker and continue static validation.

## Required Final Output Format

Return exactly:
1. Executive summary
2. Prioritized issue list with evidence
3. What changed (grouped by subsystem)
4. Validation runs and results
5. Remaining risks, blockers, next steps

Rules for reporting:
- Use exact file references.
- Distinguish confirmed vs inferred claims.
- Never claim runtime success without runtime evidence.

## Final Status Line (Exactly One)

- `Status: Code-fixed (not runtime-tested)`
- `Status: Runtime-verified`
