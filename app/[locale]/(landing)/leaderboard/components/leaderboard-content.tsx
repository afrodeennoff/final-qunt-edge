'use client'

import { LeaderboardTable } from './leaderboard-table'
import type { LeaderboardEntry } from '../data/leaderboard-query'

interface LeaderboardContentProps {
  initialEntries: LeaderboardEntry[]
  locale: string
}

export function LeaderboardContent({ initialEntries, locale }: LeaderboardContentProps) {
  return <LeaderboardTable entries={initialEntries} locale={locale} />
}
