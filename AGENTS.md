# Qunt Edge — Agent Guide

Next.js 16 + React 19 + TypeScript 5.9 + Tailwind CSS v4. Open-source trading analytics for futures/prop-firm traders. Supabase Auth + PostgreSQL (Prisma). Payments via Whop. 11 i18n locales.

## Commands

```bash
npm run dev                  # Dev server (localhost:3000)
npm run build                # Production build (clean-build-artifacts → generate-routes → sync-stack → robust-next-build with retries)
npm run lint                 # ESLint
npm run typecheck            # TS strict check (robust-typecheck.mjs wrapper)
npm run test                 # Vitest (node env, globals)
npm run test:coverage        # Vitest + v8 coverage
npm run test:payment         # Payment tests (requires RUN_PAYMENT_INTEGRATION_TESTS=true)
npm run db:sync              # Prisma generate + migrate status
npm run perf:verify          # Route budgets + bundle analysis
```

## Project Structure

All pages: `app/[locale]/*`. Route groups: `(home)/`, `(landing)/`, `(authentication)/`, `dashboard/`, `admin/`, `teams/`, `shared/[slug]/`, `embed/`.

- `proxy.ts` — Middleware (route classification, auth, CSP, CORS, i18n redirect). NOT `middleware.ts`.
- `server/` — Server actions, business logic (auth, trades, billing, AI, teams, broker syncs). Uses `'use server'`.
- `lib/` — Shared utilities. See `lib/AGENTS.md`.
- `store/` — Zustand stores (client state).
- `context/` — React context providers (data, theme, sync).
- `components/ui/` — Radix + shadcn/ui components. V2 system at `components/ui/v2/`.
- `tests/` — Vitest tests by domain (api/, server/, lib/, etc.). See `tests/AGENTS.md`.

## i18n

- Library: `next-international` (NOT `next-intl`)
- 11 locales: en, fr, hi, ja, es, it, de, pt, vi, zh, yo (de/pt/vi/zh/yo fallback to en)
- Client: `useI18n()` from `@/locales/client`
- Server: `getI18n()` from `@/locales/server`

## Visual System — Electric Obsidian

Dark-only. Void-black canvas, oklch cobalt tints (`oklch(0.65 0.22 260 / 0.03-0.08)`). Springs: `[0.22, 1, 0.36, 1]`.

**Never use**: `backdrop-blur`, `filter:blur()` in animations, `transition-all`, `repeat:Infinity` in interactive components, `bg-white/[X]` (use oklch tints), `bg-card`/`bg-muted` (use oklch tints), `variant="error"` (use `"destructive"`), `variant="accent"` (use `"info"`), cursor-tracking `onMouseMove`, hardcoded hex colors (use semantic tokens or oklch).

Use `scroll-smooth-butter` for scroll containers. `rounded-xl` for cards/dialogs/popovers.

## Data & State

- **Server reads**: `'use cache'` + `cacheLife`/`cacheTag` — NOT `unstable_cache`/`revalidateTag`
- **Mutations**: Server actions → `updateTag()` for invalidation
- **Client state**: Zustand with persist middleware. `useTradingDomainStore` is SSOT for trades.
- **Build**: `next.config.ts` delegates to `lib/performance/next-config.ts`. `typescript: { ignoreBuildErrors: true }`.
- **Barrel exports**: In cached server modules (e.g. `server/database.ts`), use explicit named re-exports, never `export *`.
- **Route handlers depending on request/cookies**: Call `await connection()` at top to avoid prerender bailout.

## Auth & Payments

- **Auth**: Supabase Auth via `@supabase/ssr`. Server client: `server/auth.ts` → `createClient()`. Guards: `server/authz.ts` → `requireUser()`, `requireAdmin()`, `isAdminUser()`.
- **Payments**: Whop (NOT Stripe, even though Stripe SDK is installed). Webhook: `/api/whop/webhook`. Plans: `lib/plan-configs.ts`.

## Prisma

- Generated client: `@/prisma/generated/prisma` (NOT `@prisma/client`)
- Singleton: `lib/prisma.ts`. Serverless-safe pool defaults: `PG_POOL_MAX=5`, `PG_POOL_MIN=0`.
- Build checks DB health. Failures expected without local services — not a code regression.
- Connection URL precedence: `POSTGRES_PRISMA_URL` > `POSTGRES_URL` > `DATABASE_URL` > `DIRECT_URL` > `POSTGRES_URL_NON_POOLING`

## Key Packages

Both `framer-motion` (^11) and `motion` (^12) installed. Recharts for charts. `@dnd-kit` for drag-drop. `@tiptap` for journaling. Remotion for video. Tailwind CSS v4.

## Anti-patterns

- **No** `as any` / `@ts-ignore` / `@ts-expect-error` (tests: 3 exceptions)
- **No** `console.log` — use `console.warn`/`console.error`
- **No** hardcoded hex colors — use semantic tokens or oklch values
- **No** arbitrary border-radius — use Tailwind scale (`rounded-xl`)
- **No** synthesized fallback data — return explicit empty/unavailable
- **No** module-scope Supabase admin client — init inside each action with env validation
- **No** setState in effects — prefer callback-driven resets
- **No** Trading Score duplication — always use `lib/score-calculator.ts` → `deriveScoreMetricsFromTrades()`

## Widget System

~35 widget types in `app/[locale]/dashboard/config/widget-registry.tsx`. Sizes: `'tiny' | 'small' | 'small-long' | 'medium' | 'large' | 'extra-large'`.

## Feature Flags

`lib/feature-flags.ts` controls server bootstrap, UI variants, etc. Check before assuming a feature is universally available.

## .env.example

Must include every runtime `process.env.*` reference across the codebase. Update when adding new env vars.

## Subdirectory AGENTS.md

- `lib/AGENTS.md` — Utility modules, dependency graph, key exports
- `server/AGENTS.md` — Server business logic, cache patterns, action inventory
- `tests/AGENTS.md` — Test patterns, mocking, CI pipeline
- `app/[locale]/dashboard/AGENTS.md` — Dashboard architecture, widget system, data flow

> When working on a feature, read the relevant subdirectory AGENTS.md first.
