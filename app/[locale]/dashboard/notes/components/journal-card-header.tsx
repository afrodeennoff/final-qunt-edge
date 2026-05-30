'use client'

import { ChevronDown, Pin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { unifiedChipClassName } from '@/components/layout/unified-page-recipes'
import { RatingStars } from './rating-stars'
import type { TradeJournalCard } from '../lib/journal-types'

interface JournalCardHeaderProps {
  card: TradeJournalCard
  isExpanded: boolean
  onToggle: () => void
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function JournalCardHeader({ card, isExpanded, onToggle }: JournalCardHeaderProps) {
  const { trade, journal } = card
  const isWin = trade.pnl > 0
  const isLoss = trade.pnl < 0
  const isLong = trade.side?.toUpperCase() === 'LONG'

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
        'hover:bg-primary/[0.02]',
        isExpanded && 'border-b-0',
      )}
    >
      <span className="min-w-[3rem] text-sm font-semibold">{trade.instrument}</span>

      <span
        className={cn(
          'rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
          isLong
            ? 'bg-semantic-success/15 text-semantic-success'
            : 'bg-semantic-danger/15 text-semantic-danger',
        )}
      >
        {trade.side || '—'}
      </span>

      <span
        className={cn(
          'min-w-[4.5rem] text-sm font-semibold tabular-nums',
          isWin ? 'text-semantic-success' : isLoss ? 'text-semantic-danger' : 'text-muted-foreground',
        )}
      >
        {trade.pnl >= 0 ? '+' : ''}${Math.abs(trade.pnl).toFixed(2)}
      </span>

      <span className="text-[11px] text-muted-foreground/70 tabular-nums">
        {formatDuration(trade.timeInPosition)}
      </span>

      {journal?.customTags && journal.customTags.length > 0 && (
        <div className="hidden items-center gap-1 sm:flex">
          {journal.customTags.slice(0, 3).map(tag => (
            <span key={tag} className={cn(unifiedChipClassName, 'text-[10px] px-1.5 py-0')}>
              {tag}
            </span>
          ))}
          {journal.customTags.length > 3 && (
            <span className="text-[10px] text-muted-foreground/50">+{journal.customTags.length - 3}</span>
          )}
        </div>
      )}

      <div className="hidden sm:block">
        <RatingStars value={journal?.confidenceRating ?? null} readOnly size="sm" />
      </div>

      <span className="ml-auto text-[11px] text-muted-foreground/60 tabular-nums">
        {formatTime(trade.entryDate)}
      </span>

      {journal?.pinned && <Pin size={12} className="text-primary/60" />}

      <ChevronDown
        size={16}
        className={cn(
          'text-muted-foreground/40 transition-transform',
          isExpanded && 'rotate-180',
        )}
      />
    </button>
  )
}
