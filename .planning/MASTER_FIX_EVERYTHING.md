# Qunt Edge — Master Fix Everything Plan
**Production-Ready End-to-End Fix**
**Generated:** 2026-04-11
**Scope:** Every page, subpage, button, function, route, widget, and interaction works out of the box.

---

## Inventory

| Surface | Pages | API Routes | Server Actions |
|---------|-------|------------|----------------|
| Home | 1 | 0 | 0 |
| Landing (marketing) | 24 | 0 | 4 |
| Authentication | 4 | 1 | 0 |
| Dashboard | 8 + 28 widgets | 0 | 3 |
| Admin | 10 | 2 | 8 |
| Teams | 8 | 4 | 4 |
| Shared/Embed | 2 | 0 | 0 |
| Server modules | — | — | 25 |
| API routes | — | 57 | 0 |
| **Total** | **57 pages** | **57 routes** | **44 action modules** |

---

## Execution Phases

Each phase is ordered by dependency — later phases depend on earlier ones.

---

### Phase 1: Environment & Build Foundation (unblock everything)

**Goal:** `npm run build`, `npm run typecheck`, `npm run test` all pass cleanly.

#### 1.1 Switch to Node v22
- `nvm use 22` — Node v22 is already installed.
- Update `package.json` `"engines": { "node": ">=20.x" }`.
- This fixes `ERR_REQUIRE_ESM` errors from `@prisma/dev`, `@exodus/bytes`, `html-encoding-sniffer`.

#### 1.2 Fix `scripts/sync-stack.mjs` — graceful Prisma fallback
- Wrap `prisma migrate status` and `prisma migrate deploy` in try/catch.
- When DB is unreachable, log a warning and continue build (per AGENTS.md: "If unavailable, record env blocker, don't treat as code regression").
- Keep `prisma generate` as required (works without DB).

#### 1.3 Exclude `.worktrees/` from vitest
- Add `".worktrees/**"` to `vitest.config.ts` exclude list.
- This eliminates ~17 duplicate test failures from the worktree copy.

#### 1.4 Fix 22 failing tests (main codebase only)

| Test File | Failures | Root Cause | Fix |
|-----------|----------|------------|-----|
| `tests/api/deals-active.test.ts` | 4 | `connection()` called outside request scope | Mock `connection` from `next/server` |
| `tests/api/deals-unified.test.ts` | 4 | Same `connection()` issue | Same mock |
| `tests/community-actions.test.ts` | 3 | `cacheLife()` unavailable in vitest | Add `cacheLife`/`cacheTag` mock to `tests/setup.ts` |
| `tests/leaderboard-query.test.ts` | 6 | Same `cacheLife()` issue | Same mock |
| `lib/__tests__/ibkr-ocr-route.test.ts` | 3 | Test reads `payload.code` but API returns `payload.error.code` | Fix test to read `payload.error.code` |
| `tests/api/auth-callback-route.test.ts` | 2 | Spy expectations don't match current cookie-based auth flow | Update spy targets to match `response.cookies.set` |

**Shared fix — add to `tests/setup.ts`:**
```ts
vi.mock('next/cache', async () => ({
  ...(await vi.importActual('next/cache')),
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}))
```

**Shared fix — mock `connection()` in API route tests:**
```ts
vi.mock('next/server', async () => ({
  ...(await vi.importActual('next/server')),
  connection: vi.fn().mockResolvedValue(undefined),
}))
```

**Validation:** `npm run test` → 0 failures, `npm run typecheck` → clean, `npm run build` → success.

---

### Phase 2: Core Shell & Routing Integrity

**Goal:** Every route resolves correctly. Auth guards work. Redirects are safe. No dead links.

#### 2.1 Proxy (`proxy.ts`) — route classification audit
- Verify all 57 pages are correctly classified as public/private.
- `PRIVATE_DOCUMENT_PATH_PREFIXES` must include: `/dashboard`, `/admin`, `/teams/dashboard`, `/teams/manage`, `/teams/join`.
- `PUBLIC_DOCUMENT_PATH_PREFIXES` must include: `/`, `/authentication`, `/propfirms`, `/deals`, `/blogs`, `/community`, `/pricing`, `/faq`, `/docs`, `/leaderboard`, `/support`, `/privacy`, `/terms`, `/about`, `/newsletter`, `/referral`, `/updates`, `/firm`, `/trader`.
- Shared/embed routes: `/shared/`, `/embed` — public but with different cache policy.
- API auth: all `/api/admin/`, `/api/ai/`, `/api/dashboard/`, `/api/team/`, `/api/whop/`, `/api/mt5/`, `/api/tradovate/`, `/api/rithmic/` must be private.

