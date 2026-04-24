# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Qunt Edge is an open-source trading analytics platform built with Next.js 16 (App Router) + React 19 + TypeScript. It connects to brokers (Tradovate, Rithmic, MT5, IBKR) for trade import, provides dashboard analytics with drag-and-drop widgets, AI-powered journaling, and team collaboration. Licensed under CC-BY-NC-4.0.

## Commands

```bash
# Development
npm run dev                # Next.js dev server (localhost:3000)
npm run dev:bun            # Bun dev server

# Building
npm run build              # Production build (runs db:sync + route generation first)
npm run build:bun          # Bun build

# Type checking & linting
npm run typecheck          # TypeScript strict check (via robust-typecheck wrapper)
npm run lint               # ESLint

# Testing
npm run test               # Vitest (node environment)
npm run test:coverage      # Vitest with v8 coverage
npm run test:payment       # Payment-specific tests (requires RUN_PAYMENT_INTEGRATION_TESTS=true)

# Database
npx prisma generate        # Generate Prisma client
npx prisma db push         # Push schema (dev)
npx prisma migrate deploy  # Run migrations (prod)

# Performance checks
npm run perf:verify        # Route budgets + bundle analysis
npm run perf:ci            # Full perf CI pipeline (dead code, security, budgets, headers, lighthouse)

# Quality checks
npm run check:dead-code    # Find unused exports
npm run check:route-budgets # Verify route size limits
npm run check:route-security # Security audit on routes
npm run analyze:bundle     # Bundle size analysis
```

## Architecture

### Routing & Layouts

All pages live under `app/[locale]/` with locale-based routing (en, fr, hi, ja, es, it, de, pt, vi, zh, yo). Key route groups:

- `(home)/` — Landing/marketing page (server components with dynamic imports for heavy sections)
- `(authentication)/` — Auth pages (login, signup)
- `(landing)/` — Public marketing pages
- `dashboard/` — Authenticated trading dashboard (server auth check in layout.tsx, redirects to auth if no session)
- `admin/` — Admin panel (requires `isAdminUser()`)
- `teams/` — Team management with nested dashboards
- `api/` — API routes (auth, ai, stripe, whop, mt5, cron, health)

The root layout (`app/layout.tsx`) loads 7 Google fonts (Geist, Cormorant Garamond, IBM Plex Mono, DM_Sans, Outfit, Poppins, Roboto) as CSS variables. The `[locale]/layout.tsx` wraps children in `I18nProviderClient` from `next-international`.

### Server vs Client Components

- **Server components** (default): Landing page sections (Hero, FeaturesBento, HowItWorks, FinalCTA), layouts, API routes
- **Client components** (`'use client'`): Dashboard pages, interactive widgets, charts, Remotion player, stores
- **Server-only modules**: `server/` directory uses `'use server'` directive. Import `server-only` package to enforce
- `next/dynamic` is used for code splitting heavy client components (Remotion, RadarChart, PricingSection). Cannot use `ssr: false` in server components
- `cacheComponents: true` is enabled in Next.js config — do not add `export const revalidate` to pages as they are incompatible

### Authentication & Authorization

- **Auth**: Supabase Auth via `@supabase/ssr` with `createServerClient`. Session managed through cookies
- **Server-side**: `createClient()` from `server/auth.ts` — wraps Supabase for server contexts
- **Route protection**: Dashboard layout checks `supabase.auth.getUser()` and redirects to auth page if no session
- **Admin check**: `server/authz.ts` exports `isAdminUser()`
- **Security**: Rate limiting (`lib/rate-limit.ts`), auth attempt tracking, password validation, CSP headers

### Internationalization (next-international)

- **Client**: `useI18n()` / `useTypedI18n()` from `locales/client.ts` — for `'use client'` components
- **Server**: `getI18n()` / `getTypedI18n()` from `locales/server.ts` — for server components
- Translation files: `locales/en.ts` (primary), `locales/fr.ts` (French), others fallback to English
- Supported locales configured in both client and server i18n setup

### State Management

- **Zustand stores** (`store/`): Client-side state — 25+ stores for accounts, calendar, chat, equity chart, filters, table config, etc.
- **React Context** (`context/`): `DataProvider` pattern with bootstrap/providers for dashboard data flow
- **Server Actions**: Data mutations via `server/*.ts` files (trades, accounts, journal, billing, etc.)
- **API Routes**: Public-facing endpoints with caching in `app/api/`

### Data Layer

- **ORM**: Prisma with PostgreSQL (Supabase). Schema at `prisma/schema.prisma`
- **Connection**: `DATABASE_URL` for runtime (transaction pooler port 6543), `DIRECT_URL` for migrations
- **Server bootstrap**: `server/dashboard-bootstrap.ts` provides optional server-side data loading for first paint (feature-flagged via `shouldUseServerBootstrap`)
- **Broker syncs**: Tradovate (`server/imports/tradovate-actions.ts`), Rithmic (`server/imports/rithmic-sync-actions.ts`), MT5 (Python worker service — separate from this repo)

### UI & Design System

- **Components**: Radix UI primitives (`components/ui/`) with shadcn/ui patterns
- **Styling**: Tailwind CSS 4 with OKLCH color space tokens
- **Animations**: Both `framer-motion` (^11) and `motion` (^12) are installed (migration recommended)
- **Charts**: Recharts for dashboard visualizations (RadarChart, ResponsiveContainer)
- **Video**: Remotion (`@remotion/player`) for animated product demo on landing page
- **Editor**: TipTap rich text editor for journaling with collaboration (Yjs)
- **Dashboard widgets**: Drag-and-drop via `@dnd-kit` with `react-grid-layout`. Widget registry at `app/[locale]/dashboard/config/widget-registry.tsx`

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `server/` | Server-side business logic (auth, trades, billing, AI, teams) |
| `store/` | Zustand client state stores |
| `context/` | React Context providers (data, theme, sync) |
| `lib/` | Shared utilities (analytics, AI, security, performance, formatting) |
| `hooks/` | Custom React hooks |
| `components/ui/` | Base UI components (Radix-based) |
| `components/providers/` | Dashboard and root-level providers |
| `components/sidebar/` | Dashboard sidebar navigation |
| `prisma/` | Database schema and migrations |
| `scripts/` | Build, deploy, and automation scripts |
| `docs/` | Feature documentation and runbooks |

## Key Patterns

### Path Aliases
- `@/*` maps to project root
- `@lib/*` maps to `./lib/*`

### Payment Integration (Whop)
- Webhook wired in `server/webhook-service.ts` at `/api/whop/webhook`
- Plan configs must stay in sync with Whop dashboard
- Required env vars: `WHOP_API_KEY`, `WHOP_COMPANY_ID`, `WHOP_WEBHOOK_SECRET`

### Performance Configuration
- `lib/performance/next-config.ts` exports `createOptimizedNextConfig()` — central place for all Next.js config
- `optimizePackageImports` covers 30+ heavy libraries for tree shaking
- `serverExternalPackages`: `['pdf2json', 'canvas', 'sharp']` — native modules that must stay outside bundle

### Feature Flags
- `lib/feature-flags.ts` controls features like server bootstrap, dark-only surfaces, UI variants
- Check this before assuming a feature is universally available

### Build Notes
- Build uses `robust-next-build.mjs` wrapper with 8GB memory limit
- `prebuild` runs cleanup + route generation scripts
- Database/Redis connection errors during build are expected (no local services) and do not cause failures
