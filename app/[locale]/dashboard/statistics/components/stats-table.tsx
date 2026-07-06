'use client'

import { cn } from '@/lib/utils'
import { Download } from 'lucide-react'
import { unifiedSectionPanelClassName } from '@/components/layout/unified-page-recipes'

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
  onExport?: () => void
}

export function StatsTable({
  title,
  rows,
  firstColLabel = 'Symbol',
  emptyMessage = 'No data yet',
  onExport,
}: StatsTableProps) {
  if (rows.length === 0) {
    return (
      <div className={cn(unifiedSectionPanelClassName, 'overflow-hidden')}>
        <div className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/50">
          {title}
        </div>
        <div className="px-5 py-8 text-center">
          <p className="text-xs text-muted-foreground/50">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(unifiedSectionPanelClassName, 'overflow-hidden')}>
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5">
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/50">
          {title}
        </div>
        {onExport && (
          <button
            type="button"
            onClick={onExport}
            className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground/50 hover:text-primary transition-colors"
          >
            <Download className="h-3 w-3" />
            CSV
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[420px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/40">
              <th className="text-left pl-3 sm:pl-5 pr-2 sm:pr-3 py-2 font-semibold">{firstColLabel}</th>
              <th className="text-right px-2 sm:px-3 py-2 font-semibold">TRADES</th>
              <th className="text-right px-2 sm:px-3 py-2 font-semibold">WIN %</th>
              <th className="text-right px-2 sm:px-3 py-2 font-semibold">PNL</th>
              <th className="text-right px-2 sm:px-3 py-2 font-semibold">AVG R</th>
              <th className="text-right pl-2 sm:pl-3 pr-3 sm:pr-5 py-2 font-semibold">TOTAL R</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const pnlPos = row.pnl >= 0
              const rrPos = row.avgRR >= 0
              return (
                <tr key={row.name} className={cn('transition-colors hover:bg-muted/20', i < rows.length - 1 && 'border-t border-transparent')}>
                  <td className="pl-3 sm:pl-5 pr-2 sm:pr-3 py-2.5 font-semibold text-foreground">{row.name}</td>
                  <td className="px-2 sm:px-3 py-2.5 text-right tabular-nums text-muted-foreground">{row.totalTrades}</td>
                  <td className={cn('px-2 sm:px-3 py-2.5 text-right tabular-nums font-semibold', row.winRate >= 50 ? 'text-success' : 'text-destructive')}>
                    {row.winRate.toFixed(1)}%
                  </td>
                  <td className={cn('px-2 sm:px-3 py-2.5 text-right tabular-nums font-bold', pnlPos ? 'text-success' : 'text-destructive')}>
                    {row.pnl > 0 ? '+' : row.pnl < 0 ? '-' : ''}${Math.abs(row.pnl).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </td>
                  <td className={cn('px-2 sm:px-3 py-2.5 text-right tabular-nums font-semibold', rrPos ? 'text-success' : 'text-destructive')}>
                    {rrPos ? '+' : ''}{row.avgRR.toFixed(1)}R
                  </td>
                  <td className={cn('pl-2 sm:pl-3 pr-3 sm:pr-5 py-2.5 text-right tabular-nums font-semibold', row.totalRR >= 0 ? 'text-success' : 'text-destructive')}>
                    {row.totalRR >= 0 ? '+' : ''}{row.totalRR.toFixed(1)}R
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
