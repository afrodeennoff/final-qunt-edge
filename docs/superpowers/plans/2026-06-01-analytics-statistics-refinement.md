# Analytics/Statistics Page Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Match the Statistics page to the `legion-vault.html` analytics tab design, rename sidebar "Copilot" → "Analytics", and ensure custom tag analytics auto-sync.

**Architecture:** Two independent tracks: (A) Sidebar rename, (B) Statistics page visual overhaul to match the HTML prototype's Analytics tab exactly. The `getStatisticsAction` server function already returns all needed data — no backend changes required.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, shadcn/ui, recharts (for future chart additions)

---

### Task 1: Rename Sidebar "Copilot" → "Analytics"

**Files:**
- Modify: `components/sidebar/dashboard-sidebar.tsx:75-79`

- [ ] **Step 1: Change the label and icon**

In `dashboard-sidebar.tsx`, change the Copilot nav item:

```tsx
// BEFORE (lines 75-79):
{
    href: `/${locale}/dashboard/analytics`,
    icon: <Sparkles className={NAV_ICON_SIZE} />,
    label: "Copilot",
    group: "Review"
},

// AFTER:
{
    href: `/${locale}/dashboard/analytics`,
    icon: <BarChart3 className={NAV_ICON_SIZE} />,
    label: "Analytics",
    group: "Review"
},
```

Also update the Statistics item label to "Statistics" (it already is), and ensure both are under the "Review" group. The Statistics item at lines 81-85 is correct.

- [ ] **Step 2: Commit**

```bash
git add components/sidebar/dashboard-sidebar.tsx
git commit -m "feat: rename sidebar Copilot -> Analytics"
```

---

### Task 2: Update Statistics Page Header & Time Filter to Match HTML

**Files:**
- Modify: `app/[locale]/dashboard/analytics/statistics/components/statistics-client.tsx`
- Reference: `public/legion-vault.html` (lines 156-165 for filter buttons, lines 117-118 for header)

- [ ] **Step 1: Update the header style and time filter section**

Replace the header + time filter section in `statistics-client.tsx` (lines 114-136):

```tsx
// BEFORE (lines 114-136):
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

      {/* Header + Time Filters */}
      <div className="flex items-center justify-between">
        <div className={unifiedSectionEyebrowClassName}>Statistics</div>
        <div className="flex gap-1 p-1 rounded-xl bg-card/50">
          {(['7d', '14d', '30d', '90d', 'all'] as TimePeriod[]).map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
                period === p
                  ? 'bg-semantic-success/15 text-semantic-success'
                  : 'text-muted-foreground/50 hover:text-foreground',
              )}
            >
              {p === 'all' ? 'All Time' : p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

// AFTER (HTML match):
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

      {/* Header + Time Filters — matches legion-vault.html analytics tab */}
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold tracking-[0.16em] uppercase text-primary">Statistics</div>
        <div className="flex gap-1 p-1 rounded-xl bg-card">
          {(['7d', '14d', '30d', '90d', 'all'] as TimePeriod[]).map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 filter-btn',
                period === p
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {p === 'all' ? 'All Time' : p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
```

- [ ] **Step 2: Remove unused import**

Remove `unifiedSectionEyebrowClassName` from the import if it's no longer used elsewhere:

```tsx
// Check if unifiedSectionEyebrowClassName is still used elsewhere in this file
// If the only usage was in the header (removed above), delete it from the import:
// BEFORE:
import { unifiedSectionEyebrowClassName } from '@/components/layout/unified-page-recipes'
// AFTER: (remove the line entirely if no other usage in this file)
```

Verify: `unifiedSectionEyebrowClassName` is also used in the Risk section (line 197). Keep the import.

- [ ] **Step 3: Commit**

```bash
git add app/\[locale\]/dashboard/analytics/statistics/components/statistics-client.tsx
git commit -m "feat: update statistics page header and time filter styling to match HTML"
```

---

### Task 3: Update KPI Bar Grid to Match HTML Layout

**Files:**
- Modify: `app/[locale]/dashboard/analytics/statistics/components/statistics-client.tsx:139-168`

- [ ] **Step 1: Replace the KPI bar section**

Replace the KPI bar (lines 139-168) with the exact HTML matching version:

