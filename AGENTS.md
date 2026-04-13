# PROJECT KNOWLEDGE BASE

**Generated:** 2026-03-30
**Updated:** 2026-04-13
**Commit:** e4eb4d7
**Branch:** codex-obsidian-v3-redesign

## VISUAL REDESIGN STATUS (2026-04-12)

A complete ultra-premium visual redesign was applied across the entire application, followed by a performance optimization pass and cobalt color injection. **All changes are visual-only — zero behavioral, functional, or backend modifications.**

### Design System — "Electric Obsidian"

- **Theme**: Dark-only, void-black canvas (`oklch(0 0 0)`) with electric cobalt accents (`oklch(0.65 0.22 260)`)
- **Surfaces**: Cobalt-tinted with `oklch(0.65 0.22 260 / 0.03)`–`oklch(0.65 0.22 260 / 0.08)` (NOT `bg-white/[X]` — that was replaced). Borders use `oklch(0.65 0.22 260 / 0.08)` (NOT `border-white/[X]`).
- **Shadows**: Static inset highlights `oklch(0.65 0.22 260 / 0.06)` — no hover shadows on scroll-path components.
- **Radius**: Consistent `rounded-xl` (cards, dialogs, popovers, sheets)
- **Motion**: Spring ease `[0.22, 1, 0.36, 1]` for remaining transitions. **NO blur entrances** — removed all `filter:blur()` from animations. **NO infinite animations** in interactive components. **NO backdrop-blur** anywhere.
- **Scroll**: `scroll-smooth-butter` class on all main containers. `content-visibility: auto` on all `<section>` elements. `contain: layout style paint` on dashboard grid.
- **Scrollbars**: Cobalt-tinted via CSS. Selection highlight also cobalt.

### Core Primitives Rewritten

| Component | File | What Changed |
|-----------|------|--------------|
| Card | `components/ui/card.tsx` | 8 variants (default/glass/elevated/outlined/flat/gradient-border/frost), status dots, accent lines, hover glow |
| Button | `components/ui/button.tsx` | 18 variants (incl. gradient/pill/pill-solid/pill-ghost/shimmer/mono), `leftIcon`/`rightIcon` props, press scale |
| Badge | `components/ui/badge.tsx` | 20 variants (frost-*/pill-*/glow), semantic colors, size variants |
| StatsCard | `components/ui/stats-card.tsx` | Glow icon containers, emerald/red trend colors, premium skeleton states |
| Dialog | `components/ui/dialog.tsx` | Glass overlay, ambient gradient glow, premium close button |
| Tabs | `components/ui/tabs.tsx` | Minimal pill list, glass surface, active state with inner highlight |
| Tooltip | `components/ui/tooltip.tsx` | Premium font, deeper shadow (no backdrop-blur) |
| Sheet | `components/ui/sheet.tsx` | Shadow, glass border, premium close button (no backdrop-blur) |
| Popover | `components/ui/popover.tsx` | Surface, deeper shadow (no backdrop-blur) |
| Dropdown | `components/ui/dropdown-menu.tsx` | Enhanced shadow, refined borders |
| Select | `components/ui/select.tsx` | Premium surface, deeper shadow (no backdrop-blur) |
| BackgroundGlow | `components/ui/background-glow.tsx` | Static gradient orbs (no continuous animation) |
| InteractiveWrapper | `components/animation/interactive.tsx` | No cursor tracking, no infinite glow pulse, no blur |
| MagneticButton | `components/animation/interactive.tsx` | Static (no cursor tracking). whileHover scale only. |
| WidgetShell | `components/ui/widget-shell.tsx` | Smooth entrance animation, refined border/hover |
| ChartSurface | `components/ui/chart-surface.tsx` | Premium border, spring transition |

### Animation System (Performance-Optimized)

- **`globals.css`**: 200+ lines of motion utilities (all respect `prefers-reduced-motion`):
  - `scroll-smooth-butter` — smooth scroll container
  - `animate-page-enter/exit` — route transitions (opacity only, no blur)
  - `animate-content-reveal` — content entrance (opacity only)
  - `animate-shimmer-sweep` — loading shimmer (play-once, no infinite loop)
  - `animate-fade-up-smooth` — scroll-triggered reveals (opacity + y, no blur)
  - `transition-butter` / `transition-elastic` — spring transition tokens
  - `widget-enter-smooth` — widget entrance
