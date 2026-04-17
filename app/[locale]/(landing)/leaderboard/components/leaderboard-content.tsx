'use client'

import Link from 'next/link'
import { useMemo, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
<<<<<<< HEAD
import { Activity, Shield, Trophy, Wallet } from 'lucide-react'
=======
import { Trophy, Wallet, Activity, Shield } from 'lucide-react'
>>>>>>> origin/main
import { LeaderboardTable, LeaderboardTableSkeleton } from './leaderboard-table'
import type { LeaderboardEntry, LeaderboardSort } from '../data/leaderboard-query'
import {
  unifiedChipClassName,
  unifiedGhostActionClassName,
  unifiedHeroPanelClassName,
  unifiedInsetPanelClassName,
  unifiedMetricPanelClassName,
  unifiedSectionPanelClassName,
} from '@/components/layout/unified-page-recipes'
import { cn } from '@/lib/utils'

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
        ? Math.round(
            (initialEntries.reduce((sum, entry) => sum + entry.winRate, 0) /
              initialEntries.length) *
              10,
          ) / 10
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
<<<<<<< HEAD
      <section
        className={cn(unifiedHeroPanelClassName, 'animate-fade-up-smooth p-8 text-center sm:p-10')}
      >
        <div className="mx-auto max-w-lg">
          <div className={cn(unifiedChipClassName, 'justify-center')}>
            <Trophy className="h-3.5 w-3.5" />
            Public rankings
          </div>
          <h2 className="mt-8 text-balance text-3xl font-semibold leading-[1.05] tracking-tight text-foreground/95">
            No public traders are ranked yet.
          </h2>
          <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">
            The leaderboard only shows traders who opted into public visibility. Check back after
            more traders publish live performance.
=======
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
>>>>>>> origin/main
          </p>
        </div>
      </div>
    )
  }

  /* ─── Hero + Summary ─── */
  return (
<<<<<<< HEAD
    <div className="space-y-6">
      <section
        className={cn(unifiedHeroPanelClassName, 'animate-fade-up-smooth p-6 sm:p-8 lg:p-10')}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(760px_280px_at_12%_6%,rgba(255,255,255,0.08),transparent_72%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(620px_220px_at_88%_10%,rgba(255,255,255,0.04),transparent_72%)]" />

        <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          <div>
            <div className={unifiedChipClassName}>
              <Trophy className="h-3.5 w-3.5" />
              Public rankings
            </div>
            <h2 className="mt-8 text-balance text-[clamp(2rem,4.5vw,3.75rem)] font-semibold leading-[1.05] tracking-tighter text-foreground/95">
              Real traders.
              <br />
              Real monthly performance.
            </h2>
            <p className="mt-5 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
              The board highlights opted-in traders using live production metrics, with enough depth
              to understand how they are actually performing instead of who had one lucky day.
=======
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
>>>>>>> origin/main
            </p>
            {isDemoBoard ? (
              <div className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/22 bg-emerald-500/8 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-400">
                <Shield className="mr-1 h-3 w-3" />
                Demo rankings shown until live accounts connect
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-2">
              {(
                [
                  { key: 'monthly_pnl', label: 'Rank by PnL' },
                  { key: 'winrate', label: 'Rank by win rate' },
                  { key: 'totalTrades', label: 'Rank by trade count' },
                ] as const
              ).map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => updateSort(item.key)}
                  className={cn(
                    currentSort === item.key
                      ? 'inline-flex items-center justify-center rounded-full border border-primary/24 bg-primary/12 px-4 py-2 text-[13px] font-semibold text-foreground shadow-[0_16px_28px_-20px_hsl(var(--primary)/0.75)]'
                      : unifiedGhostActionClassName,
                    'px-4 py-2 text-[13px]',
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <p className="mt-6 text-[13px] text-muted-foreground/80">
              Want to change what shows on the board?{' '}
              <Link
                href={`/${locale}/dashboard/trader-profile`}
                className="font-medium text-primary hover:underline underline-offset-4"
              >
                Open Trader Profile
              </Link>
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryCard
              label="Ranked traders"
              value={initialEntries.length.toString()}
              icon={Trophy}
              accent="orange"
              className="animate-scale-reveal animate-scale-reveal-d1"
            />
            <SummaryCard
              label="Combined PnL"
              value={formatCurrency(summary.totalPnl)}
              icon={Wallet}
              accent="green"
              className="animate-scale-reveal animate-scale-reveal-d2"
            />
            <SummaryCard
              label="Average win rate"
              value={`${summary.avgWinRate}%`}
              icon={Activity}
              accent="blue"
              className="animate-scale-reveal animate-scale-reveal-d2"
            />
            <SummaryCard
              label="Trades logged"
              value={summary.totalTrades.toLocaleString()}
              icon={Shield}
              accent="orange"
              className="animate-scale-reveal animate-scale-reveal-d3"
            />
            <div
              className={cn(
                unifiedInsetPanelClassName,
                'animate-scale-reveal animate-scale-reveal-d3 p-4 sm:col-span-2',
              )}
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
                Methodology
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                Rankings are based on public opt-in accounts and the current month&apos;s trade
                data. Sort changes recalculate only the ordering, not the underlying dataset.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className={cn(
          unifiedSectionPanelClassName,
          'animate-fade-up-smooth animate-fade-up-smooth-d2 p-3 sm:p-4',
        )}
      >
        {isPending ? (
          <LeaderboardTableSkeleton />
        ) : (
          <LeaderboardTable entries={initialEntries} locale={locale} isLoading={isPending} />
        )}
      </section>
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
<<<<<<< HEAD
  orange: {
    icon: 'text-orange-400',
    badge: 'border-orange-500/22 bg-orange-500/10',
    text: 'text-orange-400',
  },
  green: {
    icon: 'text-emerald-400',
    badge: 'border-emerald-500/18 bg-emerald-500/8',
    text: 'text-emerald-400',
  },
  blue: {
    icon: 'text-blue-400',
    badge: 'border-blue-500/20 bg-blue-500/10',
    text: 'text-blue-400',
  },
=======
  orange: { bg: 'bg-[rgba(255,128,31,0.08)]', border: 'border-[rgba(255,128,31,0.22)]', text: 'text-[#ff801f]', dot: 'bg-[rgba(255,128,31,0.22)]' },
  green:  { bg: 'bg-[rgba(17,255,153,0.06)]',  border: 'border-[rgba(17,255,153,0.18)]', text: 'text-[#11ff99]', dot: 'bg-[rgba(17,255,153,0.18)]' },
  blue:   { bg: 'bg-[rgba(59,158,255,0.08)]',  border: 'border-[rgba(59,158,255,0.2)]',  text: 'text-[#3b9eff]', dot: 'bg-[rgba(59,158,255,0.2)]' },
>>>>>>> origin/main
} as const

function SummaryCard({
  label,
  value,
  icon: Icon,
  accent,
<<<<<<< HEAD
  className,
=======
>>>>>>> origin/main
}: {
  label: string
  value: string
  icon: typeof Trophy
  accent: keyof typeof ACCENT
<<<<<<< HEAD
  className?: string
}) {
  const a = ACCENT[accent]
  return (
    <div className={cn(unifiedMetricPanelClassName, className)}>
      <div
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-2xl border',
          a.badge,
        )}
      >
        <Icon className={cn('h-4 w-4', a.icon)} />
      </div>
      <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground/70">
        {label}
      </p>
      <p className={cn('mt-1 text-2xl font-semibold tracking-tight', a.text)}>{value}</p>
=======
}) {
  const a = ACCENT[accent]
  return (
    <div className={`rounded-2xl border ${a.border} ${a.bg} p-4`} style={FR}>
      <div className={`inline-flex h-6 w-6 items-center justify-center rounded-md ${a.dot}`}>
        <Icon className={`h-3 w-3 ${a.text}`} />
      </div>
      <p className="mt-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[#7a7a7a]">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tracking-[-0.02em] ${a.text}`}>{value}</p>
>>>>>>> origin/main
    </div>
  )
}
