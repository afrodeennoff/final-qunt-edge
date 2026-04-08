# Dashboard Audit Cleanup — Full Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all dashboard TypeScript anti-patterns, migrate V1→V2 shadcn components, and resolve data loading issues across the Qunt Edge dashboard.

**Architecture:** 
- Wave 1: V2 migration (13 files, parallel groups)
- Wave 2: `as any` fixes (17 files, parallel by area)
- Wave 3: `as unknown` + implicit `any` fixes (20+ files, parallel)
- Wave 4: Data loading fixes (3 files, sequential for dependencies)
- Wave 5: Full verification

**Tech Stack:** TypeScript, Next.js 15, shadcn/ui V2, Zustand, Prisma, Recharts

---

## TODOs

---

### WAVE 1: Shadcn V1→V2 Migration (13 files, 4 parallel groups)

> **Reference**: `@/components/ui/v2` exports are re-exports of V1 (`CardV2 = Card`). The migration is a naming convention change only — no runtime behavior changes.
> 
> **Pattern**: Replace imports from `@/components/ui/card` with `@/components/ui/v2` → `CardV2`, `CardV2Content`, `CardV2Header`, `CardV2Title`
> **Pattern**: Replace imports from `@/components/ui/button` with `@/components/ui/v2` → `ButtonV2`
> **Pattern**: Replace `@/components/ui/skeleton` with `@/components/ui/v2` → `SkeletonV2`

---

- [ ] 1. **V2 Migration: widget-registry.tsx** (Card + Button)

  **Files:**
  - Modify: `app/[locale]/dashboard/config/widget-registry.tsx:5-6`
  - Reference: `components/ui/v2/index.ts` — V2 exports barrel

  **What to do:**
  ```tsx
  // REMOVE:
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
  import { Button } from '@/components/ui/button'
  // REMOVE ButtonV2 duplicate if present (line 7)
  
  // ADD:
  import { CardV2 as Card, CardV2Content as CardContent, CardV2Header as CardHeader, CardV2Title as CardTitle, ButtonV2 as Button } from '@/components/ui/v2'
  ```
  
  Then update all JSX: `Card` stays `Card`, `CardContent` stays `CardContent`, `CardHeader` stays `CardHeader`, `CardTitle` stays `CardTitle`, `Button` stays `Button` — names are aliased.

  **Must NOT do:**
  - Do not change component props or behavior
  - Do not touch the widget registry logic — only imports and JSX element types

  **Recommended Agent Profile**:
  > **Category**: `quick`
  > **Reason**: Simple import rename with no logic changes. No domain expertise needed.
  > **Skills**: none — this is a pure refactor

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1A (with Tasks 2, 3, 4)
  - **Blocks**: Task 17 (Verification)
  - **Blocked By**: None (can start immediately)

  **References**:
  - `components/ui/v2/index.ts` — V2 exports (CardV2 = Card, ButtonV2 = Button)
  - `components/ui/v2/card-v2.tsx` — CardV2 source
  - `components/ui/v2/button-v2.tsx` — ButtonV2 source
  - `app/[locale]/dashboard/config/widget-registry.tsx` — target file

  **Acceptance Criteria**:
  - [ ] Import line updated to `@/components/ui/v2`
  - [ ] All `Card` → `CardV2 as Card` aliased correctly
  - [ ] All `Button` → `ButtonV2 as Button` aliased correctly
  - [ ] No remaining `@/components/ui/card` or `@/components/ui/button` imports
  - [ ] Component JSX unchanged (props, children, structure)

---

- [ ] 2. **V2 Migration: account-configurator.tsx** (Card)

  **Files:**
  - Modify: `app/[locale]/dashboard/components/accounts/account-configurator.tsx:23`
  - Reference: `components/ui/v2/index.ts` — V2 exports barrel

  **What to do:**
  ```tsx
  // REMOVE:
  import { Card, CardHeader, CardTitle } from '@/components/ui/card'
  
  // ADD:
  import { CardV2 as Card, CardV2Header as CardHeader, CardV2Title as CardTitle } from '@/components/ui/v2'
  ```

  **Must NOT do:**
  - Do not change Card props or wrapper structure
  - Do not touch account configuration logic

  **Recommended Agent Profile**:
  > **Category**: `quick`
  > **Reason**: Simple import rename, no behavior changes.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1A (with Tasks 1, 3, 4)
  - **Blocks**: Task 17 (Verification)
  - **Blocked By**: None

  **References**:
  - `components/ui/v2/index.ts` — V2 exports barrel
  - `app/[locale]/dashboard/components/accounts/account-configurator.tsx` — target file

  **Acceptance Criteria**:
  - [ ] Import updated to `@/components/ui/v2` with `CardV2 as Card` alias
  - [ ] No remaining `@/components/ui/card` import
  - [ ] Card JSX props unchanged

