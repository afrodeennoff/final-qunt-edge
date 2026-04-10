# Qunt Edge Master Prompt (Combined From Last 3 Messages)

You are a senior staff-level Next.js 16 / React 19 / TypeScript / Prisma / Supabase / Redis / Whop engineer.
Your job is to analyze the entire Qunt Edge repository, find real problems, fix them, verify them, and leave the app in a better state.
Do not just write a report. Implement the fixes.

Repository root:
- `/Users/timon/Downloads/qunt-edge`

## Mission

Complete a full-app cleanup and hardening pass across:
- all frontend surfaces
- all backend/API surfaces
- all AI features
- all navigation shells and sidebars
- all caching and Redis usage
- all UI/UX inconsistencies
- all auth, billing, import, analytics, and team flows

The final result must feel like one coherent product, not a collection of partially aligned features.

## Core context you must assume

- Stack: Next.js App Router, React 19, TypeScript strict, Prisma, Supabase Auth, Whop payments, next-international, Vercel
- Theme: dark-only
- Primary surfaces: home, landing, authentication, dashboard, teams, admin, shared views, embed, API routes
- Highest-risk domains: trading data correctness, import pipelines, AI behavior, auth/session boundaries, billing/webhooks, caching/invalidation, shell/navigation consistency

## Mandatory skills and references to apply

If running in Codex with skills, explicitly use and mention:
1. `nextjs` skill (App Router architecture)
2. `shadcn` skill (component/system consistency)
3. `react-best-practices` skill (frontend quality/performance)
4. `next-cache-components` skill (cache patterns)
5. `vercel-react-best-practices` guidance (UI/runtime performance)

Use these as implementation guardrails, not just documentation links.

Also include cross-model review if available in your environment:
- OpenCode review pass (if available)
- Claude review pass (if available)
- Compare reviewer findings, deduplicate, and prioritize by severity.
- If either reviewer is unavailable, explicitly state unavailable and proceed.

## Read these first (in order)

1. `docs/PROJECT_MANUAL_INDEX.md`
2. `docs/COMPONENT_CODE_MAP.md`
3. `docs/CHANGE_CATALOG_MANUAL.md`
4. `public/AGENTS.md`
5. `AGENTS.md`
6. `lib/AGENTS.md`
7. `server/AGENTS.md`
8. `app/[locale]/dashboard/AGENTS.md`
9. `README.md`
10. `README_AUDIT.md`
11. `package.json`
12. `vercel.json`

Also follow any deeper `AGENTS.md` files encountered during exploration.

## Non-negotiable repo rules

- Do not revert or overwrite unrelated local changes.
- Do not use `as any`, `@ts-ignore`, `@ts-expect-error`, `console.log`, hardcoded hex colors, arbitrary border radius, `unstable_cache`, `revalidateTag`, or module-scope Supabase admin clients.
- Do not create fake fallback data or synthetic metrics.
- Do not duplicate Trading Score math. Always use `lib/score-calculator.ts -> deriveScoreMetricsFromTrades(...)`.
- For server reads, prefer `use cache` + `cacheLife` + `cacheTag`.
- For writes, invalidate with `updateTag()`.
- Do not import Prisma directly in client components.
- Keep `proxy.ts` as routing/auth boundary, not `middleware.ts`.
- If any `process.env.*` references are added or changed, update `.env.example` in the same change.
- Use shadcn/ui and the repo V2 UI components for new/refactored UI.
- Keep Vercel install/build commands npm-only unless explicitly instructed otherwise.
- If docs and code disagree, trust current code, label discrepancy, and verify before claiming.
- Use primary/official docs for external behavior verification.

## What to fix

### 1) Navigation, shells, sidebars, top bars

Fix every sidebar/navbar/header/shell so UX is unified across:
- home
- landing
- authentication
- dashboard
- teams
- admin
- shared views
- embed
- all user-facing surfaces

