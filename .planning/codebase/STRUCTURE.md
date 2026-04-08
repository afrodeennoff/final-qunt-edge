# Codebase Structure

**Analysis Date:** 2026-04-08

## Directory Layout

```
qunt-edge/
├── app/                    # Next.js App Router (pages, layouts, API routes)
│   ├── api/                # REST API route handlers (~50 endpoints)
│   └── [locale]/           # Locale-prefixed routes (en, fr)
│       ├── (authentication)/ # Auth route group
│       ├── (home)/           # Homepage route group
│       ├── (landing)/        # Public marketing pages route group
│       ├── admin/            # Admin panel
│       ├── dashboard/        # Protected trading dashboard
│       ├── embed/            # Embeddable widget
│       ├── shared/           # Shared trade views
│       └── teams/            # Teams feature
├── components/             # React components (shared + feature-specific)
│   ├── ui/                  # Shadcn UI primitives (~70 components)
│   ├── sidebar/             # Dashboard & landing sidebars
│   ├── providers/           # Client-side provider components
│   ├── layout/              # Layout shell components
│   ├── auth/                # Authentication UI components
│   ├── emails/              # React Email templates
│   ├── icons/               # Custom icon components
│   ├── animation/           # Animation utilities
│   ├── ai-elements/         # AI-specific UI elements
│   ├── tiptap/              # Rich text editor extensions
│   └── lazy/                # Lazy-loaded component wrappers
├── server/                 # Server action modules ('use server')
│   └── imports/             # Import action modules (rithmic, tradovate)
├── store/                  # Zustand client state stores
│   └── filters/             # Dashboard filter stores
├── context/                # React Context providers
│   └── providers/           # Data context sub-providers
├── lib/                    # Shared utilities, domain logic, configurations
│   ├── ai/                  # AI module (policy, safety, cache, telemetry)
│   ├── analytics/           # Financial analytics (VaR, metrics)
│   ├── cache/               # Cache invalidation
│   ├── config/              # App configuration
│   ├── constants/           # App constants
│   ├── domain/              # Domain types and logic
│   ├── formatting/          # Number/date/currency formatting
│   ├── performance/         # Performance monitoring and config
│   ├── prop-firms/          # Prop firm data logic
│   ├── security/            # Security utilities (auth, tokens, CSP)
│   ├── supabase/            # Supabase client helpers
│   └── __tests__/           # Lib unit tests
├── hooks/                  # Shared React hooks
├── types/                  # Global TypeScript type declarations
├── schemas/                # JSON Schema files
├── locales/                # i18n translation files
│   ├── en/                  # English translations (~14 files)
│   └── fr/                  # French translations (~14 files)
├── prisma/                 # Prisma ORM
│   ├── schema.prisma        # Database schema (50+ models)
│   ├── generated/           # Prisma generated client
│   ├── migrations/          # Database migrations (~100)
│   └── seeders/             # Database seeders
├── scripts/                # Build, deploy, and analysis scripts
├── styles/                 # Global styles and CSS tokens
├── public/                 # Static assets
├── content/                # Content files (updates)
├── tests/                  # Test configurations and fixtures
├── docs/                   # Project documentation
├── mt5_import_service/     # MT5 import service module
└── tasks/                  # Task definitions
```

## Directory Purposes

### `app/` -- Next.js App Router
- Purpose: File-system based routing, page components, layouts, and API routes
- Contains: `layout.tsx`, `page.tsx`, `route.ts`, `actions.ts`, `error.tsx`, `not-found.tsx`
- Key entry: `app/layout.tsx` (root layout with fonts, metadata, analytics)

### `app/api/` -- REST API Endpoints
- Purpose: External-facing HTTP endpoints
- Structure: `app/api/{domain}/{resource}/route.ts`
- Key domains: `ai/`, `auth/`, `cron/`, `deals/`, `email/`, `imports/`, `mt5/`, `team/`, `tradovate/`, `whop/`
- Pattern: Export `async function GET/POST/PUT/DELETE(req: NextRequest)` returning `NextResponse`