---

- [ ] 3. **V2 Migration: bulk-edit-panel.tsx** (Card + Button)

  **Files:**
  - Modify: `app/[locale]/dashboard/components/tables/bulk-edit-panel.tsx:4-7`
  - Reference: `components/ui/v2/index.ts`

  **What to do:**
  ```tsx
  // REMOVE:
  import { Button } from '@/components/ui/button'
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
  
  // ADD:
  import { ButtonV2 as Button, CardV2 as Card, CardV2Content as CardContent, CardV2Header as CardHeader, CardV2Title as CardTitle } from '@/components/ui/v2'
  ```

  **Must NOT do:**
  - Do not change table or card logic

  **Recommended Agent Profile**:
  > **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1A (with Tasks 1, 2, 4)
  - **Blocks**: Task 17
  - **Blocked By**: None

  **References**:
  - `components/ui/v2/index.ts`
  - `app/[locale]/dashboard/components/tables/bulk-edit-panel.tsx`

  **Acceptance Criteria**:
  - [ ] Both V1 imports replaced with single V2 import
  - [ ] All component names aliased correctly
  - [ ] No remaining V1 imports

---

- [ ] 4. **V2 Migration: propfirms-comparison-table.tsx** (Card)

  **Files:**
  - Modify: `app/[locale]/dashboard/components/accounts/propfirms-comparison-table.tsx:19`
  - Reference: `components/ui/v2/index.ts`

  **What to do:**
  ```tsx
  // REMOVE:
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
  
  // ADD:
  import { CardV2 as Card, CardV2Content as CardContent, CardV2Header as CardHeader, CardV2Title as CardTitle } from '@/components/ui/v2'
  ```

  **Must NOT do:**
  - Do not change comparison table logic

  **Recommended Agent Profile**:
  > **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1A (with Tasks 1, 2, 3)
  - **Blocks**: Task 17
  - **Blocked By**: None

  **References**:
  - `components/ui/v2/index.ts`
  - `app/[locale]/dashboard/components/accounts/propfirms-comparison-table.tsx`

  **Acceptance Criteria**:
  - [ ] Import updated to V2 with aliases
  - [ ] No remaining `@/components/ui/card` import
  - [ ] Card JSX unchanged

---

- [ ] 5. **V2 Migration: Button files batch** (8 files — Button only)

  **Files to migrate (each just needs Button import change):**
  - `app/[locale]/dashboard/components/filters/tag-widget.tsx:6-7` (remove duplicate ButtonV2 if mixed)
  - `app/[locale]/dashboard/components/tables/trade-video-url.tsx:4-5`
  - `app/[locale]/dashboard/components/tables/trade-comment.tsx:4-5`
  - `app/[locale]/dashboard/components/tables/editable-time-cell.tsx:4-5`
  - `app/[locale]/dashboard/components/tables/editable-instrument-cell.tsx:4-5`
  - `app/[locale]/dashboard/components/tables/trade-tag.tsx:4-5`
  - `app/[locale]/dashboard/components/mindset/day-tag-selector.tsx:4,27`

  **What to do for each file:**
  ```tsx
  // REMOVE any line like:
  import { Button } from '@/components/ui/button'
  
  // ADD if not already present:
  import { ButtonV2 as Button } from '@/components/ui/v2'
  
  // If file has BOTH V1 Button AND ButtonV2, remove the V1 import line only
  // Keep: import { ButtonV2 as Button } from '@/components/ui/v2'
  ```

  **Must NOT do:**
  - Do not change any Button props or behavior
  - Do not remove `ButtonV2 as Button` import — that's the correct one to keep

  **Recommended Agent Profile**:
  > **Category**: `quick`
  > **Reason**: Identical pattern across 7 files. Pure import rename.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1B (with Task 6)
  - **Blocks**: Task 17
  - **Blocked By**: None

  **References**:
  - `components/ui/v2/index.ts` — ButtonV2 export
  - Each target file — verify existing imports first

  **Acceptance Criteria (per file)**:
  - [ ] No `@/components/ui/button` import remains
  - [ ] `ButtonV2 as Button` from `@/components/ui/v2` is present
  - [ ] Button JSX unchanged (props, children)

---

