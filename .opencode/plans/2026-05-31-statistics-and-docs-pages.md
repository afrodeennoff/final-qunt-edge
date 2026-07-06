# Statistics & Documentation Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Statistics dashboard page (ticker/daily/setup breakdowns) and a comprehensive multi-page documentation site on the homepage.

**Architecture:** Phase 1 adds a new dashboard route at `/dashboard/analytics/statistics` with a server action that aggregates trades grouped by instrument, date, and journal tags. Phase 2 replaces the placeholder `/docs` page with a sidebar-driven multi-page documentation site covering all app features.

**Tech Stack:** Next.js 15 (App Router), Prisma, shadcn/ui, next-international, lucide-react

---

## File Structure

### New Files
```
server/statistics.ts                              # Server action: aggregate stats
app/[locale]/dashboard/analytics/statistics/
├── types.ts                                      # Type definitions
├── page.tsx                                      # Server component page wrapper
├── loading.tsx                                   # Loading skeleton
└── components/
    ├── statistics-client.tsx                     # Client component (main UI)
    └── stats-table.tsx                           # Reusable sortable stats table

app/[locale]/(landing)/docs/
├── layout.tsx                                    # Docs sidebar layout wrapper
├── loading.tsx                                   # Docs loading state
├── page.tsx                                      # Docs overview / welcome page
├── components/
│   └── docs-sidebar.tsx                          # Sidebar navigation component
├── getting-started/page.tsx                      # Quick start guide
├── dashboard/page.tsx                            # Dashboard overview docs
├── trade-log/page.tsx                            # Trade table docs
├── journal/page.tsx                              # Notes/journal docs
├── statistics/page.tsx                           # Statistics docs
├── analytics/page.tsx                            # Copilot/analytics docs
├── accounts/page.tsx                             # Account management docs
├── import/page.tsx                               # Data import docs
└── settings/page.tsx                             # Settings & profile docs
```

### Modified Files
```
components/sidebar/dashboard-sidebar.tsx          # Add Statistics nav item
app/[locale]/dashboard/components/dashboard-header.tsx   # Add statistics header title
app/[locale]/(landing)/components/navbar.tsx              # Add Docs nav link
app/sitemap.ts                                            # Update docs priority
```

---

## Phase 1: Statistics Page

### Task 1: Add Statistics Sidebar Nav Item & Header Title

**Files:**
- Modify: `components/sidebar/dashboard-sidebar.tsx` (add `BarChart3` import + nav item)
- Modify: `app/[locale]/dashboard/components/dashboard-header.tsx` (add statistics title + subtitle)

- [ ] **Step 1: Add `BarChart3` import to sidebar**

Edit `components/sidebar/dashboard-sidebar.tsx`, add `BarChart3` to the lucide-react import on line 7:
```typescript
import {
    Activity,
    BarChart3,
    BookOpen,
    Building2,
    CreditCard,
    Database,
    FileUp,
    FileText,
    LayoutDashboard,
    RefreshCw,
    Settings,
    Sparkles,
    TrendingUp,
    Shield,
    Users,
    DollarSign,
} from "lucide-react"
```

- [ ] **Step 2: Add Statistics nav item in "Review" group**

Edit `components/sidebar/dashboard-sidebar.tsx`, insert after the Copilot nav item (after line 78 closing brace), before the Playbook item:
```typescript
        {
            href: `/${locale}/dashboard/analytics/statistics`,
            icon: <BarChart3 className={NAV_ICON_SIZE} />,
            label: "Statistics",
            group: "Review"
        },
```

- [ ] **Step 3: Add statistics header title**

Edit `app/[locale]/dashboard/components/dashboard-header.tsx`, add to `getTitle()` after the `analytics` check on line 61:
```typescript
    if (pathname.includes('/dashboard/analytics/statistics')) return 'Statistics'
```

Add subtitle after the analytics subtitle on line 79:
```typescript
      : pathname.includes('/dashboard/analytics/statistics')
        ? 'Performance breakdown by ticker, day, and setup tag'
```

- [ ] **Step 4: Commit**

```bash
git add components/sidebar/dashboard-sidebar.tsx app/[locale]/dashboard/components/dashboard-header.tsx
git commit -m "feat(statistics): add sidebar nav item and header title"
```

---

### Task 2: Create Statistics Types

**Files:**
- Create: `app/[locale]/dashboard/analytics/statistics/types.ts`

- [ ] **Step 1: Write the types file**

Create `app/[locale]/dashboard/analytics/statistics/types.ts`:
```typescript
export type TickerStat = {
  ticker: string
  totalTrades: number
  winRate: number
  avgRR: number
  totalRR: number
  wins: number
  losses: number
  grossWin: number
  grossLoss: number
}

export type DailyStat = {
  date: string
  totalTrades: number
  winRate: number
  avgRR: number
  totalRR: number
}

export type SetupStat = {
  tag: string
  totalTrades: number
  winRate: number
  avgRR: number
  totalRR: number
}

export type StatisticsResult = {
  tickerStats: TickerStat[]
  dailyStats: DailyStat[]
  setupStats: SetupStat[]
  grandTotal: number
  grandWinRate: number
}
```

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/dashboard/analytics/statistics/types.ts
git commit -m "feat(statistics): add statistics type definitions"
```

---

### Task 3: Create Statistics Server Action

**Files:**
- Create: `server/statistics.ts`

- [ ] **Step 1: Write the server action**

Create `server/statistics.ts`:
```typescript
'use server'

