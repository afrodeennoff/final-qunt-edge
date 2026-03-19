'use client'
import React from 'react'
import { CardV2, CardV2Content } from '@/components/ui/v2'
import { AvatarV2, AvatarV2Fallback } from '@/components/ui/v2'
import type { LeaderboardEntry } from '../data/leaderboard-query'

export const LeaderboardTable = React.memo(function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <div className="space-y-v2-2">
      {entries.map((entry) => (
        <CardV2 key={entry.userId} className="flex items-center gap-v2-4 p-v2-4">
          <div className="w-8 text-center">
            {entry.rank <= 3 ? (
              entry.rank === 1 ? (
                <span className="text-yellow-400">#{entry.rank}</span>
              ) : (
                <span className="text-gray-400">#{entry.rank}</span>
              )
            ) : (
              <span className="text-v2-text-tertiary">#{entry.rank}</span>
            )}
          </div>
          <AvatarV2 size="md">
            <AvatarV2Fallback>{entry.username.charAt(0).toUpperCase()}</AvatarV2Fallback>
          </AvatarV2>
          <div className="flex-1">
            <div className="font-medium text-v2-text-primary">{entry.username}</div>
            <div className="text-sm text-v2-text-secondary">{entry.totalTrades} trades</div>
          </div>
          <div className="text-right">
            <div className={"font-semibold" + (entry.monthlyPnl >= 0 ? ' text-v2-success' : ' text-v2-error')}>
              {entry.monthlyPnl >= 0 ? '+' : ''}${entry.monthlyPnl.toLocaleString()}
            </div>
          </div>
        </CardV2>
      ))}
    </div>
  )
})