```tsx
// BEFORE (lines 139-168):
      {/* KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="rounded-xl bg-card/30 border border-foreground/[0.06] p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Total PnL</div>
          <div className={cn('text-xl font-bold tabular-nums mt-1', data.grandPnl >= 0 ? 'text-semantic-success' : 'text-semantic-error')}>
            {formatPnl(data.grandPnl)}
          </div>
        </div>
        <div className="rounded-xl bg-card/30 border border-foreground/[0.06] p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Win Rate</div>
          <div className="text-xl font-bold tabular-nums mt-1">{data.grandWinRate.toFixed(1)}%</div>
        </div>
        <div className="rounded-xl bg-card/30 border border-foreground/[0.06] p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Avg R</div>
          <div className={cn('text-xl font-bold tabular-nums mt-1', data.avgRR >= 1 ? 'text-semantic-success' : 'text-semantic-error')}>
            {data.avgRR >= 1 ? '+' : ''}{data.avgRR.toFixed(2)}R
          </div>
        </div>
        <div className="rounded-xl bg-card/30 border border-foreground/[0.06] p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Profit Factor</div>
          <div className="text-xl font-bold tabular-nums mt-1">{data.profitFactor.toFixed(2)}</div>
        </div>
        <div className="rounded-xl bg-card/30 border border-foreground/[0.06] p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Total Trades</div>
          <div className="text-xl font-bold tabular-nums mt-1">{data.grandTotal}</div>
        </div>
        <div className="rounded-xl bg-card/30 border border-foreground/[0.06] p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Best Day</div>
          <div className="text-xl font-bold tabular-nums mt-1 text-semantic-success">{formatPnl(data.bestDay)}</div>
        </div>
      </div>

// AFTER (matches legion-vault.html lines 168-193):
      {/* KPI Bar — matches HTML analytics tab exactly */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4" id="kpi-bar">
        {[
          { label: 'Total PnL', value: formatPnl(data.grandPnl), pnl: data.grandPnl, mono: true },
          { label: 'Win Rate', value: `${data.grandWinRate.toFixed(1)}%`, pnl: data.grandWinRate - 50, mono: true },
          { label: 'Avg R', value: `${data.avgRR >= 0 ? '+' : ''}${data.avgRR.toFixed(2)}R`, pnl: data.avgRR, mono: true },
          { label: 'Profit Factor', value: data.profitFactor.toFixed(2), pnl: data.profitFactor - 1, mono: true },
          { label: 'Total Trades', value: String(data.grandTotal), pnl: 0, mono: true },
          { label: 'Best Day', value: formatPnl(data.bestDay), pnl: data.bestDay, mono: true },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-xl bg-card/30 border border-foreground/[0.06] p-4">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50">{kpi.label}</div>
            <div className={cn(
              `text-xl font-bold tabular-nums mt-1${kpi.mono ? ' mono' : ''}`,
              kpi.pnl > 0 ? 'text-semantic-success' : kpi.pnl < 0 ? 'text-semantic-error' : ''
            )}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>
```

- [ ] **Step 2: Commit**

```bash
git add app/\[locale\]/dashboard/analytics/statistics/components/statistics-client.tsx
git commit -m "feat: update KPI bar to match HTML analytics tab layout"
```

---

### Task 4: Update Performance Tables to Match HTML Styling

**Files:**
- Modify: `app/[locale]/dashboard/analytics/statistics/components/stats-table.tsx`
- Reference: `public/legion-vault.html` (lines 199-232 for table styling)

- [ ] **Step 1: Update StatsTable component to match HTML table styling**

Replace the entire `stats-table.tsx` with the HTML-matching version:

