'use client'

import React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { CardV2, SkeletonV2 } from '@/components/ui/v2'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Trophy, 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  ExternalLink,
  Users,
  ChevronRight
} from 'lucide-react'
import type { LeaderboardEntry, LeaderboardSort } from '../data/leaderboard-query'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  locale: string
}

const trophyConfig = {
  1: { icon: '🥇', label: 'Champion', accent: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
  2: { icon: '🥈', label: 'Runner-up', accent: 'text-slate-300', bg: 'bg-slate-300/10', border: 'border-slate-300/30' },
  3: { icon: '🥉', label: 'Third Place', accent: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30' },
} as const

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function getInitials(username: string): string {
  return username
    .split(/[\s_-]+/)
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getAvatarColor(userId: string): string {
  const colors = [
    'bg-blue-500/20 text-blue-400',
    'bg-emerald-500/20 text-emerald-400',
    'bg-violet-500/20 text-violet-400',
    'bg-rose-500/20 text-rose-400',
    'bg-amber-500/20 text-amber-400',
    'bg-cyan-500/20 text-cyan-400',
    'bg-pink-500/20 text-pink-400',
    'bg-indigo-500/20 text-indigo-400',
  ]
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

function WinRateBar({ winRate }: { winRate: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[60px]">
        <div 
          className={cn(
            "h-full rounded-full transition-all",
            winRate >= 60 ? "bg-emerald-400" : 
            winRate >= 40 ? "bg-amber-400" : 
            "bg-rose-400"
          )}
          style={{ width: `${Math.min(winRate, 100)}%` }}
        />
      </div>
      <span className="text-sm font-medium text-foreground min-w-[40px]">{winRate}%</span>
    </div>
  )
}

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    const config = trophyConfig[rank as 1 | 2 | 3]
    return (
      <div className={cn(
        "flex items-center justify-center w-10 h-10 rounded-full border",
        config.bg,
        config.border
      )}>
        <span className="text-lg">{config.icon}</span>
      </div>
    )
  }
  
  return (
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted border border-border">
      <span className="text-sm font-semibold text-muted-foreground">#{rank}</span>
    </div>
  )
}

function TraderRow({ entry, locale, isTop3 }: { entry: LeaderboardEntry; locale: string; isTop3: boolean }) {
  const isPositivePnl = entry.monthlyPnl >= 0
  
  return (
    <tr className={cn(
      "border-b border-border transition-colors hover:bg-muted/50",
      isTop3 && "bg-muted/30"
    )}>
      <td className="px-4 py-4 whitespace-nowrap">
        <RankBadge rank={entry.rank} />
      </td>
      
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar className={cn("h-10 w-10 border border-border", getAvatarColor(entry.userId))}>
            <AvatarFallback className="text-xs font-semibold bg-transparent">
              {getInitials(entry.username)}
            </AvatarFallback>
          </Avatar>
          <div>
            <Link
              href={`/${locale}/trader/${entry.userId}`}
              className="font-medium text-foreground hover:text-foreground/80 transition-colors flex items-center gap-1 group"
            >
              {entry.username}
              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            {isTop3 && (
              <span className={cn(
                "text-[10px] font-semibold uppercase tracking-wider",
                trophyConfig[entry.rank as 1 | 2 | 3].accent
              )}>
                {trophyConfig[entry.rank as 1 | 2 | 3].label}
              </span>
            )}
          </div>
        </div>
      </td>
      
      <td className="px-4 py-4 whitespace-nowrap">
        <div className={cn(
          "font-semibold",
          isPositivePnl ? "text-emerald-400" : "text-rose-400"
        )}>
          {isPositivePnl ? '+' : ''}{formatCurrency(entry.monthlyPnl)}
        </div>
      </td>
      
      <td className="px-4 py-4 whitespace-nowrap">
        <WinRateBar winRate={entry.winRate} />
      </td>
      
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <Flame className={cn(
            "h-4 w-4",
            entry.longestWinStreak >= 5 ? "text-orange-400" : "text-muted-foreground"
          )} />
          <span className="font-medium text-foreground">{entry.longestWinStreak}</span>
        </div>
      </td>
      
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{entry.accountCount}</span>
        </div>
      </td>
      
      <td className="px-4 py-4 whitespace-nowrap">
        <Link
          href={`/${locale}/trader/${entry.userId}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full bg-muted border border-border text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
        >
          View Profile
          <ChevronRight className="h-3 w-3" />
        </Link>
      </td>
    </tr>
  )
}

export function LeaderboardTableSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <CardV2 key={i} className="rounded-xl p-4">
          <div className="flex items-center gap-4">
            <SkeletonV2 className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <SkeletonV2 className="h-4 w-32" />
              <SkeletonV2 className="h-3 w-20" />
            </div>
            <SkeletonV2 className="h-6 w-20" />
          </div>
        </CardV2>
      ))}
    </div>
  )
}

export const LeaderboardTable = React.memo(function LeaderboardTable({ entries, locale }: LeaderboardTableProps) {
  const searchParams = useSearchParams()
  const currentSort = (searchParams.get('sort') ?? 'monthly_pnl') as LeaderboardSort

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {([
          { key: 'monthly_pnl', label: 'Monthly PnL', icon: TrendingUp },
          { key: 'winrate', label: 'Win Rate', icon: Trophy },
          { key: 'totalTrades', label: 'Trade Count', icon: TrendingDown },
        ] as const).map(({ key, label, icon: Icon }) => (
          <Link
            key={key}
            href={`/${locale}/leaderboard?sort=${key}`}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors no-underline',
              currentSort === key
                ? 'border-foreground/20 bg-foreground/10 text-foreground'
                : 'border-border bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </div>

      <CardV2 className="overflow-hidden rounded-2xl border-border bg-card p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="bg-muted/50 border-b border-border">
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-4 font-semibold w-[80px]">Rank</th>
                <th className="px-4 py-4 font-semibold">Trader</th>
                <th className="px-4 py-4 font-semibold">PnL</th>
                <th className="px-4 py-4 font-semibold">Win Rate</th>
                <th className="px-4 py-4 font-semibold">Best Streak</th>
                <th className="px-4 py-4 font-semibold">Accounts</th>
                <th className="px-4 py-4 font-semibold w-[140px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <TraderRow 
                  key={entry.userId} 
                  entry={entry} 
                  locale={locale}
                  isTop3={entry.rank <= 3}
                />
              ))}
            </tbody>
          </table>
        </div>

        {entries.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Trophy className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-foreground font-medium">No traders found</p>
            <p className="text-muted-foreground text-sm mt-1">Be the first to appear on the leaderboard!</p>
          </div>
        ) : null}
      </CardV2>

      {entries.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          Showing top {entries.length} traders • Updated monthly
        </p>
      )}
    </div>
  )
})
