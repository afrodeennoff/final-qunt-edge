# Qunt Edge Master Implementation Prompt

Read this file fully, then implement it end-to-end with zero avoidable errors. Do not stop at analysis. Audit, fix, validate, and summarize. Do not claim anything works unless you actually validated it.

## Mission

You are the lead reliability engineer for Qunt Edge, an open-source trading analytics platform for professional futures/prop-firm traders.

Your mission is to perform a full end-to-end audit and fix pass across the entire codebase in one coordinated effort so the app works out of the box on desktop and mobile, with no broken buttons, dead clicks, silent failures, navigation bugs, layout conflicts, auth regressions, cache inconsistencies, or code conflicts between surfaces.

Treat this as a production hardening and regression elimination task, not a cosmetic cleanup.

## Project Context

Repository:
- Next.js App Router application
- Main surfaces: public marketing, authentication, dashboard, teams, admin, AI assistant, broker integrations, billing/payments, shared dashboards, embeds
- Key directories:
  - `app/`
  - `components/`
  - `server/`
  - `lib/`
  - `context/`
  - `store/`
  - `prisma/`
  - `scripts/`
  - `docs/`

Critical project rules:
- i18n uses `next-international`, not `next-intl`
- middleware file is `proxy.ts`, not `middleware.ts`
- dark-only theme, no light mode
- strict TypeScript
- no `as any`
- no `@ts-ignore` or `@ts-expect-error` except existing approved test cases
- no `console.log`
- no hardcoded hex colors
- no `unstable_cache` or `revalidateTag`; use `use cache` + `cacheLife` + `cacheTag` + `updateTag`
- no direct Prisma in client components
- no fake synthesized fallback analytics data
- use `lib/score-calculator.ts` via `deriveScoreMetricsFromTrades()` as the single source of truth for Trading Score
- preserve serverless-safe Prisma pool behavior
- keep auth and user-id resolution logic consistent with repo rules
- preserve sidebar, dashboard shell, and protected route contracts exactly where documented

## Files And Areas To Prioritize

Core shell and routing:
- `proxy.ts`
- `app/[locale]/dashboard/layout.tsx`
- dashboard header, sidebar, widget canvas, route navigation, tab routing
- teams protected routes
- admin routes
- shared/public route locale safety
- home and landing layouts
- authentication redirects and `next` param handling

Dashboard:
- `app/[locale]/dashboard/**`
- widget registry
- widget rendering
- chart loading and fallbacks
- header actions
- filters
- data provider state
- sidebar behavior
- layout persistence
- mobile responsiveness
- desktop shell alignment
- subpages: settings, data, import, reports, behavior, trader-profile, strategies, billing

Server/business logic:
- `server/**`
- auth
- authz
- trades
- accounts
- layouts
- user-data
- team-membership
- teams
- billing
- webhook-service
- payment-service
- imports
- equity-chart

API routes:
- `app/api/**`
- AI routes
- auth callback
- cron
- webhooks
- broker integration routes
- health routes
- ownership/auth validation
- error contracts

Shared logic:
- `lib/**`
- cache invalidation
- auth helpers
- prisma
- env validation
- seo/metadata
- sidebar state
- security helpers
- analytics math
- feature flags
- formatting and financial math

Client state and contexts:
- `context/**`
- `store/**`
- data-provider
- sync contexts
- Zustand stores
- persisted state correctness
- mobile detection correctness

## Primary Objective

Make the application function reliably across all major user flows so that:
- all visible buttons do something correct or are intentionally disabled with a clear reason
- all links and navigation paths resolve properly
- all sidebar items, headers, tabs, and subpages work correctly
- dashboard widgets render correctly and load honest data states
- auth-protected routes guard correctly and redirect correctly
- mobile and desktop layouts both work cleanly
- no obvious code conflicts, duplicated logic bugs, stale cache bugs, or broken handlers remain
- no user-facing dead ends, loading loops, or broken actions remain in the main product flows

## What Full Audit Means

You must inspect and fix, at minimum:

1. Navigation and shell integrity
- header actions
- sidebar links
- route transitions
- locale-safe links
- query-param-aware route completion
- protected route handling
- 404 and redirect edge cases

2. Dashboard correctness
- widgets
- tables
- charts
- filters
- imports
- statistics cards
- sync buttons
- layout persistence
- empty/loading/error states
- mobile dashboard behavior

3. Form and action integrity
- buttons wired to handlers
- dropdown/menu actions
- dialogs/sheets
- save/delete/update flows
- optimistic state handling
- callbacks and disabled states
- keyboard/focus basics where applicable

4. Data and cache correctness
- `use cache` readers
- `updateTag` invalidations
- stale data after mutations
- user-scoped queries
- auth-id vs database-id consistency
- optional live-schema column safety