```tsx
'use client'

import { cn } from '@/lib/utils'

export type StatsTableRow = {
  name: string
  totalTrades: number
  winRate: number
  avgRR: number
  totalRR: number
  wins?: number
  losses?: number
}

type StatsTableProps = {
  title: string
  rows: StatsTableRow[]
  emptyMessage?: string
}

export function StatsTable({ title, rows, emptyMessage = 'No data yet' }: StatsTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl overflow-hidden bg-card/30 border border-foreground/[0.06]">
        <div className="px-5 py-3 text-[11px] font-semibold tracking-[0.14em] uppercase text-muted-foreground/50 border-b border-foreground/[0.06]">
          {title}
        </div>
        <div className="px-5 py-6 text-center">
          <p className="text-xs text-muted-foreground/40 italic">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden bg-card/30 border border-foreground/[0.06]">
      <div className="px-5 py-3 text-[11px] font-semibold tracking-[0.14em] uppercase text-muted-foreground/50 border-b border-foreground/[0.06]">
        {title}
      </div>
      <table className="w-full">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-muted-foreground/50">
            <th className="text-left px-5 py-2 font-medium">Symbol</th>
            <th className="text-right px-5 py-2 font-medium">Trades</th>
            <th className="text-right px-5 py-2 font-medium">Win %</th>
            <th className="text-right px-5 py-2 font-medium">PnL</th>
            <th className="text-right px-5 py-2 font-medium">Avg R</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const pnlPositive = row.totalRR >= 0
            const rrPositive = row.avgRR >= 0
            return (
              <tr
                key={row.name}
                className="border-b border-foreground/[0.03] last:border-0 hover:bg-background/20 transition-colors"
              >
                <td className="px-5 py-2.5 text-sm font-medium">{row.name}</td>
                <td className="px-5 py-2.5 text-sm tabular-nums text-right text-muted-foreground">{row.totalTrades}</td>
                <td className={cn('px-5 py-2.5 text-sm tabular-nums text-right', row.winRate >= 50 ? 'text-semantic-success' : 'text-semantic-error')}>
                  {row.winRate.toFixed(1)}%
                </td>
                <td className={cn('px-5 py-2.5 text-sm tabular-nums text-right font-medium', pnlPositive ? 'text-semantic-success' : 'text-semantic-error')}>
                  {pnlPositive ? '+' : ''}{row.totalRR.toFixed(2)}R
                </td>
                <td className={cn('px-5 py-2.5 text-sm tabular-nums text-right font-medium', rrPositive ? 'text-semantic-success' : 'text-semantic-error')}>
                  {rrPositive ? '+' : ''}{row.avgRR.toFixed(2)}R
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\[locale\]/dashboard/analytics/statistics/components/stats-table.tsx
git commit -m "feat: update stats table styling to match HTML analytics tables"
```

---

### Task 5: Add Worst Day to KPI and Verify SetupStats Has Custom Tags

**Files:**
- Modify: `app/[locale]/dashboard/analytics/statistics/components/statistics-client.tsx`
- Verify: `server/statistics.ts`

- [ ] **Step 1: Verify custom tags analytics are already working**

The `server/statistics.ts` function already pulls `customTags` from journal entries (lines 111-124) and computes per-tag stats. The `SetupStat` type (in `types.ts`) already includes: `tag`, `totalTrades`, `winRate`, `avgRR`, `totalRR`. This satisfies the requirement for custom tag auto-sync with win rate, loss rate, total trades, avg R, and profitability.

No changes needed to the server function.

- [ ] **Step 2: Add Worst Day KPI (matches HTML prototype)**

The HTML prototype has a "Worst Day" metric in the KPI bar but the current statistics-client doesn't include it. The server already returns `worstDay` (line 209). Add it to the KPI bar array in the previous task or add it here:

```tsx
// In the KPI bar array, add Worst Day as the 7th item or replace the
// "grid-cols-6" with "grid-cols-7":
{ label: 'Worst Day', value: formatPnl(data.worstDay), pnl: data.worstDay * -1, mono: true },
```

Update the grid class from `lg:grid-cols-6` to `lg:grid-cols-7` to accommodate the extra KPI.

Alternatively, omit Worst Day to keep the 6-column layout consistent with the HTML (the HTML has exactly 6 KPIs: Total PnL, Win Rate, Avg R, Profit Factor, Total Trades, Best Day). The current implementation already has those 6. The HTML doesn't show Worst Day — keep it as is.

- [ ] **Step 3: Commit**

```bash
git add app/\[locale\]/dashboard/analytics/statistics/components/statistics-client.tsx
git commit -m "feat: finalize statistics page styling alignment"
```

---

### Task 6: Final Verification

**Files:**
- Build: `npm run build` (or `npm run typecheck`)

- [ ] **Step 1: Typecheck**

Run: `npm run typecheck`
Expected: No errors in statistics-related files

- [ ] **Step 2: Verify statistics page matches HTML**

Open the statistics page and compare with `public/legion-vault.html` lines 152-241. Confirm:
- Header: "Statistics" with green uppercase tracking
- Time filter buttons: 7D, 14D, 30D, 90D, All Time with correct active state
- KPI bar: 6 cards in a row with exact labels and values
- Performance tables: Symbol, Weekday, Concept/Tag, Timeframe with exact column headers
- Risk metrics: 6 metrics (Sharpe, Sortino, Expectancy, Max Drawdown, Profit Factor, Win/Loss Ratio)

- [ ] **Step 3: Commit any final fixes if needed**