#### 2.2 Auth redirects
- Unauthenticated dashboard → `/{locale}/authentication?next=/{locale}/dashboard` ✅ (verified)
- Unauthenticated admin → `/{locale}/authentication?next=/{locale}/admin` ✅ (verified)
- Unauthenticated teams → `/{locale}/authentication?next=/{locale}/teams/dashboard` ✅ (verified)
- After login, `next` param redirects back. Verify `withLocalePrefix()` handles all edge cases.
- Forgot-password page links must be locale-prefixed (was broken in session, check if fixed).
- Reset-password page must redirect to dashboard after success.

#### 2.3 Locale safety on all links
- Audit every `<Link href>` and `router.push` in the codebase for locale prefix.
- Common pattern: `/${locale}/path` using `useCurrentLocale()`.
- Check: sidebar nav items, mobile nav items, admin nav, team nav, error boundary "Go home" buttons, auth form redirects.

#### 2.4 404 and error boundaries
- `app/[locale]/[...not-found]/page.tsx` calls `notFound()` → renders `app/not-found.tsx` ✅
- `app/error.tsx` — global error boundary ✅
- `app/[locale]/(landing)/error.tsx` — landing error boundary
- `app/[locale]/admin/error.tsx` — admin error boundary
- `app/[locale]/dashboard/error.tsx` — dashboard error boundary
- `app/[locale]/teams/error.tsx` — teams error boundary
- Verify all error boundaries render correctly in dark theme with working retry/home buttons.

**Validation:** For each of the 57 pages, curl the route and verify: (1) correct HTTP status, (2) auth redirect for private routes, (3) HTML renders for public routes.

---

### Phase 3: Dashboard — All Tabs, Widgets, Actions

**Goal:** Every dashboard tab renders. Every widget loads real data or shows honest empty state. Every button works.

#### 3.1 Dashboard tab system (`dashboard-tab-shell.tsx`)
- **Widgets tab** (`?tab=widgets`): renders `WidgetCanvas` with persisted layout
- **Trades tab** (`?tab=table`): renders `TradeTableReview` with trade table
- **Accounts tab** (`?tab=accounts`): renders `AccountsOverview`
- **Chart tab** (`?tab=chart`): renders `ChartTheFuturePanel`
- Default tab = `widgets` ✅

#### 3.2 Widget Canvas & Registry (28 widget types)
Each widget must: render, load data, show empty state, handle errors.

| Widget | Type | Data Source | Verify |
|--------|------|-------------|--------|
| Smart Insights | `smartInsights` | AI analysis | Renders insights or empty state |
| Weekday PnL Chart | `weekdayPnlChart` | Derived from trades | Chart renders with data |
| PnL Chart | `pnlChart` | Derived from trades | Bar chart renders |
| Time of Day | `timeOfDayChart` | Derived from trades | Chart renders |
| Time in Position | `timeInPositionChart` | Derived from trades | Chart renders |
| Equity Chart | `equityChart` | `server/equity-chart.ts` | Chart with fallback |
| PnL By Side | `pnlBySideChart` | Derived from trades | Chart renders |
| PnL Per Contract | `pnlPerContractChart` | Derived from trades | Chart renders |
| PnL Per Contract Daily | `pnlPerContractDailyChart` | Derived from trades | Chart renders |
| Tick Distribution | `tickDistribution` | Derived from trades | Chart renders |
| Commissions PnL | `commissionsPnl` | Derived from trades | Chart renders |
| Trade Distribution | `tradeDistribution` | Derived from trades | Chart renders |
| Avg Position Time | `averagePositionTime` | Derived from trades | Card renders |
| Cumulative PnL | `cumulativePnl` | Derived from trades | Card renders |
| Long/Short Perf | `longShortPerformance` | Derived from trades | Card renders |
| Trade Performance | `tradePerformance` | Derived from trades | Card renders |
| Winning Streak | `winningStreak` | Derived from trades | Card renders |
| Profit Factor | `profitFactor` | Derived from trades | Card renders |
| Daily Tick Target | `dailyTickTarget` | Derived from trades | Chart renders |
| Statistics | `statisticsWidget` | Derived from trades | Stats grid renders |
| Chat | `chatWidget` | AI chat | Chat interface loads |
| Calendar | `calendarWidget` | Derived from trades | Calendar renders |
| Trade Table Review | `tradeTableReview` | Trades | Table renders |
| Prop Firm | `propFirm` | Prop firm data | Card renders |
| Prop Firm Catalogue | `propFirmCatalogue` | Prop firms list | List renders |
| Time Range Perf | `timeRangePerformance` | Derived from trades | Chart renders |
| Mindset | `mindsetWidget` | Mood data | Mood selector renders |
| Tag Widget | `tagWidget` | Tag data | Tag cloud renders |
| Risk/Reward | `riskRewardRatio` | Derived from trades | Card renders |
| Trading Score | `tradingScore` | `lib/score-calculator.ts` | Score renders |
| Expectancy | `expectancy` | Derived from trades | Card renders |
| Risk Metrics | `riskMetrics` | Derived from trades | Card renders |
| Contract Quantity | `contractQuantity` | Derived from trades | Chart renders |

