'use client'

import { cn } from '@/lib/utils'

export type StatsTableRow = {
  name: string
  totalTrades: number
  winRate: number
  avgRR: number
  totalRR: number
  pnl: number
}

type StatsTableProps = {
  title: string
  rows: StatsTableRow[]
  emptyMessage?: string
  firstColLabel?: string
}

export function StatsTable({
  title,
  rows,
  firstColLabel = 'Symbol',
  emptyMessage = 'No data yet',
}: StatsTableProps & { firstColLabel?: string }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl overflow-hidden bg-card border border-border">
        <div className="px-5 py-3 text-[10px] font-semibold tracking-[2px] uppercase text-primary/70 border-b border-border">
          {title}
        </div>
        <div className="px-5 py-6 text-center">
          <p className="text-xs text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden bg-card border border-border">
      <div className="px-5 py-3 text-[10px] font-semibold tracking-[2px] uppercase text-primary/70 border-b border-border">
        {title}
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-[1px] text-muted-foreground border-b border-border">
            <th className="text-left pl-5 pr-3 py-2 font-medium">{firstColLabel}</th>
            <th className="text-right px-3 py-2 font-medium">TRADES</th>
            <th className="text-right px-3 py-2 font-medium">WIN %</th>
            <th className="text-right px-3 py-2 font-medium">PNL</th>
            <th className="text-right pl-3 pr-5 py-2 font-medium">AVG R</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const pnlPos = row.pnl >= 0
            const rrPos = row.avgRR >= 0
            return (
              <tr key={row.name} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="pl-5 pr-3 py-2 font-medium text-foreground">{row.name}</td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{row.totalTrades}</td>
                <td className={cn('px-3 py-2 text-right tabular-nums', row.winRate >= 50 ? 'text-primary' : 'text-destructive')}>
                  {row.winRate.toFixed(1)}%
                </td>
                <td className={cn('px-3 py-2 text-right tabular-nums font-medium', pnlPos ? 'text-primary' : 'text-destructive')}>
                  {row.pnl > 0 ? '+' : row.pnl < 0 ? '-' : ''}${Math.abs(row.pnl).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </td>
                <td className={cn('pl-3 pr-5 py-2 text-right tabular-nums', rrPos ? 'text-primary' : 'text-destructive')}>
                  {rrPos ? '+' : ''}{row.avgRR.toFixed(1)}R
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
