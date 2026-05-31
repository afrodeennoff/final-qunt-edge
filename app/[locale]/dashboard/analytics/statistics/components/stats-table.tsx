'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

export type StatsTableRow = {
  name: string
  totalTrades: number
  winRate: number
  avgRR: number
  totalRR: number
}

type SortKey = 'name' | 'totalTrades' | 'winRate' | 'avgRR' | 'totalRR'

type StatsTableProps = {
  title: string
  rows: StatsTableRow[]
  emptyMessage?: string
}

export function StatsTable({ title, rows, emptyMessage = 'No data yet' }: StatsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('totalTrades')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * dir
      }
      return ((aVal as number) - (bVal as number)) * dir
    })
  }, [rows, sortKey, sortDir])

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown className="ml-1 h-3 w-3 inline opacity-30" />
    return sortDir === 'asc'
      ? <ArrowUp className="ml-1 h-3 w-3 inline" />
      : <ArrowDown className="ml-1 h-3 w-3 inline" />
  }

  const headerClass = "cursor-pointer select-none text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors px-2 py-2"
  const cellClass = "px-2 py-2 text-xs tabular-nums"

  if (rows.length === 0) {
    return (
      <div className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground/60 italic">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
      <div className="overflow-x-auto rounded-xl border-0 bg-background/30">
        <table className="w-full">
          <thead>
            <tr className="border-b border-transparent/10">
              <th className={headerClass} onClick={() => toggleSort('name')}>
                Name <SortIcon k="name" />
              </th>
              <th className={headerClass} onClick={() => toggleSort('totalTrades')}>
                Trades <SortIcon k="totalTrades" />
              </th>
              <th className={headerClass} onClick={() => toggleSort('winRate')}>
                Winrate <SortIcon k="winRate" />
              </th>
              <th className={headerClass} onClick={() => toggleSort('avgRR')}>
                Avg RR <SortIcon k="avgRR" />
              </th>
              <th className={headerClass} onClick={() => toggleSort('totalRR')}>
                Total RR <SortIcon k="totalRR" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(row => (
              <tr key={row.name} className="border-b border-transparent/5 last:border-0 hover:bg-background/20 transition-colors">
                <td className={cn(cellClass, "font-medium text-foreground")}>{row.name}</td>
                <td className={cellClass}>{row.totalTrades}</td>
                <td className={cn(cellClass, row.winRate >= 50 ? 'metric-positive' : 'metric-negative')}>
                  {row.winRate.toFixed(1)}%
                </td>
                <td className={cn(cellClass, row.avgRR >= 1 ? 'metric-positive' : 'metric-negative')}>
                  {row.avgRR.toFixed(2)}
                </td>
                <td className={cn(cellClass, row.totalRR >= 1 ? 'metric-positive' : 'metric-negative')}>
                  {row.totalRR.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
