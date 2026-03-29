import Link from 'next/link'
import { BadgeV2 } from "@/components/ui/v2"
import { CardV2, CardV2Content } from '@/components/ui/v2'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowRight, Trophy, Flame, Users } from 'lucide-react'

interface LeaderboardEntry {
  rank: number
  username: string
  monthlyPnl: number
  winRate: number
  longestWinStreak: number
  accountCount: number
  userId: string
}

interface LeaderboardPreviewProps {
  locale: string
  entries?: LeaderboardEntry[]
}

const fallbackEntries: LeaderboardEntry[] = [
  { rank: 1, username: 'AlphaTrader', monthlyPnl: 24500, winRate: 72, longestWinStreak: 8, accountCount: 3, userId: '1' },
  { rank: 2, username: 'FuturesKing', monthlyPnl: 18200, winRate: 68, longestWinStreak: 6, accountCount: 2, userId: '2' },
  { rank: 3, username: 'EdgeSeeker', monthlyPnl: 15800, winRate: 65, longestWinStreak: 5, accountCount: 4, userId: '3' },
  { rank: 4, username: 'RiskMaster', monthlyPnl: 12400, winRate: 70, longestWinStreak: 7, accountCount: 2, userId: '4' },
  { rank: 5, username: 'TradePro', monthlyPnl: 9800, winRate: 62, longestWinStreak: 4, accountCount: 1, userId: '5' },
]

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function getInitials(username: string): string {
  return username
    .split(/[\s_-]+/)
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const trophyEmoji: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
}

export default function LeaderboardPreview({ locale, entries }: LeaderboardPreviewProps) {
  const displayEntries = entries && entries.length > 0 ? entries.slice(0, 5) : fallbackEntries

  return (
    <section id="leaderboard" className="relative px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <BadgeV2 variant="outline" className="border-primary/40 bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-foreground [font-family:var(--home-copy)]">
              <Trophy className="mr-1.5 h-3 w-3" />
              Leaderboard
            </BadgeV2>
            <h2 className="mt-3 text-[clamp(2rem,4.9vw,3.55rem)] font-semibold leading-[0.92] tracking-[-0.028em] [font-family:var(--home-display)]">
              Top traders this
              <span className="block text-foreground">month by performance</span>
            </h2>
            <p className="mt-3 max-w-xl text-[15px] leading-[1.78] text-foreground/80 [font-family:var(--home-copy)]">
              Real traders, real results. See who is leading the pack with verified performance metrics.
            </p>
          </div>
          <Link
            href={`/${locale}/leaderboard`}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-card/50 [font-family:var(--home-copy)]"
          >
            Full Leaderboard
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-3">
          {displayEntries.map((entry) => {
            const isPositive = entry.monthlyPnl >= 0
            const isTop3 = entry.rank <= 3

            return (
              <Card
                key={entry.userId}
                className={`overflow-hidden rounded-2xl border-[hsl(var(--mk-border)/0.35)] transition-all duration-300 hover:border-primary/40 ${
                  isTop3 ? 'bg-[hsl(var(--mk-surface)/0.8)]' : 'bg-[hsl(var(--mk-surface)/0.5)]'
                }`}
              >
                <CardContent className="flex items-center gap-4 p-4 sm:gap-6">
                  {/* Rank */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[hsl(var(--mk-border)/0.28)] bg-[hsl(var(--mk-surface-muted)/0.8)]">
                    {trophyEmoji[entry.rank] ? (
                      <span className="text-xl">{trophyEmoji[entry.rank]}</span>
                    ) : (
                      <span className="text-sm font-semibold text-foreground/80 [font-family:var(--home-display)]">#{entry.rank}</span>
                    )}
                  </div>

                  {/* Avatar + Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10 shrink-0 border border-[hsl(var(--mk-border)/0.28)]">
                      <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                        {getInitials(entry.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold [font-family:var(--home-display)]">{entry.username}</p>
                      {isTop3 && (
                        <p className="text-[10px] uppercase tracking-[0.14em] text-primary/80 [font-family:var(--home-copy)]">
                          {entry.rank === 1 ? 'Champion' : entry.rank === 2 ? 'Runner-up' : 'Third Place'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stats - hidden on mobile */}
                  <div className="hidden flex-1 items-center justify-end gap-6 sm:flex">
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-foreground/80 [font-family:var(--home-copy)]">PnL</p>
                      <p className={`text-sm font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositive ? '+' : ''}{formatCurrency(entry.monthlyPnl)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-foreground/80 [font-family:var(--home-copy)]">Win Rate</p>
                      <p className="text-sm font-semibold text-foreground">{entry.winRate}%</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Flame className={`h-4 w-4 ${entry.longestWinStreak >= 5 ? 'text-orange-400' : 'text-foreground/80'}`} />
                      <span className="text-sm font-medium text-foreground">{entry.longestWinStreak}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-foreground/80">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{entry.accountCount}</span>
                    </div>
                  </div>

                  {/* Mobile PnL */}
                  <div className="ml-auto text-right sm:hidden">
                    <p className={`text-lg font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPositive ? '+' : ''}{formatCurrency(entry.monthlyPnl)}
                    </p>
                    <p className="text-[10px] text-foreground/80 [font-family:var(--home-copy)]">{entry.winRate}% WR</p>
                  </div>
                </CardContent>
    </CardV2>
  )
}
