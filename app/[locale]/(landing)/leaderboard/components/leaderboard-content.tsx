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

const FB = 'border-[hsl(var(--border)/0.36)]'
const FS = 'bg-[hsl(var(--card)/0.34)]'
const FR = { boxShadow: '0 24px 48px -32px rgba(0, 0, 0, 0.72)' }

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
      <div className={`rounded-3xl border ${FB} bg-black p-10 text-center`} style={FR}>
        <div className="mx-auto max-w-lg">
          <div className={`inline-flex items-center gap-2 rounded-full border ${FB} bg-transparent px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#a1a4a5]`}>
            <Trophy className="h-3.5 w-3.5 text-[#ff801f]" />
            Public rankings
          </div>
          <h2 className="mt-8 text-3xl font-semibold leading-[1.05] tracking-[-0.04em] text-[#f0f0f0]">
            No public traders are ranked yet.
          </h2>
          <p className="mt-4 text-[14px] leading-[1.6] text-[#a1a4a5]">
            The leaderboard only shows traders who opted into public visibility. Check back after more traders publish live performance.
          </p>
        </div>
      </div>
    )
  }

  /* ─── Hero + Summary ─── */
  return (
    <div className="space-y-10">
      <section className={`rounded-3xl border ${FB} bg-black p-8 sm:p-10 lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:gap-10`} style={FR}>
        {/* Left — hero */}
        <div>
          <div className={`inline-flex items-center gap-2 rounded-full border ${FB} bg-transparent px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#a1a4a5]`}>
            <Trophy className="h-3.5 w-3.5 text-[#ff801f]" />
            Public rankings
          </div>
          <h2 className="mt-8 text-[clamp(2rem,4.5vw,3.75rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-[#f0f0f0]">
            Real traders.<br />Real monthly performance.
          </h2>
          <p className="mt-5 max-w-xl text-[14px] leading-[1.6] text-[#a1a4a5]">
            The board highlights opted-in traders using live production metrics — enough depth to understand how they are actually performing, not just who had one lucky day.
          </p>
          {isDemoBoard ? (
            <div className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-[rgba(17,255,153,0.22)] bg-[rgba(17,255,153,0.08)] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[#11ff99]">
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
                className={`rounded-full border px-4 py-[5px] text-[13px] font-medium transition-colors ${
                  currentSort === item.key
                    ? 'border-transparent bg-[#f0f0f0] text-[#000000] shadow-[0_18px_34px_-26px_rgba(0,0,0,0.78)]'
                    : `${FB} bg-transparent text-[#a1a4a5] hover:bg-accent/55 hover:text-[#f0f0f0]`
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="mt-6 text-[13px] text-[#7a7a7a]">
            Want to change what shows on the board?{' '}
            <Link href={`/${locale}/dashboard/trader-profile`} className="font-medium text-[#3b9eff] hover:underline underline-offset-4">
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
          <div className={`sm:col-span-2 rounded-2xl border ${FB} ${FS} p-4`} style={FR}>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#7a7a7a]">Methodology</p>
            <p className="mt-2 text-[13px] leading-[1.6] text-[#a1a4a5]">
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
  orange: { bg: 'bg-[rgba(255,128,31,0.08)]', border: 'border-[rgba(255,128,31,0.22)]', text: 'text-[#ff801f]', dot: 'bg-[rgba(255,128,31,0.22)]' },
  green:  { bg: 'bg-[rgba(17,255,153,0.06)]',  border: 'border-[rgba(17,255,153,0.18)]', text: 'text-[#11ff99]', dot: 'bg-[rgba(17,255,153,0.18)]' },
  blue:   { bg: 'bg-[rgba(59,158,255,0.08)]',  border: 'border-[rgba(59,158,255,0.2)]',  text: 'text-[#3b9eff]', dot: 'bg-[rgba(59,158,255,0.2)]' },
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
    <div className={`rounded-2xl border ${a.border} ${a.bg} p-4`} style={FR}>
      <div className={`inline-flex h-6 w-6 items-center justify-center rounded-md ${a.dot}`}>
        <Icon className={`h-3 w-3 ${a.text}`} />
      </div>
      <p className="mt-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[#7a7a7a]">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tracking-[-0.02em] ${a.text}`}>{value}</p>
    </div>
  )
}
