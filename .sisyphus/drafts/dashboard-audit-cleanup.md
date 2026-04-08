# Dashboard Audit — Full Cleanup Plan

## User Requirements (Confirmed)
- **Priority**: Fix everything
- **V2 Migration**: Migrate ALL V1 shadcn to V2
- **Scope**: TypeScript + imports + data loading + shadcn

---

## Audit Findings Summary

### Category 1: Shadcn V1→V2 Migration
**13 files** need V1→V2 migration:
- 4 files using V1 `Card` → `CardV2`
- 9+ files using V1 `Button` → `ButtonV2`
- 1 file mixing `Skeleton` versions

**Files to migrate:**
1. `app/[locale]/dashboard/config/widget-registry.tsx`
2. `app/[locale]/dashboard/components/accounts/account-configurator.tsx`
3. `app/[locale]/dashboard/components/tables/bulk-edit-panel.tsx`
4. `app/[locale]/dashboard/components/accounts/propfirms-comparison-table.tsx`
5. `app/[locale]/dashboard/components/filters/tag-widget.tsx`
6. `app/[locale]/dashboard/components/tables/trade-video-url.tsx`
7. `app/[locale]/dashboard/components/tables/trade-comment.tsx`
8. `app/[locale]/dashboard/components/tables/editable-time-cell.tsx`
9. `app/[locale]/dashboard/components/tables/editable-instrument-cell.tsx`
10. `app/[locale]/dashboard/components/tables/trade-tag.tsx`
11. `app/[locale]/dashboard/components/mindset/day-tag-selector.tsx`
12. `app/[locale]/dashboard/components/widget-canvas.tsx` (Skeleton V2)

### Category 2: TypeScript `as any` Fixes (41 occurrences)
**HIGH PRIORITY — 41 occurrences across ~17 files**

Top impact areas:
- **Import processors** (8 files): Add Trade interface typing for cell value assignments
  - `tradezella-processor.tsx`
  - `atas-processor.tsx`
  - `ftmo-processor.tsx`
  - `tradovate-processor.tsx`
  - `ninjatrader-performance-processor.tsx`
  - `topstep-processor.tsx`
  - `rithric-performance-processor.tsx`
  - `platform-card.tsx`
  - `import-dialog-header.tsx`
- **Trade table** (6 occurrences): `trade-table-review.tsx` — add proper column accessor typing
- **Widget files** (6 occurrences): `trading-score-widget.tsx`, `expectancy-widget.tsx` — type `t` function
- **Charts** (2 occurrences): `trade-distribution.tsx`, `contract-quantity.tsx` — use Recharts types
- **Other**: `accounts-overview.tsx`, `rithric-sync-connection.tsx`, `account-selection.tsx`, `accounts-analysis.tsx`

### Category 3: TypeScript `as unknown` Fixes (16 occurrences)
**MEDIUM PRIORITY — 16 occurrences across ~8 files**

Primary pattern: JSON serialization for dashboard layout widgets
- `dashboard-context.tsx` (4 occurrences)
- `widget-canvas.tsx` (6 occurrences)
- `dashboard-context-auto-save.tsx` (4 occurrences)
- `pnl-summary.tsx` (1 occurrence)
- `sidebar-nav-group.tsx` (1 occurrence)

**Fix approach**: Type `defaultLayouts` and `layout` with proper `Widget[]` and `Prisma.JsonValue` types at the source.

### Category 4: Implicit `any` Parameters (35 occurrences)
**HIGH PRIORITY — 35 occurrences across ~15 files**

Main areas:
- **Recharts tooltips** (8+ files): Replace `any` with `TooltipProps<number, string>` from recharts
  - `time-range-performance.tsx`
  - `weekday-pnl.tsx`
  - `pnl-time-bar-chart.tsx`
  - `pnl-by-side.tsx`
  - `pnl-per-contract.tsx`
  - `pnl-per-contract-daily.tsx`
  - `charts.tsx` (calendar)
- **Trade parameter functions** (6 files):
  - `daily-stats.tsx` — type `trade` params
  - `hourly-financial-timeline.tsx`
  - `weekly-modal.tsx`
- **Other**: `account-equity-chart.tsx`, `share-button.tsx`, `account-selection-popover.tsx`, `add-widget-sheet.tsx`, `propfirms-comparison-table.tsx`

### Category 5: Data Loading Issues (3 issues)
**1 HIGH + 2 MEDIUM**

1. **HIGH**: `store/trading-domain-store.ts` — Add `persist` middleware
   - This is the "source of truth for trades" per AGENTS.md but has no persistence
   - On page reload, users lose trade data unless IndexedDB fallback kicks in

2. **MEDIUM**: `server/accounts.ts` — Add explicit Prisma `select` projection
   - `fetchGroupedTradesAction` fetches full trade objects instead of needed fields

3. **MEDIUM**: `store/trades-store.ts` — Simplify dual-store sync pattern
   - Complex subscription-based sync between stores could drift

---

## Console Logging: CLEAN
- ✅ 0 console.log violations in dashboard/UI
- ✅ All `console.warn` and `console.error` usage is appropriate

---

## Proposed Approach

### Wave 1: Shadcn V1→V2 Migration (parallel)
- Migrate all 13 files from V1 to V2 components
- Use `CardV2`, `ButtonV2`, `SkeletonV2`
- One agent per 2-3 files for parallel execution

### Wave 2: TypeScript `as any` Fixes (parallel by area)
- Group 1: Import processors (8 files) — add Trade interface typing
- Group 2: Trade table + widget files (8 files) — type column accessors and `t` function
- Group 3: Chart files (2 files) — use Recharts types
- Group 4: Other scattered files (accounts-overview, sync-connection, etc.)

### Wave 3: TypeScript `as unknown` + Implicit `any` (parallel)
- `as unknown` fixes — type JSON serialization at source (4 core files)
- Recharts tooltip typing — 8+ files with `TooltipProps<number, string>`
- Trade param typing — 6 files

### Wave 4: Data Loading Fixes (sequential)
- Add `persist` middleware to `trading-domain-store.ts` (HIGH)
- Add explicit `select` to `server/accounts.ts` (MEDIUM)
- Simplify `trades-store.ts` sync (MEDIUM)

### Wave 5: Verification
- `npm run typecheck` — must pass
- `npm run lint -- --quiet` — errors must reduce
- `npm run build` — must pass
- Check for any regressions

---

## Success Criteria
- [ ] All 13 dashboard files migrated to V2 shadcn components
- [ ] 41 `as any` occurrences reduced to 0
- [ ] 16 `as unknown` occurrences reduced to 0
- [ ] 35 implicit `any` parameters reduced to 0
- [ ] `store/trading-domain-store.ts` has `persist` middleware
- [ ] `server/accounts.ts` uses explicit Prisma `select` projections
- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes
- [ ] Console: 0 new violations introduced