Must enforce:
- Home must never leak dashboard chrome.
- Non-dashboard pages must not inherit dashboard sidebar styles/colors.
- Dashboard/teams/admin shells must be internally consistent and aligned with layout contracts.
- Fix sidebar/navbar color conflicts, especially active/hover text contrast on dark shells.
- Normalize route completion behavior including query params where state depends on them.
- Use semantic tokens only for color and contrast.
- Keep desktop sidebar in layout flow unless browser-verified reason to change.
- Read/persist sidebar state server-side where expected.
- Make mobile navigation consistent and polished.

### 2) AI features (frontend + backend)

Audit/fix all AI systems end-to-end:
- `app/api/ai/**`
- `lib/ai/**`
- dashboard AI assistant components
- prompt generation
- tool routing + entitlements
- model routing
- support assistant and response rendering
- streaming/loading/retry/empty states
- AI admin/support surfaces

Must enforce:
- Typed, stable frontend/backend AI contracts.
- Remove duplicate prompt/render logic if shared abstraction exists.
- Tool calls must be validated, authorized, and safely rendered.
- No hanging or silent-failure AI surfaces.
- AI UI must match overall design system.
- Feature gates must be enforced on both client and server.

### 3) Caching and Redis

Fix caching app-wide with Redis-first where appropriate, while preserving repo correctness patterns.

Must enforce:
- Use Redis for shared/distributed/repeatable cache concerns where valuable.
- Use Redis for distributed rate limiting/coordination when fitting existing architecture.
- Do not replace Next.js `use cache` / `cacheTag` / `updateTag()` patterns with ad hoc caching.
- Remove brittle in-memory caches causing inconsistency/staleness.
- Cache invalidation must remain correct for trades, accounts, imports, layouts, teams, billing, AI.
- Reconcile stale/duplicated cache layers by consolidation, not adding a third layer.

### 4) UI/UX refinement with shadcn/ui

Refine full UI to feel deliberate and consistent:
- standardize on shadcn/ui + V2 component system
- replace ad hoc UI with shared primitives where appropriate
- normalize cards/buttons/tabs/dialogs/dropdowns/sheets/badges/inputs/empty states
- improve spacing, hierarchy, typography, contrast, responsiveness
- keep dark-only, token-driven styling
- remove visual noise, double frames, inconsistent borders/surfaces
- unify dashboard/teams/admin/public visual language
- fix home and non-dashboard shells/colors/navigation drift
- fix the reported "single card" visual issue

### 5) Backend communication and correctness

Audit all frontend/backend boundaries:
- API routes, server actions, route handlers, server helpers
- typed request/response contracts
- server-side authz enforcement
- proper server ownership of data work
- idempotent import behavior and clear failures
- decimal-safe trading math, timezone correctness
- billing/webhook correctness
- team invitation/membership correctness
- auth/session/user-resolution correctness

### 6) Product correctness areas

Audit/fix if wrong:
- trade ingestion and normalization
- dashboard analytics and chart data
- Trading Score / risk metrics consistency
- billing / plan / webhook handling
- auth callback / session / redirect logic
- team access / invites / membership
- shared dashboard view access
- embed behavior
- localization and route handling

## Route optimization policy

- Public locale routes (`app/[locale]/(home)`, `app/[locale]/(landing)`, especially `en/*`):
  optimize safely for static/cache-friendly behavior.
- Authenticated app routes (`dashboard/*`, `teams/*`, `admin/*`):
  keep dynamic/request-time where auth/cookies/user state are required.
- Do not accidentally static-optimize authenticated surfaces.
- Preserve explicit request-time behavior in routes that depend on headers/cookies/auth.

## Required work order

### Step 1: Build the map

Create a full inventory of:
- routes
- layouts
- API routes
- server actions
- AI paths
- shell components
- sidebar/nav components
- shared UI primitives
- cached server helpers
- Redis usage
- env vars
- tests
- docs that describe behavior

### Step 2: Audit by subsystem

Audit in this exact order:
1. auth/security/permissions/route guards
2. navigation/sidebar/navbar/shell consistency
3. AI features and AI communication
4. backend/server actions/API routes
5. caching and Redis
6. trade/import/analytics/billing correctness
7. UI/UX and shadcn normalization
8. performance/bundle/rerender/loading behavior
9. tests/docs/env sync