5. Auth/security correctness
- route protection
- API auth enforcement
- no caller-controlled ownership writes
- no exposed secrets
- deterministic webhook verification
- team invitation/join policy correctness

6. Billing/import/integration reliability
- webhook processing safety
- plan/config alignment
- import processors and mappings
- sync contexts
- honest failure states
- no fake fallback financial data

7. Responsive and UX integrity
- mobile navigation
- mobile dashboard behavior
- desktop sidebar positioning
- header wrapping and overflow
- panel/card conflicts
- no stacked double-frame UI regressions
- no visual shell collisions

8. Code health in touched areas
- remove duplicate and broken logic in touched files
- keep changes minimal but complete
- preserve behavior unless behavior is clearly broken
- avoid broad refactors unless necessary to resolve systemic breakage

## Execution Rules

You must:
- read relevant repo docs and AGENTS instructions before changing behavior
- inspect existing patterns before editing
- preserve architecture and naming conventions
- prefer targeted fixes over stylistic rewrites
- keep business logic out of client components where possible
- use explicit minimal Prisma selects in auth-critical flows
- fail honestly rather than inventing fallback data
- treat financial math, auth, imports, and billing as correctness-critical
- keep server/client boundaries clean
- keep route handlers and server actions consistent with existing conventions

You must not:
- add `as any`
- add `@ts-ignore` or `@ts-expect-error`
- add fake analytics fallback data
- break cache conventions
- move logic into client code when it belongs server-side
- bypass auth in routes because middleware exists
- replace project-specific patterns with generic ones
- claim something works unless it was actually validated

## Required Audit And Fix Workflow

### Phase 1: Read and map
- Read root `AGENTS.md`
- Read `public/AGENTS.md`
- Read `app/[locale]/dashboard/AGENTS.md`
- Read `server/AGENTS.md`
- Read `lib/AGENTS.md`
- Inspect package scripts and current route/component structure
- Build a map of all major product surfaces and critical flows

### Phase 2: Static audit
- Find broken or risky areas using:
  - TypeScript errors
  - ESLint errors
  - obvious unreachable handlers
  - broken imports
  - stale cache patterns
  - missing auth checks
  - dead buttons and menu actions
  - sidebar and header route mismatches
  - query-param navigation bugs
  - mobile layout issues
  - duplicated or conflicting logic in touched flows

### Phase 3: Fix implementation
- Apply the smallest coherent fixes necessary
- Keep each fix aligned with project conventions
- Add or adjust targeted tests where they meaningfully protect critical behavior

### Phase 4: Validation
Run as many of these as environment allows:
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run check:route-security`
- `npm run check:route-budgets`

If some commands are blocked by environment or DB availability:
- state exactly what was blocked
- do not call it working without verification
- separate code-fixed from runtime-verified status

## Phase-By-Phase Checklist

You must explicitly verify and fix these areas where needed:

### Global shell
- locale routing
- proxy classification
- auth redirects
- header integrity
- sidebar integrity
- shared layout contracts
- home page shell behavior
- marketing vs authenticated shell boundaries

### Dashboard
- `layout.tsx` auth guard
- sidebar open state from cookie
- header action controls
- widget-canvas transparency and chrome ownership
- chart data loading
- local fallback behavior when server chart data is slow or fails
- customization mode
- route and search param synchronization
- subpages all reachable and usable

### Teams and Admin
- protected routing
- sidebar and header consistency
- join, manage, and dashboard flows
- invitation acceptance rules
- auth boundary correctness

### API and Server
- route auth
- error response contract
- user ownership validation
- cache invalidation
- webhook signature checks
- cron auth
- import routes
- broker sync actions
- billing consistency

### Responsive
- desktop sidebar positioning
- mobile mode detection
- mobile nav and overflow
- dashboard mobile summaries
- form and dialog usability on small screens
- no broken sticky or fixed overlays

## Deliverable Format

At the end, return:

1. Executive summary
- what was broken
- what was fixed
- highest-risk areas

2. Files changed
- grouped by area

3. Validation results
Use exact status language:
- `Status: Code-fixed (not runtime-tested)`
or
- `Status: Runtime-verified`

Include:
- what commands passed
- what commands failed or were blocked
- exact runtime paths still unverified, if any

4. Residual risks
- only real remaining risks
- no vague filler

5. If blocked
- explain exact blocker
- explain what remains to finish

## Success Bar

Do not stop until the app is materially more reliable across:
- dashboard
- headers
- sidebar
- subpages
- buttons and actions
- mobile
- desktop
- auth
- API
- imports
- billing and webhooks

The final result should feel like a serious production stabilization pass, not a partial cleanup.
