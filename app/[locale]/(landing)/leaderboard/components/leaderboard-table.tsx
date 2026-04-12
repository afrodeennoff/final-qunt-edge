'use client'

import Link from 'next/link'
import React from 'react'
import { ArrowRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { LeaderboardEntry } from '../data/leaderboard-query'

/* ─── Shared constants ─── */

const FB = 'border-[hsl(var(--border)/0.36)]' // frost border
const FA = 'border-[hsl(var(--border)/0.28)]' // frost border alt (row dividers)
const FS = 'bg-[hsl(var(--card)/0.34)]' // frost surface
const FR = { boxShadow: '0 24px 48px -32px rgba(0, 0, 0, 0.72)' } // panel shadow

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
  if (rank === 1) return 'border-[rgba(255,128,31,0.35)] bg-[rgba(255,128,31,0.1)] text-[#ff801f]'
  if (rank === 2) return 'border-[hsl(var(--border)/0.4)] bg-[hsl(var(--card)/0.42)] text-[#a1a4a5]'
  if (rank === 3) return 'border-[rgba(255,197,61,0.3)] bg-[rgba(255,197,61,0.08)] text-[#ffc53d]'
  return `${FB} ${FS} text-[#a1a4a5]`
}

/* ─── Skeleton ─── */

export function LeaderboardTableSkeleton() {
  return (
    <div className={`overflow-hidden rounded-2xl border ${FB} bg-black`} style={FR}>
      <div className={`border-b ${FA} px-6 py-6`}>
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="mt-3 h-8 w-56" />
      </div>
      <div className="grid gap-3 p-4 lg:hidden">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={`rounded-xl border ${FB} ${FS} p-4`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div><Skeleton className="h-5 w-32" /><Skeleton className="mt-2 h-3.5 w-20" /></div>
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Skeleton className="h-11 rounded-lg" /><Skeleton className="h-11 rounded-lg" />
              <Skeleton className="h-11 rounded-lg" /><Skeleton className="h-11 rounded-lg" />
            </div>
            <Skeleton className="mt-4 h-10 w-full rounded-full" />
          </div>
        ))}
      </div>
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-[1060px] w-full border-separate border-spacing-0">
          <thead>
            <tr>{['Rank', 'Trader', 'Monthly PnL', 'Win rate', 'Return', 'Trades', 'Accounts', 'Profile'].map((h) => (
              <th key={h} className={`border-b ${FA} px-6 py-4 text-left text-[11px] font-medium uppercase tracking-[0.18em] text-[#7a7a7a]`}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }, (_, i) => (
              <tr key={i}>
                <td className={`border-b ${FA} px-6 py-4`}><Skeleton className="h-9 w-9 rounded-full" /></td>
                <td className={`border-b ${FA} px-6 py-4`}><Skeleton className="h-5 w-32" /><Skeleton className="mt-2 h-3.5 w-20" /></td>
                <td className={`border-b ${FA} px-6 py-4`}><Skeleton className="h-5 w-24" /></td>
                <td className={`border-b ${FA} px-6 py-4`}><Skeleton className="h-5 w-16" /></td>
                <td className={`border-b ${FA} px-6 py-4`}><Skeleton className="h-5 w-16" /></td>
                <td className={`border-b ${FA} px-6 py-4`}><Skeleton className="h-5 w-14" /></td>
                <td className={`border-b ${FA} px-6 py-4`}><Skeleton className="h-5 w-12" /></td>
                <td className={`border-b ${FA} px-6 py-4`}><Skeleton className="h-9 w-32 rounded-full" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ─── Table ─── */

export const LeaderboardTable = React.memo(function LeaderboardTable({
  entries,
  locale,
  isLoading = false,
}: LeaderboardTableProps) {
  return (
    <div className={`overflow-hidden rounded-2xl border ${FB} bg-black`} style={FR}>
      <div className={`flex flex-wrap items-end justify-between gap-4 border-b ${FA} px-6 py-6`}>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#7a7a7a]">Leaderboard table</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#f0f0f0]">All visible traders</h3>
          <p className="mt-2 max-w-2xl text-[13px] leading-[1.5] text-[#a1a4a5]">
            Every public trader in a single list — easy to scan, each row links to the full trader profile.
          </p>
        </div>
        {isLoading ? <span className="text-[13px] text-[#7a7a7a]">Updating…</span> : null}
      </div>

      {entries.length === 0 ? (
        <div className="px-6 py-12">
          <div className={`rounded-xl border border-dashed ${FB} ${FS} p-8 text-center text-[13px] text-[#a1a4a5]`}>
            No public traders are available yet. Once users opt in from Trader Profile, they will appear here.
          </div>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="grid gap-3 p-4 lg:hidden">
            {entries.map((entry) => (
              <LeaderboardEntryCard key={entry.userId} entry={entry} locale={locale} />
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-[1060px] w-full border-separate border-spacing-0">
              <thead>
                <tr>{['Rank', 'Trader', 'Monthly PnL', 'Win rate', 'Return', 'Trades', 'Accounts', 'Profile'].map((h) => (
                  <th key={h} className={`border-b ${FA} px-6 py-4 text-left text-[11px] font-medium uppercase tracking-[0.18em] text-[#7a7a7a]`}>{h}</th>
                ))}</tr>
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

/* ─── Mobile entry card ─── */

function LeaderboardEntryCard({ entry, locale }: { entry: LeaderboardEntry; locale: string }) {
  const positive = entry.monthlyPnl >= 0
  const profileLink = profileHref(locale, entry.userId)

  return (
    <article className={`rounded-xl border ${FB} ${FS} p-4`} style={FR}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${rankClasses(entry.rank)}`}>
            #{entry.rank}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold tracking-[-0.02em] text-[#f0f0f0]">{entry.username}</p>
            <p className="truncate text-[11px] uppercase tracking-[0.16em] text-[#7a7a7a]">
              Top instrument {entry.topInstrument ?? '—'}
            </p>
          </div>
        </div>
        <p className={`text-sm font-semibold ${positive ? 'text-[#11ff99]' : 'text-[#ff2047]'}`}>
          {positive ? '+' : ''}{formatCurrency(entry.monthlyPnl)}
        </p>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2">
        {[
          ['Win rate', `${entry.winRate}%`],
          ['Return', `${entry.returnPct}%`],
          ['Trades', `${entry.totalTrades}`],
          ['Accounts', `${entry.accountCount}`],
        ].map(([label, val]) => (
          <div key={label} className={`rounded-lg border ${FB} ${FS} px-3 py-2.5`}>
            <dt className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#7a7a7a]">{label}</dt>
            <dd className="mt-1 text-[14px] font-medium text-[#f0f0f0]">{val}</dd>
          </div>
        ))}
      </dl>

      <Link
        href={profileLink}
        className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border ${FB} bg-transparent px-3 py-2 text-[13px] font-medium text-[#f0f0f0] transition-colors hover:bg-accent/55`}
        aria-label={`View ${entry.username} profile`}
      >
        View profile
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </article>
  )
}

/* ─── Desktop entry row ─── */

function LeaderboardEntryRow({ entry, locale }: { entry: LeaderboardEntry; locale: string }) {
  const positive = entry.monthlyPnl >= 0
  const profileLink = profileHref(locale, entry.userId)

  return (
    <tr className="group transition-colors hover:bg-accent/35">
      <td className={`border-b ${FA} px-6 py-4 align-middle`}>
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold ${rankClasses(entry.rank)}`}>
          #{entry.rank}
        </span>
      </td>
      <td className={`border-b ${FA} px-6 py-4 align-middle`}>
        <p className="text-[15px] font-semibold tracking-[-0.02em] text-[#f0f0f0]">{entry.username}</p>
        <p className="text-[11px] uppercase tracking-[0.16em] text-[#7a7a7a]">Top instrument {entry.topInstrument ?? '—'}</p>
      </td>
      <td className={`border-b ${FA} px-6 py-4 align-middle text-sm font-semibold ${positive ? 'text-[#11ff99]' : 'text-[#ff2047]'}`}>
        {positive ? '+' : ''}{formatCurrency(entry.monthlyPnl)}
      </td>
      <td className={`border-b ${FA} px-6 py-4 align-middle text-sm font-medium text-[#f0f0f0]`}>{entry.winRate}%</td>
      <td className={`border-b ${FA} px-6 py-4 align-middle text-sm font-medium text-[#f0f0f0]`}>{entry.returnPct}%</td>
      <td className={`border-b ${FA} px-6 py-4 align-middle text-sm font-medium text-[#f0f0f0]`}>{entry.totalTrades}</td>
      <td className={`border-b ${FA} px-6 py-4 align-middle text-sm font-medium text-[#f0f0f0]`}>{entry.accountCount}</td>
      <td className={`border-b ${FA} px-6 py-4 align-middle`}>
        <Link
          href={profileLink}
          className={`inline-flex items-center gap-2 rounded-full border ${FB} bg-transparent px-3.5 py-[5px] text-[13px] font-medium text-[#f0f0f0] transition-colors hover:bg-accent/55`}
          aria-label={`View ${entry.username} profile`}
        >
          View profile
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </td>
    </tr>
  )
}
