'use client'

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
      <div className="rounded-t-xl border border-[#1A1A21] border-b-0 bg-[#0b0b0d] overflow-hidden shadow-2xl shadow-[#2962FF]/10">
        {/* Window Controls */}
        <div className="flex items-center gap-2 px-4 py-3 bg-[#101014] border-b border-[#1A1A21]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#F23645]" />
            <div className="w-3 h-3 rounded-full bg-[#FB8C00]" />
            <div className="w-3 h-3 rounded-full bg-[#089981]" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-3 py-1 rounded bg-[#0b0b0d] text-xs text-[#707070] font-mono">
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
                className="rounded-lg border border-[#1A1A21] bg-[#101014] p-4"
              >
                <p className="text-xs text-[#707070] mb-1">{stat.label}</p>
                <p className="text-2xl font-semibold text-[#E0E0E0]">{stat.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  {stat.positive ? (
                    <TrendingUp className="w-3 h-3 text-[#089981]" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-[#F23645]" />
                  )}
                  <span className="text-xs text-[#089981]">{stat.change}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Chart Area */}
          <div className="h-48 rounded-lg bg-[#101014] border border-[#1A1A21] relative overflow-hidden">
            {/* Grid lines */}
            <div className="absolute inset-0 grid grid-cols-12">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="border-r border-[#1A1A21]/50" />
              ))}
            </div>

            {/* Bars */}
            <div className="absolute inset-0 flex items-end justify-around px-4 pb-4">
              {bars.map((height, i) => (
                <div
                  key={i}
                  className="w-6 rounded-t-sm bg-gradient-to-t from-[#2962FF] to-[#2962FF]/50"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>

            {/* Scanner Line Animation */}
            <div className="absolute inset-y-0 w-0.5 bg-[#2962FF] animate-scan shadow-[0_0_10px_#2962FF]" />
          </div>

          {/* Recent Trades */}
          <div className="rounded-lg border border-[#1A1A21] bg-[#101014] p-4">
            <p className="text-xs text-[#707070] mb-3">Recent Trades</p>
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
                    <span className="font-mono text-[#E0E0E0]">{trade.symbol}</span>
                    <span className="text-[#707070]">{trade.side}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={
                        trade.pnl.startsWith('+')
                          ? 'text-[#089981]'
                          : 'text-[#F23645]'
                      }
                    >
                      {trade.pnl}
                    </span>
                    <span className="text-[#707070] text-xs">{trade.time}</span>
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
