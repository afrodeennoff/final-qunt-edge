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
import {
  unifiedChipClassName,
  unifiedGhostActionClassName,
  unifiedHeroPanelClassName,
  unifiedInsetPanelClassName,
  unifiedMetricPanelClassName,
  unifiedSectionPanelClassName,
  unifiedStatePanelClassName,
} from '@/components/layout/unified-page-recipes'
import { UnifiedPageShell } from '@/components/layout/unified-page-shell'

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
    <div className={cn(unifiedStatePanelClassName, 'p-8 text-center')}>
      <div className={unifiedChipClassName}>
        <Lock className="h-3.5 w-3.5" />
        Profile unavailable
      </div>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground">{slug}</h1>
      <p className="mt-3 max-w-md mx-auto text-sm text-muted-foreground">
        This trader profile is not public yet or no data available.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href={`/${locale}/leaderboard`} className={unifiedGhostActionClassName}>
          <ArrowLeft className="h-3.5 w-3.5" /> Leaderboard
        </Link>
        <Link href={`/${locale}/dashboard/trader-profile`} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
          <Globe className="h-3.5 w-3.5" /> Create profile
        </Link>
      </div>
    </div>
  )
}

function WinRateRing({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, Math.round(value)))
  const size = 64
  const strokeWidth = 4.5
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (pct / 100) * circumference
  const good = pct >= 50
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-border/30" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className={good ? 'text-semantic-success' : 'text-primary'} />
      </svg>
      <div className="absolute text-center">
        <div className={cn('text-[17px] font-semibold tabular-nums tracking-[-0.02em]', good ? 'text-semantic-success' : 'text-foreground')}>{pct}</div>
        <div className="text-[8px] font-medium -mt-1 tracking-[0.5px] text-muted-foreground/60">WIN</div>
      </div>
    </div>
  )
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
      <UnifiedPageShell widthClassName="max-w-[720px]" density="compact">
        <NotFoundState slug={slug} locale={locale} />
      </UnifiedPageShell>
    )
  }

  const publicStats = buildPublicStats(snapshot)
  const dayValues = Array.from(snapshot.dayPnl.values())
  const bestDay = dayValues.length > 0 ? Math.max(...dayValues) : 0
  const positiveDays = dayValues.filter((v) => v > 0).length

  return (
    <div className="min-h-[calc(100dvh-72px)] px-4 py-8 sm:px-6 sm:py-12 lg:px-8 bg-gradient-to-b from-background to-muted/5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([personSchema, breadcrumbSchema]) }}
      />
      <div className="mx-auto max-w-[1200px]">
        {/* Hero Header - Premium modern look */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-border/40 bg-card/80 shadow-xl backdrop-blur">
          <div className="flex flex-col gap-6 p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="relative">
                <Avatar className="h-28 w-28 rounded-3xl border-4 border-primary/20 shadow-2xl sm:h-32 sm:w-32">
                  <AvatarFallback className="bg-primary/10 text-4xl font-bold text-primary">
                    {snapshot.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-emerald-500">
                  <div className="h-3 w-3 rounded-full bg-white" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary ring-1 ring-inset ring-primary/20">
                    <Zap className="h-3.5 w-3.5" /> Public Trader
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground ring-1 ring-inset ring-border/40">
                    <Lock className="h-3.5 w-3.5" /> Live Profile
                  </span>
                </div>

                <h1 className="text-5xl font-semibold tracking-tighter text-foreground sm:text-6xl">
                  {snapshot.username}
                </h1>
                <p className="max-w-lg text-[15px] leading-relaxed text-muted-foreground">
                  Verified performance from Qunt Edge. Real closed trades, real execution rhythm, real results.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link
                href={`/${locale}/leaderboard`}
                className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-background/60 px-5 py-2.5 text-sm font-medium backdrop-blur transition hover:bg-muted/60"
              >
                <ArrowLeft className="h-4 w-4" /> Leaderboard
              </Link>
              <Link
                href={`/${locale}/dashboard/trader-profile`}
                className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-6 py-2.5 text-sm font-semibold text-background transition hover:bg-foreground/90"
              >
                <Globe className="h-4 w-4" /> Manage Profile
              </Link>
            </div>
          </div>

          {/* Premium Stats Row */}
          <div className="grid border-t border-border/40 sm:grid-cols-2 lg:grid-cols-4">
            {publicStats.map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div
                  key={idx}
                  className="group flex items-center gap-4 border-t border-border/40 p-6 transition hover:bg-muted/30 sm:border-l sm:first:border-l-0 lg:border-t-0"
                >
                  <div className="rounded-2xl border border-border/50 bg-background/60 p-3 transition group-hover:border-primary/30">
                    <Icon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">{stat.label}</div>
                    <div className={cn("mt-0.5 text-3xl font-semibold tracking-tighter", stat.tone)}>
                      {stat.value}
                    </div>
                    <div className="text-[12px] text-muted-foreground/60">{stat.helper}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Recent Trades - Enhanced */}
          <div className="lg:col-span-7">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Activity</div>
                <div className="text-2xl font-semibold tracking-tight">Recent Execution</div>
              </div>
              <div className="text-sm text-muted-foreground">{snapshot.recentTrades.length} trades</div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-border/40 bg-card/90 shadow-sm">
              {snapshot.recentTrades.length > 0 ? (
                <div className="divide-y divide-border/40">
                  {snapshot.recentTrades.map((trade, idx) => {
                    const isPositive = trade.pnl > 0
                    const isNegative = trade.pnl < 0
                    return (
                      <div
                        key={idx}
                        className="group flex items-center justify-between px-5 py-4 transition hover:bg-muted/40"
                      >
                        <div className="flex items-center gap-4">
                          <div className="font-mono text-sm font-medium text-foreground/80">{trade.symbol}</div>
                          <div className="text-xs text-muted-foreground">
                            {trade.closeTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                        <div className={cn(
                          "font-mono text-lg font-semibold tabular-nums transition",
                          isPositive && "text-emerald-400",
                          isNegative && "text-rose-400",
                          !isPositive && !isNegative && "text-foreground/60"
                        )}>
                          {formatSigned(trade.pnl)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No public closed trades available yet.
                </div>
              )}
            </div>
          </div>

          {/* Performance + Calendar */}
          <div className="space-y-6 lg:col-span-5">
            {/* Win Rate Card with Ring */}
            <div className="rounded-3xl border border-border/40 bg-card/90 p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Consistency</div>
                  <div className="mt-1 text-2xl font-semibold tracking-tight">Win Rate</div>
                </div>
                <div className="relative h-14 w-14">
                  <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="stroke-border/40"
                      strokeWidth="3.5"
                      fill="none"
                      d="M18 2.5 a 15.5 15.5 0 0 1 0 31 a 15.5 15.5 0 0 1 0 -31"
                    />
                    <path
                      className="stroke-primary"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={`${Math.min(100, Math.max(8, snapshot.winRate))}, 100`}
                      d="M18 2.5 a 15.5 15.5 0 0 1 0 31 a 15.5 15.5 0 0 1 0 -31"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xl font-semibold tracking-tighter text-primary">
                    {formatValue(snapshot.winRate)}%
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">Based on {snapshot.totalTrades} public trades</div>
            </div>

            {/* Quick Insights */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl border border-border/40 bg-card/90 p-5">
                <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Avg per trade</div>
                <div className={cn("mt-2 text-3xl font-semibold tracking-tighter", snapshot.avgPnl >= 0 ? "text-emerald-400" : "text-rose-400")}>
                  {formatSigned(snapshot.avgPnl)}
                </div>
              </div>
              <div className="rounded-3xl border border-border/40 bg-card/90 p-5">
                <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Profile status</div>
                <div className="mt-2 text-3xl font-semibold tracking-tighter text-foreground">Live &amp; Public</div>
                <div className="mt-1 text-xs text-muted-foreground">Updated in real-time</div>
              </div>
            </div>

            {/* Calendar */}
            <div className="rounded-3xl border border-border/40 bg-card/90 p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Rhythm</div>
                  <div className="text-xl font-semibold tracking-tight">Last 84 days</div>
                </div>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[340px]">
                  <CalendarGrid dayPnl={snapshot.dayPnl} />
                </div>
              </div>
              <p className="mt-3 text-[12px] text-muted-foreground/70">Daily net PnL from closed public trades</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

            })}
          </div>

          <div className={cn(unifiedSectionPanelClassName, 'overflow-hidden p-0')}>
            <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Recent execution</p>
                <h2 className="text-lg font-semibold tracking-tight text-foreground">Latest closed trades</h2>
              </div>
              <p className="text-xs text-muted-foreground">{snapshot.recentTrades.length} shown</p>
            </div>
            {snapshot.recentTrades.length > 0 ? (
              <div className="divide-y divide-border/30">
                {snapshot.recentTrades.map((trade) => {
                  const pos = trade.pnl > 0
                  const neg = trade.pnl < 0
                  const dateStr = trade.closeTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  return (
                    <div key={trade.id} className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-muted/20">
                      <div className="flex items-center gap-3.5">
                        <div className={cn('flex h-8 w-8 items-center justify-center rounded-xl text-[10px] font-bold', pos ? 'bg-semantic-success/10 text-semantic-success' : neg ? 'bg-semantic-error/10 text-semantic-error' : 'bg-muted text-muted-foreground')}>
                          {trade.symbol.slice(0, 3).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-[13px] tracking-tight text-foreground">{trade.symbol}</p>
                          <p className="text-[10px] text-muted-foreground/80">{dateStr}</p>
                        </div>
                      </div>
                      <p className={cn('font-semibold tabular-nums text-sm tracking-tight', pos && 'text-semantic-success', neg && 'text-semantic-error')}>
                        {formatSigned(trade.pnl)}
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">No closed trades in public sample.</div>
            )}
          </div>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          <div className={unifiedInsetPanelClassName}>
            <div className="p-5">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <BarChart3 className="h-3.5 w-3.5" /> Performance snapshot
              </div>
              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-muted/20 px-4 py-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Win rate</p>
                    <p className="mt-0.5 text-2xl font-semibold tracking-tight">{formatValue(snapshot.winRate)}%</p>
                  </div>
                  <WinRateRing value={snapshot.winRate} />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-border/30 bg-muted/10 p-3">
                    <p className="text-[10px] text-muted-foreground">Avg PnL</p>
                    <p className={cn('mt-1 font-semibold tabular-nums', getSignedTone(snapshot.avgPnl))}>{formatSigned(snapshot.avgPnl)}</p>
                  </div>
                  <div className="rounded-xl border border-border/30 bg-muted/10 p-3">
                    <p className="text-[10px] text-muted-foreground">Best day</p>
                    <p className={cn('mt-1 font-semibold tabular-nums', getSignedTone(bestDay))}>{formatSigned(bestDay)}</p>
                  </div>
                </div>
                <div className="space-y-2 pt-1">
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Positive days</span><span>{positiveDays}</span>
                    </div>
                    <div className="mt-1 h-1 rounded bg-border/20"><div className="h-1 rounded bg-semantic-success" style={{width: `${Math.min(100, (positiveDays / 84) * 100)}%`}} /></div>
                  </div>
                  <div className="text-[10px] text-muted-foreground/70">Over last 84 days • {snapshot.totalTrades} trades sampled</div>
                </div>
              </div>
            </div>
          </div>

          <div className={unifiedSectionPanelClassName}>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Session calendar</p>
                  <p className="mt-1 text-xs text-muted-foreground">Last 84 days of public PnL</p>
                </div>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-4">
                <CalendarGrid dayPnl={snapshot.dayPnl} />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </UnifiedPageShell>
  )
}
