import Link from 'next/link'
import React from 'react'
import type { Metadata } from 'next'
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
      <div className="min-h-[calc(100vh-72px)] bg-background px-6 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1200px]">
          <div className="rs-frost-ring rounded-3xl border rs-frost-border bg-background p-8">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] rs-text-tertiary">Trader profile</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] rs-text-strong">{slug}</h1>
                <p className="mt-3 max-w-xl text-[14px] leading-[1.6] rs-text-secondary">
                  This profile is not available yet. Once the trader has public stats or the database is connected, it will appear here.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/${locale}/leaderboard`}
                  className="rs-frost-hover rounded-full border rs-frost-border bg-transparent px-4 py-2 text-[13px] font-medium rs-text-strong transition-colors"
                >
                  Back to leaderboard
                </Link>
                <Link
                  href={`/${locale}/dashboard/trader-profile`}
                  className="rounded-full bg-foreground px-4 py-2 text-[13px] font-semibold text-background transition-opacity hover:opacity-90"
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
    <div className="min-h-[calc(100vh-72px)] bg-background px-6 py-16 sm:px-8 lg:px-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([personSchema, breadcrumbSchema]) }}
      />
      <div className="mx-auto grid max-w-[1200px] gap-6 xl:grid-cols-[1.35fr_1fr]">
        <section className="space-y-6">
          <div className="rs-frost-ring rounded-3xl border rs-frost-border bg-background p-6 sm:p-8">
            <div className="flex items-start gap-5">
              <Avatar className="h-20 w-20 border rs-frost-border rs-frost-surface rs-frost-ring">
                <AvatarFallback className="rs-frost-surface text-lg font-semibold rs-text-strong">
                  {snapshot.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[2rem] font-semibold leading-[1.1] tracking-[-0.03em] rs-text-strong">{snapshot.username}</p>
                <p className="mt-1 text-[13px] rs-text-secondary">Public profile</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border rs-border-blue rs-bg-blue px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] rs-accent-blue">
                    <Zap className="h-3 w-3" />
                    Trader Profile
                  </span>
                  {snapshot.demo ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border rs-border-green rs-bg-green px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] rs-accent-green">
                      Demo profile preview
                    </span>
                  ) : null}
                  <span className="inline-flex items-center rounded-full border rs-frost-border rs-frost-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] rs-text-secondary">
                    {snapshot.totalTrades} Trades
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rs-frost-ring rounded-xl border rs-frost-border rs-frost-surface p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] rs-text-tertiary">Total Trades</p>
                <p className="mt-2 text-xl font-semibold rs-text-strong">{snapshot.totalTrades.toLocaleString()}</p>
              </div>
              <div className="rs-frost-ring rounded-xl border rs-frost-border rs-frost-surface p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] rs-text-tertiary">Total PnL</p>
                <p className={`mt-2 text-xl font-semibold ${positive ? 'rs-accent-green' : negative ? 'rs-accent-red' : 'rs-text-strong'}`}>
                  {formatSigned(snapshot.totalPnl)}
                </p>
              </div>
              <div className="rs-frost-ring rounded-xl border rs-frost-border rs-frost-surface p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] rs-text-tertiary">Profile Type</p>
                <p className="mt-2 text-xl font-semibold rs-text-strong">
                  {snapshot.demo ? 'Demo' : 'Live'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rs-frost-ring rounded-2xl border rs-frost-border bg-background p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] rs-text-tertiary">Total Profit</p>
              <p className={`mt-2 text-2xl font-semibold tracking-[-0.02em] ${positive ? 'rs-accent-green' : negative ? 'rs-accent-red' : 'rs-text-strong'}`}>
                {formatCurrency(snapshot.totalPnl)}
              </p>
              <p className="mt-2 text-[12px] rs-text-tertiary">Current public performance snapshot</p>
            </div>

            <div className="rs-frost-ring rounded-2xl border rs-frost-border bg-background p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] rs-text-tertiary">Total Trades</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.02em] rs-text-strong">{snapshot.totalTrades.toLocaleString()}</p>
              <p className="mt-2 text-[12px] rs-text-tertiary">Visible public trades</p>
            </div>
          </div>

          {snapshot.demo && snapshot.winRate !== undefined ? (
            <div className="rs-frost-ring rounded-2xl border rs-frost-border bg-background p-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[14px] font-semibold rs-text-strong">Demo Leaderboard Stats</p>
                <span className="inline-flex items-center gap-1.5 rounded-full border rs-frost-border rs-frost-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] rs-text-secondary">
                  <Lock className="h-3 w-3" />
                  Preview Data
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rs-frost-ring rounded-xl border rs-frost-border rs-frost-surface p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] rs-text-tertiary">Win Rate</p>
                  <p className="mt-2 text-3xl font-semibold rs-text-strong">{formatValue(snapshot.winRate)}%</p>
                  <div className="mt-3 h-1.5 rounded-full bg-primary/8">
                    <div className="h-full rounded-full bg-primary/40" style={{ width: `${Math.min(100, Math.max(8, snapshot.winRate))}%` }} />
                  </div>
                </div>

                {snapshot.returnPct !== undefined && (
                  <div className="rs-frost-ring rounded-xl border rs-frost-border rs-frost-surface p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] rs-text-tertiary">Return</p>
                    <p className={`mt-2 text-3xl font-semibold ${snapshot.returnPct >= 0 ? 'rs-accent-green' : 'rs-accent-red'}`}>
                      {formatSigned(snapshot.returnPct)}%
                    </p>
                    <div className="mt-3 h-1.5 rounded-full bg-primary/8">
                      <div className={`h-full rounded-full ${snapshot.returnPct >= 0 ? 'bg-[var(--rs-accent-green)]/35' : 'bg-[var(--rs-accent-red)]/35'}`} style={{ width: `${Math.min(100, Math.max(8, Math.abs(snapshot.returnPct)))}%` }} />
                    </div>
                  </div>
                )}

                {snapshot.topInstrument && (
                  <div className="rs-frost-ring rounded-xl border rs-frost-border rs-frost-surface p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] rs-text-tertiary">Top Instrument</p>
                    <p className="mt-2 text-3xl font-semibold rs-text-strong">{snapshot.topInstrument}</p>
                    {snapshot.avgDurationMinutes !== undefined && (
                      <p className="mt-2 text-[12px] rs-text-tertiary">
                        Avg Duration: {formatValue(snapshot.avgDurationMinutes, 0)}m
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${locale}/leaderboard`}
              className="rs-frost-hover inline-flex items-center justify-center rounded-full border rs-frost-border bg-transparent px-5 py-2.5 text-[13px] font-medium rs-text-strong transition-colors"
            >
              Back to leaderboard
            </Link>
            <Link
              href={`/${locale}/dashboard/trader-profile`}
              className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-[13px] font-semibold text-background transition-opacity hover:opacity-90"
            >
              Manage profile
            </Link>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rs-frost-ring rounded-2xl border rs-frost-border bg-background p-5">
            <div className="rs-frost-ring rounded-xl border rs-frost-border rs-frost-surface p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] rs-text-tertiary">Total Capital</p>
              <p className="mt-2 text-3xl font-semibold rs-text-strong">{formatCapitalCompact(snapshot.totalPnl)}</p>
            </div>
          </div>

          {snapshot.demo && snapshot.winRate !== undefined && (
            <div className="rs-frost-ring rounded-2xl border rs-frost-border bg-background p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] rs-text-tertiary">Win Rate</p>
              <p className="mt-2 text-4xl font-semibold rs-text-strong">{formatValue(snapshot.winRate)}%</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="h-1.5 rounded-full bg-primary/8">
                  <div className="h-full rounded-full bg-primary/40" style={{ width: `${Math.min(100, Math.max(8, snapshot.winRate))}%` }} />
                </div>
                <div className="h-1.5 rounded-full bg-primary/8">
                  <div className="h-full rounded-full bg-primary/12" style={{ width: `${Math.min(100, Math.max(8, 100 - snapshot.winRate))}%` }} />
                </div>
              </div>
            </div>
          )}

          <div className="rs-frost-ring rounded-2xl border rs-frost-border bg-background p-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] rs-text-tertiary">Total Trades</p>
              <span className="inline-flex items-center rounded-full border rs-frost-border rs-frost-surface px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] rs-text-secondary">
                {snapshot.totalTrades > 100 ? 'Active Trader' : 'Growing'}
              </span>
            </div>
            <p className="mt-2 text-4xl font-semibold rs-text-strong">{snapshot.totalTrades}</p>
            <div className="mt-3 h-1.5 rounded-full bg-primary/8">
              <div className="h-full rounded-full bg-primary/40" style={{ width: `${Math.min(100, Math.max(8, snapshot.totalTrades))}%` }} />
            </div>
          </div>

          <div className="rs-frost-ring rounded-2xl border rs-frost-border bg-background p-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] rs-text-tertiary">Profile Status</p>
              <span className="inline-flex items-center gap-1.5 rounded-full border rs-frost-border rs-frost-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] rs-text-secondary">
                <Lock className="h-3 w-3" />
                {snapshot.demo ? 'Demo' : 'Live'}
              </span>
            </div>
            <p className="mt-2 text-[13px] leading-[1.5] rs-text-secondary">
              {snapshot.demo
                ? 'This is a demo profile with preview data from the leaderboard.'
                : 'Live trading profile with verified performance data.'}
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}