- **`enhanced-motion.tsx`**: `MotionSection` uses opacity + y only (no blur, no scale). `FloatingOrbs` are static (no animation).
- **GPU acceleration**: Only `.animate-float-gentle`, `.animate-glow-breathe`, `.marketing-orb`, `.marketing-pulse` get `will-change`.
- **No `filter:blur()` in any animation** — removed for scroll/cursor performance.
- **No `backdrop-blur` anywhere** — replaced with solid semi-transparent backgrounds.
- **No `repeat: Infinity` in interactive components** — `loading-states.tsx` is the only exception (only runs during loading states).
- **Reduced motion**: All animations respect `prefers-reduced-motion: reduce`.

### Pages Redesigned

- **Auth page** (`authentication/page-client.tsx`): Gradient text hero, cobalt-tinted cards, premium icon containers, smooth entrance
- **Home Hero** (`Hero.tsx`): Opacity + y entrance (no blur), smoother spring physics
- **Dashboard header**: Refined shadows, cobalt-tinted surfaces
- **Dashboard widgets**: Cobalt-tinted surfaces, no hover paints during scroll
- **Dashboard navbar**: `bg-background/95` solid semi-transparent (no backdrop-blur)

### Bulk Transformation Applied

- **289 files** transformed with **1,812 class changes** via `scripts/ultra-qhd-redesign.mjs`
- **37 additional files** fixed in teams/admin (double-zero regex bug)
- **319 files** stripped of `backdrop-blur` via `scripts/fix-scroll-performance.mjs` (65,758 instances removed)
- **72 files** had `transition-all` → `transition-[opacity,background-color,border-color]` via `scripts/fix-transition-all.mjs`
- **153 files** color-injected with cobalt tint via `scripts/inject-color.mjs` (544 changes)
- All `easeOut` → spring ease `[0.22, 1, 0.36, 1]` across all page files
- All entrance y-offsets reduced (24→10, 20→8, 18→8) for subtler reveals
- All `variant="error"` → `variant="destructive"` (Badge/Button)
- All `variant="accent"` → `variant="info"` (Badge)
- All `filter:blur()` removed from entrance animations (Hero, spring-button, interactive)
- All `repeat:Infinity` removed from interactive components (GlowButton, FloatingOrbs, shimmer)
- All cursor-tracking mousemove handlers removed (MagneticButton, InteractiveWrapper)
- State types preserved: `ChartSurfaceState` still has `"error"`, `WidgetShellState` still has `"error"` — these are semantic states, not design variants

### Type Safety
- `npx tsc --noEmit` passes with **0 errors** after all changes

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
- **Obsidian V3 visual system (Electric Obsidian)**: Dark-only void-black canvas with electric cobalt accents. Cobalt-tinted surfaces (`oklch(0.65 0.22 260 / 0.03-0.08)`), tinted borders (`oklch(0.65 0.22 260 / 0.08)`), spring motion `[0.22, 1, 0.36, 1]`. Use `scroll-smooth-butter` for main scroll containers. **NO** `backdrop-blur`, `filter:blur()`, `transition-all`, or `repeat:Infinity` in interactive components. See "VISUAL REDESIGN STATUS" section above for full details.
- **Primitive-first visual edits**: Prefer updating shared primitives in `components/ui/**` over route-local one-offs. Keep Radix `data-*` styling, `asChild`, and existing component exports intact.
- **State management**: Zustand with persist middleware. `useTradingDomainStore` is source of truth for trades.
- **Data flow**: Server Components → cached functions (`use cache`) → Prisma. Mutations → server actions → `updateTag()`.

## ANTI-PATTERNS (THIS PROJECT)

