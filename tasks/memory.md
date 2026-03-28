# Session Memory (2026-03-28)

## Current Session: Deals Spotlight UI (2026-03-29)

### Accomplishments
- Added a new featured spotlight carousel to `app/[locale]/(landing)/deals/components/deals-experience.tsx` that matches the requested visual style (dark stage, prominent center card, side previews, arrow controls, dot navigation).
- Wired the spotlight section to live filtered deals data via `getSpotlightDeals(filteredDeals)` (sorted by highest discount).
- Preserved existing conversion behavior:
  - copy coupon action uses the existing `onCopyCode` flow
  - CTA opens `claimUrl` externally when present, otherwise routes to `/${locale}/firm/${firmSlug}`
- Completed a follow-up visual tuning pass to match the reference closer:
  - switched spotlight styling to marketing dark tokens (`--mk-*`) for cleaner contrast
  - updated accent treatment to lime-toned (`--chart-3`) controls, copy, CTA, and indicators
  - tightened spacing/scale in the headline and center card composition
- Completed an exact-match composition pass:
  - plain chevron controls (no circular chrome), no bottom dot controls
  - larger rounded center card with dashed vertical divider and stronger black stage
  - left panel uses mono-styled firm name + larger orb, right panel uses centered promo stack + large lime pill CTA
  - side previews converted to faded full-card silhouettes behind the active card

### Verification
- `npx eslint app/[locale]/(landing)/deals/components/deals-experience.tsx` passes.
- `npm run typecheck` passes.

### Blockers
- None.

## Current Session: Build Rescue Continuation (Prerender + Admin/Auth Stabilization)

### Accomplishments
- Eliminated updates-route prerender clock issues by:
  - replacing runtime MDX fallback timestamps with a deterministic ISO constant in `lib/mdx.ts`
  - removing `rehype-pretty-code` from the server MDX pipeline used by updates pages
- Fixed admin prerender crypto failures by:
  - making `assertAdminAccess` / `requireUser` / `requireAdmin` request-id generation lazy in `server/authz.ts` (no eager `crypto.randomUUID()` at function invocation)
  - adding `await connection()` boundary in `app/[locale]/admin/coupons/page.tsx`
- Reduced noisy false-positive build logs by handling known prerender interruption errors as expected auth-context bailouts in:
  - `app/api/admin/reports/route.ts`
  - `app/api/behavior/insights/route.ts`
- Hardened additional build-time noisy APIs:
  - `app/api/deals/route.ts` and `app/api/deals/unified/route.ts` now prefer `nextUrl` when available and handle prerender interruption digests without error-level logging.
  - `app/api/email/unsubscribe/route.ts` now avoids direct `request.url` dependency during prerender and handles interruption digests as non-fatal invalid-link responses.
  - `app/[locale]/(landing)/propfirms/actions/get-propfirm-catalogue.ts` now short-circuits when DB is unconfigured to avoid Prisma proxy stack noise.
  - `app/api/health/route.ts` now reports unconfigured DB state as degraded info (`database-unconfigured`) instead of warning-level unhealthy noise.
- Executed shadcn MCP workflow artifacts:
  - registry discovery (`@shadcn`)
  - component search (`sidebar`)
  - usage example retrieval (`sidebar-demo`)
  - add command retrieval (`npx shadcn@latest add @shadcn/sidebar`)
  - audit checklist run

### Verification
- `npm run build` passes.
- `npm run typecheck` passes.
- Targeted eslint on touched files passes with warnings only (complexity warnings in `server/authz.ts`).
- Targeted route tests pass:
  - `tests/api/deals-active.test.ts`
  - `tests/api/deals-unified.test.ts`
  - `tests/api/unsubscribe-route.test.ts`

### Remaining Environment Warnings
- `RESEND_API_KEY` missing in local env during build.
- Local database is not configured (`POSTGRES_*`/`DATABASE_URL` missing); health now reports this as degraded (`database-unconfigured`) during build/export.
- Node/native warning noise remains during build (`--localstorage-file` path warning and duplicate `GNotificationCenterDelegate` symbol from native deps).

## Current Session: Cache Components + Support Model + Landing Sweep

### Accomplishments
- Migrated server read helpers to cache components (`use cache`, `cacheLife`, `cacheTag`) and switched invalidation paths to `updateTag`.
- Synced the support UI and `/api/ai/support` with the shared model source of truth in `lib/ai/support-models.ts`.
- Fixed landing/home regressions: pricing toggle behavior, invalid interactive nesting, broken query navigation, and unnecessary client directives.
- Verified `npm run typecheck` successfully and `npx eslint` on touched TS/TSX files with warnings only.

### Codebase State
- Cache-component migration is in place for the touched server read paths.
- Support model ids are now centralized in `lib/ai/support-models.ts`.
- The landing/home surfaces now use the shared V2 button patterns and corrected route handling.

### Blockers
- `npm run build` now gets past Prisma sync, but still fails during prerender on `"/[locale]/authentication"` with `Uncached data was accessed outside of <Suspense>` even after adding locale loading boundaries, a no-SSR auth layout shell, and `connection()` calls.

## Last Session: Design System Refactoring — Hex, Border-Radius, HSL Token Cleanup