- [ ] 6. **V2 Migration: widget-canvas.tsx** (Skeleton V2)

  **Files:**
  - Modify: `app/[locale]/dashboard/components/widget-canvas.tsx:34`
  - Reference: `components/ui/v2/index.ts`

  **What to do:**
  ```tsx
  // REMOVE:
  import { Skeleton } from '@/components/ui/skeleton'
  // REMOVE if present:
  import { SkeletonV2 } from '@/components/ui/v2'
  
  // ADD:
  import { SkeletonV2 as Skeleton } from '@/components/ui/v2'
  ```
  
  Then update JSX: any `SkeletonV2` → `Skeleton` (the alias).

  **Must NOT do:**
  - Do not change skeleton dimensions or loading behavior
  - Do not touch the React Grid Layout logic

  **Recommended Agent Profile**:
  > **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1B (with Task 5)
  - **Blocks**: Task 17
  - **Blocked By**: None

  **References**:
  - `components/ui/v2/index.ts` — SkeletonV2 export
  - `app/[locale]/dashboard/components/widget-canvas.tsx` — target file

  **Acceptance Criteria**:
  - [ ] Skeleton import from `@/components/ui/v2` as `SkeletonV2 as Skeleton`
  - [ ] No `@/components/ui/skeleton` import remains
  - [ ] `SkeletonV2` JSX usages aliased to `Skeleton`

---

### WAVE 2: TypeScript `as any` Fixes (41 occurrences, 4 parallel groups)

> **Reference**: `@/types/trade.ts` or `prisma/schema.prisma` — Trade interface definition for import processors
> **Reference**: `app/[locale]/dashboard/components/tables/trade-table-review.tsx:1201` — existing typed column accessor pattern

---

- [ ] 7. **Fix `as any`: Import Processors** (8 files — parallel sub-group)

  **Files to fix:**
  - `app/[locale]/dashboard/components/import/tradezella/tradezella-processor.tsx:47,50,65`
  - `app/[locale]/dashboard/components/import/atas/atas-processor.tsx:375,377,789`
  - `app/[locale]/dashboard/components/import/ftmo/ftmo-processor.tsx:120,121,170,171,172`
  - `app/[locale]/dashboard/components/import/tradovate/tradovate-processor.tsx:168`
  - `app/[locale]/dashboard/components/import/ninjatrader/ninjatrader-performance-processor.tsx:299`
  - `app/[locale]/dashboard/components/import/topstep/topstep-processor.tsx:95`
  - `app/[locale]/dashboard/components/import/rithmic/rithric-performance-processor.tsx:55`
  - `app/[locale]/dashboard/components/import/components/platform-card.tsx:137,140,146`
  - `app/[locale]/dashboard/components/import/components/import-dialog-header.tsx:40,43,69`

  **What to do (per file — most common pattern):**
  
  For processor files (tradezella, atas, ftmo, tradovate, ninjatrader, topstep, rithmic):
  ```tsx
  // Add at top of file:
  import type { Trade } from '@/types/trade' // or from prisma schema
  
  // Replace pattern like:
  //   item[key] = cellValue as any;
  // With:
  item[key] = cellValue as keyof Trade extends never ? string : keyof Trade;
  
  // Or better — define a typed item:
  // const item = {} as Partial<Trade>;
  // Then: (item as Partial<Trade>)[key] = cellValue;
  ```

  For platform-card.tsx and import-dialog-header.tsx:
  ```tsx
  // Replace: platform.name as any
  // With: platform.name as string
  // Replace: t(s.title as any, ...)
  // With: t(s.title, ...)
  ```

  **Must NOT do:**
  - Do not change the cell parsing logic — only the type cast
  - Do not make assumptions about cell value types — verify from existing code

  **Recommended Agent Profile**:
  > **Category**: `unspecified-high`
  > **Reason**: Import processors are complex with broker-specific logic. Need domain expertise in trade data formats.
  > **Skills**: none — no relevant skill for broker-specific import logic

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2A (with Tasks 8, 9, 10)
  - **Blocks**: Task 17
  - **Blocked By**: None (Wave 1 completion not required)

  **References**:
  - `prisma/schema.prisma` — Trade model fields for typing
  - `app/[locale]/dashboard/components/import/components/platform-card.tsx` — `BadgeVariant` type
  - `app/[locale]/dashboard/components/import/components/import-dialog-header.tsx` — step interface
  - `app/[locale]/dashboard/components/import/atas/atas-processor.tsx:789` — complex `as any` cast needs careful analysis

  **Acceptance Criteria**:
  - [ ] No `as any` remaining in these 8 files
  - [ ] Trade data typing is consistent across processors
  - [ ] Cell parsing logic unchanged

---