### `app/[locale]/` -- Locale-Prefixed Routes
- Purpose: Internationalized page routes supporting `en` and `fr`
- Structure: Route groups `(landing)`, `(authentication)`, `(home)` organize pages with different layouts
- Key route groups:
  - `(landing)/` -- Public SEO pages (blogs, pricing, deals, FAQ, docs, propfirms, leaderboard)
  - `(authentication)/` -- Login, signup, forgot/reset password, import
  - `(home)/` -- Homepage `/` route
  - `dashboard/` -- Protected trading dashboard (main app)
  - `admin/` -- Admin panel (blogs, coupons, newsletters, emails, propfirms, reviews)
  - `teams/` -- Team management (landing, dashboard, members, analytics)
  - `shared/[slug]/` -- Shared trade views

### `app/[locale]/dashboard/` -- Trading Dashboard
- Purpose: Core application feature -- trade journaling, analytics, import, settings
- Contains: Pages for main dashboard, behavior, billing, data, import, reports, settings, strategies, trader-profile
- Sub-directories:
  - `components/` -- Dashboard-specific components (accounts, analysis, calendar, charts, chat, filters, import, mindset, statistics, tables, widgets, skeletons)
  - `components/import/` -- Import integrations (atas, etp, ftmo, ibkr-pdf, manual, ninjatrader, quantower, rithmic, thor, topstep, tradezella, tradovate)
  - `components/chat/` -- AI chat interface
  - `config/` -- Dashboard configuration
  - `types/` -- Dashboard-specific type definitions

### `components/` -- React Components
- Purpose: Shared and feature-specific UI components
- Key sub-directories:
  - `ui/` -- Shadcn UI component library (~70 primitives: button, dialog, form, table, sidebar, etc.)
  - `ui/v2/` -- Next-generation UI components
  - `ui/sidebar-primitives/` -- Sidebar building blocks
  - `providers/` -- Client providers (root-providers, query-provider, dashboard-providers)
  - `sidebar/` -- Dashboard and landing page sidebars
  - `layout/` -- Layout shell components (unified-page-shell)
  - `auth/` -- Authentication UI (login forms, auth timeout)
  - `emails/` -- React Email templates (blog, newsletter)
  - `lazy/` -- Lazy-loaded wrappers for code splitting (consent-banner, scroll-lock-fix)
  - `animation/` -- Animation primitives
  - `ai-elements/` -- AI chat UI elements
  - `tiptap/` -- TipTap rich text editor extensions and components
  - `magicui/` -- Magic UI animation components
  - `icons/` -- Custom icon components
  - `animated-icons/` -- Animated SVG icons

### `server/` -- Server Actions
- Purpose: Server-side functions callable from client components via React server action protocol
- Pattern: All files start with `'use server'` directive
- Key modules:
  - `server/auth.ts` -- Supabase auth client creation, sign-up, sign-in, ensureUserInDatabase
  - `server/authz.ts` -- Authorization helpers (isAdmin, requireUser, requireAdmin, requireCronAuth)
  - `server/trades.ts` -- Trade CRUD operations with Zod validation
  - `server/accounts.ts` -- Account management, metrics, balance calculations
  - `server/database.ts` -- Re-exports from trades, layouts, groups modules
  - `server/groups.ts` -- Account group management
  - `server/layouts.ts` -- Dashboard widget layout persistence
  - `server/subscription.ts` -- Subscription status queries
  - `server/payment-service.ts` -- Payment/checkout with Whop SDK
  - `server/webhook-service.ts` -- Whop webhook event processing
  - `server/teams.ts`, `server/referral.ts`, `server/billing.ts` -- Feature modules
  - `server/financial-events.ts`, `server/equity-chart.ts`, `server/tick-details.ts` -- Data modules

