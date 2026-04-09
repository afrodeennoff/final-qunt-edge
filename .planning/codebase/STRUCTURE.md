# Codebase Structure

**Analysis Date:** 2026-04-09

## Directory Layout

```
qunt-edge/
├── app/                    # Next.js App Router -- pages, layouts, API routes
│   ├── api/                # API route handlers (53 routes)
│   └── [locale]/           # Locale-prefixed pages (en, fr, ...)
│       ├── (authentication)/ # Auth pages (login, forgot-password, reset)
│       ├── (home)/           # Landing page with marketing shell
│       ├── (landing)/        # Public marketing pages
│       ├── admin/            # Admin-only pages
│       ├── dashboard/        # Protected dashboard pages
│       ├── embed/            # Embeddable widgets
│       ├── shared/           # Shared trade views (public links)
│       └── teams/            # Teams feature pages
├── components/            # React components
│   ├── ai-elements/       # AI chat UI components
│   ├── animation/         # Motion/animation primitives
│   ├── auth/              # Auth-specific components
│   ├── emails/            # React Email templates
│   ├── icons/             # Icon components (SVG, Lucide)
│   ├── layout/            # Layout shell components
│   ├── lazy/              # Lazy-loaded component wrappers
│   ├── magicui/           # Animated beam effects
│   ├── patterns/          # Reusable UI patterns (cards, shells)
│   ├── providers/         # React context providers
│   ├── sidebar/           # Dashboard sidebar components
│   ├── tiptap/            # Rich text editor (TipTap)
│   ├── types/             # Component-specific type defs
│   ├── ui/                # shadcn/ui primitives + sidebar primitives
│   │   ├── sidebar-primitives/ # Sidebar building blocks
│   │   └── v2/            # Next-gen UI components
│   └── ui-v2.tsx          # (unused/deprecated)
├── context/               # React Context providers
│   └── providers/         # Data state/derived/actions providers
├── hooks/                 # Custom React hooks
├── lib/                   # Shared utilities, AI, security, performance
│   ├── __tests__/         # Unit tests for lib modules
│   ├── ai/                # AI client, prompts, policies, caching
│   ├── analytics/         # Metric definitions
│   ├── cache/             # Cache invalidation
│   ├── config/            # Breakpoints, z-index constants
│   ├── constants/         # Dashboard themes, layout, sidebar, timezones
│   ├── debug/             # Event tracker, performance monitor, render tracker
│   ├── domain/            # Domain logic (PnL calculator)
│   ├── formatting/        # Currency formatting
│   ├── indexeddb/         # Client-side IndexedDB cache
│   ├── performance/       # Next.js config, code splitting, GPU optimization
│   ├── prop-firms/        # Prop firm data normalization
│   ├── propfirmmatch/     # Prop firm matching source
│   └── security/          # Auth attempts, CSP, password validation, OAuth
├── locales/               # i18n translation files
│   ├── en/                # English translations (nested directory)
│   ├── fr/                # French translations (nested directory)
│   ├── client.ts          # Client-side i18n hooks
│   └── server.ts          # Server-side i18n setup
├── prisma/                # Prisma ORM
│   ├── generated/         # Generated Prisma client
│   ├── migrations/        # 100+ database migrations
│   └── seeders/           # Database seed scripts
├── schemas/               # JSON schemas (risk register, widget I/O)
├── scripts/               # Build, deploy, audit, performance scripts
├── server/                # Server Actions ('use server' modules)
├── store/                 # Zustand stores (26 stores)
├── styles/                # CSS files (tokens, themes, base styles)
├── tests/                 # Vitest unit/integration tests + Playwright e2e
│   ├── api/               # API route tests
│   ├── app/               # App utility tests
│   ├── cache/             # Cache tests
│   ├── context/           # Context provider tests
│   ├── e2e/               # Playwright end-to-end tests
│   ├── lib/               # Library unit tests
│   ├── performance/       # Performance regression tests
│   ├── server/            # Server action tests
│   └── smoke/             # Smoke tests
├── types/                 # Global TypeScript type definitions
├── public/                # Static assets (icons, images, manifest)
├── content/               # MDX content (blog updates)
├── docs/                  # Project documentation, audits, operations
├── mt5_import_service/    # MT5 import microservice
├── tasks/                 # Task definitions
├── state/                 # State management utilities
├── awesome-design-md/     # Design reference collection (submodule-like)
├── goose/                 # Goose AI recipes
├── output/                # Build/test output artifacts
└── test-results/          # Test result artifacts
```

