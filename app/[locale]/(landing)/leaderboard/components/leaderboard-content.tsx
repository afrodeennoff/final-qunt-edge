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

const FB = 'border-white/[0.08]'
const FS = 'bg-white/[0.040]'
const FR = { boxShadow: '0 1px 2px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.28), 0 20px 48px -8px rgba(0,0,0,0.85)' }

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

  /* ─── Empty state ─── */
  if (initialEntries.length === 0) {
    return (
      <div className={`rounded-2xl border ${FB} bg-black p-10 text-center`} style={FR}>
        <div className="mx-auto max-w-lg">
          <div className={`inline-flex items-center gap-2 rounded-full border ${FB} bg-transparent px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground`}>
            <Trophy className="h-3.5 w-3.5 text-orange-400" />
            Public rankings
          </div>
          <h2 className="mt-8 text-balance text-3xl font-semibold leading-[1.05] tracking-tight text-foreground/95">
            No public traders are ranked yet.
          </h2>
          <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">
            The leaderboard only shows traders who opted into public visibility. Check back after more traders publish live performance.
          </p>
        </div>
      </div>
    )
  }

  /* ─── Hero + Summary ─── */
  return (
    <div className="space-y-10">
      <section className={`rounded-2xl border ${FB} bg-black p-8 sm:p-10 lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:gap-10`} style={FR}>
        {/* Left — hero */}
        <div>
          <div className={`inline-flex items-center gap-2 rounded-full border ${FB} bg-transparent px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground`}>
            <Trophy className="h-3.5 w-3.5 text-orange-400" />
            Public rankings
          </div>
          <h2 className="mt-8 text-balance text-[clamp(2rem,4.5vw,3.75rem)] font-semibold leading-[1.05] tracking-tighter text-foreground/95">
            Real traders.<br />Real monthly performance.
          </h2>
          <p className="mt-5 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
            The board highlights opted-in traders using live production metrics — enough depth to understand how they are actually performing, not just who had one lucky day.
          </p>
          {isDemoBoard ? (
            <div className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/22 bg-emerald-500/8 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-400">
              <Shield className="mr-1 h-3 w-3" />
              Demo rankings shown until live accounts connect
            </div>
          ) : null}

          {/* Sort pills */}
          <div className="mt-8 flex flex-wrap gap-2">
            {([
              { key: 'monthly_pnl', label: 'Rank by PnL' },
              { key: 'winrate', label: 'Rank by win rate' },
              { key: 'totalTrades', label: 'Rank by trade count' },
            ] as const).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => updateSort(item.key)}
                className={`rounded-full border px-4 py-[5px] text-[13px] font-medium transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  currentSort === item.key
                    ? 'border-transparent bg-foreground/95 text-background shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28)]'
                    : `${FB} bg-transparent text-muted-foreground hover:bg-accent/55 hover:text-foreground/95`
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="mt-6 text-[13px] text-muted-foreground/70">
            Want to change what shows on the board?{' '}
            <Link href={`/${locale}/dashboard/trader-profile`} className="font-medium text-blue-400 hover:underline underline-offset-4">
              Open Trader Profile
            </Link>
          </p>
        </div>

        {/* Right — summary cards */}
        <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:mt-0">
          <SummaryCard label="Ranked traders" value={initialEntries.length.toString()} icon={Trophy} accent="orange" />
          <SummaryCard label="Combined PnL" value={formatCurrency(summary.totalPnl)} icon={Wallet} accent="green" />
          <SummaryCard label="Average win rate" value={`${summary.avgWinRate}%`} icon={Activity} accent="blue" />
          <SummaryCard label="Trades logged" value={summary.totalTrades.toLocaleString()} icon={Shield} accent="orange" />
          <div className={`sm:col-span-2 rounded-xl border ${FB} ${FS} p-4`} style={FR}>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">Methodology</p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
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

/* ─── Helpers ─── */

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

const ACCENT = {
  orange: { bg: 'bg-orange-500/8', border: 'border-orange-500/22', text: 'text-orange-400', dot: 'bg-orange-500/22' },
  green:  { bg: 'bg-emerald-500/6',  border: 'border-emerald-500/18', text: 'text-emerald-400', dot: 'bg-emerald-500/18' },
  blue:   { bg: 'bg-blue-500/8',  border: 'border-blue-500/20',  text: 'text-blue-400', dot: 'bg-blue-500/20' },
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
  accent: keyof typeof ACCENT
}) {
  const a = ACCENT[accent]
  return (
    <div className={`rounded-xl border ${a.border} ${a.bg} p-4`} style={FR}>
      <div className={`inline-flex h-6 w-6 items-center justify-center rounded-md ${a.dot}`}>
        <Icon className={`h-3 w-3 ${a.text}`} />
      </div>
      <p className="mt-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground/70">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tracking-tight ${a.text}`}>{value}</p>
    </div>
  )
}
