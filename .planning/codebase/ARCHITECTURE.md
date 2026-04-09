# Architecture

**Analysis Date:** 2026-04-09

## Pattern Overview

**Overall:** Next.js 16 App Router monolith with server/client boundary separation, Supabase Auth, Prisma ORM, and Zustand client state management.

**Key Characteristics:**
- Locale-prefixed routing (`/en/...`, `/fr/...`) via `next-international`
- Server Actions for all mutations; Route Handlers for API endpoints
- Supabase for auth + storage; PostgreSQL via Prisma for relational data
- Dashboard data flows through a multi-layer context provider tree
- Tiered authorization: public pages, authenticated users, admin-only

## Layers

**Presentation Layer (React Components):**
- Purpose: UI rendering, user interaction, layout composition
- Location: `app/[locale]/`, `components/`
- Contains: Page components, UI primitives (shadcn/ui), domain widgets, AI chat UI
- Depends on: Context providers, Zustand stores, React Query, Tailwind CSS
- Used by: Next.js rendering engine (SSR + CSR)

**Client State Layer:**
- Purpose: Manage ephemeral UI state and cached domain data on the client
- Location: `store/`, `context/`
- Contains: Zustand stores (26 stores), React Context providers (DataStateProvider, DataDerivedProvider, DataActionsProvider, SyncContextProvider)
- Depends on: Server Actions (for mutations), lib utilities
- Used by: Dashboard page components, widget components

**Server Action Layer:**
- Purpose: Business logic executed on the server, callable from client components
- Location: `server/`
- Contains: Auth actions, account management, trade CRUD, billing, teams, webhooks, imports
- Depends on: Prisma client, Supabase admin client, external service SDKs
- Used by: Client components via `useActionState` or direct invocation

**API Route Layer:**
- Purpose: HTTP endpoints for external integrations, cron jobs, webhooks, and AI services
- Location: `app/api/`
- Contains: 53 route handlers across admin, AI, auth, cron, deals, email, imports, teams, etc.
- Depends on: Server action layer (shared logic), rate limiter, authorization module
- Used by: External services (Whop, Tradovate, Rithmic), Vercel cron scheduler, client-side fetch

**Data Access Layer:**
- Purpose: Database interactions, query optimization, data mapping
- Location: `lib/prisma.ts`, `server/database.ts`, `server/optimized-trades.ts`
- Contains: Prisma client singleton, optimized trade queries with aggregation
- Depends on: PostgreSQL (via Supabase hosted), Prisma generated client
- Used by: Server actions, API routes

**Utility / Shared Library Layer:**
- Purpose: Pure functions, constants, validation, formatting, feature flags
- Location: `lib/`
- Contains: AI client, analytics, cache, config, security, performance utilities
- Depends on: External packages (zod, date-fns, decimal.js)
- Used by: All layers

## Data Flow

**Dashboard Load Flow:**

1. User navigates to `/[locale]/dashboard`
2. Dashboard layout (`app/[locale]/dashboard/layout.tsx`) verifies auth via `server/auth.ts` (`createClient()` + `supabase.auth.getUser()`)
3. If unauthenticated, redirect to `/[locale]/authentication?next=...`
4. If authenticated, layout renders `SidebarRootProviders` > `DashboardProviders` > `DashboardProvider`
5. `DataProvider` (in `context/data-provider.tsx`) calls server actions to load user data (trades, accounts, groups, subscription)
6. Data flows down through `DataStateProvider` > `DataDerivedProvider` > `DataActionsProvider` > `SyncContextProvider`
7. Child pages/components consume data via context hooks (`useDataTradeItems()`, `useDataAccountsList()`, etc.)
8. Zustand stores (`store/trading-domain-store.ts`, etc.) provide additional client-side cached state

**Trade Mutation Flow:**

1. User edits a trade in the dashboard UI
2. Component calls a server action (e.g., `updateTradesAction` from `server/database.ts`)
3. Server action validates auth, checks ownership, updates Prisma DB
4. Response triggers React Query cache invalidation and context state refresh
5. UI re-renders with updated data

**AI Chat Flow:**

1. User sends a message in the AI chat component (`components/ai-elements/conversation.tsx`)
2. Client calls `POST /api/ai/chat` (route handler at `app/api/ai/chat/route.ts`)
3. Route handler validates auth + AI usage budget, streams response via Vercel AI SDK
4. OpenAI API generates analysis based on user's trade data (fetched server-side)
5. Streamed response renders token-by-token in the chat UI

