'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import { CardV2, SkeletonV2 } from '@/components/ui/v2'
import { AvatarV2, AvatarV2Fallback } from '@/components/ui/v2'
import type { LeaderboardEntry } from '../data/leaderboard-query'

type SortKey = 'monthly_pnl' | 'alltime_pnl' | 'winrate' | 'totalTrades'

function LeaderboardRow({ entry }: { entry: LeaderboardEntry & { rank: number } }) {
  return (
    <CardV2 className={cn(
      "flex items-center gap-4 p-4",
      entry.rank === 1 && "border-v2-accent/50 bg-v2-accent-subtle"
    )}>
      <div className="w-8 text-center">
        <span className={cn(
          "text-sm font-bold",
          entry.rank === 1 ? "text-v2-accent" :
          entry.rank === 2 ? "text-v2-text-secondary" :
          entry.rank === 3 ? "text-v2-warning" :
          "text-v2-text-tertiary"
        )}>
          #{entry.rank}
        </span>
      </div>

      <AvatarV2 size="md" className="shrink-0">
        <AvatarV2Fallback className="bg-v2-accent-subtle text-v2-accent">
          {entry.username.charAt(0).toUpperCase()}
        </AvatarV2Fallback>
      </AvatarV2>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-v2-text-primary truncate">{entry.username}</div>
        <div className="text-xs text-v2-text-secondary">{entry.totalTrades} trades</div>
      </div>

      <div className="flex gap-6 text-right shrink-0">
        <div>
          <div className="text-xs text-v2-text-tertiary">Win Rate</div>
          <div className={cn(
            "text-sm font-semibold",
            entry.winRate >= 50 ? "text-v2-success" : "text-v2-text-secondary"
          )}>
            {entry.winRate}%
          </div>
        </div>
        <div>
          <div className="text-xs text-v2-text-tertiary">Monthly PnL</div>
          <div className={cn(
            "text-sm font-semibold",
            entry.monthlyPnl >= 0 ? "text-v2-success" : "text-v2-error"
          )}>
            {entry.monthlyPnl >= 0 ? '+' : ''}${entry.monthlyPnl.toLocaleString()}
          </div>
        </div>
      </div>
    </CardV2>
  )
}

const MemoizedLeaderboardRow = React.memo(LeaderboardRow)

export function LeaderboardTableSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <CardV2 key={i} className="flex items-center gap-4 p-4">
          <SkeletonV2 className="w-8 h-4" />
          <SkeletonV2 className="w-8 h-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonV2 className="h-4 w-24" />
            <SkeletonV2 className="h-3 w-16" />
          </div>
          <div className="flex gap-6">
            <SkeletonV2 className="h-8 w-16" />
            <SkeletonV2 className="h-8 w-20" />
          </div>
        </CardV2>
      ))}
    </div>
  )
}

export const LeaderboardTable = React.memo(function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  const [sortBy, setSortBy] = React.useState<SortKey>('monthly_pnl')

  const sorted = React.useMemo(() => {
    const result = [...entries].sort((a, b) => {
      switch (sortBy) {
        case 'winrate': return b.winRate - a.winRate
        case 'totalTrades': return b.totalTrades - a.totalTrades
        default: return b.monthlyPnl - a.monthlyPnl
      }
    })
    return result.map((entry, idx) => ({ ...entry, rank: idx + 1 }))
  }, [entries, sortBy])

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { key: 'monthly_pnl' as SortKey, label: 'Monthly PnL' },
          { key: 'alltime_pnl' as SortKey, label: 'All-Time PnL' },
          { key: 'winrate' as SortKey, label: 'Win Rate' },
          { key: 'totalTrades' as SortKey, label: 'Total Trades' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSortBy(key)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-v2-md transition-colors",
              sortBy === key
                ? "bg-v2-accent text-white"
                : "bg-v2-bg-elevated text-v2-text-secondary hover:bg-v2-bg-hover"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {sorted.map((entry) => (
          <MemoizedLeaderboardRow key={entry.userId} entry={entry} />
        ))}

        {sorted.length === 0 && (
          <CardV2 className="p-8 text-center">
            <p className="text-v2-text-secondary">No trading data found.</p>
          </CardV2>
        )}
      </div>
    </div>
  )
})
