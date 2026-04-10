# 04 — Import Flow Polish — Context

**Gathered**: 2026-04-11
**Status**: Ready for planning
**Depends on**: None
**Phase**: 04 of v2.1 milestone

---

## Goal

Fix the import flow comprehensively: stable import type selector (no layout jumping, predictable card heights, fast filtering/search), parser-heavy code (exceljs) lazy-loaded only when needed, import cards use lightweight view model decoupled from parser/runtime modules.

---

## Current State (Baseline)

### Key Files

| File | Lines | Purpose |
|------|-------|---------|
| `config/platforms.tsx` | 843 | Platform definitions with 16 platforms, all component imports at top level |
| `import-type-selection.tsx` | 360 | Grid-based selector with search, category tabs, compare mode |
| `platform-card.tsx` | 183 | Card component per platform with memo |
| `import-button.tsx` | 524 | Main dialog orchestrator, all state management |
| `atas/atas-file-upload.tsx` | 347 | Excel file upload with **top-level exceljs import** |
| `platform-tutorial.tsx` | 156 | Tutorial/video display for selected platform |
| `format-preview.tsx` | 1028 | Trade preview table with AI column mapping |

### Platform Count

**16 platforms across 4 categories**:
- Direct Account Sync (3): Rithmic Sync, Thor Sync, Tradovate Sync
- Intelligent Import (2): CSV-AI, IBKR PDF
- Platform CSV Import (9): Tradezella, Tradovate, Quantower, Topstep, NinjaTrader, Rithmic Perf/Orders, ATAS, FTMO
- Manual Entry (1): Manual Entry

### Current `platforms.tsx` Top-Level Imports (Lines 3-26)

```tsx
// Eagerly loaded at module import time — ALL processors loaded on page load
import { ThorSync } from '../thor/thor-sync'
import { TradovateSync } from '../tradovate/tradovate-sync'
import { RithmicSyncWrapper } from '../rithmic/sync/rithmic-sync-connection'
import FileUpload from '../file-upload'
import HeaderSelection from '../header-selection'
// ... 10 more component imports
import TradezellaProcessor from '../tradezella/tradezella-processor'
import TradovateProcessor from '../tradovate/tradovate-processor'
import QuantowerOrderProcessor from '../quantower/quantower-processor'
// ... 8 more processor imports
import AtasFileUpload from '../atas/atas-file-upload'
// atas-file-upload has: import ExcelJS from "exceljs" at top level
```

### exceljs Usage

```tsx
// atas/atas-file-upload.tsx line 5
import ExcelJS from "exceljs";

// Used in processExcelFile():
const workbook = new ExcelJS.Workbook();
await workbook.xlsx.load(e.target?.result as ArrayBuffer);
```

`exceljs` is listed in `lib/performance/next-config.ts` (line 105) as an external package for Turbopack, but the import is **not lazy** — it loads on module initialization.

### PlatformCard Props

```tsx
interface PlatformCardProps {
    platform: PlatformConfig;  // Full config type from platforms.tsx
    isSelected: boolean;
    onSelect: (type: string) => void;
    isWeekend: boolean;
    isMultiSelectMode?: boolean;
    isChecked?: boolean;
    onCheckChange?: (checked: boolean) => void;
}
```

**Issue**: `PlatformCard` depends directly on `PlatformConfig` — the full config type includes `processorComponent`, `customComponent`, and step definitions. These are runtime concerns that shouldn't be in the display layer.

### Import Type Selection State

```tsx
// import-type-selection.tsx
const [searchQuery, setSearchQuery] = useState('')
const [activeCategory, setActiveCategory] = useState<string>("all")
const [isCompareMode, setIsCompareMode] = useState(false)
const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
```

**Issues**:
1. `filteredPlatforms` uses `useMemo` but recalculates on every search/category change
2. Grid uses `grid-template-columns: repeat(auto-fit,minmax(220px,1fr))` — not fixed columns
3. Cards have `line-clamp-2` on description but heights vary
4. `showDesktopDetailPanel` layout shift when entering compare mode

