'use client'

import Link from 'next/link'
import React from 'react'
import { ArrowRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
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

function profileHref(locale: string, userId: string): string {
  return `/${locale}/trader/${userId}`
}

function rankClass(rank: number): string {
  if (rank === 1) return 'border-amber-500/35 bg-amber-500/10 text-amber-300'
  if (rank === 2) return 'border-slate-300/35 bg-slate-300/10 text-slate-200'
  if (rank === 3) return 'border-amber-700/35 bg-amber-700/10 text-amber-200'
  return 'border-border/60 bg-background/70 text-foreground/80'
}

export function LeaderboardTableSkeleton() {
  return (
    <section className="overflow-hidden rounded-3xl border border-border/60 bg-[linear-gradient(160deg,hsl(var(--card)/0.62),hsl(var(--background)/0.48))] shadow-[0_24px_90px_-70px_hsl(0_0%_0%_/0.95)]">
      <div className="border-b border-border/60 px-5 py-5 sm:px-6">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="mt-3 h-8 w-56" />
      </div>

      <div className="grid gap-3 p-4 lg:hidden">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="rounded-2xl border border-border/60 bg-background/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="mt-2 h-3.5 w-20" />
                </div>
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Skeleton className="h-11 rounded-lg" />
              <Skeleton className="h-11 rounded-lg" />
              <Skeleton className="h-11 rounded-lg" />
              <Skeleton className="h-11 rounded-lg" />
            </div>
            <Skeleton className="mt-4 h-10 w-full rounded-full" />
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-[1060px] w-full border-separate border-spacing-0">
          <thead className="bg-background/35">
            <tr>
              {['Rank', 'Trader', 'Monthly PnL', 'Win rate', 'Return', 'Trades', 'Accounts', 'Profile'].map((header) => (
                <th
                  key={header}
                  className="border-b border-border/60 px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }, (_, index) => (
              <tr key={index} className="group">
                <td className="border-b border-border/60 px-5 py-4">
                  <Skeleton className="h-9 w-9 rounded-full" />
                </td>
                <td className="border-b border-border/60 px-5 py-4">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="mt-2 h-3.5 w-20" />
                </td>
                <td className="border-b border-border/60 px-5 py-4">
                  <Skeleton className="h-5 w-24" />
                </td>
                <td className="border-b border-border/60 px-5 py-4">
                  <Skeleton className="h-5 w-16" />
                </td>
                <td className="border-b border-border/60 px-5 py-4">
                  <Skeleton className="h-5 w-16" />
                </td>
                <td className="border-b border-border/60 px-5 py-4">
                  <Skeleton className="h-5 w-14" />
                </td>
                <td className="border-b border-border/60 px-5 py-4">
                  <Skeleton className="h-5 w-12" />
                </td>
                <td className="border-b border-border/60 px-5 py-4">
                  <Skeleton className="h-9 w-32 rounded-full" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export const LeaderboardTable = React.memo(function LeaderboardTable({
  entries,
  locale,
  isLoading = false,
}: LeaderboardTableProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-border/60 bg-[linear-gradient(160deg,hsl(var(--card)/0.62),hsl(var(--background)/0.48))] shadow-[0_24px_90px_-70px_hsl(0_0%_0%_/0.95)]">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 px-5 py-5 sm:px-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Leaderboard table</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">All visible traders</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Every public trader shows up in a single rectangular list, so the board is easier to scan and each row can jump to the trader profile.
          </p>
        </div>
        {isLoading ? <span className="text-sm text-muted-foreground">Updating…</span> : null}
      </div>

      {entries.length === 0 ? (
        <div className="px-5 py-10 sm:px-6">
          <div className="rounded-2xl border border-dashed border-border/60 bg-background/65 p-8 text-center text-sm text-muted-foreground">
            No public traders are available yet. Once users opt in from Trader Profile, they will appear here.
          </div>
        </div>
      ) : (
        <div>
          <div className="grid gap-3 p-4 lg:hidden">
            {entries.map((entry) => (
              <LeaderboardEntryCard key={entry.userId} entry={entry} locale={locale} />
            ))}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-[1060px] w-full border-separate border-spacing-0">
              <thead className="bg-background/35">
                <tr>
                  {['Rank', 'Trader', 'Monthly PnL', 'Win rate', 'Return', 'Trades', 'Accounts', 'Profile'].map((header) => (
                    <th
                      key={header}
                      className="border-b border-border/60 px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <LeaderboardEntryRow key={entry.userId} entry={entry} locale={locale} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
})

function LeaderboardEntryCard({ entry, locale }: { entry: LeaderboardEntry; locale: string }) {
  const positive = entry.monthlyPnl >= 0
  const profileLink = profileHref(locale, entry.userId)

  return (
    <article className="rounded-2xl border border-border/60 bg-background/65 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${rankClass(entry.rank)}`}
          >
            #{entry.rank}
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold tracking-tight text-foreground">{entry.username}</p>
            <p className="truncate text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Top instrument {entry.topInstrument ?? 'N/A'}
            </p>
          </div>
        </div>
        <p className={`text-sm font-semibold ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
          {positive ? '+' : ''}
          {formatCurrency(entry.monthlyPnl)}
        </p>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg border border-border/60 bg-background/60 px-3 py-2">
          <dt className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Win rate</dt>
          <dd className="mt-1 font-medium text-foreground">{entry.winRate}%</dd>
        </div>
        <div className="rounded-lg border border-border/60 bg-background/60 px-3 py-2">
          <dt className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Return</dt>
          <dd className="mt-1 font-medium text-foreground">{entry.returnPct}%</dd>
        </div>
        <div className="rounded-lg border border-border/60 bg-background/60 px-3 py-2">
          <dt className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Trades</dt>
          <dd className="mt-1 font-medium text-foreground">{entry.totalTrades}</dd>
        </div>
        <div className="rounded-lg border border-border/60 bg-background/60 px-3 py-2">
          <dt className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Accounts</dt>
          <dd className="mt-1 font-medium text-foreground">{entry.accountCount}</dd>
        </div>
      </dl>

      <Link
        href={profileLink}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
        aria-label={`View ${entry.username} profile`}
      >
        View profile
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </article>
  )
}

function LeaderboardEntryRow({ entry, locale }: { entry: LeaderboardEntry; locale: string }) {
  const positive = entry.monthlyPnl >= 0
  const profileLink = profileHref(locale, entry.userId)

  return (
    <tr className="group bg-transparent transition-colors hover:bg-background/40">
      <td className="border-b border-border/60 px-5 py-4 align-middle">
        <span
          className={`inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold ${rankClass(entry.rank)}`}
        >
          #{entry.rank}
        </span>
      </td>

      <td className="border-b border-border/60 px-5 py-4 align-middle">
        <div className="space-y-1">
          <p className="text-base font-semibold tracking-tight text-foreground">{entry.username}</p>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Top instrument {entry.topInstrument ?? 'N/A'}
          </p>
        </div>
      </td>

      <td className={`border-b border-border/60 px-5 py-4 align-middle text-sm font-semibold ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
        {positive ? '+' : ''}
        {formatCurrency(entry.monthlyPnl)}
      </td>

      <td className="border-b border-border/60 px-5 py-4 align-middle text-sm font-medium text-foreground">
        {entry.winRate}%
      </td>

      <td className="border-b border-border/60 px-5 py-4 align-middle text-sm font-medium text-foreground">
        {entry.returnPct}%
      </td>

      <td className="border-b border-border/60 px-5 py-4 align-middle text-sm font-medium text-foreground">
        {entry.totalTrades}
      </td>

      <td className="border-b border-border/60 px-5 py-4 align-middle text-sm font-medium text-foreground">
        {entry.accountCount}
      </td>

      <td className="border-b border-border/60 px-5 py-4 align-middle">
        <Link
          href={profileLink}
          className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
          aria-label={`View ${entry.username} profile`}
        >
          View profile
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </td>
    </tr>
  )
}