### `store/` -- Zustand State Management
- Purpose: Client-side state stores using Zustand
- Pattern: `create<StateType>()((set, get) => ({ ... }))`
- Key stores:
  - `user-store.ts` -- Central store: user, accounts, groups, tags, subscription, dashboard layout
  - `chat-store.ts` -- AI chat messages (Vercel AI SDK `UIMessage[]`)
  - `analysis-store.ts` -- Analysis state
  - `equity-chart-store.ts`, `financial-events-store.ts`, `tick-details-store.ts` -- Feature stores
  - `modal-state-store.ts`, `notification.ts` -- UI state stores
  - `rithmic-sync-store.ts`, `tradovate-sync-store.ts` -- Import sync status
  - `filters/` -- Dashboard filter stores (accounts, calendar, news, etc.)
  - `table-config-store.ts`, `toolbar-settings-store.ts` -- UI preference stores

### `context/` -- React Context Providers
- Purpose: Cross-cutting state management for the dashboard
- Key files:
  - `data-provider.tsx` -- Central dashboard data orchestrator (~2000 lines)
  - `theme-provider.tsx` -- Theme switching (dashboard vs fixed-blue scope)
  - `sync-context.tsx` -- Data synchronization state
  - `rithmic-sync-context.tsx`, `tradovate-sync-context.tsx` -- Import sync contexts
  - `providers/data-state-provider.tsx` -- Exposes loading, trades, accounts, filters
  - `providers/data-derived-provider.tsx` -- Computed statistics and formatted data
  - `providers/data-actions-provider.tsx` -- Action dispatching interface
  - `providers/ui-provider.tsx` -- UI state convenience hook

### `lib/` -- Shared Utilities and Business Logic
- Purpose: Pure functions, utilities, domain logic, infrastructure clients
- Key modules:
  - `prisma.ts` -- Prisma singleton with pg adapter and connection pooling
  - `supabase.ts` -- Browser-side Supabase client
  - `logger.ts` -- Structured JSON logger with PII redaction
  - `ai/` -- AI policy, safety, caching, route guarding, usage budgets
  - `analytics/` -- Financial analytics (VaR calculations, metric definitions)
  - `security/` -- Auth config, password validation, OAuth state, CSP, token crypto
  - `cache/` -- Cache invalidation coordination
  - `performance/` -- Next.js config optimization, runtime monitoring
  - `formatting/` -- Number, date, currency formatting
  - `domain/` -- Domain types and business logic
  - `config/` -- Application configuration
  - `constants/` -- App-wide constants (dashboard themes, sidebar tokens)
  - `prop-firms/` -- Prop firm matching and comparison logic
  - `validation-schemas.ts` -- Shared Zod validation schemas
  - `utils.ts` -- General utilities (cn, clsx+tailwind-merge)
  - `api-response.ts` -- Standardized API error responses
  - `api-auth.ts` -- Secure token generation
  - `redis-client.ts` -- Redis client for cache invalidation
  - `rate-limit.ts` -- Rate limiting utilities
  - `feature-flags.ts` -- Feature flag system with gradual rollout
  - `seo.ts` -- SEO metadata helpers
  - `stripe-helpers.ts`, `whop.ts`, `whop-checkout.ts` -- Payment integrations

### `hooks/` -- Shared React Hooks
- Purpose: Reusable client-side React hooks
- Contains: `use-auto-scroll.ts`, `use-currency.ts`, `use-debounce.ts`, `use-hash-upload.ts`, `use-keyboard-shortcuts.ts`, `use-media-query.ts`, `use-mobile.tsx`, `use-navigation-loading.tsx`

### `locales/` -- Internationalization
- Purpose: Translation string files
- Structure: `locales/{locale}/{domain}.ts` (e.g., `locales/en/auth.ts`, `locales/fr/pricing.ts`)
- Domains: admin, auth, chat, dropzone, embed, faq, landing, mindset, pricing, propfirm, referral, shared, teams, terms

### `prisma/` -- Database
- Purpose: Prisma schema, migrations, and generated client
- Key files: `schema.prisma` (50+ models), `generated/prisma/` (Prisma Client output)
- Major model domains: User/Auth, Trading (Trade, Account, Group, Payout), Subscription/Payment, Teams, Business, PropFirms, Blog/Community, AI usage