---

## Implementation Gray Areas

### 1. Stable Selector — Card Height Consistency

**Question**: How to ensure consistent card heights without virtualization?

**Analysis**:
- Current: `flex h-full` + `line-clamp-2` on description
- Cards have `CardContent` with `flex flex-col gap-2 flex-1` 
- Category badge + optional badges add variable height
- "Coming Soon" vs "Maintenance" badges change height

**Options**:

| Option | Pattern | Pros | Cons |
|--------|---------|------|------|
| **A. Fixed height with overflow** | `h-[180px] overflow-hidden` | Predictable grid | May clip content |
| **B. Flex stretch with min-height** | `min-h-[200px] flex flex-col` | Consistent, flexible | Some cards may have excess space |
| **C. CSS grid rows** | `grid-rows-[auto_1fr_auto]` | Native alignment | Complex template |
| **D. Virtualization** | `react-virtual` or `react-window` | True stability | Additional dependency, complexity |

**Decision**: Option B — min-height with flex stretch

Rationale:
- Minimal CSS change
- No new dependency
- Cards will have consistent height with flexible description area
- Overflow can be hidden on description only

### 2. Stable Selector — Grid Column Consistency

**Question**: How to prevent column jumping when compare panel opens?

**Analysis**:
- Current: Two-column grid layout that shifts when `showDesktopDetailPanel` changes
- Left panel: `grid-cols-1` or `lg:grid-cols-[minmax(0,1fr)_320px]`
- Layout shift occurs at `lg` breakpoint

**Options**:

| Option | Pattern | Pros | Cons |
|--------|---------|------|------|
| **A. Fixed sidebar width** | `lg:grid-cols-[calc(100%-340px)_340px]` | No shift | May not fit viewport |
| **B. CSS transition** | `transition-all duration-300` on grid | Smooth morph | Still a shift, just animated |
| **C. Overlay panel** | Detail panel as fixed overlay | No grid change | Different UX |
| **D. Reserve space** | Min-width on detail panel column | No shift | Empty space when panel hidden |

**Decision**: Option D — Reserve space for detail panel

```tsx
// Current (shifts):
showDesktopDetailPanel
  ? "lg:grid-cols-[minmax(0,1fr)_320px]"
  : "grid-cols-1"

// Target (no shift):
"lg:grid-cols-[minmax(0,1fr)_320px]"  // Always has right column
".lg\\:block" { visibility: hidden } when panel hidden  // Or visibility toggle
```

### 3. Stable Selector — Search Performance

**Question**: How to make filtering fast without whole-grid rerender?

**Analysis**:
- `filteredPlatforms` useMemo recalculates on every keystroke
- Translation lookup (`t()`) in filter function is expensive
- All 16 platforms filtered on every search change

**Options**:

| Option | Pattern | Pros | Cons |
|--------|---------|------|------|
| **A. Debounce search** | `useDebouncedValue(searchQuery, 150)` | Reduce recalcs | Slight delay |
| **B. Pre-computed search index** | Build index at module load | Fast lookup | Memory cost |
| **C. Virtualization** | Only render visible cards | Performance | Additional dependency |
| **D. Memo the grid** | `React.memo` on grid container | Prevent cascade | Still calculates filtered list |

**Decision**: Option A — Debounce with Option D — Memo grid

```tsx
// Add debounce hook
const debouncedSearch = useDebouncedValue(searchQuery, 150);

const filteredPlatforms = useMemo(() => {
  return platforms.filter(platform => {
    const matchesSearch = /* ... */;
    const matchesCategory = /* ... */;
    return matchesSearch && matchesCategory;
  });
}, [debouncedSearch, activeCategory]);  // Depends on debounced value

// Memo the grid
const PlatformGrid = useMemo(() => (
  <div className="grid gap-4 ...">
    {filteredPlatforms.map(/* ... */}
  </div>
), [filteredPlatforms]);
```

### 4. exceljs Lazy Loading Strategy

