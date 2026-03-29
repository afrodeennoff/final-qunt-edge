'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'

export default function DashboardPreview() {
  const stats = [
    { label: 'Total P&L', value: '$12,847', change: '+34.2%', positive: true },
    { label: 'Win Rate', value: '78%', change: '+2.4%', positive: true },
    { label: 'Profit Factor', value: '2.34', change: '+0.12', positive: true },
  ]

  const bars = [65, 72, 68, 85, 78, 92, 88, 95, 82, 100, 94, 98]

  return (
    <div className="relative mx-auto max-w-5xl px-2 sm:px-4">
      <div className="overflow-hidden rounded-2xl border border-[hsl(var(--mk-border)/0.35)] bg-[hsl(var(--mk-surface)/0.85)] shadow-2xl shadow-primary/5 backdrop-blur-sm">
        <div className="flex items-center gap-2 border-b border-[hsl(var(--mk-border)/0.3)] bg-[hsl(var(--mk-bg-1))] px-3 py-3 sm:px-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/80" />
            <div className="w-3 h-3 rounded-full bg-warning/80" />
            <div className="w-3 h-3 rounded-full bg-success/80" />
          </div>
          <div className="flex min-w-0 flex-1 justify-center">
            <div className="hidden max-w-[220px] truncate rounded bg-[hsl(var(--mk-surface)/0.7)] px-3 py-1 font-mono text-[0.7rem] text-muted-foreground/60 sm:block">
              app.quntedge.com/dashboard
            </div>
          </div>
          <div className="h-5 w-10 rounded bg-[hsl(var(--mk-surface)/0.5)] sm:w-16" />
        </div>

        <div className="space-y-3 p-3 sm:p-5">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-[hsl(var(--mk-border)/0.25)] bg-[hsl(var(--mk-bg-1))] p-3 sm:p-4"
              >
                <p className="text-[0.68rem] text-muted-foreground/50 uppercase tracking-wider mb-1">
                  {stat.label}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-foreground tabular-nums font-mono">
                  {stat.value}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {stat.positive ? (
                    <TrendingUp className="w-3 h-3 text-success" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-destructive" />
                  )}
                  <span className="text-[0.72rem] font-medium text-success tabular-nums">
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="relative h-40 overflow-hidden rounded-xl border border-[hsl(var(--mk-border)/0.25)] bg-[hsl(var(--mk-bg-1))] sm:h-48">
            <div className="absolute inset-0 grid grid-cols-12">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="border-r border-[hsl(var(--mk-border)/0.15)]" />
              ))}
            </div>

            <div className="absolute inset-0 flex items-end justify-around px-2 pb-3 sm:px-4 sm:pb-4">
              {bars.map((height, i) => (
                <div
                  key={i}
                  className="w-3.5 rounded-t bg-gradient-to-t from-primary/80 to-primary/30 sm:w-5"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>

            <div className="absolute inset-y-0 w-px bg-primary/60 animate-scan shadow-[0_0_8px_hsl(var(--primary)/0.4)]" />
          </div>

          <div className="rounded-xl border border-[hsl(var(--mk-border)/0.25)] bg-[hsl(var(--mk-bg-1))] p-3 sm:p-4">
            <p className="text-[0.68rem] text-muted-foreground/50 uppercase tracking-wider mb-3">
              Recent Trades
            </p>
            <div className="space-y-2.5">
              {[
                { symbol: 'ES', side: 'Long', pnl: '+$420', time: '10:32' },
                { symbol: 'NQ', side: 'Short', pnl: '-$180', time: '10:45' },
                { symbol: 'RTY', side: 'Long', pnl: '+$290', time: '11:15' },
              ].map((trade, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="font-mono font-medium text-foreground text-[0.85rem]">
                      {trade.symbol}
                    </span>
                    <span className="text-muted-foreground/50 text-xs">{trade.side}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span
                      className={
                        trade.pnl.startsWith('+')
                          ? 'text-success font-medium tabular-nums'
                          : 'text-destructive font-medium tabular-nums'
                      }
                    >
                      {trade.pnl}
                    </span>
                    <span className="text-muted-foreground/40 text-xs tabular-nums">{trade.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