**State Management:**

- **Global server state:** Supabase Auth session (cookie-based), PostgreSQL via Prisma
- **Global client state:** React Context tree under `DashboardProviders` (trades, accounts, filters, user)
- **Component state:** Zustand stores for granular persistence (26 stores in `store/`) -- some use `localStorage` via `persist` middleware
- **Form state:** `react-hook-form` with `@hookform/resolvers` (zod)
- **Server state:** React Query (`@tanstack/react-query`) with 30s stale time, used for API data fetching
- **URL state:** Next.js search params for filters, locale, shared view tokens

## Key Abstractions

**Server Auth Client:**
- Purpose: Creates Supabase server client with cookie-based session management
- Implementation: `server/auth.ts` -- `createClient()` using `@supabase/ssr` `createServerClient`
- Pattern: Server-side only (`'use server'` directive), cookie read/write via `next/headers`

**Authorization:**
- Purpose: Role-based access control (user, admin, service/cron)
- Implementation: `server/authz.ts` -- `requireUser()`, `requireAdmin()`, `assertAdminAccess()`, `requireCronAuth()`
- Pattern: Throws typed `AuthzError` with status codes; admin determined by `ALLOWED_ADMIN_USER_ID` env or `ADMIN_EMAIL_DOMAINS`

**API Response Contract:**
- Purpose: Standardized JSON error responses across all API routes
- Implementation: `lib/api-response.ts` -- `apiError(code, message, status, details)`
- Pattern: All API routes return `{ error: { code, message, details? } }` shape

**Rate Limiting:**
- Purpose: Protect API endpoints from abuse
- Implementation: `lib/rate-limit.ts` -- in-memory (dev) or Upstash Redis (production)
- Pattern: `rateLimit()` returns `{ success, limit, remaining, resetTime }`; production requires Upstash or fails closed

**Feature Flags:**
- Purpose: Gradual rollout of performance optimizations
- Implementation: `lib/feature-flags.ts` -- env-var-driven flags with deterministic hash-based user assignment
- Pattern: `FEATURE_FLAGS.ENABLE_*` booleans + `shouldShowOptimizations(userId)` for percentage rollouts

**Structured Logging:**
- Purpose: Production-grade JSON logging with PII redaction
- Implementation: `lib/logger.ts` -- `logger.info()`, `logger.error()`, etc.
- Pattern: Auto-redacts sensitive keys (token, password, secret); supports child loggers with bound context

## Entry Points

**Root Layout:**
- Location: `app/layout.tsx`
- Triggers: Every request
- Responsibilities: HTML shell, Google Fonts (7 families), Vercel Analytics/SpeedInsights (production), theme initializer, skip-to-content link

**Locale Layout:**
- Location: `app/[locale]/layout.tsx` + `app/[locale]/layout-content.tsx`
- Triggers: Every locale-prefixed route
- Responsibilities: Sets `next-international` locale via `I18nProviderClient`, consent banner, Suspense boundary

**Route Group Layouts:**
- `(home)/layout.tsx` -- Landing page with `MarketingLayoutShell` + `PublicRootProviders`
- `(landing)/layout.tsx` -- Public marketing pages with `MarketingLayoutShell` + `PublicRootProviders`
- `(authentication)/layout.tsx` -- Auth pages with `AuthenticationLayoutShell` (client-only, no SSR)
- `dashboard/layout.tsx` -- Protected dashboard with auth guard, sidebar, header, error boundary
- `admin/layout.tsx` -- Admin-only pages with auth + admin role guard
- `teams/layout.tsx` -- Teams pages with `PublicRootProviders`

**API Entry Points:**
- Location: `app/api/*/route.ts` (53 route handlers)
- Triggers: HTTP requests from client, webhooks, cron jobs
- Authentication: Session-based (Supabase cookies) for user routes; Bearer token or Vercel cron header for service routes

## Rendering Strategy

**Server-Side Rendering (SSR):**
- Default for all pages under `app/[locale]/`
- Dashboard layout verifies auth server-side before rendering
- Locale layout sets i18n context server-side via `setStaticParamsLocale()`

**Client-Side Rendering (CSR):**
- Authentication layout: explicitly `ssr: false` via `dynamic(() => import("./client-layout"), { ssr: false })`
- All `'use client'` components: interactive widgets, AI chat, forms, sidebar

**Static Site Generation (SSG):**
- Not explicitly used; all pages are dynamically rendered

