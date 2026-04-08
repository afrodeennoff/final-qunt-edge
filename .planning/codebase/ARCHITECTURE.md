# Architecture

**Analysis Date:** 2026-04-08

## Pattern Overview

**Overall:** Next.js 16 App Router monolith with server actions, REST API routes, and a rich client-side state layer.

**Key Characteristics:**
- Next.js 16 App Router with React 19, using the file-system based routing model
- Server Actions (`'use server'`) as the primary data-mutation layer for the dashboard
- REST API routes (`route.ts`) for external integrations, webhooks, AI, and cron jobs
- Supabase Auth for authentication (email/password + OAuth), with RLS and a custom authorization module
- Prisma 7 with `@prisma/adapter-pg` (connection pooling via `pg.Pool`) for database access
- Zustand stores for granular client-side state (accounts, trades, chat, filters, UI preferences)
- React Context (via `DataProvider` / `DashboardProviders`) for cross-cutting dashboard state
- next-international for i18n with `en` and `fr` locales
- Vercel as primary deployment target with Docker as secondary
- Feature flag system for gradual performance rollout

## Layers

### Presentation Layer (Client Components)
- Purpose: Renders UI, manages user interactions, holds ephemeral UI state
- Location: `app/[locale]/dashboard/components/`, `components/ui/`, `components/sidebar/`
- Contains: React components, dashboard widgets, charts, import dialogs, filters, modals
- Depends on: Context providers, Zustand stores, server actions
- Used by: Next.js page components

### Data Provider Layer (React Context)
- Purpose: Orchestrates data fetching, derived state computation, and action dispatching for the dashboard
- Location: `context/data-provider.tsx`, `context/providers/`
- Contains: `DataProvider`, `DataStateProvider`, `DataDerivedProvider`, `DataActionsProvider`, `SyncContextProvider`
- Depends on: Server actions, Zustand stores (`user-store`), Supabase auth
- Used by: Dashboard page components and all dashboard sub-components

### Client State Layer (Zustand)
- Purpose: Persistent and ephemeral client-side state management
- Location: `store/`
- Contains: 20+ Zustand stores for user data, accounts, chat, financial events, filters, modals, sync status, table configs
- Pattern: `create()` from `zustand` with optional `persist` middleware and `createJSONStorage`
- Key stores: `store/user-store.ts` (central, persisted), `store/chat-store.ts`, `store/analysis-store.ts`
- Used by: Context providers, individual components

### Server Action Layer
- Purpose: Server-side data mutations and authenticated queries invoked directly from client components
- Location: `server/` (all files marked `'use server'`)
- Contains: `server/trades.ts`, `server/accounts.ts`, `server/groups.ts`, `server/layouts.ts`, `server/database.ts`, `server/auth.ts`, `server/subscription.ts`, `server/payment-service.ts`, `server/referral.ts`, `server/teams.ts`
- Pattern: Functions exported from `'use server'` modules, callable from client via React's server action protocol
- Validation: Zod schemas for input validation (see `importTradeSchema` in `server/trades.ts`)
- Depends on: Prisma client, Supabase auth, Redis for cache invalidation
- Used by: Client components via `import { action } from '@/server/module'`

### API Route Layer (REST)
- Purpose: External-facing endpoints for webhooks, AI, cron jobs, and third-party integrations
- Location: `app/api/`
- Contains: ~50 route handlers across AI, auth, cron, deals, email, imports, MT5, payments, teams, tradovate, rithmic, whop
- Pattern: `export async function POST/GET(req: NextRequest)` returning `NextResponse.json()`
- Auth: `requireUser()`, `requireAdmin()`, `requireCronAuth()`, `requireServiceAuth()` from `server/authz.ts`
- Error responses: `apiError()` from `lib/api-response.ts` with structured `{ code, message }` format
- Used by: External services (Whop webhooks, Tradovate, Rithmic, Vercel Cron)

### Data Access Layer (Prisma)
- Purpose: Type-safe database access with connection pooling
- Location: `lib/prisma.ts` (singleton), `prisma/schema.prisma`
- Contains: PrismaClient with `@prisma/adapter-pg` over a `pg.Pool`
- Features: Supabase pooler auto-detection, SSL configuration, pool utilization monitoring, IPv4 forcing
- Models: 50+ models including User, Account, Trade, Group, Subscription, PaymentTransaction, Team, Business, PropFirm, BlogPost, etc.
- Used by: Server actions, API routes

