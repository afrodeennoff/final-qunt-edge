'use client'

import { cn } from '@/lib/utils'

export type StatsTableRow = {
  name: string
  totalTrades: number
  winRate: number
  avgRR: number
  totalRR: number
}

type StatsTableProps = {
  title: string
  rows: StatsTableRow[]
  emptyMessage?: string
}

export function StatsTable({ title, rows, emptyMessage = 'No data yet' }: StatsTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl overflow-hidden bg-card/30 border border-foreground/[0.06]">
        <div className="px-5 py-3 text-[11px] font-semibold tracking-[0.14em] uppercase text-muted-foreground/50 border-b border-foreground/[0.06]">
          {title}
        </div>
        <div className="px-5 py-6 text-center">
          <p className="text-xs text-muted-foreground/40 italic">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  const headerCellClass = 'text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50'
  const dataCellClass = 'px-5 py-2 text-xs tabular-nums'

  return (
    <div className="rounded-2xl overflow-hidden bg-card/30 border border-foreground/[0.06]">
      <div className="px-5 py-3 text-[11px] font-semibold tracking-[0.14em] uppercase text-muted-foreground/50 border-b border-foreground/[0.06]">
        {title}
      </div>
      <table className="w-full">
        <thead>
          <tr>
            <th className={cn(headerCellClass, 'text-left px-5 py-2')}>Name</th>
            <th className={cn(headerCellClass, 'text-right px-5 py-2')}>Trades</th>
            <th className={cn(headerCellClass, 'text-right px-5 py-2')}>Win %</th>
            <th className={cn(headerCellClass, 'text-right px-5 py-2')}>PnL</th>
            <th className={cn(headerCellClass, 'text-right px-5 py-2')}>Avg R</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const pnlPositive = row.totalRR >= 0
            const rrPositive = row.avgRR >= 0
            return (
              <tr
                key={row.name}
                className="border-b border-foreground/[0.03] last:border-0 hover:bg-background/20 transition-colors"
              >
                <td className={cn(dataCellClass, 'font-medium text-foreground')}>{row.name}</td>
                <td className={cn(dataCellClass, 'text-right text-foreground/70')}>{row.totalTrades}</td>
                <td className={cn(dataCellClass, 'text-right', row.winRate >= 50 ? 'text-semantic-success' : 'text-semantic-error')}>
                  {row.winRate.toFixed(1)}%
                </td>
                <td className={cn(dataCellClass, 'text-right', pnlPositive ? 'text-semantic-success' : 'text-semantic-error')}>
                  {pnlPositive ? '+' : ''}{row.totalRR.toFixed(2)}R
                </td>
                <td className={cn(dataCellClass, 'text-right', rrPositive ? 'text-semantic-success' : 'text-semantic-error')}>
                  {rrPositive ? '+' : ''}{row.avgRR.toFixed(2)}R
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
