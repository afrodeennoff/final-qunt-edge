# Delivery Lessons

**Last Updated:** 2026-04-01

---

## NEW (2026-04-01): Screenshot-reported sidebar bugs must be split by owning shell before editing

### Mistake
Different sidebar complaints from the home page and dashboard were initially treated as one shared bug, which risks fixing the wrong layer and wasting time.

### Root Cause
The screenshots were not traced back to their owning layouts first. In this repo, the home page can mount the marketing sidebar while the dashboard uses a separate authenticated shell and shared sidebar primitive.

### Rule
When a user reports a broken sidebar from screenshots, identify the exact surface first (`(home)`, `(landing)`, `dashboard`, `teams`, `admin`) and trace the mounted sidebar component/layout before changing code. Do not merge visually similar sidebar issues across different shells.

### Example
```text
Home page screenshot -> check app/[locale]/(home)/layout.tsx and MarketingLayoutShell
Dashboard screenshot -> check app/[locale]/dashboard/layout.tsx and components/ui/sidebar.tsx
```

---

## NEW (2026-04-01): Sidebar active pills on dark surfaces must keep foreground text, not accent-foreground text

### Mistake
The sidebar nav used shadcn active-state text semantics tied to `sidebar-accent-foreground`, which became dark-on-dark on warm dashboard themes.

### Root Cause
`SidebarMenuButton` assumed the active background would be a strong accent surface, but this app uses subtle dark tinted pills in the sidebar. On warm themes, accent-foreground is not readable on those darker surfaces.

### Rule
For dashboard sidebars on dark surfaces, active and hover menu text must stay on `sidebar-foreground`. Use accent/primary only for tint backgrounds, borders, and icon emphasis, not for the main active text color.

### Example
```tsx
// GOOD
data-[active=true]:bg-sidebar-primary/14
data-[active=true]:text-sidebar-foreground
```

---

## NEW (2026-04-01): The home page must opt out of the marketing landing sidebar explicitly

### Mistake
The home page rendered the marketing `LandingSidebar` because it reused `MarketingLayoutShell`, which always mounted that sidebar.

### Root Cause
The marketing shell did not support per-layout sidebar opt-out, so the home layout inherited a navigation pattern that the home page should not show.

### Rule
Keep `MarketingLayoutShell` configurable. The home layout must pass `showSidebar={false}` so the landing sidebar does not appear on the home page.

### Example
```tsx
<MarketingLayoutShell showSidebar={false}>
  {children}
</MarketingLayoutShell>
```

---

## NEW (2026-04-01): Safari dashboard sidebars must stay in layout flow, not as a split gap plus fixed panel

### Mistake
The desktop sidebar reserved width with one element but rendered the visible sidebar as a separate fixed layer, which drifted out of alignment on Safari dashboard views.

### Root Cause
The split layout made the visual sidebar depend on fixed-position behavior that did not stay aligned with the layout column in the affected browser/rendering path.

### Rule
For this project’s desktop shells, keep the visible sidebar in layout flow with a sticky full-height panel. Do not reintroduce a separate fixed desktop sidebar layer unless Safari alignment is reverified.

### Example
```tsx
// GOOD
<div className="relative hidden h-svh w-(--sidebar-width) overflow-hidden md:block">
  <div className="sticky top-0 flex h-svh w-full">
    ...
  </div>
</div>
```

---

## NEW (2026-04-01): Optional live-schema columns must be probed before Prisma queries touch them on production paths

### Mistake
Production dashboard code queried `User.showOnLeaderboard` directly even though the live database schema did not include that column, which caused runtime Prisma failures on trader-profile requests.

### Root Cause
Code assumed the deployed schema always matched the application schema and did not guard optional or newly introduced columns on live production read/write paths.

### Rule
If a production-critical Prisma path depends on a column that may be absent on the live database, probe column availability first and degrade explicitly. Do not issue direct Prisma reads/writes against an unverified optional column.

### Example
```ts
// GOOD
if (!(await isPrismaColumnAvailable('User', 'showOnLeaderboard'))) {
  return { showOnLeaderboard: false }
}
```

---

## NEW (2026-04-01): Production deploys must come from a clean verified tree when the main worktree is dirty

### Mistake
The repository had many unrelated local modifications, so deploying straight from the main worktree would have mixed verified fixes with unverified changes.

### Root Cause
Deployment flow did not account for dirty-worktree isolation when hotfixing a production issue.

### Rule
When production needs a targeted fix and the main worktree has unrelated changes, create a clean worktree from the intended base, apply only the verified patch subset there, verify again, and deploy from that clean tree.

### Example
```bash
git worktree add --detach /tmp/qunt-edge-deploy HEAD
# apply only verified hotfix files
cd /tmp/qunt-edge-deploy
npm run build
vercel deploy --prod
```

---

## NEW (2026-04-01): Legacy localized `/[locale]/import` must stay a page redirect in this repo

### Mistake
The legacy localized import redirect existed as `app/[locale]/(authentication)/import/route.ts`, which broke this repo’s build/page-data collection path during deployment.

### Root Cause
The redirect was implemented as a route handler even though this path behaves as a localized document route in the App Router build.

### Rule
Keep the legacy localized `/{locale}/import` redirect as a `page.tsx` that calls `redirect()`. Do not reintroduce it as a `route.ts` handler in this repo unless the build path is reverified end to end.