**Fix for each widget:**
- Verify lazy import resolves (no module not found)
- Verify empty state renders when no trades exist
- Verify loading skeleton shows during data fetch
- Verify error boundary catches and shows retry

#### 3.3 Import Flow — lazy-load heavy processors
**File:** `app/[locale]/dashboard/components/import/config/platforms.tsx`

Currently eagerly imports 15+ processor modules. Convert to dynamic:
```ts
// BEFORE (freeze on mount):
import TradezellaProcessor from '../tradezella/tradezella-processor'
import TradovateProcessor from '../tradovate/tradovate-processor'
// ... 13 more

// AFTER (load on demand):
const TradezellaProcessor = dynamic(() => import('../tradezella/tradezella-processor'), { ssr: false })
const TradovateProcessor = dynamic(() => import('../tradovate/tradovate-processor'), { ssr: false })
// ... etc.
```

Keep `ImportTypeSelection`, `FileUpload`, `HeaderSelection`, `AccountSelection`, `ColumnMapping` as eager (lightweight UI).

#### 3.4 Dashboard header actions
- **Import button** → opens dialog ✅ (after lazy-load fix, no freeze)
- **Filter menu** → opens `FilterCommandMenu` ✅
- **Daily summary modal** → opens `DailySummaryModal`
- **Global sync button** → opens sync options (Tradovate, Rithmic, MT5)
- **Active filter tags** → shows applied filters, click to remove
- **Widget controls** (add widget, share) → opens respective sheets
- **User menu** → logout, timezone, theme

#### 3.5 Dashboard subpages

| Subpage | Key Components | Verify |
|---------|---------------|--------|
| `/dashboard/behavior` | MindsetWidget, AnalysisOverview, ChatWidget | Renders with mood/journal data |
| `/dashboard/billing` | BillingManagement | Shows current plan, Whop checkout |
| `/dashboard/data` | DataManagementCard (accounts tab), TradeTableReview (trades tab) | CRUD for accounts, trade management |
| `/dashboard/import` | Import callback (Tradovate OAuth) | Handles OAuth code exchange |
| `/dashboard/reports` | AnalysisOverview | Full analysis view |
| `/dashboard/settings` | Profile, timezone, theme, teams, danger zone | All settings save correctly |
| `/dashboard/strategies` | TradeTableReview (full-height) | Full trade desk |
| `/dashboard/trader-profile` | TraderProfilePageClient | Profile with score metrics |

#### 3.6 Data Provider integrity
- `context/data-provider.tsx` (2480 lines) — central state management
- `loadData()` must: fetch user, accounts, trades, tags, groups, moods, layout → populate state
- `refreshAllData()` must: invalidate caches, re-fetch all data
- Bootstrap path: server bootstrap payload → initial state → client hydration
- Fallback path: when bootstrap fails, client-side `loadData()` runs
- Error states: `refreshError` displayed to user with retry option

**Validation:** Open dashboard → all 4 tabs work → all widgets render → import opens without freeze → data management CRUD works → settings save.

---

### Phase 4: Teams Surface — All Pages & Actions

**Goal:** Teams landing, dashboard, management, join flow all work end-to-end.

#### 4.1 Teams landing page (`/teams`)
- `app/[locale]/teams/(landing)/page.tsx` → renders `TeamsPageClient`
- Must show team overview, CTA to create/join team