## Directory Purposes

**`app/`** (559 files):
- Purpose: Next.js App Router -- all pages, layouts, loading states, API routes, error boundaries
- Contains: Route segments, `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts`
- Key files: `app/layout.tsx` (root), `app/[locale]/layout.tsx` (locale), `app/[locale]/dashboard/layout.tsx` (dashboard)

**`components/`** (177 files):
- Purpose: Reusable React components organized by domain
- Contains: UI primitives (shadcn/ui), AI chat elements, email templates, sidebar, animation
- Key files: `components/providers/root-providers.tsx`, `components/ui/sidebar.tsx`, `components/ai-elements/conversation.tsx`

**`lib/`** (133 files):
- Purpose: Shared utilities, business logic helpers, security, AI integration, performance
- Contains: Logger, rate limiter, API response helpers, Prisma client, Supabase client, AI SDK wrappers
- Key files: `lib/logger.ts`, `lib/rate-limit.ts`, `lib/api-response.ts`, `lib/auth.ts` (redirects to `server/auth.ts`), `lib/supabase.ts`

**`server/`** (37 files):
- Purpose: Server Actions -- all backend business logic callable from client components
- Contains: Auth, accounts, trades, billing, teams, webhooks, imports, subscriptions
- Key files: `server/auth.ts`, `server/database.ts`, `server/accounts.ts`, `server/authz.ts`

**`store/`** (26 files):
- Purpose: Zustand client-side state stores with optional localStorage persistence
- Contains: Trading domain data, chat, mood, notifications, filters, sync state
- Key files: `store/trading-domain-store.ts`, `store/chat-store.ts`, `store/user-store.ts`

**`context/`** (10 files):
- Purpose: React Context providers for dashboard data flow
- Contains: DataProvider, DataStateProvider, DataDerivedProvider, DataActionsProvider, SyncContextProvider, ThemeProvider
- Key files: `context/data-provider.tsx`, `context/providers/data-state-provider.tsx`

**`hooks/`** (8 files):
- Purpose: Custom React hooks for common client-side behaviors
- Contains: Auto-scroll, currency formatting, debounce, hash upload, keyboard shortcuts, media query, mobile detection
- Key files: `hooks/use-mobile.tsx`, `hooks/use-debounce.ts`

**`locales/`** (36 files):
- Purpose: Internationalization translations and i18n configuration
- Contains: English and French translation directories, server/client i18n setup
- Key files: `locales/server.ts`, `locales/client.ts`

**`tests/`** (72 files):
- Purpose: Unit, integration, and e2e tests
- Contains: API route tests, server action tests, lib tests, Playwright e2e specs
- Key files: `tests/setup.ts`, `tests/e2e/auth.spec.ts`

## Key File Locations

**Entry Points:**
- `app/layout.tsx`: Root HTML layout with fonts, analytics, theme init
- `app/[locale]/layout.tsx`: Locale routing with i18n provider
- `app/[locale]/layout-content.tsx`: Sets static params locale and wraps with `I18nProviderClient`

**Configuration:**
- `next.config.ts`: Next.js configuration (delegates to `lib/performance/next-config.ts`)
- `tsconfig.json`: TypeScript config with `@/*` and `@lib/*` path aliases
- `tailwind.config.ts`: Tailwind CSS with custom design tokens (colors, shadows, animations)
- `components.json`: shadcn/ui configuration (new-york style, RSC enabled)
- `vitest.config.ts`: Vitest test runner configuration
- `eslint.config.mjs`: ESLint flat config with Next.js + React plugins
- `vercel.json`: Vercel deployment config with cron jobs
- `postcss.config.mjs`: PostCSS config for Tailwind v4

**Core Logic:**
- `server/auth.ts`: Authentication server actions (sign in, sign up, OAuth, OTP)
- `server/authz.ts`: Authorization (requireUser, requireAdmin, requireCronAuth)
- `server/database.ts`: Trade CRUD operations, optimized queries
- `server/accounts.ts`: Account management, balance calculations
- `server/payment-service.ts`: Payment processing logic
- `server/teams.ts`: Team management operations
- `lib/logger.ts`: Structured logging with PII redaction
- `lib/rate-limit.ts`: Rate limiting (Upstash Redis / in-memory fallback)
- `lib/feature-flags.ts`: Feature flag system with gradual rollout
- `lib/api-response.ts`: Standardized API error responses
- `lib/supabase.ts`: Browser-side Supabase client
- `prisma/schema.prisma`: Database schema (100+ migrations)