- [ ] 8. **Fix `as any`: Trade Table Review** (trade-table-review.tsx)

  **Files:**
  - Modify: `app/[locale]/dashboard/components/tables/trade-table-review.tsx:557-559,1201,1558,1563`
  - Reference: Same file — existing column accessor patterns

  **What to do:**
  
  For lines 557-559 (group accumulation):
  ```tsx
  // REMOVE: group.pnl = (Number(group.pnl || 0) + Number(trade.pnl || 0)) as any;
  // ADD type for group:
  interface GroupPnL {
    pnl: number;
    commission: number;
    quantity: number;
  }
  // Then: group.pnl = (Number(group.pnl || 0) + Number(trade.pnl || 0));
  ```

  For lines 1201, 1558, 1563 (column accessor):
  ```tsx
  // REMOVE: col.id || (col as any).accessorKey
  // ADD column type:
  type ColumnDef = { id?: string; accessorKey?: string };
  // Then: col.id || (col as ColumnDef).accessorKey
  ```

  **Must NOT do:**
  - Do not change grouping or aggregation logic
  - Do not change table column behavior

  **Recommended Agent Profile**:
  > **Category**: `unspecified-high`
  > **Reason**: Trade table is complex with TanStack Table integration. Careful analysis needed.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2B (with Tasks 7, 9, 10)
  - **Blocks**: Task 17
  - **Blocked By**: None

  **References**:
  - `app/[locale]/dashboard/components/tables/trade-table-review.tsx` — target file (read lines around each occurrence)
  - `lib/types/` — existing type definitions if any

  **Acceptance Criteria**:
  - [ ] All 6 `as any` occurrences replaced with proper types
  - [ ] Group aggregation logic unchanged
  - [ ] Column accessor behavior unchanged

---

- [ ] 9. **Fix `as any`: Widget Files** (trading-score-widget, expectancy-widget)

  **Files:**
  - `app/[locale]/dashboard/components/widgets/trading-score-widget.tsx:27,29,31`
  - `app/[locale]/dashboard/components/widgets/expectancy-widget.tsx:16,23,25,27`

  **What to do:**
  
  For translation function casts:
  ```tsx
  // REMOVE: (t as any)('key')
  // The t function from useTranslation() returns string directly:
  t('key') // t is already (key: string) => string
  
  // Verify t is imported from: import { useTranslation } from 'next-international'
  // Then remove all (t as any) casts — t already has correct type
  ```

  For trades cast:
  ```tsx
  // REMOVE: calculateAdvancedMetrics(trades as any)
  // ADD type:
  import type { Trade } from '@/types/trade' // or from store
  calculateAdvancedMetrics(trades as Trade[])
  ```

  **Must NOT do:**
  - Do not change widget rendering logic
  - Do not change metric calculations

  **Recommended Agent Profile**:
  > **Category**: `quick`
  > **Reason**: Simple type cast removal — t function already typed correctly by next-international.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2B (with Tasks 7, 8, 10)
  - **Blocks**: Task 17
  - **Blocked By**: None

  **References**:
  - `app/[locale]/dashboard/components/widgets/trading-score-widget.tsx` — target
  - `app/[locale]/dashboard/components/widgets/expectancy-widget.tsx` — target
  - `app/[locale]/dashboard/lib/` — Trade type definition for `calculateAdvancedMetrics`

  **Acceptance Criteria**:
  - [ ] All `(t as any)` casts removed — `t()` called directly
  - [ ] `trades` cast to proper `Trade[]` type
  - [ ] Widget UI unchanged

---

- [ ] 10. **Fix `as any`: Chart + Miscellaneous Files**

  **Files:**
  - `app/[locale]/dashboard/components/charts/trade-distribution.tsx:180`
  - `app/[locale]/dashboard/components/charts/contract-quantity.tsx:226`
  - `app/[locale]/dashboard/components/accounts/accounts-overview.tsx:1365`
  - `app/[locale]/dashboard/components/import/rithmic/sync/rithric-sync-connection.tsx:253`
  - `app/[locale]/dashboard/components/import/account-selection.tsx:107`
  - `app/[locale]/dashboard/components/analysis/accounts-analysis.tsx:157`
  - `app/[locale]/dashboard/components/calendar/weekly-modal.tsx:45`

  **What to do:**

  For Recharts chart files:
  ```tsx
  // REMOVE: <Tooltip content={renderTooltip as any}
  // The content prop of Recharts Tooltip can accept a ReactNode directly:
  // If renderTooltip returns ReactNode, just use it without cast
  // If it's a function, type it as TooltipProps content:
  import type { TooltipProps } from 'recharts';
  const renderTooltip = (props: TooltipProps<number, string>) => { ... }
  <Tooltip content={renderTooltip} />
  ```

  For form event casts:
  ```tsx
  // REMOVE: handleConnect(new Event('submit') as any, false)
  // ADD proper type:
  import type { FormEvent } from 'react';
  const handleConnect = (e: FormEvent, ...) => { ... }
  handleConnect({ preventDefault: () => {} } as FormEvent, false)
  // OR use: dispatchEvent approach
  ```

  For accounts-overview:
  ```tsx
  // REMOVE: setSelectedAccountForTable(tempAccount as any)
  // ADD proper type from account interface
  ```

  **Must NOT do:**
  - Do not change chart rendering behavior
  - Do not change form submission logic

  **Recommended Agent Profile**:
  > **Category**: `unspecified-high`
  > **Reason**: Chart files need Recharts type expertise. Form files need React event type knowledge.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2B (with Tasks 7, 8, 9)
  - **Blocks**: Task 17
  - **Blocked By**: None

  **References**:
  - `app/[locale]/dashboard/components/charts/trade-distribution.tsx` — target
  - `app/[locale]/dashboard/components/charts/contract-quantity.tsx` — target
  - `components/ui/chart-surface.tsx` — existing Recharts usage pattern

  **Acceptance Criteria**:
  - [ ] No `as any` in chart files (use Recharts `TooltipProps`)
  - [ ] Form events properly typed
  - [ ] Account selection properly typed

