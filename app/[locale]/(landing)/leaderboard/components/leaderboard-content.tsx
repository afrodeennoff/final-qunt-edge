'use client'

import Link from 'next/link'
import { useMemo, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Trophy, Wallet, Activity, Shield } from 'lucide-react'
import { LeaderboardTable, LeaderboardTableSkeleton } from './leaderboard-table'
import type { LeaderboardEntry, LeaderboardSort } from '../data/leaderboard-query'

interface LeaderboardContentProps {
  initialEntries: LeaderboardEntry[]
  locale: string
}

export function LeaderboardContent({ initialEntries, locale }: LeaderboardContentProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const currentSort = (searchParams.get('sort') ?? 'monthly_pnl') as LeaderboardSort
  const isDemoBoard = initialEntries.every((entry) => entry.userId.startsWith('demo-'))

  const summary = useMemo(() => {
    const totalPnl = initialEntries.reduce((sum, entry) => sum + entry.monthlyPnl, 0)
    const totalTrades = initialEntries.reduce((sum, entry) => sum + entry.totalTrades, 0)
    const avgWinRate =
      initialEntries.length > 0
        ? Math.round((initialEntries.reduce((sum, entry) => sum + entry.winRate, 0) / initialEntries.length) * 10) / 10
        : 0

    return { totalPnl, totalTrades, avgWinRate }
  }, [initialEntries])

  const updateSort = (sort: LeaderboardSort) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (sort === 'monthly_pnl') {
        params.delete('sort')
      } else {
        params.set('sort', sort)
      }
      router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname)
    })
  }

  if (initialEntries.length === 0) {
    return (
      <section className="rs-frost-ring rounded-3xl border rs-frost-border bg-background p-8 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border rs-frost-border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] rs-text-secondary">
            <Trophy className="h-3.5 w-3.5 rs-accent-orange" />
            Public rankings
          </div>
          <h2 className="mt-6 text-[2rem] font-semibold leading-[1.1] tracking-[-0.03em] rs-text-strong">
            No public traders are ranked yet.
          </h2>
          <p className="mt-4 text-[15px] leading-[1.6] rs-text-secondary">
            The leaderboard only shows traders who opted into public visibility. Check back after more traders publish live performance.
          </p>
        </div>
      </section>
    )
  }

  return (
    <div className="space-y-8">
      <section className="rs-frost-ring grid gap-8 rounded-3xl border rs-frost-border bg-background p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border rs-frost-border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] rs-text-secondary">
            <Trophy className="h-3.5 w-3.5 rs-accent-orange" />
            Public rankings
          </div>
          <h2 className="mt-6 text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.04em] rs-text-strong">
            Real traders. Real monthly performance.
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-[1.6] rs-text-secondary">
            The board highlights opted-in traders using live production metrics, with enough depth to understand how they are actually performing, not just who had one lucky day.
          </p>
          {isDemoBoard ? (
            <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border rs-border-green rs-bg-green px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] rs-accent-green">
              <Shield className="mr-1 h-3 w-3" />
              Demo rankings shown until live accounts connect
            </div>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-2">
            {([
              { key: 'monthly_pnl', label: 'Rank by PnL' },
              { key: 'winrate', label: 'Rank by win rate' },
              { key: 'totalTrades', label: 'Rank by trade count' },
            ] as const).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => updateSort(item.key)}
                className={`rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors ${
                  currentSort === item.key
                    ? 'border-foreground/25 bg-foreground text-background'
                    : 'rs-frost-border bg-transparent rs-text-secondary hover:bg-foreground/8 hover:rs-text-strong'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="mt-5 text-[13px] leading-[1.5] rs-text-tertiary">
            Want to change what shows on the board?{' '}
            <Link href={`/${locale}/dashboard/trader-profile`} className="font-medium rs-accent-blue hover:underline underline-offset-4">
              Open Trader Profile
            </Link>
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryCard label="Ranked traders" value={initialEntries.length.toString()} icon={Trophy} accent="blue" />
          <SummaryCard label="Combined PnL" value={formatCurrency(summary.totalPnl)} icon={Wallet} accent="green" />
          <SummaryCard label="Average win rate" value={`${summary.avgWinRate}%`} icon={Activity} accent="orange" />
          <SummaryCard label="Trades logged" value={summary.totalTrades.toLocaleString()} icon={Shield} accent="blue" />
          <div className="rs-frost-ring sm:col-span-2 rounded-2xl border rs-frost-border rs-frost-surface p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] rs-text-tertiary">Methodology</p>
            <p className="mt-2 text-[13px] leading-[1.6] rs-text-secondary">
              Rankings are based on public opt-in accounts and the current month&apos;s trade data. Sort changes recalculate only the ordering, not the underlying dataset.
            </p>
          </div>
        </div>
      </section>

      {isPending ? (
        <LeaderboardTableSkeleton />
      ) : (
        <LeaderboardTable entries={initialEntries} locale={locale} isLoading={isPending} />
      )}
    </div>
  )
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

const accentMap = {
  blue: { bg: 'rs-bg-blue', border: 'rs-border-blue', text: 'rs-accent-blue', iconBg: 'bg-primary/12' },
  green: { bg: 'rs-bg-green', border: 'rs-border-green', text: 'rs-accent-green', iconBg: 'rs-bg-green' },
  orange: { bg: 'rs-bg-orange', border: 'rs-border-orange', text: 'rs-accent-orange', iconBg: 'rs-bg-orange' },
} as const

function SummaryCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  icon: typeof Trophy
  accent: keyof typeof accentMap
}) {
  const style = accentMap[accent]
  return (
    <div className={`rs-frost-ring rounded-2xl border ${style.border} ${style.bg} p-4`}>
      <div className={`inline-flex h-6 w-6 items-center justify-center rounded-md ${style.iconBg}`}>
        <Icon className={`h-3.5 w-3.5 ${style.text}`} />
      </div>
      <p className="mt-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] rs-text-tertiary">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tracking-tight ${style.text}`}>{value}</p>
    </div>
  )
}