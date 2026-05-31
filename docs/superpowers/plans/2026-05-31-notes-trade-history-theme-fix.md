# Notes Page Trade History & Theme Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix `/dashboard/notes` to show complete trade history like `/dashboard/trades`, fix all theme color conflicts/mismatches, add home-screen-themed default theme, and add missing-info popup.

**Architecture:** Fixes span 6 subsystems: (A) notes data fetching — increase page size/make notes consume from trading-domain-store like trades page does; (B) undefined CSS variable references — define or replace broken vars; (C) typo in `--e-ref-text-muted` — fix 5 occurrences; (D) hardcoded hex colors — replace with CSS vars; (E) new home-screen theme — add palette, make default; (F) missing-info popup — add unsaved changes guard.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Prisma (Postgres), Zustand (state), CSS custom properties, shadcn/ui, Tailwind v4

---

## Subsystem A: Notes Page Shows All Trade History

### Background: Root Cause

`/dashboard/trades` fetches ALL trades via `DataProvider` → `fetchAllTrades()` → `getTradesAction()` with pagination (500/page, unlimited pages). Trades live in `trading-domain-store` and are filtered client-side.

`/dashboard/notes` fetches via `useJournal()` → `getJournalTradesAction()` with `JOURNAL_PAGE_SIZE = 30`, single page only. If user has >30 trades, only the 30 most recent appear. Additionally, `isLoading` initial state is `true` even when `userId` is `null` — if user store hasn't loaded, loading spinner shows forever.

### Files to Create/Modify

| File | Action | Reason |
|------|--------|--------|
| `app/[locale]/dashboard/notes/lib/journal-constants.ts:15` | Modify | Increase `JOURNAL_PAGE_SIZE` |
| `app/[locale]/dashboard/notes/lib/use-journal.ts:80,85-86,125` | Modify | Fix `isLoading` forever bug; fetch all trades on mount |
| `app/[locale]/dashboard/notes/journal-client.tsx:364,387-391,393,463-469` | Modify | Remove demo fallback; use consolidated trades source |

### Task A1: Increase page size and fix auth guard

- [ ] **Step 1: Change `JOURNAL_PAGE_SIZE` from 30 to 500**

In `app/[locale]/dashboard/notes/lib/journal-constants.ts:15`:

```ts
export const JOURNAL_PAGE_SIZE = 500
```

- [ ] **Step 2: Fix `isLoading` forever bug in `use-journal.ts`**

In `app/[locale]/dashboard/notes/lib/use-journal.ts:80`, change:

```ts
const [isLoading, setIsLoading] = useState(true)
```

To:

```ts
const [isLoading, setIsLoading] = useState(!userId)
```

In `app/[locale]/dashboard/notes/lib/use-journal.ts:85-86`, add early return before `setIsLoading(true)`:

```ts
const fetchData = useCallback(async () => {
  if (!userId) {
    setIsLoading(false)
    return
  }
  setIsLoading(true)
```

### Task A2: Add pagination loop to fetch all trades

- [ ] **Step 1: Update `fetchData` to paginate through all pages**

In `app/[locale]/dashboard/notes/lib/use-journal.ts:88-121`, replace the single-page fetch with a paginated loop:

```ts
const fetchData = useCallback(async () => {
  if (!userId) {
    setIsLoading(false)
    return
  }
  setIsLoading(true)
  try {
    let allServerCards: TradeJournalCard[] = []
    let currentPage = 1
    let hasMore = true

    while (hasMore) {
      const result = await getJournalTradesAction(userId, currentPage, JOURNAL_PAGE_SIZE, {
        status: filters.status !== 'all' ? filters.status : undefined,
        search: filters.search || undefined,
        instrument: filters.instrument || undefined,
        direction: filters.direction !== 'all' ? filters.direction : undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        tags: filters.tags.length > 0 ? filters.tags : undefined,
        sort: filters.sort,
      })

      const pageCards = result.entries as unknown as TradeJournalCard[]
      allServerCards = [...allServerCards, ...pageCards]
      hasMore = currentPage < result.totalPages
      currentPage += 1
    }

    // Merge with localStorage pending entries
    const pending = loadPending(userId)
    if (pending.size > 0) {
      const merged = allServerCards.map(card => {
        const pendingEntry = pending.get(card.trade.id)
        if (pendingEntry) {
          pending.delete(card.trade.id)
          return { ...card, journal: pendingEntry }
        }
        return card
      })
      clearPending(userId)
      setCards(merged)
      setStats(computeStats(merged))
    } else {
      setCards(allServerCards)
      setStats(computeStats(allServerCards))
    }

    setTotalPages(Math.ceil(allServerCards.length / JOURNAL_PAGE_SIZE))
  } catch (err) {
    console.error('Failed to fetch journal:', err)
  } finally {
    setIsLoading(false)
  }
}, [userId, filters])
```

