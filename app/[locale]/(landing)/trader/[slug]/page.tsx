import Link from 'next/link'
import type { Metadata } from 'next'
import { cache } from 'react'
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
import { TradeActivityFeed } from './trade-activity-feed'
import { unifiedChipClassName, unifiedGhostActionClassName, unifiedStatePanelClassName } from '@/components/layout/unified-page-recipes'
import { UnifiedPageShell } from '@/components/layout/unified-page-shell'

type TraderSnapshot = {
  id: string
  username: string
  totalPnl: number
  totalTrades: number
  winRate: number
  avgPnl: number
  recentTrades: Array<{ id: string; symbol: string; pnl: number; closeTime: Date }>
  allTrades: Array<{ id: string; symbol: string; pnl: number; closeTime: Date }>
  dayPnl: Map<string, number>
}

type PublicTraderUser = { id: string; email: string | null; username: string | null; showOnLeaderboard: boolean; hideLatestTrade: boolean }
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
      label: 'Avg / Trade',
      value: formatSigned(snapshot.avgPnl),
      helper: 'Per closed trade',
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

function toUsername(email: string | null | undefined, username: string | null | undefined, fallbackId: string): string {
  if (username) return username
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
    const user = await prisma.user.findUnique({
      where: { id: slug },
      select: { id: true, email: true, username: true, showOnLeaderboard: true, hideLatestTrade: true },
    })
    return user
  } catch (error) {
    if (isPrismaSchemaMismatchError(error)) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: slug },
          select: { id: true, email: true, username: true, showOnLeaderboard: true },
        })
        return user ? { ...user, hideLatestTrade: false } : null
      } catch (innerError) {
        if (isPrismaSchemaMismatchError(innerError)) return null
        throw innerError
      }
    }
    throw error
  }
}

function buildTraderSnapshot(publicUser: PublicTraderUser, trades: PublicTrade[]): TraderSnapshot {
  const tradeIndexStart = publicUser.hideLatestTrade ? 1 : 0
  const mapped = trades.map((trade) => ({
    id: trade.id,
    symbol: trade.instrument || 'Unknown',
    pnl: Number(trade.pnl ?? 0),
    closeTime: trade.closeDate,
  }))
  const recentTrades = mapped.slice(tradeIndexStart, tradeIndexStart + 10)
  const allTrades = mapped.slice(tradeIndexStart, tradeIndexStart + 50)

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
    username: toUsername(publicUser.email, publicUser.username, publicUser.id),
    totalPnl,
    totalTrades,
    winRate,
    avgPnl,
    recentTrades,
    allTrades,
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

const getCachedTraderSnapshot = cache(async (slug: string) => {
  return getTraderSnapshot(slug)
})

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params
  const snapshot = await getCachedTraderSnapshot(slug)
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

export default async function TraderProfilePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const snapshot = await getCachedTraderSnapshot(slug)

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

  return (
    <div className="min-h-dvh bg-gradient-to-b from-background to-muted/5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([personSchema, breadcrumbSchema]) }}
      />
      <div className="mx-auto max-w-[1200px] animate-fade-up-smooth px-4 pt-28 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        {/* Hero Header */}
        <div className="mb-10 overflow-hidden rounded-3xl bg-white/30 shadow-lg backdrop-blur-xl dark:bg-zinc-900/30">
          <div className="flex flex-col gap-6 p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="relative shrink-0">
                <Avatar className="h-28 w-28 rounded-3xl shadow-2xl sm:h-32 sm:w-32">
                  <AvatarFallback className="bg-primary/10 text-4xl font-bold text-primary">
                    {snapshot.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 shadow-lg">
                  <div className="h-2.5 w-2.5 rounded-full bg-white" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                    <Zap className="h-3 w-3" /> Public Trader
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 dark:bg-zinc-800/30">
                    <Lock className="h-3 w-3" /> Live Profile
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
                className="inline-flex items-center gap-2 rounded-2xl bg-white/30 px-5 py-2.5 text-sm font-medium backdrop-blur transition-all duration-200 hover:bg-white/40 active:scale-[0.97] dark:bg-zinc-800/30 dark:hover:bg-zinc-800/50"
              >
                <ArrowLeft className="h-4 w-4" /> Leaderboard
              </Link>
              <Link
                href={`/${locale}/dashboard/trader-profile`}
                className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-6 py-2.5 text-sm font-semibold text-background transition-all duration-200 hover:bg-foreground/90 active:scale-[0.97]"
              >
                <Globe className="h-4 w-4" /> Manage Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Anchored Summary — Stats row */}
        <div className="mb-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {publicStats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div
                key={idx}
                className="group rounded-2xl bg-white/30 px-5 py-4 shadow-lg backdrop-blur-xl transition-all duration-200 hover:bg-white/40 dark:bg-zinc-900/30 dark:hover:bg-zinc-900/40"
              >
                <div className="flex items-center gap-3.5">
                  <div className="rounded-xl bg-white/20 p-2 backdrop-blur-sm dark:bg-zinc-800/20">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">{stat.label}</div>
                    <div className={cn("mt-px text-2xl font-semibold tracking-tighter", stat.tone)}>{stat.value}</div>
                    <div className="text-[10px] text-muted-foreground/40">{stat.helper}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Rhythm + Activity stack */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white/30 shadow-lg backdrop-blur-xl dark:bg-zinc-900/30">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm dark:bg-zinc-800/20">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">Rhythm</div>
                  <div className="text-base font-semibold tracking-tight text-foreground">Trading Calendar</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground/50">Last 84 days</div>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <div className="min-w-[340px]">
                  <CalendarGrid dayPnl={snapshot.dayPnl} />
                </div>
              </div>
            </div>
          </div>

          {/* Activity — Below rhythm, full width */}
          <TradeActivityFeed trades={snapshot.allTrades} />
        </div>
      </div>
    </div>
  )
}