---

### WAVE 3: TypeScript `as unknown` + Implicit `any` Fixes

---

- [ ] 11. **Fix `as unknown`: JSON Serialization in Dashboard Context** (4 core files)

  **Files:**
  - `app/[locale]/dashboard/dashboard-context.tsx:65-66,231-232`
  - `app/[locale]/dashboard/components/widget-canvas.tsx:49-50,63,351,503-504`
  - `app/[locale]/dashboard/dashboard-context-auto-save.tsx:60-61,224-225`
  - `app/[locale]/dashboard/components/pnl-summary.tsx:31`

  **What to do:**

  For dashboard-context.tsx and widget-canvas.tsx:
  ```tsx
  // The pattern is: JSON.parse(layout.desktop) where layout.desktop is stored as string
  // REMOVE: layout.desktop as unknown as Prisma.JsonValue
  // ADD proper typing at the import/source level:
  import type { Widget } from '@/types/widget'; // or define locally
  
  // If layout is already parsed (from Prisma JSON), use directly:
  // layout.desktop is already the right type — remove the cast
  // But if it's a string, the cast is necessary — type it:
  const desktopLayout = typeof layout.desktop === 'string' 
    ? JSON.parse(layout.desktop) as Widget[] 
    : layout.desktop as Widget[];
  ```

  For `t as unknown as (key: string) => string`:
  ```tsx
  // REMOVE the double cast
  // The t function IS already (key: string) => string from next-international
  // Just use: t(key) directly — no cast needed
  ```

  For pnl-summary.tsx:
  ```tsx
  // REMOVE: data as unknown as { pnl?: number; ... }
  // ADD proper typed interface:
  interface PnlData { pnl?: number; trades?: Array<{ pnl?: number }> }
  const typedData = data as PnlData;
  ```

  **Must NOT do:**
  - Do not change the data flow or widget layout logic
  - Do not remove necessary JSON parsing — only type it properly

  **Recommended Agent Profile**:
  > **Category**: `unspecified-high`
  > **Reason**: Dashboard context is central to widget system. Need to understand data flow before changing.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3A (with Tasks 12, 13)
  - **Blocks**: Task 17
  - **Blocked By**: None

  **References**:
  - `app/[locale]/dashboard/dashboard-context.tsx` — target
  - `app/[locale]/dashboard/components/widget-canvas.tsx` — target
  - `app/[locale]/dashboard/dashboard-context-auto-save.tsx` — target
  - `lib/types/widget.ts` — Widget type if it exists, otherwise define inline

  **Acceptance Criteria**:
  - [ ] No `as unknown as Prisma.JsonValue` casts remain
  - [ ] Widget[] typing applied to layout data
  - [ ] `t as unknown as (key: string) => string` removed — `t()` used directly
  - [ ] JSON parsing properly typed with explicit `as Widget[]`

---

