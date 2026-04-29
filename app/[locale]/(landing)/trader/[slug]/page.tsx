import Link from 'next/link'
import type { Metadata } from 'next'
import { addDays, format, startOfDay, subDays } from 'date-fns'
import { createClient } from '@supabase/supabase-js'
import { ArrowLeft, Calendar, Globe, Instagram, MessageCircle, TrendingUp, Twitter, Youtube } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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

function CalendarGrid({ dayPnl }: { dayPnl: Map<string, number> }) {
  const start = subDays(startOfDay(new Date()), 83)
  const days = Array.from({ length: 84 }, (_, idx) => addDays(start, idx))
  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => {
        const key = day.toISOString().slice(0, 10)
        const value = dayPnl.get(key) ?? 0
        const tone = value > 0 ? 'bg-semantic-success/20 border-semantic-success/40' : value < 0 ? 'bg-semantic-error/20 border-semantic-error/40' : 'bg-card/40 border-border/30'
        return (
          <div key={key} className={`rounded-md border p-2 ${tone}`}>
            <p className="text-[10px] text-muted-foreground">{format(day, 'MMM d')}</p>
            <p className="text-xs font-semibold">{value === 0 ? '-' : `${value > 0 ? '+' : ''}${Math.round(value)}`}</p>
          </div>
        )
      })}
    </div>
  )
}

function NotFoundState({ slug, locale }: { slug: string; locale: string }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="rounded-xl border border-border/30 bg-card/50 p-8">
        <h1 className="text-2xl font-semibold">{slug}</h1>
        <p className="mt-3 text-muted-foreground">This public trader profile is unavailable.</p>
        <Link href={`/${locale}/leaderboard`} className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary">
          <ArrowLeft className="h-4 w-4" />
          Back to leaderboard
        </Link>
      </div>
    </div>
  )
}

export default async function TraderProfilePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const snapshot = await getTraderSnapshot(slug)
  if (!snapshot) return <NotFoundState slug={slug} locale={locale} />

  const social = await getPublicSocialLinks(snapshot.authUserId)
  const personSchema = { '@context': 'https://schema.org', '@type': 'Person', name: snapshot.username, url: getCanonicalUrl(locale, `/trader/${slug}`) }
  const breadcrumbSchema = buildBreadcrumbSchema(locale, [{ name: 'Leaderboard', path: '/leaderboard' }, { name: snapshot.username, path: `/trader/${slug}` }])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([personSchema, breadcrumbSchema]) }} />

      <section className="rounded-xl border border-border/30 bg-card/50 p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border border-border/30 bg-card/50">
              <AvatarFallback>{snapshot.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{snapshot.username}</h1>
              <p className="mt-1 text-sm text-muted-foreground">Public Trading CV</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline">Professional Profile</Badge>
                <Badge variant="outline">{snapshot.totalTrades} Trades</Badge>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {social.x ? <a href={social.x} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-border/30 bg-card/40 px-3 py-1.5 text-xs"><Twitter className="h-3.5 w-3.5" />X</a> : null}
            {social.instagram ? <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-border/30 bg-card/40 px-3 py-1.5 text-xs"><Instagram className="h-3.5 w-3.5" />Instagram</a> : null}
            {social.discord ? <a href={social.discord} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-border/30 bg-card/40 px-3 py-1.5 text-xs"><MessageCircle className="h-3.5 w-3.5" />Discord</a> : null}
            {social.youtube ? <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-border/30 bg-card/40 px-3 py-1.5 text-xs"><Youtube className="h-3.5 w-3.5" />YouTube</a> : null}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border/30 bg-card/50 p-4"><p className="text-xs text-muted-foreground">Net PnL</p><p className="mt-1 text-xl font-semibold">{formatCurrency(snapshot.totalPnl)}</p></div>
        <div className="rounded-xl border border-border/30 bg-card/50 p-4"><p className="text-xs text-muted-foreground">Win Rate</p><p className="mt-1 text-xl font-semibold">{snapshot.winRate.toFixed(1)}%</p></div>
        <div className="rounded-xl border border-border/30 bg-card/50 p-4"><p className="text-xs text-muted-foreground">Average Trade</p><p className="mt-1 text-xl font-semibold">{formatCurrency(snapshot.avgPnl)}</p></div>
        <div className="rounded-xl border border-border/30 bg-card/50 p-4"><p className="text-xs text-muted-foreground">Total Trades</p><p className="mt-1 text-xl font-semibold">{snapshot.totalTrades.toLocaleString()}</p></div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <article className="rounded-xl border border-border/30 bg-card/50 p-5">
          <div className="mb-3 flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /><h2 className="text-sm font-semibold uppercase tracking-[0.12em]">Performance Calendar</h2></div>
          <CalendarGrid dayPnl={snapshot.dayPnl} />
        </article>
        <article className="rounded-xl border border-border/30 bg-card/50 p-5">
          <div className="mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /><h2 className="text-sm font-semibold uppercase tracking-[0.12em]">Recent Trades</h2></div>
          <div className="space-y-2">
            {snapshot.recentTrades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between rounded-lg border border-border/30 bg-card/40 px-3 py-2">
                <div><p className="text-sm font-medium">{trade.symbol}</p><p className="text-[11px] text-muted-foreground">{format(trade.closeTime, 'MMM d, yyyy')}</p></div>
                <p className={`text-sm font-semibold ${trade.pnl >= 0 ? 'text-semantic-success' : 'text-semantic-error'}`}>{trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-6 rounded-xl border border-border/30 bg-card/50 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em]">Trading Summary</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Public snapshot of this trader’s activity and consistency. Shared intentionally for transparent performance review.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={`/${locale}/leaderboard`} className="inline-flex items-center gap-2 rounded-lg border border-border/30 bg-card/40 px-3 py-1.5 text-xs"><ArrowLeft className="h-3.5 w-3.5" />Leaderboard</Link>
          <Link href={`/${locale}/dashboard/trader-profile`} className="inline-flex items-center gap-2 rounded-lg border border-border/30 bg-card/40 px-3 py-1.5 text-xs"><Globe className="h-3.5 w-3.5" />Create your profile</Link>
        </div>
      </section>
    </div>
  )
}
