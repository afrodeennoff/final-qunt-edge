# Launch Readiness Audit - 2026-04-26

## Scope

Mission: make Qunt Edge production-ready, stable, secure, responsive, and visually coherent while preserving product intent, auth behavior, calculations, routes, and data models unless a change is required for correctness.

This document records the launch audit trail: Phase 0 inventory plus Phase 1 runtime/security
repairs completed so far.

## Repo Inventory

- Total workspace files scanned, excluding dependency/build folders: 1,943.
- App layer: 622 files, 69 pages, 12 layouts, 61 route handlers.
- API methods: 37 GET, 32 POST, 2 PUT, 2 PATCH, 5 DELETE, 1 OPTIONS.
- Client components/directives: 429 total; 288 under `app/`, 108 under `components/`, 10 under `context/`.
- Server directive files: 53.
- Server/action areas: 62 files across `server/` and route-local `actions/`.
- Shared UI: 178 component files.
- Shared libraries: 141 files.
- Context/state: 12 context files, 27 Zustand stores, 9 hooks.
- Database: Prisma schema plus 99 migrations.
- Tests: 102 test/spec files discovered; Vitest run executed 498 tests.

## Layer Map

- `proxy.ts`: route classification, locale redirects, CSP, CORS, private/public document boundary, cron/admin handling.
- `app/layout.tsx`: root metadata, fonts, dark shell, Vercel analytics, root skip link, global body/main wrapper.
- `app/[locale]/layout.tsx` and `layout-content.tsx`: locale provider and consent banner boundary.
- `app/[locale]/dashboard/layout.tsx`: Supabase user gate, optional server bootstrap, dashboard providers, sidebar shell, header, mobile nav.
- `context/data-provider.tsx`: main dashboard orchestration, server action calls, IndexedDB cache hydration, Zustand writes, filters, refresh orchestration.
- `components/providers/dashboard-providers.tsx`: wraps bootstrap, monolithic DataProvider, slice providers, sync provider, toaster.
- `server/*`: cached reads, mutations, auth, billing, teams, imports, shared views, layouts, journal/mood.
- `lib/*`: Prisma singleton, Supabase clients, API response helpers, AI policies, score calculations, cache invalidation, security, formatting.
- `components/ui/*` and `components/layout/*`: design primitives and shell recipes.
- `store/*`: client-side state islands; current hot stores are `user-store` and `trading-domain-store`.

## Primary Data Flows

- Public page: localized page -> cached/public server helper or static content -> shared marketing primitives.
- Authenticated dashboard: dashboard layout -> Supabase session -> optional `getDashboardBootstrap()` -> `DashboardProviders` -> `DataProvider` -> server actions and IndexedDB cache -> Zustand/context selectors -> widgets/charts/tables.
- Trade reads: client context/API route -> `getTradesAction()` -> resolved database user id -> Prisma trade queries -> normalized client data.
- Trade writes/imports: import UI/API/broker action -> `saveTradesAction()` or integration action -> resolved user id -> Prisma mutation -> cache invalidation.
- Layout reads/writes: dashboard bootstrap/DataProvider -> `getDashboardLayout()` / `loadDashboardLayoutAction()` -> Prisma `DashboardLayout` -> layout store; writes go through `saveDashboardLayoutAction()`.
- AI chat: `/api/ai/chat` -> `guardAiRequest()` -> prompt safety -> `getAiLanguageModel()` -> intent-scoped tools -> telemetry.
- Teams invite/join: API routes and server teams helpers both exist; route handler is stricter than legacy `server/teams.ts` helper.
- Public trader profile: `/[locale]/trader/[slug]` currently aggregates trades directly by `userId` slug.
- Journal/mindset: dashboard components -> `server/journal.ts` -> Prisma `Mood`; no full Notes-style app model exists yet.

## Current Verification Baseline

- `npm run typecheck`: pass; latest direct check via `node scripts/robust-typecheck.mjs` also passes after cache/proxy/route-boundary fixes.
- `npm run lint`: pass with 945 warnings.
- `npm run check:dead-code`: pass.
- `npm run check:route-security`: pass after public probe/webhook classification updates.
- `npm run build`: pass when run outside sandbox. Local build skipped migration status because no local database URL was configured.
- `npm run check:route-budgets`: pass after build.
- `npm run test:smoke`: pass against a locally running production server when run outside sandbox.
- `npm run test`: pass, 96 files passed, 1 skipped; 453 tests passed, 46 skipped.

## Phase 1 Repairs Completed

