import { getLeaderboardData } from '@/app/[locale]/(landing)/leaderboard/data/leaderboard-query'
import { TrendingUp, Trophy, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import Link from 'next/link'

function fmtPnl(n: number): string {
  const sign = n >= 0 ? '+' : ''
  if (Math.abs(n) >= 1_000) return `${sign}$${(n / 1_000).toFixed(1)}K`
  return `${sign}$${n.toFixed(0)}`
}

export async function LeaderboardPreview() {
  const entries = await getLeaderboardData('monthly_pnl').catch(() => [])
  const top = entries.slice(0, 5)

  if (top.length === 0) return null

  return (
    <section className="py-24 border-b border-border/20">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
            <Trophy className="h-3 w-3" />
            Leaderboard
          </div>
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">
            Top traders this month.
          </h2>
          <p className="mt-4 text-[14px] text-muted-foreground/70 max-w-lg mx-auto leading-relaxed">
            Who&apos;s crushing it right now.
          </p>
        </div>

        <div className="mx-auto max-w-2xl space-y-3">
          {top.map((entry, i) => (
            <div
              key={entry.userId}
              className="group relative flex items-center gap-4 overflow-hidden rounded-2xl bg-card border border-border/10 px-5 py-4 transition-all duration-300 hover:border-primary/25 hover:shadow-[0_0_35px_-18px] hover:shadow-primary/15"
            >
              <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/[0.03] blur-2xl transition-all duration-500 group-hover:bg-primary/[0.06] group-hover:scale-150" />
              <div className="relative z-10 flex items-center gap-4 w-full min-w-0">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-[11px] font-bold tabular-nums text-muted-foreground/80">
                  {i + 1}
                </span>
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-[11px] font-bold text-primary">
                    {entry.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate text-[14px] font-medium text-foreground/90">
                    {entry.username}
                  </span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p
                      className={`text-[14px] font-semibold tabular-nums ${
                        entry.monthlyPnl >= 0 ? 'text-success' : 'text-destructive'
                      }`}
                    >
                      {entry.monthlyPnl >= 0 ? (
                        <ArrowUpRight className="mr-0.5 inline h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="mr-0.5 inline h-3 w-3" />
                      )}
                      {fmtPnl(entry.monthlyPnl)}
                    </p>
                    <p className="text-[11px] text-muted-foreground/60 tabular-nums">
                      Win: {entry.winRate.toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary/80 transition-colors hover:text-primary"
          >
            Full leaderboard
            <TrendingUp className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
