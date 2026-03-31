# PROJECT KNOWLEDGE BASE

**Generated:** 2026-03-30
**Commit:** 6b191e8
**Branch:** v2

## OVERVIEW

Qunt Edge — open-source trading analytics platform for professional futures/prop-firm traders. Multi-surface Next.js 15 app with public marketing, authenticated dashboard, teams, admin, AI assistant, broker integrations, and payment lifecycle.

## STRUCTURE

```
qunt-edge/
├── app/                    # Next.js App Router (77 pages, 57 API routes, 12 layouts)
│   ├── [locale]/           # i18n dynamic segment (en, fr)
│   │   ├── (home)/         # Home page
│   │   ├── (landing)/      # Marketing pages (propfirms, deals, blogs, community, etc.)
│   │   ├── (authentication)/ # Sign-in/sign-up
│   │   ├── dashboard/      # Authenticated trading dashboard (widgets, charts, imports)
│   │   ├── admin/          # Admin panel (blogs, propfirms, coupons, newsletter)
│   │   ├── teams/          # Team collaboration
│   │   ├── shared/[slug]/  # Public shared dashboard views
│   │   └── embed/          # Embeddable chart frame
│   └── api/                # HTTP API (ai, deals, cron, mt5, tradovate, whop)
├── components/
│   ├── ui/                 # 61 shadcn/ui components (Radix + CVA)
│   ├── ui/v2/              # V2 design system (CardV2, ButtonV2, BadgeV2)
│   ├── ai-elements/        # 20 AI chat/response components
│   ├── emails/             # 10 React-email templates
│   └── animation/          # Framer Motion abstractions
├── server/                 # 32 server-side business logic modules
├── lib/                    # 63 shared utilities (see lib/AGENTS.md)
├── store/                  # 27 Zustand stores
├── context/                # 10 React context providers
├── prisma/                 # Schema (50+ models) + 99 migrations
├── scripts/                # 28 build/dev/analysis scripts
├── locales/                # next-international (en, fr)
├── proxy.ts                # Middleware (route classification, auth, CSP, i18n)
└── docs/                   # 61 documentation files
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add/modify a page | `app/[locale]/(landing)/*/page.tsx` | Public pages use (landing) layout |
| Add dashboard feature | `app/[locale]/dashboard/components/` | See dashboard/AGENTS.md |
| Add API endpoint | `app/api/*/route.ts` | Auth via `proxy.ts` classification |
| Add server action | `app/[locale]/*/actions/` or `server/*.ts` | Mutations invalidate cache tags |
| Add UI component | `components/ui/` | Use V2 imports for new work |
| Add Zustand store | `store/*.ts` | 27 stores, most with persist middleware |
| Add chart | `app/[locale]/dashboard/components/charts/` | Recharts + ChartSurface wrapper |
| Add AI tool | `app/api/ai/chat/tools/` | 17 tools, intent-scoped |
| Add email template | `components/emails/` | React-email + Tailwind |
| Add server read helper | `server/*.ts` | Use `use cache` with cacheLife/cacheTag |
| Fix import/broker sync | `server/imports/`, `context/*sync-context.tsx` | Tradovate, Rithmic, MT5 |
| Fix auth issue | `server/auth.ts`, `proxy.ts`, `server/authz.ts` | Supabase Auth |
| Fix payment issue | `server/webhook-service.ts`, `server/billing.ts` | Whop webhooks |
| SEO/metadata | `lib/seo.ts`, `app/sitemap.ts`, `app/robots.ts` | buildPublicMetadata + JSON-LD |
| Middleware/routing | `proxy.ts` | Route classification, CSP, auth boundary |

## CONVENTIONS

- **i18n**: `useI18n()` hook from `@/locales/client`. Locale files in `locales/{en,fr}/*.ts`.
- **Path aliases**: `@/*` → `./`, `@lib/*` → `./lib/*`
- **Prettier**: No semicolons, single quotes, trailing commas, 100 char width
- **ESLint**: `no-explicit-any` = ERROR, `no-console` = ERROR (warn/error only), complexity ≤ 10
- **TypeScript**: Strict mode, bundler resolution, ES2017 target
- **Dark-only theme**: No light mode exists. All surfaces are dark.
- **State management**: Zustand with persist middleware. `useTradingDomainStore` is source of truth for trades.
- **Data flow**: Server Components → cached functions (`use cache`) → Prisma. Mutations → server actions → `updateTag()`.

## ANTI-PATTERNS (THIS PROJECT)

- **No `as any`** — ESLint error. Use proper types. 35+ instances exist as tech debt.
- **No `@ts-ignore`/`@ts-expect-error`** — ESLint error. Tests only exception (3 instances).
- **No `console.log`** — ERROR level. Use `console.warn` or `console.error`.
- **No hardcoded hex colors** — Use semantic tokens (`--primary`, `--mk-*`).
- **No arbitrary border-radius** — Use Tailwind scale (`rounded-xl`, `rounded-2xl`).
- **No `unstable_cache`/`revalidateTag`** — Use `use cache` + `cacheLife`/`cacheTag` + `updateTag`.
- **No route segment exports** — No `dynamic`/`revalidate` in `app/**/route.ts` with cache components.
- **No synthesized fallback data** — Deals API returns explicit empty/unavailable, not fake metrics.
- **No module-scope Supabase admin client** — Initialize inside each action with env validation.
- **No setState in effects** — Prefer callback-driven resets over effect-driven.
- **No stacked/double frames** — Don't wrap Card components inside bordered panels in dashboard.
- **No Trading Score duplication** — Always use `lib/score-calculator.ts` → `deriveScoreMetricsFromTrades()`.

## COMMANDS

```bash
npm run dev                    # Start dev server
npm run build                  # Production build (robust-next-build.mjs with retries)
npm run lint                   # ESLint (warning budget: 1546 max)
npm run typecheck              # TypeScript strict check
npm run test                   # Vitest unit tests
npm run test:coverage          # Tests with V8 coverage
npm run test:payment           # Payment integration tests (opt-in)
npm run db:sync                # Prisma generate + migrate status
npm run self-heal              # Auto-fix common issues
npm run check:route-budgets    # Bundle size validation
npm run check:route-security   # Route security analysis
npm run analyze:bundle         # Bundle analysis
```

## NOTES

- **Build requires DB**: `npm run build` checks Prisma migration status against `localhost:5432`. If unavailable, record env blocker, don't treat as code regression.
- **Proxy build race**: `.next/server/proxy.js` ENOENT = transient race. Use `scripts/robust-next-build.mjs` retries.
- **i18n library**: `next-international` (NOT next-intl). Locales: en, fr.
- **Middleware**: `proxy.ts` (NOT middleware.ts). Handles route classification, auth, CSP, CORS, i18n redirect.
- **Firm detail routing**: In `app/[locale]/(landing)/firm/[slug]/page.tsx`, alias slug redirects must only target canonical slugs that resolve in DB; otherwise redirect to `/${locale}/propfirms`.
- **V2 components**: Re-exports of V1 (`CardV2 = Card`). Use V2 imports for new work: `import { CardV2 as Card } from '@/components/ui/v2'`.
- **Auth sync Prisma reads**: In `ensureUserInDatabase` and similar auth-critical user flows, never use implicit full-row Prisma reads. Always use explicit minimal `select` and add schema-mismatch fallback for `auth_user_id` lookups.
- **User id resolver precedence**: Keep auth-id resolution consistent across `server/auth.ts`, `server/trades.ts`, and `server/team-membership.ts` — when `id` and `auth_user_id` diverge, prefer the `auth_user_id` mapped `User.id` row first.
- **Dashboard sidebar shell**: Keep `DashboardSidebar` in `app/[locale]/dashboard/layout.tsx` as a direct import (not dynamic with placeholder rails). Navigation is part of the core shell contract.
- **Mobile mode detection**: `hooks/use-mobile.tsx` should derive state from `matchMedia(...).matches` / `MediaQueryListEvent.matches`, not `window.innerWidth` snapshots.
- **Dashboard layout bootstrap**: In `context/data-provider.tsx`, if `getDashboardLayout` fails, immediately seed default dashboard layout for the active user (do not leave layout null).
- **Widget system**: 35+ widget types in `app/[locale]/dashboard/config/widget-registry.tsx`. `WidgetSize = 'tiny' | 'small' | 'small-long' | 'medium' | 'large' | 'extra-large'`.
- **Chart library**: Recharts with `ChartSurface`/`ChartContainer`/`ChartTooltip` wrappers.
- **Deploy**: Vercel with cron jobs. `vercel.json` defines 4 cron schedules.
- **Payments**: Whop (not Stripe). Webhook at `/api/whop/webhook`. Plan configs in `lib/plan-configs.ts`.
- **Deep docs**: See `public/AGENTS.md` for full operating instructions, safety-critical areas, commit history.
- **Env example sync**: `.env.example` must include every runtime env key referenced in `app/`, `server/`, `lib/`, `components/`, `context/`, `store/`, and `scripts/`, plus the live Vercel project keys. When adding a new `process.env.*` reference, update `.env.example` in the same change.

## Subdirectory AGENTS.md

- [lib/AGENTS.md](./lib/AGENTS.md) — Utility modules, dependency graph, key exports
- [server/AGENTS.md](./server/AGENTS.md) — Server business logic, cache patterns, action inventory
- [app/[locale]/dashboard/AGENTS.md](./app/%5Blocale%5D/dashboard/AGENTS.md) — Dashboard architecture, widget system, data flow
