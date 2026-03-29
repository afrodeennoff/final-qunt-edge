import { TrendingUp, TrendingDown } from 'lucide-react'

export default function DashboardPreview() {
  const stats = [
    { label: 'Total P&L', value: '$12,847', change: '+34.2%', positive: true },
    { label: 'Win Rate', value: '78%', change: '+2.4%', positive: true },
    { label: 'Profit Factor', value: '2.34', change: '+0.12', positive: true },
  ]

  // Sample bar chart data
  const bars = [65, 72, 68, 85, 78, 92, 88, 95, 82, 100, 94, 98]

  return (
    <div className="relative mx-auto mt-12 max-w-5xl px-2 sm:px-4">
      {/* Browser Chrome */}
      <div className="overflow-hidden rounded-t-xl border border-border border-b-0 bg-card shadow-2xl shadow-primary/10">
        {/* Window Controls */}
        <div className="flex items-center gap-2 border-b border-border bg-input px-3 py-3 sm:px-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <div className="w-3 h-3 rounded-full bg-warning" />
            <div className="w-3 h-3 rounded-full bg-success" />
          </div>
          <div className="flex min-w-0 flex-1 justify-center">
            <div className="hidden max-w-[220px] truncate rounded bg-card px-3 py-1 font-mono text-xs text-muted-foreground sm:block">
              app.quntedge.com/dashboard
            </div>
          </div>
          <div className="h-5 w-10 rounded bg-card/70 sm:w-16" />
        </div>

        {/* Dashboard Content */}
        <div className="space-y-4 p-3 sm:p-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-border bg-input p-3 sm:p-4"
              >
                <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-xl font-semibold text-foreground sm:text-2xl">{stat.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  {stat.positive ? (
                    <TrendingUp className="w-3 h-3 text-success" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-destructive" />
                  )}
                  <span className="text-xs text-success">{stat.change}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Chart Area */}
          <div className="relative h-44 overflow-hidden rounded-lg border border-border bg-input sm:h-48">
            {/* Grid lines */}
            <div className="absolute inset-0 grid grid-cols-12">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="border-r border-border/50" />
              ))}
            </div>

            {/* Bars */}
            <div className="absolute inset-0 flex items-end justify-around px-2 pb-3 sm:px-4 sm:pb-4">
              {bars.map((height, i) => (
                <div
                  key={i}
                  className="w-4 rounded-t-sm bg-gradient-to-t from-primary to-primary/50 sm:w-6"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>

            {/* Scanner Line Animation */}
            <div className="absolute inset-y-0 w-0.5 bg-primary animate-scan shadow-[0_0_10px_var(--primary)]" />
          </div>

          {/* Recent Trades */}
          <div className="rounded-lg border border-border bg-input p-3 sm:p-4">
            <p className="text-xs text-muted-foreground mb-3">Recent Trades</p>
            <div className="space-y-2">
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
                    <span className="font-mono text-foreground">{trade.symbol}</span>
                    <span className="text-muted-foreground text-xs sm:text-sm">{trade.side}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span
                      className={
                        trade.pnl.startsWith('+')
                          ? 'text-success'
                          : 'text-destructive'
                      }
                    >
                      {trade.pnl}
                    </span>
                    <span className="text-muted-foreground text-xs">{trade.time}</span>
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