**Question**: When and how should exceljs be loaded?

**Analysis**:
- `exceljs` is used **only** by ATAS platform (atas-file-upload.tsx)
- Currently imported at top level of atas-file-upload.tsx
- ATAS is a secondary import path (not every user imports from ATAS)

**Options**:

| Option | Pattern | Pros | Cons |
|--------|---------|------|------|
| **A. Dynamic import in ATAS** | `const ExcelJS = await import('exceljs')` | No external route | Bundle still includes exceljs |
| **B. Server-side parsing API** | `/api/imports/atas/parse` route | Zero client bundle | Extra network request |
| **C. Server action** | `parseAtasFileAction()` server action | Zero client bundle, type-safe | Extra network request |
| **D. Keep as-is** | Top-level import | Simple | Loads on every page |

**Decision**: Option C — Server action

Rationale:
- Completely removes exceljs from client bundle
- Server has more memory for parsing large Excel files
- Consistent with existing pattern (server actions for mutations)
- File can be uploaded directly to server action

```tsx
//atas-file-upload.tsx (target)
const processExcelFile = useCallback(async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const result = await parseAtasFileAction(formData);
  // Handle result...
}, []);
```

```tsx
// server/imports/atas-actions.ts (new)
'use server'

export async function parseAtasFileAction(formData: FormData) {
  'use server'
  const file = formData.get('file') as File;
  const ExcelJS = await import('exceljs');
  // Parse and return structured data
}
```

### 5. ImportPlatformCardViewModel

**Question**: What should the view model contain, and how to decouple from PlatformConfig?

**Analysis**:
- `PlatformCard` currently receives full `PlatformConfig` type
- Config includes: `processorComponent`, `customComponent`, `steps[]`, `processFile()`
- These are runtime/behavioral concerns, not display concerns

**ViewModel Interface**:

```typescript
// types/import-platform-card-vm.ts
export interface ImportPlatformCardViewModel {
  // Display data (static)
  type: string;
  displayName: string;
  displayDescription: string;
  category: 'Direct Account Sync' | 'Intelligent Import' | 'Platform CSV Import' | 'Manual Entry';
  categoryLabel: string;
  
  // Visual state (static)
  logo: {
    path?: string;
    alt?: string;
    iconComponent?: React.ComponentType<{}>;
  };
  
  // Status flags (dynamic-ish)
  isDisabled: boolean;
  isComingSoon: boolean;
  isRithmic: boolean;
  isWeekend: boolean;
  
  // Selection state (passed separately, not in VM)
  // isSelected, isChecked — handled by parent
}

// Factory function to transform PlatformConfig → ViewModel
export function createPlatformCardViewModel(
  platform: PlatformConfig,
  options: { t: (key: string) => string; isWeekend: boolean }
): ImportPlatformCardViewModel {
  return {
    type: platform.type,
    displayName: options.t(String(platform.name), { count: 1 }),
    displayDescription: options.t(String(platform.description), { count: 1 }),
    category: platform.category,
    categoryLabel: getCategoryLabel(platform.category, options.t),
    logo: {
      path: platform.logo.path,
      alt: platform.logo.alt,
      iconComponent: platform.logo.component,
    },
    isDisabled: platform.isDisabled ?? false,
    isComingSoon: platform.isComingSoon ?? false,
    isRithmic: platform.isRithmic ?? false,
    isWeekend: options.isWeekend,
  };
}
```

**Benefits**:
1. `PlatformCard` depends only on display data
2. Translation happens once in factory, not in every render
3. Weekend detection can be computed once
4. No runtime dependencies (processors, steps) leak into display

### 6. Compare Mode UX

**Question**: How should compare mode work, and is the current implementation stable?

**Analysis**:
- Current: Multi-select checkboxes appear on cards, bottom bar shows selected count
- Side panel shows comparison grid when 2+ platforms selected
- Selection state stored in `selectedPlatforms: string[]`

**Issues**:
1. `isMultiSelectMode` toggle changes all cards (checkbox appears)
2. Compare panel layout is different from detail panel
3. No keyboard navigation support