- **No `as any`** — ESLint error. Use proper types. 35+ instances exist as tech debt.
- **No `@ts-ignore`/`@ts-expect-error`** — ESLint error. Tests only exception (3 instances).
- **No `console.log`** — ERROR level. Use `console.warn` or `console.error`.
- **No hardcoded hex colors** — Use semantic tokens (`--primary`, `--mk-*`) or oklch values.
- **No arbitrary border-radius** — Use Tailwind scale (`rounded-xl`, `rounded-2xl`).
- **No `unstable_cache`/`revalidateTag`** — Use `use cache` + `cacheLife`/`cacheTag` + `updateTag`.
- **No route segment exports** — No `dynamic`/`revalidate` in `app/**/route.ts` with cache components.
- **No synthesized fallback data** — Deals API returns explicit empty/unavailable, not fake metrics.
- **No module-scope Supabase admin client** — Initialize inside each action with env validation.
- **No setState in effects** — Prefer callback-driven resets over effect-driven.
- **No stacked/double frames** — Don't wrap Card components inside bordered panels in dashboard.
- **No Trading Score duplication** — Always use `lib/score-calculator.ts` → `deriveScoreMetricsFromTrades()`.
- **No `variant="error"`** — Badge/Button error variant is `"destructive"`. State enums (e.g. `ChartSurfaceState`) may still use `"error"` as a semantic state value.
- **No `variant="accent"`** — Badge accent variant is `"info"`.
- **No `bg-card`/`bg-muted`/`bg-secondary` as raw classes** — Use `oklch(0.65 0.22 260 / 0.03-0.08)` cobalt-tinted surfaces. Do NOT use `bg-white/[X]` either — that was replaced with oklch cobalt tint.
- **No `backdrop-blur-*`** — Removed entirely for scroll performance. Use solid semi-transparent backgrounds (`bg-background/95` for sticky elements).
- **No `filter:blur()` in animations** — Causes massive GPU load during scroll/load. Use `opacity` + `y` only.
- **No `transition-all`** — Includes transform/filter which block click response. Use `transition-[opacity,background-color,border-color]`.
- **No `repeat:Infinity` in interactive components** — `loading-states.tsx` is the only exception.
- **No cursor-tracking `onMouseMove`** for visual effects — Causes layout thrash on mouse move.

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
- **Static manifest build race**: `.next/static/**/_ssgManifest.js` ENOENT during finalization is transient in this workspace; keep robust build retries enabled for this artifact.
- **Package manager policy**: Keep `vercel.json` install/build commands npm-only unless the user explicitly requests and approves a package-manager change.
- **Serverless Prisma pool**: Runtime Prisma pool defaults must stay small on Vercel (`PG_POOL_MIN=0`, low `PG_POOL_MAX` cap). Do not use long-lived server pool defaults in serverless functions.
- **Production runtime pool floor**: In `lib/prisma.ts`, production runtime must floor stale low `PG_POOL_MAX` overrides back to the intended serverless-safe runtime default. Do not let an old env override pin live runtime below the safe floor.
- **i18n library**: `next-international` (NOT next-intl). Locales: en, fr.
- **Middleware**: `proxy.ts` (NOT middleware.ts). Handles route classification, auth, CSP, CORS, i18n redirect.
- **Legacy localized import redirect**: Keep `app/[locale]/(authentication)/import` as a `page.tsx` redirect using `next/navigation`. Do not reintroduce a `route.ts` redirect there unless the full build/deploy path is reverified.
- **Firm detail routing**: In `app/[locale]/(landing)/firm/[slug]/page.tsx`, alias slug redirects must only target canonical slugs that resolve in DB; otherwise redirect to `/${locale}/propfirms`.
- **V2 components**: Re-exports of V1 (`CardV2 = Card`). Use V2 imports for new work: `import { CardV2 as Card } from '@/components/ui/v2'`.
- **Obsidian docs**: The current visual system rules live in `docs/V2_VISUAL_SYSTEM_GUIDE.md` and define the Obsidian V3 token, shell, card, and motion language.
- **Visual-only policy**: Keep behavior unchanged during redesign work. No route/query/API/auth/store/server contract changes are allowed in visual passes.
- **Auth sync Prisma reads**: In `ensureUserInDatabase` and similar auth-critical user flows, never use implicit full-row Prisma reads. Always use explicit minimal `select` and add schema-mismatch fallback for `auth_user_id` lookups.
- **Live-schema optional columns**: For production-facing Prisma reads/writes that touch optional or newly introduced columns (for example trader-profile leaderboard visibility), probe column availability first and degrade explicitly when the live DB schema does not have that column.
- **User id resolver precedence**: Keep auth-id resolution consistent across `server/auth.ts`, `server/trades.ts`, and `server/team-membership.ts` — when `id` and `auth_user_id` diverge, prefer the `auth_user_id` mapped `User.id` row first.
- **Data provider user resolution**: Any client-side context that performs database lookups (e.g., `context/data-provider.tsx`, `context/rithmic-sync-context.tsx`) must use `getDatabaseUserId()` for database operations, not `getUserId()`. The raw auth ID from `getUserId()` will fail for legacy users whose auth mapping diverges from their database ID.
- **Teams protected routes**: `/teams/dashboard`, `/teams/manage`, and `/teams/join` are auth-protected surfaces. Keep both proxy classification (`PRIVATE_DOCUMENT_PATH_PREFIXES`) and route/layout guards aligned so unauthenticated requests redirect to locale auth with `next`.
- **Team invitation join policy**: `joinTeam(teamId)` must require a valid pending, unexpired invitation for the authenticated email and accept that invitation atomically with membership creation.
- **Dashboard sidebar shell**: Keep `DashboardSidebar` in `app/[locale]/dashboard/layout.tsx` as a direct import (not dynamic with placeholder rails). Navigation is part of the core shell contract.
- **Sidebar persistence**: Authenticated sidebar shells (`dashboard`, `teams/dashboard`, `teams/manage`, `admin`) must read the `sidebar:state` cookie server-side and pass it into the sidebar provider as `defaultOpen`.
- **Sidebar route state**: Dashboard sidebar navigation must treat query params as part of route completion. Cleanup for pending navigation/fallback timers must track `pathname + search`, not just `pathname`.
- **Desktop sidebar positioning**: In `components/ui/sidebar.tsx`, keep the visible desktop sidebar in the layout flow with a sticky full-height panel. Do not split desktop rendering into a separate fixed layer plus a placeholder column unless Safari/browser alignment is reverified.
- **Sidebar contrast**: In `components/ui/sidebar.tsx` and `components/ui/unified-sidebar.tsx`, active/hover sidebar menu text on dark shells must stay on `sidebar-foreground`. Use `sidebar-primary` / `sidebar-accent` for tint backgrounds, borders, and icon emphasis only.
- **Mobile mode detection**: `hooks/use-mobile.tsx` should derive state from `matchMedia(...).matches` / `MediaQueryListEvent.matches`, not `window.innerWidth` snapshots.
- **Dashboard layout bootstrap**: In `context/data-provider.tsx`, if `getDashboardLayout` fails, immediately seed default dashboard layout for the active user (do not leave layout null).
- **Dashboard chart loading**: In `server/equity-chart.ts`, keep Prisma reads minimal via explicit `select` projections. In the client chart, if the server action is slow/fails/returns empty while local trades exist, fall back to local computation instead of indefinite loading UI.
- **Dashboard widget chrome ownership**: In `app/[locale]/dashboard/components/widget-canvas.tsx`, keep normal-mode wrappers visually transparent. Widget borders/backgrounds belong to the widget surface component (`WidgetShell`, `ChartSurface`, `StatsCard`, `Card`); only customize mode may add outer shell chrome.
- **Dashboard header action styling**: Keep `dashboard-header` action controls on one subdued rounded-pill system with low-opacity borders/backgrounds. Do not mix heavy square outlines and pill controls in the same top bar.
- **Obsidian motion**: Motion must stay presentation-only. Respect reduced motion. Use spring ease `[0.22, 1, 0.36, 1]` for transitions. **NO** blur entrances (`filter:blur()`). **NO** `backdrop-blur`. **NO** `transition-all`. Use `scroll-smooth-butter` for main scroll containers. Favor subtle opacity fades and restrained hover elevation over dramatic movement. `content-visibility: auto` on sections. `contain: layout style paint` on grid containers.
- **Home page shell**: `app/[locale]/(home)/layout.tsx` must opt out of the marketing sidebar via `MarketingLayoutShell showSidebar={false}`. Do not mount `LandingSidebar` on the home page.
- **Cached Prisma helper style**: For server read helpers that are wrapped by `'use cache'`, prefer direct `async/await` loaders returning plain objects over `Promise.all(...).then(...)` / `query.then(...)` chains. Re-verify full `npm run typecheck` after any cache-helper refactor.
- **Server barrel exports**: In shared server barrels like `server/database.ts`, do not `export *` from modules that contain cached server loaders. Use explicit named re-exports so Next.js generated `$$RSC_SERVER_CACHE_*` internals cannot collide during build.
- **Request-time auth/debug routes**: For route handlers that intentionally depend on request headers or cookies and should never be statically analyzed, call `await connection()` at the top of the handler to make the runtime boundary explicit and avoid prerender bailout noise.
- **Shared React helper hooks**: In shared performance/helper hooks, do not emulate memoization by reading `ref.current` during render, do not call hooks conditionally, and do not wrap `useMemo`/`useCallback` in ways that fight the repo's React hooks/compiler lint rules. Keep helper semantics lint-compliant first.
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
