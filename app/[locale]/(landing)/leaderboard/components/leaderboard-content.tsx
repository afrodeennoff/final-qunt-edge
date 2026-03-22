'use client'

import { Suspense } from 'react'
import { LeaderboardTable, LeaderboardTableSkeleton } from './leaderboard-table'
import type { LeaderboardEntry } from '../data/leaderboard-query'

interface LeaderboardContentProps {
  initialEntries: LeaderboardEntry[]
  locale: string
}

export function LeaderboardContent({ initialEntries, locale }: LeaderboardContentProps) {
  return (
    <Suspense fallback={<LeaderboardTableSkeleton />}>
      <LeaderboardTable entries={initialEntries} locale={locale} />
    </Suspense>
  )
}