- [ ] 12. **Fix Implicit `any`: Recharts Tooltips** (8+ files)

  **Files:**
  - `app/[locale]/dashboard/components/charts/time-range-performance.tsx:116`
  - `app/[locale]/dashboard/components/charts/weekday-pnl.tsx:124`
  - `app/[locale]/dashboard/components/charts/pnl-time-bar-chart.tsx:102`
  - `app/[locale]/dashboard/components/charts/pnl-by-side.tsx:113`
  - `app/[locale]/dashboard/components/charts/pnl-per-contract.tsx:111`
  - `app/[locale]/dashboard/components/charts/pnl-per-contract-daily.tsx:152`
  - `app/[locale]/dashboard/components/calendar/charts.tsx:152,159,173`

  **What to do (per file):**
  ```tsx
  // REMOVE:
  const CustomTooltip = ({ active, payload, label }: any) => {
  
  // ADD proper type:
  import type { TooltipProps } from 'recharts';
  
  // For bar/line charts:
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  // For area charts:
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, nameType>) => {
  
  // Then update payload usage:
  // payload?.[0]?.value is typed as number | undefined
  // No more "as any" needed on payload access
  ```

  **Must NOT do:**
  - Do not change tooltip content or styling
  - Do not change the chart data structure

  **Recommended Agent Profile**:
  > **Category**: `quick`
  > **Reason**: Simple type import from recharts, identical pattern across all files.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3A (with Tasks 11, 13)
  - **Blocks**: Task 17
  - **Blocked By**: None

  **References**:
  - `app/[locale]/dashboard/components/charts/equity-chart.tsx` — existing Recharts typing pattern
  - `components/ui/chart-surface.tsx` — existing tooltip usage
  - recharts `TooltipProps<valueType, idType>` — official types

  **Acceptance Criteria**:
  - [ ] All `TooltipProps<number, string>` applied to custom tooltip components
  - [ ] No `any` type on tooltip props
  - [ ] Payload value access typed correctly

---

- [ ] 13. **Fix Implicit `any`: Trade Params + Other** (6+ files)

  **Files:**
  - `app/[locale]/dashboard/data/components/data-management/account-equity-chart.tsx:45` — `trades: any[]`
  - `app/[locale]/dashboard/components/tables/trade-table-review.tsx:404` — `updaterOrValue: any`
  - `app/[locale]/dashboard/components/share-button.tsx:50-51` — `desktop: any[]`, `mobile: any[]`
  - `app/[locale]/dashboard/components/accounts/propfirms-comparison-table.tsx:39,54` — `value: any`
  - `app/[locale]/dashboard/components/calendar/daily-stats.tsx:50,58,62,65` — `trade: any`
  - `app/[locale]/dashboard/components/mindset/hourly-financial-timeline.tsx:58` — `trade: any`
  - `app/[locale]/dashboard/components/calendar/weekly-modal.tsx:37` — `trades: any[]`
  - `app/[locale]/dashboard/components/charts/account-selection-popover.tsx:20` — `t: any`
  - `app/[locale]/dashboard/components/add-widget-sheet.tsx:29` — `config: any`

  **What to do:**

  For trade params:
  ```tsx
  // REMOVE: trade: any
  // ADD proper type:
  import type { Trade } from '@/types/trade'; // or from store
  // trade: Trade
  ```

  For `t: any`:
  ```tsx
  // REMOVE the (t: any) parameter
  // Use from useTranslation() hook instead:
  import { useTranslation } from 'next-international'
  // const { t } = useTranslation();
  // OR if inside a function that receives t:
  // t: (key: string) => string
  ```

  For `config: any` in add-widget-sheet:
  ```tsx
  // Define: config: WidgetConfig (from widget-registry types)
  ```

  For share-button:
  ```tsx
  // Type desktop/mobile as Widget[] from the layout store
  ```

  **Must NOT do:**
  - Do not change component logic or behavior
  - Do not add runtime type checking

  **Recommended Agent Profile**:
  > **Category**: `unspecified-high`
  > **Reason**: Various components need careful type analysis. Some need Trade type, some need widget types.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3A (with Tasks 11, 12)
  - **Blocks**: Task 17
  - **Blocked By**: None

  **References**:
  - `app/[locale]/dashboard/data/components/data-management/account-equity-chart.tsx` — target
  - `app/[locale]/dashboard/components/calendar/daily-stats.tsx` — target
  - `app/[locale]/dashboard/components/add-widget-sheet.tsx` — target
  - `store/` — Zustand store types for widget/layout typing

  **Acceptance Criteria**:
  - [ ] All `trade: any` replaced with `Trade` type
  - [ ] All `t: any` replaced with proper translation function type
  - [ ] All `config: any` replaced with `WidgetConfig` or proper interface
  - [ ] All `any[]` arrays properly typed

---

### WAVE 4: Data Loading Fixes (3 files, sequential)

---

