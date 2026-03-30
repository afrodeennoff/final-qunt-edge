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
      <div className="overflow-hidden rounded-2xl border border-[hsl(var(--mk-border)/0.35)] bg-[hsl(var(--mk-surface)/0.85)] shadow-2xl shadow-primary/5 shadow-[0_0_60px_-15px_hsl(var(--primary)/0.2)] backdrop-blur-sm">
        <div className="flex items-center gap-2 rounded-t-xl border-b border-[hsl(var(--mk-border)/0.3)] bg-[hsl(var(--mk-bg-1))] px-3 py-3 sm:px-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/80" />
            <div className="w-3 h-3 rounded-full bg-warning/80" />
            <div className="w-3 h-3 rounded-full bg-success/80" />
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
            <div className="hidden max-w-[220px] truncate rounded bg-[hsl(var(--mk-surface)/0.7)] px-3 py-1 font-mono text-[0.7rem] text-muted-foreground/60 sm:block">
              app.quntedge.com/dashboard
            </div>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              <span className="text-[0.65rem] font-medium text-green-500">Live</span>
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
                <p className="mb-1 text-[0.68rem] uppercase tracking-wider text-muted-foreground/50">
                  {stat.label}
                </p>
                <p className="font-mono text-xl font-bold tabular-nums text-foreground sm:text-2xl">
                  {stat.value}
                </p>
                <div className="mt-1 flex items-center gap-1">
                  {stat.positive ? (
                    <TrendingUp className="h-3 w-3 text-success" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-destructive" />
                  )}
                  <span className="text-[0.72rem] font-medium tabular-nums text-success">
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="relative h-40 overflow-hidden rounded-b-2xl rounded-t-xl border border-[hsl(var(--mk-border)/0.25)] bg-[hsl(var(--mk-bg-1))] sm:h-48">
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

            <div className="absolute inset-y-0 w-px animate-scan bg-primary/60 shadow-[0_0_8px_hsl(var(--primary)/0.4)]" />

            <div className="absolute right-2 top-2 sm:right-4 sm:top-3">
              <span className="rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[0.65rem] font-medium text-success sm:px-3 sm:text-xs">
                +$12,847 P&L
              </span>
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:left-[45%] sm:top-[45%]">
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[0.65rem] font-medium text-primary sm:px-3 sm:text-xs">
                78% Win Rate
              </span>
            </div>
            <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4">
              <span className="rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-[0.65rem] font-medium text-warning sm:px-3 sm:text-xs">
                2.34 Profit Factor
              </span>
            </div>
          </div>

          <div className="rounded-b-2xl rounded-t-xl border border-[hsl(var(--mk-border)/0.25)] bg-[hsl(var(--mk-bg-1))] p-3 sm:p-4">
            <p className="mb-3 text-[0.68rem] uppercase tracking-wider text-muted-foreground/50">
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
                    <span className="font-mono text-[0.85rem] font-medium text-foreground">
                      {trade.symbol}
                    </span>
                    <span className="text-xs text-muted-foreground/50">{trade.side}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span
                      className={
                        trade.pnl.startsWith('+')
                          ? 'font-medium tabular-nums text-success'
                          : 'font-medium tabular-nums text-destructive'
                      }
                    >
                      {trade.pnl}
                    </span>
                    <span className="text-xs tabular-nums text-muted-foreground/40">{trade.time}</span>
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