**Incremental Static Regeneration (ISR):**
- Not detected

**Dynamic Imports:**
- `next/dynamic` used for code splitting heavy components (e.g., `DashboardHeader`, `DashboardClientOverlays`, `AuthenticationClientLayout`)
- `components/lazy/` directory contains lazy-loaded wrappers for scroll-lock fix and consent banner

## Authentication Flow

**Login Methods:**
- Email magic link (OTP): `signInWithEmail()` in `server/auth.ts` -- sends Supabase magic link
- Email + password: `signInWithPasswordAction()` -- sign up auto-creates account if missing
- Google OAuth: `signInWithGoogle()` -- redirects to Google, callback at `app/api/auth/callback/route.ts`
- Discord OAuth: `signInWithDiscord()` -- same pattern as Google

**Session Management:**
- Supabase Auth with server-side cookies (httpOnly, secure, sameSite: lax)
- Server client: `server/auth.ts` `createClient()` reads/writes cookies via `next/headers`
- Browser client: `lib/supabase.ts` `createClient()` using `@supabase/ssr` `createBrowserClient`
- Token refresh: handled by Supabase SDK; Vercel cron job renews Tradovate tokens

**Protected Routes:**
- Dashboard: `dashboard/layout.tsx` checks `supabase.auth.getUser()`, redirects if null
- Admin: `admin/layout.tsx` checks `isAdminUser()`, redirects non-admin to dashboard
- API routes: `requireUser()` or `requireAdmin()` from `server/authz.ts`

**Auth Security:**
- Rate limiting on login attempts (`lib/security/auth-attempts.ts`)
- Password strength validation (`lib/security/password-validation.ts`)
- Error obfuscation in production (`lib/security/auth-config.ts`)
- PII redaction in logs (`lib/redact-pii.ts`)
- OAuth state management with HMAC (`lib/security/oauth-state.ts`)
- MFA recovery codes support (`lib/security/mfa-recovery.ts`)

## Error Handling

**Strategy:** Multi-layer error boundaries with graceful degradation

**App Level:**
- `app/error.tsx` -- Client error boundary for route segment errors; shows "Try again" + "Go home"
- `app/global-error.tsx` -- Catches errors in root layout; renders own `<html>` shell
- `app/not-found.tsx` -- Custom 404 page

**Dashboard Level:**
- `components/error-boundary.tsx` -- Class-based `ErrorBoundary` wrapping dashboard children in `SidebarLayoutShell`
- Shows "Reload Dashboard" button on error

**API Level:**
- `server/authz.ts` `toErrorResponse()` -- Converts `AuthzError` to standardized JSON response
- `lib/api-response.ts` `apiError()` -- Creates typed error responses with status codes
- All API routes use consistent `{ error: { code, message } }` shape

**Production Resilience:**
- Chunk load error recovery in `components/providers/root-providers.tsx` -- auto-reloads page on `ChunkLoadError`
- Service worker cleanup logic for cache invalidation

**Logging:**
- `lib/logger.ts` -- Structured JSON logging in production; auto-generates request/correlation IDs
- Error threshold alerting: warns when >20 errors occur in same route within 5 minutes

## Internationalization

**Library:** `next-international` (v1.3.1)

**Supported Locales:**
- Fully translated: `en` (English), `fr` (French)
- Fallback to English: `hi`, `ja`, `es`, `it`, `de`, `pt`, `vi`, `zh`, `yo`

**Server Setup:**
- `locales/server.ts` -- `createI18nServer()` with locale imports
- `app/[locale]/layout-content.tsx` -- Calls `setStaticParamsLocale(locale)` for static params

**Client Setup:**
- `locales/client.ts` -- `createI18nClient()` with lazy-loaded locale imports
- `I18nProviderClient` wraps all locale pages in the layout

**Translation Files:**
- `locales/en/` -- English translations (directory structure)
- `locales/fr/` -- French translations (directory structure)

**Usage Pattern:**
- Server components: `const t = await getI18n()` from `locales/server.ts`
- Client components: `const t = useI18n()` from `locales/client.ts`
- Scoped translations: `const t = useScopedI18n('namespace')`

## Cross-Cutting Concerns

**Logging:** Structured JSON via `lib/logger.ts`; PII auto-redaction; child loggers with bound context; production vs dev formatting

**Validation:** Zod schemas (`zod` v4) for API input, form validation, env validation; integrated with `react-hook-form` via `@hookform/resolvers`

