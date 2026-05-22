import Link from 'next/link'
import type { Metadata } from 'next'
import { startOfDay } from 'date-fns'
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  Globe,
  Target,
  TrendingUp,
  Zap,
  Lock,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { buildBreadcrumbSchema, buildPublicMetadata, getCanonicalUrl } from '@/lib/seo'
import { hasConfiguredDatabaseConnection, prisma } from '@/lib/prisma'
import { isPrismaColumnAvailable, isPrismaSchemaMismatchError } from '@/lib/prisma-guard'
import { CalendarGrid } from './calendar-grid'

type TraderSnapshot = {
  id: string
  username: string
  totalPnl: number
  totalTrades: number
  winRate: number
  avgPnl: number
  recentTrades: Array<{ id: string; symbol: string; pnl: number; closeTime: Date }>
  dayPnl: Map<string, number>
}

type PublicTraderUser = { id: string; email: string | null; showOnLeaderboard: boolean }
type PublicTrade = { id: string; instrument: string | null; pnl: unknown; closeDate: Date }

const USER_TABLE_CANDIDATES = ['User', 'user'] as const
const LEADERBOARD_VISIBILITY_COLUMN = 'showOnLeaderboard'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

function formatSigned(value: number): string {
  const prefix = value >= 0 ? '+' : ''
  return `${prefix}${formatCurrency(value)}`
}

function formatValue(value: number, decimals = 1): string {
  return value.toFixed(decimals)
}

function getSignedTone(value: number): string {
  if (value > 0) return 'text-semantic-success'
  if (value < 0) return 'text-semantic-error'
  return 'text-foreground'
}

function buildPublicStats(snapshot: TraderSnapshot) {
  return [
    {
      label: 'Net PnL',
      value: formatSigned(snapshot.totalPnl),
      helper: 'Closed-trade result',
      icon: TrendingUp,
      tone: getSignedTone(snapshot.totalPnl),
    },
    {
      label: 'Win Rate',
      value: `${formatValue(snapshot.winRate)}%`,
      helper: 'Winning trades',
      icon: Target,
      tone: snapshot.winRate >= 50 ? 'text-semantic-success' : 'text-foreground',
    },
    {
      label: 'Avg PnL',
      value: formatSigned(snapshot.avgPnl),
      helper: 'Per visible trade',
      icon: BarChart3,
      tone: getSignedTone(snapshot.avgPnl),
    },
    {
      label: 'Trades',
      value: snapshot.totalTrades.toLocaleString(),
      helper: 'Public sample',
      icon: Calendar,
      tone: 'text-foreground',
    },
  ]
}

function toUsername(email: string | null | undefined, fallbackId: string): string {
  const base = email?.split('@')[0]?.trim()
  return base || `Trader ${fallbackId.slice(0, 8)}`
}

async function hasLeaderboardVisibilityColumn(): Promise<boolean> {
  for (const tableName of USER_TABLE_CANDIDATES) {
    if (await isPrismaColumnAvailable(tableName, LEADERBOARD_VISIBILITY_COLUMN)) return true
  }
  return false
}

async function getPublicTraderUser(slug: string): Promise<PublicTraderUser | null> {
  try {
    return await prisma.user.findUnique({
      where: { id: slug },
      select: { id: true, email: true, showOnLeaderboard: true },
    })
  } catch (error) {
    if (isPrismaSchemaMismatchError(error)) return null
    throw error
  }
}

function buildTraderSnapshot(publicUser: PublicTraderUser, trades: PublicTrade[]): TraderSnapshot {
  const recentTrades = trades.slice(0, 10).map((trade) => ({
    id: trade.id,
    symbol: trade.instrument || 'Unknown',
    pnl: Number(trade.pnl ?? 0),
    closeTime: trade.closeDate,
  }))

  const totalTrades = trades.length
  const totalPnl = trades.reduce((sum, trade) => sum + Number(trade.pnl ?? 0), 0)
  const wins = trades.filter((trade) => Number(trade.pnl ?? 0) > 0).length
  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0
  const avgPnl = totalTrades > 0 ? totalPnl / totalTrades : 0
  const dayPnl = new Map<string, number>()

  for (const trade of trades) {
    const key = startOfDay(trade.closeDate).toISOString().slice(0, 10)
    dayPnl.set(key, (dayPnl.get(key) ?? 0) + Number(trade.pnl ?? 0))
  }

  return {
    id: publicUser.id,
    username: toUsername(publicUser.email, publicUser.id),
    totalPnl,
    totalTrades,
    winRate,
    avgPnl,
    recentTrades,
    dayPnl,
  }
}

