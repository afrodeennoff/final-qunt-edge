'use client'

import Link from 'next/link'
import { useMemo, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Badge } from "@/components/ui/badge"
import { Activity, Shield, Trophy, Wallet } from 'lucide-react'
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
      <section className="rounded-3xl border border-border/60 bg-[linear-gradient(160deg,hsl(var(--card)/0.62),hsl(var(--background)/0.48))] p-8 text-center shadow-[0_24px_90px_-70px_hsl(0_0%_0%_/0.95)]">
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
    <div className="space-y-6">
      <section className="grid gap-6 rounded-3xl border border-border/60 bg-[linear-gradient(150deg,hsl(var(--card)/0.68),hsl(var(--background)/0.52))] p-5 shadow-[0_34px_110px_-72px_hsl(0_0%_0%_/0.95)] sm:p-6 lg:grid-cols-[1.05fr_0.95fr] lg:p-7">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Trophy className="h-3.5 w-3.5 text-primary" />
            Public rankings
          </div>
          <h2 className="mt-5 text-[clamp(2.2rem,5vw,4.5rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-foreground">
            Real traders. Real monthly performance.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            The board highlights opted-in traders using live production metrics, with enough depth to understand how they are actually performing, not just who had one lucky day.
          </p>
          {isDemoBoard ? (
            <Badge
              variant="secondary"
              className="mt-5 border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary"
            >
              <Shield className="mr-1.5 h-3.5 w-3.5" />
              Demo rankings shown until live accounts connect
            </Badge>
          ) : null}
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
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  currentSort === item.key
                    ? 'border-foreground/15 bg-foreground text-background'
                    : 'border-border bg-background/70 text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Want to change what shows on the board?{' '}
            <Link href={`/${locale}/dashboard/trader-profile`} className="font-medium text-foreground underline-offset-4 hover:underline">
              Open Trader Profile
            </Link>
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryCard label="Ranked traders" value={initialEntries.length.toString()} icon={Trophy} />
          <SummaryCard label="Combined PnL" value={formatCurrency(summary.totalPnl)} icon={Wallet} />
          <SummaryCard label="Average win rate" value={`${summary.avgWinRate}%`} icon={Activity} />
          <SummaryCard label="Trades logged" value={summary.totalTrades.toLocaleString()} icon={Shield} />
          <div className="sm:col-span-2 rounded-2xl border border-border/60 bg-background/70 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Methodology</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
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
    <div className="rounded-2xl border border-border/60 bg-[linear-gradient(150deg,hsl(var(--background)/0.86),hsl(var(--card)/0.52))] p-4">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  )
}
