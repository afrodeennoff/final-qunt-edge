import Link from 'next/link'
import React from 'react'
import type { Metadata } from 'next'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { hasConfiguredDatabaseConnection, prisma } from '@/lib/prisma'
import { getFallbackLeaderboardEntryByUserId } from '../../leaderboard/data/leaderboard-query'
import { Zap, Lock } from 'lucide-react'
import { buildPublicMetadata, buildBreadcrumbSchema, getCanonicalUrl } from '@/lib/seo'

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

function formatSigned(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "0.00"
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}`
}

function formatCapitalCompact(value: number): string {
  if (!Number.isFinite(value)) return "0"
  const sign = value < 0 ? "-" : ""
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}m`
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(abs >= 100_000 ? 0 : 1)}k`
  return `${sign}${abs.toFixed(0)}`
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatValue(value: number, digits = 2): string {
  return Number.isFinite(value) ? value.toFixed(digits) : "0.00"
}

async function getTraderSnapshot(slug: string): Promise<TraderSnapshot | null> {
  if (!hasConfiguredDatabaseConnection) {
    const fallbackEntry = await getFallbackLeaderboardEntryByUserId(slug)
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  return buildPublicMetadata({
    locale,
    path: `/trader/${slug}`,
    title: `${slug} — Trader Profile | Qunt Edge`,
    description: `View ${slug}'s trading performance, statistics, and public profile on Qunt Edge.`,
  })
}