import { prisma } from '@/lib/prisma'
import { getDatabaseUserId } from './auth'
import type { StatisticsResult, TickerStat, DailyStat, SetupStat } from '@/app/[locale]/dashboard/analytics/statistics/types'

function computeRR(trades: Array<{ pnl: number }>) {
  let grossWin = 0
  let grossLoss = 0
  let wins = 0
  let losses = 0

  for (const t of trades) {
    if (t.pnl > 0) { grossWin += t.pnl; wins++ }
    else if (t.pnl < 0) { grossLoss += Math.abs(t.pnl); losses++ }
  }

  const avgWin = wins > 0 ? grossWin / wins : 0
  const avgLoss = losses > 0 ? grossLoss / losses : 0
  const avgRR = avgLoss > 0 ? avgWin / avgLoss : 0
  const totalRR = grossLoss > 0 ? grossWin / grossLoss : 0

  return { avgRR, totalRR, wins, losses, grossWin, grossLoss }
}

export async function getStatisticsAction(): Promise<StatisticsResult> {
  const userId = await getDatabaseUserId()

  const trades = await prisma.trade.findMany({
    where: { userId },
    include: { journal: true },
    orderBy: { entryDate: 'desc' },
  })

  // Ticker Stats
  const tickerMap = new Map<string, Array<{ pnl: number }>>()
  for (const t of trades) {
    const instr = t.instrument || 'Unknown'
    if (!tickerMap.has(instr)) tickerMap.set(instr, [])
    tickerMap.get(instr)!.push({ pnl: Number(t.pnl) })
  }

  const tickerStats: TickerStat[] = []
  for (const [ticker, tList] of tickerMap) {
    const { avgRR, totalRR, wins, losses, grossWin, grossLoss } = computeRR(tList)
    const resolved = wins + losses
    tickerStats.push({
      ticker,
      totalTrades: tList.length,
      winRate: resolved > 0 ? (wins / resolved) * 100 : 0,
      avgRR,
      totalRR,
      wins,
      losses,
      grossWin,
      grossLoss,
    })
  }
  tickerStats.sort((a, b) => b.totalTrades - a.totalTrades)

  // Daily Stats
  const dateMap = new Map<string, Array<{ pnl: number }>>()
  for (const t of trades) {
    const d = t.entryDate instanceof Date ? t.entryDate : new Date(t.entryDate)
    const key = d.toISOString().slice(0, 10)
    if (!dateMap.has(key)) dateMap.set(key, [])
    dateMap.get(key)!.push({ pnl: Number(t.pnl) })
  }

  const dailyStats: DailyStat[] = []
  for (const [date, tList] of dateMap) {
    const { avgRR, totalRR, wins, losses } = computeRR(tList)
    const resolved = wins + losses
    dailyStats.push({
      date,
      totalTrades: tList.length,
      winRate: resolved > 0 ? (wins / resolved) * 100 : 0,
      avgRR,
      totalRR,
    })
  }
  dailyStats.sort((a, b) => b.date.localeCompare(a.date))

  // Setup Stats (from JournalEntry.customTags)
  const tagMap = new Map<string, Array<{ pnl: number }>>()
  for (const t of trades) {
    const journal = t.journal
    if (!journal || !journal.customTags || journal.customTags.length === 0) continue
    const pnlNum = Number(t.pnl)
    for (const tag of journal.customTags) {
      if (!tagMap.has(tag)) tagMap.set(tag, [])
      tagMap.get(tag)!.push({ pnl: pnlNum })
    }
  }

  const setupStats: SetupStat[] = []
  for (const [tag, tList] of tagMap) {
    const { avgRR, totalRR, wins, losses } = computeRR(tList)
    const resolved = wins + losses
    setupStats.push({
      tag,
      totalTrades: tList.length,
      winRate: resolved > 0 ? (wins / resolved) * 100 : 0,
      avgRR,
      totalRR,
    })
  }
  setupStats.sort((a, b) => b.totalTrades - a.totalTrades)

  // Grand total
  const grandResult = computeRR(trades.map(t => ({ pnl: Number(t.pnl) })))
  const grandResolved = grandResult.wins + grandResult.losses

  return {
    tickerStats,
    dailyStats,
    setupStats,
    grandTotal: trades.length,
    grandWinRate: grandResolved > 0 ? (grandResult.wins / grandResolved) * 100 : 0,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add server/statistics.ts
git commit -m "feat(statistics): add server action for aggregated stats"
```

---

### Task 4: Create Reusable Stats Table Component

**Files:**
- Create: `app/[locale]/dashboard/analytics/statistics/components/stats-table.tsx`

- [ ] **Step 1: Write the stats table component**

Create `app/[locale]/dashboard/analytics/statistics/components/stats-table.tsx`:
```typescript
'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

export type StatsTableRow = {
  name: string
  totalTrades: number
  winRate: number
  avgRR: number
  totalRR: number
}

type SortKey = 'name' | 'totalTrades' | 'winRate' | 'avgRR' | 'totalRR'

type StatsTableProps = {
  title: string
  rows: StatsTableRow[]
  emptyMessage?: string
}

export function StatsTable({ title, rows, emptyMessage = 'No data yet' }: StatsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('totalTrades')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * dir
      }
      return ((aVal as number) - (bVal as number)) * dir
    })
  }, [rows, sortKey, sortDir])

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown className="ml-1 h-3 w-3 inline opacity-30" />
    return sortDir === 'asc'
      ? <ArrowUp className="ml-1 h-3 w-3 inline" />
      : <ArrowDown className="ml-1 h-3 w-3 inline" />
  }

  const headerClass = "cursor-pointer select-none text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors px-2 py-2"
  const cellClass = "px-2 py-2 text-xs tabular-nums"

  if (rows.length === 0) {
    return (
      <div className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground/60 italic">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
      <div className="overflow-x-auto rounded-xl border-0 bg-background/30">
        <table className="w-full">
          <thead>
            <tr className="border-b border-transparent/10">
              <th className={headerClass} onClick={() => toggleSort('name')}>
                Name <SortIcon k="name" />
              </th>
              <th className={headerClass} onClick={() => toggleSort('totalTrades')}>
                Trades <SortIcon k="totalTrades" />
              </th>
              <th className={headerClass} onClick={() => toggleSort('winRate')}>
                Winrate <SortIcon k="winRate" />
              </th>
              <th className={headerClass} onClick={() => toggleSort('avgRR')}>
                Avg RR <SortIcon k="avgRR" />
              </th>
              <th className={headerClass} onClick={() => toggleSort('totalRR')}>
                Total RR <SortIcon k="totalRR" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(row => (
              <tr key={row.name} className="border-b border-transparent/5 last:border-0 hover:bg-background/20 transition-colors">
                <td className={cn(cellClass, "font-medium text-foreground")}>{row.name}</td>
                <td className={cellClass}>{row.totalTrades}</td>
                <td className={cn(cellClass, row.winRate >= 50 ? 'metric-positive' : 'metric-negative')}>
                  {row.winRate.toFixed(1)}%
                </td>
                <td className={cn(cellClass, row.avgRR >= 1 ? 'metric-positive' : 'metric-negative')}>
                  {row.avgRR.toFixed(2)}
                </td>
                <td className={cn(cellClass, row.totalRR >= 1 ? 'metric-positive' : 'metric-negative')}>
                  {row.totalRR.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/dashboard/analytics/statistics/components/stats-table.tsx
git commit -m "feat(statistics): add reusable sortable stats table component"
```

---

### Task 5: Create Statistics Client Component

**Files:**
- Create: `app/[locale]/dashboard/analytics/statistics/components/statistics-client.tsx`

- [ ] **Step 1: Write the statistics client component**

Create `app/[locale]/dashboard/analytics/statistics/components/statistics-client.tsx`:
```typescript
'use client'

import { useEffect, useState } from 'react'
import { getStatisticsAction } from '@/server/statistics'
import { StatsTable, type StatsTableRow } from './stats-table'
import type { StatisticsResult } from '../types'
import { unifiedInsetPanelClassName } from '@/components/layout/unified-page-recipes'
import { cn } from '@/lib/utils'

export function StatisticsClient() {
  const [data, setData] = useState<StatisticsResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStatisticsAction().then(result => {
      setData(result)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className={cn(unifiedInsetPanelClassName, 'rounded-xl p-4')}>
            <div className="h-4 w-32 bg-muted/30 rounded mb-4" />
            <div className="h-48 bg-muted/20 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (!data) {
    return <p className="text-sm text-muted-foreground">Failed to load statistics.</p>
  }

  const tickerRows: StatsTableRow[] = data.tickerStats.map(s => ({
    name: s.ticker,
    totalTrades: s.totalTrades,
    winRate: s.winRate,
    avgRR: s.avgRR,
    totalRR: s.totalRR,
  }))

  const dailyRows: StatsTableRow[] = data.dailyStats.map(s => ({
    name: s.date,
    totalTrades: s.totalTrades,
    winRate: s.winRate,
    avgRR: s.avgRR,
    totalRR: s.totalRR,
  }))

  const setupRows: StatsTableRow[] = data.setupStats.map(s => ({
    name: s.tag,
    totalTrades: s.totalTrades,
    winRate: s.winRate,
    avgRR: s.avgRR,
    totalRR: s.totalRR,
  }))

  return (
    <div className="space-y-8">
      {/* Grand total summary */}
      <div className={cn(unifiedInsetPanelClassName, 'rounded-xl px-4 py-3 flex items-center gap-6 flex-wrap')}>
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Total Trades</span>
          <p className="text-xl font-bold tabular-nums">{data.grandTotal}</p>
        </div>
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Overall Winrate</span>
          <p className={cn("text-xl font-bold tabular-nums", data.grandWinRate >= 50 ? 'metric-positive' : 'metric-negative')}>
            {data.grandWinRate.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className={cn(unifiedInsetPanelClassName, 'rounded-xl p-4 space-y-6')}>
        <StatsTable title="Ticker Stats" rows={tickerRows} emptyMessage="No trades found" />
      </div>

      <div className={cn(unifiedInsetPanelClassName, 'rounded-xl p-4 space-y-6')}>
        <StatsTable title="Daily Stats" rows={dailyRows} emptyMessage="No trades found" />
      </div>

      <div className={cn(unifiedInsetPanelClassName, 'rounded-xl p-4 space-y-6')}>
        <StatsTable
          title="Setup Stats (by Journal Tag)"
          rows={setupRows}
          emptyMessage="Tag your trades in the journal to see setup stats"
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/dashboard/analytics/statistics/components/statistics-client.tsx
git commit -m "feat(statistics): add statistics client component with grand total and three tables"
```

---

### Task 6: Create Statistics Page & Loading State

**Files:**
- Create: `app/[locale]/dashboard/analytics/statistics/page.tsx`
- Create: `app/[locale]/dashboard/analytics/statistics/loading.tsx`

- [ ] **Step 1: Write page server component**

Create `app/[locale]/dashboard/analytics/statistics/page.tsx`:
```typescript
import type { Metadata } from 'next'
import { getCanonicalUrl } from '@/lib/seo'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const StatisticsClient = dynamic(
  () => import('./components/statistics-client'),
  {
    loading: () => (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-xl bg-background/30 p-4">
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-48 w-full" />
          </div>
        ))}
      </div>
    ),
  }
)

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'Statistics | Qunt Edge',
    description: 'Performance breakdown by ticker, day, and setup tag.',
    robots: { index: false, follow: false },
    alternates: { canonical: getCanonicalUrl(locale, '/dashboard/analytics/statistics') },
  }
}

export default function StatisticsPage() {
  return <StatisticsClient />
}
```

- [ ] **Step 2: Write loading state**

Create `app/[locale]/dashboard/analytics/statistics/loading.tsx`:
```typescript
import { Skeleton } from '@/components/ui/skeleton'

export default function StatisticsLoading() {
  return (
    <div className="space-y-6 p-4">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/dashboard/analytics/statistics/page.tsx app/[locale]/dashboard/analytics/statistics/loading.tsx
git commit -m "feat(statistics): add statistics page and loading skeleton"
```

---

## Phase 2: Documentation Page

### Task 7: Create Docs Sidebar Layout

**Files:**
- Create: `app/[locale]/(landing)/docs/layout.tsx`
- Create: `app/[locale]/(landing)/docs/components/docs-sidebar.tsx`
- Create: `app/[locale]/(landing)/docs/loading.tsx`
- Modify: `app/[locale]/(landing)/components/navbar.tsx` (add Docs link)
- Modify: `app/sitemap.ts` (update docs priority)

- [ ] **Step 1: Create the docs directory and components dir**

```bash
mkdir -p app/[locale]/(landing)/docs/components
```

- [ ] **Step 2: Write the docs sidebar navigation component**

Create `app/[locale]/(landing)/docs/components/docs-sidebar.tsx`:
```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  BookOpen, LayoutDashboard, FileText, BarChart3, Sparkles, Activity, FileUp, Settings,
} from 'lucide-react'

const SECTIONS = [
  {
    group: 'Getting Started',
    items: [
      { title: 'Overview', href: '/docs', icon: BookOpen, exact: true },
      { title: 'Quick Start', href: '/docs/getting-started', icon: BookOpen },
    ],
  },
  {
    group: 'Core Features',
    items: [
      { title: 'Dashboard', href: '/docs/dashboard', icon: LayoutDashboard },
      { title: 'Trade Log', href: '/docs/trade-log', icon: FileText },
      { title: 'Trade Journal', href: '/docs/journal', icon: FileText },
      { title: 'Statistics', href: '/docs/statistics', icon: BarChart3 },
      { title: 'Analytics & Copilot', href: '/docs/analytics', icon: Sparkles },
      { title: 'Accounts', href: '/docs/accounts', icon: Activity },
      { title: 'Data Import', href: '/docs/import', icon: FileUp },
      { title: 'Settings & Profile', href: '/docs/settings', icon: Settings },
    ],
  },
]

export function DocsSidebar({ locale }: { locale: string }) {
  const pathname = usePathname()
  const normalized = pathname.replace(/\/+$/, '') || '/'

  const isActive = (href: string, exact?: boolean) => {
    const full = `/${locale}${href}`
    return exact ? normalized === full : normalized.startsWith(full)
  }

  return (
    <nav className="sticky top-24 space-y-6">
      {SECTIONS.map(section => (
        <div key={section.group}>
          <h3 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {section.group}
          </h3>
          <ul className="space-y-0.5">
            {section.items.map(item => (
              <li key={item.href}>
                <Link
                  href={`/${locale}${item.href}`}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                    isActive(item.href, item.exact)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/20',
                  )}
                >
                  <item.icon className="h-3.5 w-3.5 shrink-0" />
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
```

- [ ] **Step 3: Write the docs layout**

Create `app/[locale]/(landing)/docs/layout.tsx`:
```typescript
import { setStaticParamsLocale } from 'next-international/server'
import { UnifiedPageShell, UnifiedSurface } from '@/components/layout/unified-page-shell'
import { DocsSidebar } from './components/docs-sidebar'

export default async function DocsLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setStaticParamsLocale(locale)

  return (
    <UnifiedPageShell widthClassName="max-w-[1280px]" className="py-8">
      <div className="flex gap-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <DocsSidebar locale={locale} />
        </aside>
        <main className="min-w-0 flex-1">
          <UnifiedSurface className="space-y-6 p-6">
            {children}
          </UnifiedSurface>
        </main>
      </div>
    </UnifiedPageShell>
  )
}
```

- [ ] **Step 4: Write loading state**

Create `app/[locale]/(landing)/docs/loading.tsx`:
```typescript
import { Skeleton } from '@/components/ui/skeleton'

export default function DocsLoading() {
  return (
    <div className="flex gap-8">
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="space-y-4">
          <Skeleton className="h-4 w-20" />
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-8 w-full rounded-lg" />)}
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <div className="rounded-xl bg-background/30 p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 5: Add Docs link to homepage navbar**

Edit `app/[locale]/(landing)/components/navbar.tsx`, add to the `links` array (before Blog or Support):
```typescript
      { title: 'Docs', href: '/docs' },
```

- [ ] **Step 6: Update sitemap priority for docs**

Edit `app/sitemap.ts`, change the docs line priority from `0.65` to `0.8`:
```typescript
    { path: '/docs', changeFrequency: 'weekly', priority: 0.8 },
```

- [ ] **Step 7: Commit**

```bash
git add \
  app/[locale]/(landing)/docs/layout.tsx \
  app/[locale]/(landing)/docs/loading.tsx \
  app/[locale]/(landing)/docs/components/docs-sidebar.tsx \
  app/[locale]/(landing)/components/navbar.tsx \
  app/sitemap.ts
git commit -m "feat(docs): add docs sidebar layout, navbar link, and sitemap update"
```

---

### Task 8: Write Docs Overview Page

**Files:**
- Modify: `app/[locale]/(landing)/docs/page.tsx` (replace placeholder content)

- [ ] **Step 1: Replace docs overview page**

Replace the entire content of `app/[locale]/(landing)/docs/page.tsx`:
```typescript
import { Metadata } from 'next'
import { setStaticParamsLocale } from 'next-international/server'
import { buildPublicMetadata } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildPublicMetadata({
    locale,
    path: '/docs',
    title: 'Documentation | Qunt Edge',
    description:
      'Complete guide to the Qunt Edge trading journal, analytics, and workflow platform.',
  })
}

export default async function DocsOverviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setStaticParamsLocale(locale)

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Welcome to Qunt Edge</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Qunt Edge is a comprehensive trading journal and analytics platform. This documentation
        covers every feature—from importing your first trade to leveraging AI-powered behavioral
        analysis.
      </p>

      <h2 className="text-lg font-semibold tracking-tight text-foreground pt-2">What You Can Do</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-muted-foreground">
        <li><strong className="text-foreground">Import trades</strong> from Tradovate, Rithmic, NinjaTrader, IBKR, and 10+ other platforms</li>
        <li><strong className="text-foreground">Review and annotate</strong> every trade with pre-trade notes, post-trade reviews, emotions, and tags</li>
        <li><strong className="text-foreground">Analyze performance</strong> with widgets, charts, and the Copilot AI engine</li>
        <li><strong className="text-foreground">Track prop firm compliance</strong> against drawdown, profit targets, and consistency rules</li>
        <li><strong className="text-foreground">Share your profile</strong> and compare with the community leaderboard</li>
      </ul>

      <h2 className="text-lg font-semibold tracking-tight text-foreground pt-2">Getting Started</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Head over to the <a href={`/${locale}/docs/getting-started`} className="text-primary underline underline-offset-2 hover:no-underline">Quick Start guide</a> to set up your account, connect a broker, and see your first trade data in under 5 minutes.
      </p>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/(landing)/docs/page.tsx
git commit -m "feat(docs): write overview documentation page"
```

---

### Task 9: Write Getting Started Docs Page

**Files:**
- Create: `app/[locale]/(landing)/docs/getting-started/page.tsx`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p app/[locale]/(landing)/docs/getting-started
```

- [ ] **Step 2: Write the getting started page**

Create `app/[locale]/(landing)/docs/getting-started/page.tsx`:
```typescript
import { Metadata } from 'next'
import { setStaticParamsLocale } from 'next-international/server'
import { buildPublicMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return buildPublicMetadata({ locale, path: '/docs/getting-started', title: 'Quick Start Guide | Qunt Edge Docs', description: 'Set up your Qunt Edge account and import your first trades in minutes.' })
}

export default async function GettingStartedPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setStaticParamsLocale(locale)

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Quick Start Guide</h1>

      <h2 className="text-lg font-semibold tracking-tight text-foreground">1. Create Your Account</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Visit the <a href={`/${locale}/authentication`} className="text-primary underline underline-offset-2">sign-in page</a> and enter your email. If you don&apos;t have an account yet, one will be created automatically.
      </p>

      <h2 className="text-lg font-semibold tracking-tight text-foreground">2. Import Trades</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Navigate to the Import page from the dashboard sidebar. You can:
      </p>
      <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-muted-foreground">
        <li><strong className="text-foreground">Auto-sync</strong> with Tradovate, Rithmic, or DXfeed by entering your credentials</li>
        <li><strong className="text-foreground">Upload files</strong> from NinjaTrader, MT5, IBKR (PDF), or CSV/Excel exports</li>
        <li><strong className="text-foreground">Enter manually</strong> with the manual trade entry form</li>
      </ul>

      <h2 className="text-lg font-semibold tracking-tight text-foreground">3. Review Your Dashboard</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Once trades are imported, the Dashboard overview shows your P&amp;L, winrate, equity curve, and other key metrics. Customize the layout by adding, removing, and rearranging widgets.
      </p>

      <h2 className="text-lg font-semibold tracking-tight text-foreground">4. Journal Your Trades</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Open the Trade Journal page to add pre-trade notes, post-trade reviews, emotions, confidence ratings, and custom tags for every trade. This data powers the AI Copilot and behavioral analysis.
      </p>

      <h2 className="text-lg font-semibold tracking-tight text-foreground">5. Explore Analytics</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        The Copilot page provides AI-generated insights about your trading patterns, risk management, and areas for improvement. The Statistics page breaks down performance by ticker, day, and setup tag.
      </p>
    </>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/(landing)/docs/getting-started/page.tsx
git commit -m "feat(docs): write getting started documentation"
```

---

### Task 10: Write Core Feature Doc Pages

**Files:**
- Create: `app/[locale]/(landing)/docs/dashboard/page.tsx`
- Create: `app/[locale]/(landing)/docs/trade-log/page.tsx`
- Create: `app/[locale]/(landing)/docs/journal/page.tsx`
- Create: `app/[locale]/(landing)/docs/statistics/page.tsx`
- Create: `app/[locale]/(landing)/docs/analytics/page.tsx`
- Create: `app/[locale]/(landing)/docs/accounts/page.tsx`
- Create: `app/[locale]/(landing)/docs/import/page.tsx`
- Create: `app/[locale]/(landing)/docs/settings/page.tsx`

- [ ] **Step 1: Create directories**

```bash
mkdir -p app/[locale]/(landing)/docs/{dashboard,trade-log,journal,statistics,analytics,accounts,import,settings}
```

- [ ] **Step 2: Write Dashboard docs**

Create `app/[locale]/(landing)/docs/dashboard/page.tsx`:
```typescript
import { Metadata } from 'next'
import { setStaticParamsLocale } from 'next-international/server'
import { buildPublicMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return buildPublicMetadata({ locale, path: '/docs/dashboard', title: 'Dashboard | Qunt Edge Docs', description: 'Understanding the Qunt Edge dashboard overview, widgets, and layout.' })
}

export default async function DocsDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">The Dashboard is your command center. It displays widget cards showing P&amp;L, winrate, equity curve, risk-reward ratio, profit factor, and more.</p>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Widgets</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-muted-foreground">
        <li><strong className="text-foreground">Statistics Widget:</strong> Net P&amp;L, winrate, total trades, long/short distribution</li>
        <li><strong className="text-foreground">Equity Chart:</strong> Cumulative P&amp;L over time with interactive tooltips</li>
        <li><strong className="text-foreground">Risk Metrics:</strong> Profit factor, expectancy, Sharpe-like ratio</li>
        <li><strong className="text-foreground">Calendar:</strong> Daily P&amp;L heatmap with mood tracking</li>
        <li><strong className="text-foreground">Mindset:</strong> Emotion trend, hourly timeline, news impact</li>
      </ul>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Customization</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">Click the grid icon in the header to enter widget edit mode. Drag to reorder, resize, add, or remove widgets. Your layout auto-saves.</p>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Filters</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">Use the filter bar to scope data by date range, account, instrument, P&amp;L range, tags, or weekday. Filters apply across all widgets and the trade table.</p>
    </>
  )
}
```

- [ ] **Step 3: Write Trade Log docs**

Create `app/[locale]/(landing)/docs/trade-log/page.tsx`:
```typescript
import { Metadata } from 'next'
import { setStaticParamsLocale } from 'next-international/server'
import { buildPublicMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return buildPublicMetadata({ locale, path: '/docs/trade-log', title: 'Trade Log | Qunt Edge Docs', description: 'Review, edit, and manage your trades in the Trade Log.' })
}

export default async function DocsTradeLogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Trade Log</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">The Trade Log (Trades page) displays all your trades in a sortable, filterable table. Each row shows the instrument, side, quantity, entry/exit prices, P&amp;L, commission, duration, and tags.</p>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Editing Trades</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">Click any cell to edit it inline. You can modify the instrument, side, prices, quantity, add tags, comments, images, and video URLs. Changes save automatically.</p>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Bulk Operations</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">Select multiple trades to edit tags, add comments, or delete in bulk. Use Shift+click to select a range.</p>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Tabs</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">Switch between All Trades, Wins, Losses, and Breakeven using the tab bar at the top of the table for quick filtering.</p>
    </>
  )
}
```

- [ ] **Step 4: Write Journal docs**

Create `app/[locale]/(landing)/docs/journal/page.tsx`:
```typescript
import { Metadata } from 'next'
import { setStaticParamsLocale } from 'next-international/server'
import { buildPublicMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return buildPublicMetadata({ locale, path: '/docs/journal', title: 'Trade Journal | Qunt Edge Docs', description: 'Journal your trades with notes, emotions, and tags.' })
}

export default async function DocsJournalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Trade Journal</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">The Trade Journal (Notes page) provides a side-by-side view with your trade on the left and a journal editor on the right.</p>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Journal Fields</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-muted-foreground">
        <li><strong className="text-foreground">Pre-Trade Notes:</strong> Your analysis, plan, and rationale before entering the trade</li>
        <li><strong className="text-foreground">Post-Trade Review:</strong> What happened, what went well, what to improve</li>
        <li><strong className="text-foreground">Emotions:</strong> How you felt during the trade</li>
        <li><strong className="text-foreground">Confidence Rating:</strong> 1-10 scale</li>
        <li><strong className="text-foreground">Discipline Score:</strong> 1-10 rating of plan adherence</li>
        <li><strong className="text-foreground">Custom Tags:</strong> Categorize setups (e.g., breakout, reversal, scalp)</li>
        <li><strong className="text-foreground">Screenshots:</strong> Attach chart images</li>
      </ul>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Tag Tabs</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">Organize tags into tab groups. For example, create a &quot;Setups&quot; tab with breakout/reversal/momentum and a &quot;Mistakes&quot; tab with revenge-trading/fomo/overtrading.</p>
    </>
  )
}
```

- [ ] **Step 5: Write Statistics docs**

Create `app/[locale]/(landing)/docs/statistics/page.tsx`:
```typescript
import { Metadata } from 'next'
import { setStaticParamsLocale } from 'next-international/server'
import { buildPublicMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return buildPublicMetadata({ locale, path: '/docs/statistics', title: 'Statistics | Qunt Edge Docs', description: 'Performance breakdown by ticker, day, and setup tag.' })
}

export default async function DocsStatisticsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Statistics</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">The Statistics page breaks down your performance across three dimensions: ticker, day, and setup tag.</p>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Ticker Stats</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">Shows every instrument with total trades, winrate, average risk-reward ratio, and total risk-reward ratio. Sort by any column to compare.</p>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Daily Stats</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">Groups trades by trading day. Each row shows the day&apos;s total trades, winrate, avg RR, and total RR.</p>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Setup Stats</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">Aggregates by custom tags from the Trade Journal. Only trades with journal entries and custom tags are included. See which setups deliver the best results.</p>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Metrics</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-muted-foreground">
        <li><strong className="text-foreground">Winrate:</strong> Wins / (Wins + Losses) &times; 100</li>
        <li><strong className="text-foreground">Avg RR:</strong> Average winning P&amp;L / Average losing P&amp;L (absolute)</li>
        <li><strong className="text-foreground">Total RR:</strong> Total winning P&amp;L / Total losing P&amp;L (absolute)</li>
      </ul>
    </>
  )
}
```

- [ ] **Step 6: Write Analytics docs**

Create `app/[locale]/(landing)/docs/analytics/page.tsx`:
```typescript
import { Metadata } from 'next'
import { setStaticParamsLocale } from 'next-international/server'
import { buildPublicMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return buildPublicMetadata({ locale, path: '/docs/analytics', title: 'Analytics & Copilot | Qunt Edge Docs', description: 'AI-powered analytics, patterns, and insights.' })
}

export default async function DocsAnalyticsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Analytics &amp; Copilot</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">The Analytics (Copilot) page provides AI-generated insights into your trading behavior, pattern recognition, and personalized recommendations.</p>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Features</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-muted-foreground">
        <li><strong className="text-foreground">AI Debriefs:</strong> Automated post-session analysis of your trades</li>
        <li><strong className="text-foreground">Pattern Detection:</strong> Identifies recurring mistakes and strengths</li>
        <li><strong className="text-foreground">Behavioral Scores:</strong> Discipline, consistency, and emotional regulation metrics</li>
      </ul>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Charts</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">Interactive charts for equity curve, P&amp;L by side, P&amp;L per contract, time-in-position distribution, weekday performance, tick distribution, and more.</p>
    </>
  )
}
```

- [ ] **Step 7: Write Accounts docs**

Create `app/[locale]/(landing)/docs/accounts/page.tsx`:
```typescript
import { Metadata } from 'next'
import { setStaticParamsLocale } from 'next-international/server'
import { buildPublicMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return buildPublicMetadata({ locale, path: '/docs/accounts', title: 'Accounts | Qunt Edge Docs', description: 'Track account growth, prop firm compliance, and payouts.' })
}

export default async function DocsAccountsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Accounts</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">Manage your brokerage and prop firm accounts. Track balances, drawdown, profit targets, payout schedules, and compliance.</p>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Account Types</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-muted-foreground">
        <li><strong className="text-foreground">Evaluation Accounts:</strong> Prop firm challenges with profit targets and consistency rules</li>
        <li><strong className="text-foreground">Funded Accounts:</strong> Live capital with drawdown limits and payout schedules</li>
      </ul>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Key Metrics</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">Each account card shows starting balance, current P&amp;L, drawdown remaining, buffer status, profit target progress, days traded, and consistency percentage.</p>
    </>
  )
}
```

- [ ] **Step 8: Write Import docs**

Create `app/[locale]/(landing)/docs/import/page.tsx`:
```typescript
import { Metadata } from 'next'
import { setStaticParamsLocale } from 'next-international/server'
import { buildPublicMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return buildPublicMetadata({ locale, path: '/docs/import', title: 'Data Import | Qunt Edge Docs', description: 'Import trades from Tradovate, Rithmic, NinjaTrader, and more.' })
}