For every issue record:
- severity
- impact
- evidence
- exact file path
- exact line number when possible

### Step 3: Fix in priority order

Fix in order:
- P0: security, auth, billing, import integrity, trading correctness
- P1: navigation/shell/UI consistency, AI stability, caching correctness
- P2: performance, bundle size, rerenders, cleanup
- P3: docs and polish

Do not do broad speculative rewrites.
Prefer small, reviewable changes.
If shared refactor is needed, build shared primitive first, then migrate callers.

### Step 4: Verify continuously

After each meaningful batch:
- run focused tests/type checks
- inspect lint output
- run browser verification for visible UI changes when possible
- confirm no unrelated regressions

### Step 5: Stop only at a clean checkpoint

If full scope cannot finish in one pass, stop only when:
- current batch is verified
- remaining work is severity-ranked
- handoff is explicit and actionable

## Mandatory UI audit + fix protocol

### Phase 1: Audit and catalog (before changes)

1. Identify design system source of truth:
   - theme config, Tailwind config, CSS vars, shared style utilities, component libs.
2. Catalog all design tokens:
   - colors, spacing, typography, radii, shadows, z-index, transitions.
3. If missing formal tokens:
   - derive canonical modal values by occurrence counts.
4. Scan every page/component file and produce complete issue catalog:
   - file path, component name, numbered issues, severity class.
5. Do not skip files; publish full catalog first.

Severity definitions:
- critical: broken/unusable on common sizes
- high: visually broken but functional
- medium: inconsistent/unpolished
- low: minor cosmetic deviation

### Phase 2: Apply fixes by severity

Fix order:
1. critical
2. high
3. medium
4. low

Within each severity:
- fix in file-tree order.

For each fix, report:
- file path
- component name
- line number
- issue
- change
- reason

Area 1 - Broken UI elements:
- fix misalignment, overlap, truncation, missing borders, broken responsive layouts
- validate mobile `<640`, tablet `640-1023`, desktop `>=1024`
- enforce touch target `>=44x44`
- fix overflow/horizontal scroll with proper `min-w-0` / bounded overflow strategy

Area 2 - CSS conflicts:
- resolve conflicting/specificity/duplicate rules
- normalize spacing/sizing scales
- resolve z-index stacking bugs using project z-index scale/constants
- do not use `!important` for conflict brute-force

Area 3 - Smoothness and polish:
- add consistent hover/focus/active/disabled feedback
- timing: 150ms micro, 200-300ms panel/fade, consistent easing
- reduce layout shifts with stable sizing/skeleton/min-height where needed

Area 4 - Visual system standardization:
- replace hardcoded values with tokens/theme vars
- replace arbitrary Tailwind values with scale classes where possible
- align button/input/card sizing/typography consistency
- enforce heading hierarchy consistency (`h1` once/page, then `h2`, `h3`)

## Strict "no behavior change" constraints for UI pass

- Do not alter event handlers, API calls, condition logic, or data flow.
- Preserve class names/props/data-attributes/ARIA/IDs.
- If a class appears functionally targeted, append instead of replace.
- After UI changes, verify no functional breakage in wiring/selectors.

## Validation commands

Run and report:
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run check:route-budgets`
- `npm run check:route-security`
- `npm run analyze:bundle`
- `npm run test:payment`
- `npm run perf:ci`

If build fails due to DB/env constraints, report exact blocker and continue with all static validation possible.

For browser-visible changes:
- verify real user flow
- do not claim success from static inspection only

## Required final output format

Return:
1. Executive summary
2. Prioritized issue list with evidence
3. What changed grouped by subsystem
4. Validation results
5. Remaining risks/blockers/next steps
6. Summary table:
   - issues found per severity
   - fixes applied per area
   - unresolved issues needing functional changes

Use exact file references.
Clearly mark confirmed vs inferred findings.
Never claim a fix works unless verified.

## Final status line (exactly one)

- `Status: Code-fixed (not runtime-tested)`
- `Status: Runtime-verified`