async function getTraderSnapshot(slug: string): Promise<TraderSnapshot | null> {
  if (!hasConfiguredDatabaseConnection) return null
  if (!(await hasLeaderboardVisibilityColumn())) return null

  const publicUser = await getPublicTraderUser(slug)
  if (!publicUser?.showOnLeaderboard) return null

  const trades = await prisma.trade.findMany({
    where: { userId: publicUser.id },
    select: { id: true, instrument: true, pnl: true, closeDate: true },
    orderBy: { closeDate: 'desc' },
    take: 3000,
  })

  return buildTraderSnapshot(publicUser, trades)
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params
  const snapshot = await getTraderSnapshot(slug)
  return buildPublicMetadata({
    locale,
    path: `/trader/${slug}`,
    title: `${snapshot?.username ?? slug} — Trader Profile | Qunt Edge`,
    description: snapshot
      ? `${snapshot.username}: ${snapshot.totalTrades} trades, ${formatCurrency(snapshot.totalPnl)} net PnL, ${snapshot.winRate.toFixed(1)}% win rate.`
      : `Public trader profile for ${slug} on Qunt Edge.`,
  })
}

function NotFoundState({ slug, locale }: { slug: string; locale: string }) {
  return (
    <div className="min-h-[calc(100vh-72px)] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-[1120px]">
        <div className="rounded-2xl border border-[oklch(0.65_0.22_260/0.10)] bg-[oklch(0.65_0.22_260/0.03)] p-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Trader profile</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-foreground">{slug}</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            This profile is not available yet. Once the trader has public stats or the database is connected, it will appear here.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            <Link
              href={`/${locale}/leaderboard`}
              className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.65_0.22_260/0.10)] bg-transparent px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[oklch(0.65_0.22_260/0.06)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Leaderboard
            </Link>
            <Link
              href={`/${locale}/dashboard/trader-profile`}
              className="inline-flex items-center rounded-full bg-foreground px-4 py-1.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              <Globe className="h-3.5 w-3.5" />
              Create your profile
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
    return <NotFoundState slug={slug} locale={locale} />
  }

  const publicStats = buildPublicStats(snapshot)

  return (
    <div className="min-h-[calc(100vh-72px)] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([personSchema, breadcrumbSchema]) }}
      />
      <div className="mx-auto grid max-w-[1180px] gap-6 xl:grid-cols-[minmax(0,1.28fr)_minmax(340px,0.72fr)]">
        <section className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-[oklch(0.65_0.22_260_/_0.08)] bg-[oklch(0.052_0.009_260_/_0.78)] shadow-[inset_0_1px_0_oklch(0.65_0.22_260_/_0.05),0_24px_70px_-44px_rgba(0,0,0,0.95)]">
            <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
                <Avatar className="h-20 w-20 shrink-0 rounded-3xl border border-[oklch(0.65_0.22_260_/_0.12)] bg-[oklch(0.65_0.22_260/0.07)] sm:h-24 sm:w-24">
                  <AvatarFallback className="bg-background text-lg font-semibold text-foreground">
                    {snapshot.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                      <Zap className="h-3 w-3" />
                      Public trader
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.65_0.22_260_/_0.1)] bg-[oklch(0.65_0.22_260/0.04)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      <Lock className="h-3 w-3" />
                      Live profile
                    </span>
                  </div>

                  <h1 className="mt-4 truncate text-3xl font-semibold tracking-[-0.035em] text-foreground sm:text-5xl">
                    {snapshot.username}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                    Verified public performance snapshot from Qunt Edge, focused on closed trades,
                    current rhythm, and recent execution.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                <Link
                  href={`/${locale}/leaderboard`}
                  className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.65_0.22_260_/_0.12)] bg-[oklch(0.65_0.22_260/0.045)] px-4 py-2 text-sm font-medium text-foreground transition-[background-color,border-color,color] hover:bg-[oklch(0.65_0.22_260/0.07)]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Leaderboard
                </Link>
                <Link
                  href={`/${locale}/dashboard/trader-profile`}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-[background-color] hover:bg-primary/90"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Manage profile
                </Link>
              </div>
            </div>

            <div className="grid border-t border-[oklch(0.65_0.22_260_/_0.08)] sm:grid-cols-2 xl:grid-cols-4">
              {publicStats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div
                    key={stat.label}
                    className="border-t border-[oklch(0.65_0.22_260_/_0.08)] p-6 first:border-t-0 sm:[&:nth-child(-n+2)]:border-t-0 xl:border-l xl:border-t-0 xl:first:border-l-0"
                  >
                    <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" />
                      {stat.label}
                    </div>
                    <p className={cn('mt-3 text-2xl font-semibold tracking-tight', stat.tone)}>
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{stat.helper}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[oklch(0.65_0.22_260_/_0.08)] bg-[oklch(0.052_0.009_260_/_0.72)] p-6 shadow-[0_16px_48px_-36px_rgba(0,0,0,0.95)] sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Recent execution
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  Latest closed trades
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                {snapshot.recentTrades.length} most recent
              </p>
            </div>

            <div className="mt-5 space-y-2">
              {snapshot.recentTrades.length > 0 ? (
                snapshot.recentTrades.map((trade) => {
                  const tradePositive = trade.pnl > 0
                  const tradeNegative = trade.pnl < 0
                  return (
                    <div
                      key={trade.id}
                      className="flex flex-col gap-2 rounded-xl border border-[oklch(0.65_0.22_260_/_0.08)] bg-[oklch(0.65_0.22_260/0.045)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {trade.symbol}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {trade.closeTime.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <p
                        className={cn(
                          'shrink-0 text-sm font-semibold tabular-nums',
                          tradePositive && 'text-semantic-success',
                          tradeNegative && 'text-semantic-error',
                          !tradePositive && !tradeNegative && 'text-foreground',
                        )}
                      >
                        {formatSigned(trade.pnl)}
                      </p>
                    </div>
                  )
                })
              ) : (
                <div className="rounded-xl border border-dashed border-[oklch(0.65_0.22_260_/_0.12)] bg-[oklch(0.65_0.22_260/0.04)] px-4 py-6 text-sm text-muted-foreground">
                  No public closed trades are available yet.
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-2xl border border-[oklch(0.65_0.22_260_/_0.08)] bg-[oklch(0.052_0.009_260_/_0.72)] p-6 shadow-[0_16px_48px_-36px_rgba(0,0,0,0.95)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Performance mix
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  PnL, win rate, and average trade quality in one public snapshot.
                </p>
              </div>
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/8 text-primary">
                <BarChart3 className="h-4 w-4" />
              </span>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Win rate</span>
                  <span>{formatValue(snapshot.winRate)}%</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-border/35">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(100, Math.max(8, snapshot.winRate))}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[oklch(0.65_0.22_260_/_0.08)] bg-[oklch(0.65_0.22_260/0.045)] p-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Avg trade
                  </p>
                  <p
                    className={cn(
                      'mt-2 text-lg font-semibold',
                      snapshot.avgPnl >= 0 ? 'text-semantic-success' : 'text-semantic-error',
                    )}
                  >
                    {formatSigned(snapshot.avgPnl)}
                  </p>
                </div>
                <div className="rounded-xl border border-[oklch(0.65_0.22_260_/_0.08)] bg-[oklch(0.65_0.22_260/0.045)] p-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Status
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">Live</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[oklch(0.65_0.22_260_/_0.08)] bg-[oklch(0.052_0.009_260_/_0.72)] p-6 shadow-[0_16px_48px_-36px_rgba(0,0,0,0.95)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Session calendar
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Last 84 days of public closed-trade PnL.
                </p>
              </div>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-5 overflow-x-auto">
              <div className="min-w-[320px]">
                <CalendarGrid dayPnl={snapshot.dayPnl} />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