### Example
```tsx
export default async function LegacyImportRedirect({ params }: Props) {
  const { locale } = await params
  redirect(`/${locale}/authentication`)
}
```

---

## NEW (2026-04-01): UUID dedup requires true randomness, not timestamps

### Mistake
`generateTradeUUID` used `Date.now()` which produces sequential IDs. When `skipDuplicates: true` is used in Prisma `createMany`, sequential IDs from the same millisecond can collide.

### Root Cause
Timestamp-based ID generation was used for dedup purposes, but timestamps are not unique within the same millisecond.

### Rule
For dedup-critical ID generation, use `crypto.randomUUID()` or similar true-random generators. Never use `Date.now()` for IDs that need to be unique across concurrent operations.

### Example
```ts
// BAD
const uuid = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`

// GOOD
const uuid = crypto.randomUUID()
```

---

## NEW (2026-04-01): Webhook mutations must be wrapped in $transaction for atomicity

### Mistake
`handleTeamMembershipActivated` and `handleBusinessMembershipActivated` performed multiple Prisma writes without `$transaction`, so partial failures could leave the database in an inconsistent state.

### Root Cause
Each mutation was a separate `await` call with no rollback mechanism. If the second write failed, the first write persisted.

### Rule
When a webhook handler performs 2+ related mutations, wrap them in `prisma.$transaction([...])` so all writes succeed or all roll back.

### Example
```ts
// BAD
await prisma.teamMember.update(...)
await prisma.team.update(...)

// GOOD
await prisma.$transaction([
  prisma.teamMember.update(...),
  prisma.team.update(...),
])
```

---

## NEW (2026-04-01): Grace period subscription processing needs transaction-level status re-check

### Mistake
The grace period loop in `processGracePeriodSubscriptions` checked subscription status outside a transaction, so concurrent processing could handle the same subscription twice.

### Root Cause
No row-level locking or transaction-level re-check meant the status read was stale by the time the mutation executed.

### Rule
For subscription lifecycle processing, use `$transaction` with a status re-check inside the transaction to prevent concurrent double-processing.

### Example
```ts
// BAD
const sub = await prisma.subscription.findFirst({ where: { status: 'GRACE' } })
await prisma.subscription.update({ where: { id: sub.id }, data: { status: 'ACTIVE' } })

