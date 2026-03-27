# Session Memory (2026-03-28)

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