**Provider Composition:**
- `components/providers/root-providers.tsx`: ThemeProvider + TooltipProvider + chunk error recovery
- `components/providers/dashboard-providers.tsx`: DataProvider > DataState > DataDerived > DataActions > Sync > Toaster
- `components/providers/query-provider.tsx`: React Query client (30s stale, 5min GC)
- `context/theme-provider.tsx`: Dark/light theme management
- `context/data-provider.tsx`: Central dashboard data state (trades, accounts, filters)

**Testing:**
- `tests/setup.ts`: Vitest setup file
- `lib/__tests__/setup.ts`: Lib-specific test setup
- `tests/e2e/auth.spec.ts`: Playwright auth e2e tests
- `tests/e2e/a11y/a11y.spec.ts`: Accessibility tests
- `playwright.config.ts`: Playwright configuration

## App Router Structure

```
app/
├── layout.tsx                        # Root layout (fonts, analytics, theme)
├── error.tsx                         # Route-level error boundary
├── global-error.tsx                  # Root error boundary
├── not-found.tsx                     # Custom 404
├── robots.ts                         # robots.txt generator
├── sitemap.ts                        # Sitemap generator
├── icon.tsx                          # App icon component
├── globals.css                       # Global styles (imported in root layout)
│
├── api/                              # API Route Handlers (no locale prefix)
│   ├── _utils/                       # Shared API utilities
│   ├── admin/                        # Admin-only endpoints
│   │   ├── reports/route.ts
│   │   └── subscriptions/route.ts
│   ├── ai/                           # AI endpoints
│   │   ├── analysis/{accounts,global,instrument,time-of-day}/
│   │   ├── analyze/route.ts
│   │   ├── chat/route.ts
│   │   ├── editor/route.ts
│   │   ├── format-trades/route.ts
│   │   ├── mappings/route.ts
│   │   ├── search/date/route.ts
│   │   ├── support/route.ts
│   │   └── transcribe/route.ts
│   ├── auth/callback/route.ts        # OAuth callback
│   ├── behavior/insights/route.ts
│   ├── cron/                         # Vercel cron jobs
│   │   ├── chat-retention/route.ts
│   │   ├── compute-trade-data/route.ts
│   │   ├── investing/route.ts
│   │   ├── renew-tradovate-token/route.ts
│   │   └── renewal-notice/route.ts
│   ├── csp-report/route.ts
│   ├── dashboard/{accounts,trades}/route.ts
│   ├── deals/{route,unified,stats}/route.ts
│   ├── email/{format-name,unsubscribe,weekly-summary,welcome}/
│   ├── etp/v1/store/route.ts
│   ├── health/route.ts
│   ├── imports/ibkr/{extract-orders,fifo-computation,ocr}/
│   ├── mt5/{accounts,store,test-connection}/
│   ├── propfirms/stats/route.ts
│   ├── referral/route.ts
│   ├── rithmic/{encryption-key,synchronizations}/
│   ├── team/{accept-invitation,invite}/
│   ├── teams/[id]/analytics/route.ts
│   ├── thor/store/route.ts
│   ├── trader-profile/benchmark/route.ts
│   ├── tradovate/{sync,synchronizations}/
│   ├── user/theme/route.ts
│   └── whop/{checkout,checkout-team,webhook}/
│
└── [locale]/                         # Locale-prefixed routes
    ├── layout.tsx                    # Locale layout (i18n provider)
    ├── layout-content.tsx            # Static params locale setter
    ├── [...not-found]/page.tsx       # Catch-all 404
    │
    ├── (authentication)/             # Route group: auth pages
    │   ├── layout.tsx                # Authentication layout shell
    │   ├── layout-shell.tsx          # Client-only shell (no SSR)
    │   ├── client-layout.tsx         # Actual client layout
    │   ├── loading.tsx               # Auth loading state
    │   ├── authentication/page.tsx   # Login page
    │   ├── forgot-password/page.tsx
    │   ├── import/page.tsx
    │   └── reset-password/page.tsx
    │
    ├── (home)/                       # Route group: root landing
    │   ├── layout.tsx                # Home layout (MarketingLayoutShell)
    │   ├── page.tsx                  # Main landing page
    │   └── components/               # Landing page sections
    │
    ├── (landing)/                    # Route group: public marketing
    │   ├── layout.tsx                # Landing layout (MarketingLayoutShell)
    │   ├── _updates/{page,[slug]/}   # Product updates
    │   ├── about/page.tsx
    │   ├── best-trading-journal/page.tsx
    │   ├── blogs/{page,[slug]/}      # Blog posts
    │   ├── community/{page,post/[id]/}
    │   ├── deals/{page,calculator,compare,faq,guides}/
    │   ├── disclaimers/page.tsx
    │   ├── docs/page.tsx
    │   ├── faq/page.tsx
    │   ├── firm/{page,[slug]/}       # Prop firm profiles
    │   ├── leaderboard/page.tsx
    │   ├── maintenance/page.tsx
    │   ├── newsletter/page.tsx
    │   ├── pricing/page.tsx
    │   ├── privacy/page.tsx
    │   ├── propfirms/{page,[slug]/}  # Prop firm listings
    │   ├── referral/page.tsx
    │   ├── support/page.tsx
    │   ├── terms/page.tsx
    │   ├── trader/[slug]/            # Public trader profiles
    │   └── updates/{page,[slug]/}    # Changelog
    │
    ├── admin/                        # Admin-only pages
    │   ├── layout.tsx                # Admin auth guard
    │   ├── admin-client-layout.tsx   # Admin client layout
    │   ├── page.tsx                  # Admin dashboard
    │   ├── blogs/{page,new,[id]/edit}/
    │   ├── coupons/page.tsx
    │   ├── newsletter-builder/page.tsx
    │   ├── propfirms/{page,[id]/}
    │   ├── reviews/page.tsx
    │   ├── send-email/page.tsx
    │   ├── weekly-recap/page.tsx
    │   └── welcome-email/page.tsx
    │
    ├── dashboard/                    # Protected dashboard
    │   ├── layout.tsx                # Auth guard + sidebar + providers
    │   ├── page.tsx                  # Main dashboard (trades overview)
    │   ├── behavior/page.tsx
    │   ├── billing/page.tsx
    │   ├── data/page.tsx
    │   ├── import/page.tsx
    │   ├── reports/page.tsx
    │   ├── settings/page.tsx
    │   ├── strategies/page.tsx
    │   └── trader-profile/page.tsx
    │
    ├── embed/page.tsx                # Embeddable widget
    ├── shared/[slug]/page.tsx        # Public shared trade view
    │
    └── teams/                        # Teams feature
        ├── layout.tsx                # Teams root layout
        ├── (landing)/page.tsx        # Teams landing page
        ├── join/page.tsx
        ├── manage/layout.tsx         # Team management layout
        ├── manage/page.tsx
        ├── dashboard/                # Team dashboard
        │   ├── layout.tsx
        │   ├── page.tsx
        │   └── [slug]/
        │       ├── page.tsx
        │       ├── analytics/page.tsx
        │       ├── members/page.tsx
        │       ├── traders/page.tsx
        │       └── trader/[slug]/page.tsx
```

