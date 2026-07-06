'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type Trade = {
  id: string
  symbol: string
  pnl: number
  closeTime: Date
}

function formatSigned(value: number): string {
  const prefix = value >= 0 ? '+' : ''
  return `${prefix}$${Math.abs(value).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

const TRADES_PER_PAGE = 10

export function TradeActivityFeed({ trades }: { trades: Trade[] }) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(trades.length / TRADES_PER_PAGE))
  const start = (page - 1) * TRADES_PER_PAGE
  const visible = trades.slice(start, start + TRADES_PER_PAGE)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Activity</div>
          <div className="text-2xl font-semibold tracking-tight">Recent Execution</div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground/60">{trades.length} trades</span>
          {trades.length > TRADES_PER_PAGE && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/80 text-muted-foreground/60 transition hover:bg-white/90 hover:text-foreground disabled:pointer-events-none disabled:opacity-30 dark:bg-zinc-800/80"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[3rem] text-center text-xs font-medium tabular-nums text-muted-foreground/60">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/80 text-muted-foreground/60 transition hover:bg-white/90 hover:text-foreground disabled:pointer-events-none disabled:opacity-30 dark:bg-zinc-800/80"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white/90 shadow-lg dark:bg-zinc-900/90">
        {visible.length > 0 ? (
          <div className="space-y-px">
            {visible.map((trade, idx) => {
              const isPositive = trade.pnl > 0
              const isNegative = trade.pnl < 0
              return (
                <div
                  key={trade.id}
                  className="group flex items-center justify-between px-5 py-3.5 transition-all duration-200 hover:bg-white/5 active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold uppercase tracking-wider",
                      isPositive
                        ? "bg-emerald-500/10 text-emerald-400"
                        : isNegative
                          ? "bg-rose-500/10 text-rose-400"
                          : "bg-white/10 text-muted-foreground/40"
                    )}>
                      {trade.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-mono text-sm font-semibold text-foreground/80">{trade.symbol}</div>
                      <div className="text-[11px] text-muted-foreground/50">
                        {new Date(trade.closeTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div className={cn(
                    "font-mono text-base font-semibold tabular-nums tracking-tight",
                    isPositive && "text-emerald-400",
                    isNegative && "text-rose-400",
                    !isPositive && !isNegative && "text-foreground/40"
                  )}>
                    <span className={cn(
                      "inline-flex items-center gap-1",
                      isPositive && "text-emerald-400",
                      isNegative && "text-rose-400"
                    )}>
                      {isPositive && "▲"}
                      {isNegative && "▼"}
                      {formatSigned(trade.pnl)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No public closed trades available yet.
          </div>
        )}
      </div>
    </div>
  )
}
