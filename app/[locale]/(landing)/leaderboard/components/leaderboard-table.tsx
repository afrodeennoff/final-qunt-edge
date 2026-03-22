'use client'

import React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { CardV2, SkeletonV2 } from '@/components/ui/v2'
import { Trophy, Medal, Award, Flame, Clock3, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react'
import type { LeaderboardEntry, LeaderboardSort } from '../data/leaderboard-query'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  locale: string
}

const podiumConfig = {
  1: { icon: Trophy, label: 'Champion', accent: 'text-amber-300', border: 'border-amber-300/20', bg: 'bg-amber-300/8' },
  2: { icon: Medal, label: 'Runner-up', accent: 'text-slate-300', border: 'border-slate-300/20', bg: 'bg-slate-300/8' },
  3: { icon: Award, label: 'Third', accent: 'text-orange-300', border: 'border-orange-300/20', bg: 'bg-orange-300/8' },
} as const

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatMinutes(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '—'
  const hours = Math.floor(value / 60)
  const minutes = Math.round(value % 60)
  if (hours <= 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

function TraderLink({ userId, username, locale, children, className }: {
  userId: string
  username: string
  locale: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link
      href={`/${locale}/trader/${userId}`}
      className={cn(
        'group inline-flex items-center gap-1.5 transition-colors hover:text-v2-accent',
        className
      )}
      title={`View ${username}'s profile`}
    >
      {children}
      <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  )
}

function PodiumCard({ entry, rank, locale }: { entry: LeaderboardEntry; rank: 1 | 2 | 3; locale: string }) {
  const config = podiumConfig[rank]
  const Icon = config.icon

  return (
    <CardV2 className={cn('rounded-[28px] border p-5 text-left', config.border, config.bg)}>
      <div className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]', config.border, config.accent)}>
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </div>
      <div className="mt-5">
        <TraderLink userId={entry.userId} username={entry.username} locale={locale}>
          <p className="text-lg font-semibold text-v2-text-primary">{entry.username}</p>
        </TraderLink>
        <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">{formatCurrency(entry.monthlyPnl)}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <Metric label="Return" value={`${entry.returnPct >= 0 ? '+' : ''}${entry.returnPct}%`} tone="text-emerald-300" />
          <Metric label="Win Rate" value={`${entry.winRate}%`} />
          <Metric label="Top Pair" value={entry.topInstrument ?? '—'} />
          <Metric label="Trades" value={entry.totalTrades.toLocaleString()} />
        </div>
      </div>
    </CardV2>
  )
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
      <p className="text-[10px] uppercase tracking-[0.14em] text-white/40">{label}</p>
      <p className={cn('mt-1 text-sm font-semibold text-white', tone)}>{value}</p>
    </div>
  )
}

function LeaderboardRow({ entry, locale }: { entry: LeaderboardEntry; locale: string }) {
  return (
    <tr className="border-white/10 hover:bg-white/[0.03]">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <span className={cn(
            'inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold',
            entry.rank === 1 && 'border-amber-300/30 bg-amber-300/10 text-amber-300',
            entry.rank === 2 && 'border-slate-300/30 bg-slate-300/10 text-slate-300',
            entry.rank === 3 && 'border-orange-300/30 bg-orange-300/10 text-orange-300',
            entry.rank > 3 && 'border-white/10 bg-white/[0.03] text-white/70',
          )}>
            {entry.rank}
          </span>
          <div>
            <TraderLink userId={entry.userId} username={entry.username} locale={locale}>
              <p className="font-medium text-white">{entry.username}</p>
            </TraderLink>
            <p className="text-xs text-white/45">{entry.topInstrument ?? 'No pair data'}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-emerald-300">{formatCurrency(entry.monthlyPnl)}</td>
      <td className="px-4 py-4 text-emerald-300">{`${entry.returnPct >= 0 ? '+' : ''}${entry.returnPct}%`}</td>
      <td className="px-4 py-4 text-white/80">{entry.winRate}%</td>
      <td className="px-4 py-4 text-white/80">{entry.topInstrument ?? '—'}</td>
      <td className="px-4 py-4 text-emerald-300">{entry.avgWin > 0 ? formatCurrency(entry.avgWin) : '—'}</td>
      <td className="px-4 py-4 text-rose-300">{entry.avgLoss > 0 ? `-${formatCurrency(entry.avgLoss)}` : '—'}</td>
      <td className="px-4 py-4 text-white/80">
        <span className="inline-flex items-center gap-2">
          <Clock3 className="h-3.5 w-3.5 text-white/35" />
          {formatMinutes(entry.avgDurationMinutes)}
        </span>
      </td>
      <td className="px-4 py-4 text-white/80">{entry.totalTrades.toLocaleString()}</td>
      <td className="px-4 py-4 text-rose-300">{entry.longestLossStreak}</td>
      <td className="px-4 py-4 text-emerald-300">
        <span className="inline-flex items-center gap-2">
          <Flame className="h-3.5 w-3.5" />
          {entry.longestWinStreak}
        </span>
      </td>
    </tr>
  )
}

export function LeaderboardTableSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <CardV2 key={i} className="rounded-3xl p-5">
          <SkeletonV2 className="h-6 w-40" />
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {[1, 2, 3, 4].map((j) => <SkeletonV2 key={j} className="h-16 w-full rounded-2xl" />)}
          </div>
        </CardV2>
      ))}
    </div>
  )
}

export const LeaderboardTable = React.memo(function LeaderboardTable({ entries, locale }: LeaderboardTableProps) {
  const searchParams = useSearchParams()
  const currentSort = (searchParams.get('sort') ?? 'monthly_pnl') as LeaderboardSort

  const top3 = entries.slice(0, 3)
  const rest = entries

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
                ? 'border-v2-accent/40 bg-v2-accent/10 text-v2-accent'
                : 'border-white/10 bg-white/[0.03] text-white/60 hover:text-white'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {top3.map((entry, index) => (
          <PodiumCard key={entry.userId} entry={entry} rank={(index + 1) as 1 | 2 | 3} locale={locale} />
        ))}
      </div>

      <CardV2 className="overflow-hidden rounded-[30px] border-white/10 bg-white/[0.03] p-0">
        <div className="overflow-x-auto">
          <table className="min-w-[1160px] w-full border-collapse text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03]">
              <tr className="text-[11px] uppercase tracking-[0.14em] text-white/45">
                <th className="px-4 py-4 font-semibold">Rank</th>
                <th className="px-4 py-4 font-semibold">Profit</th>
                <th className="px-4 py-4 font-semibold">Profit %</th>
                <th className="px-4 py-4 font-semibold">Win Ratio</th>
                <th className="px-4 py-4 font-semibold">Pair</th>
                <th className="px-4 py-4 font-semibold">Avg. Win</th>
                <th className="px-4 py-4 font-semibold">Avg. Loss</th>
                <th className="px-4 py-4 font-semibold">Avg. Duration</th>
                <th className="px-4 py-4 font-semibold">Trades</th>
                <th className="px-4 py-4 font-semibold">Losing Streak</th>
                <th className="px-4 py-4 font-semibold">Winning Streak</th>
              </tr>
            </thead>
            <tbody>
              {rest.map((entry) => (
                <LeaderboardRow key={entry.userId} entry={entry} locale={locale} />
              ))}
            </tbody>
          </table>
        </div>

        {rest.length === 0 ? (
          <div className="p-10 text-center text-white/55">No public trading data found for this month.</div>
        ) : null}
      </CardV2>
    </div>
  )
})
