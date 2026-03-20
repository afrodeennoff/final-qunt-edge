'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import { CardV2, SkeletonV2 } from '@/components/ui/v2'
import { AvatarV2, AvatarV2Fallback } from '@/components/ui/v2'
import { Trophy, Medal, Award } from 'lucide-react'
import type { LeaderboardEntry } from '../data/leaderboard-query'

type SortKey = 'monthly_pnl' | 'alltime_pnl' | 'winrate' | 'totalTrades'

const podiumConfig = {
  1: {
    icon: Trophy,
    label: 'Champion',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-500',
    glow: 'shadow-yellow-500/10',
  },
  2: {
    icon: Medal,
    label: 'Runner-up',
    bg: 'bg-gray-400/10',
    border: 'border-gray-400/30',
    text: 'text-gray-400',
    glow: 'shadow-gray-400/10',
  },
  3: {
    icon: Award,
    label: 'Third Place',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-500',
    glow: 'shadow-orange-500/10',
  },
} as const

interface PodiumCardProps {
  entry: LeaderboardEntry & { rank: number }
  rank: 1 | 2 | 3
}

function PodiumCard({ entry, rank }: PodiumCardProps) {
  const config = podiumConfig[rank]
  const Icon = config.icon

  return (
    <CardV2
      hover={false}
      className={cn(
        'flex flex-col items-center p-4 text-center transition-all duration-300',
        config.bg,
        config.border,
        'border',
        config.glow,
        rank === 1 && 'shadow-lg ring-1 ring-yellow-500/20'
      )}
    >
      <div className={cn('flex items-center gap-1.5 mb-3', config.text)}>
        <Icon className="w-5 h-5" strokeWidth={2.5} />
        <span className={cn('text-sm font-bold', config.text)}>{config.label}</span>
      </div>

      <AvatarV2 size="lg" className="mb-3 ring-2 ring-white/10">
        <AvatarV2Fallback className={cn(
          'text-lg font-semibold',
          rank === 1 && 'bg-yellow-500/20 text-yellow-500',
          rank === 2 && 'bg-gray-400/20 text-gray-400',
          rank === 3 && 'bg-orange-500/20 text-orange-500'
        )}>
          {entry.username.charAt(0).toUpperCase()}
        </AvatarV2Fallback>
      </AvatarV2>

      <div className="font-medium text-v2-text-primary text-sm truncate max-w-full mb-2">
        {entry.username}
      </div>

      <div className="space-y-1 w-full">
        <div className={cn(
          'text-lg font-bold',
          entry.monthlyPnl >= 0 ? 'text-v2-success' : 'text-v2-error'
        )}>
          {entry.monthlyPnl >= 0 ? '+' : ''}${entry.monthlyPnl.toLocaleString()}
        </div>

        <div className="flex items-center justify-center gap-1">
          <div className={cn(
            'w-1.5 h-1.5 rounded-full',
            entry.winRate >= 50 ? 'bg-v2-success' : 'bg-v2-text-tertiary'
          )} />
          <span className="text-xs text-v2-text-secondary">
            {entry.winRate}% Win
          </span>
        </div>
      </div>
    </CardV2>
  )
}

interface PodiumSectionProps {
  top3: (LeaderboardEntry & { rank: number })[]
}

function PodiumSection({ top3 }: PodiumSectionProps) {
  if (top3.length === 0) return null

  const [first, second, third] = top3

  return (
    <div className="mb-8">
      <div className="flex items-center justify-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h2 className="text-xl font-bold text-v2-text-primary">Top Traders</h2>
        <Trophy className="w-6 h-6 text-yellow-500" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center sm:items-end">
        <div className="sm:mt-8 order-2 sm:order-1">
          {second && <PodiumCard entry={second} rank={2} />}
        </div>

        <div className="order-1 sm:order-2">
          {first && <PodiumCard entry={first} rank={1} />}
        </div>

        <div className="sm:mt-8 order-3">
          {third && <PodiumCard entry={third} rank={3} />}
        </div>
      </div>
    </div>
  )
}

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

  const top3 = sorted.slice(0, 3)
  const rest = sorted.slice(3)

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

      <PodiumSection top3={top3} />

      <div className="space-y-2">
        {rest.map((entry) => (
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