- [ ] 14. **Fix Data Loading: trading-domain-store.ts — Add persist middleware**

  **Files:**
  - Modify: `store/trading-domain-store.ts`
  - Reference: `store/user-store.ts` — existing `persist` pattern

  **What to do:**
  ```tsx
  // REMOVE current create pattern:
  export const useTradingDomainStore = create<TradingDomainState>()((set) => ({
  
  // ADD persist middleware:
  import { persist, createJSONStorage } from 'zustand/middleware';
  import { zustaneStorage } from '@/lib/storage'; // or use localStorage directly
  
  export const useTradingDomainStore = create<TradingDomainState>()(
    persist(
      (set) => ({
        // existing state...
      }),
      {
        name: 'trading-domain-storage',
        storage: createJSONStorage(() => zustaneStorage || localStorage),
        // Only persist trades and accounts — not computed or loading state:
        partialize: (state) => ({
          trades: state.trades,
          accounts: state.accounts,
        }),
      }
    )
  );
  ```

  **Must NOT do:**
  - Do not persist loading states, computed values, or derived state
  - Do not change the store interface
  - Do not remove any existing actions

  **Recommended Agent Profile**:
  > **Category**: `unspecified-high`
  > **Reason**: Zustand persist middleware has subtle gotchas around serialization. Need to understand what state is safe to persist.

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Sequential**: Must run after understanding store state shape
  - **Blocks**: Task 17
  - **Blocked By**: None

  **References**:
  - `store/user-store.ts` — existing `persist` middleware usage
  - `store/trading-domain-store.ts` — target file (read full file first)
  - `lib/storage.ts` — existing storage helper if any

  **Acceptance Criteria**:
  - [ ] `persist` middleware added to `useTradingDomainStore`
  - [ ] `partialize` excludes non-serializable state (loading, computed)
  - [ ] Storage uses existing `zustaneStorage` or `localStorage`
  - [ ] Trades and accounts persist across page reloads

---

- [ ] 15. **Fix Data Loading: server/accounts.ts — Add explicit Prisma select**

  **Files:**
  - Modify: `server/accounts.ts:29-37`
  - Reference: `server/equity-chart.ts` — existing explicit select pattern

  **What to do:**
  ```tsx
  // REMOVE broad findMany:
  const trades = await prisma.trade.findMany({
    where: { userId: authenticatedUserId },
    orderBy: [...]
    // NO select
  });
  
  // ADD explicit select — only fields needed for grouping:
  const trades = await prisma.trade.findMany({
    where: { userId: authenticatedUserId },
    orderBy: [
      { accountNumber: 'asc' },
      { instrument: 'asc' }
    ],
    select: {
      id: true,
      accountNumber: true,
      instrument: true,
      pnl: true,
      commission: true,
      quantity: true,
      side: true,
      date: true,
    }
  });
  ```

  **Must NOT do:**
  - Do not change the grouping logic
  - Do not remove fields needed for aggregation
  - Verify all fields used in the grouping function before removing from select

  **Recommended Agent Profile**:
  > **Category**: `unspecified-high`
  > **Reason**: Need to understand which fields `fetchGroupedTradesAction` actually uses for aggregation.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Task 16)
  - **Blocks**: Task 17
  - **Blocked By**: None

  **References**:
  - `server/accounts.ts` — target file (read full function first)
  - `server/equity-chart.ts:40-80` — existing explicit select pattern
  - `prisma/schema.prisma` — Trade model to see all available fields

  **Acceptance Criteria**:
  - [ ] `select` added with only fields used in grouping logic
  - [ ] All fields used by the grouping function are in select
  - [ ] No fields beyond those needed for grouping are fetched

---

- [ ] 16. **Fix Data Loading: trades-store.ts — Simplify dual-sync pattern**

  **Files:**
  - Modify: `store/trades-store.ts`
  - Reference: `store/trading-domain-store.ts` — source of truth

  **What to do:**

  This is a MEDIUM priority cleanup. The current pattern has:
  1. `trades-store.ts` reads initial state from `trading-domain-store`
  2. `trades-store.ts` syncs updates back via subscription
  3. `trading-domain-store` is the "source of truth"

  **Option A (recommended)**: Consolidate into single store
  - If `trades-store` only exists to mirror `trading-domain-store`, remove it
  - Components using `trades-store` should use `trading-domain-store` directly
  
  **Option B**: Keep dual-store but simplify sync
  - Remove the subscription-based sync
  - Have components read from `trading-domain-store` and use `trading-domain-store.setTrades()` for updates
  - `trades-store` becomes a read-only derived slice

  ```tsx
  // Analyze the codebase first to see if ANY component 
  // uses trades-store features that trading-domain-store doesn't have.
  // If no unique features: consolidate to single store.
  // If unique features: extract to a separate slice and simplify sync.
  ```

  **Must NOT do:**
  - Do not break any component that depends on `trades-store`
  - Do not remove `trading-domain-store` as source of truth
  - Do not add `persist` here — it's already being added in Task 14

  **Recommended Agent Profile**:
  > **Category**: `deep`
  > **Reason**: Store architecture decision. Need to audit all `trades-store` usages first.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Task 15)
  - **Blocks**: Task 17
  - **Blocked By**: None

  **References**:
  - `store/trades-store.ts` — target file (read full file first)
  - `store/trading-domain-store.ts` — source of truth store
  - Search for `useTradesStore` usage across codebase

  **Acceptance Criteria**:
  - [ ] All `trades-store` consumers migrated or kept intentionally
  - [ ] Subscription sync simplified or removed
  - [ ] No state drift between the two stores
  - [ ] Single source of truth maintained

