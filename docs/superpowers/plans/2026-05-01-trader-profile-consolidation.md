# Trader Profile Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge ACCOUNTS AND CAPITAL, PERFORMANCE SNAPSHOT, and EXECUTION QUALITY sections into a single unified dashboard view with user name prominently displayed

**Architecture:** Analyze existing trader profile sections, consolidate into a single responsive dashboard with separate tabbed subsections for each section, preserve all bar chart metrics without duplication, maintain all functionality and data display, and add user name prominently below the merged section header.

**Tech Stack:** Next.js 16 (App Router), React 19, Recharts, Tailwind CSS 4, TypeScript

---

## Phase 1: Analyze Current Trader Profile Structure

### Task 1: Examine Current Trader Profile Sections

**Files:**
- Read: `app/[locale]/dashboard/trader-profile/page.tsx`
- Find: All related client components

- [ ] **Step 1: Read current trader profile page**

Run: `cat app/[locale]/dashboard/trader-profile/page.tsx`
Expected: File wraps TraderProfilePageClient component

- [ ] **Step 2: Find client components**

Run: `find app/[locale]/dashboard/trader-profile -name "*.tsx" -type f`
Expected: List of all trader profile components

- [ ] **Step 3: Read each section component**

Run: For each component file:
```
cat app/[locale]/dashboard/trader-profile/components/*accounts*.tsx
cat app/[locale]/dashboard/trader-profile/components/*performance*.tsx
cat app/[locale]/dashboard/trader-profile/components/*execution*.tsx
```
Expected: Account management, performance snapshot, and execution quality sections

### Task 2: Identify Metrics and Data

**Files:**
- Analyze: All section components

- [ ] **Step 1: List all metrics displayed**

Create a markdown document `trader-profile-metrics-analysis.md`:

```markdown
# Trader Profile Metrics Analysis

## Account & Capital Section
- Account count
- Total capital
- Per-account balances
- Drawdown info
- Payout information

## Performance Snapshot Section
- Win rate
- Total PnL
- Profit factor
- Average win/loss
- Best/worst trades
- Other performance metrics

## Execution Quality Section
- Time in position metrics
- Trade side analysis
- PnL by side
- Additional execution metrics
```

- [ ] **Step 2: Identify bar chart components**

Run: `grep -r "BarChart\|ResponsiveContainer" --include="*.tsx" app/[locale]/dashboard/trader-profile/`
Expected: Bar chart components in each section

- [ ] **Step 3: List all bar chart types**

```markdown
## Bar Chart Types Found
- [List each chart type with filename and description]
```

---

## Phase 2: Design Consolidated Structure

### Task 3: Create Consolidated Dashboard Layout

**Files:**
- Modify: `app/[locale]/dashboard/trader-profile/page-client.tsx`

- [ ] **Step 1: Create tab-based layout structure**

```tsx
"use client"

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AccountCapitalSection } from './components/account-capital-section'
import { PerformanceSnapshotSection } from './components/performance-snapshot-section'
import { ExecutionQualitySection } from './components/execution-quality-section'
import { UserProfileHeader } from './components/user-profile-header'

export default function TraderProfileClient() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen bg-background">
      <UserProfileHeader />

      <div className="mx-auto max-w-7xl p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="execution">Execution</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AccountCapitalSection />
            <PerformanceSnapshotSection />
            <ExecutionQualitySection />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <PerformanceSnapshotSection />
          </TabsContent>

          <TabsContent value="execution" className="space-y-6">
            <ExecutionQualitySection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
```

### Task 4: Create User Profile Header Component

**Files:**
- Create: `app/[locale]/dashboard/trader-profile/components/user-profile-header.tsx`

- [ ] **Step 1: Create user profile header**

```tsx
"use client"

import { User } from '@/server/types/user'

interface UserProfileHeaderProps {
  user: User
}

export function UserProfileHeader({ user }: UserProfileHeaderProps) {
  return (
    <div className="mb-8 rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
            {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              {user.username || user.email}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {user.email}
            </p>
            <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <span>Dashboard Theme:</span>
                <span className="capitalize">{user.dashboardTheme}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Language:</span>
                <span className="capitalize">{user.language}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Member Since:</span>
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### Task 5: Create Account & Capital Section Component

**Files:**
- Create: `app/[locale]/dashboard/trader-profile/components/account-capital-section.tsx`

- [ ] **Step 1: Extract and consolidate account data**

```tsx
"use client"

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { cn } from '@/lib/utils'

