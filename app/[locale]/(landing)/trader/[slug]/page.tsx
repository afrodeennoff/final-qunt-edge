import Link from 'next/link'
import type { Metadata } from 'next'
import { connection } from 'next/server'
import { format, startOfDay } from 'date-fns'
import { createClient } from '@supabase/supabase-js'
import { ArrowLeft, Calendar, Globe, Instagram, MessageCircle, TrendingUp, Twitter, Youtube } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { buildBreadcrumbSchema, buildPublicMetadata, getCanonicalUrl } from '@/lib/seo'
import { hasConfiguredDatabaseConnection, prisma } from '@/lib/prisma'
import { isPrismaColumnAvailable, isPrismaSchemaMismatchError } from '@/lib/prisma-guard'
import { CalendarGrid } from './calendar-grid'

const insetPanelClassName = 'rounded-xl border border-border/30 bg-card/40 shadow-none'

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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
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
    <div className="mx-auto max-w-5xl px-4 py-16">
      <Link
        href={`/${locale}/leaderboard`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Leaderboard
      </Link>
      <div className="rounded-2xl border border-border/30 bg-card/50 p-8 sm:p-12 text-center">
        <p className="text-4xl font-semibold text-muted-foreground/40">404</p>
        <h1 className="mt-3 text-xl font-semibold text-foreground">{slug}</h1>
        <p className="mt-2 text-sm text-muted-foreground">This public trader profile is unavailable or has been set to private.</p>
      </div>
    </div>
  )
}

export default async function TraderProfilePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  await connection()
  const snapshot = await getTraderSnapshot(slug)
  if (!snapshot) return <NotFoundState slug={slug} locale={locale} />

  const social = await getPublicSocialLinks(snapshot.authUserId)
  const personSchema = { '@context': 'https://schema.org', '@type': 'Person', name: snapshot.username, url: getCanonicalUrl(locale, `/trader/${slug}`) }
  const breadcrumbSchema = buildBreadcrumbSchema(locale, [{ name: 'Leaderboard', path: '/leaderboard' }, { name: snapshot.username, path: `/trader/${slug}` }])

  const pnlTone = snapshot.totalPnl > 0 ? 'text-semantic-success' : snapshot.totalPnl < 0 ? 'text-semantic-error' : ''
  const winTone = snapshot.winRate >= 50 ? 'text-semantic-success' : ''
  const avgTone = snapshot.avgPnl > 0 ? 'text-semantic-success' : snapshot.avgPnl < 0 ? 'text-semantic-error' : ''

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([personSchema, breadcrumbSchema]) }} />

      {/* Back link */}
      <Link
        href={`/${locale}/leaderboard`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Leaderboard
      </Link>

      {/* ---- Profile Header ---- */}
      <section className={insetPanelClassName}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-5">
            <Avatar className="h-18 w-18 shrink-0 rounded-2xl border border-border/30 bg-card/50 sm:h-20 sm:w-20">
              <AvatarFallback className="rounded-2xl text-lg font-semibold">
                {snapshot.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-2">
              <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {snapshot.username}
              </h1>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                Public Trading Profile
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="gap-1.5 text-[11px]">
                  <TrendingUp className="h-3 w-3" />
                  {snapshot.totalTrades.toLocaleString()} trades
                </Badge>
                <Badge variant="secondary" className="gap-1.5 text-[11px]">
                  <TrendingUp className="h-3 w-3" />
                  {snapshot.winRate.toFixed(1)}% win rate
                </Badge>
              </div>
            </div>
          </div>

          {Object.values(social).some(Boolean) && (
            <div className="flex flex-wrap gap-2">
              {social.x ? <a href={social.x} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-border/30 bg-card/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-card/80 transition-colors"><Twitter className="h-3.5 w-3.5" />X</a> : null}
              {social.instagram ? <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-border/30 bg-card/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-card/80 transition-colors"><Instagram className="h-3.5 w-3.5" />Instagram</a> : null}
              {social.discord ? <a href={social.discord} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-border/30 bg-card/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-card/80 transition-colors"><MessageCircle className="h-3.5 w-3.5" />Discord</a> : null}
              {social.youtube ? <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-border/30 bg-card/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-card/80 transition-colors"><Youtube className="h-3.5 w-3.5" />YouTube</a> : null}
            </div>
          )}
        </div>
      </section>

      {/* ---- Key Metrics ---- */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className={cn(insetPanelClassName, 'px-4 py-3.5')}>
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">Net PnL</p>
          <p className={`mt-1.5 text-xl font-semibold tabular-nums tracking-tight ${pnlTone}`}>{formatCurrency(snapshot.totalPnl)}</p>
        </div>
        <div className={cn(insetPanelClassName, 'px-4 py-3.5')}>
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">Win Rate</p>
          <p className={`mt-1.5 text-xl font-semibold tabular-nums tracking-tight ${winTone}`}>{snapshot.winRate.toFixed(1)}%</p>
        </div>
        <div className={cn(insetPanelClassName, 'px-4 py-3.5')}>
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">Avg. Trade</p>
          <p className={`mt-1.5 text-xl font-semibold tabular-nums tracking-tight ${avgTone}`}>{formatCurrency(snapshot.avgPnl)}</p>
        </div>
        <div className={cn(insetPanelClassName, 'px-4 py-3.5')}>
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">Total Trades</p>
          <p className="mt-1.5 text-xl font-semibold tabular-nums tracking-tight">{snapshot.totalTrades.toLocaleString()}</p>
        </div>
      </section>

      {/* ---- Calendar + Recent Trades ---- */}
      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <article className={insetPanelClassName}>
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">Performance Calendar</h2>
          </div>
          <CalendarGrid dayPnl={snapshot.dayPnl} />
        </article>
        <article className={insetPanelClassName}>
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">Recent Trades</h2>
          </div>
          <div className="space-y-2">
            {snapshot.recentTrades.map((trade) => (
              <div key={trade.id} className="flex flex-col gap-1 rounded-lg border border-border/30 bg-card/50 px-3.5 py-2.5 transition-colors hover:bg-card/80">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{trade.symbol}</p>
                    <p className="text-[11px] text-muted-foreground">{format(trade.closeTime, 'MMM d, yyyy')}</p>
                  </div>
                  <p className={`shrink-0 text-sm font-semibold tabular-nums ${trade.pnl >= 0 ? 'text-semantic-success' : 'text-semantic-error'}`}>
                    {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* ---- Footer CTA ---- */}
      <section className={insetPanelClassName}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <h2 className="text-sm font-semibold text-foreground">Trading Summary</h2>
            <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
              Public snapshot of this trader&apos;s activity and consistency. Shared intentionally for transparent performance review.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href={`/${locale}/leaderboard`}
              className="inline-flex items-center gap-2 rounded-lg border border-border/30 bg-card/50 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-card/80 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Leaderboard
            </Link>
            <Link
              href={`/${locale}/dashboard/trader-profile`}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Globe className="h-3.5 w-3.5" />
              Create your profile
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
