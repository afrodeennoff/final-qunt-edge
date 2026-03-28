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
    <div className="relative max-w-5xl mx-auto mt-12 px-4">
      {/* Browser Chrome */}
      <div className="rounded-t-xl border border-border border-b-0 bg-card overflow-hidden shadow-2xl shadow-primary/10">
        {/* Window Controls */}
        <div className="flex items-center gap-2 px-4 py-3 bg-input border-b border-border">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <div className="w-3 h-3 rounded-full bg-warning" />
            <div className="w-3 h-3 rounded-full bg-success" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-3 py-1 rounded bg-card text-xs text-muted-foreground font-mono">
              app.quntedge.com/dashboard
            </div>
          </div>
          <div className="w-16" />
        </div>

        {/* Dashboard Content */}
        <div className="p-6 space-y-4">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-border bg-input p-4"
              >
                <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
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
          <div className="h-48 rounded-lg bg-input border border-border relative overflow-hidden">
            {/* Grid lines */}
            <div className="absolute inset-0 grid grid-cols-12">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="border-r border-border/50" />
              ))}
            </div>

            {/* Bars */}
            <div className="absolute inset-0 flex items-end justify-around px-4 pb-4">
              {bars.map((height, i) => (
                <div
                  key={i}
                  className="w-6 rounded-t-sm bg-gradient-to-t from-primary to-primary/50"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>

            {/* Scanner Line Animation */}
            <div className="absolute inset-y-0 w-0.5 bg-primary animate-scan shadow-[0_0_10px_var(--primary)]" />
          </div>

          {/* Recent Trades */}
          <div className="rounded-lg border border-border bg-input p-4">
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
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-foreground">{trade.symbol}</span>
                    <span className="text-muted-foreground">{trade.side}</span>
                  </div>
                  <div className="flex items-center gap-3">
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