### `scripts/` -- Build and Operations Scripts
- Purpose: Build tooling, deployment, analysis, and monitoring
- Key scripts: `robust-next-build.mjs`, `robust-typecheck.mjs`, `sync-stack.mjs`, `generate-routes.ts`, `smoke-http.mjs`, `vps-deploy-bun.sh`
- Analysis: `check-route-budgets.mjs`, `check-route-security.mjs`, `check-dead-code.mjs`, `analyze-bundle.mjs`
- Performance: `perf-baseline.mjs`, `perf-lighthouse.mjs`, `perf-dashboard-runtime.mjs`, `perf-header-check.mjs`

### `styles/` -- Global Styles
- Purpose: CSS tokens and theme definitions
- Contains: `tailwind-theme.ts`, `themes.css`, `tokens.css`

### `public/` -- Static Assets
- Purpose: Static files served directly
- Contains: Favicons, Open Graph images, logos, manifest.json, service worker, route manifest

## Key File Locations

**Entry Points:**
- `app/layout.tsx` -- Root layout (fonts, metadata, analytics)
- `app/[locale]/layout.tsx` -- Locale layout (i18n, consent)
- `app/[locale]/dashboard/layout.tsx` -- Dashboard layout (auth gate, sidebar, providers)
- `app/[locale]/dashboard/page.tsx` -- Dashboard main page (tab-based: widgets, table, accounts, chart)
- `app/[locale]/(landing)/layout.tsx` -- Marketing pages layout

**Configuration:**
- `next.config.ts` -- Next.js configuration (MDX, redirects, performance)
- `tsconfig.json` -- TypeScript configuration (path aliases: `@/*`, `@lib/*`)
- `components.json` -- Shadcn UI configuration (new-york style, `@/components/ui` path)
- `tailwind.config.ts` -- Tailwind CSS configuration
- `postcss.config.mjs` -- PostCSS configuration
- `vercel.json` -- Vercel deployment config (crons, build command)
- `eslint.config.mjs` -- ESLint configuration
- `vitest.config.ts` -- Vitest test configuration
- `playwright.config.ts` -- Playwright E2E test configuration
- `prisma/schema.prisma` -- Database schema
- `prisma.config.ts` -- Prisma configuration
- `docker-compose.yml`, `Dockerfile`, `Dockerfile.bun` -- Docker configuration
- `nixpacks.toml` -- Nixpacks build configuration

**Core Logic:**
- `server/auth.ts` -- Authentication (Supabase server client, sign-up/in)
- `server/authz.ts` -- Authorization (admin, user, cron, service access)
- `server/trades.ts` -- Trade CRUD with validation
- `server/accounts.ts` -- Account management and metrics
- `lib/prisma.ts` -- Database client singleton
- `lib/supabase.ts` -- Browser Supabase client
- `context/data-provider.tsx` -- Central dashboard data orchestrator
- `store/user-store.ts` -- Central client state store

**API Layer:**
- `app/api/whop/webhook/route.ts` -- Payment webhook receiver
- `app/api/ai/chat/route.ts` -- AI chat endpoint
- `app/api/auth/callback/route.ts` -- OAuth callback
- `app/api/ai/analyze/route.ts` -- Trade analysis
- `app/api/cron/investing/route.ts` -- Investing data cron
- `lib/api-response.ts` -- Standardized API error responses

**Testing:**
- `vitest.config.ts` -- Unit test configuration
- `vitest.payment.config.ts` -- Payment-specific test configuration
- `playwright.config.ts` -- E2E test configuration
- `components/sidebar/__tests__/` -- Sidebar component tests
- `lib/__tests__/` -- Library unit tests

## Naming Conventions

