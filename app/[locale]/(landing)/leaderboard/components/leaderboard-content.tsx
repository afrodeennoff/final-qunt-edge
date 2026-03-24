'use client'

import Link from 'next/link'
import { useMemo, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Activity, ArrowUpRight, Shield, Trophy, Wallet } from 'lucide-react'
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
  const topThree = initialEntries.slice(0, 3)
  const remainingEntries = initialEntries.slice(3)

  const summary = useMemo(() => {
    const totalPnl = initialEntries.reduce((sum, entry) => sum + entry.monthlyPnl, 0)
    const totalTrades = initialEntries.reduce((sum, entry) => sum + entry.totalTrades, 0)
    const avgWinRate = initialEntries.length > 0
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
      <section className="rounded-[1.8rem] border border-border/60 bg-card/45 p-8 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Trophy className="h-3.5 w-3.5 text-primary" />
            Public rankings
          </div>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-foreground">No public traders are ranked yet.</h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            The leaderboard only shows traders who opted into public visibility. Check back after more traders publish live performance.
          </p>
        </div>
      </section>
    )
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 rounded-[2rem] border border-border/60 bg-card/50 p-6 lg:grid-cols-[1.05fr_0.95fr] lg:p-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Trophy className="h-3.5 w-3.5 text-primary" />
            Public rankings
          </div>
          <h2 className="mt-5 text-[clamp(2.2rem,5vw,4.6rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-foreground">
            Real traders. Real monthly performance.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            The board highlights opted-in traders using live production metrics, with enough depth to understand how they are actually performing, not just who had one lucky day.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {([
              { key: 'monthly_pnl', label: 'Rank by PnL' },
              { key: 'winrate', label: 'Rank by win rate' },
              { key: 'totalTrades', label: 'Rank by trade count' },
            ] as const).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => updateSort(item.key)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  currentSort === item.key
                    ? 'border-foreground/15 bg-foreground text-background'
                    : 'border-border bg-background/70 text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryCard label="Ranked traders" value={initialEntries.length.toString()} icon={Trophy} />
          <SummaryCard label="Combined PnL" value={formatCurrency(summary.totalPnl)} icon={Wallet} />
          <SummaryCard label="Average win rate" value={`${summary.avgWinRate}%`} icon={Activity} />
          <SummaryCard label="Trades logged" value={summary.totalTrades.toLocaleString()} icon={Shield} />
          <div className="sm:col-span-2 rounded-[1.4rem] border border-border/60 bg-background/75 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Methodology</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Rankings are based on public opt-in accounts and the current month&apos;s trade data. Sort changes recalculate only the ordering, not the underlying dataset.
            </p>
          </div>
        </div>
      </section>

      {topThree.length > 0 ? (
        <section className="rounded-[1.8rem] border border-border/60 bg-card/45 p-5 sm:p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Podium</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">The leaders this month</h3>
            </div>
            <p className="text-sm text-muted-foreground">Sorted by {labelForSort(currentSort).toLowerCase()}</p>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {topThree.map((entry) => (
              <PodiumCard key={entry.userId} entry={entry} locale={locale} />
            ))}
          </div>
          {remainingEntries.length === 0 ? (
            <div className="mt-5 rounded-[1.3rem] border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
              All currently ranked traders are already shown in the podium above.
            </div>
          ) : null}
        </section>
      ) : null}

      {isPending && remainingEntries.length > 0 ? (
        <LeaderboardTableSkeleton />
      ) : remainingEntries.length > 0 ? (
        <LeaderboardTable entries={remainingEntries} locale={locale} isLoading={isPending} />
      ) : null}
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

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: typeof Trophy
}) {
  return (
    <div className="rounded-[1.4rem] border border-border/60 bg-background/75 p-4">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  )
}

function PodiumCard({ entry, locale }: { entry: LeaderboardEntry; locale: string }) {
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
        <div className="rounded-full border border-border/60 bg-card px-3 py-2 text-sm font-semibold text-foreground">
          {entry.winRate}%
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Metric label="Monthly PnL" value={formatCurrency(entry.monthlyPnl)} />
        <Metric label="Return" value={`${entry.returnPct}%`} />
        <Metric label="Top instrument" value={entry.topInstrument ?? 'N/A'} />
        <Metric label="Trades" value={entry.totalTrades.toString()} />
      </div>

      <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-foreground">
        Open profile
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Link>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] border border-border/60 bg-card/65 p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}

function labelForSort(sort: LeaderboardSort): string {
  if (sort === 'winrate') return 'Win Rate'
  if (sort === 'totalTrades') return 'Trade Count'
  return 'Monthly PnL'
}