**Authentication:** Supabase Auth with cookie-based sessions; server and browser clients; rate-limited login attempts; multiple OAuth providers

**Rate Limiting:** In-memory (dev) or Upstash Redis (production); per-IP and per-subject limits; production fails closed if Redis unavailable

**CSP:** Content Security Policy defined in `lib/security/csp.ts`; CSP report endpoint at `app/api/csp-report/route.ts`

**Performance:** Feature flags for gradual rollout; bundle optimization via `optimizePackageImports`; code splitting with `next/dynamic`; lazy component loading in `components/lazy/`

**Analytics:** Vercel Analytics + Speed Insights (production only); PostHog integration exists but commented out

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                            │
│                                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ React Pages  │  │ Zustand      │  │ React Context Providers   │  │
│  │ (SSR + CSR)  │  │ Stores (26)  │  │ ┌──────────────────────┐ │  │
│  │              │  │ ┌──────────┐ │  │ │ DataProvider         │ │  │
│  │ app/[locale]/│  │ │ trading- │ │  │ │  ├ DataStateProvider │ │  │
│  │  (home)/     │  │ │ domain   │ │  │ │  ├ DataDerived       │ │  │
│  │  (landing)/  │  │ │ chat     │ │  │ │  ├ DataActions       │ │  │
│  │  (auth)/     │  │ │ mood     │ │  │ │  └ SyncContext       │ │  │
│  │  dashboard/  │  │ │ ...      │ │  │ └──────────────────────┘ │  │
│  │  admin/      │  │ └──────────┘ │  │                          │  │
│  │  teams/      │  │              │  │ RootProviders            │  │
│  └──────┬───────┘  └──────┬───────┘  │  ├ ThemeProvider        │  │
│         │                 │           │  ├ TooltipProvider      │  │
│         │                 │           │  └ SidebarProvider      │  │
│         │                 │           └────────────┬─────────────┘  │
└─────────┼─────────────────┼────────────────────────┼────────────────┘
          │                 │                        │
          │ Server Actions  │ (localStorage)         │
          │ (POST)          │                        │
          ▼                 │                        │
┌─────────────────────────────────────────────────────┼────────────────┐
│                    NEXT.JS SERVER                    │                │
│                                                     │                │
│  ┌──────────────────┐  ┌────────────────────────┐   │                │
│  │ Server Actions   │  │ API Route Handlers     │   │                │
│  │ server/*.ts      │  │ app/api/*/route.ts     │   │                │
│  │ ┌──────────────┐ │  │ ┌──────────────────┐   │   │                │
│  │ │ auth.ts      │ │  │ │ /ai/chat         │   │   │                │
│  │ │ accounts.ts  │ │  │ │ /ai/analyze      │   │   │                │
│  │ │ database.ts  │ │  │ │ /whop/webhook    │   │   │                │
│  │ │ trades.ts    │ │  │ │ /cron/*          │   │   │                │
│  │ │ teams.ts     │ │  │ │ /deals/*         │   │   │                │
│  │ │ billing.ts   │ │  │ └──────────────────┘   │   │                │
│  │ └──────────────┘ │  └────────────┬───────────┘   │                │
│  └────────┬─────────┘               │               │                │
│           │                         │               │                │
│  ┌────────┴─────────────────────────┴───────────────┴────────────┐   │
│  │                    Shared Services                             │   │
│  │  ┌──────────┐ ┌────────────┐ ┌───────────┐ ┌───────────────┐ │   │
│  │  │ authz.ts │ │ rate-limit │ │ logger.ts │ │ feature-flags │ │   │
│  │  └──────────┘ └────────────┘ └───────────┘ └───────────────┘ │   │
│  └────────────────────────┬──────────────────────────────────────┘   │
│                           │                                          │
└───────────────────────────┼──────────────────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Supabase    │  │  PostgreSQL  │  │  External    │
│  Auth +      │  │  (Prisma)   │  │  Services    │
│  Storage     │  │             │  │              │
│              │  │  User       │  │  OpenAI AI   │
│  Sessions    │  │  Trade      │  │  Stripe      │
│  OAuth       │  │  Account    │  │  Whop        │
│  Files       │  │  Group      │  │  Tradovate   │
│              │  │  Team       │  │  Rithmic     │
│              │  │  Payment    │  │  Resend      │
│              │  │  ...        │  │  Upstash     │
│              │  │             │  │  (Redis)     │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

*Architecture analysis: 2026-04-09*