**Files:**
- Page components: `page.tsx`
- Layout components: `layout.tsx`, `*-layout-shell.tsx`
- API routes: `route.ts`
- Server actions: `actions.ts` (in page directories), `*.ts` (in `server/` directory)
- React components: `kebab-case.tsx` (e.g., `dashboard-header.tsx`, `filter-command-menu.tsx`)
- Stores: `kebab-case-store.ts` (e.g., `user-store.ts`, `chat-store.ts`)
- Context providers: `kebab-case-provider.tsx` (e.g., `data-state-provider.tsx`)
- Hooks: `use-kebab-case.ts` (e.g., `use-mobile.ts`, `use-debounce.ts`)
- Utility modules: `kebab-case.ts` (e.g., `date-utils.ts`, `financial-math.ts`)
- Type definition files: `*.d.ts` or `types/*.ts`

**Directories:**
- Route groups: `(descriptive-name)/` in parentheses
- Dynamic routes: `[param]/` in brackets
- Catch-all routes: `[...param]/` in ellipsed brackets
- Component co-location: `components/` within route directories for page-specific components
- Feature organization: Domain-based grouping (e.g., `import/rithmic/`, `import/tradovate/`)

**Imports / Path Aliases:**
- `@/*` maps to project root (e.g., `@/components/ui/button`)
- `@lib/*` maps to `lib/` directory (e.g., `@lib/prisma`)

## Where to Add New Code

**New Dashboard Feature (page + components):**
- Page: `app/[locale]/dashboard/{feature}/page.tsx`
- Components: `app/[locale]/dashboard/components/{feature}/`
- Server actions: `server/{feature}.ts` (new file with `'use server'`)
- Client state: `store/{feature}-store.ts` (if needed)
- Types: `app/[locale]/dashboard/types/` or `types/`

**New API Endpoint:**
- Route: `app/api/{domain}/{resource}/route.ts`
- Auth: Use `requireUser()` or `requireAdmin()` from `server/authz.ts`
- Errors: Use `apiError()` from `lib/api-response.ts`
- Logging: Use `logger` from `lib/logger.ts`

**New Shared UI Component:**
- Component: `components/ui/{component-name}.tsx` (follows Shadcn new-york style)
- Export: Add to `components/ui/index.ts` barrel file

**New Public/Landing Page:**
- Page: `app/[locale]/(landing)/{page-name}/page.tsx`
- Co-located components: `app/[locale]/(landing)/{page-name}/components/`
- Translations: Add keys to `locales/en/{domain}.ts` and `locales/fr/{domain}.ts`

**New Admin Feature:**
- Page: `app/[locale]/admin/{feature}/page.tsx`
- Components: `app/[locale]/admin/components/{feature}/`
- Server actions: `server/{feature}.ts`

**New Utility or Business Logic:**
- Utility: `lib/{domain}/{utility-name}.ts`
- Domain logic: `lib/domain/`
- Analytics: `lib/analytics/`
- Tests: `lib/__tests__/{utility-name}.test.ts`

**New Zustand Store:**
- Store file: `store/{feature}-store.ts`
- Filter store: `store/filters/{feature}-filter-store.ts`

**New Team Feature:**
- Landing: `app/[locale]/teams/(landing)/{feature}/page.tsx`
- Dashboard: `app/[locale]/teams/dashboard/{feature}/page.tsx`
- Server module: `server/{feature}.ts` (or extend `server/teams.ts`)

## Special Directories

**`prisma/generated/`:**
- Purpose: Prisma Client generated code
- Generated: Yes (via `prisma generate`, runs on `postinstall`)
- Committed: Yes

**`prisma/migrations/`:**
- Purpose: Database migration history
- Generated: Yes (via `prisma migrate`)
- Committed: Yes

**`public/routes.json`:**
- Purpose: Route manifest for client-side navigation
- Generated: Yes (via `scripts/generate-routes.ts` during prebuild)
- Committed: Yes

**`node_modules/`:**
- Purpose: Dependencies
- Generated: Yes
- Committed: No

**`.next/`:**
- Purpose: Next.js build output
- Generated: Yes
- Committed: No

**`locales/`:**
- Purpose: i18n translation files
- Generated: No
- Committed: Yes
- Pattern: Each locale has identically-named domain files (mirror structure between `en/` and `fr/`)

**`schemas/`:**
- Purpose: JSON Schema files for widget I/O and policy manifests
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-04-08*
