# Session Memory (2026-03-27)

## Last Session: shadcn/ui v2 Migration — TypeScript Fixes + Tailwind Build Fix

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
  - `@tailwindcss/cli`: 4.1.18
  - `@tailwindcss/postcss`: 4.1.18
  - `@tailwindcss/typography`: 0.5.19
  - `tailwindcss`: 4.1.18

- **Feature Flags Investigation**: Completed full investigation of all 6 feature flags
  - Found `lib/feature-flags.ts` as single source of truth
  - `ENABLE_SKELETON_LOADING`: ACTIVE - used in dashboard-tab-shell.tsx
  - `ENABLE_QUERY_CACHING`: ACTIVE - used in server/accounts.ts, server/user-data.ts
  - `ENABLE_DEFERRED_COMPUTATIONS`: DEAD - hook never implemented
  - `ENABLE_LAZY_LOADING`: DEAD - no implementation consumes this flag
  - `PERF_ROLLOUT_PCT`: CONTROL - used in shouldShowOptimizations for gradual rollout
  - `EMERGENCY_ROLLBACK`: SAFETY - global kill switch

- **Created `.env.local`**: With recommended flag settings (ENABLE_SKELETON_LOADING=true, ENABLE_QUERY_CACHING=true)

### Codebase State
- Feature flag system in `lib/feature-flags.ts` (119 lines)
- Flag usage patterns found:
  - `FEATURE_FLAGS` import used in server-side code and dashboard components
  - `shouldShowOptimizations()` helper for gradual rollout (unused in actual components, only tested)
- Two dead flags identified: `ENABLE_DEFERRED_COMPUTATIONS`, `ENABLE_LAZY_LOADING`

### Blockers
- None

### Key Files
- `lib/feature-flags.ts` - Feature flag system
- `.env.local` - Created with recommended settings
- `docs/superpowers/plans/2026-03-12-performance-optimization-production.md` - Full plan
- `docs/skeleton-loading-system.md` - Skeleton loading docs
