# Analytics/Statistics Page Refinement — One-Shot Implementation Plan

> **For agentic workers:** This is a consolidated batch plan. All changes are applied in sequence, verified at the end.

**Goal:** Match Statistics page to `legion-vault.html` analytics tab, rename sidebar "Copilot" → "Analytics"

**Files changed:**
- `components/sidebar/dashboard-sidebar.tsx`
- `app/[locale]/dashboard/analytics/statistics/components/statistics-client.tsx`
- `app/[locale]/dashboard/analytics/statistics/components/stats-table.tsx`

**Files verified (no changes needed):**
- `server/statistics.ts` — already returns per-customTag stats via `setupStats`

---

### Batch Task: Apply All Three File Changes

- [ ] **Step 1: Sidebar rename**

Edit `components/sidebar/dashboard-sidebar.tsx` line 77:

BEFORE: `label: "Copilot", icon: <Sparkles ...>`
AFTER: `label: "Analytics", icon: <BarChart3 ...>`

- [ ] **Step 2: Statistics page header + time filter**

Edit `app/[locale]/dashboard/analytics/statistics/components/statistics-client.tsx`:

Line 8: Remove `unifiedSectionEyebrowClassName` import (will use inline classes instead). Delete: `import { unifiedSectionEyebrowClassName } from '@/components/layout/unified-page-recipes'`

Line 118: Replace `<div className={unifiedSectionEyebrowClassName}>Statistics</div>` with `<div className="text-[11px] font-semibold tracking-[0.16em] uppercase text-primary">Statistics</div>`

Line 119: Change `bg-card/50` to `bg-card`

Line 128: Change `'bg-semantic-success/15 text-semantic-success'` to `'bg-primary text-primary-foreground font-semibold'`

- [ ] **Step 3: StatsTable column headers + font size**

Edit `app/[locale]/dashboard/analytics/statistics/components/stats-table.tsx`:

Line 44: Change `'text-left px-5 py-2'` to `'text-left px-5 py-2 font-medium'`
Line 45: Change `'text-right px-5 py-2'` to `'text-right px-5 py-2 font-medium'`
Line 46: Change `'text-right px-5 py-2'` to `'text-right px-5 py-2 font-medium'`
Line 47: Change `'text-right px-5 py-2'` to `'text-right px-5 py-2 font-medium'`
Line 48: Change `'text-right px-5 py-2'` to `'text-right px-5 py-2 font-medium'`

Line 34: Change `const dataCellClass = 'px-5 py-2 text-xs tabular-nums'` to `const dataCellClass = 'px-5 py-2.5 text-sm tabular-nums'`

Remove `headerCellClass` variable entirely — use inline classes in the `<th>` elements:

Line 33: Delete `const headerCellClass = ...`

Lines 44-48: Change from:
```tsx
<th className={cn(headerCellClass, 'text-left px-5 py-2 font-medium')}>Symbol</th>
<th className={cn(headerCellClass, 'text-right px-5 py-2 font-medium')}>Trades</th>
<th className={cn(headerCellClass, 'text-right px-5 py-2 font-medium')}>Win %</th>
<th className={cn(headerCellClass, 'text-right px-5 py-2 font-medium')}>PnL</th>
<th className={cn(headerCellClass, 'text-right px-5 py-2 font-medium')}>Avg R</th>
```
To:
```tsx
<th className="text-left px-5 py-2.5 text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium">Symbol</th>
<th className="text-right px-5 py-2.5 text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium">Trades</th>
<th className="text-right px-5 py-2.5 text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium">Win %</th>
<th className="text-right px-5 py-2.5 text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium">PnL</th>
<th className="text-right px-5 py-2.5 text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium">Avg R</th>
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: No type errors in the modified files

- [ ] **Step 5: Commit and push**

```bash
git add components/sidebar/dashboard-sidebar.tsx app/\[locale\]/dashboard/analytics/statistics/components/statistics-client.tsx app/\[locale\]/dashboard/analytics/statistics/components/stats-table.tsx
git commit -m "feat: align statistics page with legion-vault.html design + rename Copilot to Analytics"
git push
```