interface Account {
  id: string
  number: string
  propfirm: string
  balance: number
  drawdownThreshold: number
  funded: boolean
}

interface AccountCapitalSectionProps {
  accounts: Account[]
}

export function AccountCapitalSection({ accounts }: AccountCapitalSectionProps) {
  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, acc) => sum + acc.balance, 0)
  }, [accounts])

  const totalDrawdown = useMemo(() => {
    return accounts.reduce((sum, acc) => sum + acc.drawdownThreshold, 0)
  }, [accounts])

  const fundedAccounts = accounts.filter(acc => acc.funded).length

  const accountData = accounts.map(acc => ({
    name: acc.number,
    balance: acc.balance,
    drawdown: acc.drawdownThreshold,
    funded: acc.funded
  }))

  const COLORS = ['#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#64748b']

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accounts & Capital</CardTitle>
        <CardDescription>Total portfolio value and account breakdown</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="text-sm font-medium text-muted-foreground">Total Balance</div>
            <div className="mt-2 text-2xl font-bold">
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="text-sm font-medium text-muted-foreground">Funded Accounts</div>
            <div className="mt-2 text-2xl font-bold">{fundedAccounts} / {accounts.length}</div>
          </div>
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="text-sm font-medium text-muted-foreground">Total Drawdown</div>
            <div className="mt-2 text-2xl font-bold">
              ${totalDrawdown.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Account List */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Account Breakdown</h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account, index) => (
              <Card key={account.id} className={cn(
                "p-4",
                account.funded && "border-green-500/30 bg-green-50/50"
              )}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{account.number}</div>
                    <div className="text-sm text-muted-foreground">
                      {account.propfirm}
                    </div>
                  </div>
                  <div className={cn(
                    "rounded-full px-2 py-1 text-xs font-medium",
                    account.funded
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  )}>
                    {account.funded ? "Funded" : "Challenge"}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-sm text-muted-foreground">Balance</div>
                  <div className="text-xl font-bold">
                    ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="mt-2">
                    <div className="text-xs text-muted-foreground">Drawdown Threshold</div>
                    <div className="font-medium">
                      ${account.drawdownThreshold.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Balance Chart */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Account Balances</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={accountData}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip
                formatter={(value: number) => [
                  `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                  'Balance'
                ]}
              />
              <Bar dataKey="balance" radius={[8, 8, 0, 0]}>
                {accountData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
```

### Task 6: Create Performance Snapshot Section Component

**Files:**
- Create: `app/[locale]/dashboard/trader-profile/components/performance-snapshot-section.tsx`

- [ ] **Step 1: Extract performance data**

```tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, LineChart, Line } from 'recharts'
import { cn } from '@/lib/utils'

interface PerformanceSnapshot {
  totalTrades: number
  totalPnL: number
  winRate: number
  profitFactor: number
  avgWin: number
  avgLoss: number
  bestTrade: number
  worstTrade: number
  longestWinningStreak: number
  longestLosingStreak: number
  totalProfit: number
  totalLoss: number
}

interface PerformanceSnapshotSectionProps {
  performance: PerformanceSnapshot
}

const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#8b5cf6', '#f59e0b']

export function PerformanceSnapshotSection({ performance }: PerformanceSnapshotSectionProps) {
  const chartData = [
    { name: 'Total PnL', value: performance.totalPnL },
    { name: 'Total Profit', value: performance.totalProfit },
    { name: 'Total Loss', value: performance.totalLoss },
    { name: 'Best Trade', value: performance.bestTrade },
    { name: 'Worst Trade', value: performance.worstTrade },
  ]

  const winRateData = [
    { name: 'Wins', value: performance.totalTrades * (performance.winRate / 100) },
    { name: 'Losses', value: performance.totalTrades * (1 - performance.winRate / 100) },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Snapshot</CardTitle>
        <CardDescription>Key performance metrics and statistics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total PnL"
            value={performance.totalPnL}
            prefix="$"
            className={cn(
              "border-green-500/30 bg-green-50/50",
              performance.totalPnL >= 0 && "text-green-700"
            )}
          />
          <StatCard
            title="Win Rate"
            value={`${performance.winRate.toFixed(1)}%`}
            suffix="%"
          />
          <StatCard
            title="Profit Factor"
            value={performance.profitFactor.toFixed(2)}
          />
          <StatCard
            title="Total Trades"
            value={performance.totalTrades}
          />
        </div>

        {/* PnL Breakdown Chart */}
        <div>
          <h3 className="text-lg font-semibold mb-4">PnL Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip
                formatter={(value: number) => [
                  `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                  null
                ]}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Trade Distribution Chart */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Trade Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={winRateData}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${Math.round(value)}`}
              />
              <Tooltip
                formatter={(value: number) => [
                  `${Math.round(value)}`,
                  null
                ]}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#3b82f6">
                {winRateData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Additional Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium text-muted-foreground">Avg Win</div>
            <div className="mt-2 text-xl font-bold">
              ${performance.avgWin.toFixed(2)}
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium text-muted-foreground">Avg Loss</div>
            <div className="mt-2 text-xl font-bold">
              ${performance.avgLoss.toFixed(2)}
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium text-muted-foreground">Best Trade</div>
            <div className="mt-2 text-xl font-bold text-green-600">
              ${performance.bestTrade.toFixed(2)}
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium text-muted-foreground">Worst Trade</div>
            <div className="mt-2 text-xl font-bold text-red-600">
              ${performance.worstTrade.toFixed(2)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  prefix?: string
  suffix?: string
  className?: string
}

function StatCard({ title, value, prefix = '', suffix = '', className }: StatCardProps) {
  return (
    <Card className={cn("p-4", className)}>
      <div className="text-sm font-medium text-muted-foreground">{title}</div>
      <div className="mt-2 text-2xl font-bold">
        {prefix}
        {typeof value === 'number' ? value.toLocaleString('en-US', { minimumFractionDigits: 2 }) : value}
        {suffix}
      </div>
    </Card>
  )
}
```

### Task 7: Create Execution Quality Section Component

**Files:**
- Create: `app/[locale]/dashboard/trader-profile/components/execution-quality-section.tsx`

- [ ] **Step 1: Extract execution quality data**

```tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { cn } from '@/lib/utils'

interface TimeInPositionData {
  hour: string
  avgTimeInMinutes: number
  avgPnL: number
  tradeCount: number
}

interface ExecutionQualitySectionProps {
  timeInPositionData: TimeInPositionData[]
  pnlBySideData: { side: string; pnl: number; tradeCount: number }[]
}

const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#8b5cf6']

export function ExecutionQualitySection({ timeInPositionData, pnlBySideData }: ExecutionQualitySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Quality</CardTitle>
        <CardDescription>Time-in-position analysis and side-by-side performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Time in Position Chart */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Time in Position by Hour</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeInPositionData}>
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                yAxisId="left"
                tickFormatter={(value) => `${value}m`}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                labelFormatter={(value) => `${value} (Avg Time: ${timeInPositionData.find(d => d.hour === value)?.avgTimeInMinutes.toFixed(0)}min)`}
              />
              <Bar yAxisId="left" dataKey="avgTimeInMinutes" name="Avg Time (min)" radius={[8, 8, 0, 0]} fill="#64748b" />
              <Bar yAxisId="right" dataKey="avgPnL" name="Avg PnL" radius={[8, 8, 0, 0]} fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* PnL by Side Chart */}
        <div>
          <h3 className="text-lg font-semibold mb-4">PnL by Side</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pnlBySideData}>
              <XAxis
                dataKey="side"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                formatter={(value: number) => [
                  `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                  null
                ]}
              />
              <Bar dataKey="pnl" radius={[8, 8, 0, 0]}>
                {pnlBySideData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Side-by-Side Performance */}
        <div className="grid gap-4 md:grid-cols-2">
          {pnlBySideData.map((entry, index) => (
            <div key={entry.side} className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{entry.side.toUpperCase()}</div>
                <div className={cn(
                  "text-xl font-bold",
                  entry.pnl >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  ${entry.pnl.toFixed(2)}
                </div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {entry.tradeCount} trades
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## Phase 3: Update Page to Use Consolidated Components

### Task 8: Update Trader Profile Page Client

**Files:**
- Modify: `app/[locale]/dashboard/trader-profile/page-client.tsx`

- [ ] **Step 1: Update page client component**

```tsx
"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/auth-context'
import { getUserProfile } from '@/server/user-data'
import { AccountCapitalSection } from './components/account-capital-section'
import { PerformanceSnapshotSection } from './components/performance-snapshot-section'
import { ExecutionQualitySection } from './components/execution-quality-section'
import { UserProfileHeader } from './components/user-profile-header'
import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function TraderProfileClient() {
  const { user } = useAuth()
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile(user?.id)
        setProfileData(data)
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [user?.id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!profileData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Unable to load profile data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <UserProfileHeader user={user} />

      <div className="mx-auto max-w-7xl p-6">
        <AccountCapitalSection accounts={profileData.accounts || []} />
        <PerformanceSnapshotSection performance={profileData.performance || {} as any} />
        <ExecutionQualitySection
          timeInPositionData={profileData.timeInPosition || []}
          pnlBySideData={profileData.pnlBySide || []}
        />
      </div>
    </div>
  )
}
```

---

## Phase 4: Testing and Validation

### Task 9: Test Consolidated Dashboard

**Files:**
- Test: Dashboard rendering

- [ ] **Step 1: Test tab navigation**

Run: `npm run dev`
Navigate to: http://localhost:3000/dashboard/trader-profile
Click each tab
Expected: Correct section shows for each tab

- [ ] **Step 2: Test responsive layout**

Resize browser window to:
- Mobile: 375px
- Tablet: 768px
- Desktop: 1920px
Expected: All sections render correctly on all sizes

- [ ] **Step 3: Test data display**

Navigate to dashboard
Expected: All metrics display correctly
Expected: Bar charts render without errors

### Task 10: Verify User Name Display

**Files:**
- Test: User name display

- [ ] **Step 1: Test username display**

Navigate to trader profile
Expected: Username prominently displayed below header
Expected: Email shown as fallback below username
Expected: User avatar shows first letter of username

- [ ] **Step 2: Test with different user states**

Check profile with:
- Username set
- Username not set (email only)
Expected: Both cases display correctly

### Task 11: Verify Data Preservation

**Files:**
- Test: All data preserved

- [ ] **Step 1: Compare old vs new metrics**

Manually verify each section:
- [ ] All account metrics present
- [ ] All performance metrics present
- [ ] All execution quality metrics present
- [ ] All bar charts preserved
- [ ] No duplicate data
- [ ] No data loss

### Task 12: Test Navigation Consistency

**Files:**
- Test: Navigation links

- [ ] **Step 1: Test internal navigation**

Click all tabs
Expected: Tab highlighting correct
Expected: Content switches correctly

---

## Verification Checklist

- [ ] Consolidated dashboard has single header with user name prominently displayed
- [ ] User name shows username (or email as fallback)
- [ ] User email displayed below username
- [ ] Three tabs: Overview, Performance, Execution
- [ ] Overview tab shows all three sections
- [ ] Performance tab shows only performance section
- [ ] Execution tab shows only execution section
- [ ] All account metrics preserved without duplication
- [ ] All performance metrics preserved without duplication
- [ ] All execution quality metrics preserved without duplication
- [ ] All bar charts render correctly
- [ ] Responsive layout works on all screen sizes
- [ ] Tab navigation works correctly
- [ ] No data loss during consolidation
- [ ] No duplicate data in consolidated view
- [ ] Loading states work correctly
- [ ] Error states work correctly

---

## Success Criteria

1. Single unified dashboard view with user name prominently displayed
2. Three tabs: Overview, Performance, Execution
3. All account, performance, and execution quality metrics preserved
4. No duplicate data in consolidated view
5. All bar charts render without errors
6. Responsive layout works on mobile, tablet, and desktop
7. Navigation between tabs works correctly
8. User name displays correctly (with email fallback)

---

`★ Insight ─────────────────────────────────────`
**Tab-Based Architecture**: Using tabs for section consolidation allows users to focus on specific areas while still having all information accessible. The "Overview" tab shows everything by default, while specific tabs provide focused views.

**Responsive Dashboard Design**: A unified dashboard works best on larger screens (tablet/desktop) where there's room for all sections. On mobile, tabs become even more important for space efficiency.

**Data Preservation Strategy**: When consolidating, analyze each section's data models separately, then create a shared data structure that aggregates all relevant fields without duplication.
`─────────────────────────────────────────────────`
