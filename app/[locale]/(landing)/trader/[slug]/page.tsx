import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import { BadgeV2 } from "@/components/ui/v2"
import { CardV2, CardV2Content, CardV2Title } from '@/components/ui/v2'
import { hasConfiguredDatabaseConnection, prisma } from '@/lib/prisma'
import { getFallbackLeaderboardEntryByUserId } from '../../leaderboard/data/leaderboard-query'

type TraderSnapshot = {
  username: string
  totalPnl: number
  totalTrades: number
  winRate?: number
  returnPct?: number
  topInstrument?: string | null
  avgDurationMinutes?: number
  demo: boolean
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function MetricCard({
  title,
  value,
  hint,
  tone = 'default',
}: {
  title: string
  value: string
  hint?: string
  tone?: 'default' | 'positive' | 'negative'
}) {
  const toneClass =
    tone === 'positive'
      ? 'text-emerald-400'
      : tone === 'negative'
        ? 'text-red-400'
        : 'text-foreground'

  return (
    <CardV2>
      <CardV2Title>{title}</CardV2Title>
      <CardV2Content>
        <div className={toneClass}>{value}</div>
        {hint ? <p className="mt-2 text-sm text-muted-foreground">{hint}</p> : null}
      </CardV2Content>
    </CardV2>
  )
}

async function getTraderSnapshot(slug: string): Promise<TraderSnapshot | null> {
  if (!hasConfiguredDatabaseConnection) {
    const fallbackEntry = getFallbackLeaderboardEntryByUserId(slug)
    if (!fallbackEntry) return null

    return {
      username: fallbackEntry.username,
      totalPnl: fallbackEntry.monthlyPnl,
      totalTrades: fallbackEntry.totalTrades,
      winRate: fallbackEntry.winRate,
      returnPct: fallbackEntry.returnPct,
      topInstrument: fallbackEntry.topInstrument,
      avgDurationMinutes: fallbackEntry.avgDurationMinutes,
      demo: true,
    }
  }

  const traderStats = await prisma.trade.aggregate({
    where: { userId: slug },
    _sum: { pnl: true },
    _count: { id: true },
  })

  return {
    username: slug,
    totalPnl: Number(traderStats._sum.pnl ?? 0),
    totalTrades: traderStats._count.id,
    demo: false,
  }
}

export default async function TraderProfilePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const snapshot = await getTraderSnapshot(slug)

  if (!snapshot) {
    return (
      <div className="min-h-screen bg-v2-bg-base">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="rounded-[1.8rem] border border-border/60 bg-card/70 p-8 shadow-[0_24px_90px_-70px_rgba(0,0,0,0.95)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Trader profile</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{slug}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                  This profile is not available yet. Once the trader has public stats or the database is connected, it will appear here.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/${locale}/leaderboard`}
                  className="rounded-full border border-border/60 bg-background/70 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
                >
                  Back to leaderboard
                </Link>
                <Link
                  href={`/${locale}/dashboard/trader-profile`}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
                >
                  Manage profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const positive = snapshot.totalPnl > 0
  const negative = snapshot.totalPnl < 0

  return (
    <div className="min-h-screen bg-v2-bg-base">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-[1.8rem] border border-border/60 bg-card/70 p-6 shadow-[0_24px_90px_-70px_rgba(0,0,0,0.95)] sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/images/trader-avatar-placeholder.png"
                alt="avatar"
                width={48}
                height={48}
                className="h-12 w-12 rounded-full"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-xl font-semibold text-foreground">Trader: {snapshot.username}</div>
                  {snapshot.demo ? (
                  <BadgeV2 variant="secondary" className="border border-primary/20 bg-primary/10 text-primary">
                    Demo profile preview
                  </BadgeV2>
                ) : null}
                </div>
                <div className="text-sm text-muted-foreground">Public profile</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/${locale}/leaderboard`}
                className="rounded-full border border-border/60 bg-background/70 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
              >
                Back to leaderboard
              </Link>
              <Link
                href={`/${locale}/dashboard/trader-profile`}
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
              >
                Manage profile
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <MetricCard title="Total Trades" value={snapshot.totalTrades.toLocaleString()} hint="Visible public trades" />
            <MetricCard
              title="Total Profit"
              value={`${positive ? '+' : ''}${formatCurrency(snapshot.totalPnl)}`}
              tone={positive ? 'positive' : negative ? 'negative' : 'default'}
              hint="Current public performance snapshot"
            />
          </div>

          {snapshot.demo ? (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <MetricCard title="Win Rate" value={`${snapshot.winRate?.toFixed(1) ?? '0.0'}%`} hint="Demo leaderboard data" />
              <MetricCard title="Return" value={`${snapshot.returnPct?.toFixed(1) ?? '0.0'}%`} hint="Demo leaderboard data" />
              <MetricCard title="Avg Duration" value={`${snapshot.avgDurationMinutes?.toFixed(0) ?? '0'}m`} hint={`Top instrument ${snapshot.topInstrument ?? 'N/A'}`} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