**Decisions**:
1. Keep checkbox visible only in compare mode (current behavior)
2. Ensure compare panel has reserved space like detail panel
3. No keyboard nav changes for this phase (future enhancement)

### 7. Mobile Responsiveness

**Question**: How does the selector behave on mobile?

**Analysis**:
- Grid uses `auto-fit` which adapts to mobile
- Detail panel is Sheet component (slides from bottom on mobile)
- Compare mode may be problematic on small screens

**Decisions**:
1. Keep current mobile behavior (Sheet for details)
2. Disable compare mode on mobile (< 768px) — show toast explaining desktop required
3. Ensure touch targets are 44px minimum (already using `min-h-[44px]` on checkboxes)

---

## Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `app/[locale]/dashboard/components/import/types/import-platform-card-vm.ts` | ViewModel interface + factory |
| `server/imports/atas-actions.ts` | Server action for Excel parsing |
| `app/api/imports/atas/parse/route.ts` | API route for Excel parsing (optional, if server action insufficient) |
| `hooks/use-debounced-value.ts` | Debounce hook for search |

### Files to Modify
| File | Change |
|------|--------|
| `config/platforms.tsx` | Remove eager component imports, lazy-load step components |
| `import-type-selection.tsx` | Add debounce, memo grid, reserved panel space |
| `platform-card.tsx` | Accept ViewModel instead of PlatformConfig |
| `atas/atas-file-upload.tsx` | Remove top-level exceljs import, use server action |
| `platform-tutorial.tsx` | Use ViewModel for display data |
| `components/ui/badge.tsx` | May need consistent badge sizing |
| `lib/performance/next-config.ts` | Remove exceljs from external packages (if server-side only) |

### Files to Review
| File | Purpose |
|------|---------|
| `import-button.tsx` | Ensure stable across selector changes |
| `store/import-type-preference-store.ts` | Already exists, verify compatibility |

---

## Success Criteria Checklist

- [ ] Import selector stable across search, filtering, compare mode, disabled states, mobile layouts
- [ ] exceljs not loaded until user enters an import path that needs it
- [ ] ImportPlatformCardViewModel replaces direct parser dependency in card rendering
- [ ] No whole-grid rerender on every selection change
- [ ] TypeScript strict mode passes
- [ ] ESLint passes (no new lint errors)

---

## Dependencies on Other Phases

- **Phase 01 (Visual Refresh)**: Uses v2 design system tokens and components
- **Phase 03 (Widget Shells)**: No direct dependency, but similar pattern for server/client split
- **Phase 08 (Font & Bundle Opt)**: Bundle optimization will verify exceljs removal

## Blockers/Concerns

1. **Server action file upload size**: Need to verify server action can handle large Excel files (multipart limits)
2. **Breaking PlatformConfig consumers**: `platforms.tsx` is imported in 10+ files — view model changes need careful migration
3. **ATAS processor coupling**: ATAS processor may depend on parsed data format from exceljs — need to verify compatibility
4. **Compare mode UX on mobile**: May need explicit disable/not-optimized messaging

---

## Appendix: Platform Config Consumption Map

| Consumer | What it uses |
|----------|--------------|
| `import-type-selection.tsx` | `platforms[]`, `PlatformConfig.name/description/category/logo` |
| `platform-card.tsx` | `PlatformConfig` (full) |
| `platform-tutorial.tsx` | `PlatformConfig.videoUrl/details/logo/customComponent` |
| `import-button.tsx` | `platforms.find()`, `PlatformConfig.steps/processorComponent/customComponent` |
| `column-mapping.tsx` | `PlatformConfig.processFile()` |
| `header-selection.tsx` | `PlatformConfig.skipHeaderSelection` |
| `account-selection.tsx` | `PlatformConfig.requiresAccountSelection` |
| `store/import-type-preference-store.ts` | `PlatformType` (only the type) |

**Key insight**: Most consumers only need display data, not runtime components.

---

*End of Phase 04 Context*