#### 4.2 Teams dashboard layout
- `app/[locale]/teams/dashboard/layout.tsx` — auth guard ✅, sidebar ✅, scroll ✅
- Teams sidebar with back-to-dashboard link

#### 4.3 Teams dashboard pages

| Page | Key Component | Verify |
|------|--------------|--------|
| `/teams/dashboard` | `TeamManagement` | Lists owned/joined teams, create team |
| `/teams/dashboard/[slug]` | `TeamEquityGridClient` | Team overview with equity grid |
| `/teams/dashboard/[slug]/analytics` | Analytics charts | Team performance charts |
| `/teams/dashboard/[slug]/traders` | `TeamEquityGridClient` | Individual trader views |
| `/teams/dashboard/[slug]/members` | `TeamManagement` | Member management |
| `/teams/dashboard/trader/[slug]` | Trader detail | Individual trader analytics |
| `/teams/manage` | `TeamManagement` | Full team management |
| `/teams/join` | Join form | Accept invitation flow |

#### 4.4 Team actions
- `createTeam(name)` → creates team with user as admin
- `joinTeam(teamId)` → requires valid invitation, accepts atomically
- `leaveTeam(teamId)` → removes user from team
- `deleteTeam(teamId)` → only for owner
- `renameTeam(teamId, name)` → only for owner/admin
- `sendTeamInvitation(teamId, email)` → sends email, creates invitation
- `removeTraderFromTeam(teamId, userId)` → removes trader
- `addManagerToTeam(teamId, managerId)` → adds manager
- `removeManagerFromTeam(teamId, managerId)` → removes manager
- `updateManagerAccess(teamId, managerId, access)` → updates permissions

**Validation:** Create team → invite member → member joins → view dashboard → manage members → leave team.

---

### Phase 5: Admin Surface — All Pages & Actions

**Goal:** Every admin page loads, every CRUD action works, admin auth is enforced.

#### 5.1 Admin layout & auth
- `app/[locale]/admin/layout.tsx` — checks auth + admin role ✅
- Admin sidebar with back-to-dashboard link ✅
- Mobile bottom nav for admin ✅

#### 5.2 Admin pages

| Page | Key Action | Verify |
|------|-----------|--------|
| `/admin` | `AdminDashboard` | Stats overview |
| `/admin/blogs` | Blog list | CRUD for blog posts |
| `/admin/blogs/new` | Blog editor | Create blog with MDX |
| `/admin/blogs/[id]/edit` | Blog editor | Edit existing blog |
| `/admin/propfirms` | Prop firm list | CRUD for prop firms |
| `/admin/propfirms/[id]` | Prop firm editor | Edit firm details |
| `/admin/coupons` | Coupon manager | CRUD for coupons |
| `/admin/reviews` | Review manager | Manage firm reviews |
| `/admin/newsletter-builder` | Newsletter builder | Build and send newsletters |
| `/admin/weekly-recap` | Weekly recap | Generate/send weekly recap |
| `/admin/welcome-email` | Welcome email | Edit welcome email template |
| `/admin/send-email` | Send email | Send custom emails |

#### 5.3 Admin API routes
- `/api/admin/reports` — admin reports data
- `/api/admin/subscriptions` — subscription management

**Validation:** Login as admin → view dashboard → CRUD blog → CRUD prop firm → CRUD coupon → send newsletter.

---

### Phase 6: Landing Pages — All Public Routes

**Goal:** Every marketing page renders, all CTAs work, SEO metadata is correct.

#### 6.1 Pages to verify (24 pages)

