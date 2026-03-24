'use client'

import Link from 'next/link'
import React from 'react'
import { ArrowRight, Clock3, Flame, Target, TrendingUp, Wallet } from 'lucide-react'
import { SkeletonV2 } from '@/components/ui/v2'
import type { LeaderboardEntry } from '../data/leaderboard-query'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  locale: string
  isLoading?: boolean
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatMinutes(value: number): string {
  if (value < 60) return `${value}m`
  const hours = Math.floor(value / 60)
  const minutes = Math.round(value % 60)
  return `${hours}h ${minutes}m`
}

export function LeaderboardTableSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="rounded-[1.4rem] border border-border/60 bg-card/45 p-5">
          <SkeletonV2 className="h-5 w-20" />
          <SkeletonV2 className="mt-4 h-7 w-40" />
          <div className="mt-5 grid grid-cols-2 gap-3">
            <SkeletonV2 className="h-16 rounded-2xl" />
            <SkeletonV2 className="h-16 rounded-2xl" />
            <SkeletonV2 className="h-16 rounded-2xl" />
            <SkeletonV2 className="h-16 rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

export const LeaderboardTable = React.memo(function LeaderboardTable({
  entries,
  locale,
  isLoading = false,
}: LeaderboardTableProps) {
  return (
    <section className="space-y-5 rounded-[1.8rem] border border-border/60 bg-card/45 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Leaderboard table</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Detailed trader breakdown</h3>
        </div>
        {isLoading ? <span className="text-sm text-muted-foreground">Updating…</span> : null}
      </div>

      {entries.length === 0 ? (
        <div className="rounded-[1.4rem] border border-dashed border-border bg-background/70 p-8 text-center text-sm text-muted-foreground">
          The remaining traders list is empty because all visible entries are already highlighted in the podium above.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {entries.map((entry) => (
            <LeaderboardEntryCard key={entry.userId} entry={entry} locale={locale} />
          ))}
        </div>
      )}
    </section>
  )
})

function LeaderboardEntryCard({ entry, locale }: { entry: LeaderboardEntry; locale: string }) {
  const positive = entry.monthlyPnl >= 0

  return (
    <Link
      href={`/${locale}/trader/${entry.userId}`}
      className="group rounded-[1.4rem] border border-border/60 bg-background/75 p-5 transition-all hover:-translate-y-0.5 hover:border-foreground/15"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Rank #{entry.rank}</p>
          <h4 className="mt-2 text-xl font-semibold tracking-tight text-foreground">{entry.username}</h4>
        </div>
        <div className={`rounded-full px-3 py-2 text-sm font-semibold ${positive ? 'bg-emerald-500/12 text-emerald-500' : 'bg-rose-500/12 text-rose-500'}`}>
          {positive ? '+' : ''}
          {formatCurrency(entry.monthlyPnl)}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Metric icon={TrendingUp} label="Win rate" value={`${entry.winRate}%`} />
        <Metric icon={Wallet} label="Return" value={`${entry.returnPct}%`} />
        <Metric icon={Target} label="Avg win / loss" value={`${formatCurrency(entry.avgWin)} / ${formatCurrency(entry.avgLoss)}`} />
        <Metric icon={Clock3} label="Avg duration" value={formatMinutes(entry.avgDurationMinutes)} />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{entry.totalTrades} trades</span>
          <span>{entry.accountCount} accounts</span>
        </div>
        <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
          <Flame className="h-4 w-4" />
          Best streak {entry.longestWinStreak}
        </div>
      </div>

      <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground">
        View trader
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof TrendingUp
  label: string
  value: string
}) {
  return (
    <div className="rounded-[1rem] border border-border/60 bg-card/65 p-3">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}