## Naming Conventions

**Files:**
- Pages: `page.tsx` (Next.js convention)
- Layouts: `layout.tsx` (Next.js convention)
- API routes: `route.ts` (Next.js convention)
- Components: `kebab-case.tsx` (e.g., `dashboard-sidebar.tsx`, `chart-card.tsx`)
- Server actions: `kebab-case.ts` (e.g., `auth.ts`, `accounts.ts`, `trades.ts`)
- Zustand stores: `kebab-case-store.ts` (e.g., `trading-domain-store.ts`, `chat-store.ts`)
- Hooks: `use-kebab-case.ts` or `use-kebab-case.tsx` (e.g., `use-mobile.tsx`, `use-debounce.ts`)
- Utilities: `kebab-case.ts` (e.g., `rate-limit.ts`, `logger.ts`, `api-response.ts`)
- Tests: `kebab-case.test.ts` or `kebab-case.test.tsx` (co-located in `tests/` or `__tests__/`)

**Directories:**
- Route groups: `(kebab-case)` (e.g., `(authentication)`, `(home)`, `(landing)`)
- Feature directories: `kebab-case` (e.g., `ai-elements`, `sidebar-primitives`, `prop-firms`)
- Domain modules: `kebab-case` in `server/` and `lib/`

## Where to Add New Code

**New Dashboard Page:**
- Page: `app/[locale]/dashboard/<feature>/page.tsx`
- Follow pattern of existing pages (server component, data from context providers)

**New Public/Marketing Page:**
- Page: `app/[locale]/(landing)/<feature>/page.tsx`
- Layout is already provided by `(landing)/layout.tsx`