- Team invitation helpers now enforce owner/admin/manager authorization, normalize invite emails, and require the authenticated user's email to match the pending invitation before accepting.
- Team/API route tests were aligned to the shared `apiSuccess`/error envelope helpers and now pass.
- Dashboard error boundaries tolerate `useParams()` returning null, preserving a locale fallback instead of crashing during client error rendering.
- Dashboard layout ownership now respects the Prisma schema contract: `DashboardLayout.userId` is keyed by auth id, while trades/accounts/user domain data remain keyed by database user id.
- `getDashboardLayout()` now accepts the current actor's auth id or database id for authorization, then reads/seeds the auth-keyed layout row.
- `context/data-provider.tsx` now keeps layout identity separate from domain data identity during bootstrap, fallback, and layout saves.
- `useTradingDomainStore` no longer persists full trades/accounts into global localStorage.
- Public trader profile reads now fail closed unless the live schema has `showOnLeaderboard` and the target user has explicitly opted in.
- Rithmic credential local storage now loads encrypted records correctly, decrypts only for the current session key, and stops writing new globally generated local encryption keys.
- Rithmic sync server action now stores token fields through the encrypted token envelope instead of mass-assigning arbitrary synchronization fields.
- Tradovate token storage no longer stores plaintext tokens when token encryption is enabled.
- Tradovate token-renewal cron now reads encrypted token envelopes, clears all token envelope fields on invalid state, and writes renewed tokens through the same encrypted envelope.
- Client persisted stores were trimmed so private user/account payloads are session-only: analysis payloads, account order/group expansion, daily tick target data, Tradovate account/auth state, equity selected accounts, and table filters no longer rehydrate across users.
- `resetUser()` now clears session-scoped in-memory stores and legacy sensitive localStorage/sessionStorage keys so logout/account-switch cannot rehydrate old user payloads.
- DataProvider trade mutations now clear IndexedDB trade caches using the active database user id, matching the cache write key and fixing stale cache survival for divergent auth/database ids.
- DataProvider development cache writes now also use the active database user id instead of the Supabase auth id.
- Dashboard browser caches are cleared after account, group, payout, first-connection, and data-management mutations so stale IndexedDB snapshots cannot rehydrate outdated account/group/user data.
- User-data-only refreshes now write a fresh `user_data` IndexedDB snapshot after successful server refreshes.
- Dashboard bootstrap cache tags now include both database user id and auth user id, allowing trade/user-data and layout mutations to invalidate the private SSR payload correctly.
- Dashboard layout version cache invalidation now uses the database user id for equity-chart invalidation instead of the auth-keyed layout id.
- Public trader profiles no longer have any demo/fallback rendering path; they render only opted-in live users and otherwise fail closed.
- Leaderboard database/schema outage paths now return explicit empty entries, not demo-labelled fallbacks.
- The localized embed route no longer boots with generated trades in production; generated data requires explicit `?demo=true` or development mode, while parent-supplied `ADD_TRADES` data still works.
- Cron/service route handlers that read request auth now call `connection()` explicitly to avoid static prerender analysis drift.
- `/api/ready` is now publicly reachable as an infrastructure probe while returning sanitized dependency errors only.
- `/api/email/welcome` is classified as a public webhook route so its own bearer/secret validation can run instead of being blocked by Supabase-session proxy auth.
- Proxy cron-token comparison is timing-safe for both bearer tokens and the legacy `x-vercel-cron` header.

## High-Risk Findings

- IndexedDB cache stores user data and trades by database user id. Known dashboard/account/group/data-management mutation paths now clear the same database-id cache keys; remaining risk is unreviewed route-local mutation surfaces outside the main dashboard provider.
- `server/journal.ts` uses `console.error` and a daily `Mood` row as the journal storage model. It cannot satisfy a real Notes-style split-view journal without new action/model work.
- Home demo is an iframe to `/hyperframes/qunt-edge-promo/index.html`, not an interactive app-native demo.
- Public profile route metadata exists but is not share-sheet/native-share ready.
- Component guidance conflict: root `AGENTS.md` says Electric Obsidian cobalt `oklch` surfaces are current; `components/ui/AGENTS.md` still says older monochrome/white token rules. Root guidance is treated as authoritative.
- Production build/start smoke re-verification is currently blocked by the external escalation usage limit in this environment. Previous build and smoke passed before the latest storage/token patch; typecheck and full Vitest pass after it.

## Responsive And Split-View Candidates

- Most likely mobile/overflow audit targets: dashboard settings, dashboard data, dashboard strategies, embed page, admin prop firm pages, leaderboard, public trader profile, blogs/update detail pages.
- Mandatory split-view redesign targets: dashboard trader profile, new notes/journal page, dashboard data/table views, team trader/member views, admin list/detail forms where tables dominate.
- Mandatory home/demo redesign target: `app/[locale]/(home)/components/HomeContent.tsx` plus `ProductDemoPlayer.tsx`.

## Ordered Repair Backlog

1. Finish Phase 1 audit for remaining route handlers, webhook/payment flows, and integration persistence.
2. Sweep route-local mutation surfaces outside the main dashboard provider for cache/user-id drift.
3. Standardize remaining API error envelopes and remove noisy test/runtime console paths where feasible.
4. Re-run production build and smoke once escalation is available again.
5. Only then move into SSR/CSR boundary fixes and shared shell/design-system changes.