### Domain / Utility Layer
- Purpose: Pure business logic, calculations, and utilities
- Location: `lib/`
- Contains: `lib/financial-math.ts`, `lib/score-calculator.ts`, `lib/account-metrics.ts`, `lib/tick-calculations.ts`, `lib/analytics/`, `lib/formatting/`, `lib/date-utils.ts`
- Used by: Server actions, context providers, components

## Data Flow

### Dashboard Data Flow

1. **Layout** (`app/[locale]/dashboard/layout.tsx`) authenticates user via `createClient()` from `server/auth.ts`, redirects if unauthenticated
2. **DashboardProviders** wraps children with: `DataProvider` -> `DataStateProvider` -> `DataDerivedProvider` -> `DataActionsProvider` -> `SyncContextProvider`
3. **DataProvider** (`context/data-provider.tsx`) is the central orchestrator (~2000 lines). On mount it:
   - Calls `getUserId()` from `server/auth.ts` to get the Supabase user
   - Calls `getDatabaseUserId()` to resolve the Prisma User record
   - Calls `getUserData()` to load user profile, accounts, trades, tags, groups, subscription
   - Calls `loadDashboardLayoutAction()` from `server/layouts.ts` for widget layout
   - Populates `useUserStore` (Zustand) with loaded data
4. **Derived state** (statistics, formatted trades, calendar data) is computed in `DataDerivedProvider` via `useDashboardStats()`
5. **Server actions** (CRUD operations) update Prisma, then trigger Zustand store updates and React Query cache invalidation
6. **Cache invalidation** flows through `lib/cache/cache-invalidation.ts` and `lib/redis-client.ts`

### Authentication Flow

1. User signs up/in on `app/[locale]/(authentication)/authentication/page.tsx`
2. Supabase Auth handles credential exchange
3. OAuth callback: `app/api/auth/callback/route.ts` exchanges code for session, ensures user exists in database via `ensureUserInDatabase()`, sets session cookies
4. Auth state is maintained via Supabase session cookies (httpOnly, secure, sameSite=lax)
5. Protected layouts (`dashboard/layout.tsx`, `admin/layout.tsx`) call `supabase.auth.getUser()` server-side and redirect if null
6. Admin authorization: `isAdminUser()` in `server/authz.ts` checks user ID against `ALLOWED_ADMIN_USER_ID` env and `ADMIN_EMAIL_DOMAINS`

### Payment Flow

1. Checkout initiated via `app/api/whop/checkout/route.ts` using `@whop/sdk`
2. Whop webhook: `app/api/whop/webhook/route.ts` receives events, validates signature, processes via `webhookService` (`server/webhook-service.ts`)
3. Subscription data stored in Prisma `Subscription`, `PaymentTransaction`, `Invoice` models
4. Subscription status checked via `server/subscription.ts` and exposed to client via `DataProvider`
5. Teams and businesses have separate subscription flows (`TeamSubscription`, `BusinessSubscription`)

### AI Chat Flow

1. User interacts with AI chat component in dashboard
2. Messages sent to `app/api/ai/chat/route.ts`
3. Uses Vercel AI SDK (`ai` package, `@ai-sdk/openai`) with OpenAI-compatible API
4. Context provided: trade history, performance metrics, behavioral insights
5. Usage tracked in `AiRequestLog` and `AiUsageLedger` Prisma models
6. Rate limiting and policy enforcement via `lib/ai/policy.ts`, `lib/ai/route-guard.ts`, `lib/ai/usage-budget.ts`

## Key Abstractions

### DataProvider (`context/data-provider.tsx`)
- Purpose: Single source of truth for the authenticated dashboard state
- Pattern: React Context + hooks (`useDashboardAccountsList`, `useDashboardTradeItems`, `useDashboardFilters`, `useDashboardActions`, etc.)
- Wraps: Zustand `useUserStore`, server action calls, Supabase auth state
- Consumer hook: `useDataActions()`, `useDataTradeItems()`, `useDataAccountsList()`, `useDataFilters()`, `useDataIsLoading()`

### Zustand Stores
- Purpose: Granular, composable state slices
- Pattern: `create<StateType>()((set, get) => ({ ... }))`
- Persistence: `persist(createJSONStorage(() => localStorage))` for stores that need it (e.g., `user-store`)
- Key stores: `store/user-store.ts` (user, accounts, groups, tags, subscription, layout), `store/chat-store.ts`, `store/analysis-store.ts`, `store/filters/`