**New API Endpoint:**
- Route: `app/api/<domain>/<action>/route.ts`
- Auth: Import `requireUser()` or `requireAdmin()` from `server/authz.ts`
- Response: Use `apiError()` from `lib/api-response.ts` for errors

**New Server Action:**
- File: `server/<domain>.ts`
- Must include `'use server'` directive at top of file
- Auth: Import `getUserId()` from `server/auth.ts`

**New UI Component:**
- Primitive: `components/ui/<name>.tsx` (shadcn/ui style)
- Domain component: `components/<category>/<name>.tsx`
- Pattern component: `components/patterns/<name>.tsx`

**New Zustand Store:**
- File: `store/<domain>-store.ts`
- Use `persist` middleware with `createJSONStorage(() => localStorage)` if persistence needed
- Follow `createSelectors` pattern from `store/trading-domain-store.ts`

**New React Hook:**
- File: `hooks/use-<name>.ts` or `hooks/use-<name>.tsx`
- Use `.tsx` if it contains JSX

**New Test:**
- Unit test: `tests/<category>/<name>.test.ts`
- API test: `tests/api/<name>.test.ts`
- Server test: `tests/server/<name>.test.ts`
- Lib test: `tests/lib/<name>.test.ts` or `lib/__tests__/<name>.test.ts`
- E2E test: `tests/e2e/<name>.spec.ts`

**New Utility:**
- File: `lib/<category>/<name>.ts`
- Shared helpers: `lib/<name>.ts`

## Special Directories

**`components/lazy/`**:
- Purpose: Lazy-loaded wrappers for heavy or non-critical components
- Generated: No
- Committed: Yes

**`prisma/generated/`**:
- Purpose: Prisma client code generated by `prisma generate`
- Generated: Yes (run automatically on `postinstall`)
- Committed: Yes

**`prisma/migrations/`**:
- Purpose: Database migration SQL files (100+ migrations)
- Generated: Yes (by `prisma migrate dev`)
- Committed: Yes

**`locales/en/` and `locales/fr/`**:
- Purpose: Nested translation key-value files for i18n
- Generated: No
- Committed: Yes

**`public/routes.json`**:
- Purpose: Generated route manifest for client-side navigation
- Generated: Yes (by `scripts/generate-routes.ts` in prebuild)
- Committed: Yes

**`awesome-design-md/`**:
- Purpose: Reference collection of design systems (Airbnb, Linear, Vercel, etc.)
- Generated: No
- Committed: Yes (appears to be a submodule reference)

**`styles/`**:
- Purpose: CSS files for design tokens, themes, and base styles
- Key files: `styleseed-tokens.css`, `tokens.css`, `themes.css`

**`schemas/`**:
- Purpose: JSON Schema definitions for widget I/O and risk register
- Key files: `widget-input.schema.json`, `widget-output.schema.json`

## Server vs Client Split

**Server-Only (`'use server'`):**
- All files in `server/` directory
- `server/auth.ts`, `server/accounts.ts`, `server/database.ts`, etc.

**Client-Only (`'use client'`):**
- All files in `store/` directory (Zustand stores)
- All files in `hooks/` directory (React hooks)
- All context providers: `context/`, `components/providers/`
- Component files with interactivity: AI chat, forms, sidebar, modals

**Server Components (default):**
- Page components in `app/[locale]/` (unless explicitly marked `'use client'`)
- Layout files
- API route handlers in `app/api/`

**Dynamic Imports (no SSR):**
- `components/lazy/scroll-lock-fix-lazy.tsx`
- `components/lazy/consent-banner-lazy.tsx`
- `app/[locale]/(authentication)/layout-shell.tsx` (auth layout loaded with `ssr: false`)
- Dashboard header and overlays loaded via `next/dynamic`

## File Count by Type

| Category | Directory | File Count |
|----------|-----------|------------|
| App Router (pages, layouts, API) | `app/` | 559 |
| Components | `components/` | 177 |
| Library/Utilities | `lib/` | 133 |
| Server Actions | `server/` | 37 |
| Zustand Stores | `store/` | 26 |
| React Hooks | `hooks/` | 8 |
| Context Providers | `context/` | 10 |
| Tests | `tests/` | 72 |
| Styles | `styles/` | 6 |
| Locales/i18n | `locales/` | 36 |
| **Total** | | **~1,064** |

---

*Structure analysis: 2026-04-09*