---

### WAVE 5: Final Verification

---

- [ ] 17. **Full Verification**

  **What to do:**
  Run the full verification stack:
  
  ```bash
  # TypeScript check
  npm run typecheck
  
  # ESLint (expect errors to reduce from 263 repo-wide)
  npm run lint -- --quiet
  
  # Build
  npm run build
  
  # Test (if tests exist for modified areas)
  npm run test
  ```

  **QA Scenarios (agent-executed):**

  \`\`\`
  Scenario: TypeScript passes on all modified files
    Tool: Bash
    Preconditions: All Wave 1-4 tasks completed
    Steps:
      1. Run: npm run typecheck
      2. Count TypeScript errors in modified files
    Expected Result: 0 TypeScript errors
    Failure Indicators: Any TS error in dashboard or store files
    Evidence: .sisyphus/evidence/task-17-typecheck.txt

  Scenario: ESLint passes on modified files
    Tool: Bash
    Preconditions: All Wave 1-4 tasks completed
    Steps:
      1. Run: npm run lint -- --quiet
      2. Filter output to dashboard/store files
    Expected Result: 0 ESLint errors in modified files (warnings OK)
    Failure Indicators: New ESLint errors introduced by our changes
    Evidence: .sisyphus/evidence/task-17-eslint.txt

  Scenario: Build succeeds
    Tool: Bash
    Preconditions: All Wave 1-4 tasks completed
    Steps:
      1. Run: npm run build
    Expected Result: Build completes successfully
    Failure Indicators: Build failure on any modified file
    Evidence: .sisyphus/evidence/task-17-build.txt
  \`\`\`

  **Must NOT do:**
  - Do not claim "all done" if any verification step fails
  - Fix any regressions before marking complete
  - If existing repo-wide errors (263) remain, ensure our changes didn't add new ones

  **Recommended Agent Profile**:
  > **Category**: `unspecified-high`
  > **Reason**: Verification requires understanding of what errors existed before vs. after.

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Sequential**: Must run after ALL other tasks
  - **Blocks**: None
  - **Blocked By**: All Tasks 1-16

  **References**:
  - `AGENTS.md` — verification commands
  - `.sisyphus/drafts/dashboard-audit-cleanup.md` — baseline error count (263 lint errors before)

  **Acceptance Criteria**:
  - [ ] `npm run typecheck` passes (0 TypeScript errors)
  - [ ] `npm run lint -- --quiet` shows no NEW errors in modified files
  - [ ] `npm run build` succeeds
  - [ ] All 13 V2 migrations verified
  - [ ] All 41 `as any` occurrences fixed
  - [ ] All 16 `as unknown` occurrences fixed
  - [ ] All 35 implicit `any` parameters fixed
  - [ ] `trading-domain-store.ts` has `persist` middleware
  - [ ] `server/accounts.ts` uses explicit Prisma `select`

  **Commit**: YES
  - Message: `fix(dashboard): type safety, v2 shadcn migration, and data loading improvements`
  - Files: All modified files from Waves 1-4
  - Pre-commit: `npm run typecheck && npm run lint -- --quiet`

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT have": search for forbidden patterns. Check evidence files exist.

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run typecheck` + `npm run lint -- --quiet` + `npm run build`. Review changed files for `as any`, `as unknown`, implicit any, unused imports, console.log violations.

- [ ] F3. **Real Manual QA** — `unspecified-high`
  Start from clean state. Execute every QA scenario from every task. Test cross-task integration.

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: verify everything in spec was built. Detect cross-task contamination.

---

## Success Criteria

### Verification Commands
```bash
npm run typecheck  # Expected: 0 errors
npm run lint -- --quiet  # Expected: < 263 errors (our changes don't add new ones)
npm run build  # Expected: success
```

### Final Checklist
- [ ] All 13 dashboard files migrated to V2 shadcn components
- [ ] 41 `as any` occurrences → 0
- [ ] 16 `as unknown` occurrences → 0
- [ ] 35 implicit `any` parameters → 0
- [ ] `store/trading-domain-store.ts` has `persist` middleware
- [ ] `server/accounts.ts` uses explicit Prisma `select` projections
- [ ] Console logging: 0 new violations introduced
- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes
