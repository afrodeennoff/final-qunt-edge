'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { LeaderboardTable, LeaderboardTableSkeleton } from './leaderboard-table'
import { refreshLeaderboardData, type LeaderboardEntry, type LeaderboardSort } from '../data/leaderboard-query'
import { useSearchParams } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

const POLL_INTERVAL_MS = 30_000 // 30 seconds

interface LeaderboardContentProps {
  initialEntries: LeaderboardEntry[]
  locale: string
}

export function LeaderboardContent({ initialEntries, locale }: LeaderboardContentProps) {
  const searchParams = useSearchParams()
  const currentSort = (searchParams.get('sort') ?? 'monthly_pnl') as LeaderboardSort
  
  const [entries, setEntries] = useState<LeaderboardEntry[]>(initialEntries)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  const fetchData = useCallback(async (showLoading = false) => {
    if (!isMountedRef.current) return
    
    try {
      if (showLoading) setIsLoading(true)
      const result = await refreshLeaderboardData(currentSort)
      
      if (isMountedRef.current) {
        setEntries(result.entries)
        setLastUpdated(result.lastUpdated)
        setError(null)
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error('[Leaderboard] Refresh failed:', err)
        setError('Failed to refresh leaderboard')
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [currentSort])

  // Start polling on mount
  useEffect(() => {
    isMountedRef.current = true
    
    // Initial fetch to get timestamp
    fetchData(false)
    
    // Set up polling interval
    intervalRef.current = setInterval(() => {
      fetchData(false)
    }, POLL_INTERVAL_MS)

    return () => {
      isMountedRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchData])

  // Handle sort changes - immediate refresh
  useEffect(() => {
    fetchData(true)
  }, [currentSort, fetchData])

  const formatLastUpdated = (isoString: string | null): string => {
    if (!isoString) return ''
    const date = new Date(isoString)
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="space-y-4">
      {/* Status bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {isLoading && (
            <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {lastUpdated && !isLoading && (
            <span className="text-xs text-muted-foreground">
              Updated at {formatLastUpdated(lastUpdated)}
            </span>
          )}
        </div>
        {error && (
          <span className="text-xs text-rose-400">{error}</span>
        )}
        <span className="text-xs text-muted-foreground">
          Auto-refreshes every 30s
        </span>
      </div>

      {/* Table with loading state */}
      {isLoading && entries.length === 0 ? (
        <LeaderboardTableSkeleton />
      ) : (
        <LeaderboardTable entries={entries} locale={locale} isLoading={isLoading} />
      )}
    </div>
  )
}