export default async function TraderProfilePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const snapshot = await getTraderSnapshot(slug)

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: snapshot?.username ?? slug,
    url: getCanonicalUrl(locale, `/trader/${slug}`),
  }

  const breadcrumbSchema = buildBreadcrumbSchema(locale, [
    { name: "Leaderboard", path: "/leaderboard" },
    { name: slug, path: `/trader/${slug}` },
  ])

  if (!snapshot) {
    return (
      <div className="relative w-full min-h-[calc(100vh-72px)] overflow-hidden p-2.5 sm:p-3.5 lg:p-4">
        <div className="relative mx-auto w-full max-w-[1600px]">
          <Card className="border border-border/5 bg-card/[0.02] backdrop-blur-xl p-6 shadow-2xl transition-all duration-500 hover:border-border/10 hover:bg-card/[0.04] hover:-translate-y-1 hover:shadow-primary/5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-fg-muted">Trader profile</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{slug}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-fg-muted">
                  This profile is not available yet. Once the trader has public stats or the database is connected, it will appear here.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/${locale}/leaderboard`}
                  className="rounded-full border border-border/15 bg-card/5 px-4 py-2 text-sm font-medium text-fg-primary transition-all duration-300 hover:border-border/20 hover:bg-card/10"
                >
                  Back to leaderboard
                </Link>
                <Link
                  href={`/${locale}/dashboard/trader-profile`}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all duration-300 hover:opacity-90"
                >
                  Manage profile
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const positive = snapshot.totalPnl > 0
  const negative = snapshot.totalPnl < 0

  return (
    <div className="relative w-full min-h-[calc(100vh-72px)] overflow-hidden p-2.5 sm:p-3.5 lg:p-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([personSchema, breadcrumbSchema]) }}
      />
      <div className="relative mx-auto grid w-full max-w-[1600px] gap-3 sm:gap-4 xl:grid-cols-[1.35fr_1fr]">
        <section className="space-y-3 sm:space-y-4">
          <Card className="border border-border/5 bg-card/[0.02] backdrop-blur-xl p-3.5 shadow-2xl transition-all duration-500 hover:border-border/10 hover:bg-card/[0.04] hover:-translate-y-1 hover:shadow-primary/5">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20 border border-border/10 bg-card/5 shadow-xl ring-2 ring-border/5 transition-transform duration-500 hover:scale-105 hover:ring-primary/30">
                <AvatarFallback className="bg-card/10 text-xl font-semibold text-fg-primary">
                  {snapshot.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[2.25rem] font-bold leading-tight text-foreground">{snapshot.username}</p>
                <p className="mt-1 text-sm text-fg-muted">Public profile</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-border/15 bg-card/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-fg-primary">
                    <Zap className="h-3 w-3" />
                    Trader Profile
                  </span>
                  {snapshot.demo ? (
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                      Demo profile preview
                    </span>
                  ) : null}
                  <span className="inline-flex items-center rounded-md border border-border/15 bg-card/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-fg-primary">
                    Total Trades {snapshot.totalTrades}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 grid gap-1.5 sm:grid-cols-3">
              <div className="rounded-lg border border-border/5 bg-card/[0.01] backdrop-blur-sm shadow-inner transition-colors duration-300 hover:bg-card/[0.03] p-2.5">
                <p className="text-[10px] uppercase tracking-wider text-fg-muted">Total Trades</p>
                <p className="mt-1 text-lg font-semibold text-fg-primary">{snapshot.totalTrades.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-border/5 bg-card/[0.01] backdrop-blur-sm shadow-inner transition-colors duration-300 hover:bg-card/[0.03] p-2.5">
                <p className="text-[10px] uppercase tracking-wider text-fg-muted">Total PnL</p>
                <p className={`mt-1 text-lg font-semibold ${positive ? 'text-emerald-400' : negative ? 'text-red-400' : 'text-fg-primary'}`}>
                  {formatSigned(snapshot.totalPnl)}
                </p>
              </div>
              <div className="rounded-lg border border-border/5 bg-card/[0.01] backdrop-blur-sm shadow-inner transition-colors duration-300 hover:bg-card/[0.03] p-2.5">
                <p className="text-[10px] uppercase tracking-wider text-fg-muted">Profile Type</p>
                <p className="mt-1 text-lg font-semibold text-fg-primary">
                  {snapshot.demo ? 'Demo' : 'Live'}
                </p>
              </div>
            </div>
          </Card>

          <div className="grid gap-1.5 sm:grid-cols-2">
            <Card className="border border-border/5 bg-card/[0.02] backdrop-blur-xl p-3.5 shadow-xl transition-all duration-500 hover:border-border/10 hover:bg-card/[0.04] hover:-translate-y-1 hover:shadow-primary/5">
              <p className="text-[10px] uppercase tracking-wider text-fg-muted">Total Profit</p>
              <p className={`mt-1 text-2xl font-semibold ${positive ? 'text-emerald-400' : negative ? 'text-red-400' : 'text-fg-primary'}`}>
                {formatCurrency(snapshot.totalPnl)}
              </p>
              <p className="mt-2 text-xs text-fg-muted">Current public performance snapshot</p>
            </Card>

            <Card className="border border-border/5 bg-card/[0.02] backdrop-blur-xl p-3.5 shadow-xl transition-all duration-500 hover:border-border/10 hover:bg-card/[0.04] hover:-translate-y-1 hover:shadow-primary/5">
              <p className="text-[10px] uppercase tracking-wider text-fg-muted">Total Trades</p>
              <p className="mt-1 text-2xl font-semibold text-fg-primary">{snapshot.totalTrades.toLocaleString()}</p>
              <p className="mt-2 text-xs text-fg-muted">Visible public trades</p>
            </Card>
          </div>

          {snapshot.demo && snapshot.winRate !== undefined ? (
            <Card className="border border-border/5 bg-card/[0.02] backdrop-blur-xl p-3.5 shadow-2xl transition-all duration-500 hover:border-border/10 hover:bg-card/[0.04] hover:-translate-y-1 hover:shadow-primary/5">
              <div className="mb-2.5 flex items-center justify-between">
                <p className="text-sm font-semibold text-fg-primary">Demo Leaderboard Stats</p>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-border/15 bg-card/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-fg-primary">
                  <Lock className="h-3 w-3" />
                  Preview Data
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-lg border border-border/5 bg-card/[0.01] backdrop-blur-sm shadow-inner transition-colors duration-300 hover:bg-card/[0.03] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-fg-muted">Win Rate</p>
                  <p className="mt-1 text-3xl font-semibold text-fg-primary">{formatValue(snapshot.winRate)}%</p>
                  <div className="mt-3 h-2 rounded-full bg-card/10">
                    <div className="h-full rounded-full bg-card/35" style={{ width: `${Math.min(100, Math.max(8, snapshot.winRate))}%` }} />
                  </div>
                </div>

                {snapshot.returnPct !== undefined && (
                  <div className="rounded-lg border border-border/5 bg-card/[0.01] backdrop-blur-sm shadow-inner transition-colors duration-300 hover:bg-card/[0.03] p-3">
                    <p className="text-[10px] uppercase tracking-wider text-fg-muted">Return</p>
                    <p className={`mt-1 text-3xl font-semibold ${snapshot.returnPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatSigned(snapshot.returnPct)}%
                    </p>
                    <div className="mt-3 h-2 rounded-full bg-card/10">
                      <div className={`h-full rounded-full ${snapshot.returnPct >= 0 ? 'bg-emerald-400/35' : 'bg-red-400/35'}`} style={{ width: `${Math.min(100, Math.max(8, Math.abs(snapshot.returnPct)))}%` }} />
                    </div>
                  </div>
                )}

                {snapshot.topInstrument && (
                  <div className="rounded-lg border border-border/5 bg-card/[0.01] backdrop-blur-sm shadow-inner transition-colors duration-300 hover:bg-card/[0.03] p-3">
                    <p className="text-[10px] uppercase tracking-wider text-fg-muted">Top Instrument</p>
                    <p className="mt-1 text-3xl font-semibold text-fg-primary">{snapshot.topInstrument}</p>
                    {snapshot.avgDurationMinutes !== undefined && (
                      <p className="mt-2 text-xs text-fg-muted">
                        Avg Duration: {formatValue(snapshot.avgDurationMinutes, 0)}m
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/${locale}/leaderboard`}
              className="inline-flex items-center justify-center rounded-full border border-border/15 bg-card/5 px-6 py-2.5 text-sm font-semibold text-fg-primary transition-all duration-300 hover:border-border/20 hover:bg-card/10"
            >
              Back to leaderboard
            </Link>
            <Link
              href={`/${locale}/dashboard/trader-profile`}
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:opacity-90"
            >
              Manage profile
            </Link>
          </div>
        </section>

        <aside className="mx-auto w-full max-w-[430px] space-y-2 xl:max-w-none">
          <Card className="border border-border/5 bg-card/[0.02] backdrop-blur-xl p-3.5 shadow-2xl transition-all duration-500 hover:border-border/10 hover:bg-card/[0.04] hover:-translate-y-1 hover:shadow-primary/5">
            <div className="grid gap-2">
              <div className="rounded-lg border border-border/5 bg-card/[0.01] backdrop-blur-sm shadow-inner transition-colors duration-300 hover:bg-card/[0.03] p-3">
                <p className="text-[10px] uppercase tracking-wider text-fg-muted">Total Capital</p>
                <p className="mt-1 text-3xl font-semibold text-fg-primary">{formatCapitalCompact(snapshot.totalPnl)}</p>
              </div>
            </div>
          </Card>

          {snapshot.demo && snapshot.winRate !== undefined && (
            <Card className="border border-border/5 bg-card/[0.02] backdrop-blur-xl p-3.5 shadow-2xl transition-all duration-500 hover:border-border/10 hover:bg-card/[0.04] hover:-translate-y-1 hover:shadow-primary/5">
              <p className="text-[10px] uppercase tracking-wider text-fg-muted">Win Rate</p>
              <p className="mt-1 text-4xl font-semibold text-fg-primary">{formatValue(snapshot.winRate)}%</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="h-2 rounded-full bg-card/10">
                  <div className="h-full rounded-full bg-card/35" style={{ width: `${Math.min(100, Math.max(8, snapshot.winRate))}%` }} />
                </div>
                <div className="h-2 rounded-full bg-card/10">
                  <div className="h-full rounded-full bg-card/20" style={{ width: `${Math.min(100, Math.max(8, 100 - snapshot.winRate))}%` }} />
                </div>
              </div>
            </Card>
          )}

          <Card className="border border-border/5 bg-card/[0.02] backdrop-blur-xl p-3.5 shadow-2xl transition-all duration-500 hover:border-border/10 hover:bg-card/[0.04] hover:-translate-y-1 hover:shadow-primary/5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-wider text-fg-muted">Total Trades</p>
              <span className="inline-flex items-center rounded-md border border-border/20 bg-card/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-fg-primary">
                {snapshot.totalTrades > 100 ? 'Active Trader' : 'Growing'}
              </span>
            </div>
            <p className="mt-1 text-4xl font-semibold text-fg-primary">{snapshot.totalTrades}</p>
            <div className="mt-3 h-2 rounded-full bg-card/10">
              <div className="h-full rounded-full bg-card/35" style={{ width: `${Math.min(100, Math.max(8, snapshot.totalTrades))}%` }} />
            </div>
          </Card>

          <Card className="border border-border/5 bg-card/[0.02] backdrop-blur-xl p-3.5 shadow-2xl transition-all duration-500 hover:border-border/10 hover:bg-card/[0.04] hover:-translate-y-1 hover:shadow-primary/5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-wider text-fg-muted">Profile Status</p>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border/15 bg-card/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-fg-primary">
                <Lock className="h-3 w-3" />
                {snapshot.demo ? 'Demo' : 'Live'}
              </span>
            </div>
            <p className="mt-2 text-sm text-fg-muted">
              {snapshot.demo
                ? 'This is a demo profile with preview data from the leaderboard.'
                : 'Live trading profile with verified performance data.'}
            </p>
          </Card>
        </aside>
      </div>
    </div>
  )
}