export default async function DocsImportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Data Import</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">Qunt Edge supports trade import from 10+ platforms. Navigate to the Import page in the dashboard sidebar.</p>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Supported Platforms</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-muted-foreground">
        <li><strong className="text-foreground">Auto-Sync:</strong> Tradovate, Rithmic, DXfeed</li>
        <li><strong className="text-foreground">File Upload:</strong> NinjaTrader, MT5, TradeZella, Topstep, FTMO, ETP, Thor, Quantower</li>
        <li><strong className="text-foreground">PDF:</strong> IBKR (Interactive Brokers) activity statements</li>
        <li><strong className="text-foreground">CSV/Excel:</strong> Generic column-mapping import for any format</li>
        <li><strong className="text-foreground">Manual Entry:</strong> Enter trades one-by-one</li>
      </ul>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Tips</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-muted-foreground">
        <li>CSV imports let you map columns manually—the system remembers your mappings</li>
        <li>Duplicate trades are detected automatically</li>
      </ul>
    </>
  )
}
```

- [ ] **Step 9: Write Settings docs**

Create `app/[locale]/(landing)/docs/settings/page.tsx`:
```typescript
import { Metadata } from 'next'
import { setStaticParamsLocale } from 'next-international/server'
import { buildPublicMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return buildPublicMetadata({ locale, path: '/docs/settings', title: 'Settings & Profile | Qunt Edge Docs', description: 'Manage your account settings, profile, and preferences.' })
}