| Page | Key Features |
|------|-------------|
| `/` (home) | Hero, features, pricing, FAQ, social proof |
| `/propfirms` | Prop firm catalogue, filters, search |
| `/propfirms/[slug]` | Firm detail, reviews, coupons |
| `/firm` | Firm listing (redirect to propfirms?) |
| `/firm/[slug]` | Firm detail page |
| `/deals` | Active deals, sorting |
| `/deals/calculator` | Deal calculator |
| `/deals/compare` | Deal comparison tool |
| `/deals/faq` | Deals FAQ |
| `/deals/guides` | Deal guides |
| `/blogs` | Blog listing |
| `/blogs/[slug]` | Blog post (MDX) |
| `/community` | Community posts |
| `/community/post/[id]` | Individual post |
| `/pricing` | Pricing plans |
| `/faq` | General FAQ |
| `/docs` | Documentation |
| `/leaderboard` | Trader leaderboard |
| `/about` | About page |
| `/support` | Support/contact |
| `/newsletter` | Newsletter signup |
| `/referral` | Referral program |
| `/updates` | Updates/changelog |
| `/updates/[slug]` | Individual update |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/disclaimers` | Disclaimers |
| `/maintenance` | Maintenance mode |
| `/trader/[slug]` | Public trader profile |

#### 6.2 Landing actions
- `community.ts`: `getPosts`, `getPost`, `getComments`, `createPost`, `togglePostVote`
- `github.ts`: GitHub activity
- `send-support-email.ts`: Support form submission
- `get-propfirm-catalogue.ts`: Prop firm data loading

#### 6.3 SEO metadata
- `lib/seo.ts` → `buildPublicMetadata()` for every public page
- `app/sitemap.ts` — generates sitemap
- `app/robots.ts` — robots.txt
- JSON-LD structured data on key pages

**Validation:** Visit every landing page → verify renders → test interactive elements (search, filters, forms).

---

### Phase 7: Authentication Flow End-to-End

**Goal:** Sign up, sign in, OAuth, password reset, session persistence all work.

#### 7.1 Auth pages
| Page | Function |
|------|----------|
| `/authentication` | Sign in / Sign up |
| `/forgot-password` | Request reset link |
| `/reset-password` | Set new password |
| `/authentication/import` | Legacy import redirect |

#### 7.2 Auth flows to verify
- Email/password sign up → email verification → redirect to dashboard
- Email/password sign in → redirect to dashboard (or `next` param)
- Google OAuth → callback → redirect
- Discord OAuth → callback → redirect
- Forgot password → send email → click link → reset password → redirect to dashboard
- Session persistence across page reloads
- Auth timeout → redirect to sign in
- Post-auth user sync → `ensureUserInDatabase()` creates/updates Prisma user

#### 7.3 Auth callback route
- `app/api/auth/callback/route.ts` — handles OAuth code exchange
- Must set session cookies on response
- Must call `ensureUserInDatabase()` after session creation
- Must redirect to `next` param or dashboard

**Validation:** Full auth cycle for email, Google, and Discord.

---

### Phase 8: API Routes — All 57 Routes

**Goal:** Every API route returns correct status codes, validates auth, handles errors.

#### 8.1 API route categories

| Category | Routes | Auth |
|----------|--------|------|
| AI (chat, analysis, search) | 9 | Private (user) |
| Admin (reports, subscriptions) | 2 | Private (admin) |
| Auth callback | 1 | Public (OAuth flow) |
| Behavior insights | 1 | Private (user) |
| Cron jobs | 5 | Service auth (CRON_SECRET) |
| Dashboard (accounts, trades) | 2 | Private (user) |
| Deals (active, unified, firms) | 4 | Private (user) |
| Email (format, thumbnail, unsubscribe, summaries, welcome) | 5 | Mixed |
| ETP store | 1 | Private |
| Health | 1 | Public |
| IBKR imports (OCR, extract, FIFO) | 3 | Private (user) |
| MT5 (accounts, store, test) | 3 | Private (user) |
| Prop firms stats | 1 | Public |
| Referral | 1 | Private (user) |
| Rithmic (encryption, syncs) | 2 | Private (user) |
| Team (accept, invite, analytics) | 4 | Private (user) |
| Thor store | 1 | Private |
| Trader profile benchmark | 1 | Public/Private |
| Tradovate (sync, syncs) | 2 | Private (user) |
| User theme | 1 | Private (user) |
| Whop (checkout, webhook) | 3 | Mixed |
| CSP report | 1 | Public |
| Debug data | 1 | Private (admin) |

#### 8.2 Common fixes
- Every private route must check auth before processing
- Every route must return proper error codes (not throw unhandled)
- `connection()` calls at top for routes that need request scope
- Rate limiting on auth, AI, upload routes

**Validation:** Test each API route for: (1) auth check, (2) correct response format, (3) error handling.

---

### Phase 9: Server Actions & Business Logic

**Goal:** All 44 server action modules work correctly. Auth checks on every mutation.

#### 9.1 Server modules requiring auth verification

Modules with `auth=0` that SHOULD have auth (they use `getDatabaseUserId` which calls auth internally):

| Module | Uses `getDatabaseUserId` | Auth Implicit |
|--------|--------------------------|---------------|
| `accounts.ts` | ✅ via `getDatabaseUserId` | Yes (throws if no user) |
| `equity-chart.ts` | ✅ via `getDatabaseUserId` | Yes |
| `financial-events.ts` | ❌ public data | No (correct) |
| `groups.ts` | ✅ | Yes |
| `journal.ts` | ✅ | Yes |
| `layouts.ts` | ✅ | Yes |
| `optimized-trades.ts` | ✅ | Yes |
| `prop-firms.ts` | public read | Mixed (admin writes) |
| `shared.ts` | public read | Correct |
| `storage.ts` | ✅ | Yes |
| `subscription.ts` | ✅ | Yes |
| `tags.ts` | ✅ | Yes |
| `thor.ts` | ✅ | Yes |
| `tick-details.ts` | ✅ | Yes |
| `trades.ts` | ✅ | Yes |
| `user-data.ts` | ✅ | Yes |
| `user-profile.ts` | ✅ | Yes |

#### 9.2 Verify `getDatabaseUserId` is bulletproof
- `server/auth.ts` → `getDatabaseUserId()` resolves auth_user_id → User.id mapping
- Must handle: legacy users, new users, edge cases where auth_user_id differs from id
- Every server action that touches user data must use this, not raw auth ID

**Validation:** For each server action module, verify: (1) auth is checked, (2) user ID is resolved correctly, (3) mutations are scoped to authenticated user.

---

### Phase 10: State Management & Contexts

**Goal:** All 11 context providers and 27 Zustand stores work correctly.

#### 10.1 Context providers (dependency chain)

```
RootProviders (SidebarRootProviders)
  └── DashboardProviders
        ├── DashboardBootstrapProvider (initial data)
        └── DataProvider (main state)
              ├── DataStateProvider (trades, accounts, etc.)
              │     └── DataDerivedProvider (computed metrics)
              │           └── DataActionsProvider (mutations)
              │                 └── SyncContextProvider (broker syncs)
              └── SyncContext
                    ├── RithmicSyncContext
                    └── TradovateSyncContext
