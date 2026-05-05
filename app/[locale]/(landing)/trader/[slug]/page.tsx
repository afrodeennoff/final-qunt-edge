import Link from 'next/link'
import type { Metadata } from 'next'
import { connection } from 'next/server'
import { format, startOfDay } from 'date-fns'
import { createClient } from '@supabase/supabase-js'
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  DollarSign,
  Globe,
  Instagram,
  MessageCircle,
  Target,
  TrendingUp,
  Twitter,
  Youtube,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { buildBreadcrumbSchema, buildPublicMetadata, getCanonicalUrl } from '@/lib/seo'
import { hasConfiguredDatabaseConnection, prisma } from '@/lib/prisma'
import { isPrismaColumnAvailable, isPrismaSchemaMismatchError } from '@/lib/prisma-guard'
import { CalendarGrid } from './calendar-grid'

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

  let publicUser: { id: string; email: string | null; username: string | null; showOnLeaderboard: boolean; auth_user_id: string } | null = null
  try {
    publicUser = await prisma.user.findUnique({
      where: { id: slug },
      select: { id: true, email: true, username: true, auth_user_id: true, showOnLeaderboard: true },
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
    username: publicUser.username || toUsername(publicUser.email, publicUser.id),
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
      <div className="rounded-2xl border border-[rgba(0,0,0,0.06)] bg-[linear-gradient(180deg,var(--card)_0%,var(--card)_100%)] p-8 text-center shadow-[inset_0_1px_0_rgba(0,0,0,0.03),0_16px_32px_-26px_rgba(0,0,0,0.62)]">
        <p className="text-4xl font-semibold text-muted-foreground/40">404</p>
        <h1 className="mt-3 text-xl font-semibold text-foreground">{slug}</h1>
        <p className="mt-2 text-sm text-muted-foreground">This public trader profile is unavailable or has been set to private.</p>
      </div>
    </div>
  )
}

const socialItems = [
  { key: 'x' as const, icon: Twitter, label: 'X' },
  { key: 'instagram' as const, icon: Instagram, label: 'Instagram' },
  { key: 'discord' as const, icon: MessageCircle, label: 'Discord' },
  { key: 'youtube' as const, icon: Youtube, label: 'YouTube' },
]

export default async function TraderProfilePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  await connection()
  const snapshot = await getTraderSnapshot(slug)
  if (!snapshot) return <NotFoundState slug={slug} locale={locale} />

  const social = await getPublicSocialLinks(snapshot.authUserId)
  const personSchema = { '@context': 'https://schema.org', '@type': 'Person', name: snapshot.username, url: getCanonicalUrl(locale, `/trader/${slug}`) }
  const breadcrumbSchema = buildBreadcrumbSchema(locale, [{ name: 'Leaderboard', path: '/leaderboard' }, { name: snapshot.username, path: `/trader/${slug}` }])

  const pnlColor = snapshot.totalPnl > 0 ? 'text-semantic-success' : snapshot.totalPnl < 0 ? 'text-semantic-error' : 'text-foreground'
  const pnlBg = snapshot.totalPnl > 0
    ? 'bg-semantic-success/8 border-semantic-success/15'
    : snapshot.totalPnl < 0
      ? 'bg-semantic-error/8 border-semantic-error/15'
      : 'bg-muted/20 border-[rgba(0,0,0,0.06)]'

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:py-14 lg:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([personSchema, breadcrumbSchema]) }} />

      {/* Navigation */}
      <nav>
        <Link
          href={`/${locale}/leaderboard`}
          className="group inline-flex items-center gap-2 rounded-[0.95rem] px-3 py-1.5 text-sm font-medium text-muted-foreground transition-[color,background-color] duration-200 hover:bg-[var(--card)] hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Leaderboard
        </Link>
      </nav>

      {/* ---- Profile Header ---- */}
      <section className="relative overflow-hidden rounded-2xl border border-[rgba(0,0,0,0.06)] bg-[linear-gradient(180deg,var(--card)_0%,var(--card)_100%)] shadow-[inset_0_1px_0_rgba(0,0,0,0.03),0_16px_32px_-26px_rgba(0,0,0,0.62)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/[0.04] to-transparent" />
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-center gap-6">
              <div className="relative">
                <Avatar className="h-18 w-18 shrink-0 rounded-2xl border-2 border-primary/20 bg-[var(--card)] sm:h-20 sm:w-20">
                  <AvatarFallback className="rounded-2xl bg-primary/10 text-base font-semibold text-primary sm:text-lg">
                    {snapshot.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--card)] bg-semantic-success text-[10px] font-bold text-white">
                  W
                </div>
              </div>
              <div className="min-w-0 space-y-2">
                <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {snapshot.username}
                </h1>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Public Trading Profile
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(0,0,0,0.08)] bg-[var(--card)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    {snapshot.totalTrades.toLocaleString()} trades
                  </span>
                  <span className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em]',
                    snapshot.winRate >= 50
                      ? 'border border-semantic-success/20 bg-semantic-success/8 text-semantic-success'
                      : 'border border-[rgba(0,0,0,0.08)] bg-[var(--card)] text-muted-foreground'
                  )}>
                    <Target className="h-3 w-3" />
                    {snapshot.winRate.toFixed(1)}% win rate
                  </span>
                </div>
              </div>
            </div>

            {Object.values(social).some(Boolean) && (
              <div className="flex flex-wrap gap-2">
                {socialItems.map(({ key, icon: Icon, label }) => {
                  const url = social[key]
                  if (!url) return null
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-[0.95rem] border border-[rgba(0,0,0,0.06)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium text-foreground transition-[background-color,border-color,box-shadow] duration-200 hover:border-[rgba(0,0,0,0.06)] hover:bg-[var(--card)]"
                    >
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      {label}
                    </a>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---- Key Metrics ---- */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<DollarSign className="h-4 w-4" />}
          label="Net PnL"
          value={formatCurrency(snapshot.totalPnl)}
          className={pnlColor}
          accentClassName={pnlBg}
        />
        <MetricCard
          icon={<Target className="h-4 w-4" />}
          label="Win Rate"
          value={`${snapshot.winRate.toFixed(1)}%`}
          className={snapshot.winRate >= 50 ? 'text-semantic-success' : 'text-foreground'}
          accentClassName={snapshot.winRate >= 50 ? 'bg-semantic-success/8 border-semantic-success/15' : 'bg-muted/20 border-[rgba(0,0,0,0.06)]'}
        />
        <MetricCard
          icon={<BarChart3 className="h-4 w-4" />}
          label="Avg. Trade"
          value={formatCurrency(snapshot.avgPnl)}
          className={snapshot.avgPnl > 0 ? 'text-semantic-success' : snapshot.avgPnl < 0 ? 'text-semantic-error' : 'text-foreground'}
          accentClassName={snapshot.avgPnl > 0 ? 'bg-semantic-success/8 border-semantic-success/15' : snapshot.avgPnl < 0 ? 'bg-semantic-error/8 border-semantic-error/15' : 'bg-muted/20 border-[rgba(0,0,0,0.06)]'}
        />
        <MetricCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Total Trades"
          value={snapshot.totalTrades.toLocaleString()}
          className="text-foreground"
          accentClassName="bg-muted/20 border-[rgba(0,0,0,0.06)]"
        />
      </section>

      {/* ---- Calendar + Recent Trades ---- */}
      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <article className="overflow-hidden rounded-2xl border border-[rgba(0,0,0,0.06)] bg-[linear-gradient(180deg,var(--card)_0%,var(--card)_100%)] shadow-[inset_0_1px_0_rgba(0,0,0,0.03),0_16px_32px_-26px_rgba(0,0,0,0.62)]">
          <div className="flex items-center gap-2 border-b border-[rgba(0,0,0,0.06)] px-5 py-3.5">
            <Calendar className="h-4 w-4 text-primary" />
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Performance Calendar</h2>
          </div>
          <div className="p-5">
            <CalendarGrid dayPnl={snapshot.dayPnl} />
          </div>
        </article>
        <article className="overflow-hidden rounded-2xl border border-[rgba(0,0,0,0.06)] bg-[linear-gradient(180deg,var(--card)_0%,var(--card)_100%)] shadow-[inset_0_1px_0_rgba(0,0,0,0.03),0_16px_32px_-26px_rgba(0,0,0,0.62)]">
          <div className="flex items-center gap-2 border-b border-[rgba(0,0,0,0.06)] px-5 py-3.5">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Recent Trades</h2>
          </div>
          <div className="divide-y divide-[rgba(0,0,0,0.04)]">
            {snapshot.recentTrades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between gap-3 px-5 py-3 transition-[background-color] duration-150 hover:bg-[var(--card)]">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold tracking-tight text-foreground">{trade.symbol}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{format(trade.closeTime, 'MMM d, yyyy')}</p>
                </div>
                <p className={cn(
                  'shrink-0 text-sm font-semibold tabular-nums tracking-tight',
                  trade.pnl >= 0 ? 'text-semantic-success' : 'text-semantic-error'
                )}>
                  {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* ---- Footer CTA ---- */}
      <section className="relative overflow-hidden rounded-2xl border border-primary/15 bg-[linear-gradient(135deg,var(--card)_0%,var(--card)_100%)] shadow-[inset_0_1px_0_rgba(0,0,0,0.03),0_18px_32px_-24px_rgba(0,0,0,0.64)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/[0.03] to-transparent" />
        <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="space-y-2">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Start Tracking Your Performance
            </h2>
            <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
              Join {snapshot.username} and other serious traders using Qunt Edge for transparent performance review.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              href={`/${locale}/leaderboard`}
              className="inline-flex items-center gap-2 rounded-[0.95rem] border border-[rgba(0,0,0,0.06)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-[background-color,border-color,box-shadow] duration-200 hover:border-[rgba(0,0,0,0.06)] hover:bg-[var(--card)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Leaderboard
            </Link>
            <Link
              href={`/${locale}/dashboard/trader-profile`}
              className="inline-flex items-center gap-2 rounded-[0.95rem] border border-primary/18 bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-[0_1px_2px_rgba(0,0,0,0.14)] transition-[background-color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:bg-primary/92 hover:shadow-[0_12px_28px_-22px_rgba(0,0,0,0.48)] active:scale-[0.985]"
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

function MetricCard({
  icon,
  label,
  value,
  className,
  accentClassName,
}: {
  icon: React.ReactNode
  label: string
  value: string
  className: string
  accentClassName: string
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[rgba(0,0,0,0.06)] bg-[linear-gradient(180deg,var(--card)_0%,var(--card)_100%)] shadow-[inset_0_1px_0_rgba(0,0,0,0.03),0_16px_32px_-26px_rgba(0,0,0,0.62)]">
      <div className="flex items-start justify-between p-5">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
          <p className={cn('text-2xl font-semibold tabular-nums tracking-tight', className)}>{value}</p>
        </div>
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl border', accentClassName)}>
          <div className={className}>{icon}</div>
        </div>
      </div>
    </div>
  )
}