export default async function DocsSettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings &amp; Profile</h1>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Account Settings</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">Update your username, email preferences, timezone, and other account-level configurations.</p>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Trader Profile</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">Your public trader profile showcases performance stats, winrate, equity curve, and recent trades. Share the link with your community.</p>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Billing</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">Manage your subscription plan, view payment history, and upgrade or downgrade.</p>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Teams</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">Create or join trading teams to share insights and compare performance.</p>
    </>
  )
}
```

- [ ] **Step 10: Commit all doc pages**

```bash
git add \
  app/[locale]/(landing)/docs/dashboard/page.tsx \
  app/[locale]/(landing)/docs/trade-log/page.tsx \
  app/[locale]/(landing)/docs/journal/page.tsx \
  app/[locale]/(landing)/docs/statistics/page.tsx \
  app/[locale]/(landing)/docs/analytics/page.tsx \
  app/[locale]/(landing)/docs/accounts/page.tsx \
  app/[locale]/(landing)/docs/import/page.tsx \
  app/[locale]/(landing)/docs/settings/page.tsx
git commit -m "feat(docs): write core feature documentation pages"
```

---

## Verification

After all tasks, run:

```bash
# Build check
bun run build 2>&1 | tail -30
```

Expected: No type errors, no missing module errors.

```bash
# Dev server check
bun run dev &
sleep 5
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/en/dashboard/analytics/statistics
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/en/docs
```

Expected: Both return `200`.

```bash
# Lint check
bun run lint 2>&1 | tail -10
```

Expected: No lint errors.
