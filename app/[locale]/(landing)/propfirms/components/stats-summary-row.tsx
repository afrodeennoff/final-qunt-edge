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

  const items = data
    ? [
        {
          label: 'Total Paid',
          value: formatCompactCurrency(data.totalPaid),
          dot: 'bg-emerald-500',
          text: 'text-emerald-500',
          border: 'border-emerald-500/30',
          bg: 'bg-emerald-500/10',
        },
        {
          label: 'Total Pending',
          value: formatCompactCurrency(data.totalPending),
          dot: 'bg-yellow-500',
          text: 'text-yellow-500',
          border: 'border-yellow-500/30',
          bg: 'bg-yellow-500/10',
        },
        {
          label: 'Total Refused',
          value: formatCompactCurrency(data.totalRefused),
          dot: 'bg-red-500',
          text: 'text-red-500',
          border: 'border-red-500/30',
          bg: 'bg-red-500/10',
        },
        {
          label: 'Tracked Firms',
          value: data.totalFirms.toString(),
          dot: 'bg-blue-500',
          text: 'text-blue-500',
          border: 'border-blue-500/30',
          bg: 'bg-blue-500/10',
        },
      ]
    : [
        { label: 'Total Paid', value: '—', dot: 'bg-neutral-300', text: 'text-neutral-400', border: 'border-neutral-200', bg: 'bg-neutral-100' },
        { label: 'Total Pending', value: '—', dot: 'bg-neutral-300', text: 'text-neutral-400', border: 'border-neutral-200', bg: 'bg-neutral-100' },
        { label: 'Total Refused', value: '—', dot: 'bg-neutral-300', text: 'text-neutral-400', border: 'border-neutral-200', bg: 'bg-neutral-100' },
        { label: 'Tracked Firms', value: '—', dot: 'bg-neutral-300', text: 'text-neutral-400', border: 'border-neutral-200', bg: 'bg-neutral-100' },
      ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-[1.2rem] border ${item.border} ${item.bg} p-4 ${loading ? 'animate-pulse' : ''}`}
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