### DashboardContext (`app/[locale]/dashboard/dashboard-context.tsx`)
- Purpose: Widget layout management (add, remove, resize, reorder widgets)
- Pattern: React Context with `DashboardProvider`
- Features: Auto-save via debounced server action calls, mobile/desktop layout variants

## Entry Points

### Root Layout (`app/layout.tsx`)
- Triggers: Every request
- Responsibilities: Font loading (Geist, Cormorant Garamond, IBM Plex Mono, DM Sans, Outfit, Poppins, Roboto), global metadata, Vercel Analytics/SpeedInsights, skip-to-content link

### Locale Layout (`app/[locale]/layout.tsx`)
- Triggers: Every locale-prefixed route
- Responsibilities: Suspense boundary, `I18nProviderClient` from `next-international`, consent banner

### Route Group Layouts
- `(landing)/layout.tsx` -- Public marketing pages with `MarketingLayoutShell` and `PublicRootProviders`
- `(home)/layout.tsx` -- Homepage (same shell as landing, dark variant)
- `(authentication)/layout.tsx` -- Auth pages with `AuthenticationLayoutShell`
- `dashboard/layout.tsx` -- Protected dashboard with auth gate, sidebar, header, `DashboardProviders`
- `admin/layout.tsx` -- Admin panel with admin auth gate and sidebar
- `teams/layout.tsx` -- Teams pages with `PublicRootProviders`
- `teams/dashboard/layout.tsx` -- Protected team dashboard

### API Routes
- `app/api/auth/callback/route.ts` -- OAuth callback handler
- `app/api/whop/webhook/route.ts` -- Payment webhook receiver
- `app/api/ai/chat/route.ts` -- AI chat endpoint (Vercel AI SDK)
- `app/api/cron/*/route.ts` -- Scheduled tasks (investing data, renewal notices, chat retention, tradovate token refresh)

## Error Handling

**Strategy:** Layered approach with structured logging

**Patterns:**
- **API routes:** `apiError()` from `lib/api-response.ts` returns `{ error: { code, message } }` with appropriate HTTP status
- **Auth errors:** `AuthzError` class in `server/authz.ts` with status, code, requestId; converted via `toErrorResponse()`
- **Server actions:** Return typed result objects (e.g., `{ error: TradeError | false, numberOfTradesAdded }`)
- **Client boundary:** `app/error.tsx` catches render errors with reset button; `react-error-boundary` wraps dashboard content
- **Chunk load recovery:** `RootProviders` in `components/providers/root-providers.tsx` auto-reloads on `ChunkLoadError`
- **Logging:** Structured JSON logger in `lib/logger.ts` with log levels, PII redaction, request correlation IDs, and error threshold alerting

## Cross-Cutting Concerns

**Logging:** Custom logger (`lib/logger.ts`) with structured JSON in production, human-readable in dev, automatic PII redaction, request ID correlation, and error threshold alerting.

**Validation:** Zod schemas for server action inputs (e.g., `importTradeSchema` in `server/trades.ts`). Custom password validation in `lib/security/password-validation.ts`. Auth attempt tracking in `lib/security/auth-attempts.ts`.

**Authentication:** Supabase Auth for session management. Server-side auth via `createClient()` from `server/auth.ts` (creates `@supabase/ssr` server client). Authorization via `server/authz.ts` with admin/user/service/cron access levels. OAuth state CSRF protection via `timingSafeEqual`.

**Internationalization:** `next-international` with `en` and `fr` locales. Translation files in `locales/en/` and `locales/fr/`. `I18nProviderClient` wraps the app. `useI18n()` hook in client components, `setStaticParamsLocale()` in server components.

**Feature Flags:** Environment-variable-driven system in `lib/feature-flags.ts`. Supports gradual rollout by user ID hash, emergency rollback, and deterministic assignment.

**Caching:** Next.js `cacheLife`/`cacheTag`/`updateTag` for server-side caching. Redis (`lib/redis-client.ts`) for cross-request cache invalidation. `lib/cache/cache-invalidation.ts` for coordinated invalidation on trade/account mutations.

**Security:** CSP headers, OAuth state validation, timing-safe comparison for auth tokens, PII redaction in logs, secure token storage with SHA-256 hashing, rate limiting (`lib/rate-limit.ts`), slug validation (`lib/security/slug.ts`).

---

*Architecture analysis: 2026-04-08*