### Accomplishments
- **Hex color → CSS variable**: 14+ files across all component groups. Zero hardcoded hex colors in `app/[locale]/` TSX files.
- **Border-radius → Tailwind scale**: 22+ files standardized. `rounded-[Nrem]` / `rounded-[Npx]` → `rounded-2xl`, `rounded-xl`, `rounded-sm`, `rounded-3xl`.
- **Raw HSL → semantic tokens**: ~95 patterns replaced across (home) and (landing) components.
  - `bg-[hsl(var(--primary)/0.08)]` → `bg-primary/10`
  - `border-[hsl(var(--primary)/0.35)]` → `border-primary/35`
  - `text-[hsl(var(--primary))]` → `text-primary`
  - `bg-[hsl(var(--foreground)/0.04)]` → `bg-foreground/5`
  - `via-[hsl(var(--primary-foreground)/0.2)]` → `via-primary-foreground/20`
- **Preserved correctly**: `--mk-*` tokens (marketing surface, no semantic aliases), `--chart-*` tokens (chart-specific).
- **Verified**: 0 TypeScript errors, 0 ESLint errors on modified files, Oracle-verified complete.
- **All 17 component groups audited**: `(auth)`, `(home)`, `(landing)`, `community`, `deals`, `deals/compare`, `deals/calculator`, `deals/guides`, `firm/[slug]`, `leaderboard`, `prop-firm-deals`, `propfirms`, `support`, `admin`, `embed`, `teams`, `teams/user-equity` — all clean.

### Codebase State
- Design system tokens: `--primary`, `--secondary`, `--foreground`, `--border`, `--card`, `--mk-*`, `--chart-*`
- V1 semantic tokens aliased to V2 oklch in `app/globals.css`
- Font tokens: `--home-display`, `--home-copy` added
- Component imports: V2 components (CardV2, ButtonV2, BadgeV2) used throughout

### Key Files Changed
- `app/[locale]/(home)/components/*` — 12 files (HSL→semantic)
- `app/[locale]/(landing)/components/*` — 5 files (hero, navbar, features, how-it-works, partners)
- `app/[locale]/(landing)/deals/_components/public-flow-shell.tsx`
- `app/[locale]/shared/[slug]/shared-page-client.tsx`
- `app/[locale]/dashboard/components/navbar.tsx` (border-radius)
- `app/[locale]/dashboard/components/daily-summary-modal.tsx` (border-radius)
- `app/[locale]/admin/actions/weekly-recap.ts` (hex→HSL email template)
- `app/globals.css` (font tokens)

### Blockers
- None

---

## Previous Session: shadcn/ui v2 Migration — TypeScript Fixes + Tailwind Build Fix

### Accomplishments
- **Completed shadcn/ui v2 migration type fixes**: Resolved ~150+ TypeScript errors from the v1→v2 component migration
  - Added `ButtonV2` import to 14 dashboard/admin files using `<ButtonV2>` JSX without the import
  - Fixed `<ButtonV2>` → `<Button>` in 8 email template files (react-email uses `Button`, not shadcn)
  - Fixed `<ButtonV2>` → `<Button>` in `error-boundary.tsx` (only v1 Button imported)
  - Fixed `BadgeV2` variant `"destructive"` → `"error"` in 4 files
  - Fixed `Card` variant `"matte"` → `"flat"` in `admin/coupons/page.tsx`
  - Fixed `ComponentProps<typeof Badge>` → `BadgeV2` in ai-elements type exports
  - Fixed `</Card>` → `</CardV2>` closing tag in `atas-processor.tsx`
  - Removed unused `Badge` imports in `chain-of-thought.tsx`, `inline-citation.tsx`
  - Fixed duplicate import in `updates-navigation.tsx`
- **Fixed Tailwind v4 `@utility` nesting build error**: `@utility focus-ring` was inside `@layer base` (line 314-537) — moved it to top level after layer closes
- **TypeScript compilation**: `npm run typecheck` passes with 0 errors
- **Production build**: `npm run build` succeeds

### Codebase State
- shadcn v2 design system fully operational: `--v2-*` CSS tokens in `globals.css`, V2 components (CardV2, ButtonV2, BadgeV2, InputV2, etc.) working
- ~150+ files migrated to v2 components
- All TypeScript errors resolved
- Build passes cleanly

### Key Files
- `app/globals.css` — v2 tokens + `@theme inline` + `@utility` directives (no @utility inside @layer base)
- `components/ui/v2/*` — V2 component library
- Dashboard files: `tag-widget.tsx`, `bulk-edit-panel.tsx`, `widget-registry.tsx`, `day-tag-selector.tsx`, etc. — now correctly import ButtonV2
- Email templates: `welcome.tsx`, `black-friday.tsx`, etc. — use react-email Button

### Blockers
- None — all work complete

---

## Previous Session: Feature Flags Investigation + Tailwind Version Sync

### Accomplishments
- **Tailwind Version Sync**: Verified all Tailwind packages at 4.1.18 (already synced)
- **Feature Flags Investigation**: Completed full investigation of all 6 feature flags
  - Found `lib/feature-flags.ts` as single source of truth
  - `ENABLE_SKELETON_LOADING`: ACTIVE
  - `ENABLE_QUERY_CACHING`: ACTIVE
  - `ENABLE_DEFERRED_COMPUTATIONS`: DEAD
  - `ENABLE_LAZY_LOADING`: DEAD
  - `PERF_ROLLOUT_PCT`: CONTROL
  - `EMERGENCY_ROLLBACK`: SAFETY

### Blockers
- None
