'use client'

import Link from 'next/link'
import React from 'react'
import { ArrowRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { LeaderboardEntry } from '../data/leaderboard-query'
import {
  unifiedGhostActionClassName,
  unifiedInsetPanelClassName,
} from '@/components/layout/unified-page-recipes'
import { cn } from '@/lib/utils'

const rowDividerClassName = 'border-border'
const tableSurfaceClassName =
  'overflow-hidden rounded-xl border-0 bg-muted/40 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.5)]'

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

function rankClasses(rank: number): string {
  if (rank === 1) return 'border-primary/30 bg-primary/10 text-primary'
  if (rank === 2) return 'border-border bg-muted/10 text-muted-foreground'
  if (rank === 3) return 'border-warning/28 bg-warning/8 text-warning'
  return 'border-border bg-muted/40 text-muted-foreground'
}

export function LeaderboardTableSkeleton() {
  return (
    <div className={tableSurfaceClassName}>
      <div className={cn('border-b px-6 py-6', rowDividerClassName)}>
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="mt-3 h-8 w-56" />
      </div>
      <div className="grid gap-3 p-4 lg:hidden">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={cn(unifiedInsetPanelClassName, 'p-4')}>
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
              {[
                'Rank',
                'Trader',
                'Monthly PnL',
                'Win rate',
                'Return',
                'Trades',
                'Accounts',
                'Profile',
              ].map((heading) => (
                <th
                  key={heading}
                  className={cn(
                    'border-b px-6 py-4 text-left text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70',
                    rowDividerClassName,
                  )}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }, (_, i) => (
              <tr key={i}>
                <td className={cn('border-b px-6 py-4', rowDividerClassName)}>
                  <Skeleton className="h-9 w-9 rounded-full" />
                </td>
                <td className={cn('border-b px-6 py-4', rowDividerClassName)}>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="mt-2 h-3.5 w-20" />
                </td>
                <td className={cn('border-b px-6 py-4', rowDividerClassName)}>
                  <Skeleton className="h-5 w-24" />
                </td>
                <td className={cn('border-b px-6 py-4', rowDividerClassName)}>
                  <Skeleton className="h-5 w-16" />
                </td>
                <td className={cn('border-b px-6 py-4', rowDividerClassName)}>
                  <Skeleton className="h-5 w-16" />
                </td>
                <td className={cn('border-b px-6 py-4', rowDividerClassName)}>
                  <Skeleton className="h-5 w-14" />
                </td>
                <td className={cn('border-b px-6 py-4', rowDividerClassName)}>
                  <Skeleton className="h-5 w-12" />
                </td>
                <td className={cn('border-b px-6 py-4', rowDividerClassName)}>
                  <Skeleton className="h-9 w-32 rounded-full" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const LeaderboardTable = React.memo(function LeaderboardTable({
  entries,
  locale,
  isLoading = false,
}: LeaderboardTableProps) {
  return (
    <div className={tableSurfaceClassName}>
      <div
        className={cn(
          'flex flex-wrap items-end justify-between gap-4 border-b px-6 py-6',
          rowDividerClassName,
        )}
      >
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
            Leaderboard table
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            All visible traders
          </h3>
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
            Every public trader in a single list, with quick access into the full trader profile.
          </p>
        </div>
        {isLoading ? <span className="text-[13px] text-muted-foreground/70">Updating…</span> : null}
      </div>

      {entries.length === 0 ? (
        <div className="px-6 py-12">
          <div className="rounded-xl border-0 bg-muted/40 p-8 text-center text-[13px] text-muted-foreground">
            No public traders are available yet. Once users opt in from Trader Profile, they will
            appear here.
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-3 p-4 lg:hidden">
            {entries.map((entry) => (
              <LeaderboardEntryCard key={entry.userId} entry={entry} locale={locale} />
            ))}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-[1060px] w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  {[
                    'Rank',
                    'Trader',
                    'Monthly PnL',
                    'Win rate',
                    'Return',
                    'Trades',
                    'Accounts',
                    'Profile',
                  ].map((heading) => (
                    <th
                      key={heading}
                      className={cn(
                        'border-b px-6 py-4 text-left text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70',
                        rowDividerClassName,
                      )}
                    >
                      {heading}
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
        </>
      )}
    </div>
  )
})

function LeaderboardEntryCard({ entry, locale }: { entry: LeaderboardEntry; locale: string }) {
  const positive = entry.monthlyPnl >= 0
  const profileLink = profileHref(locale, entry.userId)

  return (
    <article className={cn(unifiedInsetPanelClassName, 'p-4')}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold',
              rankClasses(entry.rank),
            )}
          >
            #{entry.rank}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold tracking-tight text-foreground">
              {entry.username}
            </p>
            <p className="truncate text-[11px] uppercase tracking-[0.16em] text-muted-foreground/70">
              Top instrument {entry.topInstrument ?? '—'}
            </p>
          </div>
        </div>
        <p className={cn('text-sm font-semibold', positive ? 'text-success' : 'text-destructive')}>
          {positive ? '+' : ''}
          {formatCurrency(entry.monthlyPnl)}
        </p>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2">
        {[
          ['Win rate', `${entry.winRate}%`],
          ['Return', `${entry.returnPct}%`],
          ['Trades', `${entry.totalTrades}`],
          ['Accounts', `${entry.accountCount}`],
        ].map(([label, value]) => (
          <div key={label} className={cn(unifiedInsetPanelClassName, 'px-3 py-2.5')}>
            <dt className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
              {label}
            </dt>
            <dd className="mt-1 text-[14px] font-medium text-foreground">{value}</dd>
          </div>
        ))}
      </dl>

      <Link
        href={profileLink}
        className={cn(unifiedGhostActionClassName, 'mt-4 w-full text-[13px]')}
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

  return (
    <tr className="group transition-[background-color,color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-primary/[0.02]">
      <td className={cn('border-b px-6 py-4 align-middle', rowDividerClassName)}>
        <span
          className={cn(
            'inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold',
            rankClasses(entry.rank),
          )}
        >
          #{entry.rank}
        </span>
      </td>
      <td className={cn('border-b px-6 py-4 align-middle', rowDividerClassName)}>
        <p className="text-[15px] font-semibold tracking-tight text-foreground">
          {entry.username}
        </p>
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground/70">
          Top instrument {entry.topInstrument ?? '—'}
        </p>
      </td>
      <td
        className={cn(
          'border-b px-6 py-4 align-middle text-sm font-semibold',
          rowDividerClassName,
          positive ? 'text-success' : 'text-destructive',
        )}
      >
        {positive ? '+' : ''}
        {formatCurrency(entry.monthlyPnl)}
      </td>
      <td
        className={cn(
          'border-b px-6 py-4 align-middle text-sm font-medium text-foreground',
          rowDividerClassName,
        )}
      >
        {entry.winRate}%
      </td>
      <td
        className={cn(
          'border-b px-6 py-4 align-middle text-sm font-medium text-foreground',
          rowDividerClassName,
        )}
      >
        {entry.returnPct}%
      </td>
      <td
        className={cn(
          'border-b px-6 py-4 align-middle text-sm font-medium text-foreground',
          rowDividerClassName,
        )}
      >
        {entry.totalTrades}
      </td>
      <td
        className={cn(
          'border-b px-6 py-4 align-middle text-sm font-medium text-foreground',
          rowDividerClassName,
        )}
      >
        {entry.accountCount}
      </td>
      <td className={cn('border-b px-6 py-4 align-middle', rowDividerClassName)}>
        <Link
          href={profileLink}
          className={cn(unifiedGhostActionClassName, 'px-3.5 py-1.5 text-[13px]')}
          aria-label={`View ${entry.username} profile`}
        >
          View profile
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </td>
    </tr>
  )
}
