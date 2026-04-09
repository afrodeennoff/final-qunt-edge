'use client'

import { useEffect, useState } from 'react'
import { formatCompactCurrency } from '@/lib/formatting/currency'

interface StatsSummaryData {
  totalPaid: number
  totalPending: number
  totalRefused: number
  totalAccounts: number
  totalFirms: number
}

export function StatsSummaryRow() {
  const [data, setData] = useState<StatsSummaryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/propfirms/stats')
        if (!res.ok) return
        const json = await res.json()
        setData(json)
      } catch {
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  if (!data) {
    return null
  }

  const items = [
    {
      label: 'Total Paid',
      value: formatCompactCurrency(data.totalPaid),
      dot: 'bg-success',
      text: 'text-success',
      border: 'border-success/30',
      bg: 'bg-success/10',
    },
    {
      label: 'Total Pending',
      value: formatCompactCurrency(data.totalPending),
      dot: 'bg-warning',
      text: 'text-warning',
      border: 'border-warning/30',
      bg: 'bg-warning/10',
    },
    {
      label: 'Total Refused',
      value: formatCompactCurrency(data.totalRefused),
      dot: 'bg-destructive',
      text: 'text-destructive',
      border: 'border-destructive/30',
      bg: 'bg-destructive/10',
    },
    {
      label: 'Tracked Firms',
      value: data.totalFirms.toString(),
      dot: 'bg-primary',
      text: 'text-primary',
      border: 'border-primary/30',
      bg: 'bg-primary/10',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-xl border ${item.border} ${item.bg} p-4 shadow-[0_16px_60px_-54px_hsl(0_0%_0%_/0.95)] ${loading ? 'animate-pulse' : ''}`}
        >
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${item.dot}`} />
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
          </div>
          <p className={`mt-2 text-xl font-semibold tabular-nums ${item.text}`}>{item.value}</p>
        </div>
      ))}
    </div>
  )
}