// GOOD
await prisma.$transaction(async (tx) => {
  const sub = await tx.subscription.findFirst({ where: { id: subId, status: 'GRACE' } })
  if (!sub) return
  await tx.subscription.update({ where: { id: sub.id }, data: { status: 'ACTIVE' } }
})
```

---

## NEW (2026-04-01): Dashboard widget wrappers must not own chrome in normal mode

### Mistake
Allowed `widget-canvas` wrappers and widget surface components to render full card chrome at the same time, which made dashboard widgets look like they had harsh white double borders.

### Root Cause
Chrome ownership was split across layers: the grid wrapper rendered its own bordered/background panel even though `WidgetShell`, `ChartSurface`, `StatsCard`, and other widget components already render their own surface.

### Rule
On the dashboard, normal-mode widget wrappers must stay visually transparent. The visible border/background belongs to the widget surface component itself. Only customize/edit mode may add an outer drag/edit shell.

### Example
```tsx
// BAD
<div className="rounded-xl border border-v2-border/60 bg-v2-bg-surface/95">
  <ChartSurface />
</div>

// GOOD
<div className="rounded-xl border border-transparent bg-transparent">
  <ChartSurface />
</div>
```

## NEW (2026-04-01): Dashboard header actions must share one subdued pill treatment

### Mistake
Mixed multiple border strengths, shapes, and backgrounds inside the dashboard header action strip, which made the navbar read as broken and inconsistent.

### Root Cause
Each action control evolved with its own local styles instead of following a single header-shell pattern.

### Rule
For dashboard header actions, use one shared rounded pill language with low-opacity borders/backgrounds. Avoid mixing square buttons, heavy outlines, and separate visual systems in the same control row.

### Example
```tsx
// GOOD
<div className="rounded-full border border-v2-border/20 bg-v2-bg-surface/55 p-1">
  <ImportButton />
  <GlobalSyncButton />
  <DailySummaryModal />
</div>
```

## NEW (2026-04-01): Cached Prisma loaders should stay on direct async/await, not promise-chain wrappers

### Mistake
Refactored cached review/stat loader helpers to explicit `Promise` chains, which introduced a repo-level TypeScript regression in `server/firm-reviews.ts`.

### Root Cause
The refactor changed the loader shape without functional benefit and made the cached helper typing more brittle than the original direct async/await form.

### Rule
For cached server read helpers around Prisma, prefer direct `async/await` loaders that return plain objects. Do not rewrite them into `Promise.all(...).then(...)` or `query.then(...)` chains unless there is a concrete reason and the full repo typecheck is re-verified.

### Example
```ts
// GOOD
async function loadFirmReviews(...) {
  const [items, total] = await Promise.all([...])
  return { items, total, page, totalPages }
}
```

## NEW (2026-04-01): Dashboard sidebar navigation must track query-param route changes, not just pathname changes

### Mistake
Sidebar navigation fallback cleanup only listened to `pathname`, while dashboard root navigation changes tabs via query params on the same pathname.

### Root Cause
The sidebar navigation model assumed route changes always move to a different pathname. Dashboard tab navigation uses `/dashboard?tab=*`, so `searchParams` are part of the real route state.

### Rule
For dashboard/sidebar navigation, any pending-navigation cleanup or route-match logic that depends on navigation completion must watch the full route key (`pathname + search`), not just `pathname`.

### Example
```ts
// BAD
useEffect(() => {
  clearNavigationFallbackTimer()
}, [pathname])

// GOOD
useEffect(() => {
  clearNavigationFallbackTimer()
}, [currentRouteKey])
```

## NEW (2026-04-01): Authenticated sidebar shells must restore persisted open/collapsed state from the sidebar cookie

### Mistake
Dashboard, Teams, and Admin shells always booted the sidebar with `defaultOpen={true}`, so hard reloads/direct-entry requests could ignore the user’s persisted sidebar state.

### Root Cause
Sidebar state persistence was only written client-side; the server layouts never read the cookie to seed the initial provider state.

### Rule
Any authenticated layout that mounts a persistent sidebar must read the `sidebar:state` cookie on the server and pass the parsed value into `SidebarProvider`/`SidebarRootProviders`.

### Example
```ts
const cookieStore = await cookies()
const defaultSidebarOpen = parseSidebarStateCookieValue(
  cookieStore.get(SIDEBAR_STATE_COOKIE_NAME)?.value
)

return <SidebarProvider defaultOpen={defaultSidebarOpen}>{children}</SidebarProvider>
```

---

## NEW (2026-04-01): Dashboard chart server reads must be minimal and have a bounded fallback path

### Mistake
Allowed the dashboard equity chart to depend on a heavier-than-needed server read path and an unbounded client wait, which left the UI stuck on `"Loading chart data..."` when the server action was slow or degraded.

### Root Cause
Chart data loading assumed the server action would always return promptly and fetched more database shape than the chart actually needed, increasing pressure on serverless DB connections.

### Rule
For dashboard chart/data endpoints, select only the fields required for computation. If the client already has sufficient local trade data, add a deterministic timeout/fallback path so the UI degrades to local computation instead of indefinite loading.

### Example
```ts
// BAD
const trades = await prisma.trade.findMany({ where: { userId } })
const chartData = await getEquityChartDataAction(...)

// GOOD
const trades = await prisma.trade.findMany({
  where: { userId },
  select: {
    id: true,
    entryDate: true,
    pnl: true,
    commission: true,
  },
})
const chartData = await Promise.race([
  getEquityChartDataAction(...),
  timeoutAfter(12000),
])
```

## NEW (2026-04-01): Keep this repo on npm-only Vercel install/build commands unless the user explicitly changes package-manager policy

### Mistake
Left Bun in `vercel.json` install/build fallbacks after the user explicitly asked for npm-only build execution.

### Root Cause
Earlier optimization work treated package-manager flexibility as harmless, but in this repo it created avoidable divergence from the requested and verified build path.

### Rule
For this project, keep Vercel `installCommand` and `buildCommand` on npm-only commands unless the user explicitly approves a package-manager change and the new path is re-verified.

### Example
```json
// BAD
{
  "installCommand": "bun install || npm install",
  "buildCommand": "bun run build || npm run build"
}

// GOOD
{
  "installCommand": "npm install --no-audit --no-fund",
  "buildCommand": "npm run build"
}
```

---

## NEW (2026-04-01): Serverless Prisma runtime must not reserve oversized minimum pools

### Mistake
Used production Prisma pool defaults sized like a long-lived server (`max=20`, `min=5`) inside Vercel serverless functions.

### Root Cause
Pool tuning assumed a persistent Node server. In serverless, each warm function instance can keep idle connections open, so a non-zero minimum pool scales connection pressure with instance count.

### Rule
For Vercel serverless runtime, keep Prisma runtime pool defaults small and clamp env overrides to safe caps. Default to `min=0` and a low `max` unless a measured workload proves otherwise.

### Example
```ts
// BAD
const defaultPoolMax = isProduction ? 20 : 5
const defaultPoolMin = isProduction ? 5 : 2

// GOOD
const defaultPoolMax = isProduction ? 5 : 5
const defaultPoolMin = isProduction ? 0 : 2
```

## NEW (2026-04-01): Cron auth should validate documented bearer-secret flow first

### Mistake
Allowed cron auth logic to diverge across routes and treat a custom header path as a primary mechanism instead of first honoring the documented bearer-secret request.

### Root Cause
Cron-specific auth evolved separately from generic service auth, so route behavior drifted and became harder to reason about.

### Rule
For Vercel cron routes, validate `Authorization: Bearer ${CRON_SECRET}` first. Only keep `x-vercel-cron` support as an explicit compatibility fallback when a dedicated legacy secret is configured.

### Example
```ts
// GOOD
return requireServiceAuth(request.headers.get('authorization'), {
  requestId,
  serviceName,
  secretEnvKey: 'CRON_SECRET',
  allowVercelCron: false,
})
```

---

## NEW (2026-04-01): Do not disable `cacheComponents` in a codebase that already uses `'use cache'`

### Mistake
Set `cacheComponents` to false-by-default while server modules still used `'use cache'`, which caused immediate compile failure across multiple server files.

### Root Cause
Tried to match old build behavior by toggling framework mode instead of preserving the cache model required by existing data-layer directives.

### Rule
If any production path uses `'use cache'`, keep `cacheComponents` enabled by default. Only allow explicit opt-out for controlled experiments that remove/replace `'use cache'` usage first.

### Example
```ts
// BAD: default false in a repo using 'use cache'
cacheComponents: process.env.NEXT_CACHE_COMPONENTS === 'true'

// GOOD: default enabled with explicit override
cacheComponents: process.env.NEXT_CACHE_COMPONENTS !== 'false'
```

## NEW (2026-04-01): Treat missing `_ssgManifest.js` at build finalization as transient .next artifact race

### Mistake
Allowed build pipeline to fail hard on finalization ENOENT for `.next/static/**/_ssgManifest.js` after full static generation completed.

### Root Cause
Retry wrapper only matched `_buildManifest`/`pages-manifest`/`proxy` missing artifact patterns, so a similar `_ssgManifest` race path was uncaught.

### Rule
When robust build retries are used, include `_ssgManifest.js` (and temp variants) in transient ENOENT matcher patterns.

### Example
```text
Error: ENOENT: no such file or directory, open '.next/static/<hash>/_ssgManifest.js'
```

---

## NEW (2026-04-01): Shared resolver migrations must preserve action call-contracts and query cadence

### Mistake
Replaced `teams/actions/user.ts` request-user lookup with `resolveTeamUserId`, which changed Prisma query cadence and broke existing trader VaR action tests (`success` flipped false in 3 cases).

### Root Cause
Resolver reuse was applied without validating call-level behavior assumptions in dependent actions/tests (mock sequencing and lookup order expectations).

### Rule
When swapping a local lookup for a shared resolver, verify both logical output and call-contract compatibility for the action path (including test mock order). If cadence changes break stable behavior, keep the local lookup or add compatibility fallback.

### Example
```ts
// BAD: direct replacement without contract verification
return await resolveTeamUserId(user.id)

// GOOD: preserve proven action semantics for request-user path
const mappedUser = await prisma.user.findUnique({ where: { auth_user_id: user.id }, select: { id: true } })
if (mappedUser?.id) return mappedUser.id
const fallbackUser = await prisma.user.findUnique({ where: { id: user.id }, select: { id: true } })
return fallbackUser?.id ?? null
```

## NEW (2026-04-01): User-id resolver precedence must stay consistent across auth/trades/teams modules

### Mistake
`getDatabaseUserId` was updated to prefer divergent `auth_user_id` mappings, but writable/team resolvers still preferred raw `id` first, causing `Forbidden` checks and empty dashboard data for accounts with legacy-mapped user rows.

### Root Cause
User-id resolution logic was duplicated across modules with different precedence, creating identity drift between auth bootstrap and mutation/read paths.

### Rule
Any resolver that maps auth user id -> database `User.id` must use identical precedence: prefer divergent `auth_user_id` mapping first, then raw `id`, then same-id `auth_user_id` fallback.

### Example
```ts
// BAD
if (byId?.id) return byId.id
if (byAuthId?.id) return byAuthId.id

// GOOD
if (byAuthId?.id && byAuthId.id !== rawUserId) return byAuthId.id
if (byId?.id) return byId.id
if (byAuthId?.id) return byAuthId.id
```

## NEW (2026-04-01): Dashboard layout fetch failures must fail-soft to defaults

### Mistake
`DataProvider` only handled successful/empty `getDashboardLayout` responses. If the layout fetch rejected (timeout/network/server error), `dashboardLayout` could remain `null`, leaving `WidgetCanvas` in perpetual loading.

### Root Cause
Error-path handling was incomplete for a required bootstrap dependency. The UI shell depended on layout presence but had no deterministic fallback for rejected fetches.

### Rule
Any required dashboard bootstrap fetch (`getDashboardLayout`) must explicitly handle rejected promises and seed a safe default layout immediately.

### Example
```ts
// BAD
if (dashboardLayoutResult.status === "fulfilled") {
  // ...
}

// GOOD
if (dashboardLayoutResult.status === "fulfilled") {
  // ...
} else if (dashboardLayoutResult.status === "rejected") {
  setDashboardLayout(defaultLayoutForUser)
}
```

---

## NEW (2026-04-01): Do not lazy-load core dashboard sidebar shell with placeholder rails

### Mistake
Dashboard shell used a dynamic sidebar import with a narrow loading placeholder (`w-14/lg:w-[72px]`). In failure/slow-chunk paths, users saw only the header trigger and no actual navigation rail.

### Root Cause
A core navigation surface was treated as optional/lazy UI and given a fallback skeleton that visually resembles a collapsed rail, masking the real failure mode.

### Rule
For authenticated dashboard shells, mount the primary sidebar directly (static import) so navigation is always rendered as part of the initial shell contract.

### Example
```tsx
// BAD
const DashboardSidebar = dynamic(() => import('@/components/sidebar/dashboard-sidebar'), {
  loading: () => <div className="hidden md:block w-14 lg:w-[72px]" />,
})

// GOOD
import { DashboardSidebar } from '@/components/sidebar/dashboard-sidebar'
```

---

## NEW (2026-04-01): Mobile/desktop mode must use media-query truth, not innerWidth snapshots

### Mistake
`useIsMobile` relied on `window.innerWidth` snapshots, which can be transiently wrong in some browser lifecycle moments and classify desktop as mobile.

### Root Cause
Viewport mode source-of-truth drift: JS width snapshots were used instead of the already-constructed media query match state.

### Rule
When using `matchMedia`, initialize and update responsive state from `mql.matches` / `event.matches` to keep behavior aligned with CSS breakpoints.

### Example
```tsx
// BAD
setIsMobile(window.innerWidth < MOBILE_BREAKPOINT + 1)

// GOOD
setIsMobile(mql.matches)
```

---

## NEW (2026-03-31): Env example sync must include runtime code references, not just deployed envs

### Mistake
I initially compared `.env.example` only against the live Vercel env list and almost missed runtime env refs consumed directly by code (`NEXT_PUBLIC_UI_V2_ENABLED`, `HEALTH_DETAILS_PUBLIC`, onboarding/tutorial URLs, broker API host, and similar keys).

### Root Cause
I treated the deployment env inventory as the source of truth instead of intersecting it with actual `process.env` usage in runtime code.

### Rule
When updating `.env.example`, always compare the file against both the live Vercel project envs and runtime `process.env` usage in app/server/lib code. If code reads a key, the example must show it, even if it is not currently set in Vercel.

### Example
```bash
# BAD: only diffing against Vercel envs
vercel env list

# GOOD: diff Vercel envs + runtime env refs
rg -o 'process\\.env\\.[A-Z0-9_]+' app server lib components context store scripts --glob '!**/*.md'
```

---

## NEW (2026-03-31): Never use full-row Prisma user reads in auth sync paths

### Mistake
`ensureUserInDatabase` used `prisma.user.findUnique/update/create` without explicit `select`, so Prisma attempted to read all `User` columns. In drifted DBs, missing optional/new columns triggered `P2022` and broke auth callback.

### Root Cause
Auth sync assumed schema parity and relied on Prisma’s default full-row materialization instead of selecting only required fields.

### Rule
In auth-critical `User` sync/read paths, always use explicit minimal `select` projections (`id`, `email`, `language` or smaller). Add compatibility fallback for `auth_user_id` lookups when schema mismatch is detected.

### Example
```ts
// BAD
await prisma.user.findUnique({ where: { auth_user_id: user.id } })

// GOOD
await prisma.user.findUnique({
  where: { auth_user_id: user.id },
  select: { id: true, email: true, language: true },
})
```

---

## NEW (2026-03-30): motion.tr does NOT exist in framer-motion v11 — use motion('tr') factory

### Mistake
`ComparisonSection.tsx` used `<motion.tr>` assuming it works like `motion.div`. In framer-motion v11, `motion.tr` is literally `undefined`. This caused React error #130 ("Element type is invalid: expected a string or class/function but got: undefined") pointing at ComparisonSection.

### Root Cause
framer-motion v11 only has predefined variants for standard HTML elements. `<tr>` (table row) is not in the supported list. Only `motion.div`, `motion.span`, `motion.button`, etc. exist directly.

### Fix
```tsx
// WRONG
import { motion } from 'framer-motion'
<motion.tr ...>

// CORRECT
const MotionTr = motion('tr')
<MotionTr ...>
```
Also need `'use client'` if calling `motion()` at module scope (since framer-motion is client-only).

### Rule
When animating table rows, use `motion('tr', {...})` factory. Same applies for any HTML element that doesn't have a direct `motion.*` variant.

---

## NEW (2026-03-30): Verify gap analysis claims against actual code before planning implementation

### Mistake
Gap analysis claimed 4 server delete functions were missing ownership validation (`deleteLayoutVersion`, `deleteMindset`, `deleteRithmicSynchronizations`, `deleteTradovateSynchronizations`), requiring security hardening implementation.

### Root Cause
The gap analysis used incorrect function names and didn't verify current code state before reporting vulnerabilities. In reality: `deleteLayoutVersion()` doesn't exist, `deleteMindset()` already has `userId` in `findFirst`, `removeRithmicSynchronization()` already has `userId` in `deleteMany`, `removeTradovateToken()` already has `userId` in `deleteMany`.

### Rule
Before claiming a security gap exists, always:
1. Verify the function exists with the claimed name
2. Read the actual implementation
3. Confirm the ownership check is truly missing
4. A query-level `userId` filter in `where`/`findFirst`/`deleteMany` IS a valid ownership check

### Example
```typescript
// REPORTED MISSING: deleteLayoutVersion() — FUNCTION DOES NOT EXIST
// REPORTED MISSING: deleteRithmicSynchronizations() — WRONG NAME (actual: removeRithmicSynchronization)
// REPORTED MISSING: deleteMindset() — ALREADY HAS userId in findFirst where clause
```

---

## NEW (2026-03-30): Pre-existing task descriptions may describe already-completed work

### Mistake
Home page component edits replaced `Card` imports with `CardV2` symbols but left malformed JSX (`CardV2 ...>` without opening `<`) and truncated closing blocks, causing widespread TypeScript parse failures after the first reported error.

### Root Cause
A bulk text migration changed identifiers without syntax-aware codemods or a full-project typecheck pass before shipping.

### Rule
For any JSX component migration (especially `Card`/`CardV2`), perform syntax-safe edits only and always run full `npm run -s typecheck` immediately after the migration; do not stop at the first surfaced error.

### Example
```tsx
// BAD
CardV2 variant="glass">...</CardV2>

// GOOD
<CardV2 variant="glass">...</CardV2>
```

---

## NEW (2026-03-30): Alias slug redirects must only target resolvable canonical firm records

### Mistake
`/[locale]/firm/[slug]` redirected alias slugs (for example `apex`) to canonical slugs even when the canonical DB firm row was unavailable, which produced broken firm paths and repeated not-found behavior.

### Root Cause
Redirect logic used verified-profile alias mapping without validating that the mapped canonical slug could be resolved by live firm data.

### Rule
For firm detail routing, perform alias-to-canonical redirect only after successful canonical firm lookup; if canonical lookup fails, redirect to `/${locale}/propfirms` instead of chaining to an unresolved firm slug.

### Example
```ts
// BAD
if (matchedProfile) redirect(`/${locale}/firm/${matchedProfile.slug}`)

// GOOD
if (matchedProfile) {
  const canonicalFirm = await getUnifiedFirmBySlug(matchedProfile.slug)
  if (canonicalFirm) redirect(`/${locale}/firm/${canonicalFirm.slug}`)
}
redirect(`/${locale}/propfirms`)
```

---

## NEW (2026-03-29): Wide comparison tables must never be the only rendered path below desktop breakpoints

### Mistake
Deals compare and leaderboard relied on wide table layouts while hiding table sections at smaller breakpoints, leaving cramped horizontal scroll or no comparison content for mobile users.

### Root Cause
Desktop-first table implementations were added without mandatory mobile/tablet fallback components, and breakpoint visibility (`hidden lg:block`) was not paired with an alternate render path.

### Rule
Any table requiring fixed minimum width (`min-w-[...]`) must provide an explicit card/stack fallback for sub-desktop breakpoints; never gate the only data view behind `lg+` visibility.

### Example
```tsx
// BAD
<div className="hidden lg:block">
  <table className="min-w-[880px]">...</table>
</div>

// GOOD
<div className="grid gap-3 lg:hidden">{/* mobile cards */}</div>
<div className="hidden lg:block">
  <table className="min-w-[880px]">...</table>
</div>
```

---

## NEW (2026-03-29): Public API allowlists must use segment-safe matching and explicit unauthenticated route entries

### Mistake
Proxy public API matching relied on mixed exact/trailing-slash checks (`/api/og/`), so `/api/og` could be misclassified as private and routed into auth checks. Public token/report endpoints (`/api/email/unsubscribe`, `/api/csp-report`) were also missing from the allowlist.

### Root Cause
Route classification mixed exact-string and prefix-only logic, and the public API list was not treated as a strict source of truth for all intentionally unauthenticated API endpoints.

### Rule
For proxy route classification, define all public API endpoints in `PUBLIC_API_PATH_PREFIXES` and evaluate them with segment-safe matching (`pathMatchesPrefix`) so exact and nested paths cannot diverge by trailing slash.

### Example
```ts
// BAD
const PUBLIC_API_PATH_PREFIXES = ["/api/og/"]
pathname === route || pathname.startsWith(route)

// GOOD
const PUBLIC_API_PATH_PREFIXES = ["/api/og", "/api/email/unsubscribe", "/api/csp-report"]
PUBLIC_API_PATH_PREFIXES.some((prefix) => pathMatchesPrefix(pathname, prefix))
```

---

## NEW (2026-03-29): Shared layout DB reads must be fail-soft during prerender/export

### Mistake
A shared marketing layout read path (`RollingAdBanner -> server/prop-firms`) executed `prisma.propFirm.findMany()` without guarding schema mismatch/unavailable DB errors, causing Vercel prerender to fail on `/fr` with `P2021` (`public.PropFirm` missing).

### Root Cause
The helper assumed that `hasConfiguredDatabaseConnection` was sufficient for safety and did not treat runtime schema drift (`P2021`/missing table) as an expected degraded-mode condition for public prerender paths.

### Rule
Any server read helper used by shared layouts/public prerender surfaces must catch Prisma schema/connection availability failures and return deterministic fallback/null values instead of throwing.

### Example
```ts
// BAD
const firms = await prisma.propFirm.findMany(...)

// GOOD
try {
  return await prisma.propFirm.findMany(...)
} catch (error) {
  if (!isUnavailablePrismaError(error)) throw error
  return fallbackRows
}
```

---

## NEW (2026-03-29): Prisma unavailable guards must include timeout-based connection failures

### Mistake
Prisma guards handled schema mismatch and basic connection errors (`P1001`, `ECONNREFUSED`) but missed timeout-only failures (`timeout exceeded when trying to connect`), which still crashed prerender.

### Root Cause
Guard logic relied too heavily on error codes; some Prisma connection failures surface only via message text without expected error codes.

### Rule
When implementing fail-soft Prisma read paths for build/prerender surfaces, include timeout message signatures in unavailable-error detection and verify with real build logs.

### Example
```ts
return (
  code === 'P1001' ||
  code === 'ECONNREFUSED' ||
  message.includes('timeout exceeded when trying to connect') ||
  message.includes('timed out when trying to connect')
)
```

---

## NEW (2026-03-29): Private API auth cannot rely on middleware bearer presence

### Mistake
Private API protection accepted any `Authorization: Bearer ...` header in proxy logic, and some deals routes had no route-level auth check.

### Root Cause
Authentication was treated as a transport/header-shape check instead of identity verification. This created a false sense of protection and left route handlers dependent on middleware behavior.

### Rule
For private APIs, always verify identity cryptographically (Supabase session/JWT or route-specific secure token verification) and enforce route-level auth in the handler itself. Middleware may add defense-in-depth, but route handlers must remain secure if middleware is bypassed.

### Example
```ts
// BAD: header presence only
if (!authHeader?.startsWith('Bearer ')) return 401

// GOOD: verify authenticated user
const { data: { user } } = token
  ? await supabase.auth.getUser(token)
  : await supabase.auth.getUser()
if (!user?.id) return 401
```

---

## NEW (2026-03-29): Never synthesize business-facing prop firm data when source systems are unavailable

### Mistake
Deals/catalogue paths returned fabricated fallback values (payouts, discounts, fees, profile fields) when DB access was unavailable.

### Root Cause
Fallback behavior prioritized non-empty UI over source-truth integrity, causing confidence-damaging mismatches between displayed values and real data.

### Rule
If authoritative data sources are unavailable, return explicit empty/unavailable states (`[]`/`null`) instead of invented financial/business metrics.

### Example
```ts
// BAD
if (!hasConfiguredDatabaseConnection) return syntheticDealsFromStaticCopy()

// GOOD
if (!hasConfiguredDatabaseConnection) return []
```

---

## Lesson: Do not claim work is finished when it is partial

### What happened
I reported completion while significant performance fixes (data-provider split + heavy computation memoization) were still pending.

### Fix
Explicitly state remaining work and ask for confirmation before claiming completion.

### Rule
Never mark work finished unless all agreed fixes are implemented and verified.

---

## NEW (2026-03-29): Next.js proxy artifact ENOENT is a transient build race, not a middleware migration trigger

### Mistake
Attempted to switch `proxy.ts` to `middleware.ts` to bypass a `.next/server/proxy.js` ENOENT build failure.

### Root Cause
The real issue was a transient `.next` artifact race during Next build finalization. Migrating to `middleware.ts` changed runtime constraints and introduced unrelated `node:crypto` bundling errors.

### Rule
If Next build fails with missing `.next/server/proxy.js` during finalize/trace steps, keep `proxy.ts` and harden/retry the build wrapper for that specific transient artifact race. Do not migrate middleware conventions as a first response.

### Example
```text
Error: ENOENT ... rename '.next/server/proxy.js' -> '.next/server/middleware.js'
```

---

## NEW (2026-03-28): Cache Components mode forbids route segment config (`dynamic`/`revalidate`)

### Mistake
Reintroducing `export const dynamic` / `export const revalidate` in App Router route handlers after enabling Cache Components.

### Root Cause
Assumed old route config remained valid, but Next.js 16 with `nextConfig.cacheComponents` rejects those segment config exports at compile time.

### Rule
When Cache Components are enabled, do not add `dynamic`/`revalidate` segment exports to route files; use request boundaries (`connection`) and cache directives (`use cache`, `cacheLife`, `cacheTag`) instead.

### Example
```ts
// BAD in cacheComponents mode:
export const dynamic = 'force-dynamic'
export const revalidate = 3600

// GOOD:
// no segment exports; rely on runtime request context + cache directives inside data layer
```

---

## NEW (2026-03-28): Build verification needs a reachable local PostgreSQL service

### Mistake
Treating `npm run build` as a code regression before confirming the local Postgres dependency was available.

### Root Cause
`scripts/sync-stack.mjs` runs Prisma migration status against `localhost:5432` by default, and no PostgreSQL server was listening in this workspace.

### Rule
Before attributing a build failure to code, verify every local service the build depends on is reachable; if one is missing, record it as an environment blocker instead of changing unrelated code.

### Example
```bash
node -e "const net=require('net');const s=new net.Socket();s.setTimeout(1000);s.on('error',e=>console.log(e.code));s.connect(5432,'127.0.0.1')"
# Output: ECONNREFUSED
```

---

## NEW (2026-03-27): Dead feature flags need cleanup

### What happened
During feature flag investigation, found 2 flags (`ENABLE_DEFERRED_COMPUTATIONS`, `ENABLE_LAZY_LOADING`) that are defined in `lib/feature-flags.ts` but never consumed anywhere in the codebase. The planned implementations (hooks) were never created.

### Root Cause
Flags were added as part of a planned feature flag system but the corresponding implementation code was never built. They remain as dead code.

### Rule
When adding feature flags to a planned feature system, either:
1. Implement the consuming code alongside the flag definition, OR
2. Document the flag as "PLANNED" with a link to the implementation ticket

### Example
```typescript
// BAD: Flag defined but not consumed
ENABLE_DEFERRED_COMPUTATIONS: process.env.NEXT_PUBLIC_ENABLE_DEFERRED_COMPUTATIONS === 'true',
// No usage of this flag anywhere in codebase

// GOOD: Flag consumed immediately or documented
// TODO(DEFERRED-COMPUTATIONS): Implement hooks/use-deferred-computation.ts
// Ref: docs/superpowers/plans/2026-03-12-performance-optimization-production.md#task-22
```

---

## NEW (2026-03-27): Subagent JSX renames — always verify imports AND tags together

### What happened
Migration agents updated import paths (`@/components/ui/button` → `@/components/ui/v2`) but missed JSX tag renames (`<Button>` → `<ButtonV2>`). 100+ TypeScript errors resulted.

### Root Cause
The migration was done in two separate passes: (1) imports, (2) JSX. But the agents only handled imports.

### Rule
When migrating component tags:
1. Always rename BOTH import AND JSX tag in the same pass
2. Or: do JSX tags FIRST, then imports
3. NEVER do only imports without JSX tag changes
4. Always run `npm run typecheck` after any bulk migration to catch mismatches

### Example
```typescript
// Do BOTH at once:
import { ButtonV2 } from '@/components/ui/v2'  // import
<ButtonV2 />  // JSX tag
// NOT: import ButtonV2 but <Button /> in JSX
```

---

## NEW (2026-03-27): Tailwind v4 `@utility` cannot be nested inside `@layer`

### What happened
Previous session restructured `globals.css` by replacing `:root { }` with `.dark { }` and extending it to cover more content. `@utility focus-ring` ended up inside a `@layer base` block (lines 314-537), causing build failure.

### Root Cause
Tailwind v4: `@utility` directives must be at the top level of the CSS file. They cannot be inside `@layer base`, `@layer components`, or any other CSS block.

### Rule
When editing `globals.css`:
1. `@utility` directives must be at TOP LEVEL (no indentation, not inside any block)
2. Use `awk` or grep to find which block a line is inside: `awk '/^@layer/{l=NR} /^\}/{if(l&&NR>l&&NR<835)print l}' globals.css`
3. If you see `@utility` inside a `@layer`, MOVE it outside the layer (after the layer's closing `}`)
4. Pre-existing `.focus-ring` class at top level is safer than `@utility focus-ring` inside a layer

### Fix
Move `@utility focus-ring { ... }` from inside `@layer base` to after the layer closes.

---

## NEW (2026-03-28): Subagent HSL refactoring — fix agent mistakes immediately after they complete

### What happened
Subagents were delegated to replace `bg-[hsl(var(--primary)/...)]` patterns with semantic tokens. They completed but made mistakes:
- Landing agent created `via-border-primary/35` (wrong — confused `--primary` with `--border`)
- Landing agent missed `bg-[hsl(var(--primary-foreground)/0.2)]` in hero.tsx
- Landing agent missed `bg-[hsl(var(--foreground)/0.04)]` in hero.tsx

### Root Cause
The prompt mapping only listed `--primary` patterns, but the agent didn't check for `--primary-foreground` and `--foreground` variants that also need conversion.

### Rule
After any subagent bulk refactoring:
1. Always run follow-up grep to find remaining patterns the agent may have missed
2. Check for variants: `--foreground`, `--primary-foreground`, `--secondary-foreground` alongside `--primary` and `--secondary`
3. Fix agent mistakes immediately while the work is fresh
4. For HSL patterns: verify with `grep -rn '\[hsl(var(--' --include="*.tsx"` after delegation

### Example
```bash
# After agent completes, run these to catch misses:
grep -rn '\[hsl(var(--primary' .../components/ --include="*.tsx"
grep -rn '\[hsl(var(--foreground' .../components/ --include="*.tsx"
grep -rn 'via-border-primary\|via-primary-foreground' .../components/ --include="*.tsx"
```

---

## NEW (2026-03-30): Task descriptions may be outdated if work already completed

### Mistake
Task description stated that 6 files contained 12 `console.error` violations, but verification showed all violations were already fixed.

### Root Cause
Task tracking was created based on an earlier code state that has since been corrected. The fix was already applied but not reflected in the task description.

### Rule
Before executing a task, always verify the current state of the files mentioned in the task description using grep/search. Do not assume task descriptions are always up-to-date.

### Example
```bash
# Always verify before starting:
grep -rn "console\.error" "app/[locale]/(landing)/deals/page.tsx" "app/[locale]/(landing)/support/page-client.tsx"

# If no matches found, mark task as already complete and update tracking files
```

---

## NEW (2026-03-28): UltraWork verification — run EXACT verification commands before claiming done

### What happened
RALPH loop flagged verification failures across 6+ iterations. Root cause: my audit commands were imprecise and I was claiming done based on partial audits.

### Root Cause
1. Used `|| echo "NONE"` logic which misleadingly printed "FOUND" for empty results
2. Hex grep patterns matched URL hash fragments (`/#features`) as "hex colors"
3. Only audited a subset of the 17 component groups instead of all of them

### Rule
For design system refactoring audits, use PRECISE verification:
```bash
# Count-based (returns 0 = clean):
grep -c 'pattern' ... --include="*.tsx" | grep -v ':0$'

# OR line-based (empty output = clean):
grep -rn 'pattern' ... --include="*.tsx" | grep -v 'opengraph'
```

### Fix
Run comprehensive 5-point audit after every refactoring session:
1. `grep -c` for hex in className/style → must be 0
2. `grep -c` for non-standard rounded → must be 0 (or 1 with documented intent)
3. `grep -c` for primary/secondary HSL → must be 0
4. `npx tsc --noEmit` → must exit 0
5. Audit ALL 17 component groups individually, not just a sample
