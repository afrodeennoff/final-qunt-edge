import Link from 'next/link'
import type { Metadata } from 'next'
import { startOfDay } from 'date-fns'
import { createClient } from '@supabase/supabase-js'
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  DollarSign,
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

type SocialLinks = { x: string | null; instagram: string | null; discord: string | null; youtube: string | null }
type TraderSnapshot = {
  id: string
  username: string
  totalPnl: number
  totalTrades: number
  winRate: number
  avgPnl: number
  authUserId: string
  recentTrades: Array<{ id: string; symbol: string; pnl: number; closeTime: Date }>
  dayPnl: Map<string, number>
}

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

function formatCapitalCompact(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return formatCurrency(value)
}

function formatSocialUrl(url: string | null | undefined) {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null
  return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
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

async function getPublicSocialLinks(authUserId: string): Promise<SocialLinks> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return { x: null, instagram: null, discord: null, youtube: null }
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
  const { data } = await supabase.auth.admin.getUserById(authUserId)
  const metadata = data.user?.user_metadata

  return {
    x: formatSocialUrl(metadata?.twitter_url),
    instagram: formatSocialUrl(metadata?.instagram_url),
    discord: formatSocialUrl(metadata?.discord_url),
    youtube: formatSocialUrl(metadata?.youtube_url),
  }
}

async function getTraderSnapshot(slug: string): Promise<TraderSnapshot | null> {
  if (!hasConfiguredDatabaseConnection) return null
  if (!(await hasLeaderboardVisibilityColumn())) return null

  let publicUser: { id: string; email: string | null; showOnLeaderboard: boolean; auth_user_id: string } | null = null
  try {
    publicUser = await prisma.user.findUnique({
      where: { id: slug },
      select: { id: true, email: true, auth_user_id: true, showOnLeaderboard: true },
    })
  } catch (error) {
    if (isPrismaSchemaMismatchError(error)) return null
    throw error
  }
  if (!publicUser?.showOnLeaderboard) return null

  const trades = await prisma.trade.findMany({
    where: { userId: publicUser.id },
    select: { id: true, instrument: true, pnl: true, closeDate: true },
    orderBy: { closeDate: 'desc' },
    take: 3000,
  })

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
    authUserId: publicUser.auth_user_id,
    recentTrades,
    dayPnl,
  }
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
        <div className="rounded-2xl border border-border/40 bg-card/80 p-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Trader profile</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-foreground">{slug}</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            This profile is not available yet. Once the trader has public stats or the database is connected, it will appear here.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            <Link
              href={`/${locale}/leaderboard`}
              className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-transparent px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/55"
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

  const positive = snapshot.totalPnl > 0
  const negative = snapshot.totalPnl < 0

  return (
    <div className="min-h-[calc(100vh-72px)] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([personSchema, breadcrumbSchema]) }}
      />
      <div className="mx-auto grid max-w-[1120px] gap-8 xl:grid-cols-[1.35fr_1fr]">
        <section className="space-y-6">
          {/* Header */}
          <div className="rounded-2xl border border-border/40 bg-card/80 p-6 sm:p-8">
            <div className="flex items-start gap-6">
              <Avatar className="h-20 w-20 border border-border/40">
                <AvatarFallback className="text-lg font-semibold text-foreground">
                  {snapshot.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-2xl font-semibold leading-tight tracking-tight text-foreground">{snapshot.username}</p>
                <p className="mt-1 text-sm text-muted-foreground">Public profile</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
                    <Zap className="h-3 w-3" />
                    Trader Profile
                  </span>
                  <span className="inline-flex items-center rounded-full border border-border/40 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    {snapshot.totalTrades} Trades
                  </span>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border/40 bg-background/70 p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Total Trades</p>
                <p className="mt-2 text-xl font-semibold text-foreground">{snapshot.totalTrades.toLocaleString()}</p>
              </div>
              <div className="rounded-xl border border-border/40 bg-background/70 p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Total PnL</p>
                <p className={`mt-2 text-xl font-semibold ${positive ? 'text-success' : negative ? 'text-destructive' : 'text-foreground'}`}>{formatSigned(snapshot.totalPnl)}</p>
              </div>
              <div className="rounded-xl border border-border/40 bg-background/70 p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Win Rate</p>
                <p className="mt-2 text-xl font-semibold text-foreground">{formatValue(snapshot.winRate)}%</p>
              </div>
            </div>
          </div>

          {/* Profit + Trades cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border/40 bg-card/80 p-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Total Profit</p>
              <p className={`mt-2 text-2xl font-semibold tracking-tight ${positive ? 'text-success' : negative ? 'text-destructive' : 'text-foreground'}`}>
                {formatCurrency(snapshot.totalPnl)}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">Current public performance snapshot</p>
            </div>
            <div className="rounded-xl border border-border/40 bg-card/80 p-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Total Trades</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{snapshot.totalTrades.toLocaleString()}</p>
              <p className="mt-2 text-xs text-muted-foreground">Visible public trades</p>
            </div>
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/${locale}/leaderboard`}
              className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-transparent px-5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/55"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to leaderboard
            </Link>
            <Link
              href={`/${locale}/dashboard/trader-profile`}
              className="inline-flex items-center rounded-full bg-foreground px-5 py-1.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Manage profile
            </Link>
          </div>
        </section>

        {/* Right aside */}
        <aside className="space-y-4">
          <div className="rounded-xl border border-border/40 bg-card/80 p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Total Capital</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{formatCapitalCompact(snapshot.totalPnl)}</p>
          </div>

          <div className="rounded-xl border border-border/40 bg-card/80 p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Win Rate</p>
            <p className="mt-2 text-4xl font-semibold text-foreground">{formatValue(snapshot.winRate)}%</p>
            <div className="mt-3 h-1.5 rounded-full bg-border/60">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(8, snapshot.winRate))}%` }} />
            </div>
          </div>

          <div className="rounded-xl border border-border/40 bg-card/80 p-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Total Trades</p>
              <span className="inline-flex items-center rounded-full border border-border/40 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {snapshot.totalTrades > 100 ? 'Active' : 'Growing'}
              </span>
            </div>
            <p className="mt-2 text-4xl font-semibold text-foreground">{snapshot.totalTrades}</p>
            <div className="mt-3 h-1.5 rounded-full bg-border/60">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(8, snapshot.totalTrades))}%` }} />
            </div>
          </div>

          <div className="rounded-xl border border-border/40 bg-card/80 p-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Profile Status</p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/40 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                <Lock className="h-3 w-3" />
                Live
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Live trading profile with verified performance data.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
