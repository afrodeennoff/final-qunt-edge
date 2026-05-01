# Implementer: Consolidate Trader Profile Sections

**Current directory**: /Users/uomarafrodeen/Downloads/qunt-edge/.worktrees/improvements-2026-05-01

**Plan**: docs/superpowers/plans/2026-05-01-comprehensive-improvement.md (Phase 3, Task 9)

**Task**: Consolidate the three separate performance sections in trader profile into a unified dashboard component.

## Files to modify:
- Create: `app/[locale]/dashboard/trader-profile/components/UnifiedPerformanceDashboard.tsx`
- Modify: `app/[locale]/dashboard/trader-profile/page-client.tsx`

## Task Sequence:

### Task 9: Merge Performance Sections
**Goal**: Create unified performance dashboard combining Accounts & Capital, Performance Snapshot, and Execution Quality

**Steps**:
1. Create UnifiedPerformanceDashboard component with all three sections
2. Update trader profile page to use the unified component
3. Remove the old separate sections
4. Test the consolidated layout

**Expected code**:
```tsx
// app/[locale]/dashboard/trader-profile/components/UnifiedPerformanceDashboard.tsx
'use client'

import { StatTile, StripMetric } from '../page-client' // Import from parent

interface UnifiedPerformanceDashboardProps {
  metrics: TraderMetrics
  benchmark?: BenchmarkMetrics
  totalCapitalAllAccounts: number
  totalWithdrawAllAccounts: number
}

export function UnifiedPerformanceDashboard({
  metrics,
  benchmark,
  totalCapitalAllAccounts,
  totalWithdrawAllAccounts
}: UnifiedPerformanceDashboardProps) {
  return (
    <UnifiedSurface variant="elevated" className="animate-fade-up-smooth p-5 sm:p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
            Performance overview
          </p>
          <h3 className="mt-1 text-lg font-semibold">Trading Performance</h3>
        </div>
        
        {/* Primary Metrics (combines all three sections) */}
        <div className="grid gap-4">
          {/* Performance & Accounts Row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              label="Total trades"
              value={String(metrics.totalTrades)}
            />
            <StatTile
              label="Net P&L"
              value={formatSigned(metrics.netPnl)}
              tone={metrics.netPnl > 0 ? 'positive' : 'negative'}
            />
            <StatTile
              label="Win rate"
              value={`${formatValue(metrics.winRate)}%`}
              tone={metrics.winRate >= 50 ? 'positive' : 'default'}
            />
            <StatTile
              label="Avg return"
              value={formatSigned(metrics.avgReturn)}
              tone={metrics.avgReturn > 0 ? 'positive' : 'negative'}
            />
          </div>

          {/* Capital & Accounts Row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatTile
              label="Total capital"
              value={formatCapitalCompact(totalCapitalAllAccounts)}
              tone={totalCapitalAllAccounts >= 0 ? 'positive' : 'negative'}
            />
            <StatTile
              label="Total withdraw"
              value={formatCapitalCompact(totalWithdrawAllAccounts)}
            />
            <StatTile
              label="Avg net / trade"
              value={formatSigned(metrics.avgReturn)}
              tone={metrics.avgReturn > 0 ? 'positive' : 'negative'}
            />
          </div>

          {/* Execution Quality & Risk Row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              label="Risk reward"
              value={formatValue(metrics.riskReward)}
            />
            <StatTile
              label="Max drawdown"
              value={formatValue(metrics.drawdown)}
              tone={metrics.drawdown > 0 ? 'negative' : 'default'}
            />
            <StatTile
              label="Win rate"
              value={`${formatValue(metrics.winRate)}%`}
              tone={metrics.winRate >= 50 ? 'positive' : 'default'}
            />
            <StatTile
              label="Consistency rate"
              value={`${formatValue(metrics.consistencyRate)}%`}
              tone={metrics.consistencyRate >= 75 ? 'positive' : 'default'}
            />
          </div>
        </div>

        {/* Benchmark Comparison */}
        {benchmark && (
          <div className="rounded-lg border border-border/30 bg-muted/30 p-4">
            <p className="text-sm font-medium mb-2">Benchmark Comparison</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Your Win Rate</span>
                <span className="font-medium">{metrics.winRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Benchmark Win Rate</span>
                <span className="font-medium">{benchmark.winRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Your Drawdown</span>
                <span className="font-medium">{formatValue(metrics.drawdown)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Benchmark Drawdown</span>
                <span className="font-medium">{formatValue(benchmark.drawdown)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </UnifiedSurface>
  )
}
```

## Testing Instructions:
1. Replace the three existing sections in page-client.tsx with the unified component
2. Verify all metrics display correctly
3. Check responsive layout works on mobile and desktop
4. Test benchmark comparison section shows/hides appropriately
5. Ensure consistent styling and spacing

## Commit Requirements:
- Small commits after implementation
- Commit messages should describe the consolidation
- Include the task number in commit message

## Status Reporting:
- Use DONE when consolidation completes successfully
- Use DONE_WITH_CONCERNS if layout has issues but functionality works
- Use NEEDS_CONTEXT if you need more information about existing sections
- Use BLOCKED if you cannot complete the consolidation

Start implementing now.