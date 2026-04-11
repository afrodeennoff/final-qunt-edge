import Link from 'next/link'
import React from 'react'
import type { Metadata } from 'next'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { hasConfiguredDatabaseConnection, prisma } from '@/lib/prisma'
import { getFallbackLeaderboardEntryByUserId } from '../../leaderboard/data/leaderboard-query'
import { Zap, Lock, ArrowLeft } from 'lucide-react'
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

const FB = 'border-[rgba(214,235,253,0.19)]'
const FS = 'bg-[rgba(214,235,253,0.02)]'
const FR = { boxShadow: '0 0 0 1px rgba(176,199,217,0.145)' }

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
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
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

/* ─── Not found state ─── */
function NotFoundState({ slug, locale }: { slug: string; locale: string }) {
  return (
    <div className="min-h-[calc(100vh-72px)] bg-black px-6 py-20 sm:px-8">
      <div className="mx-auto max-w-[1120px]">
        <div className={`rounded-3xl border ${FB} bg-black p-8`} style={FR}>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#7a7a7a]">Trader profile</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[#f0f0f0]">{slug}</h1>
          <p className="mt-3 max-w-xl text-[14px] leading-[1.6] text-[#a1a4a5]">
            This profile is not available yet. Once the trader has public stats or the database is connected, it will appear here.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            <Link
              href={`/${locale}/leaderboard`}
              className={`inline-flex items-center gap-2 rounded-full border ${FB} bg-transparent px-4 py-[5px] text-[13px] font-medium text-[#f0f0f0] transition-colors hover:bg-[rgba(255,255,255,0.08)]`}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to leaderboard
            </Link>
            <Link
              href={`/${locale}/dashboard/trader-profile`}
              className="inline-flex items-center rounded-full bg-[#ffffff] px-4 py-[5px] text-[13px] font-semibold text-[#000000] transition-opacity hover:opacity-90"
            >
              Manage profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Main page ─── */
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
      <>
        <NotFoundState slug={slug} locale={locale} />
      </>
    )
  }

  const positive = snapshot.totalPnl > 0
  const negative = snapshot.totalPnl < 0

  return (
    <div className="min-h-[calc(100vh-72px)] bg-black px-6 py-20 sm:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([personSchema, breadcrumbSchema]) }}
      />
      <div className="mx-auto grid max-w-[1120px] gap-8 xl:grid-cols-[1.35fr_1fr]">
        <section className="space-y-6">
          {/* Header */}
          <div className={`rounded-3xl border ${FB} bg-black p-6 sm:p-8`} style={FR}>
            <div className="flex items-start gap-5">
              <Avatar className={`h-20 w-20 border ${FB} ${FS}`} style={FR}>
                <AvatarFallback className={`${FS} text-lg font-semibold text-[#f0f0f0]`}>
                  {snapshot.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[2rem] font-semibold leading-[1.1] tracking-[-0.03em] text-[#f0f0f0]">{snapshot.username}</p>
                <p className="mt-1 text-[13px] text-[#a1a4a5]">Public profile</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border border-[rgba(59,158,255,0.2)] bg-[rgba(59,158,255,0.08)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#3b9eff]`}>
                    <Zap className="h-3 w-3" />
                    Trader Profile
                  </span>
                  {snapshot.demo ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(17,255,153,0.22)] bg-[rgba(17,255,153,0.08)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#11ff99]">
                      Demo
                    </span>
                  ) : null}
                  <span className={`inline-flex items-center rounded-full border ${FB} ${FS} px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#a1a4a5]`}>
                    {snapshot.totalTrades} Trades
                  </span>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <StatCell label="Total Trades" value={snapshot.totalTrades.toLocaleString()} />
              <StatCell label="Total PnL" value={formatSigned(snapshot.totalPnl)} accent={positive ? 'green' : negative ? 'red' : undefined} />
              <StatCell label="Profile Type" value={snapshot.demo ? 'Demo' : 'Live'} />
            </div>
          </div>

          {/* Profit + Trades cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className={`rounded-2xl border ${FB} bg-black p-5`} style={FR}>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#7a7a7a]">Total Profit</p>
              <p className={`mt-2 text-2xl font-semibold tracking-[-0.02em] ${positive ? 'text-[#11ff99]' : negative ? 'text-[#ff2047]' : 'text-[#f0f0f0]'}`}>
                {formatCurrency(snapshot.totalPnl)}
              </p>
              <p className="mt-2 text-[12px] text-[#7a7a7a]">Current public performance snapshot</p>
            </div>
            <div className={`rounded-2xl border ${FB} bg-black p-5`} style={FR}>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#7a7a7a]">Total Trades</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#f0f0f0]">{snapshot.totalTrades.toLocaleString()}</p>
              <p className="mt-2 text-[12px] text-[#7a7a7a]">Visible public trades</p>
            </div>
          </div>

          {/* Demo leaderboard stats */}
          {snapshot.demo && snapshot.winRate !== undefined ? (
            <div className={`rounded-2xl border ${FB} bg-black p-6`} style={FR}>
              <div className="mb-5 flex items-center justify-between">
                <p className="text-[14px] font-semibold text-[#f0f0f0]">Demo Leaderboard Stats</p>
                <span className={`inline-flex items-center gap-1.5 rounded-full border ${FB} ${FS} px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#a1a4a5]`}>
                  <Lock className="h-3 w-3" />
                  Preview Data
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className={`rounded-xl border ${FB} ${FS} p-4`} style={FR}>
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#7a7a7a]">Win Rate</p>
                  <p className="mt-2 text-3xl font-semibold text-[#f0f0f0]">{formatValue(snapshot.winRate)}%</p>
                  <div className="mt-3 h-1.5 rounded-full bg-[rgba(214,235,253,0.06)]">
                    <div className="h-full rounded-full bg-[rgba(59,158,255,0.4)]" style={{ width: `${Math.min(100, Math.max(8, snapshot.winRate))}%` }} />
                  </div>
                </div>
                {snapshot.returnPct !== undefined && (
                  <div className={`rounded-xl border ${FB} ${FS} p-4`} style={FR}>
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#7a7a7a]">Return</p>
                    <p className={`mt-2 text-3xl font-semibold ${snapshot.returnPct >= 0 ? 'text-[#11ff99]' : 'text-[#ff2047]'}`}>
                      {formatSigned(snapshot.returnPct)}%
                    </p>
                    <div className="mt-3 h-1.5 rounded-full bg-[rgba(214,235,253,0.06)]">
                      <div className={`h-full rounded-full ${snapshot.returnPct >= 0 ? 'bg-[rgba(17,255,153,0.35)]' : 'bg-[rgba(255,32,71,0.35)]'}`} style={{ width: `${Math.min(100, Math.max(8, Math.abs(snapshot.returnPct)))}%` }} />
                    </div>
                  </div>
                )}
                {snapshot.topInstrument && (
                  <div className={`rounded-xl border ${FB} ${FS} p-4`} style={FR}>
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#7a7a7a]">Top Instrument</p>
                    <p className="mt-2 text-3xl font-semibold text-[#f0f0f0]">{snapshot.topInstrument}</p>
                    {snapshot.avgDurationMinutes !== undefined && (
                      <p className="mt-2 text-[12px] text-[#7a7a7a]">Avg Duration: {formatValue(snapshot.avgDurationMinutes, 0)}m</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Nav links */}
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/${locale}/leaderboard`}
              className={`inline-flex items-center gap-2 rounded-full border ${FB} bg-transparent px-5 py-[5px] text-[13px] font-medium text-[#f0f0f0] transition-colors hover:bg-[rgba(255,255,255,0.08)]`}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to leaderboard
            </Link>
            <Link
              href={`/${locale}/dashboard/trader-profile`}
              className="inline-flex items-center rounded-full bg-[#ffffff] px-5 py-[5px] text-[13px] font-semibold text-[#000000] transition-opacity hover:opacity-90"
            >
              Manage profile
            </Link>
          </div>
        </section>

        {/* Right aside */}
        <aside className="space-y-4">
          <div className={`rounded-2xl border ${FB} bg-black p-5`} style={FR}>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#7a7a7a]">Total Capital</p>
            <p className="mt-2 text-3xl font-semibold text-[#f0f0f0]">{formatCapitalCompact(snapshot.totalPnl)}</p>
          </div>

          {snapshot.demo && snapshot.winRate !== undefined && (
            <div className={`rounded-2xl border ${FB} bg-black p-5`} style={FR}>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#7a7a7a]">Win Rate</p>
              <p className="mt-2 text-4xl font-semibold text-[#f0f0f0]">{formatValue(snapshot.winRate)}%</p>
              <div className="mt-3 h-1.5 rounded-full bg-[rgba(214,235,253,0.06)]">
                <div className="h-full rounded-full bg-[rgba(59,158,255,0.4)]" style={{ width: `${Math.min(100, Math.max(8, snapshot.winRate))}%` }} />
              </div>
            </div>
          )}

          <div className={`rounded-2xl border ${FB} bg-black p-5`} style={FR}>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#7a7a7a]">Total Trades</p>
              <span className={`inline-flex items-center rounded-full border ${FB} ${FS} px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[#a1a4a5]`}>
                {snapshot.totalTrades > 100 ? 'Active' : 'Growing'}
              </span>
            </div>
            <p className="mt-2 text-4xl font-semibold text-[#f0f0f0]">{snapshot.totalTrades}</p>
            <div className="mt-3 h-1.5 rounded-full bg-[rgba(214,235,253,0.06)]">
              <div className="h-full rounded-full bg-[rgba(59,158,255,0.4)]" style={{ width: `${Math.min(100, Math.max(8, snapshot.totalTrades))}%` }} />
            </div>
          </div>

          <div className={`rounded-2xl border ${FB} bg-black p-5`} style={FR}>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#7a7a7a]">Profile Status</p>
              <span className={`inline-flex items-center gap-1.5 rounded-full border ${FB} ${FS} px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#a1a4a5]`}>
                <Lock className="h-3 w-3" />
                {snapshot.demo ? 'Demo' : 'Live'}
              </span>
            </div>
            <p className="mt-3 text-[13px] leading-[1.5] text-[#a1a4a5]">
              {snapshot.demo
                ? 'Demo profile with preview data from the leaderboard.'
                : 'Live trading profile with verified performance data.'}
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

/* ─── Shared stat cell ─── */

function StatCell({ label, value, accent }: { label: string; value: string; accent?: 'green' | 'red' }) {
  const color = accent === 'green' ? 'text-[#11ff99]' : accent === 'red' ? 'text-[#ff2047]' : 'text-[#f0f0f0]'
  return (
    <div className={`rounded-xl border ${FB} ${FS} p-4`} style={FR}>
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#7a7a7a]">{label}</p>
      <p className={`mt-2 text-xl font-semibold ${color}`}>{value}</p>
    </div>
  )
}