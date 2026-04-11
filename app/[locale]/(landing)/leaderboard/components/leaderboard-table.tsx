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

function rankStyle(rank: number): { ring: string; bg: string; text: string } {
  if (rank === 1) return { ring: 'rs-border-gold', bg: 'rs-bg-orange', text: 'rs-accent-orange' }
  if (rank === 2) return { ring: 'rs-frost-border', bg: 'rs-frost-surface', text: 'rs-text-secondary' }
  if (rank === 3) return { ring: 'rs-border-gold', bg: 'bg-chart-5/8', text: 'rs-accent-gold' }
  return { ring: 'rs-frost-border', bg: 'rs-frost-surface', text: 'rs-text-secondary' }
}

export function LeaderboardTableSkeleton() {
  return (
    <section className="rs-frost-ring overflow-hidden rounded-3xl border rs-frost-border bg-background">
      <div className="border-b rs-frost-border px-6 py-6">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="mt-3 h-8 w-56" />
      </div>

      <div className="grid gap-3 p-4 lg:hidden">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="rounded-2xl border rs-frost-border rs-frost-surface p-4">
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
          <thead>
            <tr>
              {['Rank', 'Trader', 'Monthly PnL', 'Win rate', 'Return', 'Trades', 'Accounts', 'Profile'].map((header) => (
                <th
                  key={header}
                  className="border-b rs-frost-border px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] rs-text-tertiary"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }, (_, index) => (
              <tr key={index}>
                <td className="border-b rs-frost-border-alt px-6 py-4">
                  <Skeleton className="h-9 w-9 rounded-full" />
                </td>
                <td className="border-b rs-frost-border-alt px-6 py-4">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="mt-2 h-3.5 w-20" />
                </td>
                <td className="border-b rs-frost-border-alt px-6 py-4">
                  <Skeleton className="h-5 w-24" />
                </td>
                <td className="border-b rs-frost-border-alt px-6 py-4">
                  <Skeleton className="h-5 w-16" />
                </td>
                <td className="border-b rs-frost-border-alt px-6 py-4">
                  <Skeleton className="h-5 w-16" />
                </td>
                <td className="border-b rs-frost-border-alt px-6 py-4">
                  <Skeleton className="h-5 w-14" />
                </td>
                <td className="border-b rs-frost-border-alt px-6 py-4">
                  <Skeleton className="h-5 w-12" />
                </td>
                <td className="border-b rs-frost-border-alt px-6 py-4">
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
    <section className="rs-frost-ring overflow-hidden rounded-3xl border rs-frost-border bg-background">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b rs-frost-border px-6 py-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] rs-text-tertiary">Leaderboard table</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] rs-text-strong">All visible traders</h3>
          <p className="mt-2 max-w-2xl text-[13px] leading-[1.5] rs-text-secondary">
            Every public trader shows up in a single rectangular list, so the board is easier to scan and each row can jump to the trader profile.
          </p>
        </div>
        {isLoading ? <span className="text-[13px] rs-text-tertiary">Updating…</span> : null}
      </div>

      {entries.length === 0 ? (
        <div className="px-6 py-12">
          <div className="rounded-2xl border border-dashed rs-frost-border rs-frost-surface p-8 text-center text-[13px] rs-text-secondary">
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
              <thead>
                <tr>
                  {['Rank', 'Trader', 'Monthly PnL', 'Win rate', 'Return', 'Trades', 'Accounts', 'Profile'].map((header) => (
                    <th
                      key={header}
                      className="border-b rs-frost-border px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] rs-text-tertiary"
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
  const style = rankStyle(entry.rank)

  return (
    <article className="rs-frost-ring rounded-2xl border rs-frost-border rs-frost-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${style.ring} ${style.bg} ${style.text} text-sm font-semibold`}
          >
            #{entry.rank}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold tracking-[-0.02em] rs-text-strong">{entry.username}</p>
            <p className="truncate text-[11px] uppercase tracking-[0.16em] rs-text-tertiary">
              Top instrument {entry.topInstrument ?? 'N/A'}
            </p>
          </div>
        </div>
        <p className={`text-sm font-semibold ${positive ? 'rs-accent-green' : 'rs-accent-red'}`}>
          {positive ? '+' : ''}
          {formatCurrency(entry.monthlyPnl)}
        </p>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg border rs-frost-border rs-frost-surface px-3 py-2.5">
          <dt className="text-[10px] uppercase tracking-[0.14em] rs-text-tertiary">Win rate</dt>
          <dd className="mt-1 font-medium rs-text-strong">{entry.winRate}%</dd>
        </div>
        <div className="rounded-lg border rs-frost-border rs-frost-surface px-3 py-2.5">
          <dt className="text-[10px] uppercase tracking-[0.14em] rs-text-tertiary">Return</dt>
          <dd className="mt-1 font-medium rs-text-strong">{entry.returnPct}%</dd>
        </div>
        <div className="rounded-lg border rs-frost-border rs-frost-surface px-3 py-2.5">
          <dt className="text-[10px] uppercase tracking-[0.14em] rs-text-tertiary">Trades</dt>
          <dd className="mt-1 font-medium rs-text-strong">{entry.totalTrades}</dd>
        </div>
        <div className="rounded-lg border rs-frost-border rs-frost-surface px-3 py-2.5">
          <dt className="text-[10px] uppercase tracking-[0.14em] rs-text-tertiary">Accounts</dt>
          <dd className="mt-1 font-medium rs-text-strong">{entry.accountCount}</dd>
        </div>
      </dl>

      <Link
        href={profileLink}
        className="rs-frost-hover mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border rs-frost-border bg-transparent px-3 py-2 text-[13px] font-medium rs-text-strong transition-colors"
        aria-label={`View ${entry.username} profile`}
      >
        View profile
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </article>
  )
}

function LeaderboardEntryRow({ entry, locale }: { entry: LeaderboardEntry; locale: string }) {
  const positive = entry.monthlyPnl >= 0
  const profileLink = profileHref(locale, entry.userId)
  const style = rankStyle(entry.rank)

  return (
    <tr className="group transition-colors hover:bg-foreground/3">
      <td className="border-b rs-frost-border-alt px-6 py-4 align-middle">
        <span
          className={`inline-flex h-9 w-9 items-center justify-center rounded-full border ${style.ring} ${style.bg} ${style.text} text-sm font-semibold`}
        >
          #{entry.rank}
        </span>
      </td>

      <td className="border-b rs-frost-border-alt px-6 py-4 align-middle">
        <div className="space-y-0.5">
          <p className="text-[15px] font-semibold tracking-[-0.02em] rs-text-strong">{entry.username}</p>
          <p className="text-[11px] uppercase tracking-[0.16em] rs-text-tertiary">
            Top instrument {entry.topInstrument ?? 'N/A'}
          </p>
        </div>
      </td>

      <td className={`border-b rs-frost-border-alt px-6 py-4 align-middle text-sm font-semibold ${positive ? 'rs-accent-green' : 'rs-accent-red'}`}>
        {positive ? '+' : ''}
        {formatCurrency(entry.monthlyPnl)}
      </td>

      <td className="border-b rs-frost-border-alt px-6 py-4 align-middle text-sm font-medium rs-text-strong">
        {entry.winRate}%
      </td>

      <td className="border-b rs-frost-border-alt px-6 py-4 align-middle text-sm font-medium rs-text-strong">
        {entry.returnPct}%
      </td>

      <td className="border-b rs-frost-border-alt px-6 py-4 align-middle text-sm font-medium rs-text-strong">
        {entry.totalTrades}
      </td>

      <td className="border-b rs-frost-border-alt px-6 py-4 align-middle text-sm font-medium rs-text-strong">
        {entry.accountCount}
      </td>

      <td className="border-b rs-frost-border-alt px-6 py-4 align-middle">
        <Link
          href={profileLink}
          className="rs-frost-hover inline-flex items-center gap-2 rounded-full border rs-frost-border bg-transparent px-3.5 py-1.5 text-[13px] font-medium rs-text-strong transition-colors"
          aria-label={`View ${entry.username} profile`}
        >
          View profile
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </td>
    </tr>
  )
}