```

#### 10.2 Zustand stores to verify
- `trading-domain-store.ts` — source of truth for trades
- `user-store.ts` — user profile, timezone
- `account-order-store.ts` — account ordering
- `accounts-group-expansion-store.ts` — group expand/collapse
- `accounts-sorting-store.ts` — sort preferences
- `accounts-view-preference-store.ts` — view mode
- `analysis-store.ts` — analysis state
- `auth-preference-store.ts` — auth preferences
- `calendar-view.ts` — calendar display mode
- `chat-store.ts` — AI chat state
- `daily-tick-target-store.ts` — daily targets
- `equity-chart-store.ts` — chart state
- `financial-events-store.ts` — financial calendar
- `import-type-preference-store.ts` — last used import type
- `modal-state-store.ts` — modal open/close
- `mood-store.ts` — mood tracking
- `notification.ts` — notifications
- `pdf-processing-store.ts` — PDF import state
- `rithmic-sync-store.ts` — Rithmic connection
- `subscription-store.ts` — plan info
- `table-config-store.ts` — table column config
- `tick-details-store.ts` — tick data
- `toolbar-settings-store.ts` — toolbar preferences
- `tradovate-sync-store.ts` — Tradovate connection
- `news-filter-store.ts` — news filters
- `pnl-per-contract-daily-store.ts` — PnL data

**Key validations:**
- Persist middleware: stores that persist must hydrate correctly on page load
- Store isolation: no cross-contamination between user sessions
- Store reset: logout clears all stores

---

### Phase 11: Lint — Reduce to Budget

**Goal:** Lint errors ≤ 1,546 total (currently 2,256).

#### 11.1 Fix `no-console` (199 errors)
- Run `npx eslint --fix --rule '{ "no-console": "warn" }'` to auto-fix where possible
- Remaining: manual review — change to `console.warn`/`console.error` or use `logger`

#### 11.2 Fix `no-explicit-any` (149 errors)
Batch-replace common patterns:
- `Record<string, any>` → `Record<string, unknown>`
- Event handlers: `e: any` → proper event types
- API responses: `any` → specific types
- Callback args: `(...args: any[])` → `(...args: unknown[])`

#### 11.3 Fix `react/jsx-no-undef` (4 errors, worktree only)
- Add `ButtonV2` import to affected widget files in worktree

#### 11.4 Fix `react/display-name` (1 error)
- Add displayName to anonymous component

**Target:** ≤ 800 total problems (conservative).

---

### Phase 12: Import & Broker Sync Flows

**Goal:** All 9 import platforms work. Broker sync connects.

#### 12.1 Import platforms
| Platform | Type | Verify |
|----------|------|--------|
| Tradovate | Direct sync (OAuth) | OAuth flow → token → sync trades |
| Rithmic | Direct sync | Credentials → sync trades |
| MT5 | Direct sync | Connection test → sync trades |
| ATAS | CSV import | File upload → parse → review → save |
| NinjaTrader | CSV import | File upload → parse → save |
| Quantower | CSV import | File upload → parse → save |
| TradeZella | CSV import | File upload → parse → save |
| IBKR | PDF import | PDF upload → OCR → extract → save |
| FTMO | CSV import | File upload → parse → save |
| Manual | Manual entry | Form → save |
| Generic CSV | AI mapping | File upload → AI column mapping → save |
| PDF (generic) | PDF processing | File upload → process → save |

#### 12.2 Broker sync contexts
- `TradovateSyncContext` — token management, auto-renewal
- `RithmicSyncContext` — connection management
- Verify sync stores persist credentials correctly
- Verify token renewal cron works

**Validation:** Import from at least one platform end-to-end.

---

### Phase 13: Payment & Billing (Whop)

**Goal:** Checkout → webhook → plan activation works.

#### 13.1 Payment flow
- `/api/whop/checkout` → creates checkout session
- `/api/whop/checkout-team` → team plan checkout
- `/api/whop/webhook` → processes: membership creation, payment, refund, invoice
- Dashboard `/dashboard/billing` → shows current plan, manage subscription

#### 13.2 Webhook handling
- `server/webhook-service.ts` — processes Whop events
- `server/billing.ts` — billing state management
- `server/payment-security.ts` — payment validation

**Validation:** Checkout flow → webhook → plan updates in dashboard.

---

### Phase 14: Shared & Embed Surfaces

**Goal:** Shared dashboards and embed frames work correctly.

#### 14.1 Shared dashboard (`/shared/[slug]`)
- `server/shared.ts` → fetches shared data by slug
- `SharedPageClient` → renders read-only dashboard
- Must work without authentication

#### 14.2 Embed frame (`/embed`)
- Renders charts in embeddable frame
- Theme overrides via search params
- Mock data for demo purposes

**Validation:** Share a dashboard → open shared link → verify renders. Embed URL loads with theme params.

---

## Execution Checklist

After all 14 phases complete, run:

```bash
npm run typecheck   # Must pass with 0 errors
npm run test        # Must pass with 0 failures
npm run lint        # Must be ≤ budget (1,546)
npm run build       # Must succeed (requires DB)
npm run dev         # Smoke test all 57 pages
```

### Manual Smoke Test Checklist

- [ ] Home page loads
- [ ] Sign up → email verification → dashboard redirect
- [ ] Sign in → dashboard
- [ ] Dashboard: all 4 tabs render
- [ ] Dashboard: widgets load (try all 28)
- [ ] Dashboard: import opens without freeze
- [ ] Dashboard: import from CSV works
- [ ] Dashboard: data management CRUD
- [ ] Dashboard: settings save
- [ ] Dashboard: scroll works on main content
- [ ] Teams: create team
- [ ] Teams: invite member → member joins
- [ ] Teams: dashboard shows data
- [ ] Admin: all 10 pages load
- [ ] Admin: CRUD blog post
- [ ] Landing: all 24 pages render
- [ ] API: health check returns 200
- [ ] API: webhook processes test event
- [ ] Mobile: dashboard responsive
- [ ] Mobile: sidebar hamburger works
- [ ] 404 page renders for unknown routes
- [ ] Error boundaries show retry buttons

---

## Priority Order

```
Phase 1  → Environment (unblock CI)
Phase 2  → Shell & Routing (unblock testing)
Phase 3  → Dashboard (core product)
Phase 4  → Teams
Phase 5  → Admin
Phase 6  → Landing
Phase 7  → Auth
Phase 8  → API Routes
Phase 9  → Server Actions
Phase 10 → State Management
Phase 11 → Lint
Phase 12 → Import Flows
Phase 13 → Payments
Phase 14 → Shared/Embed
```

Phases 1-3 are critical path. Phases 4-10 can be parallelized. Phases 11-14 are polishing.