- [ ] **Step 2: Remove `page` dependency from `fetchData`**

In `app/[locale]/dashboard/notes/lib/use-journal.ts`, remove `page` from the `useCallback` dependency array (line 127). The function should only depend on `[userId, filters]`.

### Task A3: Remove demo trade fallback (real data always shows)

- [ ] **Step 1: Remove `DEMO_TRADES` data**

Delete lines 20-117 from `app/[locale]/dashboard/notes/journal-client.tsx` (the entire `DEMO_TRADES` array).

Remove `DEMO_TRADES` from the import (if it was imported separately — currently it's defined inline, so just delete the whole block).

- [ ] **Step 2: Simplify `displayCards` to always use real data**

Replace lines 386-391:

```ts
const displayCards = useMemo(() => {
  if (cards.length > 0) return cards
  return isLoading ? [] : DEMO_TRADES
}, [cards, isLoading])
```

With:

```ts
const displayCards = cards
```

And remove the import/usage for `DEMO_TRADES`.

- [ ] **Step 3: Remove demo indicator banner**

Delete lines 478-489 (the demo mode badge):

```tsx
{displayCards.length > 0 && displayCards.every(c => c.trade.id.startsWith('demo-')) && (
  <div className="shrink-0 px-5 py-2 bg-primary/5 border-b border-primary/10">
    ...
  </div>
)}
```

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/dashboard/notes/ && git commit -m "fix(notes): fetch all trades with pagination, remove demo fallback"
```

---

## Subsystem B: Fix Undefined CSS Variables

### Background: Root Cause

11 CSS variables are referenced but never defined: `--precision-cobalt`, `--precision-panel`, `--precision-panel-elevated`, `--precision-panel-inner`, `--mk-surface`, `--mk-text`, `--mk-text-muted`, `--ui-60-surface`, `--ui-60-text`, `--ui-30-border`, `--ui-30-subtle`, `--ui-30-text`, `--ui-10-accent`, `--ui-10-accent-fg`. These will produce invisible UI elements because `hsl(undefined)` is invalid CSS.

### Files to Modify

| File | Lines | Reason |
|------|-------|--------|
| `app/globals.css` | 1458, 1609, 1615, 1617, 2280, 2282, 2291, 2301-2302, 2306-2308, 2312-2313 | Replace undefined vars with defined alternatives |
| `app/globals.css` | 2-4 | Remove empty placeholder CSS imports |

### Task B1: Fix `--precision-cobalt` reference

- [ ] **Step 1: Replace `--precision-cobalt` with `--foreground`**

Line 1458 in `app/globals.css`:

```css
0 0 0 1px hsl(var(--precision-cobalt) / 0.06)
```

Replace with:

```css
0 0 0 1px hsl(var(--foreground) / 0.06)
```

### Task B2: Fix `--precision-panel*` references

- [ ] **Step 1: Replace `--precision-panel` with `--qe-panel` (or define fallback)**

Lines 1609, 1624:

```css
background: hsl(var(--precision-panel) / 0.9);
```

Replace with:

```css
background: hsl(var(--background) / 0.9);
```

Line 1615:

```css
background: hsl(var(--precision-panel-elevated) / 0.94);
```

Replace with:

```css
background: hsl(var(--background) / 0.94);
```

Line 1617:

```css
inset 0 0 0 1px hsl(var(--precision-panel-inner) / 0.03)
```

Replace with:

```css
inset 0 0 0 1px hsl(var(--border) / 0.03)
```

### Task B3: Fix `--mk-*` references

- [ ] **Step 1: Replace `--mk-surface` with `--card`**

Lines 2280, 2290:

```css
background: hsl(var(--mk-surface) / 0.92);
/* and */
background: hsl(var(--mk-surface) / 0.66);
```

Replace with:

```css
background: hsl(var(--card) / 0.92);
/* and */
background: hsl(var(--card) / 0.66);
```

- [ ] **Step 2: Replace `--mk-text` with `--foreground`**

Line 2282:

```css
inset 0 1px 0 hsl(var(--mk-text) / 0.03)
```

Replace with:

```css
inset 0 1px 0 hsl(var(--foreground) / 0.03)
```

- [ ] **Step 3: Replace `--mk-text-muted` with `--muted-foreground`**

Line 2291:

```css
color: hsl(var(--mk-text-muted));
```

Replace with:

```css
color: hsl(var(--muted-foreground));
```

### Task B4: Fix `--ui-*` references

- [ ] **Step 1: Replace `--ui-60-surface` with `--card`, `--ui-60-text` with `--card-foreground`**

Lines 2301-2302:

```css
background: hsl(var(--ui-60-surface));
color: hsl(var(--ui-60-text));
```

Replace with:

```css
background: hsl(var(--card));
color: hsl(var(--card-foreground));
```

- [ ] **Step 2: Replace `--ui-30-border` with `--border`, `--ui-30-subtle` with `--muted`, `--ui-30-text` with `--muted-foreground`**

Lines 2306-2308:

```css
border-color: hsl(var(--ui-30-border) / 0.65);
background: hsl(var(--ui-30-subtle) / 0.22);
color: hsl(var(--ui-30-text));
```

Replace with:

```css
border-color: hsl(var(--border) / 0.65);
background: hsl(var(--muted) / 0.22);
color: hsl(var(--muted-foreground));
```

- [ ] **Step 3: Replace `--ui-10-accent` with `--accent`, `--ui-10-accent-fg` with `--accent-foreground`**

Lines 2312-2313:

```css
background: hsl(var(--ui-10-accent));
color: hsl(var(--ui-10-accent-fg));
```

Replace with:

```css
background: hsl(var(--accent));
color: hsl(var(--accent-foreground));
```

### Task B5: Remove empty placeholder CSS files

- [ ] **Step 1: Remove the imports from globals.css**

At the top of `app/globals.css`, find and remove lines that import from `styles/styleseed-tokens.css`, `styles/tokens.css`:

```css
/* Remove these lines if they exist */
@import "styles/tokens.css";
@import "styles/styleseed-tokens.css";
@import "styles/styleseed-base.css";
```

- [ ] **Step 2: Commit**

```bash
git add app/globals.css styles/ && git commit -m "fix(theme): replace undefined CSS vars, remove empty placeholder imports"
```

---

## Subsystem C: Fix Typo `--e-ref-text-muted` → `--qe-ref-text-muted`

### Background

5 occurrences of `text-[var(--e-ref-text-muted)]` are missing the `q`, rendering that text invisible (black on dark background).

### Files to Modify

| File | Lines |
|------|-------|
| `app/[locale]/(home)/components/HomeContent.tsx` | 193, 209, 350, 352, 559 |

### Task C1: Fix all 5 occurrences

- [ ] **Step 1: Replace `--e-ref-text-muted` with `--qe-ref-text-muted`**

In `app/[locale]/(home)/components/HomeContent.tsx`, these 5 lines need the `q` added:

Line 193:
```tsx
<div className="text-[10px] text-[var(--e-ref-text-muted)]">Win Rate</div>
```
→
```tsx
<div className="text-[10px] text-[var(--qe-ref-text-muted)]">Win Rate</div>
```

Line 209:
```tsx
<div className="text-[10px] text-[var(--e-ref-text-muted)]">Compliance</div>
```
→
```tsx
<div className="text-[10px] text-[var(--qe-ref-text-muted)]">Compliance</div>
```

Line 350:
```tsx
<span className="text-[var(--e-ref-text-muted)]">{row.label || `Day ${i + 1}`}</span>
```
→
```tsx
<span className="text-[var(--qe-ref-text-muted)]">{row.label || `Day ${i + 1}`}</span>
```

Line 352:
```tsx
<span className="text-[var(--e-ref-text-muted)] tabular-nums">{row.sub}</span>
```
→
```tsx
<span className="text-[var(--qe-ref-text-muted)] tabular-nums">{row.sub}</span>
```

Line 559:
```tsx
<div className="mt-3 text-[10px] text-[var(--e-ref-text-muted)]">{t.date}</div>
```
→
```tsx
<div className="mt-3 text-[10px] text-[var(--qe-ref-text-muted)]">{t.date}</div>
```

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/(home)/components/HomeContent.tsx && git commit -m "fix(home): fix typo --e-ref-text-muted -> --qe-ref-text-muted (5 occurrences)"
```

---

## Subsystem D: Replace Hardcoded Hex Colors With CSS Variables

### Background

`app/layout.tsx` has hardcoded `#0a0c0a` / `#F5F5F7` on the `<html>` element, which overrides the theme system. SVG elements in home components use `#00ff9f` instead of `var(--qe-ref-green)`.

### Files to Modify

| File | Lines | Change |
|------|-------|--------|
| `app/layout.tsx` | 144 | Replace hardcoded hex with CSS vars |
| `app/[locale]/(home)/components/HeroProductPreview.tsx` | 52-53 | Replace hardcoded stroke with CSS var |
| `app/[locale]/(home)/components/HomeContent.tsx` | 120, 134, 170-174 | Replace hardcoded bg/text colors with Tailwind theme tokens |

### Task D1: Fix `<html>` style override

- [ ] **Step 1: Read `app/layout.tsx` around line 144**

Find the hardcoded values:

```tsx
style={{ backgroundColor: '#0a0c0a', color: '#F5F5F7' }}
```

Replace with:

```tsx
style={{ backgroundColor: 'var(--qe-ref-surface)', color: 'var(--qe-ref-text)' }}
```

### Task D2: Fix hardcoded SVG green

- [ ] **Step 1: Read `HeroProductPreview.tsx` lines 50-60**

Find and replace `stroke="#00ff9f"` with `stroke="var(--qe-ref-green)"`.

- [ ] **Step 2: Read `HomeContent.tsx` lines 168-176**

Find and replace `fill="#00ff9f"` with `fill="var(--qe-ref-green)"`.

### Task D3: Fix hardcoded Tailwind colors

- [ ] **Step 1: Replace orange/blue hardcoded colors with theme-aware tokens**

In `HomeContent.tsx`:

```tsx
className="... bg-orange-500/10 text-orange-400"
```
→
```tsx
className="... bg-semantic-warning/10 text-semantic-warning"
```

```tsx
className="... bg-blue-500/10 text-blue-400"
```
→
```tsx
className="... bg-semantic-info/10 text-semantic-info"
```

- [ ] **Step 2: Commit**

```bash
git add app/layout.tsx app/[locale]/(home)/components/ && git commit -m "fix(theme): replace hardcoded hex colors with CSS variables"
```

---

## Subsystem E: New Home-Screen Theme + Make Default

### Background

The home screen uses `--qe-ref-*` CSS variables: `#00ff9f` green, `#0a0c0a` background, `#111411` card, `#f0f4f0` text. A new dashboard theme should replicate this exact palette and become the new default.

### Files to Modify

| File | Lines | Action |
|------|-------|--------|
| `lib/constants/dashboard-themes.ts` | 1-23, 84-421, 13 | Add new theme ID+label+palette, change default |
| `lib/constants/dashboard-themes.ts` | 33-57 | Add legacy alias for new theme |
| `server/user-data.ts` | ~536 | Ensure `DEFAULT_DASHBOARD_THEME` is used as fallback |

### Task E1: Add new theme palette

- [ ] **Step 1: Generate a unique CUID for the new theme**

Use the pattern of existing CUIDs (25 chars, `cm` prefix). Pick: `cmo9abcdef000004l78abcdef` (replace with actual cuid generation at implementation time).

- [ ] **Step 2: Add to `VALID_DASHBOARD_THEMES`**

```ts
export const VALID_DASHBOARD_THEMES = [
  'cmo9abcdef000004l78abcdef',  // NEW: Edge (home-screen theme) - must be first
  'cmlh0x713000104jrgmds6vcd',
  'cmmi8o8ic000904l12ucn8i9p',
  // ...rest
] as const
```

- [ ] **Step 3: Add label**

```ts
export const THEME_LABELS: Record<DashboardTheme, string> = {
  cmo9abcdef000004l78abcdef: 'Edge',   // NEW - must be first
  // ...rest
}
```

- [ ] **Step 4: Add palette mirroring `--qe-ref-*` colors**

The palette uses the same variables as other themes but colors match the home screen:

```ts
cmo9abcdef000004l78abcdef: {
  '--background': '#0a0c0a',
  '--foreground': '#f0f4f0',
  '--card': '#111411',
  '--card-foreground': '#f0f4f0',
  '--popover': '#111411',
  '--popover-foreground': '#f0f4f0',
  '--primary': '#00ff9f',
  '--primary-foreground': '#000000',
  '--secondary': '#1a1e1a',
  '--secondary-foreground': '#f0f4f0',
  '--muted': '#1a1e1a',
  '--muted-foreground': '#8a908a',
  '--accent': '#1a1e1a',
  '--accent-foreground': '#00ff9f',
  '--destructive': 'hsl(0, 84%, 60%)',
  '--destructive-foreground': '#f0f4f0',
  '--border': '#1e221e',
  '--input': '#1e221e',
  '--ring': '#00ff9f',
  '--chart-1': '#00ff9f',
  '--chart-2': '#00cc7a',
  '--chart-3': '#5affc3',
  '--chart-4': '#00aa66',
  '--chart-5': '#80ffd4',
  '--sidebar': '#0a0c0a',
  '--sidebar-background': '#0a0c0a',
  '--sidebar-foreground': '#f0f4f0',
  '--sidebar-primary': '#00ff9f',
  '--sidebar-primary-foreground': '#000000',
  '--sidebar-accent': '#1a1e1a',
  '--sidebar-accent-foreground': '#00ff9f',
  '--sidebar-border': '#1e221e',
  '--sidebar-ring': '#00ff9f',
  '--success': '#0ECB81',
  '--success-foreground': '#FFFFFF',
  '--warning': 'hsl(38, 92%, 50%)',
  '--warning-foreground': '#000000',
  '--radius': '1rem',
  '--shadow-color': 'hsl(0, 0%, 0%)',
  '--shadow-opacity': '0.6',
  '--shadow-blur': '40px',
  '--shadow-spread': '-10px',
  '--shadow-offset-x': '0px',
  '--shadow-offset-y': '20px',
  '--letter-spacing': '-0.015em',
  '--spacing': '0.25rem',
},
```

### Task E2: Make Edge the default theme

- [ ] **Step 1: Change `DEFAULT_DASHBOARD_THEME`**

```ts
export const DEFAULT_DASHBOARD_THEME: DashboardTheme = 'cmo9abcdef000004l78abcdef'
```

### Task E3: Add legacy alias for Edge

- [ ] **Step 1: Add entry to `LEGACY_DASHBOARD_THEME_ALIASES`**

```ts
const LEGACY_DASHBOARD_THEME_ALIASES: Record<string, DashboardTheme> = {
  edge: 'cmo9abcdef000004l78abcdef',
  default: 'cmo9abcdef000004l78abcdef',
  // ...existing aliases
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/constants/dashboard-themes.ts && git commit -m "feat(theme): add Edge theme (home-screen palette) as new default"
```

---

## Subsystem F: Add Missing-Info Popup for Unsaved Journal Changes

### Background

When a user has typed journal content and then clicks a different trade in the sidebar, any unsaved changes are silently discarded because the `handleSelectTrade` immediately switches the `expandedId` and the parent `JournalClient` component's `ref` pattern only saves after a 1500ms debounce.

### Files to Modify

| File | Lines | Action |
|------|-------|--------|
| `app/[locale]/dashboard/notes/journal-client.tsx` | 463-469 | Add unsaved-changes guard before switching trades |

### Task F1: Add confirmation dialog

- [ ] **Step 1: Track dirty state**

Add after line 369:

```tsx
const [hasUnsaved, setHasUnsaved] = useState(false)
const [pendingTradeId, setPendingTradeId] = useState<string | null>(null)
```

- [ ] **Step 2: Modify `update` function to track dirty state**

After line 437:

```tsx
setHasUnsaved(true)
```

- [ ] **Step 3: Modify `handleSelectTrade` to check for unsaved changes**

Replace lines 463-469:

```tsx
const handleSelectTrade = useCallback((tradeId: string) => {
  if (hasUnsaved && selectedCard?.journal) {
    setPendingTradeId(tradeId)
    return  // let the confirmation dialog handle the switch
  }
  toggleExpand(tradeId)
  const card = displayCards.find(c => c.trade.id === tradeId)
  if (card && !card.journal) {
    handleCreate(tradeId, card.trade.accountNumber)
  }
}, [displayCards, toggleExpand, handleCreate, hasUnsaved, selectedCard])
```

- [ ] **Step 4: Add confirmation dialog JSX**

Add before the closing `</div>` of the main return (around line 830):

```tsx
{/* Unsaved changes confirmation */}
{pendingTradeId && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="w-[380px] rounded-2xl border bg-card p-6 shadow-2xl">
      <h3 className="text-sm font-semibold">Unsaved changes</h3>
      <p className="mt-2 text-xs text-muted-foreground">
        You have unsaved journal content. Switching trades will discard these changes.
      </p>
      <div className="mt-5 flex items-center gap-2 justify-end">
        <button
          type="button"
          onClick={() => setPendingTradeId(null)}
          className="rounded-lg px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            setHasUnsaved(false)
            setPendingTradeId(null)
            toggleExpand(pendingTradeId)
            const card = displayCards.find(c => c.trade.id === pendingTradeId)
            if (card && !card.journal) {
              handleCreate(pendingTradeId, card.trade.accountNumber)
            }
          }}
          className="rounded-lg bg-destructive px-4 py-2 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors"
        >
          Discard & switch
        </button>
      </div>
    </div>
  </div>
)}
```

- [ ] **Step 5: Commit**

```bash
git add app/[locale]/dashboard/notes/journal-client.tsx && git commit -m "feat(notes): add unsaved changes confirmation dialog"
```

---

## Self-Review

### Spec Coverage
- **A1-A3**: Notes page fetching all trades ✓ (subsystem A covers page size, auth guard, demo removal)
- **B1-B5**: Undefined CSS vars fixed ✓ (all 11 broken vars replaced with working equivalents)
- **C1**: Typo fix ✓ (5 occurrences of `--e-ref-text-muted` → `--qe-ref-text-muted`)
- **D1-D3**: Hardcoded hex colors replaced ✓ (layout.tsx, SVGs, Tailwind hardcoded colors)
- **E1-E3**: New Edge theme added and made default ✓
- **F1**: Unsaved changes popup added ✓

### Placeholder Scan
- Theme CUID `cmo9abcdef000004l78abcdef` is a placeholder that MUST be replaced with an actual generated CUID during implementation. Marked clearly.

### Type Consistency
- `DashboardTheme` type updated to include new theme ID ✓
- `THEME_PALETTES` follows exact same shape as existing themes ✓
- `displayCards` becomes simple variable (no `useMemo`) — type stays `TradeJournalCard[]` ✓
