'use client'

import { useEffect, useState } from 'react'
import { formatCompactCurrency } from '@/lib/formatting/currency'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let isMounted = true

    async function fetchStats() {
      try {
        setError(null)
        const res = await fetch('/api/propfirms/stats')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (isMounted) setData(json)
      } catch {
        if (isMounted) setError('Failed to load stats')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [retryKey])

  if (error && !loading) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
        <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto shrink-0 text-xs"
          onClick={() => setRetryKey((k) => k + 1)}
        >
          Retry
        </Button>
      </div>
    )
  }

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
      dot: 'bg-semantic-error',
      text: 'text-semantic-error',
      border: 'border-semantic-error-border',
      bg: 'bg-semantic-error-bg',
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
          className={`rounded-xl border ${item.border} ${item.bg} p-4 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28)] ${loading ? 'animate-pulse' : ''}`}
        >
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${item.dot}`} />
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{item.label}</p>
          </div>
          <p className={`mt-2 text-xl font-semibold tabular-nums ${item.text}`}>{item.value}</p>
        </div>
      ))}
    </div>
  )
}
