'use client'

import { BookOpen, TrendingUp, Star, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { unifiedMetricPanelClassName } from '@/components/layout/unified-page-recipes'
import type { JournalStats } from '../lib/journal-types'

interface JournalStatsBarProps {
  stats: JournalStats
}

export function JournalStatsBar({ stats }: JournalStatsBarProps) {
  const items = [
    {
      icon: <BarChart3 size={14} className="text-muted-foreground/60" />,
      label: 'Total trades',
      value: stats.totalTrades,
    },
    {
      icon: <BookOpen size={14} className="text-primary/70" />,
      label: 'Journaled',
      value: `${stats.journaledCount}/${stats.totalTrades}`,
    },
    {
      icon: <TrendingUp size={14} className="text-semantic-success/70" />,
      label: 'Win rate',
      value: `${stats.winRate.toFixed(1)}%`,
    },
    {
      icon: <Star size={14} className="text-primary/70" />,
      label: 'Avg confidence',
      value: stats.avgConfidence != null ? `${stats.avgConfidence.toFixed(1)}/5` : '—',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(item => (
        <div key={item.label} className={cn(unifiedMetricPanelClassName, 'flex items-center gap-2.5')}>
          {item.icon}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">{item.label}</p>
            <p className="text-sm font-semibold tabular-nums">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
